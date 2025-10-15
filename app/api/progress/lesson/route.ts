import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { upsertLessonProgress } from '@/lib/db';

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
  const course = String(body?.course ?? '').trim();
  const lessonId = String(body?.lessonId ?? '').trim();
  const done = Boolean(body?.done ?? true);
  if (!course || !lessonId) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
  }
  await upsertLessonProgress({ userId: session.userId, course, lessonId, done });
  return NextResponse.json({ ok: true });
}


