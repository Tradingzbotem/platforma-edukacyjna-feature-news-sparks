import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getProgressSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const summary = await getProgressSummary(session.userId);
  return NextResponse.json({ ok: true, summary });
}


