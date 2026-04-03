// lib/decision-engine/verdict.ts — bias + werdykt z szablonów (deterministycznie)

import type { ScenarioPick, DecisionBias, DecisionConfidence, DecisionInputs } from './types';

export type VerdictBundle = {
	bias: DecisionBias;
	biasRationale: string[];
	verdict: string;
	confidence: DecisionConfidence;
	confidenceNotes: string[];
};

export function buildVerdict(inputs: DecisionInputs, pick: ScenarioPick): VerdictBundle {
	const biasRationale: string[] = [];
	let bias: DecisionBias = 'neutral';
	const confidenceNotes: string[] = [];

	if (pick.key === 'A') {
		bias = 'conditional';
		biasRationale.push('Scenariusz A z ABC opisuje warunki kontynuacji / wybicia — interpretacja EDU, bez rekomendacji.');
	}
	if (pick.key === 'B') {
		bias = 'neutral';
		biasRationale.push('Scenariusz B z ABC zakłada konsolidację lub brak rozstrzygnięcia — punkt odniesienia neutralny.');
	}
	if (pick.key === 'C') {
		bias = 'conditional';
		biasRationale.push('Scenariusz C z ABC opisuje warunki presji / risk-off lub odwrócenia — interpretacja warunkowa (nie „short signal”).');
	}

	if (inputs.eventRisk === 'high') {
		confidenceNotes.push('Wysokie ryzyko wydarzenia makro w krótkim oknie — werdykt ma charakter ostrożnościowy.');
	}
	if (inputs.pricing.price == null) {
		confidenceNotes.push('Brak bieżącej ceny (Finnhub/override) — strefa ceny i sąsiedztwo poziomów mogą być niepełne.');
	}
	if (!inputs.techMap) {
		confidenceNotes.push('Brak mapy technicznej dla dokładnego dopasowania TF — użyto tylko scenariusza ABC + makro.');
	}
	if (inputs.priceZone === 'unknown') {
		confidenceNotes.push('Strefa ceny „unknown” — brak porównania ceny z liczbową skalą poziomów.');
	}

	let confidence: DecisionConfidence = 'medium';
	if (confidenceNotes.length >= 2 && inputs.pricing.price == null) confidence = 'low';
	else if (inputs.pricing.price != null && inputs.techMap && inputs.priceZone !== 'unknown' && inputs.eventRisk !== 'high')
		confidence = 'high';
	else if (inputs.pricing.price != null && inputs.techMap) confidence = 'medium';

	const techLine = inputs.techMap
		? `Kontekst z mapy technicznej (${inputs.techMap.timeframe}): ${inputs.techMap.trend.slice(0, 220)}${inputs.techMap.trend.length > 220 ? '…' : ''}`
		: 'Brak dopasowanej mapy technicznej w tym przebiegu.';

	const verdict = [
		`[${pick.key}] ${pick.scenarioPickReason}`,
		`Ryzyko wydarzeń (heurystyka): ${inputs.eventRisk}. Strefa ceny vs poziomy ABC: ${inputs.priceZone}.`,
		techLine,
		`To jest synteza modułów EDU (scenariusze ABC + makro + mapy). Nie stanowi prognozy ani rekomendacji.`,
	].join(' ');

	return { bias, biasRationale, verdict, confidence, confidenceNotes };
}
