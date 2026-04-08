/**
 * Wspólna persystencja artykułu Redakcji po wygenerowaniu treści (cover + zapis DB).
 * Używana przez admin route i job cron.
 */
import { slugify, articleInputSchema, parseTags } from '@/lib/redakcja/admin';
import { injectCoverMeta, removeCoverMeta } from '@/lib/redakcja/content-utils';
import { getPrisma } from '@/lib/prisma';
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureArticleTable, ensureMediaAssetTable, ensureMediaAssetBlobTable } from '@/lib/redakcja/ensureDb';
import { createFallbackArticle } from '@/lib/redakcja/fallbackStore';
import { listFallbackMediaAssets, createFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import type { EditorialArticleData } from '@/lib/redakcja/editorialArticleGeneration';
import {
	buildEditorialImagePrompt,
	mapNewsCategoryToEditorialImageCategory,
	resolveEditorialCoverImageCategory,
	type EditorialCoverImageCategory,
} from '@/lib/redakcja/editorialCoverImagePrompt';

const COVER_META_SNIPPET = '<!-- cover:';

/** Źródło okładki zapisane do logów / `imageDebug` (twarde, bez zgadywania). */
export type EditorialCoverImageSource =
	| 'dalle_saved'
	| 'dalle_url_only'
	| 'existing_cover_meta_removed_then_dalle'
	/** Dopasowany obraz z biblioteki po markerze / słowach kluczowych kategorii / tagach (nigdy losowo). */
	| 'category_fallback'
	/** Jedna stała okładka zastępcza (ENV lub ustalony URL), gdy brak dopasowania w bibliotece. */
	| 'editorial_default_fallback'
	| 'no_image';

export type EditorialArticleImageDebug = {
	source: EditorialCoverImageSource;
	dallEAttempted: boolean;
	dallEUrlReturned: boolean;
	mediaSaved: boolean;
	promptPreview: string;
	/** Pełny prompt (logi serwera); w JSON API można pominąć lub skrócić */
	promptFull?: string;
	title: string;
	articleOrigin: 'news' | 'manual_topic' | 'legacy_random' | 'unknown';
	coverMetaWasInContent: boolean;
	coverMetaRemoved: boolean;
	skippedNewCoverBecauseContentStillHadMeta?: boolean;
	imagePromptContextSummary?: string;
	imagePromptContextCategory?: string;
	newsCategoryRaw?: string | null;
	dalleErrorMessage?: string;
};

export type PersistEditorialArticleOptions = {
	articleOrigin?: EditorialArticleImageDebug['articleOrigin'];
	/** Surowa kategoria z news enrich (tylko ścieżka news). */
	newsCategoryRaw?: string | null;
};

/** Odpowiedź HTTP / klient — bez `promptFull` (pełny prompt tylko w logach serwera). */
export function editorialImageDebugForApiResponse(
	debug: EditorialArticleImageDebug
): Omit<EditorialArticleImageDebug, 'promptFull'> {
	const { promptFull: _p, ...rest } = debug;
	return rest;
}

export type PersistEditorialArticleResult =
	| { ok: true; article: unknown; imagePersisted: boolean; imageDebug: EditorialArticleImageDebug }
	| { ok: false; error: string };

const PROMPT_PREVIEW_MAX = 600;

type DalleAttemptResult = {
	image: { url: string; alt: string; persisted: boolean } | null;
	prompt: string;
	attempted: boolean;
	urlReturned: boolean;
	mediaSaved: boolean;
	errorMessage?: string;
};

async function generateImageWithDALLE(
	apiKey: string,
	args: {
		title: string;
		tags: string[];
		summary?: string;
		category?: EditorialCoverImageCategory;
	}
): Promise<DalleAttemptResult> {
	const openai = new OpenAI({ apiKey });
	const { title, tags } = args;

	const prompt = buildEditorialImagePrompt({
		title,
		tags,
		summary: args.summary,
		category: args.category,
		variant: 'primary',
	});

	const baseDebug = {
		prompt,
		attempted: true as const,
		urlReturned: false as boolean,
		mediaSaved: false as boolean,
		errorMessage: undefined as string | undefined,
	};

	try {
		const timeoutId = setTimeout(() => {
			console.warn('DALL-E generation taking too long, will timeout soon');
		}, 25000);

		let response: Awaited<ReturnType<typeof openai.images.generate>>;
		try {
			response = await Promise.race([
				openai.images.generate({
					model: 'dall-e-3',
					prompt: prompt,
					size: '1792x1024',
					quality: 'standard',
					n: 1,
				}),
				new Promise<never>((_, reject) => {
					setTimeout(() => reject(new Error('DALL-E generation timeout after 30s')), 30000);
				}),
			]);
			clearTimeout(timeoutId);
		} catch (timeoutError: unknown) {
			clearTimeout(timeoutId);
			const msg = timeoutError instanceof Error ? timeoutError.message : '';
			if (msg.includes('timeout')) {
				console.warn('DALL-E generation timeout after 30s, using fallback');
				return {
					image: null,
					...baseDebug,
					errorMessage: 'timeout_after_30s',
				};
			}
			const errMsg = timeoutError instanceof Error ? timeoutError.message : String(timeoutError);
			console.error('DALL-E generation error:', errMsg);
			return {
				image: null,
				...baseDebug,
				errorMessage: errMsg.slice(0, 500),
			};
		}

		const imageUrl = response.data?.[0]?.url;
		if (!imageUrl) {
			return {
				image: null,
				...baseDebug,
				errorMessage: 'empty_url_in_response',
			};
		}

		try {
			const fetchController = new AbortController();
			const fetchTimeout = setTimeout(() => fetchController.abort(), 8000);

			let imageResponse: Response;
			try {
				imageResponse = await fetch(imageUrl, { signal: fetchController.signal });
				clearTimeout(fetchTimeout);
			} catch (fetchError: unknown) {
				clearTimeout(fetchTimeout);
				if (fetchError instanceof Error && fetchError.name === 'AbortError') {
					console.error('Failed to fetch DALL-E image: timeout');
					return {
						image: { url: imageUrl, alt: title, persisted: false },
						...baseDebug,
						urlReturned: true,
						mediaSaved: false,
						errorMessage: 'fetch_image_timeout',
					};
				}
				throw fetchError;
			}

			if (!imageResponse.ok) {
				console.error('Failed to fetch DALL-E image:', imageResponse.status);
				return {
					image: { url: imageUrl, alt: title, persisted: false },
					...baseDebug,
					urlReturned: true,
					mediaSaved: false,
					errorMessage: `fetch_status_${imageResponse.status}`,
				};
			}

			const imageBuffer = await imageResponse.arrayBuffer();

			const saved = await saveImageToMediaLibrary(imageBuffer, title, `AI-generated image for: ${title}`);
			if (saved) {
				console.log('DALL-E image saved to media library:', saved.url);
				return {
					image: { url: saved.url, alt: saved.alt || title, persisted: true },
					...baseDebug,
					urlReturned: true,
					mediaSaved: true,
				};
			} else {
				console.error('Failed to save DALL-E image to media library');
				return {
					image: { url: imageUrl, alt: title, persisted: false },
					...baseDebug,
					urlReturned: true,
					mediaSaved: false,
					errorMessage: 'save_to_media_library_failed',
				};
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			console.error('Error saving DALL-E image to library:', msg);
			return {
				image: { url: imageUrl, alt: title, persisted: false },
				...baseDebug,
				urlReturned: true,
				mediaSaved: false,
				errorMessage: msg.slice(0, 500),
			};
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('DALL-E generation error:', msg);
		return {
			image: null,
			...baseDebug,
			errorMessage: msg.slice(0, 500),
		};
	}
}

async function saveImageToMediaLibrary(
	imageBuffer: ArrayBuffer,
	alt: string,
	notes?: string
): Promise<{ url: string; alt: string | null } | null> {
	const prisma = getPrisma();
	const buffer = Buffer.from(imageBuffer);
	const size = buffer.byteLength;
	const blobToken =
		process.env.BLOB_READ_WRITE_TOKEN ||
		(process.env as Record<string, string | undefined>).VERCEL_BLOB_RW_TOKEN ||
		(process.env as Record<string, string | undefined>).BLOB_TOKEN ||
		'';
	const baseDir = path.join(process.cwd(), '.data', 'media');

	try {
		if (prisma) {
			try {
				if (blobToken) {
					const { put } = await import('@vercel/blob');
					const created = await prisma.mediaAsset.create({
						data: { url: '', alt, notes: notes || null, contentType: 'image/png', size, isArchived: false },
					});
					const filename = `${created.id}.png`;
					const uploaded = await put(`redakcja/${filename}`, buffer, { access: 'public', token: blobToken });
					await prisma.mediaAsset.update({
						where: { id: created.id },
						data: { url: uploaded.url },
					});
					console.log('Image saved to Vercel Blob:', uploaded.url);
					return { url: uploaded.url, alt };
				} else {
					const created = await prisma.mediaAsset.create({
						data: { url: '', alt, notes: notes || null, contentType: 'image/png', size, isArchived: false },
					});
					const filename = `${created.id}.png`;
					const filePath = path.join(baseDir, filename);
					fs.mkdirSync(baseDir, { recursive: true });
					fs.writeFileSync(filePath, buffer);
					const url = `/api/redakcja/media/file/${created.id}`;
					await prisma.mediaAsset.update({
						where: { id: created.id },
						data: { url, pathname: filePath },
					});
					console.log('Image saved locally:', url);
					return { url, alt };
				}
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
				console.error('Prisma save error:', msg);
			}
		}

		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				await ensureMediaAssetBlobTable();
				const genId = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.() ??
					`m_${Date.now().toString(36)}`;
				let url: string;
				let pathname: string | null = null;

				if (blobToken) {
					try {
						const { put } = await import('@vercel/blob');
						const filename = `${genId}.png`;
						const uploaded = await put(`redakcja/${filename}`, buffer, { access: 'public', token: blobToken });
						url = uploaded.url;
						pathname = null;
						console.log('Image saved to Vercel Blob (SQL path):', url);
					} catch {
						const dataHex = buffer.toString('hex');
						await sql`
							INSERT INTO "MediaAssetBlob" (id, data, "createdAt", "updatedAt")
							VALUES (${genId}, decode(${dataHex}, 'hex'), NOW(), NOW())
							ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
						`;
						url = `/api/redakcja/media/file/${genId}`;
						pathname = null;
						console.log('Image saved to DB blob (fallback from Vercel):', url);
					}
				} else {
					const dataHex = buffer.toString('hex');
					await sql`
						INSERT INTO "MediaAssetBlob" (id, data, "createdAt", "updatedAt")
						VALUES (${genId}, decode(${dataHex}, 'hex'), NOW(), NOW())
						ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
					`;
					url = `/api/redakcja/media/file/${genId}`;
					pathname = null;
					console.log('Image saved to DB blob (SQL path):', url);
				}

				await sql`
					INSERT INTO "MediaAsset" (id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt")
					VALUES (
						${genId},
						${url},
						${pathname},
						'image/png',
						${size},
						${alt},
						${notes || null},
						FALSE,
						NOW(),
						NOW()
					)
				`;
				return { url, alt };
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
				console.error('SQL save error:', msg);
			}
		}

		try {
			const genId = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.() ??
				`m_${Date.now().toString(36)}`;
			const filename = `${genId}.png`;
			const filePath = path.join(baseDir, filename);
			fs.mkdirSync(baseDir, { recursive: true });
			fs.writeFileSync(filePath, buffer);
			const url = `/api/redakcja/media/file/${genId}`;
			await createFallbackMediaAsset({
				id: genId,
				url,
				pathname: filePath,
				contentType: 'image/png',
				size,
				alt,
				notes: notes || null,
				isArchived: false,
			});
			console.log('Image saved to fallback store:', url);
			return { url, alt };
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			console.error('Fallback save error:', msg);
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('Save image error:', msg);
	}

	return null;
}

type EditorialMediaRow = { url: string; alt: string | null; notes: string | null };

const EDITORIAL_COVER_TAG_STOPWORDS = new Set([
	'edukacja',
	'education',
	'news',
	'redakcja',
	'wiadomosci',
	'wiadomości',
]);

/** Słowa do dopasowania `alt` / `notes` do kategorii obrazu redakcyjnego (kolejność = pierwszeństwo kategorii w pętli). */
const CATEGORY_MEDIA_KEYWORDS: Record<EditorialCoverImageCategory, string[]> = {
	forex: ['forex', 'fx', 'walut', 'currency', 'dolar', 'dollar', 'eur', 'jpy'],
	giełda: ['giełda', 'gielda', 'stock', 'equities', 'equity', 'nasdaq', 'nyse', 'indeks', 'ipo', 'akcje'],
	surowce: ['surowce', 'commodity', 'commodities', 'ropa', 'oil', 'brent', 'wti', 'gold', 'złot', 'zlota', 'metal', 'kopal'],
	makro: ['makro', 'macro', 'central bank', 'bank centraln', 'fed', 'ecb', 'rpp', 'cpi', 'inflac', 'stopy', 'rates'],
	wiadomości: ['newsroom', 'briefing', 'press', 'prasow', 'editorial', 'redakcja-cover', 'financial district'],
};

function rowHaystack(row: EditorialMediaRow): string {
	return `${row.alt ?? ''} ${row.notes ?? ''}`.toLowerCase();
}

function fallbackMarkersForCategory(cat: EditorialCoverImageCategory): string[] {
	const m = [`redakcja-fallback:${cat}`, `editorial-fallback:${cat}`];
	if (cat === 'giełda') {
		m.push('redakcja-fallback:gielda', 'editorial-fallback:gielda');
	}
	return m;
}

/**
 * Ostatnie assety z biblioteki (deterministycznie: od najnowszych), bez losowania.
 * Używane wyłącznie do dopasowania po notatkach / alt — nie jako „random cover”.
 */
async function listRecentMediaAssetsForEditorialFallback(limit: number): Promise<EditorialMediaRow[]> {
	const seen = new Set<string>();
	const out: EditorialMediaRow[] = [];
	const push = (r: EditorialMediaRow) => {
		if (!r.url || seen.has(r.url)) return;
		seen.add(r.url);
		out.push(r);
	};

	try {
		await ensureMediaAssetTable();
	} catch {
		/* ignore */
	}

	const prisma = getPrisma();
	if (prisma) {
		try {
			const items = await prisma.mediaAsset.findMany({
				where: { isArchived: false },
				orderBy: { createdAt: 'desc' },
				take: limit,
				select: { url: true, alt: true, notes: true },
			});
			for (const it of items) {
				push({ url: it.url, alt: it.alt, notes: it.notes });
			}
		} catch (e: unknown) {
			const code = (e as { code?: string })?.code;
			const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
			if (!connectionErrors.has(code ?? '')) {
				const msg = e instanceof Error ? e.message : String(e);
				console.error('Prisma error listing media for editorial fallback:', msg);
			}
		}
	}

	if (out.length < limit && isDatabaseConfigured()) {
		try {
			const cap = limit - out.length;
			const { rows } = await sql<{ url: string; alt: string | null; notes: string | null }>`
				SELECT url, alt, notes
				FROM "MediaAsset"
				WHERE "isArchived" = FALSE
				ORDER BY "createdAt" DESC
				LIMIT ${cap}
			`;
			for (const row of rows) {
				push({ url: row.url, alt: row.alt, notes: row.notes });
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			console.error('SQL error listing media for editorial fallback:', msg);
		}
	}

	try {
		const items = await listFallbackMediaAssets({ isArchived: false, limit: Math.min(200, limit) });
		for (const it of items) {
			push({ url: it.url, alt: it.alt, notes: it.notes });
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('Fallback store error listing media:', msg);
	}

	return out.slice(0, limit);
}

/**
 * Pierwszy asset pasujący do reguł (najnowsze pierwsze). Brak losowania.
 * 1) `notes` / `alt` zawiera `redakcja-fallback:{kategoria}` lub `editorial-fallback:{kategoria}`
 * 2) słowa kluczowe dla kolejnych kategorii (wyliczonych z artykułu + opcjonalnie news)
 * 3) tagi artykułu (bez stopwords, dł. ≥ 3) występują w `alt`/`notes`
 */
async function findThematicEditorialCoverFromLibrary(
	resolvedCategory: EditorialCoverImageCategory,
	articleTags: string[],
	newsCategoryRaw: string | null
): Promise<EditorialMediaRow | null> {
	const rows = await listRecentMediaAssetsForEditorialFallback(450);
	if (rows.length === 0) return null;

	const categoryOrder: EditorialCoverImageCategory[] = [resolvedCategory];
	const newsMapped = newsCategoryRaw?.trim()
		? mapNewsCategoryToEditorialImageCategory(newsCategoryRaw.trim())
		: null;
	if (newsMapped && newsMapped !== resolvedCategory) {
		categoryOrder.push(newsMapped);
	}

	for (const cat of categoryOrder) {
		const markers = fallbackMarkersForCategory(cat);
		for (const row of rows) {
			const h = rowHaystack(row);
			if (markers.some((m) => h.includes(m.toLowerCase()))) {
				return row;
			}
		}
	}

	for (const cat of categoryOrder) {
		const words = CATEGORY_MEDIA_KEYWORDS[cat];
		for (const row of rows) {
			const h = rowHaystack(row);
			if (words.some((w) => w.length >= 2 && h.includes(w.toLowerCase()))) {
				return row;
			}
		}
	}

	const tagSet = articleTags
		.map((t) => t.toLowerCase().trim())
		.filter((t) => t.length >= 3 && !EDITORIAL_COVER_TAG_STOPWORDS.has(t));

	for (const row of rows) {
		const h = rowHaystack(row);
		if (tagSet.some((t) => h.includes(t))) {
			return row;
		}
	}

	return null;
}

/**
 * Jedna neutralna okładka zastępcza — brak losowania. Ustaw `EDITORIAL_DEFAULT_COVER_URL` w produkcji.
 */
function getDefaultEditorialCoverUrl(): string {
	const fromEnv = process.env.EDITORIAL_DEFAULT_COVER_URL?.trim();
	if (fromEnv) return fromEnv;
	/* Stały, nielosowy URL (Unsplash — konkretne zdjęcie), do czasu wgrania własnego pliku / CDN. */
	return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&q=80';
}

function isOurHostedCoverUrl(url: string): boolean {
	if (!url) return false;
	if (url.startsWith('/')) return true;
	const u = url.toLowerCase();
	if (u.includes('blob.vercel-storage.com')) return true;
	if (u.includes('oaidalleapiprodscus.blob.core.windows.net')) return true;
	return false;
}

function normalizeInput(data: Record<string, unknown>) {
	const n: Record<string, unknown> = { ...data };
	const rt = n.readingTime;
	n.readingTime = typeof rt === 'string' && rt.trim() === '' ? null : rt;
	return n;
}

function truncatePrompt(p: string): string {
	if (p.length <= PROMPT_PREVIEW_MAX) return p;
	return `${p.slice(0, PROMPT_PREVIEW_MAX)}…`;
}

/**
 * Zapisuje wygenerowany artykuł (markdown + cover) do bazy / fallbacku.
 */
export async function persistEditorialArticle(
	articleData: EditorialArticleData,
	apiKey?: string,
	options?: PersistEditorialArticleOptions
): Promise<PersistEditorialArticleResult> {
	const prisma = getPrisma();
	try {
		await ensureArticleTable();
	} catch {
		/* ignore */
	}

	const origin = options?.articleOrigin ?? 'unknown';
	const rawContent = articleData.content;
	const coverMetaWasInContent = rawContent.includes(COVER_META_SNIPPET);
	const coverMetaRemoved = Boolean(apiKey && coverMetaWasInContent);
	const ctx = articleData.imagePromptContext;

	let finalContent = apiKey ? removeCoverMeta(articleData.content) : articleData.content;
	let imagePersisted = true;

	let imageDebug: EditorialArticleImageDebug = {
		source: 'no_image',
		dallEAttempted: false,
		dallEUrlReturned: false,
		mediaSaved: false,
		promptPreview: '',
		title: articleData.title,
		articleOrigin: origin,
		coverMetaWasInContent,
		coverMetaRemoved,
		imagePromptContextSummary: ctx?.summary,
		imagePromptContextCategory: ctx?.category,
		newsCategoryRaw: options?.newsCategoryRaw ?? null,
	};

	const stillHasCoverMetaAfterStrip = finalContent.includes(COVER_META_SNIPPET);

	if (stillHasCoverMetaAfterStrip) {
		imageDebug.skippedNewCoverBecauseContentStillHadMeta = true;
		imageDebug.source = 'no_image';
		imageDebug.promptPreview =
			'(no new image pipeline — <!-- cover: still present after removeCoverMeta; artykuł zachowuje istniejącą meta)';
		console.log(
			JSON.stringify({
				tag: '[editorial-cover]',
				phase: 'skip',
				reason: 'cover_meta_still_present_after_strip',
				title: articleData.title,
				articleOrigin: origin,
				coverMetaWasInContent,
				coverMetaRemoved,
			})
		);
	} else if (!finalContent.includes('<!-- cover:')) {
		let dalleAttempt: DalleAttemptResult | null = null;
		if (apiKey) {
			dalleAttempt = await generateImageWithDALLE(apiKey, {
				title: articleData.title,
				tags: articleData.tags,
				summary: ctx?.summary,
				category: ctx?.category,
			});
			imageDebug = {
				...imageDebug,
				dallEAttempted: dalleAttempt.attempted,
				dallEUrlReturned: dalleAttempt.urlReturned,
				mediaSaved: dalleAttempt.mediaSaved,
				promptFull: dalleAttempt.prompt,
				promptPreview: truncatePrompt(dalleAttempt.prompt),
				dalleErrorMessage: dalleAttempt.errorMessage,
			};
		} else {
			imageDebug.promptPreview = '(brak OPENAI_API_KEY / apiKey — DALL·E nie wywołane)';
		}

		const dalleImage = dalleAttempt?.image;
		if (dalleImage?.url) {
			finalContent = injectCoverMeta(finalContent, {
				url: dalleImage.url,
				alt: dalleImage.alt,
			});
			imagePersisted = dalleImage.persisted;
			if (coverMetaRemoved) {
				imageDebug.source = 'existing_cover_meta_removed_then_dalle';
			} else {
				imageDebug.source = dalleImage.persisted ? 'dalle_saved' : 'dalle_url_only';
			}
			console.log('Using DALL-E generated image from media library:', dalleImage.url);
		} else {
			const summaryText = ctx?.summary ?? '';
			const textBlob = [articleData.title, summaryText, ...articleData.tags].filter(Boolean).join(' ');
			const resolvedCategory =
				ctx?.category ?? resolveEditorialCoverImageCategory(articleData.tags, textBlob);

			const thematic = await findThematicEditorialCoverFromLibrary(
				resolvedCategory,
				articleData.tags,
				options?.newsCategoryRaw ?? null
			);

			if (thematic?.url) {
				finalContent = injectCoverMeta(finalContent, {
					url: thematic.url,
					alt: thematic.alt || articleData.title,
				});
				imagePersisted = isOurHostedCoverUrl(thematic.url);
				imageDebug.source = 'category_fallback';
				imageDebug.mediaSaved = imagePersisted;
				console.log('Using thematic media library match for editorial cover:', thematic.url);
			} else {
				const defaultUrl = getDefaultEditorialCoverUrl();
				finalContent = injectCoverMeta(finalContent, {
					url: defaultUrl,
					alt: articleData.title,
				});
				imagePersisted = isOurHostedCoverUrl(defaultUrl);
				imageDebug.source = 'editorial_default_fallback';
				imageDebug.mediaSaved = imagePersisted;
				console.log('Using default editorial cover fallback:', defaultUrl);
			}
		}
	}

	console.log(
		JSON.stringify({
			tag: '[editorial-cover]',
			phase: 'resolved',
			title: articleData.title,
			articleOrigin: origin,
			source: imageDebug.source,
			dallEAttempted: imageDebug.dallEAttempted,
			dallEUrlReturned: imageDebug.dallEUrlReturned,
			mediaSaved: imageDebug.mediaSaved,
			promptFull: imageDebug.promptFull ?? null,
			promptPreview: imageDebug.promptPreview,
			coverMetaWasInContent: imageDebug.coverMetaWasInContent,
			coverMetaRemoved: imageDebug.coverMetaRemoved,
			stillHasCoverMetaAfterStrip,
			skippedNewCoverBecauseContentStillHadMeta: imageDebug.skippedNewCoverBecauseContentStillHadMeta ?? false,
			imagePromptContextSummary: imageDebug.imagePromptContextSummary ?? null,
			imagePromptContextCategory: imageDebug.imagePromptContextCategory ?? null,
			newsCategoryRaw: imageDebug.newsCategoryRaw ?? null,
			dalleErrorMessage: imageDebug.dalleErrorMessage ?? null,
		})
	);

	const data = normalizeInput({
		title: articleData.title,
		slug: slugify(articleData.title) + '-' + Date.now().toString().slice(-6),
		content: finalContent,
		tags: articleData.tags.join(', '),
		readingTime: articleData.readingTime,
	});

	const parsed = articleInputSchema.parse({
		...data,
		slug: data?.slug ? String(data.slug) : slugify(String(data?.title || '')),
	});
	const tags = parseTags(parsed.tags);

	if (prisma) {
		try {
			const created = await prisma.article.create({
				data: {
					title: parsed.title,
					slug: parsed.slug,
					content: parsed.content,
					readingTime: parsed.readingTime ?? null,
					tags,
				},
			});
			console.log('Article created via Prisma:', created.id, created.slug);
			revalidatePath('/redakcja');
			revalidatePath(`/redakcja/${created.slug}`);
			revalidatePath('/admin/redakcja');
			return { ok: true, article: created, imagePersisted, imageDebug };
		} catch (e: unknown) {
			const code = (e as { code?: string })?.code;
			const msg = e instanceof Error ? e.message : String(e);
			console.error('Prisma create error:', code, msg);
			if (code === 'P2002') {
				return { ok: false, error: 'SLUG_EXISTS' };
			}
			const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
			if (!connectionErrors.has(code ?? '')) {
				return { ok: false, error: msg || 'Prisma error' };
			}
		}
	}

	if (isDatabaseConfigured()) {
		try {
			console.log('Attempting to create article via Neon SQL...');
			const id =
				(globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.() ??
				`${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const tagsJson = JSON.stringify(tags ?? []);
			const { rows } = await sql<{
				id: string;
				slug: string;
				title: string;
				content: string;
				readingTime: number | null;
				tags: string[];
				createdAt: Date;
				updatedAt: Date;
			}>`
          INSERT INTO "Article" (id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt")
          VALUES (
            ${id},
            ${parsed.slug},
            ${parsed.title},
            ${parsed.content},
            ${parsed.readingTime ?? null},
            ARRAY(SELECT json_array_elements_text(${tagsJson}::json)),
            NOW(),
            NOW()
          )
          RETURNING id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt"
        `;
			const created = rows[0];
			if (created) {
				console.log('Article created via Neon SQL:', created.id, created.slug);
				revalidatePath('/redakcja');
				revalidatePath(`/redakcja/${created.slug}`);
				revalidatePath('/admin/redakcja');
				return { ok: true, article: created, imagePersisted, imageDebug };
			} else {
				console.warn('Neon SQL insert returned no rows');
			}
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Neon SQL insert failed';
			const code = (e as { code?: string })?.code || (e as { originalError?: { code?: string } })?.originalError?.code || 'SQL_ERROR';
			console.error('Neon SQL create error:', code, message);
			if (code === '23505' || /duplicate key value.*Article_slug_key/i.test(String(message))) {
				return { ok: false, error: 'SLUG_EXISTS' };
			}
			return { ok: false, error: message };
		}
	} else {
		console.warn('Database not configured, will use fallback store');
	}

	try {
		const createdFallback = await createFallbackArticle({ ...parsed, tags });
		revalidatePath('/redakcja');
		revalidatePath(`/redakcja/${createdFallback.slug}`);
		revalidatePath('/admin/redakcja');
		return { ok: true, article: createdFallback, imagePersisted, imageDebug };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Failed to save article';
		return { ok: false, error: msg };
	}
}
