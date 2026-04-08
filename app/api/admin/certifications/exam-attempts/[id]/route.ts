import { NextResponse } from 'next/server';

import { getIsAdmin } from '@/lib/admin';
import { deleteExamAttemptAsAdmin } from '@/lib/certification-exam/adminExamAttempts';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  }

  if (!getPrisma()) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  try {
    const deleted = await deleteExamAttemptAsAdmin(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/certifications/exam-attempts/[id] DELETE]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
