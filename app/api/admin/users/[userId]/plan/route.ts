import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { updateUserPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }
  const { userId } = await ctx.params;
  let plan: unknown;
  try {
    const body = await req.json().catch(() => ({}));
    plan = (body as any)?.plan;
    if (plan !== 'free' && plan !== 'starter' && plan !== 'pro' && plan !== 'elite') {
      return NextResponse.json({ ok: false, error: 'INVALID_PLAN' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  await updateUserPlan(userId, plan as 'free' | 'starter' | 'pro' | 'elite');

  return NextResponse.json({ ok: true, plan });
}


