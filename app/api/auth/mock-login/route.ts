// app/api/auth/mock-login/route.ts
import { NextResponse } from 'next/server';

type Tier = 'free' | 'starter' | 'pro' | 'elite';

function setMockCookies(res: NextResponse, tier: Tier) {
  // map tier -> legacy plan for app-wide compatibility
  const plan: 'free' | 'pro' = (tier === 'pro' || tier === 'elite') ? 'pro' : 'free';
  res.cookies.set('auth', '1', { path: '/', httpOnly: false, sameSite: 'lax' });
  res.cookies.set('tier', tier, { path: '/', httpOnly: false, sameSite: 'lax' });
  res.cookies.set('plan', plan, { path: '/', httpOnly: false, sameSite: 'lax' });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const planParam = (url.searchParams.get('plan') || 'free').toLowerCase();
  const tier: Tier =
    planParam === 'starter' ? 'starter' :
    planParam === 'pro' ? 'pro' :
    planParam === 'elite' ? 'elite' :
    'free';

  const res = NextResponse.redirect(new URL('/konto/panel-rynkowy', req.url));
  setMockCookies(res, tier);
  return res;
}

export async function POST(req: Request) {
  let data: any = {};
  try { data = await req.json(); } catch {}
  const raw = String(data?.plan ?? 'free').toLowerCase();
  const tier: Tier = raw === 'starter' ? 'starter' : raw === 'pro' ? 'pro' : raw === 'elite' ? 'elite' : 'free';

  const res = NextResponse.redirect(new URL('/konto/panel-rynkowy', req.url));
  setMockCookies(res, tier);
  return res;
}
