// lib/brief/morningBriefMarketSnapshot.ts — snapshot cen dla porannego briefingu (quotes API + fallback override ≤12h)
import { resolveBriefingRequestBaseUrl } from '@/lib/brief/liveNewsContext';
import { MORNING_BRIEF_OVERRIDE_MAX_AGE_MS } from '@/lib/brief/morningBriefAssetCanonical';
import type { MorningBriefingLivePriceSource } from '@/lib/brief/morningInstitutionalBriefingTypes';
import { readPriceOverride } from '@/lib/decision-engine/pricing';
import {
	MORNING_BRIEF_MARKET_SYMBOLS,
	type MorningBriefCanonicalKey,
} from '@/lib/brief/morningBriefMarketSymbols';

export { MORNING_BRIEF_MARKET_SYMBOLS } from '@/lib/brief/morningBriefMarketSymbols';

export type MorningBriefPriceRowMeta = {
	canonical: MorningBriefCanonicalKey;
	symbol: string;
	livePriceSource: MorningBriefingLivePriceSource;
	/** Wiek override w godzinach (tylko override_recent). */
	livePriceAgeHours?: number;
	/** Sformatowana cena do pola livePrice w JSON (bez udawania live przy override). */
	displayPrice?: string;
};

type Quote = { price?: number; changePct?: number };

/** Limit czasu na fetch snapshotu (fail-soft). */
export const MORNING_BRIEF_SNAPSHOT_FETCH_MS = 5500;

/** Zgodność z route — zewnętrzny budżet (race) na całość snapshotu + override. */
export const MORNING_MARKET_SNAPSHOT_FETCH_MS = 6000;

function formatSnapshotPrice(label: string, price: number): string {
	if (label === 'EURUSD') {
		return price.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 });
	}
	if (label === 'USDJPY' || label === 'VIX') {
		return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
	}
	if (label === 'XAUUSD' || label === 'BRENT' || label === 'US500' || label === 'US100' || label === 'DE40') {
		return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
	return String(price);
}

function pctSuffix(q: Quote): string {
	if (q.changePct == null || !Number.isFinite(q.changePct)) return '';
	const sign = q.changePct >= 0 ? '+' : '';
	return ` (${sign}${q.changePct.toFixed(2)}% vs ref.)`;
}

async function fetchTickerResults(base: string, symbolsCsv: string): Promise<Record<string, Quote>> {
	const ac = new AbortController();
	const timer = setTimeout(() => ac.abort(), MORNING_BRIEF_SNAPSHOT_FETCH_MS);
	try {
		const res = await fetch(`${base}/api/quotes/ticker?symbols=${encodeURIComponent(symbolsCsv)}`, {
			cache: 'no-store',
			signal: ac.signal,
		});
		if (!res.ok) return {};
		const json = (await res.json()) as { results?: Record<string, Quote> };
		return json.results && typeof json.results === 'object' ? json.results : {};
	} catch {
		return {};
	} finally {
		clearTimeout(timer);
	}
}

async function resolveOneRow(
	label: MorningBriefCanonicalKey,
	sym: string,
	q: Quote | undefined,
	nowMs: number,
): Promise<{ meta: MorningBriefPriceRowMeta; line: string }> {
	if (q?.price != null && Number.isFinite(q.price) && q.price > 0) {
		const num = formatSnapshotPrice(label, q.price);
		const pct = pctSuffix(q);
		const meta: MorningBriefPriceRowMeta = {
			canonical: label,
			symbol: sym,
			livePriceSource: 'live',
			displayPrice: `${num}${pct}`,
		};
		const line = `- ${label} (${sym}): last=${num}${pct}  [SOURCE: LIVE — można kotwiczyć triggery względem bieżącej notowania z API]`;
		return { meta, line };
	}

	const ov = await readPriceOverride(label);
	const hasPrice = ov.price != null && Number.isFinite(ov.price) && ov.price > 0;
	const hasTrustedTime = Boolean(ov.updatedAt);

	if (hasPrice && hasTrustedTime) {
		const updatedMs = new Date(ov.updatedAt!).getTime();
		const ageMs = nowMs - updatedMs;
		const ageHours = Math.round((Math.max(0, ageMs) / 3600000) * 10) / 10;

		if (ageMs >= 0 && ageMs <= MORNING_BRIEF_OVERRIDE_MAX_AGE_MS) {
			const num = formatSnapshotPrice(label, ov.price!);
			const meta: MorningBriefPriceRowMeta = {
				canonical: label,
				symbol: sym,
				livePriceSource: 'override_recent',
				livePriceAgeHours: ageHours,
				displayPrice: num,
			};
			const line = `- ${label} (${sym}): reference_snapshot=${num} (~${ageHours}h since admin override update; NOT LIVE)  [SOURCE: OVERRIDE_RECENT — używaj ostrożnie: „przy utrzymaniu powyżej ostatniego snapshotu”, unikaj tight intraday; nie nazywaj tego live]`;
			return { meta, line };
		}

		const meta: MorningBriefPriceRowMeta = {
			canonical: label,
			symbol: sym,
			livePriceSource: 'none',
		};
		const line = `- ${label} (${sym}): (no numeric reference — override starszy niż 12h)  [SOURCE: NONE — zero konkretnych poziomów liczbowych, tylko opisowe triggery]`;
		return { meta, line };
	}

	if (hasPrice && !hasTrustedTime) {
		const meta: MorningBriefPriceRowMeta = {
			canonical: label,
			symbol: sym,
			livePriceSource: 'none',
		};
		const line = `- ${label} (${sym}): (no numeric reference — brak zaufanego timestampu override)  [SOURCE: NONE]`;
		return { meta, line };
	}

	const meta: MorningBriefPriceRowMeta = {
		canonical: label,
		symbol: sym,
		livePriceSource: 'none',
	};
	const line = `- ${label} (${sym}): (no live quote / brak kwalifikowalnego override)  [SOURCE: NONE]`;
	return { meta, line };
}

export type MorningBriefMarketSnapshotData = {
	block: string;
	perLabel: Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>;
};

/**
 * True gdy dla wszystkich kluczy briefingu nie ma świeżej ani świeżego override notowania (wszystko NONE / brak wierszy).
 * Używane do przełączenia narrative briefingu w tryb makro-narracji bez „brak danych rynkowych”.
 */
export function morningBriefNarrativeNoMarketData(
	keys: readonly MorningBriefCanonicalKey[],
	perLabel: Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>,
): boolean {
	if (keys.length === 0) return true;
	for (const k of keys) {
		const m = perLabel[k];
		if (m && m.livePriceSource !== 'none') return false;
	}
	return true;
}

const SNAPSHOT_HEADER_LINES = [
	'MARKET SNAPSHOT (server-resolved; Finnhub nie jest warunkiem powodzenia — brak notowania nie przerywa briefingu):',
	'Każda linia ma tag [SOURCE: …]. Dopasuj assets[].trigger* do tagu dla danego instrumentu.',
	'- LIVE: można osadzać triggery względem bieżącej ceny z API.',
	'- OVERRIDE_RECENT: można użyć liczby jako ostatniego snapshotu, ale NIE nazywaj jej live; unikaj precyzyjnych poziomów intraday.',
	'- NONE: zero konkretnych poziomów liczbowych dla tej nogi — wyłącznie opisowe triggery.',
	'',
] as const;

/**
 * Tekst do promptu + metadane per instrument (do nakładki na assets[] po generacji).
 */
export async function buildMorningBriefMarketSnapshotData(req: Request): Promise<MorningBriefMarketSnapshotData> {
	const base = resolveBriefingRequestBaseUrl(req);
	const symbols = [...new Set(Object.values(MORNING_BRIEF_MARKET_SYMBOLS))].join(',');
	const nowMs = Date.now();
	const results = await fetchTickerResults(base, symbols);

	const entries = Object.entries(MORNING_BRIEF_MARKET_SYMBOLS) as Array<[MorningBriefCanonicalKey, string]>;
	const resolved = await Promise.all(
		entries.map(([label, sym]) => resolveOneRow(label, sym, results[sym], nowMs)),
	);

	const perLabel = {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>;
	const lines: string[] = [...SNAPSHOT_HEADER_LINES];

	for (let i = 0; i < entries.length; i++) {
		const [label] = entries[i]!;
		perLabel[label] = resolved[i]!.meta;
		lines.push(resolved[i]!.line);
	}

	return {
		block: lines.join('\n'),
		perLabel,
	};
}

/**
 * Snapshot tylko dla wybranych instrumentów (mniej tokenów + mniej obciążenia ticker API).
 */
export async function buildMorningBriefMarketSnapshotDataForKeys(
	req: Request,
	keys: readonly MorningBriefCanonicalKey[],
): Promise<MorningBriefMarketSnapshotData> {
	const uniq = [...new Set(keys)].filter((k): k is MorningBriefCanonicalKey => k in MORNING_BRIEF_MARKET_SYMBOLS);
	if (!uniq.length) {
		return {
			block: 'MARKET SNAPSHOT: brak wybranych instrumentów — nie podawaj poziomów liczbowych.\n',
			perLabel: {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>,
		};
	}

	const base = resolveBriefingRequestBaseUrl(req);
	const symbolsCsv = [...new Set(uniq.map((k) => MORNING_BRIEF_MARKET_SYMBOLS[k]))].join(',');
	const nowMs = Date.now();
	const results = await fetchTickerResults(base, symbolsCsv);

	const perLabel = {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>;
	const lines: string[] = [...SNAPSHOT_HEADER_LINES];

	for (const label of uniq) {
		const sym = MORNING_BRIEF_MARKET_SYMBOLS[label];
		const { meta, line } = await resolveOneRow(label, sym, results[sym], nowMs);
		perLabel[label] = meta;
		lines.push(line);
	}

	return {
		block: lines.join('\n'),
		perLabel,
	};
}

function failSoftSnapshotDataForKeys(keys: readonly MorningBriefCanonicalKey[]): MorningBriefMarketSnapshotData {
	const uniq = [...new Set(keys)].filter((k): k is MorningBriefCanonicalKey => k in MORNING_BRIEF_MARKET_SYMBOLS);
	const perLabel = {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>;
	const lines: string[] = [
		'MARKET SNAPSHOT: niedostępny (timeout / błąd). Finnhub i ticker nie są warunkiem powodzenia briefingu.',
		'[SOURCE: NONE] dla podanych instrumentów — bez poziomów liczbowych; wyłącznie opisowe triggery.',
		'',
	];
	for (const label of uniq) {
		const sym = MORNING_BRIEF_MARKET_SYMBOLS[label];
		perLabel[label] = { canonical: label, symbol: sym, livePriceSource: 'none' };
		lines.push(`- ${label} (${sym}): (snapshot niedostępny)  [SOURCE: NONE]`);
	}
	return { block: lines.join('\n'), perLabel };
}

/**
 * Jak `fetchMorningBriefMarketSnapshot`, ale tylko dla wskazanych kluczy kanonicznych.
 */
export async function fetchMorningBriefMarketSnapshotForKeys(
	req: Request,
	keys: readonly MorningBriefCanonicalKey[],
	opts?: { fetchMs?: number },
): Promise<MorningBriefMarketSnapshotData> {
	const cap = Math.min(Math.max(opts?.fetchMs ?? MORNING_MARKET_SNAPSHOT_FETCH_MS, 4000), 6000);
	const uniq = [...new Set(keys)].filter((k): k is MorningBriefCanonicalKey => k in MORNING_BRIEF_MARKET_SYMBOLS);
	if (!uniq.length) {
		return {
			block: 'MARKET SNAPSHOT: brak instrumentów.\n',
			perLabel: {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>,
		};
	}
	try {
		return await Promise.race([
			buildMorningBriefMarketSnapshotDataForKeys(req, uniq),
			new Promise<MorningBriefMarketSnapshotData>((_, reject) => {
				setTimeout(() => reject(new Error('morning-snapshot-timeout')), cap);
			}),
		]);
	} catch {
		return failSoftSnapshotDataForKeys(uniq);
	}
}

/** @deprecated Prefer buildMorningBriefMarketSnapshotData — zwraca sam blok tekstowy. */
export async function buildMorningBriefMarketSnapshotBlock(req: Request): Promise<string> {
	const { block } = await buildMorningBriefMarketSnapshotData(req);
	return block;
}

function failSoftSnapshotData(): MorningBriefMarketSnapshotData {
	const entries = Object.entries(MORNING_BRIEF_MARKET_SYMBOLS) as Array<[MorningBriefCanonicalKey, string]>;
	const perLabel = {} as Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>;
	const lines: string[] = [
		'MARKET SNAPSHOT: niedostępny (timeout / błąd). Finnhub i ticker nie są warunkiem powodzenia briefingu.',
		'[SOURCE: NONE] dla wszystkich mapowanych instrumentów — bez poziomów liczbowych; wyłącznie opisowe triggery.',
		'',
	];
	for (const [label, sym] of entries) {
		perLabel[label] = { canonical: label, symbol: sym, livePriceSource: 'none' };
		lines.push(`- ${label} (${sym}): (snapshot niedostępny)  [SOURCE: NONE]`);
	}
	return { block: lines.join('\n'), perLabel };
}

/**
 * Snapshot z twardym limitem czasu — przy przekroczeniu zwraca blok fail-soft (bez 500).
 */
export async function fetchMorningBriefMarketSnapshot(
	req: Request,
	opts?: { fetchMs?: number },
): Promise<MorningBriefMarketSnapshotData> {
	const cap = Math.min(Math.max(opts?.fetchMs ?? MORNING_MARKET_SNAPSHOT_FETCH_MS, 4000), 6000);
	try {
		return await Promise.race([
			buildMorningBriefMarketSnapshotData(req),
			new Promise<MorningBriefMarketSnapshotData>((_, reject) => {
				setTimeout(() => reject(new Error('morning-snapshot-timeout')), cap);
			}),
		]);
	} catch {
		return failSoftSnapshotData();
	}
}
