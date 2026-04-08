// lib/brief/morningManualTopicPrompt.ts — ręczny driver briefingu (payload + bloki promptu)
import { inferMorningBriefCanonicalKeysOrdered } from '@/lib/brief/morningBriefAssetCanonical';
import type { BriefingLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import type { LiveNewsContextItem } from '@/lib/brief/liveNewsContext';
import { MORNING_BRIEF_MARKET_SYMBOLS, type MorningBriefCanonicalKey } from '@/lib/brief/morningBriefMarketSymbols';

export type MorningBriefNarrativeHorizon = 'today' | '2-3_days' | 'weekly';

export type MorningBriefManualDriverMode = 'manual_only' | 'manual_plus_live_context' | 'auto';

const CANONICAL_SET = new Set<string>(Object.keys(MORNING_BRIEF_MARKET_SYMBOLS));

export type ParsedManualPrimaryDriver =
	| { active: false }
	| {
			active: true;
			mode: 'manual_only' | 'manual_plus_live_context';
			horizon: MorningBriefNarrativeHorizon;
			themeTitle: string;
			narrativeContext: string;
			assetKeys: MorningBriefCanonicalKey[];
	  };

export function parseManualAssetKeysCsv(raw: string, max: number): MorningBriefCanonicalKey[] {
	const parts = raw.split(/[,;]+/).map((s) => s.trim().toUpperCase().replace(/\s+/g, ''));
	const out: MorningBriefCanonicalKey[] = [];
	const seen = new Set<string>();
	for (const p of parts) {
		if (!p || seen.has(p)) continue;
		if (CANONICAL_SET.has(p)) {
			seen.add(p);
			out.push(p as MorningBriefCanonicalKey);
			if (out.length >= max) break;
		}
	}
	return out;
}

function resolveAssetKeys(themeTitle: string, narrativeContext: string, csv: string, max: number): MorningBriefCanonicalKey[] {
	let keys = parseManualAssetKeysCsv(csv, max);
	if (!keys.length) {
		keys = inferMorningBriefCanonicalKeysOrdered(`${themeTitle}\n${narrativeContext}`).slice(0, max);
	}
	if (!keys.length) {
		keys = ['US500', 'VIX'];
	}
	return keys.slice(0, max);
}

/**
 * Aktywne tylko gdy `useManualTheme === true` oraz tryb ≠ auto.
 */
export function parseManualPrimaryDriverFromRequestBody(body: unknown, maxAssets: number): ParsedManualPrimaryDriver {
	if (!body || typeof body !== 'object') return { active: false };
	const o = body as Record<string, unknown>;
	const useManual = o.useManualTheme === true;
	const modeRaw = typeof o.manualNarrativeMode === 'string' ? o.manualNarrativeMode.toLowerCase().trim() : 'auto';
	const mode: MorningBriefManualDriverMode =
		modeRaw === 'manual_only'
			? 'manual_only'
			: modeRaw === 'manual_plus_live_context'
				? 'manual_plus_live_context'
				: 'auto';

	if (!useManual || mode === 'auto') {
		return { active: false };
	}

	const themeTitle = typeof o.manualThemeTitle === 'string' ? o.manualThemeTitle.trim() : '';
	const narrativeContext = typeof o.manualNarrativeContext === 'string' ? o.manualNarrativeContext.trim() : '';
	const assetsCsv = typeof o.manualRelatedAssets === 'string' ? o.manualRelatedAssets : '';
	const horizonRaw = typeof o.narrativeHorizon === 'string' ? o.narrativeHorizon.toLowerCase().trim() : 'today';
	const horizon: MorningBriefNarrativeHorizon =
		horizonRaw === 'weekly'
			? 'weekly'
			: horizonRaw === '2-3_days' || horizonRaw === '2_3_days'
				? '2-3_days'
				: 'today';

	const assetKeys = resolveAssetKeys(themeTitle, narrativeContext, assetsCsv, maxAssets);

	return {
		active: true,
		mode,
		horizon,
		themeTitle,
		narrativeContext,
		assetKeys,
	};
}

function horizonEnglishLine(h: MorningBriefNarrativeHorizon): string {
	switch (h) {
		case 'today':
			return 'Narrative horizon: TODAY / current session (day-ahead).';
		case '2-3_days':
			return 'Narrative horizon: next 2–3 trading sessions (near-term path).';
		case 'weekly':
			return 'Narrative horizon: WEEK-AHEAD — still a single-driver note, not a multi-theme weekly roundup.';
		default:
			return 'Narrative horizon: TODAY.';
	}
}

/** Eksportowane linie RSS (jak w clusterze) — indeks od 0. */
export function formatSupportingLiveNewsLines(items: LiveNewsContextItem[]): string[] {
	return items.map((it, i) => {
		const extra = it.summary && it.summary !== it.title ? ` — ${it.summary}` : '';
		const meta: string[] = [`[${it.source}]`];
		const cats = it.categories?.length ? `[${it.categories.join('+')}]` : '';
		if (cats) meta.push(cats);
		if (it.publishedAt) meta.push(it.publishedAt);
		if (it.url) meta.push(it.url);
		return `${i + 1}. ${it.title}${extra}\n   ${meta.join(' · ')}`;
	});
}

export function buildSupportingLiveHeadlinesBlock(lang: BriefingLanguage, items: LiveNewsContextItem[]): string {
	const lines = formatSupportingLiveNewsLines(items);
	if (lang === 'en') {
		return [
			'=== SUPPORTING LIVE HEADLINES (SECONDARY — confirmation / nuance ONLY) ===',
			'These must NOT replace or compete with the OPERATOR PRIMARY DRIVER. At most 1–2 may be referenced if they clearly align.',
			'',
			lines.length ? lines.join('\n') : '(none)',
		].join('\n');
	}
	if (lang === 'cs') {
		return [
			'=== PODPŮRNÉ ŽIVÉ TITULKY (DRUHOTNÉ — jen potvrzení / nuance) ===',
			'NESMÍ nahradit ani konkurovat OPERATOR PRIMARY DRIVER. Odkazuj maximálně na 1–2, pokud jasně sedí.',
			'',
			lines.length ? lines.join('\n') : '(žádné)',
		].join('\n');
	}
	return [
		'=== WSPIERAJĄCE NAGŁÓWKI LIVE (DRUGORZĘDNE — tylko potwierdzenie / doprecyzowanie) ===',
		'NIE WOLNO nimi zastąpić ani zagłuszyć OPERATOR PRIMARY DRIVER. Możesz użyć co najwyżej 1–2 linii, jeśli wyraźnie pasują.',
		'',
		lines.length ? lines.join('\n') : '(brak)',
	].join('\n');
}

export function buildOperatorPrimaryDriverBlock(
	lang: BriefingLanguage,
	params: {
		themeTitle: string;
		narrativeContext: string;
		horizon: MorningBriefNarrativeHorizon;
		mode: 'manual_only' | 'manual_plus_live_context';
	},
): string {
	const hLine = horizonEnglishLine(params.horizon);
	const ctx = params.narrativeContext || '(no extra operator notes)';

	const modeEn =
		params.mode === 'manual_only'
			? 'manual_only — RSS is NOT used as a thematic source in this run; develop the briefing ONLY from this operator block + MARKET SNAPSHOT.'
			: 'manual_plus_live_context — operator theme is SUPREME; any RSS block is SUPPORTING only (confirm / nuance), never a new main driver.';

	if (lang === 'en') {
		return [
			'=== OPERATOR PRIMARY DRIVER (LOCKED — DO NOT CHANGE THE MAIN THEME) ===',
			`Primary theme (fixed): ${params.themeTitle}`,
			`Operator narrative / context: ${ctx}`,
			hLine,
			`Mode: ${modeEn}`,
			'',
			'HARD RULES:',
			'- You MUST expand exactly this primary theme for the stated horizon. Do not pivot to a different market story.',
			'- Do not let secondary headlines introduce a competing dominant driver.',
			'- Ground specifics in: this block + MARKET SNAPSHOT + (if provided) SUPPORTING headlines only — no invented events.',
		].join('\n');
	}
	if (lang === 'cs') {
		return [
			'=== OPERATOR PRIMARY DRIVER (UZAMČENO — NEMĚŇ HLAVNÍ TÉMA) ===',
			`Hlavní téma (pevné): ${params.themeTitle}`,
			`Kontext / narrace operátora: ${ctx}`,
			hLine,
			`Režim: ${modeEn}`,
			'',
			'TVRDÁ PRAVIDLA:',
			'- Rozviň přesně toto téma pro daný horizont. Nepřepínej na jiný příběh trhu.',
			'- Sekundární titulky nesmí zavést konkurenční hlavní driver.',
			'- Opři se o: tento blok + MARKET SNAPSHOT + (pokud jsou) PODPŮRNÉ titulky — žádné vymyšlené události.',
		].join('\n');
	}
	return [
		'=== OPERATOR PRIMARY DRIVER (ZABLOKOWANE — NIE ZMIENIAJ GŁÓWNEGO TEMATU) ===',
		`Temat główny (stały): ${params.themeTitle}`,
		`Kontekst / narracja operatora: ${ctx}`,
		hLine,
		`Tryb: ${modeEn}`,
		'',
		'TWARDA ZASADA:',
		'- Rozwiń dokładnie ten temat dla podanego horyzontu. Nie zmieniaj drivera na inną historię rynku.',
		'- Nagłówki drugorzędne nie wolno wprowadzić konkurencyjnego dominującego wątku.',
		'- Kotwicz fakty w: tym bloku + MARKET SNAPSHOT + (jeśli są) WSPARCIU RSS — bez zmyślonych wydarzeń.',
	].join('\n');
}

export const MANUAL_DRIVER_SYSTEM_ADDON = `
MANUAL PRIMARY DRIVER (when the user message contains "OPERATOR PRIMARY DRIVER"):
- The operator-defined primary theme is the ONLY dominant driver for the entire JSON briefing. Never substitute another theme from RSS or generic macro filler.
- Stay on that single thread for the horizon the operator states.
- If "SUPPORTING LIVE HEADLINES" appear, they are strictly secondary: nuance or corroborate only — they must not hijack the narrative.
`.trim();
