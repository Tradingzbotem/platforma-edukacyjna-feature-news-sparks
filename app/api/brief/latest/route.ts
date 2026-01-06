// app/api/brief/latest/route.ts
import { NextResponse } from 'next/server';
import { getLatestBrief } from '@/lib/news/store';
import type { BriefWindow } from '@/lib/news/types';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const w = (url.searchParams.get('window') || '24h') as BriefWindow;
  const window: BriefWindow = w === '48h' ? '48h' : w === '72h' ? '72h' : '24h';
  const brief = await getLatestBrief(window);
  return NextResponse.json({ brief }, {
    headers: {
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=120',
    },
  });
}


