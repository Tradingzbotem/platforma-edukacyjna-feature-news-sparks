// lib/decision-engine/collectInputs.ts — zbieranie danych z modułów

import { getTechMaps } from '@/lib/panel/techMapsStore';
import type { TechMapItem } from '@/lib/panel/techMaps';
import { pickScenarioItemForAsset } from './assetAliases';
import {
	buildTopImpacts,
	computeEventRiskLevel,
	filterEventsFromToday,
	loadCalendarForDecisionEngine,
} from './macro';
import { normalizeLevelsForPrice, resolvePriceForCanonicalAsset, parseLevelToNumber } from './pricing';
import { computePriceZone, detectTechAlignment } from './selectScenario';
import type { CollectOptions, DecisionInputs } from './types';
import type { ScenarioItem } from '@/lib/panel/scenariosABC';

function pickTechMapForScenario(maps: TechMapItem[], canonical: string, scenarioTf: ScenarioItem['timeframe']): TechMapItem | null {
	const cands = maps.filter((m) => m.asset.toUpperCase() === canonical.toUpperCase());
	if (!cands.length) return null;
	const exact = cands.find((m) => m.timeframe === scenarioTf);
	if (exact) return exact;
	const order: TechMapItem['timeframe'][] = ['M30', 'H1', 'H4', 'D1', 'W1', 'MN'];
	const idx = order.indexOf(scenarioTf as TechMapItem['timeframe']);
	const targetIdx = idx >= 0 ? idx : order.indexOf('H4');
	cands.sort(
		(a, b) => Math.abs(order.indexOf(a.timeframe) - targetIdx) - Math.abs(order.indexOf(b.timeframe) - targetIdx)
	);
	return cands[0];
}

const DEFAULTS = {
	calendarDays: 14,
	eventListHorizonDays: 5,
	highRiskHorizonDays: 2,
} as const;

export async function collectDecisionInputs(
	canonicalAsset: string,
	options?: CollectOptions
): Promise<{ ok: true; data: DecisionInputs } | { ok: false; error: string }> {
	const scenario = pickScenarioItemForAsset(canonicalAsset, options?.timeframe);
	if (!scenario) {
		return { ok: false, error: `Brak scenariusza ABC dla assetu „${canonicalAsset}”.` };
	}

	const calendarDays = Math.max(7, options?.calendarDays ?? DEFAULTS.calendarDays);
	const eventListHorizonDays = Math.max(1, options?.eventListHorizonDays ?? DEFAULTS.eventListHorizonDays);
	const highRiskHorizonDays = Math.max(1, options?.highRiskHorizonDays ?? DEFAULTS.highRiskHorizonDays);

	const [resolvedPrice, maps, cal] = await Promise.all([
		resolvePriceForCanonicalAsset(canonicalAsset),
		getTechMaps(),
		loadCalendarForDecisionEngine(calendarDays),
	]);

	const levelsNormalized = normalizeLevelsForPrice(scenario.levels, resolvedPrice.price, resolvedPrice.decimals);
	const levelNumbers = levelsNormalized.map((s) => parseLevelToNumber(s)).filter((n): n is number => n != null);

	const techMap = pickTechMapForScenario(maps, canonicalAsset, scenario.timeframe);
	const techAlignment = techMap
		? detectTechAlignment(techMap.trend, techMap.scenarioNotes || [])
		: 'neutral';

	const eventsInMacroWindow = filterEventsFromToday(cal.ranked, eventListHorizonDays);
	const eventsHighHorizon = filterEventsFromToday(cal.ranked, highRiskHorizonDays);

	const eventRisk = computeEventRiskLevel(canonicalAsset, eventsHighHorizon, eventsInMacroWindow);
	const topImpacts = buildTopImpacts(eventsInMacroWindow, 5);
	const priceZone = computePriceZone(resolvedPrice.price, levelNumbers);

	const data: DecisionInputs = {
		canonicalAsset,
		scenario,
		techMap,
		pricing: {
			price: resolvedPrice.price,
			prevClose: resolvedPrice.prevClose,
			changePct: resolvedPrice.changePct,
			levelsNormalized,
			decimals: resolvedPrice.decimals,
			finnhubSymbol: resolvedPrice.finnhubSymbol,
			overrideSource: resolvedPrice.override.source !== 'none' ? resolvedPrice.override.source : undefined,
		},
		calendarSource: cal.source,
		eventsRanked: cal.ranked,
		eventsInMacroWindow,
		topImpacts,
		eventRisk,
		priceZone,
		techAlignment,
		levelNumbers,
	};

	return { ok: true, data };
}
