// app/api/jobs/news/cleanup/route.ts
import { NextResponse } from 'next/server';
import { purgeSeedItems } from '@/lib/news/store';

export const runtime = 'nodejs';

export async function GET() {
  const removed = await purgeSeedItems();
  return NextResponse.json({ ok: true, removed });
}


