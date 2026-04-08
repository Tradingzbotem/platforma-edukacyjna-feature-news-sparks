import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getIsAdmin } from '@/lib/admin';
import { getSession } from '@/lib/session';
import { issueCertificate, listCertificates } from '@/lib/certifications/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const trackSchema = z.enum(['FOREX_FUNDAMENTALS', 'TECHNICAL_ANALYSIS', 'RISK_MANAGEMENT']);

const postBodySchema = z.object({
  fullName: z.string().min(1).max(200),
  track: trackSchema,
  scorePercent: z.coerce.number().int().min(0).max(100),
  notes: z.string().max(5000).optional().nullable(),
  userId: z.string().max(128).optional().nullable(),
  createdByAdminUserId: z.string().max(128).optional().nullable(),
  skillBreakdownJson: z.unknown().optional().nullable(),
});

export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  try {
    const items = await listCertificates();
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error('[admin/certifications GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  let body: z.infer<typeof postBodySchema>;
  try {
    const json = await req.json();
    body = postBodySchema.parse(json);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid_body', detail: String(e) }, { status: 400 });
  }

  const session = await getSession();
  const createdByAdminUserId = body.createdByAdminUserId ?? session.userId ?? null;

  try {
    const created = await issueCertificate({
      fullName: body.fullName,
      track: body.track,
      scorePercent: body.scorePercent,
      notes: body.notes ?? null,
      userId: body.userId ?? null,
      createdByAdminUserId,
      skillBreakdownJson: body.skillBreakdownJson ?? null,
    });

    if (!created) {
      return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, certificate: created });
  } catch (e) {
    console.error('[admin/certifications POST]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
