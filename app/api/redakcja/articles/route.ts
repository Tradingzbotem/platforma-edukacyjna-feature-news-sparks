import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { articleInputSchema, parseTags, slugify } from '@/lib/redakcja/admin';
import { revalidatePath } from 'next/cache';
import { createFallbackArticle, listFallbackArticles } from '@/lib/redakcja/fallbackStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();

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
		const data = await req.json();
		const parsed = articleInputSchema.parse({
			...data,
			slug: data?.slug ? String(data.slug) : slugify(String(data?.title || '')),
		});
		const tags = parseTags(parsed.tags);

		// Try DB first if available
		if (prisma) {
			try {
				const created = await prisma.article.create({
					data: {
						title: parsed.title,
						slug: parsed.slug,
						excerpt: parsed.excerpt ?? null,
						content: parsed.content,
						status: parsed.status || 'DRAFT',
						publishedAt: parsed.status === 'PUBLISHED' ? new Date() : null,
						coverImageUrl: parsed.coverImageUrl ?? null,
						coverImageAlt: parsed.coverImageAlt ?? null,
						readingTime: parsed.readingTime ?? null,
						tags,
						seoTitle: parsed.seoTitle ?? null,
						seoDescription: parsed.seoDescription ?? null,
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
				// Connection issues -> fallback to file
				const connectionErrors = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1011', 'P1017']);
				if (connectionErrors.has(e?.code)) {
					// fall through to file-based save
				} else {
					// Other Prisma error: try file fallback anyway
				}
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
	if (prisma) {
		try {
			const items = await prisma.article.findMany({
				orderBy: { updatedAt: 'desc' },
			});
			return NextResponse.json({ ok: true, items });
		} catch {
			// On DB error, continue to fallback
		}
	}
	try {
		const items = await listFallbackArticles();
		return NextResponse.json({ ok: true, items, _storage: 'file' as const });
	} catch {
		return NextResponse.json(
			{
				ok: false,
				error: 'DB_UNAVAILABLE',
				message: 'Database is not configured or not reachable.',
				hint: 'Set DATABASE_URL or POSTGRES_URL in your environment.',
			},
			{ status: 503 },
		);
	}
}


