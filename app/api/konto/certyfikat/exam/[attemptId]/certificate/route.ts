import { NextResponse } from 'next/server';

import type { CertificationExamAttemptStatus } from '@/lib/certification-exam/types';
import { getExamAttemptForUser } from '@/lib/certification-exam/service';
import { ensureCertificateFromPassedExamAttempt, getIssuedCertificateForUserAndTrack } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function isTerminalStatus(status: CertificationExamAttemptStatus): boolean {
  return status !== 'IN_PROGRESS' && status !== 'NOT_STARTED';
}

type RouteCtx = { params: Promise<{ attemptId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
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
  const attempt = await getExamAttemptForUser(attemptId, session.userId);
  if (!attempt) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const terminal = isTerminalStatus(attempt.status);
  const cert = await getIssuedCertificateForUserAndTrack(session.userId, attempt.track);

  return NextResponse.json({
    ok: true,
    isTerminal: terminal,
    passed: attempt.passed,
    existingRecordId: cert?.id ?? null,
    redirectPath: cert ? `/konto/certyfikat/moj/${encodeURIComponent(cert.id)}` : null,
  });
}

export async function POST(_req: Request, ctx: RouteCtx) {
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
  const result = await ensureCertificateFromPassedExamAttempt(session.userId, attemptId);

  if (!result.ok) {
    const status =
      result.error === 'unauthorized'
        ? 401
        : result.error === 'not_found'
          ? 404
          : result.error === 'not_terminal'
            ? 409
            : result.error === 'not_passed'
              ? 403
              : result.error === 'user_profile'
                ? 400
                : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    created: result.created,
    certificateId: result.certificate.id,
    redirectPath: `/konto/certyfikat/moj/${encodeURIComponent(result.certificate.id)}`,
  });
}
