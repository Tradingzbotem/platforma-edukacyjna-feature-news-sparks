import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { articleInputSchema, parseTags, slugify } from '@/lib/redakcja/admin';
import { revalidatePath } from 'next/cache';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureArticleTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';
import { getFallbackArticleById, updateFallbackArticleById } from '@/lib/redakcja/fallbackStore';

type Params = { params: { id: string } };

function normalizeInput(data: any) {
	const n: any = { ...(data || {}) };
	if ('readingTime' in n && typeof n.readingTime === 'string' && n.readingTime.trim() === '') n.readingTime = null;
	return n;
}

export async function PATCH(req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	try {
		const dataRaw = await req.json();
		const data = normalizeInput(dataRaw);
		const parsed = articleInputSchema.partial().parse(data || {});
		const payload: any = {};
		if (parsed.title !== undefined) payload.title = parsed.title;
		if (parsed.slug !== undefined) payload.slug = parsed.slug || slugify(payload.title || '');
		if (parsed.content !== undefined) payload.content = parsed.content;
		if (parsed.readingTime !== undefined) payload.readingTime = parsed.readingTime ?? null;
		if (parsed.tags !== undefined) payload.tags = parseTags(parsed.tags);

		// ── Path 1: Prisma
		if (prisma) {
			// get current slug to handle slug change revalidation
			const before = await prisma.article.findUnique({ where: { id: params.id }, select: { slug: true } });
			const updated = await prisma.article.update({
				where: { id: params.id },
				data: payload,
			});
			revalidatePath('/redakcja');
			if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
			if (updated.slug && updated.slug !== before?.slug) revalidatePath(`/redakcja/${updated.slug}`);
			return NextResponse.json(updated);
		}

		// ── Path 2: Direct SQL (Neon) when DB configured but Prisma client unavailable
		if (isDatabaseConfigured()) {
			try {
				await ensureArticleTable();
				const beforeSel = await sql<{ slug: string }>`SELECT slug FROM "Article" WHERE id = ${params.id} LIMIT 1`;
				const beforeSlug = beforeSel.rows[0]?.slug ?? null;
				// Read existing row to merge fields
				const existingSel = await sql<{
					id: string; slug: string; title: string; content: string; readingTime: number | null; tags: string[];
				}>`SELECT id, slug, title, content, "readingTime", tags FROM "Article" WHERE id = ${params.id} LIMIT 1`;
				if (existingSel.rows.length === 0) {
					return NextResponse.json({ error: 'Not found' }, { status: 404 });
				}
				const existing = existingSel.rows[0];
				const next = {
					title: payload.title ?? existing.title,
					slug: (payload.slug ?? existing.slug) as string,
					content: payload.content ?? existing.content,
					readingTime: payload.readingTime ?? existing.readingTime,
					tags: payload.tags ?? existing.tags,
				};
				const tagsJson = JSON.stringify(next.tags ?? []);
				const upd = await sql<{
					id: string; slug: string; title: string; content: string; readingTime: number | null; tags: string[];
				}>`
          UPDATE "Article"
          SET slug=${next.slug}, title=${next.title}, content=${next.content},
              "readingTime"=${next.readingTime},
              tags=ARRAY(SELECT json_array_elements_text(${tagsJson}::json)),
              "updatedAt"=NOW()
          WHERE id=${params.id}
          RETURNING id, slug, title, content, "readingTime", tags
        `;
				const updated = upd.rows[0];
				revalidatePath('/redakcja');
				if (beforeSlug) revalidatePath(`/redakcja/${beforeSlug}`);
				if (updated?.slug && updated.slug !== beforeSlug) revalidatePath(`/redakcja/${updated.slug}`);
				return NextResponse.json(updated ?? { ok: true });
			} catch (e: any) {
				if (e?.code === '23505') {
					return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
				}
				// fallthrough to file
			}
		}

		// ── Path 3: File fallback
		const beforeFallback = await getFallbackArticleById(params.id);
		if (!beforeFallback) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}
		const updatedFallback = await updateFallbackArticleById(params.id, {
			title: payload.title,
			slug: payload.slug,
			content: payload.content,
			readingTime: payload.readingTime,
			tags: payload.tags,
		});
		revalidatePath('/redakcja');
		if (beforeFallback.slug) revalidatePath(`/redakcja/${beforeFallback.slug}`);
		if (updatedFallback?.slug && updatedFallback.slug !== beforeFallback.slug) {
			revalidatePath(`/redakcja/${updatedFallback.slug}`);
		}
		return NextResponse.json({ ...(updatedFallback as any), _storage: 'file' as const });
	} catch (e: any) {
		if ((e as any)?.code === 'P2002') {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
	}
}

export async function DELETE(_req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
	try {
		const before = await prisma.article.findUnique({ where: { id: params.id }, select: { slug: true } });
		await prisma.article.delete({ where: { id: params.id } });
		// Revalidate list and previous detail page
		revalidatePath('/redakcja');
		if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}


