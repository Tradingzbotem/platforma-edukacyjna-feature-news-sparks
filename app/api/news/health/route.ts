// app/api/news/health/route.ts
import { NextResponse } from 'next/server';
import { listNews, getLatestBrief } from '@/lib/news/store';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const dbConfigured = isDatabaseConfigured();
  const h24 = await listNews({ hours: 24, includeDemo: false });
  const h48 = await listNews({ hours: 48, includeDemo: false });
  const h72 = await listNews({ hours: 72, includeDemo: false });

  const latestTs = [h24.updatedAt, h48.updatedAt, h72.updatedAt]
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || null;

  const brief24 = await getLatestBrief('24h');
  const brief48 = await getLatestBrief('48h');
  const brief72 = await getLatestBrief('72h');

  return NextResponse.json({
    ok: true,
    dbConfigured,
    counts: {
      h24: h24.items.length,
      h48: h48.items.length,
      h72: h72.items.length,
    },
    latestUpdatedAt: latestTs,
    briefs: {
      '24h': Boolean(brief24),
      '48h': Boolean(brief48),
      '72h': Boolean(brief72),
    },
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}


