import { NextResponse } from 'next/server';
import { getPublishedDecisionBriefDto } from '@/lib/decision-brief/getPublishedDecisionBrief';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/decision-brief/active
 * Zwraca opublikowany brief (lub brief: null).
 */
export async function GET() {
  try {
    const brief = await getPublishedDecisionBriefDto();
    return NextResponse.json({ ok: true, brief });
  } catch (e) {
    console.error('[decision-brief/active]', e);
    return NextResponse.json({ ok: false, error: 'server_error', brief: null }, { status: 500 });
  }
}
