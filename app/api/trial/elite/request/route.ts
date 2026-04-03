import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findUserById, requestEliteTrial } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/trial/elite/request
 * Client requests a 7-day Elite trial
 */
export async function POST() {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to get current plan
    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const originalPlan = user.plan || 'free';

    // Create trial request
    await requestEliteTrial(userId, originalPlan);

    return NextResponse.json({ ok: true, message: 'Trial request created' });
  } catch (error: any) {
    console.error('Error creating trial request:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
