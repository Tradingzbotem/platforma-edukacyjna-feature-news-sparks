// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const s = await getSession();
  return NextResponse.json({
    userId: s.userId ?? null,
    email: s.email ?? null,
    plan: s.plan ?? null,
    isLoggedIn: Boolean(s.userId),
  });
}
