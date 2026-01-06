import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
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
	const url = new URL(req.url);
	const limit = Math.min(Number(url.searchParams.get('limit') || '60'), 100);
	const archivedParam = url.searchParams.get('archived');
	const isArchived = archivedParam === '1' ? true : archivedParam === '0' ? false : undefined;
	try {
		const items = await prisma.mediaAsset.findMany({
			take: limit,
			where: typeof isArchived === 'boolean' ? { isArchived } : undefined,
			orderBy: { createdAt: 'desc' },
		});
		return NextResponse.json({ ok: true, items, nextCursor: null });
	} catch {
		return NextResponse.json(
			{
				ok: false,
				error: 'DB_UNAVAILABLE',
				message: 'Database error while listing media.',
				hint: 'Verify Neon / Prisma connectivity and env variables.',
			},
			{ status: 503 },
		);
	}
}

