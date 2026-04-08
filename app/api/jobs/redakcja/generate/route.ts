// app/api/jobs/redakcja/generate/route.ts — Automatyczne generowanie artykułu Redakcji (ten sam pipeline co admin/news)
import { NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/cronAuth';
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import { editorialImageDebugForApiResponse } from '@/lib/redakcja/editorialArticlePersistence';
import { runEditorialGenerationFromNewsId } from '@/lib/redakcja/runEditorialGenerationFromNews';
import { selectNewsItemIdForCronEditorial } from '@/lib/redakcja/selectNewsItemForCronEditorial';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
	const denied = requireCronSecret(request);
	if (denied) return denied;

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ ok: false, error: 'OPENAI_API_KEY missing' },
			{ status: 500 }
		);
	}

	if (!isDatabaseConfigured()) {
		return NextResponse.json(
			{ ok: false, error: 'Database not configured — cannot pick news' },
			{ status: 503 }
		);
	}

	try {
		const newsId = await selectNewsItemIdForCronEditorial();
		if (!newsId) {
			return NextResponse.json(
				{
					ok: false,
					error: 'NO_ELIGIBLE_NEWS',
					message: 'Brak news_items do wyboru lub wszystkie mają już powiązany artykuł (heurystyka URL w treści).',
				},
				{ status: 404 }
			);
		}

		const result = await runEditorialGenerationFromNewsId(apiKey, newsId);
		if (!result.ok) {
			return NextResponse.json(
				{ ok: false, error: result.error, details: result.details, newsId },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			ok: true,
			newsId,
			article: result.article,
			title: result.title,
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
