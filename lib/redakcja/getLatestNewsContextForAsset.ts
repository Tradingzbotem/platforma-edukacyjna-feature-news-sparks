import 'server-only';

import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';
import { instrumentTagMatchesCanonical } from '@/lib/decision-engine/newsInstrumentMatch';
import { ensureArticleTable } from '@/lib/redakcja/ensureDb';
import { NEWS_FACTS_MARKER_START } from '@/lib/redakcja/newsFactsMarkers';
import { parseNewsEventFactsMarkdown, type ParsedNewsEventFacts } from '@/lib/redakcja/parseNewsEventFactsMarkdown';
import type { RedakcjaNewsContextDto } from '@/lib/redakcja/redakcjaNewsContextTypes';
import {
	passesRedakcjaNewsScoreThreshold,
	scoreRedakcjaArticleForAsset,
	type RedakcjaArticleScoreResult,
} from '@/lib/redakcja/scoreRedakcjaArticleForAsset';
import { splitNewsFactsAppendix } from '@/lib/redakcja/splitNewsFactsAppendix';

const DEFAULT_SCAN_LIMIT = 50;

export type RedakcjaNewsPickDebug = {
	score: number;
	matchKind: 'direct' | 'macro' | 'backdrop';
	breakdown: RedakcjaArticleScoreResult['breakdown'];
	articleSlug: string;
};

function formatImpactLine(row: { symbol: string; direction?: string; effect: string }): string {
	const dir = row.direction ? ` (${row.direction})` : '';
	return `${row.symbol}${dir}: ${row.effect}`;
}

function pickImpactSentence(canonical: string, facts: ParsedNewsEventFacts): string | null {
	for (const row of facts.impacts) {
		if (instrumentTagMatchesCanonical(canonical, row.symbol)) {
			return formatImpactLine(row);
		}
	}
	if (facts.observations.length > 0) {
		return facts.observations[0];
	}
	return null;
}

function coerceNumberishField(s: string | undefined): string | number | null {
	if (!s || !String(s).trim()) return null;
	const t = String(s).trim();
	if (/^-?\d+(\.\d+)?$/.test(t)) {
		const n = Number(t);
		if (!Number.isNaN(n)) return n;
	}
	return t;
}

type ArticleRow = {
	slug: string;
	title: string;
	content: string;
	createdAt: Date;
};

async function fetchArticlesWithNewsFactsMarker(limit: number): Promise<ArticleRow[]> {
	if (!isDatabaseConfigured()) return [];
	try {
		await ensureArticleTable();
		const needle = `%${NEWS_FACTS_MARKER_START}%`;
		const { rows } = await sql<{
			slug: string;
			title: string;
			content: string;
			createdAt: Date;
		}>`
      SELECT slug, title, content, "createdAt"
      FROM "Article"
      WHERE content LIKE ${needle}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
		return rows.map((r) => ({
			slug: r.slug,
			title: r.title,
			content: r.content,
			createdAt: r.createdAt,
		}));
	} catch (e: unknown) {
		const code = (e as { code?: string })?.code;
		if (code === '42P01') return [];
		console.error('getLatestNewsContextForAsset: query failed', e);
		return [];
	}
}

export type GetLatestNewsContextResult = {
	context: RedakcjaNewsContextDto | null;
	pickDebug: RedakcjaNewsPickDebug | null;
};

/**
 * Najlepszy artykuł Redakcji z appendixem news facts wg scoringu v1 (direct / macro / backdrop).
 * Parametr: kanoniczny identyfikator jak w `DecisionBlockV1.asset` (np. US100, XAUUSD).
 */
export async function getLatestNewsContextForAsset(
	canonicalAsset: string,
	opts?: { scanLimit?: number }
): Promise<GetLatestNewsContextResult> {
	const canonical = String(canonicalAsset || '').trim().toUpperCase();
	if (!canonical) return { context: null, pickDebug: null };

	const limit = Math.min(80, Math.max(20, opts?.scanLimit ?? DEFAULT_SCAN_LIMIT));
	const articles = await fetchArticlesWithNewsFactsMarker(limit);
	if (!articles.length) return { context: null, pickDebug: null };

	const nowMs = Date.now();
	type Cand = { article: ArticleRow; facts: ParsedNewsEventFacts; scored: RedakcjaArticleScoreResult };
	const candidates: Cand[] = [];

	for (const article of articles) {
		const { factsMarkdown } = splitNewsFactsAppendix(article.content);
		if (!factsMarkdown) continue;
		const facts = parseNewsEventFactsMarkdown(factsMarkdown);
		if (!facts) continue;

		const scored = scoreRedakcjaArticleForAsset(facts, canonical, article.createdAt, nowMs);
		if (!passesRedakcjaNewsScoreThreshold(scored.score, scored.breakdown)) continue;
		if (scored.matchKind == null) continue;

		candidates.push({ article, facts, scored });
	}

	if (!candidates.length) return { context: null, pickDebug: null };

	candidates.sort((a, b) => {
		const ds = b.scored.score - a.scored.score;
		if (ds !== 0) return ds;
		return b.article.createdAt.getTime() - a.article.createdAt.getTime();
	});

	const best = candidates[0]!;
	const { article, facts, scored } = best;
	const matchKind = scored.matchKind!;

	const context: RedakcjaNewsContextDto = {
		articleSlug: article.slug,
		articleTitle: article.title.trim() || facts.title.trim(),
		eventTitle: facts.title.trim(),
		impactSentence: pickImpactSentence(canonical, facts),
		sentiment: facts.sentiment?.trim() || null,
		impact: coerceNumberishField(facts.impact),
		timeEdge: coerceNumberishField(facts.timeEdge),
		matchKind,
	};

	const pickDebug: RedakcjaNewsPickDebug = {
		score: scored.score,
		matchKind,
		breakdown: scored.breakdown,
		articleSlug: article.slug,
	};

	return { context, pickDebug };
}
