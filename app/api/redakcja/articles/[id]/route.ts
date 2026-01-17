import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { articleInputSchema, parseTags, slugify } from '@/lib/redakcja/admin';
import { revalidatePath } from 'next/cache';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureArticleTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';
import {
	getFallbackArticleById,
	getFallbackArticleBySlug,
	updateFallbackArticleById,
	createFallbackArticle,
} from '@/lib/redakcja/fallbackStore';

type Params = { params: Promise<{ id: string }> };

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
		const { id } = await params;
		const dataRaw = await req.json();
		const data = normalizeInput(dataRaw);
		const parsed = articleInputSchema.partial().parse(data || {});
		const payload: any = {};
		if (parsed.title !== undefined) payload.title = parsed.title;
		if (parsed.slug !== undefined) payload.slug = parsed.slug || slugify(payload.title || '');
		if (parsed.content !== undefined) payload.content = parsed.content;
		if (parsed.readingTime !== undefined) payload.readingTime = parsed.readingTime ?? null;
		if (parsed.tags !== undefined) payload.tags = parseTags(parsed.tags);

		// ── Path 1: Prisma (attempt update by id; if not found, fall through)
		if (prisma) {
			try {
				const before = await prisma.article.findUnique({ where: { id }, select: { slug: true } });
				if (before) {
					const updated = await prisma.article.update({
						where: { id },
						data: payload,
					});
					revalidatePath('/redakcja');
					if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
					if (updated.slug && updated.slug !== before?.slug) revalidatePath(`/redakcja/${updated.slug}`);
					return NextResponse.json(updated);
				}
			} catch {
				// continue to next strategy
			}
		}

		// ── Path 2: Direct SQL (Neon) when DB configured but Prisma client unavailable
		if (isDatabaseConfigured()) {
			try {
				await ensureArticleTable();
				const beforeSel = await sql<{ slug: string }>`SELECT slug FROM "Article" WHERE id = ${id} LIMIT 1`;
				const beforeSlug = beforeSel.rows[0]?.slug ?? null;
				// Read existing row to merge fields
				const existingSel = await sql<{
					id: string; slug: string; title: string; content: string; readingTime: number | null; tags: string[];
				}>`SELECT id, slug, title, content, "readingTime", tags FROM "Article" WHERE id = ${id} LIMIT 1`;
				if (existingSel.rows.length > 0) {
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
            WHERE id=${id}
            RETURNING id, slug, title, content, "readingTime", tags
          `;
					const updated = upd.rows[0];
					revalidatePath('/redakcja');
					if (beforeSlug) revalidatePath(`/redakcja/${beforeSlug}`);
					if (updated?.slug && updated.slug !== beforeSlug) revalidatePath(`/redakcja/${updated.slug}`);
					return NextResponse.json(updated ?? { ok: true });
				}
				// if not found by id -> fall through to fallback/migrate-by-slug
			} catch (e: any) {
				if (e?.code === '23505') {
					return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
				}
				// fallthrough to file
			}
		}

		// ── Path 3: File fallback (and migrate-on-edit by slug)
		const beforeFallback = await getFallbackArticleById(id);
		if (beforeFallback) {
			const updatedFallback = await updateFallbackArticleById(id, {
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
		}

		// If item not found by ID anywhere, try "migrate-on-edit" using slug:
		// 1) Update existing by slug if present
		// 2) Otherwise create a new record (upsert-like behaviour)
		const slug = (payload.slug || slugify(payload.title || '') || '').trim();
		if (slug) {
			// Try Prisma by slug
			if (prisma) {
				try {
					const existing = await prisma.article.findFirst({ where: { slug }, select: { id: true, slug: true } });
					if (existing) {
						const updated = await prisma.article.update({
							where: { id: existing.id },
							data: {
								title: payload.title ?? undefined,
								slug,
								content: payload.content ?? undefined,
								readingTime: payload.readingTime ?? undefined,
								tags: payload.tags ?? undefined,
							},
						});
						revalidatePath('/redakcja');
						revalidatePath(`/redakcja/${existing.slug}`);
						if (updated.slug && updated.slug !== existing.slug) revalidatePath(`/redakcja/${updated.slug}`);
						return NextResponse.json(updated);
					}
					// Create new if not exists
					const created = await prisma.article.create({
						data: {
							title: payload.title ?? '(bez tytułu)',
							slug,
							content: payload.content ?? '',
							readingTime: payload.readingTime ?? null,
							tags: payload.tags ?? [],
						},
					});
					revalidatePath('/redakcja');
					revalidatePath(`/redakcja/${created.slug}`);
					return NextResponse.json(created, { status: 201 });
				} catch {
					// fallthrough to SQL/file
				}
			}
			// Try SQL by slug
			if (isDatabaseConfigured()) {
				try {
					await ensureArticleTable();
					const sel = await sql<{ id: string; slug: string }>`SELECT id, slug FROM "Article" WHERE slug = ${slug} LIMIT 1`;
					if (sel.rows[0]?.id) {
						const ex = sel.rows[0];
						const tagsJson = JSON.stringify(payload.tags ?? []);
						const upd = await sql<{
							id: string; slug: string; title: string; content: string; readingTime: number | null; tags: string[];
						}>`
              UPDATE "Article"
              SET slug=${slug}, title=${payload.title ?? ''}, content=${payload.content ?? ''},
                  "readingTime"=${payload.readingTime ?? null},
                  tags=ARRAY(SELECT json_array_elements_text(${tagsJson}::json)),
                  "updatedAt"=NOW()
              WHERE id=${ex.id}
              RETURNING id, slug, title, content, "readingTime", tags
            `;
						const updated = upd.rows[0];
						revalidatePath('/redakcja');
						revalidatePath(`/redakcja/${ex.slug}`);
						if (updated?.slug && updated.slug !== ex.slug) revalidatePath(`/redakcja/${updated.slug}`);
						return NextResponse.json(updated ?? { ok: true });
					}
					// Create new if not exists by slug
					const idNew =
						(globalThis as any).crypto?.randomUUID?.() ??
						`${Date.now()}-${Math.random().toString(36).slice(2)}`;
					const tagsJson = JSON.stringify(payload.tags ?? []);
					const ins = await sql<{
						id: string; slug: string; title: string; content: string; readingTime: number | null; tags: string[];
					}>`
            INSERT INTO "Article" (id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt")
            VALUES (
              ${idNew},
              ${slug},
              ${payload.title ?? '(bez tytułu)'},
              ${payload.content ?? ''},
              ${payload.readingTime ?? null},
              ARRAY(SELECT json_array_elements_text(${tagsJson}::json)),
              NOW(),
              NOW()
            )
            RETURNING id, slug, title, content, "readingTime", tags
          `;
					const created = ins.rows[0];
					revalidatePath('/redakcja');
					if (created?.slug) revalidatePath(`/redakcja/${created.slug}`);
					return NextResponse.json(created, { status: 201 });
				} catch {
					// fallthrough to file
				}
			}
			// Try file fallback by slug
			try {
				const f = await getFallbackArticleBySlug(slug);
				if (f) {
					const updatedFallback = await updateFallbackArticleById(f.id, {
						title: payload.title,
						slug,
						content: payload.content,
						readingTime: payload.readingTime,
						tags: payload.tags,
					});
					revalidatePath('/redakcja');
					if (f.slug) revalidatePath(`/redakcja/${f.slug}`);
					if (updatedFallback?.slug && updatedFallback.slug !== f.slug) {
						revalidatePath(`/redakcja/${updatedFallback.slug}`);
					}
					return NextResponse.json({ ...(updatedFallback as any), _storage: 'file' as const });
				}
				// Create in file fallback if also not exists
				const createdFallback = await createFallbackArticle({
					title: payload.title ?? '(bez tytułu)',
					slug,
					content: payload.content ?? '',
					readingTime: payload.readingTime ?? null,
					tags: payload.tags ?? [],
				});
				revalidatePath('/redakcja');
				if (createdFallback?.slug) revalidatePath(`/redakcja/${createdFallback.slug}`);
				return NextResponse.json({ ...createdFallback, _storage: 'file' as const }, { status: 201 });
			} catch {
				// ignore and fall through to 404
			}
		}

		// If all strategies failed:
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
		const { id } = await params;
		const before = await prisma.article.findUnique({ where: { id }, select: { slug: true } });
		await prisma.article.delete({ where: { id } });
		// Revalidate list and previous detail page
		revalidatePath('/redakcja');
		if (before?.slug) revalidatePath(`/redakcja/${before.slug}`);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
}


