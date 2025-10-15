// app/dev-auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/dev-auth', req.url));
  const expired = new Date(0);
  res.cookies.set('auth', '', { path: '/', expires: expired });
  res.cookies.set('plan', '', { path: '/', expires: expired });
  return res;
}
