import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { listFallbackMediaAssets } from '@/lib/redakcja/mediaFallbackStore';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET(req: Request) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	const url = new URL(req.url);
	const limit = Math.min(Number(url.searchParams.get('limit') || '60'), 100);
	const archivedParam = url.searchParams.get('archived');
	const isArchived = archivedParam === '1' ? true : archivedParam === '0' ? false : undefined;
	try {
		if (prisma) {
			const items = await prisma.mediaAsset.findMany({
				take: limit,
				where: typeof isArchived === 'boolean' ? { isArchived } : undefined,
				orderBy: { createdAt: 'desc' },
			});
			return NextResponse.json({ ok: true, items, nextCursor: null });
		}
		// Direct Neon SQL when Prisma is not available
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				let rows: {
					id: string;
					url: string;
					pathname: string | null;
					contentType: string | null;
					size: number | null;
					alt: string | null;
					notes: string | null;
					isArchived: boolean;
					createdAt: Date;
					updatedAt: Date;
				}[] = [];
				if (typeof isArchived === 'boolean') {
					const res = await sql<{
						id: string;
						url: string;
						pathname: string | null;
						contentType: string | null;
						size: number | null;
						alt: string | null;
						notes: string | null;
						isArchived: boolean;
						createdAt: Date;
						updatedAt: Date;
					}>`
            SELECT id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt"
            FROM "MediaAsset"
            WHERE "isArchived" = ${isArchived}
            ORDER BY "createdAt" DESC
            LIMIT ${limit}
          `;
					rows = res.rows;
				} else {
					const res = await sql<{
						id: string;
						url: string;
						pathname: string | null;
						contentType: string | null;
						size: number | null;
						alt: string | null;
						notes: string | null;
						isArchived: boolean;
						createdAt: Date;
						updatedAt: Date;
					}>`
            SELECT id, url, pathname, "contentType", size, alt, notes, "isArchived", "createdAt", "updatedAt"
            FROM "MediaAsset"
            ORDER BY "createdAt" DESC
            LIMIT ${limit}
          `;
					rows = res.rows;
				}
				return NextResponse.json({ ok: true, items: rows, nextCursor: null });
			} catch {
				// fall through to file-based store
			}
		}

		// Fallback listing from file store
		const items = await listFallbackMediaAssets({ isArchived, limit });
		return NextResponse.json({ ok: true, items, nextCursor: null });
	} catch {
		return NextResponse.json(
			{
				ok: false,
				error: 'UNAVAILABLE',
				message: 'Error while listing media.',
				hint: 'Verify Neon / Prisma connectivity or local file store permissions.',
			},
			{ status: 503 },
		);
	}
}

