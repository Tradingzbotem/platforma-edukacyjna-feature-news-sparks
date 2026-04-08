import type { ParsedNewsEventFacts } from '@/lib/redakcja/parseNewsEventFactsMarkdown';
import { getRedakcjaNewsScoringRules } from '@/lib/redakcja/redakcjaNewsScoringConfig';
import { instrumentTagMatchesCanonical, newsTagToCanonicalKey } from '@/lib/decision-engine/newsInstrumentMatch';

export type RedakcjaScoreBreakdown = {
	direct: number;
	macro: number;
	backdrop: number;
	impact: number;
	timeEdge: number;
	freshness: number;
};

export type RedakcjaArticleScoreResult = {
	score: number;
	matchKind: 'direct' | 'macro' | 'backdrop' | null;
	breakdown: RedakcjaScoreBreakdown;
};

function normTag(raw: string): string {
	return String(raw || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '');
}

function collectTagsFromFacts(facts: ParsedNewsEventFacts): string[] {
	const out: string[] = [];
	for (const ins of facts.instruments) {
		const t = normTag(ins);
		if (t) out.push(t);
	}
	for (const row of facts.impacts) {
		const t = normTag(row.symbol);
		if (t) out.push(t);
	}
	return out;
}

function scoreDirect(canonical: string, facts: ParsedNewsEventFacts, rules: ReturnType<typeof getRedakcjaNewsScoringRules>): number {
	const familySet = new Set(rules.directFamilyTags.map((x) => normTag(x)));
	let hasExact = false;
	let hasFamily = false;

	for (const tag of collectTagsFromFacts(facts)) {
		const k = newsTagToCanonicalKey(tag);
		if (k && k === canonical) {
			hasExact = true;
			break;
		}
	}
	if (hasExact) return 45;

	for (const tag of collectTagsFromFacts(facts)) {
		const k = newsTagToCanonicalKey(tag);
		if (k && k === canonical) continue;
		if (instrumentTagMatchesCanonical(canonical, tag)) {
			hasFamily = true;
			break;
		}
		if (familySet.has(tag)) {
			hasFamily = true;
			break;
		}
	}

	return hasFamily ? 28 : 0;
}

function buildScoringBlob(facts: ParsedNewsEventFacts): string {
	const parts = [
		facts.title,
		facts.category,
		...facts.observations,
		...facts.impacts.map((r) => `${r.symbol} ${r.direction ?? ''} ${r.effect}`),
		...facts.instruments,
	];
	return parts
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

function blobMatchesKeyword(blob: string, kw: string): boolean {
	const k = kw.toLowerCase().trim();
	if (!k) return false;
	if (k.includes(' ')) return blob.includes(k);
	// pojedynczy token: prosta granica „słowa” (litery PL + cyfry)
	const re = new RegExp(`(^|[^a-z0-9ąćęłńóśźż])${escapeRegExp(k)}([^a-z0-9ąćęłńóśźż]|$)`, 'i');
	return re.test(blob);
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scoreMacro(blob: string, rules: ReturnType<typeof getRedakcjaNewsScoringRules>): number {
	for (const kw of rules.macroKeywords) {
		if (blobMatchesKeyword(blob, kw)) return 22;
	}
	return 0;
}

function scoreBackdrop(blob: string, facts: ParsedNewsEventFacts, rules: ReturnType<typeof getRedakcjaNewsScoringRules>): number {
	const cat = String(facts.category || '').toLowerCase();
	if (cat === 'geo' || cat === 'surowce') return 12;

	const sent = String(facts.sentiment || '').toLowerCase();
	if (sent === 'positive' || sent === 'negative' || sent === 'pozytywny' || sent === 'negatywny') return 12;

	for (const kw of rules.backdropKeywords) {
		if (blobMatchesKeyword(blob, kw)) return 12;
	}
	return 0;
}

function parseNumericField(s: string | undefined): number | null {
	if (!s || !String(s).trim()) return null;
	const t = String(s).trim();
	if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
	const n = Number(t);
	return Number.isNaN(n) ? null : n;
}

function scoreImpactComponent(facts: ParsedNewsEventFacts): number {
	const n = parseNumericField(facts.impact);
	if (n == null) return 0;
	const clamped = Math.min(5, Math.max(0, n));
	return Math.min(10, 2 * clamped);
}

function scoreTimeEdgeComponent(facts: ParsedNewsEventFacts): number {
	const n = parseNumericField(facts.timeEdge);
	if (n == null) return 0;
	const clamped = Math.min(8, Math.max(0, n));
	return Math.min(8, clamped);
}

function scoreFreshness(articleCreatedAt: Date, nowMs: number): number {
	const ageH = Math.max(0, (nowMs - articleCreatedAt.getTime()) / 3600000);
	if (ageH <= 12) return 8;
	if (ageH <= 36) return 4;
	return 0;
}

function deriveMatchKind(b: RedakcjaScoreBreakdown): 'direct' | 'macro' | 'backdrop' | null {
	if (b.direct >= 28) return 'direct';
	if (b.macro >= 22) return 'macro';
	if (b.backdrop >= 12) return 'backdrop';
	return null;
}

export function passesRedakcjaNewsScoreThreshold(score: number, b: RedakcjaScoreBreakdown): boolean {
	if (score < 40) return false;
	if (b.direct >= 28) return true;
	if (b.macro >= 22) return true;
	if (b.backdrop >= 12 && score >= 45) return true;
	return false;
}

/**
 * Punktacja pojedynczego artykułu (appendix już sparsowany) względem kanonicznego assetu.
 */
export function scoreRedakcjaArticleForAsset(
	facts: ParsedNewsEventFacts,
	canonicalAsset: string,
	articleCreatedAt: Date,
	nowMs: number = Date.now()
): RedakcjaArticleScoreResult {
	const canonical = String(canonicalAsset || '').trim().toUpperCase();
	const rules = getRedakcjaNewsScoringRules(canonical);
	const blob = buildScoringBlob(facts);

	const direct = scoreDirect(canonical, facts, rules);
	const macro = scoreMacro(blob, rules);
	const backdrop = scoreBackdrop(blob, facts, rules);
	const impact = scoreImpactComponent(facts);
	const timeEdge = scoreTimeEdgeComponent(facts);
	const freshness = scoreFreshness(articleCreatedAt, nowMs);

	const breakdown: RedakcjaScoreBreakdown = {
		direct,
		macro,
		backdrop,
		impact,
		timeEdge,
		freshness,
	};

	const score = direct + macro + backdrop + impact + timeEdge + freshness;
	const matchKind = deriveMatchKind(breakdown);

	return { score, breakdown, matchKind };
}
