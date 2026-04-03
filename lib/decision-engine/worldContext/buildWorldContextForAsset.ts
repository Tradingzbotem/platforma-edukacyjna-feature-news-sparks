/**
 * World Context Layer v1 — zbiór nagłówków z News Command Center (`listNews`),
 * heurystyczne dopasowanie do kanonicznego assetu, proste scoringi i modyfikator takeaway.
 *
 * Nie czyta internetu ani LLM — tylko to, co już jest w `lib/news/store`.
 */

import { listNews } from '@/lib/news/store';
import type { NewsItemEnriched } from '@/lib/news/types';
import { normalizeDecisionAssetId } from '../assetAliases';
import type {
	DecisionWorldContext,
	WorldDirectionalPressure,
	WorldEventMatchKind,
	WorldRelatedEvent,
	WorldRiskLevel,
	WorldTakeawayEmphasis,
} from './types';

const GEO_RE =
	/\b(bliski\s+wsch|bliskim\s+wsch|gaza|gazy|iran|iraku|irak|israel|izrael|ukrain|rosj|rosji|nato|konflikt|wojn|terrory|cie[sś]nin|ormuz|hormuz|red\s*sea|geopol|middle\s+east|syri|liban|jemen|hezbollah|hamas|idf|teheran|ryjad|saudi|opec\+|opec\s|embargo)\b/i;

const ENERGY_RE =
	/\b(ropa|ropy|ropę|crude|oil|wti|brent|ukoil|xtiusd|opec|zapas(y|ów)?\s+rop|surowiec\s+energetyczn|lng|gazociąg|ropociąg|rafiner|embargo\s+na\s+rop|supply\s+shock|production\s+cut)\b/i;

const CB_RE =
	/\b(fed|ecb|boj|boe|rba|rbnz|snb|bank\s+central|stopy\s+procent|hawkish|dovish|posiedzenie\s+(fed|ecb)|fomc|głosowanie\s+mpc|lagarde|powell)\b/i;

/** Tagi z newsów mapujemy na kanon (zgodnie z aliasami silnika). */
function newsTagToCanonicalKey(tag: string): string | null {
	const raw = String(tag || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '');
	if (!raw) return null;
	const n = normalizeDecisionAssetId(raw);
	return n;
}

/** Kanon → zestaw tagów jakie mogą wystąpić w polu `instruments` newsa. */
function canonicalToNewsInstrumentHints(canonical: string): Set<string> {
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

function textBlob(item: NewsItemEnriched): string {
	return `${item.title}\n${item.summaryShort || ''}\n${item.whyItMatters || ''}`.toLowerCase();
}

function scoreInstrumentMatch(canonical: string, item: NewsItemEnriched): { score: number; kinds: WorldEventMatchKind[] } {
	const hints = canonicalToNewsInstrumentHints(canonical);
	let score = 0;
	const kinds: WorldEventMatchKind[] = [];
	const tags = item.instruments || [];
	for (const t of tags) {
		const k = newsTagToCanonicalKey(t);
		if (k && k === canonical) {
			score += 42;
			if (!kinds.includes('instrument_tag')) kinds.push('instrument_tag');
		} else if (hints.has(String(t).toUpperCase().replace(/\s+/g, ''))) {
			score += 38;
			if (!kinds.includes('instrument_tag')) kinds.push('instrument_tag');
		}
	}
	return { score, kinds };
}

function keywordBonuses(
	canonical: string,
	item: NewsItemEnriched
): { score: number; kinds: WorldEventMatchKind[] } {
	const blob = textBlob(item);
	let score = 0;
	const kinds: WorldEventMatchKind[] = [];

	const geo = GEO_RE.test(blob);
	const energy = ENERGY_RE.test(blob);
	const cb = CB_RE.test(blob);
	const catGeo = item.category === 'Geo';

	if (catGeo) {
		score += 12;
		kinds.push('category_geo');
	}
	if (geo) {
		kinds.push('keyword_geo');
		if (['WTI', 'BRENT', 'XAUUSD', 'US100', 'US500', 'DE40', 'US30', 'EURUSD', 'GBPUSD'].includes(canonical)) {
			score += 28;
		} else {
			score += 10;
		}
	}
	if (energy) {
		kinds.push('keyword_energy');
		if (['WTI', 'BRENT', 'XAUUSD', 'US100', 'US500'].includes(canonical)) {
			score += 26;
		} else {
			score += 8;
		}
	}
	if (cb) {
		kinds.push('keyword_cb');
		if (['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US100', 'US500', 'DE40'].includes(canonical)) {
			score += 18;
		} else {
			score += 6;
		}
	}

	return { score, kinds };
}

function mergeKinds(a: WorldEventMatchKind[], b: WorldEventMatchKind[]): WorldEventMatchKind[] {
	return Array.from(new Set([...a, ...b]));
}

function itemToRelated(
	item: NewsItemEnriched,
	canonical: string,
	now: number
): WorldRelatedEvent | null {
	const { score: s1, kinds: k1 } = scoreInstrumentMatch(canonical, item);
	const { score: s2, kinds: k2 } = keywordBonuses(canonical, item);
	const base = (item.impact || 1) * 3 + (item.timeEdge || 0) * 2;
	const relevance = Math.min(100, Math.round(s1 + s2 + base));
	if (relevance < 8) return null;

	const pub = new Date(item.publishedAt).getTime();
	const ageHours = Math.max(0, (now - pub) / 3600000);
	const kinds = mergeKinds(k1, k2);

	return {
		id: item.id,
		title: item.title,
		category: item.category,
		publishedAt: item.publishedAt,
		ageHours: Math.round(ageHours * 10) / 10,
		relevanceScore: relevance,
		sentiment: item.sentiment,
		matchKinds: kinds,
		impact: item.impact,
		timeEdge: item.timeEdge,
		source: item.source,
	};
}

function aggregateSentiment(events: WorldRelatedEvent[]): WorldDirectionalPressure {
	if (!events.length) return 'neutral';
	let up = 0;
	let down = 0;
	let vol = 0;
	for (const e of events) {
		const w = e.relevanceScore / 100;
		if (e.sentiment === 'positive') up += w;
		else if (e.sentiment === 'negative') down += w;
		else vol += w * 0.25;
	}
	if (up < 0.15 && down < 0.15) return 'neutral';
	if (Math.abs(up - down) < 0.2) return 'mixed';
	return up > down ? 'risk_on' : 'risk_off';
}

function dominantThemeFrom(events: WorldRelatedEvent[], allCats: Map<string, number>): string {
	if (events.length) {
		const byCat = new Map<string, number>();
		for (const e of events) {
			const c = e.category || 'Inne';
			byCat.set(c, (byCat.get(c) || 0) + e.relevanceScore);
		}
		const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
		if (top) {
			if (top[0] === 'Geo') return 'Geopolityka i ryzyko geopolityczne';
			if (top[0] === 'Surowce') return 'Surowce i energia';
			if (top[0] === 'Makro') return 'Makroekonomia i polityka pieniężna';
			if (top[0] === 'Indeksy') return 'Indeksy globalne';
			if (top[0] === 'FX') return 'Waluty (FX)';
			return `Temat: ${top[0]}`;
		}
	}
	const g = [...allCats.entries()].sort((a, b) => b[1] - a[1])[0];
	if (g) return `Ogólnie: ${g[0]}`;
	return 'Brak wyraźnego dominującego tematu w oknie';
}

function riskLevelFrom(topScore: number, hasGeoEnergy: boolean, countStrong: number): WorldRiskLevel {
	if (topScore >= 72 || (hasGeoEnergy && topScore >= 48) || countStrong >= 4) return 'high';
	if (topScore >= 40 || countStrong >= 2) return 'elevated';
	return 'low';
}

function freshnessFrom(youngestAgeHours: number | null): 'stale' | 'recent' | 'hot' {
	if (youngestAgeHours == null) return 'stale';
	if (youngestAgeHours <= 8) return 'hot';
	if (youngestAgeHours <= 36) return 'recent';
	return 'stale';
}

function pickEmphasis(
	canonical: string,
	events: WorldRelatedEvent[],
	worldRisk: WorldRiskLevel
): { emphasis: WorldTakeawayEmphasis; lead: string | null } {
	if (worldRisk === 'low' || !events.length) {
		return { emphasis: 'none', lead: null };
	}

	const top = events[0];
	const kinds = new Set(top.matchKinds);
	const anyGeo = events.some((e) => e.matchKinds.includes('keyword_geo') || e.matchKinds.includes('category_geo'));
	const anyEnergy = events.some((e) => e.matchKinds.includes('keyword_energy'));
	const anyCb = events.some((e) => e.matchKinds.includes('keyword_cb'));

	const isOil = canonical === 'WTI' || canonical === 'BRENT';
	const isGold = canonical === 'XAUUSD';
	const isIndex = ['US100', 'US500', 'DE40', 'US30'].includes(canonical);

	if (isOil && (anyEnergy || anyGeo || kinds.has('keyword_energy'))) {
		return {
			emphasis: 'caution_energy',
			lead: 'W aktualnych nagłówkach widać mocny wątek energii lub geopolityki — przy ropie ta narracja bywa ważniejsza niż zwykły tydzień makro, więc licz się z większą zmiennością i nagłymi zwrotami sentymentu.',
		};
	}
	if (isGold && (anyGeo || worldRisk !== 'low')) {
		return {
			emphasis: 'caution_geopolitics',
			lead: 'Globalne nagłówki podnoszą wątek ryzyka (często geopolityka) — złoto bywa wtedy bardziej „czujne” na nastroje niż w spokojniejsze tygodnie, mimo spokojniejszego kalendarza danych.',
		};
	}
	if (isIndex && anyGeo) {
		return {
			emphasis: 'broad_risk_off',
			lead: 'W tle widać napięcia geopolityczne z feedu redakcyjnego — szerokie indeksy mogą wtedy zachowywać się nerwowo niezależnie od lokalnego scenariusza technicznego.',
		};
	}
	if (anyCb && ['EURUSD', 'GBPUSD', 'USDJPY'].includes(canonical)) {
		return {
			emphasis: 'caution_policy',
			lead: 'Nagłówki mocno lawirują wokół banków centralnych i stóp — na parach FX pierwsza warstwa narracji często idzie z polityki pieniężnej, nie tylko z samego wykresu.',
		};
	}
	if (worldRisk === 'high') {
		return {
			emphasis: 'broad_risk_off',
			lead: 'Zbiór świeżych nagłówków podnosi ogólny poziom niepewności na rynkach — warto czytać werdykt EDU przez ten filtr, nawet gdy kalendarz makro wygląda umiarkowanie.',
		};
	}

	return { emphasis: 'none', lead: null };
}

export type BuildWorldContextOptions = {
	windowHours: number;
	/** true = uwzględnij EDU-SEED (dev); false = tylko produkcyjne wpisy */
	includeDemo?: boolean;
};

/** Gdy `listNews` niedostępny lub błąd — neutralny blok bez wpływu na A/B/C. */
export function emptyDecisionWorldContext(windowHours: number): DecisionWorldContext {
	return {
		schemaVersion: 1,
		sources: [{ module: 'lib/news/store', method: 'listNews' }],
		windowHours,
		collectedAt: new Date().toISOString(),
		dominantTheme: 'Brak danych z feedu w tym przebiegu',
		worldRiskLevel: 'low',
		directionalPressure: 'neutral',
		keyWorldBullets: [],
		relatedEvents: [],
		freshness: 'stale',
		takeawayModifier: { emphasis: 'none', leadSentence: null },
		isEmpty: true,
	};
}

/**
 * Główny entry: pobiera newsy, filtruje pod asset, buduje `DecisionWorldContext`.
 */
export async function buildWorldContextForAsset(
	canonicalAsset: string,
	opts: BuildWorldContextOptions
): Promise<DecisionWorldContext> {
	const canonical = canonicalAsset.toUpperCase();
	const now = Date.now();
	const collectedAt = new Date().toISOString();
	const hours = Math.min(168, Math.max(12, opts.windowHours));

	const { items: pool } = await listNews({
		hours,
		includeDemo: opts.includeDemo,
	});

	const allCats = new Map<string, number>();
	for (const it of pool) {
		const c = it.category || 'Inne';
		allCats.set(c, (allCats.get(c) || 0) + 1);
	}

	const related: WorldRelatedEvent[] = [];
	for (const it of pool) {
		const row = itemToRelated(it, canonical, now);
		if (row) related.push(row);
	}
	related.sort((a, b) => b.relevanceScore - a.relevanceScore || a.ageHours - b.ageHours);

	const top = related.slice(0, 12);
	const top3 = top.slice(0, 3);

	const topScore = top[0]?.relevanceScore ?? 0;
	const hasGeoEnergy = top.some(
		(e) =>
			e.matchKinds.includes('keyword_geo') ||
			e.matchKinds.includes('keyword_energy') ||
			e.matchKinds.includes('category_geo')
	);
	const countStrong = top.filter((e) => e.relevanceScore >= 45).length;
	const worldRisk = riskLevelFrom(topScore, hasGeoEnergy, countStrong);

	const youngest = top.length ? Math.min(...top.map((e) => e.ageHours)) : null;
	const fresh = freshnessFrom(youngest);

	const dominantTheme = dominantThemeFrom(top, allCats);
	const pressure = aggregateSentiment(top);

	const { emphasis, lead } = pickEmphasis(canonical, top, worldRisk);

	const keyBullets = top3.map((e) => {
		const age =
			e.ageHours < 1 ? 'przed chwilą' : e.ageHours < 24 ? `~${Math.round(e.ageHours)}h temu` : `~${Math.round(e.ageHours / 24)} dni temu`;
		return `${e.title} (${age})`;
	});

	const isEmpty = pool.length === 0 || top.length === 0;

	return {
		schemaVersion: 1,
		sources: [{ module: 'lib/news/store', method: 'listNews' }],
		windowHours: hours,
		collectedAt,
		dominantTheme,
		worldRiskLevel: isEmpty ? 'low' : worldRisk,
		directionalPressure: isEmpty ? 'neutral' : pressure,
		keyWorldBullets: isEmpty ? [] : keyBullets,
		relatedEvents: top.slice(0, 8),
		freshness: isEmpty ? 'stale' : fresh,
		takeawayModifier: {
			emphasis: isEmpty ? 'none' : emphasis,
			leadSentence: isEmpty ? null : lead,
		},
		isEmpty,
	};
}
