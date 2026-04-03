// lib/decision-engine/levels.ts — trigger / invalidation / target (uczciwie: EDU + sąsiedztwo poziomów)

import type { ScenarioPart } from '@/lib/panel/scenariosABC';
import { parseLevelToNumber } from './pricing';
import type { DecisionLevels, DecisionLevelsKind } from './types';

export function nearestSupportResistance(
	price: number | undefined,
	normalizedLevels: string[]
): { nearestSupport?: string; nearestResistance?: string } {
	if (price == null || !Number.isFinite(price) || !normalizedLevels.length) return {};
	const nums = normalizedLevels.map((s) => parseLevelToNumber(s)).filter((n): n is number => n != null);
	if (!nums.length) return {};
	const below = nums.filter((n) => n < price).sort((a, b) => b - a)[0];
	const above = nums.filter((n) => n > price).sort((a, b) => a - b)[0];
	return {
		nearestSupport: below != null ? String(below) : undefined,
		nearestResistance: above != null ? String(above) : undefined,
	};
}

export function buildLevels(params: {
	part: ScenarioPart;
	normalizedLevels: string[];
	currentPrice?: number;
}): DecisionLevels {
	const { part, normalizedLevels, currentPrice } = params;
	const { nearestSupport, nearestResistance } = nearestSupportResistance(currentPrice, normalizedLevels);

	let kind: DecisionLevelsKind = 'edu_prose';
	if (normalizedLevels.length && currentPrice != null && Number.isFinite(currentPrice)) {
		kind = nearestSupport || nearestResistance ? 'mixed' : 'edu_prose';
	}

	const targetParts: string[] = [
		'EDU: poniżej nie ma kwotowego „take profit” — tylko warunki obserwacji z modułu ABC.',
		`Konfirmacje / obserwacja: ${part.confirmations}`,
	];
	if (nearestResistance) {
		targetParts.push(`Najbliższy poziom powyżej ceny (z zestawu znormalizowanego): ${nearestResistance}.`);
	}
	if (nearestSupport) {
		targetParts.push(`Najbliższy poziom poniżej ceny (z zestawu znormalizowanego): ${nearestSupport}.`);
	}

	return {
		trigger: part.if,
		invalidation: part.invalidation,
		target: targetParts.join(' '),
		kind,
		normalizedLevels,
		currentPrice,
		nearestSupport,
		nearestResistance,
	};
}
