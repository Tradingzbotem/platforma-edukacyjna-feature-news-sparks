// lib/decision-engine/selectScenario.ts — jawny wybór A / B / C (reguły v1.1)

import type { ScenarioPick, ScenarioRuleCheck, PriceZone, TechAlignment } from './types';

export type SelectScenarioInput = {
	eventRisk: 'low' | 'medium' | 'high';
	priceZone: PriceZone;
	techAlignment: TechAlignment;
};

function buildAtomicChecks(input: SelectScenarioInput): ScenarioRuleCheck[] {
	const { eventRisk, priceZone, techAlignment } = input;
	return [
		{ id: 'CHECK_EVENT_RISK_HIGH', passed: eventRisk === 'high' },
		{ id: 'CHECK_EVENT_RISK_MEDIUM', passed: eventRisk === 'medium' },
		{ id: 'CHECK_EVENT_RISK_LOW', passed: eventRisk === 'low' },
		{ id: 'CHECK_PRICE_ZONE_UPPER', passed: priceZone === 'upper' },
		{ id: 'CHECK_PRICE_ZONE_MID', passed: priceZone === 'mid' },
		{ id: 'CHECK_PRICE_ZONE_LOWER', passed: priceZone === 'lower' },
		{ id: 'CHECK_PRICE_ZONE_UNKNOWN', passed: priceZone === 'unknown' },
		{ id: 'CHECK_TECH_ALIGNMENT_RISK_ON', passed: techAlignment === 'risk_on_hint' },
		{ id: 'CHECK_TECH_ALIGNMENT_RISK_OFF', passed: techAlignment === 'risk_off_hint' },
		{ id: 'CHECK_TECH_ALIGNMENT_NEUTRAL', passed: techAlignment === 'neutral' },
	];
}

function traceFromChecks(checks: ScenarioRuleCheck[]): string[] {
	return checks.map((c) => `${c.id}=${c.passed}`);
}

function finish(
	key: 'A' | 'B' | 'C',
	scenarioRuleId: string,
	scenarioPickReason: string,
	checks: ScenarioRuleCheck[]
): ScenarioPick {
	const rulesApplied = [...traceFromChecks(checks), `SELECT_RULE=${scenarioRuleId}`, `SELECT_KEY=${key}`];
	return {
		key,
		scenarioRuleId,
		scenarioPickReason,
		rulesApplied,
		ruleChecks: checks,
	};
}

/**
 * Priorytet malejący (pierwsze dopasowanie wygrywa).
 *
 * C — presja / ostrożność:
 *   RULE_C_EVENT_HIGH
 *   RULE_C_LOWER_TECH_OFF
 *   RULE_C_MID_TECH_OFF
 *   RULE_C_MEDIUM_MACRO_TECH_OFF
 *   RULE_C_MEDIUM_MACRO_WEAK_OR_BLIND
 *   RULE_C_UNKNOWN_TECH_OFF
 *
 * A — kontynuacja / wybicie (konfluencja):
 *   RULE_A_UPPER_RISK_ON
 *   RULE_A_UPPER_NEUTRAL_TECH
 *   RULE_A_MID_RISK_ON_CALM_MACRO
 *
 * B — pośredni / konflikt / „poczekaj”:
 *   RULE_B_UPPER_TECH_CLASH
 *   RULE_B_MID_RISK_ON_MEDIUM_MACRO
 *   RULE_B_RANGE_MACRO_DIGEST
 *   RULE_B_RANGE_TRUE_NEUTRAL
 *   RULE_B_LOWER_RECOVERY_WATCH
 *   RULE_B_LOWER_NEUTRAL
 *   RULE_B_UNKNOWN_CALM
 *   RULE_B_FALLBACK
 */
export function selectScenario(input: SelectScenarioInput): ScenarioPick {
	const checks = buildAtomicChecks(input);

	const EH = input.eventRisk === 'high';
	const EM = input.eventRisk === 'medium';
	const EL = input.eventRisk === 'low';

	const U = input.priceZone === 'upper';
	const M = input.priceZone === 'mid';
	const L = input.priceZone === 'lower';
	const UNK = input.priceZone === 'unknown';

	const T_ON = input.techAlignment === 'risk_on_hint';
	const T_OFF = input.techAlignment === 'risk_off_hint';
	const T_NEU = input.techAlignment === 'neutral';

	// ─── C ─────────────────────────────────────────────

	if (EH) {
		return finish(
			'C',
			'RULE_C_EVENT_HIGH',
			'Makro: eventRisk=high (istotne wydarzenie w krótkim oknie) — priorytet scenariusza C (warunki presji / odwrócenia, EDU).',
			checks
		);
	}

	if (L && T_OFF) {
		return finish(
			'C',
			'RULE_C_LOWER_TECH_OFF',
			'Strefa lower + mapa sugeruje risk-off — scenariusz C (presja w strukturze).',
			checks
		);
	}

	if (M && T_OFF) {
		return finish(
			'C',
			'RULE_C_MID_TECH_OFF',
			'Konsolidacja (mid) przy sygnale risk-off z mapy — C jako „presja wewnątrz pasma”, nie domyślne B.',
			checks
		);
	}

	if (EM && T_OFF) {
		return finish(
			'C',
			'RULE_C_MEDIUM_MACRO_TECH_OFF',
			'eventRisk=medium + risk-off z techniki — ostrożny układ; C zamiast płaskiego B.',
			checks
		);
	}

	if (EM && (L || UNK)) {
		return finish(
			'C',
			'RULE_C_MEDIUM_MACRO_WEAK_OR_BLIND',
			'Średnie ryzyko makro przy słabej strefie ceny (lower) lub braku porównania (unknown) — C (defensywny szkielet EDU).',
			checks
		);
	}

	if (UNK && T_OFF && EL) {
		return finish(
			'C',
			'RULE_C_UNKNOWN_TECH_OFF',
			'Brak strefy ceny (unknown) + risk-off na mapie przy spokojnym makro — defensywne C.',
			checks
		);
	}

	// ─── A ─────────────────────────────────────────────

	if (U && T_ON) {
		return finish(
			'A',
			'RULE_A_UPPER_RISK_ON',
			'Strefa upper + risk-on z mapy — konfluencja pod scenariusz A (kontynuacja / wybicie, EDU).',
			checks
		);
	}

	if (U && T_NEU) {
		return finish(
			'A',
			'RULE_A_UPPER_NEUTRAL_TECH',
			'Cena powyżej skali poziomów (upper), technika neutralna — A jako bazowy opis kontynuacji.',
			checks
		);
	}

	if (M && T_ON && EL) {
		return finish(
			'A',
			'RULE_A_MID_RISK_ON_CALM_MACRO',
			'Pas mid + risk-on przy spokojnym makro (low) — A jako „kontynuacja w zakresie”, nie automatyczne B.',
			checks
		);
	}

	// ─── B — konflikt, makro w tle, „poczekaj” ─────────

	if (U && T_OFF) {
		return finish(
			'B',
			'RULE_B_UPPER_TECH_CLASH',
			'Upper vs defensywna technika (risk-off) — konflikt sygnałów; B (rozstrzygnięcie w danych / czasie).',
			checks
		);
	}

	if (M && T_ON && EM) {
		return finish(
			'B',
			'RULE_B_MID_RISK_ON_MEDIUM_MACRO',
			'Mid + risk-on, ale makro=medium — B: pozytywny ton techniczny, ale okno wydarzeń wymaga ostrożności.',
			checks
		);
	}

	if (M && T_NEU && EM) {
		return finish(
			'B',
			'RULE_B_RANGE_MACRO_DIGEST',
			'Range (mid) + technika neutralna + makro=medium — klasyczne „trawienie” informacji; B.',
			checks
		);
	}

	if (M && T_NEU && EL) {
		return finish(
			'B',
			'RULE_B_RANGE_TRUE_NEUTRAL',
			'Mid + neutral + makro=low — rdzeń scenariusza B (brak ekstremów).',
			checks
		);
	}

	if (L && T_ON && EL) {
		return finish(
			'B',
			'RULE_B_LOWER_RECOVERY_WATCH',
			'Lower przy risk-on i spokojnym makro — B (obserwacja odbicia / retestu, bez wymuszania C).',
			checks
		);
	}

	if (L && T_NEU) {
		return finish(
			'B',
			'RULE_B_LOWER_NEUTRAL',
			'Lower + technika neutralna — B (słabsza strefa bez jawnego risk-off z mapy).',
			checks
		);
	}

	if (UNK && EL && (T_NEU || T_ON)) {
		return finish(
			'B',
			'RULE_B_UNKNOWN_CALM',
			'Nieznana strefa ceny przy spokojnym makro — B do czasu dopięcia poziomów / ceny.',
			checks
		);
	}

	return finish(
		'B',
		'RULE_B_FALLBACK',
		'Fallback B: kombinacja nie objęta wyżej — neutralny stan pośredni (EDU).',
		checks
	);
}

export function computePriceZone(price: number | undefined, levelNums: number[]): PriceZone {
	if (price == null || !Number.isFinite(price) || levelNums.length === 0) return 'unknown';
	const lo = Math.min(...levelNums);
	const hi = Math.max(...levelNums);
	if (price > hi) return 'upper';
	if (price < lo) return 'lower';
	return 'mid';
}

export function detectTechAlignment(trend: string, scenarioNotes: string[]): TechAlignment {
	const t = `${trend}\n${scenarioNotes.join('\n')}`.toLowerCase();
	const riskOff =
		/\b(risk-off|risk off|hawkish|presja na growth|pod[aą]ż|zej[sś]ci|spadkow|osłab|bearish|presja na indeks)\b/i.test(
			t
		);
	const riskOn =
		/\b(risk-on|risk on|wzrostow|kontynuacj|popyt|bycz|odbi|pro-wzrost|trend wzrost)\b/i.test(t);
	if (riskOff && !riskOn) return 'risk_off_hint';
	if (riskOn && !riskOff) return 'risk_on_hint';
	return 'neutral';
}
