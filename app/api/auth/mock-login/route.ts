// app/api/auth/mock-login/route.ts
import { NextResponse } from 'next/server';

function setMockCookies(res: NextResponse, plan: 'free' | 'pro') {
  res.cookies.set('auth', '1', { path: '/', httpOnly: false });
  res.cookies.set('plan', plan,   { path: '/', httpOnly: false });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const planParam = (url.searchParams.get('plan') || 'free').toLowerCase();
  const plan: 'free' | 'pro' = planParam === 'pro' ? 'pro' : 'free';

  const res = NextResponse.redirect(new URL('/dev-auth', req.url));
  setMockCookies(res, plan);
  return res;
}

export async function POST(req: Request) {
  let data: any = {};
  try { data = await req.json(); } catch {}
  const plan: 'free' | 'pro' = data?.plan === 'pro' ? 'pro' : 'free';

  const res = NextResponse.json({ ok: true, plan });
  setMockCookies(res, plan);
  return res;
}
