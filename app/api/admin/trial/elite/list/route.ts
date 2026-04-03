import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { listEliteTrials } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/trial/elite/list
 * Returns list of all Elite trial requests for admin
 */
export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const trials = await listEliteTrials();
    return NextResponse.json({ ok: true, trials }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Error fetching elite trials:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
