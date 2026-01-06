// app/api/jobs/news/seed-bulk/route.ts
import { NextResponse } from 'next/server';
import { seedBulk } from '@/lib/news/store';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const count = Number(url.searchParams.get('count') || '400');
  const days = Number(url.searchParams.get('days') || '10');
  const n = await seedBulk({ count, days });
  return NextResponse.json({ ok: true, seeded: n, days });
}


