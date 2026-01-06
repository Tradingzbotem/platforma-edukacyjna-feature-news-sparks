import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { listUsersBasic } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const users = await listUsersBasic();
  return NextResponse.json({ ok: true, users }, { headers: { 'Cache-Control': 'no-store' } });
}


