// app/api/jobs/news/seed/route.ts
import { NextResponse } from 'next/server';
import { seedDemo } from '@/lib/news/store';

export const runtime = 'nodejs';

export async function GET() {
  const count = await seedDemo();
  return NextResponse.json({ ok: true, seeded: count });
}


