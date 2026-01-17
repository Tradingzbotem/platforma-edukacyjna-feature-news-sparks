import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { deleteContactMessage, updateContactMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
  }
  let body: any = {};
  try {
    body = await req.json().catch(() => ({}));
  } catch {}
  const updates: { handled?: boolean; admin_note?: string | null } = {};
  if (typeof body.handled === 'boolean') updates.handled = body.handled;
  if (typeof body.admin_note !== 'undefined') updates.admin_note = body.admin_note ?? null;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: 'NO_UPDATES' }, { status: 400 });
  }
  await updateContactMessage(numericId, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
  }
  await deleteContactMessage(numericId);
  return NextResponse.json({ ok: true });
}


