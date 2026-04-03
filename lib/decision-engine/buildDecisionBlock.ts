// lib/decision-engine/buildDecisionBlock.ts — pipeline Decision Block v1

import {
	scenarioPartToSlice,
	type CollectOptions,
	type DecisionBlockV1,
	type DecisionInputs,
	type DecisionSourceRef,
} from './types';
import { normalizeDecisionAssetId } from './assetAliases';
import { collectDecisionInputs } from './collectInputs';
import { buildMacroContextFromInputs } from './macro';
import { selectScenario } from './selectScenario';
import { buildLevels } from './levels';
import { buildVerdict } from './verdict';
import {
	buildWorldContextForAsset,
	emptyDecisionWorldContext,
} from './worldContext/buildWorldContextForAsset';
import { decisionAssetClassForCanonical } from './assetClass';
import {
	horizonFramingContextLines,
	parseDecisionHorizonMode,
	sliceMacroReactionLinesForHorizon,
	worldNewsHoursForHorizon,
} from './horizonMode';
import { composePrimaryTakeaway } from './primaryTakeawayComposer';

function buildSourcesUsed(inputs: DecisionInputs): DecisionSourceRef[] {
	const { scenario, techMap, calendarSource, pricing } = inputs;
	const refs: DecisionSourceRef[] = [
		{
			module: 'scenariosABC',
			id: `${scenario.asset}-${scenario.timeframe}`,
			version: scenario.updatedAt,
		},
		{
			module: 'macroCalendar',
			note: `Źródło surowe: ${calendarSource} (łańcuch DB→Finnhub→EDU, bez LLM).`,
		},
		{
			module: 'calendarImpact',
			note: 'inferImpact() na top wydarzeniach w oknie makro.',
		},
	];
	if (techMap) {
		refs.push({
			module: 'techMaps',
			id: techMap.id,
			version: techMap.updatedAt,
		});
	}
	if (pricing.overrideSource) {
		refs.push({ module: 'priceOverride', note: `Źródło: ${pricing.overrideSource}` });
	}
	if (pricing.finnhubSymbol && pricing.price != null) {
		refs.push({
			module: 'quotes',
			note: `Finnhub quote dla ${pricing.finnhubSymbol}${pricing.overrideSource ? ' (cena nadpisana override jeśli ustawiony)' : ''}.`,
		});
	}
	return refs;
}

function withWorldSource(refs: DecisionSourceRef[], note: string): DecisionSourceRef[] {
	return [...refs, { module: 'newsWorldContext', note }];
}

function collectOptionsToRequired(opts: CollectOptions | undefined) {
	return {
		eventListHorizonDays: Math.max(1, opts?.eventListHorizonDays ?? 5),
		highRiskHorizonDays: Math.max(1, opts?.highRiskHorizonDays ?? 2),
	};
}

export async function buildDecisionBlockV1(
	rawAsset: string,
	options?: CollectOptions
): Promise<{ ok: true; block: DecisionBlockV1 } | { ok: false; error: string }> {
	const canonical = normalizeDecisionAssetId(rawAsset);
	if (!canonical) {
		return {
			ok: false,
			error: `Nieznany asset „${rawAsset}”. Dostępne są instrumenty z modułu scenariuszy ABC.`,
		};
	}

	const collected = await collectDecisionInputs(canonical, options);
	if (!collected.ok) return { ok: false, error: collected.error };

	const inputs = collected.data;
	const optReq = collectOptionsToRequired(options);
	const horizonMode = parseDecisionHorizonMode(options?.decisionHorizonMode);
	const assetClass = decisionAssetClassForCanonical(canonical);

	const calDays = Math.max(7, options?.calendarDays ?? 14);
	const worldHoursDefault = worldNewsHoursForHorizon(horizonMode, calDays);
	const worldHours = Math.min(
		168,
		Math.max(24, options?.worldNewsHours ?? worldHoursDefault)
	);
	let worldContext = emptyDecisionWorldContext(worldHours);
	try {
		worldContext = await buildWorldContextForAsset(canonical, {
			windowHours: worldHours,
			includeDemo: process.env.NODE_ENV !== 'production',
		});
	} catch {
		worldContext = emptyDecisionWorldContext(worldHours);
	}

	const pick = selectScenario({
		eventRisk: inputs.eventRisk,
		priceZone: inputs.priceZone,
		techAlignment: inputs.techAlignment,
	});

	const part =
		pick.key === 'A' ? inputs.scenario.scenarioA : pick.key === 'B' ? inputs.scenario.scenarioB : inputs.scenario.scenarioC;

	const levels = buildLevels({
		part,
		normalizedLevels: inputs.pricing.levelsNormalized,
		currentPrice: inputs.pricing.price,
	});

	let macro = buildMacroContextFromInputs(inputs, optReq);
	macro = {
		...macro,
		reactionLines: sliceMacroReactionLinesForHorizon(macro, horizonMode),
	};
	const verdictBundle = buildVerdict(inputs, pick);

	const scenarios = [
		scenarioPartToSlice('A', inputs.scenario.scenarioA),
		scenarioPartToSlice('B', inputs.scenario.scenarioB),
		scenarioPartToSlice('C', inputs.scenario.scenarioC),
	];

	const horizonFrame = horizonFramingContextLines(
		horizonMode,
		assetClass,
		inputs.eventRisk,
		worldContext
	);
	const macroReactionCap = horizonMode === 'session_end' ? 3 : horizonMode === 'one_two_days' ? 4 : 5;
	const context: string[] = [
		...horizonFrame,
		inputs.scenario.context,
		...macro.reactionLines.slice(0, macroReactionCap),
	];
	if (!worldContext.isEmpty && worldContext.keyWorldBullets[0]) {
		context.push(`Z aktualnych nagłówków (feed redakcyjny): ${worldContext.keyWorldBullets[0]}`);
	}

	const rulesApplied = [
		'ENGINE_V1_PIPELINE',
		`HORIZON_MODE_${horizonMode.toUpperCase()}`,
		`ASSET_CLASS_${assetClass.toUpperCase()}`,
		...pick.rulesApplied,
		'LEVELS_FROM_SCENARIO_PART',
		'MACRO_FROM_RAW_CALENDAR_NO_LLM',
	];
	if (!worldContext.isEmpty) rulesApplied.push('WORLD_CONTEXT_V1_NEWS');

	const worldNote = worldContext.isEmpty
		? 'listNews: brak dopasowanych wpisów lub pusty feed w oknie.'
		: `listNews: ${worldContext.dominantTheme}; ryzyko=${worldContext.worldRiskLevel}; świeżość=${worldContext.freshness}; wydarzeń=${worldContext.relatedEvents.length}.`;

	const confidenceNotes = [...verdictBundle.confidenceNotes];
	if (!worldContext.isEmpty && worldContext.worldRiskLevel === 'high') {
		confidenceNotes.push(
			'Globalny kontekst z news feedu (EDU) wskazuje na podwyższone napięcie — ostrożniej z pewnością odczytu względem samego kalendarza makro.'
		);
	} else if (!worldContext.isEmpty && worldContext.worldRiskLevel === 'elevated') {
		confidenceNotes.push(
			'Aktualne nagłówki dodają warstwę zmienności narracji; werdykt scenariusza może być szybciej nadpisywany przez news flow.'
		);
	}

	const block: DecisionBlockV1 = {
		schemaVersion: 1,
		asset: inputs.scenario.asset,
		timeframe: inputs.scenario.timeframe,
		decisionHorizonMode: horizonMode,
		assetClass,
		primaryTakeaway: '',
		bias: verdictBundle.bias,
		biasRationale: verdictBundle.biasRationale,
		levels,
		scenarios,
		macro,
		worldContext,
		context,
		verdict: verdictBundle.verdict,
		confidence: verdictBundle.confidence,
		confidenceNotes,
		sourcesUsed: withWorldSource(buildSourcesUsed(inputs), worldNote),
		rulesApplied,
		generatedAt: new Date().toISOString(),
		selectedScenarioKey: pick.key,
		scenarioPickReason: pick.scenarioPickReason,
		scenarioRuleId: pick.scenarioRuleId,
		engineTrace: {
			priceZone: inputs.priceZone,
			techAlignment: inputs.techAlignment,
			eventRisk: inputs.eventRisk,
			scenarioSelectionTrace: pick.rulesApplied,
			scenarioRuleChecks: pick.ruleChecks,
		},
	};

	block.primaryTakeaway = composePrimaryTakeaway(block);

	return { ok: true, block };
}
