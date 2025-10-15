// app/dev-auth/mock-login/[plan]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  ctx: { params: { plan: string } }
) {
  // plan z URL: /dev-auth/mock-login/pro lub /dev-auth/mock-login/free
  const plan = ctx.params.plan?.toLowerCase() === 'pro' ? 'pro' : 'free';

  const res = NextResponse.redirect(new URL('/dev-auth', req.url));
  // ustawiamy cookies na całej domenie
  res.cookies.set('auth', '1', { path: '/' });
  res.cookies.set('plan', plan,   { path: '/' });
  return res;
}
