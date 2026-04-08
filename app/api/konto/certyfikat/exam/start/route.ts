import { NextResponse } from 'next/server';

import { isSelectableExamTrack } from '@/lib/certification-exam/constants';
import { startOrResumeExamAttempt } from '@/lib/certification-exam/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const rawTrack =
    typeof body === 'object' && body !== null && 'track' in body ? (body as { track?: unknown }).track : undefined;
  if (typeof rawTrack !== 'string' || !isSelectableExamTrack(rawTrack)) {
    return NextResponse.json({ ok: false, error: 'invalid_track' }, { status: 400 });
  }

  try {
    const result = await startOrResumeExamAttempt(session.userId, rawTrack);
    if (!result) {
      return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
    }
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.reason,
          activeAttempt: {
            id: result.activeAttempt.id,
            track: result.activeAttempt.track,
          },
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, attempt: result.attempt });
  } catch (e) {
    console.error('[exam/start POST]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
