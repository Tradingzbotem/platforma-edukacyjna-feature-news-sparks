import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { listContactMessages } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const messages = await listContactMessages(200);
  return NextResponse.json({ ok: true, messages }, { headers: { 'Cache-Control': 'no-store' } });
}


