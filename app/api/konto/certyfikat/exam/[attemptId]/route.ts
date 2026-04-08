import { NextResponse } from 'next/server';

import { getIsAdmin } from '@/lib/admin';
import { parseAnswerPatchValue } from '@/lib/certification-exam/answersCodec';
import {
  getAdminPreviewQuestionsForAttempt,
  getExamAttemptForUser,
  getPublicQuestionsForAttempt,
  patchExamAnswers,
} from '@/lib/certification-exam/service';
import type { ExamAnswersMap } from '@/lib/certification-exam/types';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ attemptId: string }> };

function parseAnswersBody(body: unknown): ExamAnswersMap | null {
  if (!body || typeof body !== 'object') return null;
  const answers = (body as { answers?: unknown }).answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return null;
  const out: ExamAnswersMap = {};
  for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
    const p = parseAnswerPatchValue(v);
    if (p) out[k] = p;
  }
  return Object.keys(out).length ? out : null;
}

export async function GET(_req: Request, ctx: Ctx) {
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
  try {
    const attempt = await getExamAttemptForUser(attemptId, session.userId);
    if (!attempt) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    const isAdmin = await getIsAdmin();
    const questions = isAdmin ? getAdminPreviewQuestionsForAttempt(attempt) : getPublicQuestionsForAttempt(attempt);
    return NextResponse.json({ ok: true, attempt, questions });
  } catch (e) {
    console.error('[exam/[attemptId] GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
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
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const patch = parseAnswersBody(json);
  if (!patch) {
    return NextResponse.json({ ok: false, error: 'invalid_answers' }, { status: 400 });
  }

  try {
    const attempt = await patchExamAnswers(attemptId, session.userId, patch);
    if (!attempt) {
      return NextResponse.json({ ok: false, error: 'not_found_or_not_editable' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, attempt });
  } catch (e) {
    console.error('[exam/[attemptId] PATCH]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
