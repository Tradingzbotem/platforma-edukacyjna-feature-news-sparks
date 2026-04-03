// lib/decision-engine/assetAliases.ts — kanoniczne ID + aliasy wejściowe

import { SCENARIOS_ABC, type ScenarioItem } from '@/lib/panel/scenariosABC';

/** Zestaw assetów występujących w SCENARIOS_ABC (źródło prawdy dla silnika v1). */
export const DECISION_ENGINE_CANONICAL_ASSETS = Array.from(new Set(SCENARIOS_ABC.map((s) => s.asset)));

const ALIAS_TO_CANONICAL: Record<string, string> = (() => {
	const m: Record<string, string> = {};
	for (const a of DECISION_ENGINE_CANONICAL_ASSETS) {
		m[a.toUpperCase()] = a;
	}
	const add = (alias: string, canonical: string) => {
		m[alias.toUpperCase().replace(/\s+/g, '')] = canonical;
	};
	// Indeksy / CFD
	add('NAS100', 'US100');
	add('NQ100', 'US100');
	add('NQ', 'US100');
	add('NASDAQ100', 'US100');
	add('SP500', 'US500');
	add('SPX', 'US500');
	add('S&P500', 'US500');
	add('DOW', 'US30');
	add('DAX', 'DE40');
	add('GER40', 'DE40');
	// Złoto
	add('GOLD', 'XAUUSD');
	add('XAU', 'XAUUSD');
	// FX
	add('EUR/USD', 'EURUSD');
	add('EUR-USD', 'EURUSD');
	add('GBP/USD', 'GBPUSD');
	add('USD/JPY', 'USDJPY');
	add('USDPLN', 'USDPLN');
	add('EURPLN', 'EURPLN');
	// Ropa
	add('USOIL', 'WTI');
	add('XTIUSD', 'WTI');
	add('CRUDE', 'WTI');
	add('OIL', 'WTI');
	add('UKOIL', 'BRENT');
	// Srebro
	add('SILVER', 'XAGUSD');
	add('XAG', 'XAGUSD');
	return m;
})();

const PREFERRED_SCENARIO_TF: Partial<Record<string, ScenarioItem['timeframe']>> = {
	US100: 'H4',
	US500: 'H4',
	US30: 'H4',
	DE40: 'H4',
	XAUUSD: 'H1',
	EURUSD: 'D1',
	GBPUSD: 'H1',
	USDJPY: 'H1',
	EURPLN: 'H1',
	USDPLN: 'H1',
	XAGUSD: 'H1',
	WTI: 'H4',
	BRENT: 'H4',
	AAPL: 'H4',
	TSLA: 'H4',
	NVDA: 'H4',
	MSFT: 'H4',
	AMZN: 'H4',
	META: 'H4',
};

/**
 * Normalizuje dowolny identyfikator z UI / URL do kanonicznego assetu z SCENARIOS_ABC.
 * Zwraca null, jeśli nie ma pokrycia w scenariuszach.
 */
export function normalizeDecisionAssetId(raw: string): string | null {
	const k = String(raw || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '')
		.replace(/\//g, '');
	if (!k) return null;
	const direct = ALIAS_TO_CANONICAL[k];
	if (direct) return direct;
	if (DECISION_ENGINE_CANONICAL_ASSETS.includes(k)) return k;
	return null;
}

export function pickScenarioItemForAsset(
	canonical: string,
	explicitTf?: ScenarioItem['timeframe']
): ScenarioItem | null {
	const cands = SCENARIOS_ABC.filter((s) => s.asset === canonical);
	if (!cands.length) return null;
	if (explicitTf) {
		const hit = cands.find((s) => s.timeframe === explicitTf);
		if (hit) return hit;
	}
	const pref = PREFERRED_SCENARIO_TF[canonical];
	if (pref) {
		const hit = cands.find((s) => s.timeframe === pref);
		if (hit) return hit;
	}
	return cands[0];
}

/**
 * Czy chip z inferImpact odnosi się do kanonicznego instrumentu (heurystyka v1).
 */
export function assetMatchesImpactChip(canonical: string, chip: string): boolean {
	const c = canonical.toUpperCase();
	const ch = String(chip || '').toUpperCase();

	if (c === 'US100' && (ch.includes('US100') || ch.includes('NAS100') || ch.includes('NASDAQ'))) return true;
	if (c === 'US500' && (ch.includes('US500') || ch.includes('S&P') || ch.includes('SP500') || ch.includes('SPX')))
		return true;
	if (c === 'US30' && (ch.includes('US30') || ch.includes('DOW'))) return true;
	if (c === 'DE40' && (ch.includes('DAX') || ch.includes('DE40') || ch.includes('GER40'))) return true;

	if (
		c === 'XAUUSD' &&
		(ch.includes('XAU') ||
			ch.includes('GOLD') ||
			ch.includes('ZŁOT') ||
			ch.replace(/Ł/g, 'L').includes('ZLOT'))
	)
		return true;
	if (c === 'XAGUSD' && (ch.includes('SILVER') || ch.includes('XAG'))) return true;

	if (c === 'EURUSD' && ch.includes('EURUSD')) return true;
	if (c === 'GBPUSD' && ch.includes('GBPUSD')) return true;
	if (c === 'USDJPY' && ch.includes('USDJPY')) return true;
	if (c === 'EURPLN' && ch.includes('EURPLN')) return true;
	if (c === 'USDPLN' && ch.includes('USDPLN')) return true;

	if (c === 'WTI' && (ch.includes('WTI') || ch.includes('BRENT') || ch.includes('OIL') || ch.includes('ENERGY') || ch.includes('ROPY')))
		return true;
	if (c === 'BRENT' && (ch.includes('BRENT') || ch.includes('WTI') || ch.includes('OIL') || ch.includes('ENERGY'))) return true;

	if (['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'].includes(c) && ch.includes(c)) return true;

	return false;
}

export function eventRelevantToAsset(canonical: string, chips: string[]): boolean {
	return chips.some((chip) => assetMatchesImpactChip(canonical, chip));
}
