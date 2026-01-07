import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { updateFallbackMediaAsset } from '@/lib/redakcja/mediaFallbackStore';
import { isDatabaseConfigured } from '@/lib/db';
import { ensureMediaAssetTable } from '@/lib/redakcja/ensureDb';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
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
				where: { id: params.id },
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
					await sql`UPDATE "MediaAsset" SET alt = ${alt}, "updatedAt" = NOW() WHERE id = ${params.id}`;
				}
				if (notes !== undefined) {
					await sql`UPDATE "MediaAsset" SET notes = ${notes}, "updatedAt" = NOW() WHERE id = ${params.id}`;
				}
				if (archived !== undefined) {
					await sql`UPDATE "MediaAsset" SET "isArchived" = ${archived}, "updatedAt" = NOW() WHERE id = ${params.id}`;
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
          WHERE id = ${params.id}
          LIMIT 1
        `;
				const updated = rows[0];
				if (!updated) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
				return NextResponse.json({ ok: true, ...updated });
			} catch {
				// fall through to file-based
			}
		}
		const updated = await updateFallbackMediaAsset(params.id, { alt, notes, archived });
		if (!updated) return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
		return NextResponse.json({ ok: true, ...updated });
	} catch {
		return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
	}
}

// No DELETE: media are never hard-deleted (history preserved).


