// app/api/news/list/route.ts
import { NextResponse } from 'next/server';
import { listNews } from '@/lib/news/store';
import type { NewsCategory, Sentiment } from '@/lib/news/types';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hoursParam = Number(url.searchParams.get('hours') || '72');
  const q = (url.searchParams.get('q') || '').trim();
  const categories = (url.searchParams.get('categories') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as NewsCategory[];
  const minImpact = Number(url.searchParams.get('minImpact') || '1');
  const sentimentParam = (url.searchParams.get('sentiment') || 'any').toLowerCase() as 'any' | Sentiment;
  const watchlist = (url.searchParams.get('watchlist') || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const includeDemo = ['1','true','yes'].includes((url.searchParams.get('includeDemo') || '').toLowerCase());

  const hours = hoursParam === 24 || hoursParam === 48 || hoursParam === 72 ? hoursParam : 72;
  const data = await listNews({
    hours,
    q,
    categories,
    minImpact: isNaN(minImpact) ? 1 : Math.max(1, Math.min(5, minImpact)),
    sentiment: sentimentParam,
    watchlist,
    includeDemo,
  });
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
    },
  });
}


