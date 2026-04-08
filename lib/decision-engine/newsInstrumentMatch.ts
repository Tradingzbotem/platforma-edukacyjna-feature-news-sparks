// Współdzielone dopasowanie tagów instrumentów (news / appendix Redakcji) do kanonicznego assetu silnika.
import { normalizeDecisionAssetId } from './assetAliases';

/** Tagi z newsów / appendixu mapujemy na kanon (zgodnie z aliasami silnika). */
export function newsTagToCanonicalKey(tag: string): string | null {
	const raw = String(tag || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '');
	if (!raw) return null;
	return normalizeDecisionAssetId(raw);
}

/** Kanon → zestaw tagów jakie mogą wystąpić w polu `instruments` newsa / appendixu. */
export function canonicalToNewsInstrumentHints(canonical: string): Set<string> {
	const c = canonical.toUpperCase();
	const hints = new Set<string>([c]);
	if (c === 'US100') {
		['NAS100', 'NASDAQ', 'NDX', 'NQ', 'US100'].forEach((x) => hints.add(x));
	}
	if (c === 'US500') {
		['SPX', 'SP500', 'S&P', 'US500'].forEach((x) => hints.add(x));
	}
	if (c === 'US30') {
		['DOW', 'DJI', 'US30'].forEach((x) => hints.add(x));
	}
	if (c === 'DE40') {
		['DAX', 'GER40', 'DE40'].forEach((x) => hints.add(x));
	}
	if (c === 'XAUUSD') {
		['XAU', 'XAUUSD', 'GOLD'].forEach((x) => hints.add(x));
	}
	if (c === 'WTI' || c === 'BRENT') {
		hints.add('UKOIL');
		hints.add('WTI');
		hints.add('BRENT');
		hints.add('OIL');
	}
	if (c === 'EURUSD') hints.add('EURUSD');
	if (c === 'GBPUSD') hints.add('GBPUSD');
	if (c === 'USDJPY') hints.add('USDJPY');
	return hints;
}

/** Czy pojedynczy tag (np. z listy Instrumenty lub symbol w Szczegóły wpływu) pasuje do kanonu. */
export function instrumentTagMatchesCanonical(canonical: string, rawTag: string): boolean {
	const hints = canonicalToNewsInstrumentHints(canonical);
	const k = newsTagToCanonicalKey(rawTag);
	if (k && k === canonical) return true;
	if (hints.has(String(rawTag).toUpperCase().replace(/\s+/g, ''))) return true;
	return false;
}
