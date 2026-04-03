// lib/decision-engine/types.ts — Decision Block v1 (ustrukturyzowany output)

import type { ScenarioItem, ScenarioPart } from '@/lib/panel/scenariosABC';
import type { TechMapItem } from '@/lib/panel/techMaps';
import type { MacroCalendarApiEvent } from '@/lib/panel/macroCalendarCore';
import type { DecisionWorldContext } from './worldContext/types';

/** Tryb horyzontu decyzji — wpływa na okno newsów, makro-copy i primary takeaway. */
export type DecisionHorizonMode = 'session_end' | 'one_two_days' | 'full_week' | 'macro_event';

/** Klasa aktywa — osobna soczewka narracji (nie zmienia reguł A/B/C). */
export type DecisionAssetClass =
	| 'us_index'
	| 'eu_index'
	| 'gold'
	| 'oil'
	| 'fx_major'
	| 'single_stock'
	| 'other';

export type DecisionBias = 'long' | 'short' | 'neutral' | 'conditional';

export type DecisionConfidence = 'low' | 'medium' | 'high';

export type DecisionSourceRef = {
	module:
		| 'scenariosABC'
		| 'techMaps'
		| 'macroCalendar'
		| 'calendarImpact'
		| 'quotes'
		| 'priceOverride'
		| 'newsWorldContext';
	id?: string;
	version?: string;
	note?: string;
};

export type DecisionScenarioSlice = {
	key: 'A' | 'B' | 'C';
	condition: string;
	invalidation: string;
	confirmations?: string;
	riskNotes?: string;
};

export type DecisionLevelsKind = 'edu_prose' | 'derived_from_levels' | 'mixed';

export type DecisionLevels = {
	trigger: string;
	invalidation: string;
	target: string;
	kind: DecisionLevelsKind;
	normalizedLevels: string[];
	currentPrice?: number;
	nearestSupport?: string;
	nearestResistance?: string;
};

export type DecisionMacroEvent = {
	date: string;
	time?: string;
	title: string;
	importance?: 'low' | 'medium' | 'high';
	region?: string;
};

export type DecisionMacroContext = {
	windowDays: number;
	highRiskHorizonDays: number;
	events: DecisionMacroEvent[];
	eventRisk: 'low' | 'medium' | 'high';
	impactChips: string[];
	reactionLines: string[];
	calendarSource: string;
	topEventsForImpact: DecisionMacroEvent[];
};

/** Pojedynczy warunek diagnostyczny (deterministyczny ślad decyzji). */
export type ScenarioRuleCheck = {
	id: string;
	passed: boolean;
};

export type ScenarioPick = {
	key: 'A' | 'B' | 'C';
	scenarioRuleId: string;
	scenarioPickReason: string;
	/** Pełny ślad: CHECK_* (true/false) + SELECT_RULE + SELECT_KEY (kompatybilny z debug). */
	rulesApplied: string[];
	/** Strukturalnie te same informacje co linie CHECK_* w `rulesApplied`. */
	ruleChecks: ScenarioRuleCheck[];
};

export type PriceZone = 'unknown' | 'upper' | 'lower' | 'mid';

export type TechAlignment = 'risk_on_hint' | 'risk_off_hint' | 'neutral';

export type CollectOptions = {
	/** Domyślnie 7 */
	calendarDays?: number;
	/** Domyślnie 3 — lista wydarzeń w makro */
	eventListHorizonDays?: number;
	/** Domyślnie 2 — okno na eventRisk "high" */
	highRiskHorizonDays?: number;
	/** Opcjonalnie wymuszony TF scenariusza ABC */
	timeframe?: ScenarioItem['timeframe'];
	/** Okno newsów (godziny) dla World Context Layer; domyślnie z `calendarDays`. */
	worldNewsHours?: number;
	/** Jawny tryb myślenia po horyzoncie (FXEDULAB Decision Center). Domyślnie `one_two_days`. */
	decisionHorizonMode?: DecisionHorizonMode;
};

export type EventWithImpact = {
	event: MacroCalendarApiEvent;
	chips: string[];
	reactionLines: string[];
};

export type DecisionInputs = {
	canonicalAsset: string;
	scenario: ScenarioItem;
	techMap: TechMapItem | null;
	pricing: {
		price?: number;
		prevClose?: number;
		changePct?: number;
		levelsNormalized: string[];
		decimals: number;
		finnhubSymbol?: string;
		overrideSource?: string;
	};
	calendarSource: string;
	eventsRanked: MacroCalendarApiEvent[];
	eventsInMacroWindow: MacroCalendarApiEvent[];
	topImpacts: EventWithImpact[];
	eventRisk: 'low' | 'medium' | 'high';
	priceZone: PriceZone;
	techAlignment: TechAlignment;
	levelNumbers: number[];
};

export interface DecisionBlockV1 {
	schemaVersion: 1;
	asset: string;
	timeframe: ScenarioItem['timeframe'];
	/** Ustawiane przez API Decision Center — wpływa na copy i soczewkę makro/news. */
	decisionHorizonMode: DecisionHorizonMode;
	assetClass: DecisionAssetClass;
	/** Złożony wniosek produktowy (serwer); UI wyświetla wprost. */
	primaryTakeaway: string;

	bias: DecisionBias;
	biasRationale: string[];

	levels: DecisionLevels;
	scenarios: DecisionScenarioSlice[];

	macro: DecisionMacroContext;
	/** Kontekst z News Command Center (`listNews`) — osobny input, nie zmienia A/B/C. */
	worldContext: DecisionWorldContext;
	context: string[];

	verdict: string;
	confidence: DecisionConfidence;
	confidenceNotes: string[];

	sourcesUsed: DecisionSourceRef[];
	rulesApplied: string[];
	generatedAt: string;

	selectedScenarioKey: 'A' | 'B' | 'C';
	scenarioPickReason: string;
	scenarioRuleId: string;

	/** Przezroczystość silnika (nie UI) */
	engineTrace: {
		priceZone: PriceZone;
		techAlignment: TechAlignment;
		eventRisk: 'low' | 'medium' | 'high';
		/** Linie typu CHECK_*=true|false oraz SELECT_RULE=… (kopia z selekcji scenariusza). */
		scenarioSelectionTrace: string[];
		scenarioRuleChecks: ScenarioRuleCheck[];
	};
}

export function scenarioPartToSlice(key: 'A' | 'B' | 'C', part: ScenarioPart): DecisionScenarioSlice {
	return {
		key,
		condition: part.if,
		invalidation: part.invalidation,
		confirmations: part.confirmations,
		riskNotes: part.riskNotes,
	};
}
