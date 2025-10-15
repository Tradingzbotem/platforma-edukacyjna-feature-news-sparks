import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { insertQuizResult } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const slug = String(body?.slug ?? '').trim();
  const scoreNum = Number(body?.score ?? NaN);
  const totalNum = Number(body?.total ?? NaN);
  const at = body?.at ? new Date(body.at) : undefined;
  if (!slug || !Number.isFinite(scoreNum) || !Number.isFinite(totalNum)) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }
  await insertQuizResult({ userId: session.userId, slug, score: scoreNum, total: totalNum, at });
  return NextResponse.json({ ok: true });
}


