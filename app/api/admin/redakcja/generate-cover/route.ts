import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
// Import db side-effects to normalize env (DATABASE_URL -> POSTGRES_URL)
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetBlobTable, ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { createFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { sql } from '@vercel/postgres';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60; // DALL-E może zająć trochę czasu

function isContentFilterBlock(err: any): boolean {
	const msg = String(err?.message || '');
	return /blocked by our content filters/i.test(msg) || /content[_\s-]?filter/i.test(msg);
}

function coerceString(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value == null) return '';
	return String(value);
}

function parseTags(input: unknown): string[] {
	if (Array.isArray(input)) {
		return input.map((t) => coerceString(t).trim()).filter(Boolean).slice(0, 5);
	}
	if (typeof input === 'string') {
		return input
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean)
			.slice(0, 5);
	}
	return [];
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

				let url: string | null = null;
				let pathname: string | null = null;
				if (blobToken) {
					try {
						// Produkcja: użyj Vercel Blob Storage
						const { put } = await import('@vercel/blob');
						const filename = `${genId}.png`;
						const uploaded = await put(`redakcja/${filename}`, buffer, { access: 'public', token: blobToken });
						url = uploaded.url;
						pathname = null;
					} catch {
						// Blob store missing → fall back to DB bytes below.
					}
				}
				if (!url) {
					// Zapisz bajty w Neon (działa na serverless)
					await ensureMediaAssetBlobTable();
					await sql`
						INSERT INTO "MediaAssetBlob" (id, data, "createdAt", "updatedAt")
						VALUES (${genId}, ${buffer}, NOW(), NOW())
						ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
					`;
					url = `/api/redakcja/media/file/${genId}`;
					pathname = null;
				}

				await ensureMediaAssetTable();
				await prisma.mediaAsset.create({
					data: {
						id: genId,
						url,
						pathname,
						alt,
						notes: notes || null,
						contentType: 'image/png',
						size,
						isArchived: false,
					},
				});
				return { url, alt };
			} catch (e: any) {
				// Fall through to SQL path
				console.error('Prisma save error:', e?.message);
			}
		}

		// Direct Neon SQL path
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				await ensureMediaAssetBlobTable();
				const genId = (globalThis as any).crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}`;
				let url: string | null = null;
				let pathname: string | null = null;

				if (blobToken) {
					try {
						// Produkcja: Vercel Blob Storage
						const { put } = await import('@vercel/blob');
						const filename = `${genId}.png`;
						const uploaded = await put(`redakcja/${filename}`, buffer, { access: 'public', token: blobToken });
						url = uploaded.url;
						pathname = null;
					} catch {
						// fall back to DB bytes
					}
				}

				if (!url) {
					await sql`
						INSERT INTO "MediaAssetBlob" (id, data, "createdAt", "updatedAt")
						VALUES (${genId}, ${buffer}, NOW(), NOW())
						ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
					`;
					url = `/api/redakcja/media/file/${genId}`;
					pathname = null;
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
				// Fall through to fallback
				console.error('SQL save error:', e?.message);
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
			return { url, alt };
		} catch (e: any) {
			console.error('Fallback save error:', e?.message);
		}
	} catch (e: any) {
		console.error('Save image error:', e?.message);
	}

	return null;
}

function sanitizeTitleForImagePrompt(title: string): string {
	let t = title;
	// Najczęstsze przypadki z realnymi nazwiskami, które często triggerują filtry obrazów
	const replacements: Array<[RegExp, string]> = [
		[/\bDonald\s+Trump\b/gi, 'a US political figure'],
		[/\bJoe\s+Biden\b/gi, 'a US political figure'],
		[/\bVladimir\s+Putin\b/gi, 'a world leader'],
		[/\bVolodymyr\s+Zelensky\b/gi, 'a world leader'],
	];
	for (const [re, rep] of replacements) t = t.replace(re, rep);
	// Jeśli dalej wygląda jak "Imię Nazwisko", usuń nazwisko (heurystyka)
	if (/\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/.test(t)) {
		t = t.replace(/\b([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b/g, '$1 (public figure)');
	}
	return t.trim();
}

function buildPrompt(title: string, tags: string[], variant: 'primary' | 'safe'): string {
	const tagStr = tags.slice(0, 2).join(', ');
	const subject = variant === 'safe' ? sanitizeTitleForImagePrompt(title) : title;

	if (variant === 'safe') {
		return [
			'Create a professional, modern editorial cover illustration for an article.',
			`Article subject: "${subject}".`,
			tagStr ? `Optional context tags: ${tagStr}.` : null,
			'Style: clean, minimalist, modern, high-quality.',
			'Use symbolic / conceptual elements that match the subject.',
			'Do NOT depict any real person or recognizable face. No portraits.',
			'No text, no logos, no watermarks, no charts.',
		]
			.filter(Boolean)
			.join(' ');
	}

	return [
		'Create a professional, modern editorial cover illustration for an article.',
		`Article subject: "${subject}".`,
		tagStr ? `Optional context tags: ${tagStr}.` : null,
		'Style: clean, minimalist, editorial, high-quality, modern.',
		'Focus on the main subject implied by the title.',
		'No text, no logos, no watermarks, no charts.',
		'Important: do NOT depict real people or recognizable faces; use conceptual symbolism instead.',
	]
		.filter(Boolean)
		.join(' ');
}

async function generateImageWithDALLE(
	apiKey: string,
	title: string,
	tags: string[]
): Promise<{ url: string; alt: string; persisted: boolean } | null> {
	const openai = new OpenAI({ apiKey });

	const prompt = buildPrompt(title, tags, 'primary');

	try {
		let response: any;
		try {
			response = await openai.images.generate({
				model: 'dall-e-3',
				prompt,
				size: '1792x1024',
				quality: 'standard',
				n: 1,
			});
		} catch (e: any) {
			// Jeśli filtr zablokował prompt (częste przy nazwiskach), spróbuj bezpieczniejszego wariantu.
			if (isContentFilterBlock(e)) {
				const safePrompt = buildPrompt(title, tags, 'safe');
				response = await openai.images.generate({
					model: 'dall-e-3',
					prompt: safePrompt,
					size: '1792x1024',
					quality: 'standard',
					n: 1,
				});
			} else {
				throw e;
			}
		}

		const imageUrl = response.data[0]?.url;
		if (!imageUrl) return null;

		try {
			const imageResponse = await fetch(imageUrl);
			if (!imageResponse.ok) {
				console.error('Failed to fetch DALL-E image:', imageResponse.status);
				return { url: imageUrl, alt: title, persisted: false };
			}

			const imageBuffer = await imageResponse.arrayBuffer();

			// ZAWSZE próbuj zapisać do biblioteki mediów
			const saved = await saveImageToMediaLibrary(imageBuffer, title, `AI-generated cover for: ${title}`);
			if (saved) {
				return { url: saved.url, alt: saved.alt || title, persisted: true };
			}

			return { url: imageUrl, alt: title, persisted: false };
		} catch (e: any) {
			console.error('Error saving DALL-E image to library:', e?.message);
			return { url: imageUrl, alt: title, persisted: false };
		}
	} catch (e: any) {
		console.error('DALL-E generation error:', e?.message);
		return null;
	}
}

export async function POST(request: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) {
		return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	}

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY missing' }, { status: 500 });
	}

	let payload: any = {};
	try {
		payload = await request.json().catch(() => ({}));
	} catch {
		// ignore
	}

	const title = coerceString(payload?.title).trim();
	const tags = parseTags(payload?.tags);

	if (!title) {
		return NextResponse.json({ ok: false, error: 'BAD_REQUEST', message: 'Missing "title".' }, { status: 400 });
	}

	let image: { url: string; alt: string; persisted: boolean } | null = null;
	try {
		image = await generateImageWithDALLE(apiKey, title, tags);
	} catch (e: any) {
		if (isContentFilterBlock(e)) {
			return NextResponse.json(
				{
					ok: false,
					error: 'CONTENT_FILTER',
					message:
						'Generator obrazów zablokował ten temat przez filtry treści. Spróbuj opisać temat bez nazwisk (np. "polityka USA i wpływ na rynki", "wybory w USA") albo użyj bardziej ogólnego opisu.',
				},
				{ status: 400 }
			);
		}
		throw e;
	}

	if (!image) {
		return NextResponse.json({ ok: false, error: 'FAILED', message: 'Nie udało się wygenerować okładki.' }, { status: 500 });
	}

	return NextResponse.json({ ok: true, image });
}

