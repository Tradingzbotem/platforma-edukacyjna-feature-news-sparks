import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getIsAdmin } from '@/lib/admin';
import { deleteCertificate, getCertificateById, revokeCertificate } from '@/lib/certifications/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const patchBodySchema = z.object({
  action: z.literal('revoke'),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  }

  try {
    const row = await getCertificateById(id);
    if (!row) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, certificate: row });
  } catch (e) {
    console.error('[admin/certifications/[id] GET]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  }

  let body: z.infer<typeof patchBodySchema>;
  try {
    const json = await req.json();
    body = patchBodySchema.parse(json);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid_body', detail: String(e) }, { status: 400 });
  }

  if (body.action !== 'revoke') {
    return NextResponse.json({ ok: false, error: 'unsupported_action' }, { status: 400 });
  }

  try {
    const updated = await revokeCertificate(id);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, certificate: updated });
  } catch (e) {
    console.error('[admin/certifications/[id] PATCH]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  }

  try {
    const ok = await deleteCertificate(id);
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/certifications/[id] DELETE]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
