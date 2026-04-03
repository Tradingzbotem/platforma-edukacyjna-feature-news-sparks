// lib/decision-engine/assetClass.ts — heurystyczna klasa aktywa dla copy i soczewki horyzontu

import type { DecisionAssetClass } from './types';

export function decisionAssetClassForCanonical(canonical: string): DecisionAssetClass {
	const c = String(canonical || '').toUpperCase();
	if (c === 'US100' || c === 'US500' || c === 'US30') return 'us_index';
	if (c === 'DE40') return 'eu_index';
	if (c === 'XAUUSD') return 'gold';
	if (c === 'WTI' || c === 'BRENT') return 'oil';
	if (c === 'EURUSD' || c === 'GBPUSD' || c === 'USDJPY' || c === 'EURPLN' || c === 'USDPLN') return 'fx_major';
	if (['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'].includes(c)) return 'single_stock';
	if (c === 'XAGUSD') return 'other';
	return 'other';
}
