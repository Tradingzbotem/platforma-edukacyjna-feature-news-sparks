/**
 * Pełny pipeline: news → OpenAI (jak przycisk admin/news) → persist (cover + DB).
 */
import type { AdminNewsItemRecord } from '@/lib/news/adminNewsItem';
import { getAdminNewsItemById } from '@/lib/news/adminNewsItem';
import {
	adminNewsItemToEditorialInput,
	generateEditorialArticleWithOpenAI,
	strFromUnknown,
} from '@/lib/redakcja/editorialArticleGeneration';
import { mapNewsCategoryToEditorialImageCategory } from '@/lib/redakcja/editorialCoverImagePrompt';
import {
	type EditorialArticleImageDebug,
	persistEditorialArticle,
} from '@/lib/redakcja/editorialArticlePersistence';

export type RunEditorialFromNewsResult =
	| { ok: true; article: unknown; imagePersisted: boolean; title: string; imageDebug: EditorialArticleImageDebug }
	| { ok: false; error: string; details?: unknown };

export async function runEditorialGenerationFromNewsItem(
	apiKey: string,
	newsItem: AdminNewsItemRecord
): Promise<RunEditorialFromNewsResult> {
	const editorialInput = adminNewsItemToEditorialInput(newsItem);
	const gen = await generateEditorialArticleWithOpenAI(apiKey, editorialInput, {
		appendNewsFactsFrom: newsItem,
	});
	if (!gen.ok) {
		return { ok: false, error: gen.error, details: gen.details };
	}

	const newsCatRaw = strFromUnknown(newsItem.enriched?.category);
	const imageCategory = newsCatRaw ? mapNewsCategoryToEditorialImageCategory(newsCatRaw) : null;

	const imagePromptContext =
		editorialInput.summary || imageCategory
			? {
					...(editorialInput.summary ? { summary: editorialInput.summary } : {}),
					...(imageCategory ? { category: imageCategory } : {}),
				}
			: undefined;

	const persisted = await persistEditorialArticle(
		imagePromptContext ? { ...gen.data, imagePromptContext } : gen.data,
		apiKey,
		{ articleOrigin: 'news', newsCategoryRaw: newsCatRaw || null }
	);
	if (!persisted.ok) {
		return { ok: false, error: persisted.error };
	}

	return {
		ok: true,
		article: persisted.article,
		imagePersisted: persisted.imagePersisted,
		title: gen.data.title,
		imageDebug: persisted.imageDebug,
	};
}

export async function runEditorialGenerationFromNewsId(
	apiKey: string,
	newsId: string
): Promise<RunEditorialFromNewsResult> {
	const trimmed = String(newsId || '').trim();
	if (!trimmed) {
		return { ok: false, error: 'MISSING_NEWS_ID' };
	}
	const newsItem = await getAdminNewsItemById(trimmed);
	if (!newsItem) {
		return { ok: false, error: 'NEWS_NOT_FOUND' };
	}
	return runEditorialGenerationFromNewsItem(apiKey, newsItem);
}
