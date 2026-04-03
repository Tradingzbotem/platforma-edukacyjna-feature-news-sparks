import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { activateEliteTrial } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/trial/elite/activate
 * Body: { userId: string }
 * Admin activates Elite trial for a user
 */
export async function POST(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ ok: false, error: 'INVALID_USER_ID' }, { status: 400 });
    }

    await activateEliteTrial(userId);

    return NextResponse.json({ ok: true, message: 'Trial activated' });
  } catch (error: any) {
    console.error('Error activating trial:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
