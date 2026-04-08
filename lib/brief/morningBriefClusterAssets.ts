// lib/brief/morningBriefClusterAssets.ts — do 4 instrumentów snapshotu pod wygrany klaster briefu
import type { LiveNewsContextItem } from '@/lib/brief/liveNewsContext';
import type { MarketDriverCategory } from '@/lib/brief/marketDriverSelector';
import { inferMorningBriefCanonicalKeysOrdered } from '@/lib/brief/morningBriefAssetCanonical';
import type { MorningBriefCanonicalKey } from '@/lib/brief/morningBriefMarketSymbols';

export type MorningBriefClusterAssetPickInput = {
	themeKey: string;
	category: MarketDriverCategory;
	relatedNews: LiveNewsContextItem[];
};

const THEME_DEFAULT_ASSETS: Partial<Record<string, MorningBriefCanonicalKey[]>> = {
	iran_hormuz_oil: ['BRENT', 'US500', 'XAUUSD', 'VIX'],
	opec_supply: ['BRENT', 'US500', 'DE40', 'EURUSD'],
	fed_higher_for_longer: ['US500', 'VIX', 'USDJPY', 'XAUUSD'],
	fed_rate_cut_path: ['US500', 'VIX', 'EURUSD', 'XAUUSD'],
	us_cpi_inflation: ['US500', 'VIX', 'XAUUSD', 'EURUSD'],
	us_yields_jump: ['US500', 'VIX', 'EURUSD', 'DE40'],
	ecb_rate_path: ['EURUSD', 'DE40', 'US500', 'VIX'],
	boe_rate_path: ['EURUSD', 'DE40', 'US500', 'VIX'],
	boj_yen_policy: ['USDJPY', 'US500', 'VIX', 'XAUUSD'],
	apple_earnings: ['US100', 'US500', 'VIX'],
	nvidia_ai_demand: ['US100', 'US500', 'VIX'],
};

const CATEGORY_DEFAULT_ASSETS: Record<MarketDriverCategory, MorningBriefCanonicalKey[]> = {
	geopolitics: ['US500', 'VIX', 'XAUUSD', 'BRENT'],
	energy: ['BRENT', 'US500', 'EURUSD', 'DE40'],
	central_banks: ['US500', 'VIX', 'EURUSD', 'USDJPY'],
	inflation: ['US500', 'VIX', 'XAUUSD', 'EURUSD'],
	rates: ['US500', 'VIX', 'EURUSD', 'DE40'],
	fx: ['EURUSD', 'USDJPY', 'US500', 'VIX'],
	equities_macro: ['US500', 'US100', 'DE40', 'VIX'],
	company_specific: ['US100', 'US500', 'VIX'],
	m_and_a: ['US500', 'US100', 'DE40', 'EURUSD'],
	other: ['US500', 'VIX', 'EURUSD', 'XAUUSD'],
};

export function pickMorningBriefCanonicalKeysForCluster(
	sel: MorningBriefClusterAssetPickInput,
	max: number,
): MorningBriefCanonicalKey[] {
	const cap = Math.max(1, Math.min(max, 8));
	const blob = sel.relatedNews.map((n) => `${n.title} ${n.summary}`).join('\n');
	const fromText = inferMorningBriefCanonicalKeysOrdered(blob);
	const defaults =
		THEME_DEFAULT_ASSETS[sel.themeKey] ?? CATEGORY_DEFAULT_ASSETS[sel.category] ?? CATEGORY_DEFAULT_ASSETS.other;

	const merged: MorningBriefCanonicalKey[] = [];
	const seen = new Set<MorningBriefCanonicalKey>();
	for (const k of [...fromText, ...defaults]) {
		if (seen.has(k)) continue;
		seen.add(k);
		merged.push(k);
		if (merged.length >= cap) break;
	}
	return merged;
}
