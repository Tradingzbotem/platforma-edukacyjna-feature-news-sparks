import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const isAdmin = await getIsAdmin();
  return NextResponse.json({ isAdmin }, { headers: { 'Cache-Control': 'no-store' } });
}


