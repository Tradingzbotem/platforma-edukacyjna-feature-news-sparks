// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { findUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const s = await getSession();
  const c = await cookies();
  const legacyAuth = c.get('auth')?.value === '1';
  const legacyTier = c.get('tier')?.value || null;
  const legacyPlan = c.get('plan')?.value || null;

  const isLoggedIn = Boolean(s.userId) || legacyAuth;
  let plan = (s.plan as any) ?? legacyPlan ?? null;
  // If logged in, source-of-truth is DB users.plan to reflect admin toggles immediately
  if (s.userId) {
    const dbUser = await findUserById(s.userId).catch(() => null);
    if (dbUser?.plan === 'elite' || dbUser?.plan === 'pro' || dbUser?.plan === 'starter' || dbUser?.plan === 'free') {
      plan = dbUser.plan;
      if (s.plan !== plan) {
        s.plan = plan as any;
        await s.save();
      }
    } else if (!dbUser) {
      // user was deleted → clear session
      s.userId = undefined;
      s.email = undefined;
      s.plan = undefined;
      await s.save();
      plan = null;
    }
  }

  return NextResponse.json(
    {
      userId: s.userId ?? null,
      email: s.email ?? null,
      plan,
      tier: legacyTier, // optional, for UI hints
      isLoggedIn,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
