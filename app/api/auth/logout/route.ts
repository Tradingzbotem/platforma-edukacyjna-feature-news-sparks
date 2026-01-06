// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

function clearLegacyCookies(res: NextResponse) {
  // Wyczyść stare ciasteczka z mocków (żeby nie mieszały z sesją)
  const expired = new Date(0);
  ['auth', 'plan', 'tier', 'name', 'email'].forEach((name) =>
    res.cookies.set(name, '', { path: '/', expires: expired })
  );
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  await session.destroy();

  const res = NextResponse.redirect(new URL('/', req.url));
  clearLegacyCookies(res);
  return res;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  await session.destroy();

  const res = NextResponse.redirect(new URL('/', req.url));
  clearLegacyCookies(res);
  return res;
}
