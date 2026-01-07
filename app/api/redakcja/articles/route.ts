import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
// Import db side-effects to normalize env (DATABASE_URL -> POSTGRES_URL) like w/ registration
import '@/lib/db';
import { isDatabaseConfigured } from '@/lib/db';
import { articleInputSchema, parseTags, slugify } from '@/lib/redakcja/admin';
import { revalidatePath } from 'next/cache';
import { createFallbackArticle, listFallbackArticles } from '@/lib/redakcja/fallbackStore';
import { ensureArticleTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

function normalizeInput(data: any) {
	const n: any = { ...(data || {}) };
	// Coerce empty strings to null for optional fields
	n.readingTime = typeof n.readingTime === 'string' && n.readingTime.trim() === '' ? null : n.readingTime;
	return n;
}

export async function POST(req: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	// Opportunistically create/align the Neon table so Prisma can write to it
	try { await ensureArticleTable(); } catch {}

	// Helper to build uniform DB unavailable JSON
	const dbUnavailable = () =>
		NextResponse.json(
			{
				ok: false,
				error: 'DB_UNAVAILABLE',
				message: 'Database is not configured or not reachable. Falling back to local storage.',
				hint: 'Set DATABASE_URL or POSTGRES_URL in your environment.',
			},
			{ status: 503 },
		);

	try {
		const dataRaw = await req.json();
		const data = normalizeInput(dataRaw);
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
				return NextResponse.json(created, { status: 201 });
			} catch (e: any) {
				// Unique constraint
				if (e?.code === 'P2002') {
					return NextResponse.json({ ok: false, error: 'SLUG_EXISTS', message: 'Slug already exists' }, { status: 409 });
				}
				// Connection issues -> allow fallback to file
				const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
				if (connectionErrors.has(e?.code)) {
					// fall through to file-based save
				} else {
					// For any other Prisma error, return a clear server error instead of silently falling back.
					// This helps diagnose schema mismatches (missing columns/enums, wrong types, etc.).
					try {
						// eslint-disable-next-line no-console
						console.error('Prisma error on article.create:', { code: e?.code, message: e?.message, meta: e?.meta });
					} catch {}
					return NextResponse.json(
						{
							ok: false,
							error: 'PRISMA_ERROR',
							code: e?.code || 'UNKNOWN',
							message: e?.message || 'Prisma error while creating Article',
						},
						{ status: 500 },
					);
				}
			}
		}

		// Direct Neon SQL when Prisma client isn't available but env is configured
		if (isDatabaseConfigured()) {
			try {
				const id = (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
				// Safely build TEXT[] from JSON using Postgres, compatible with older @vercel/postgres (no sql.join)
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
					return NextResponse.json(created, { status: 201 });
				}
			} catch (e: any) {
				const message = e?.message || 'Neon SQL insert failed';
				const code = e?.code || e?.originalError?.code || 'SQL_ERROR';
				// Unique constraint on slug
				if (code === '23505' || /duplicate key value.*Article_slug_key/i.test(String(message))) {
					return NextResponse.json({ ok: false, error: 'SLUG_EXISTS', message: 'Slug already exists' }, { status: 409 });
				}
				return NextResponse.json(
					{ ok: false, error: 'SQL_ERROR', code, message, hint: 'Sprawdź uprawnienia i istnienie tabeli "Article" w schemacie public.' },
					{ status: 500 },
				);
			}
		}

		// Fallback: save locally
		try {
			const createdFallback = await createFallbackArticle({ ...parsed, tags });
			// Add hint meta for client to show warning
			return NextResponse.json({ ...createdFallback, _storage: 'file' as const }, { status: 201 });
		} catch {
			// If file save failed, report DB unavailable (since primary cause is no DB)
			return dbUnavailable();
		}
	} catch (e: any) {
		// Zod or parse errors
		return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD', message: 'Invalid payload' }, { status: 400 });
	}
}

export async function GET() {
	const prisma = getPrisma();
	// Ensure table exists for deployments where it was not created yet
	try { await ensureArticleTable(); } catch {}

	// Collect from all sources and merge (helps when one path writes while the other reads)
	const collected: any[] = [];

	// Prisma
	if (prisma) {
		try {
			const items = await prisma.article.findMany({
				orderBy: { updatedAt: 'desc' },
			});
			collected.push(...items);
		} catch {
			// ignore and continue with SQL
		}
	}

	// Direct Neon SQL
	try {
		const { rows } = await sql`
      SELECT id, slug, title, content, "readingTime", tags, "createdAt", "updatedAt"
      FROM "Article"
      ORDER BY "updatedAt" DESC
    `;
		collected.push(...(rows as any));
	} catch {
		// ignore and continue
	}

	// Fallback file store (dev/no-DB)
	try {
		const items = await listFallbackArticles();
		collected.push(...items);
	} catch {
		// ignore
	}

	// Deduplicate by id (preferred) else by slug
	const byKey = new Map<string, any>();
	for (const it of collected) {
		const key = String((it as any).id || '') || `slug:${String((it as any).slug || '')}`;
		if (!key) continue;
		if (!byKey.has(key)) byKey.set(key, it);
	}
	const merged = Array.from(byKey.values());
	// Sort desc by updatedAt/createdAt
	merged.sort((a, b) => {
		const ad = new Date((a as any).updatedAt || (a as any).createdAt || 0).getTime();
		const bd = new Date((b as any).updatedAt || (b as any).createdAt || 0).getTime();
		return bd - ad;
	});

	if (merged.length > 0) {
		return NextResponse.json({ ok: true, items: merged });
	}
	// If still empty, signal DB unavailable to help diagnose prod misconfig
	return NextResponse.json(
		{
			ok: true,
			items: [],
		},
	);
}



