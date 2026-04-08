import {
	MORNING_BRIEF_MARKET_SYMBOLS,
	type MorningBriefCanonicalKey,
} from '@/lib/brief/morningBriefMarketSymbols';

export type { MorningBriefCanonicalKey };

const CANONICAL_LIST = Object.keys(MORNING_BRIEF_MARKET_SYMBOLS) as MorningBriefCanonicalKey[];

/** Maks. wiek override (ms), poniżej którego można użyć liczby jako snapshot referencyjny. */
export const MORNING_BRIEF_OVERRIDE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const ALIAS_RULES: Array<{ re: RegExp; key: MorningBriefCanonicalKey }> = [
	{ re: /\bUS\s*500\b|S\s*&\s*P\s*500|(^|\b)SPX(\b|$)|\bS\s*&\s*P\b/i, key: 'US500' },
	{ re: /\bNASDAQ\b|\bUS\s*100\b|\bNAS\s*100\b|\bNDX\b/i, key: 'US100' },
	{ re: /\bDAX\b|\bGER\s*40\b|\bDE\s*40\b|\bDE40\b/i, key: 'DE40' },
	{ re: /\bEUR\s*\/\s*USD\b|\bEURUSD\b/i, key: 'EURUSD' },
	{ re: /\bXAUUSD\b|\bXAU\b(?!\w)|\bGOLD\b|złot\w/i, key: 'XAUUSD' },
	{ re: /\bBRENT\b|\bUK\s*OIL\b/i, key: 'BRENT' },
	{ re: /\bUSD\s*\/\s*JPY\b|\bUSDJPY\b/i, key: 'USDJPY' },
	{ re: /(^|\b)VIX(\b|$)/i, key: 'VIX' },
];

/**
 * Mapuje dowolny opis instrumentu z briefingu na klucz snapshotu (US500, EURUSD, …).
 */
export function resolveMorningBriefCanonicalKeyFromAssetLabel(raw: string): MorningBriefCanonicalKey | null {
	const t = String(raw || '').trim();
	if (!t) return null;

	const compact = t.toUpperCase().replace(/\s+/g, '');
	for (const k of CANONICAL_LIST) {
		if (compact === k || compact.includes(k)) return k;
	}

	for (const { re, key } of ALIAS_RULES) {
		if (re.test(t)) return key;
	}

	return null;
}

/**
 * Kolejność: dopasowania z ALIAS_RULES, potem surowy substring etykiety kanonicznej (US500, VIX, …).
 */
export function inferMorningBriefCanonicalKeysOrdered(text: string): MorningBriefCanonicalKey[] {
	const raw = String(text || '');
	if (!raw.trim()) return [];

	const out: MorningBriefCanonicalKey[] = [];
	const seen = new Set<MorningBriefCanonicalKey>();

	for (const { re, key } of ALIAS_RULES) {
		if (seen.has(key)) continue;
		if (re.test(raw)) {
			seen.add(key);
			out.push(key);
		}
	}

	const compact = raw.toUpperCase().replace(/\s+/g, '');
	for (const k of CANONICAL_LIST) {
		if (seen.has(k)) continue;
		if (compact.includes(k)) {
			seen.add(k);
			out.push(k);
		}
	}

	return out;
}
