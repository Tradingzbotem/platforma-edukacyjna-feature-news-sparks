import { NextResponse } from 'next/server';

import { parseAnswerPatchValue } from '@/lib/certification-exam/answersCodec';
import { submitExamAttempt } from '@/lib/certification-exam/service';
import type { ExamAnswersMap } from '@/lib/certification-exam/types';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ attemptId: string }> };

function parseOptionalAnswers(body: unknown): ExamAnswersMap | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const answers = (body as { answers?: unknown }).answers;
  if (answers === undefined) return undefined;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return undefined;
  const out: ExamAnswersMap = {};
  for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
    const p = parseAnswerPatchValue(v);
    if (p) out[k] = p;
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  if (!getPrisma()) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  const { attemptId } = await ctx.params;
  let json: unknown = null;
  try {
    const text = await req.text();
    if (text.trim()) json = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const override = json ? parseOptionalAnswers(json) : undefined;

  try {
    const result = await submitExamAttempt(attemptId, session.userId, override ?? null);
    if (!result.ok) {
      if (result.reason === 'not_found') {
        return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      }
      if (result.reason === 'missing_answers' || result.reason === 'incomplete_answers') {
        return NextResponse.json(
          { ok: false, error: result.reason === 'incomplete_answers' ? 'incomplete_answers' : 'missing_answers' },
          { status: 400 },
        );
      }
      if (result.reason === 'not_in_progress') {
        return NextResponse.json({ ok: false, error: 'not_in_progress' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: 'submit_failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, attempt: result.attempt });
  } catch (e) {
    console.error('[exam/submit POST]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
