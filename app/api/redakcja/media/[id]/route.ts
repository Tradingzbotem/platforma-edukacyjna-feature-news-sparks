import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { deleteFallbackMediaAsset, updateFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetBlobTable, ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';
import fs from 'fs';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	const { id } = await params;
	try {
		const data = await req.json().catch(() => ({}));
		const alt = typeof data?.alt === 'string' ? data.alt : undefined;
		const notes = typeof data?.notes === 'string' ? data.notes : undefined;
		const archived =
			typeof data?.archived === 'boolean'
				? data.archived
				: typeof data?.isArchived === 'boolean'
				? data.isArchived
				: undefined;
		if (prisma) {
			const updated = await prisma.mediaAsset.update({
				where: { id },
				data: {
					...(alt !== undefined ? { alt } : {}),
					...(notes !== undefined ? { notes } : {}),
					...(archived !== undefined ? { isArchived: archived } : {}),
				},
			});
			return NextResponse.json({ ok: true, ...updated });
		}
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				// Perform safe sequential updates for provided fields
				if (alt !== undefined) {
					await sql`UPDATE "MediaAsset" SET alt = ${alt}, "updatedAt" = NOW() WHERE id = ${id}`;
				}
				if (notes !== undefined) {
					await sql`UPDATE "MediaAsset" SET notes = ${notes}, "updatedAt" = NOW() WHERE id = ${id}`;
				}
				if (archived !== undefined) {
					await sql`UPDATE "MediaAsset" SET "isArchived" = ${archived}, "updatedAt" = NOW() WHERE id = ${id}`;
				}
				const { rows } = await sql<{
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
          WHERE id = ${id}
          LIMIT 1
        `;
				const updated = rows[0];
				if (!updated) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
				return NextResponse.json({ ok: true, ...updated });
			} catch {
				// fall through to file-based
			}
		}
		const updated = await updateFallbackMediaAsset(id, { alt, notes, archived });
		if (!updated) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
		return NextResponse.json({ ok: true, ...updated });
	} catch {
		return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
	}
}

export async function DELETE(_req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	const { id } = await params;
	try {
		if (prisma) {
			try {
				await prisma.$executeRaw`DELETE FROM "MediaAssetBlob" WHERE id = ${id}`;
			} catch {
				// ignore blob deletion errors
			}
			try {
				const deleted = await prisma.mediaAsset.delete({ where: { id } });
				return NextResponse.json({ ok: true, ...deleted });
			} catch {
				// fall through to SQL/fallback
			}
		}
		if (isDatabaseConfigured()) {
			try {
				await ensureMediaAssetTable();
				await ensureMediaAssetBlobTable();
				const existing = await sql<{ pathname: string | null }>`
          SELECT pathname
          FROM "MediaAsset"
          WHERE id = ${id}
          LIMIT 1
        `;
				const res = await sql<{ id: string }>`
          DELETE FROM "MediaAsset"
          WHERE id = ${id}
          RETURNING id
        `;
				await sql`DELETE FROM "MediaAssetBlob" WHERE id = ${id}`;
				const deletedId = res.rows[0]?.id;
				if (!deletedId) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
				const pathname = existing.rows[0]?.pathname;
				if (pathname) {
					try {
						fs.unlinkSync(pathname);
					} catch {
						// ignore missing file
					}
				}
				return NextResponse.json({ ok: true, id: deletedId });
			} catch {
				// fall through to file-based store
			}
		}
		const removed = await deleteFallbackMediaAsset(id);
		if (!removed) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
		return NextResponse.json({ ok: true, ...removed });
	} catch {
		return NextResponse.json({ ok: false, error: 'DELETE_FAILED', message: 'Delete failed' }, { status: 500 });
	}
}


