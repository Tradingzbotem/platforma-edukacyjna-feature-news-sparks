import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) return NextResponse.json({ ok: false, error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
	const prisma = getPrisma();
	if (!prisma) {
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
		const updated = await prisma.mediaAsset.update({
			where: { id: params.id },
			data: {
				...(alt !== undefined ? { alt } : {}),
				...(notes !== undefined ? { notes } : {}),
				...(archived !== undefined ? { isArchived: archived } : {}),
			},
		});
		return NextResponse.json({ ok: true, ...updated });
	} catch {
		return NextResponse.json({ ok: false, error: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
	}
}

// No DELETE: media are never hard-deleted (history preserved).


