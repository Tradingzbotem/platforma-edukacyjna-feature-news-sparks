// app/api/jobs/redakcja/generate/route.ts — Automatyczne generowanie artykułu dziennego dla Redakcji
import { NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/cronAuth';
import { slugify, articleInputSchema, parseTags } from '@/lib/redakcja/admin';
import { injectCoverMeta } from '@/lib/redakcja/content-utils';
import { getPrisma } from '@/lib/prisma';
// Import db side-effects to normalize env (DATABASE_URL -> POSTGRES_URL)
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureArticleTable, ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { createFallbackArticle } from '@/lib/redakcja/fallbackStore';
import { listFallbackMediaAssets, createFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
Jesteś redaktorem tworzącym edukacyjne artykuły o rynkach finansowych i ekonomii.

Zasady:
- Materiał musi być CZYSTO EDUKACYJNY — zero rekomendacji inwestycyjnych, zero porad tradingowych, zero sygnałów kup/sprzedaj
- Skup się na wyjaśnianiu konceptów, mechanizmów, procesów
- Używaj przykładów historycznych i teoretycznych, nie konkretnych rekomendacji
- Język: polski, profesjonalny ale przystępny
- Długość: 800-1200 słów
- Struktura: wprowadzenie, rozwinięcie (2-3 sekcje), podsumowanie

Format odpowiedzi (JSON):
{
  "title": "Tytuł artykułu (maksymalnie 80 znaków)",
  "content": "Treść w Markdown z nagłówkami ##, listami, akapitami. Na końcu dodaj obrazek z Unsplash używając: ![Opis obrazka](https://images.unsplash.com/photo-XXXXX?w=1200&h=600&fit=crop)",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5
}

WAŻNE: W treści markdown na początku dodaj meta cover image używając formatu:
<!-- cover: {"url": "https://images.unsplash.com/photo-XXXXX?w=1200&h=600&fit=crop", "alt": "Opis obrazka"} -->

`.trim();

async function getRecentArticleTopics(limit: number = 10): Promise<string[]> {
	const prisma = getPrisma();
	const topics: string[] = [];

	try {
		if (prisma) {
			const articles = await prisma.article.findMany({
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: { title: true, tags: true },
			});
			for (const art of articles) {
				if (art.title) topics.push(art.title.toLowerCase());
				if (Array.isArray(art.tags)) topics.push(...art.tags.map((t: string) => t.toLowerCase()));
			}
		} else if (isDatabaseConfigured()) {
			const { rows } = await sql<{ title: string; tags: string[] }>`
				SELECT title, tags FROM "Article" ORDER BY "createdAt" DESC LIMIT ${limit}
			`;
			for (const art of rows) {
				if (art.title) topics.push(art.title.toLowerCase());
				if (Array.isArray(art.tags)) topics.push(...art.tags.map((t: string) => t.toLowerCase()));
			}
		}
	} catch (e) {
		// Ignore errors
	}

	return topics;
}

function selectRandomTopic(recentTopics: string[], newsContext?: string): string {
	const allTopics = [
		'stopy procentowe i ich wpływ na rynki',
		'polityka monetarna banków centralnych',
		'relacja między inflacją a bezrobociem (krzywa Phillipsa)',
		'deficyt budżetowy i dług publiczny',
		'wymiana walutowa i kursy walutowe',
		'złoto jako aktywo bezpieczne (safe haven)',
		'ropa naftowa i czynniki wpływające na jej cenę',
		'obligacje skarbowe i rentowności',
		'akcje technologiczne vs wartościowe',
		'kryptowaluty i blockchain w kontekście finansów',
		'EUR/USD - główne czynniki wpływające na parę',
		'NASDAQ 100 - charakterystyka indeksu',
		'S&P 500 - jak czytać indeks',
		'DAX 40 - niemiecki indeks giełdowy',
		'poziomy wsparcia i oporu',
		'średnie kroczące (MA) - zastosowanie',
		'RSI - wskaźnik siły względnej',
		'MACD - interpretacja sygnałów',
		'formacje świecowe japońskie',
		'wolumen i jego znaczenie w analizie',
		'trendy i ich identyfikacja',
		'psychologia tradingu - emocje vs logika',
		'zarządzanie ryzykiem w tradingu',
		'pozycja sizing - jak dobrać wielkość pozycji',
		'stop loss i take profit - strategie',
		'dziennik tradingowy - jak prowadzić',
		'NFP (Non-Farm Payrolls) - co to jest i jak wpływa',
		'CPI (Consumer Price Index) - interpretacja danych',
		'PCE - alternatywny wskaźnik inflacji',
		'decyzje FOMC i ich wpływ na rynki',
		'decyzje EBC (Europejski Bank Centralny)',
		'GDP - produkt krajowy brutto',
		'fuzje i przejęcia (M&A) - jak wpływają na wyceny',
		'duże ruchy kursów akcji (gap up / gap down) - przyczyny i kontekst',
		'wyniki kwartalne spółek - jak je czytać',
		'ostrzeżenia o zyskach (profit warning) - co oznaczają',
		'IPO i debiuty giełdowe - ryzyka i szanse',
		'dywidendy i buybacki - wpływ na kurs akcji',
		'zmiany w indeksach (awans/spadek spółek) - konsekwencje rynkowe',
		'spółki wzrostowe vs wartościowe - różnice w cyklach',
		'sektorowe rotacje kapitału na giełdzie',
		'sektor energetyczny - trendy i wyzwania',
		'sektor technologiczny - cykle i trendy',
		'sektor finansowy - bankowość i ubezpieczenia',
		'rynki wschodzące vs rozwinięte',
		'geopolityka a rynki finansowe',
		'carry trade - strategia na różnicach stóp',
		'hedging - zabezpieczanie pozycji',
		'arbitraż - wykorzystywanie różnic cenowych',
		'lewarowanie - korzyści i ryzyka',
		'korelacje między aktywami',
	];

	if (newsContext) {
		const contextLower = newsContext.toLowerCase();
		const assetKeywords: Record<string, string[]> = {
			'złoto': ['złoto', 'gold', 'xau'],
			'ropa': ['ropa', 'oil', 'wti', 'brent'],
			'eurusd': ['eurusd', 'euro', 'dolar'],
			'nasdaq': ['nasdaq', 'nas100', 'tech'],
			'sp500': ['sp500', 's&p', 's&p 500'],
			'dax': ['dax', 'dax40', 'niemcy'],
			'btc': ['bitcoin', 'btc', 'krypto'],
		};

		for (const [asset, keywords] of Object.entries(assetKeywords)) {
			if (keywords.some(k => contextLower.includes(k))) {
				const assetTopics = allTopics.filter(t => t.toLowerCase().includes(asset));
				if (assetTopics.length > 0) {
					const selected = assetTopics[Math.floor(Math.random() * assetTopics.length)];
					if (!recentTopics.some(rt => selected.toLowerCase().includes(rt))) {
						return selected;
					}
				}
			}
		}

		if (contextLower.includes('nfp') || contextLower.includes('bezrobocie')) {
			const topic = 'NFP (Non-Farm Payrolls) - co to jest i jak wpływa';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('inflacja') || contextLower.includes('cpi')) {
			const topic = 'CPI (Consumer Price Index) - interpretacja danych';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('stop') && contextLower.includes('procent')) {
			const topic = 'stopy procentowe i ich wpływ na rynki';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('fuzj') || contextLower.includes('przeję')) {
			const topic = 'fuzje i przejęcia (M&A) - jak wpływają na wyceny';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('wyniki') || contextLower.includes('earnings')) {
			const topic = 'wyniki kwartalne spółek - jak je czytać';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('ipo') || contextLower.includes('debiut')) {
			const topic = 'IPO i debiuty giełdowe - ryzyka i szanse';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
		if (contextLower.includes('dywidend') || contextLower.includes('buyback')) {
			const topic = 'dywidendy i buybacki - wpływ na kurs akcji';
			if (!recentTopics.some(rt => topic.toLowerCase().includes(rt))) {
				return topic;
			}
		}
	}

	const availableTopics = allTopics.filter(topic => {
		const topicLower = topic.toLowerCase();
		return !recentTopics.some(rt => topicLower.includes(rt) || rt.includes(topicLower));
	});

	const topicsToChooseFrom = availableTopics.length > 0 ? availableTopics : allTopics;
	return topicsToChooseFrom[Math.floor(Math.random() * topicsToChooseFrom.length)];
}

async function generateArticleWithAI(apiKey: string, context?: string): Promise<{
	title: string;
	content: string;
	tags: string[];
	readingTime: number;
} | null> {
	const openai = new OpenAI({ apiKey });

	const today = new Date();
	const dateStr = today.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });

	const recentTopics = await getRecentArticleTopics(10);
	const selectedTopic = selectRandomTopic(recentTopics, context);

	const userPrompt = context
		? `Wygeneruj edukacyjny artykuł na dziś (${dateStr}) na temat: "${selectedTopic}".\n\nKontekst z aktualnych wydarzeń: ${context}\n\nPołącz temat z aktualną sytuacją na rynkach, jeśli to możliwe. Artykuł powinien być edukacyjny, bez rekomendacji inwestycyjnych. Wyjaśnij mechanizmy, koncepty i procesy związane z tym tematem. Jeśli temat dotyczy giełdy, możesz odnieść się do bieżących wydarzeń takich jak fuzje, przejęcia, wyniki spółek czy duże ruchy kursów — bez rekomendacji.`
		: `Wygeneruj edukacyjny artykuł na dziś (${dateStr}) na temat: "${selectedTopic}".\n\nArtykuł powinien być edukacyjny, bez rekomendacji inwestycyjnych. Wyjaśnij mechanizmy, koncepty i procesy związane z tym tematem. Użyj przykładów historycznych i teoretycznych. Jeśli temat dotyczy giełdy, możesz opisać zjawiska takie jak fuzje, przejęcia, wyniki spółek czy duże ruchy kursów — bez rekomendacji.`;

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			temperature: 0.9,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userPrompt },
			],
			max_tokens: 2000,
		});

		const content = completion.choices?.[0]?.message?.content;
		if (!content) return null;

		const parsed = JSON.parse(content);
		return {
			title: String(parsed.title || 'Artykuł edukacyjny').trim(),
			content: String(parsed.content || '').trim(),
			tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: any) => String(t).trim()).filter(Boolean) : ['edukacja'],
			readingTime: typeof parsed.readingTime === 'number' ? parsed.readingTime : 5,
		};
	} catch (e: any) {
		console.error('OpenAI error:', e?.message);
		return null;
	}
}

async function generateImageWithDALLE(apiKey: string, title: string, tags: string[]): Promise<{ url: string; alt: string } | null> {
	const openai = new OpenAI({ apiKey });
	
	// Stwórz prompt dla DALL-E na podstawie tytułu i tagów
	const tagStr = tags.slice(0, 2).join(', ');
	const prompt = `Professional, modern illustration for an educational article about finance and economics. Title: "${title}". Theme: ${tagStr || 'finance education'}. Style: clean, minimalist, professional, suitable for a financial education platform. No text, no charts, just a conceptual illustration.`;
	
	try {
		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt: prompt,
			size: '1792x1024',
			quality: 'standard',
			n: 1,
		});

		const imageUrl = response.data[0]?.url;
		if (!imageUrl) return null;

		// Pobierz obraz i zapisz do biblioteki mediów
		try {
			const imageResponse = await fetch(imageUrl);
			if (!imageResponse.ok) {
				console.error('Failed to fetch DALL-E image:', imageResponse.status);
				return { url: imageUrl, alt: title }; // Fallback do bezpośredniego URL z DALL-E
			}
			
			const imageBuffer = await imageResponse.arrayBuffer();
			
			// ZAWSZE zapisz do biblioteki mediów przed użyciem
			const saved = await saveImageToMediaLibrary(imageBuffer, title, `AI-generated image for: ${title}`);
			if (saved) {
				console.log('DALL-E image saved to media library:', saved.url);
				return { url: saved.url, alt: saved.alt || title };
			} else {
				console.error('Failed to save DALL-E image to media library');
				return { url: imageUrl, alt: title }; // Fallback do bezpośredniego URL z DALL-E
			}
		} catch (e: any) {
			console.error('Error saving DALL-E image to library:', e?.message);
			return { url: imageUrl, alt: title }; // Fallback do bezpośredniego URL z DALL-E
		}
	} catch (e: any) {
		console.error('DALL-E generation error:', e?.message);
		return null;
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
		(process.env as any).VERCEL_BLOB_RW_TOKEN ||
		(process.env as any).BLOB_TOKEN ||
		'';
	const baseDir = path.join(process.cwd(), '.data', 'media');
	
	try {
		// Prisma path - zawsze próbuj zapisać
		if (prisma) {
			try {
				const genId = (globalThis as any).crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}`;
				
				if (blobToken) {
					// Produkcja: użyj Vercel Blob Storage
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
					// Dev: lokalny storage (nie działa w produkcji serverless)
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
			} catch (e: any) {
				console.error('Prisma save error:', e?.message);
				// Fall through to SQL path
			}
		}

		// Direct Neon SQL path
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				const genId = (globalThis as any).crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}`;
				let url: string;
				let pathname: string | null = null;
				
				if (blobToken) {
					// Produkcja: Vercel Blob Storage
					const { put } = await import('@vercel/blob');
					const filename = `${genId}.png`;
					const uploaded = await put(`redakcja/${filename}`, buffer, { access: 'public', token: blobToken });
					url = uploaded.url;
					console.log('Image saved to Vercel Blob (SQL path):', url);
				} else {
					// Dev: lokalny storage
					const filename = `${genId}.png`;
					const filePath = path.join(baseDir, filename);
					fs.mkdirSync(baseDir, { recursive: true });
					fs.writeFileSync(filePath, buffer);
					url = `/api/redakcja/media/file/${genId}`;
					pathname = filePath;
					console.log('Image saved locally (SQL path):', url);
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
			} catch (e: any) {
				console.error('SQL save error:', e?.message);
				// Fall through to fallback
			}
		}

		// Fallback: file store
		try {
			const genId = (globalThis as any).crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}`;
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
		} catch (e: any) {
			console.error('Fallback save error:', e?.message);
		}
	} catch (e: any) {
		console.error('Save image error:', e?.message);
	}

	return null;
}

async function getRandomMediaImage(): Promise<{ url: string; alt: string | null } | null> {
	const prisma = getPrisma();
	try { await ensureMediaAssetTable(); } catch {}

	// Try Prisma first
	if (prisma) {
		try {
			const count = await prisma.mediaAsset.count({
				where: { isArchived: false },
			});
			if (count === 0) return null;
			
			const skip = Math.floor(Math.random() * count);
			const item = await prisma.mediaAsset.findFirst({
				where: { isArchived: false },
				skip,
				orderBy: { createdAt: 'desc' },
			});
			if (item) {
				return { url: item.url, alt: item.alt };
			}
		} catch (e: any) {
			// Connection errors -> fall through to SQL
			const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
			if (!connectionErrors.has(e?.code)) {
				console.error('Prisma error fetching media:', e?.message);
			}
		}
	}

	// Direct Neon SQL
	if (isDatabaseConfigured()) {
		try {
			const { rows: countRows } = await sql<{ count: number }>`
				SELECT COUNT(*)::int as count FROM "MediaAsset" WHERE "isArchived" = FALSE
			`;
			const count = countRows[0]?.count || 0;
			if (count === 0) {
				// Fall through to fallback store
			} else {
				const skip = Math.floor(Math.random() * count);
				const { rows } = await sql<{
					url: string;
					alt: string | null;
				}>`
					SELECT url, alt
					FROM "MediaAsset"
					WHERE "isArchived" = FALSE
					ORDER BY "createdAt" DESC
					LIMIT 1
					OFFSET ${skip}
				`;
				if (rows[0]) {
					return { url: rows[0].url, alt: rows[0].alt };
				}
			}
		} catch (e: any) {
			console.error('SQL error fetching media:', e?.message);
		}
	}

	// Fallback: file store
	try {
		const items = await listFallbackMediaAssets({ isArchived: false, limit: 100 });
		if (items.length > 0) {
			const randomItem = items[Math.floor(Math.random() * items.length)];
			return { url: randomItem.url, alt: randomItem.alt };
		}
	} catch (e: any) {
		console.error('Fallback store error:', e?.message);
	}

	return null;
}

async function getUnsplashImage(query: string): Promise<string> {
	// Fallback do Unsplash Source API (nie wymaga klucza API)
	// Używamy prostego URL z parametrami
	const safeQuery = encodeURIComponent(query);
	return `https://source.unsplash.com/1200x600/?${safeQuery}`;
}

function normalizeInput(data: any) {
	const n: any = { ...(data || {}) };
	n.readingTime = typeof n.readingTime === 'string' && n.readingTime.trim() === '' ? null : n.readingTime;
	return n;
}

async function createArticleInternal(
	articleData: {
		title: string;
		content: string;
		tags: string[];
		readingTime: number;
	},
	apiKey?: string
): Promise<{ ok: boolean; article?: any; error?: string }> {
	const prisma = getPrisma();
	try { await ensureArticleTable(); } catch {}

	// Dodaj cover image jeśli nie ma w treści
	let finalContent = articleData.content;
	if (!finalContent.includes('<!-- cover:')) {
		// 1. Najpierw spróbuj wygenerować obraz przez DALL-E i zapisać do biblioteki mediów
		const dalleImage = apiKey ? await generateImageWithDALLE(apiKey, articleData.title, articleData.tags) : null;
		if (dalleImage && dalleImage.url) {
			// Upewnij się, że URL jest z biblioteki mediów, nie bezpośredni z DALL-E
			finalContent = injectCoverMeta(finalContent, {
				url: dalleImage.url,
				alt: dalleImage.alt,
			});
			console.log('Using DALL-E generated image from media library:', dalleImage.url);
		} else {
			// 2. Fallback: losowe zdjęcie z biblioteki mediów admina
			const mediaImage = await getRandomMediaImage();
			if (mediaImage && mediaImage.url) {
				finalContent = injectCoverMeta(finalContent, {
					url: mediaImage.url,
					alt: mediaImage.alt || articleData.title,
				});
				console.log('Using random image from media library:', mediaImage.url);
			} else {
				// 3. Ostatni fallback: Unsplash (tylko jeśli brak innych opcji)
				const imageQuery = articleData.tags[0] || 'finance';
				const imageUrl = await getUnsplashImage(imageQuery);
				finalContent = injectCoverMeta(finalContent, {
					url: imageUrl,
					alt: articleData.title,
				});
				console.log('Using Unsplash fallback:', imageUrl);
			}
		}
	}

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

	// Try DB with Prisma first if available
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
			revalidatePath('/redakcja');
			revalidatePath(`/redakcja/${created.slug}`);
			return { ok: true, article: created };
		} catch (e: any) {
			// Unique constraint
			if (e?.code === 'P2002') {
				return { ok: false, error: 'SLUG_EXISTS' };
			}
			// Connection issues -> allow fallback
			const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
			if (!connectionErrors.has(e?.code)) {
				return { ok: false, error: e?.message || 'Prisma error' };
			}
		}
	}

	// Direct Neon SQL when Prisma client isn't available but env is configured
	if (isDatabaseConfigured()) {
		try {
			const id = (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
				revalidatePath('/redakcja');
				revalidatePath(`/redakcja/${created.slug}`);
				return { ok: true, article: created };
			}
		} catch (e: any) {
			const message = e?.message || 'Neon SQL insert failed';
			const code = e?.code || e?.originalError?.code || 'SQL_ERROR';
			if (code === '23505' || /duplicate key value.*Article_slug_key/i.test(String(message))) {
				return { ok: false, error: 'SLUG_EXISTS' };
			}
			return { ok: false, error: message };
		}
	}

	// Fallback: save locally
	try {
		const createdFallback = await createFallbackArticle({ ...parsed, tags });
		revalidatePath('/redakcja');
		revalidatePath(`/redakcja/${createdFallback.slug}`);
		return { ok: true, article: createdFallback };
	} catch (e: any) {
		return { ok: false, error: e?.message || 'Failed to save article' };
	}
}

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

	try {
		// Opcjonalnie: pobierz kontekst z aktualnych wiadomości
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
					context = `Najnowsze wiadomości: ${items.slice(0, 3).map((i: any) => i.title).join('; ')}`;
				}
			}
		} catch {
			// Ignore news fetch errors
		}

		// Generuj artykuł
		const articleData = await generateArticleWithAI(apiKey, context);
		if (!articleData) {
			return NextResponse.json(
				{ ok: false, error: 'Failed to generate article content' },
				{ status: 500 }
			);
		}

		// Utwórz artykuł bezpośrednio (bez potrzeby autoryzacji admin)
		const result = await createArticleInternal(articleData, apiKey);
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
		});
	} catch (e: any) {
		console.error('Generate article error:', e);
		return NextResponse.json(
			{ ok: false, error: e?.message || 'Unknown error' },
			{ status: 500 }
		);
	}
}
