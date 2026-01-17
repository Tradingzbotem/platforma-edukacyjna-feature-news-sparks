import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
  const offset = Number(searchParams.get('offset')) || 0;
  const qRaw = (searchParams.get('q') || '').trim();
  const q = qRaw ? `%${qRaw}%` : null;
  const sourceRaw = (searchParams.get('source') || '').trim();
  const source = sourceRaw ? sourceRaw : null;
  const enrichedRaw = (searchParams.get('enriched') || '').trim();
  const enriched = enrichedRaw === '1' || enrichedRaw === '0' ? enrichedRaw : null;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, items: [], total: 0 });
  }

  try {
    let total = 0;
    let items: Array<{
      id: string;
      url: string;
      title: string;
      source: string;
      publishedAt: string;
      createdAt: string;
      isEnriched: boolean;
      category: string | null;
      sentiment: string | null;
    }> = [];

    try {
      const totalResult = await sql<{ count: string }>`
        SELECT COUNT(*)::text AS count
        FROM news_items
        WHERE
          (${q}::text IS NULL OR title ILIKE ${q} OR source ILIKE ${q})
          AND (${source}::text IS NULL OR source = ${source})
          AND (
            ${enriched}::text IS NULL
            OR (${enriched} = '1' AND enriched IS NOT NULL)
            OR (${enriched} = '0' AND enriched IS NULL)
          )
      `;
      total = Number(totalResult.rows[0]?.count ?? '0');

      const itemsResult = await sql<{
        id: string;
        url: string;
        title: string;
        source: string;
        published_at: Date;
        created_at: Date;
        enriched: any;
      }>`
        SELECT id, url, title, source, published_at, created_at, enriched
        FROM news_items
        WHERE
          (${q}::text IS NULL OR title ILIKE ${q} OR source ILIKE ${q})
          AND (${source}::text IS NULL OR source = ${source})
          AND (
            ${enriched}::text IS NULL
            OR (${enriched} = '1' AND enriched IS NOT NULL)
            OR (${enriched} = '0' AND enriched IS NULL)
          )
        ORDER BY published_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      items = itemsResult.rows.map((r) => ({
        id: r.id,
        url: r.url,
        title: r.title,
        source: r.source,
        publishedAt: new Date(r.published_at).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
        isEnriched: !!r.enriched,
        category: r.enriched?.category || null,
        sentiment: r.enriched?.sentiment || null,
      }));
    } catch (error: any) {
      // Ignore "relation does not exist" errors (42P01)
      if (error?.code !== '42P01') {
        throw error;
      }
      // Table doesn't exist, return empty results
      total = 0;
      items = [];
    }

    return NextResponse.json(
      { ok: true, items, total },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error fetching news items:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to fetch news items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 });
  }

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const action = String(body?.action || '');

  // Manual pipeline refresh: ingest + enrich + (optional) brief generation
  if (action === 'refresh') {
    const origin = new URL(request.url).origin;
    const cronSecret = process.env.CRON_SECRET;
    const headers = cronSecret ? { 'x-cron-secret': cronSecret } : undefined;

    const res = await fetch(`${origin}/api/jobs/news/refresh`, {
      method: 'GET',
      cache: 'no-store',
      headers,
    }).catch(() => null);

    if (!res || !res.ok) {
      return NextResponse.json({ ok: false, error: 'Failed to run refresh job' }, { status: 500 });
    }
    const data = await res.json().catch(() => null);
    return NextResponse.json({ ok: true, result: data });
  }

  // Bulk delete (ids[])
  if (action === 'deleteMany') {
    const ids = Array.isArray(body?.ids) ? body.ids.map((x: any) => String(x)).filter(Boolean) : [];
    if (!ids.length) {
      return NextResponse.json({ ok: false, error: 'Missing ids' }, { status: 400 });
    }

    try {
      // Safer than string-building; OK for page-sized batch deletes.
      for (const id of ids) {
        await sql`DELETE FROM news_items WHERE id = ${id}`;
      }
      return NextResponse.json({ ok: true, deleted: ids.length });
    } catch (error: any) {
      console.error('Error bulk deleting news items:', error);
      return NextResponse.json(
        { ok: false, error: error?.message || 'Failed to delete news items' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing id parameter' }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 500 });
  }

  try {
    await sql`DELETE FROM news_items WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting news item:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to delete news item' },
      { status: 500 }
    );
  }
}
