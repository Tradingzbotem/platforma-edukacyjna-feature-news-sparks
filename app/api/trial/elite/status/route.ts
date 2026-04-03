import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getEliteTrial } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/trial/elite/status
 * Returns trial status for the logged-in user
 */
export async function GET() {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const trial = await getEliteTrial(userId);

    if (!trial) {
      return NextResponse.json({
        ok: true,
        hasRequest: false,
        status: null,
        requestedAt: null,
        startedAt: null,
        expiresAt: null,
        daysRemaining: null,
      });
    }

    let status: 'pending' | 'active' | 'expired' = 'pending';
    let daysRemaining: number | null = null;

    if (trial.is_active && trial.started_at && trial.expires_at) {
      const expiresAt = new Date(trial.expires_at);
      const now = new Date();
      if (now < expiresAt) {
        status = 'active';
        daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        status = 'expired';
      }
    } else if (trial.started_at && trial.expires_at) {
      const expiresAt = new Date(trial.expires_at);
      const now = new Date();
      if (now >= expiresAt) {
        status = 'expired';
      }
    }

    return NextResponse.json({
      ok: true,
      hasRequest: true,
      status,
      requestedAt: trial.requested_at,
      startedAt: trial.started_at,
      expiresAt: trial.expires_at,
      daysRemaining,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
