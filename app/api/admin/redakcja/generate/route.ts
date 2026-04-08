// app/api/admin/redakcja/generate/route.ts — Ręczne generowanie artykułu przez admina
import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import {
	generateEditorialArticleWithOpenAI,
	generateLegacyRandomEditorialArticle,
	type EditorialArticleOpenAIInput,
} from '@/lib/redakcja/editorialArticleGeneration';
import {
	editorialImageDebugForApiResponse,
	persistEditorialArticle,
} from '@/lib/redakcja/editorialArticlePersistence';
import { runEditorialGenerationFromNewsId } from '@/lib/redakcja/runEditorialGenerationFromNews';

export const runtime = 'nodejs';
export const maxDuration = 60; // Limit dla Pro plan (można zwiększyć do 300s w ustawieniach Vercel projektu)

function parseStringListField(v: unknown): string[] | undefined {
	if (Array.isArray(v)) {
		const out = v.map((x) => String(x).trim()).filter(Boolean);
		return out.length ? out : undefined;
	}
	if (typeof v === 'string' && v.trim()) {
		const out = v
			.split(/[,;\n]/)
			.map((s) => s.trim())
			.filter(Boolean);
		return out.length ? out : undefined;
	}
	return undefined;
}

export async function POST(request: Request) {
	try {
		const isAdmin = await getIsAdmin();
		if (!isAdmin) {
			return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
		}

		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ ok: false, error: 'OPENAI_API_KEY missing' },
				{ status: 500 }
			);
		}

		const ct = request.headers.get('content-type') || '';
		let body: Record<string, unknown> = {};
		if (ct.includes('application/json')) {
			try {
				const raw = await request.json();
				if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
					body = raw as Record<string, unknown>;
				}
			} catch {
				// ignore
			}
		}

		const newsIdRaw = body.newsId;
		const newsId = typeof newsIdRaw === 'string' && newsIdRaw.trim() ? newsIdRaw.trim() : undefined;

		if (newsId) {
			if (!isDatabaseConfigured()) {
				return NextResponse.json(
					{ ok: false, error: 'Database not configured — cannot load news' },
					{ status: 503 }
				);
			}

			const resultNews = await runEditorialGenerationFromNewsId(apiKey, newsId);
			if (!resultNews.ok) {
				if (resultNews.error === 'NEWS_NOT_FOUND') {
					return NextResponse.json(
						{ ok: false, error: 'NEWS_NOT_FOUND', message: 'Nie znaleziono newsa o podanym id' },
						{ status: 404 }
					);
				}
				return NextResponse.json(
					{ ok: false, error: resultNews.error, details: resultNews.details },
					{ status: 500 }
				);
			}

			return NextResponse.json({
				ok: true,
				article: resultNews.article,
				title: resultNews.title,
				imagePersisted: resultNews.imagePersisted,
				imageDebug: editorialImageDebugForApiResponse(resultNews.imageDebug),
			});
		}

		const sourceType = typeof body.sourceType === 'string' ? body.sourceType.trim() : '';
		if (sourceType === 'manual_topic') {
			const title = String(body.topic ?? body.title ?? '').trim();
			if (!title) {
				return NextResponse.json(
					{
						ok: false,
						error: 'MISSING_TITLE',
						message: 'Podaj temat (pole title lub topic).',
					},
					{ status: 400 }
				);
			}
			const manualInput: EditorialArticleOpenAIInput = {
				sourceType: 'manual_topic',
				title,
				summary: typeof body.summary === 'string' ? body.summary.trim() || undefined : undefined,
				instruments: parseStringListField(body.instruments ?? body.tickers),
				impact: typeof body.impact === 'string' ? body.impact.trim() || undefined : undefined,
				whyItMatters: typeof body.whyItMatters === 'string' ? body.whyItMatters.trim() || undefined : undefined,
				possibleMarketImpact:
					typeof body.possibleMarketImpact === 'string'
						? body.possibleMarketImpact.trim() || undefined
						: undefined,
				context: typeof body.context === 'string' ? body.context.trim() || undefined : undefined,
				manualHints: typeof body.manualHints === 'string' ? body.manualHints.trim() || undefined : undefined,
				watch: parseStringListField(body.watch),
			};
			const genMan = await generateEditorialArticleWithOpenAI(apiKey, manualInput);
			if (!genMan.ok) {
				return NextResponse.json(
					{ ok: false, error: genMan.error, details: genMan.details },
					{ status: 500 }
				);
			}
			const articleManual = genMan.data;
			const resultMan = await persistEditorialArticle(
				{
					...articleManual,
					...(manualInput.summary?.trim()
						? { imagePromptContext: { summary: manualInput.summary.trim() } }
						: {}),
				},
				apiKey,
				{ articleOrigin: 'manual_topic' }
			);
			if (!resultMan.ok) {
				return NextResponse.json(
					{ ok: false, error: resultMan.error || 'Failed to create article' },
					{ status: 500 }
				);
			}
			return NextResponse.json({
				ok: true,
				article: resultMan.article,
				title: articleManual.title,
				imagePersisted: resultMan.imagePersisted,
				imageDebug: editorialImageDebugForApiResponse(resultMan.imageDebug),
			});
		}

		if (ct.includes('application/json') && Object.keys(body).length > 0) {
			return NextResponse.json(
				{
					ok: false,
					error: 'INVALID_BODY',
					message: 'Użyj newsId (z newsa) albo sourceType: "manual_topic" z polem title/topic.',
				},
				{ status: 400 }
			);
		}

		const origin = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
			(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

		let context: string | undefined;
		try {
			const newsRes = await fetch(`${origin}/api/news/articles?bucket=24h&lang=pl&limit=5`, {
				cache: 'no-store',
			}).catch(() => null);
			if (newsRes?.ok) {
				const newsData = await newsRes.json().catch(() => ({}));
				const items = Array.isArray(newsData?.items) ? newsData.items : [];
				if (items.length > 0) {
					context = `Najnowsze wiadomości: ${items.slice(0, 3).map((i: { title?: string }) => i.title).join('; ')}`;
				}
			}
		} catch {
			// Ignore news fetch errors
		}

		const genResult = await generateLegacyRandomEditorialArticle(apiKey, context);
		if (!genResult.ok) {
			return NextResponse.json(
				{ ok: false, error: genResult.error, details: genResult.details },
				{ status: 500 }
			);
		}
		const articleData = genResult.data;

		const result = await persistEditorialArticle(articleData, apiKey, { articleOrigin: 'legacy_random' });
		if (!result.ok) {
			return NextResponse.json(
				{ ok: false, error: result.error || 'Failed to create article' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			ok: true,
			article: result.article,
			title: articleData.title,
			imagePersisted: result.imagePersisted,
			imageDebug: editorialImageDebugForApiResponse(result.imageDebug),
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		console.error('Generate article error:', e);
		return NextResponse.json(
			{ ok: false, error: msg },
			{ status: 500 }
		);
	}
}
