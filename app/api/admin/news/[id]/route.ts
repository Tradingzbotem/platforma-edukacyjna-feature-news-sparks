import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { isDatabaseConfigured } from '@/lib/db';
import { getAdminNewsItemById } from '@/lib/news/adminNewsItem';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
	const isAdmin = await getIsAdmin();
	if (!isAdmin) {
		return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
	}

	if (!isDatabaseConfigured()) {
		return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
	}

	const { id } = await params;
	const item = await getAdminNewsItemById(id);
	if (!item) {
		return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
	}

	return NextResponse.json(
		{
			ok: true,
			item: {
				id: item.id,
				title: item.title,
				source: item.source,
				url: item.url,
				publishedAt: item.publishedAt,
				createdAt: item.createdAt,
				enriched: item.enriched,
			},
		},
		{ headers: { 'Cache-Control': 'no-store' } }
	);
}
