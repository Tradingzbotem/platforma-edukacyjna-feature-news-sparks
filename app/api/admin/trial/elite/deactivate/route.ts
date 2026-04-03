import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { deactivateEliteTrial } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/trial/elite/deactivate
 * Body: { userId: string }
 * Admin deactivates Elite trial for a user
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

    await deactivateEliteTrial(userId);

    return NextResponse.json({ ok: true, message: 'Trial deactivated' });
  } catch (error: any) {
    console.error('Error deactivating trial:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
