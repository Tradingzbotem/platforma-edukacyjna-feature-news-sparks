import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { deleteUserCascade } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(_req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const { userId } = await ctx.params;
  await deleteUserCascade(userId);
  return NextResponse.json({ ok: true });
}


