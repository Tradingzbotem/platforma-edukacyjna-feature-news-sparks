// app/api/panel/checklists/history/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { insertChecklistHistory, listChecklistHistory, isDatabaseConfigured } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
  const items = await listChecklistHistory(userId, 50);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getSession();
  const userId = session.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  await insertChecklistHistory({
    userId,
    asset: body?.selection?.asset ?? null,
    timeframe: body?.selection?.timeframe ?? null,
    horizon: body?.selection?.horizon ?? null,
    thesis: body?.thesis ?? null,
    reasons: Array.isArray(body?.reasons) ? body.reasons.slice(0, 10) : null,
    invalidation_kind: body?.invalidationKind ?? null,
    invalidation_level: body?.invalidationLevel ?? null,
    red_flags: body?.redFlags ?? null,
    plan_b: body?.planB ?? null,
    risk: body?.risk ?? null,
    checks: typeof body?.checks === 'object' ? body.checks : null,
  });
  return NextResponse.json({ ok: true });
}


