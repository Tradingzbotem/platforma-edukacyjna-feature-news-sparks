import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession } from '@/lib/panel/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const c = await cookies();
    const session = await getSession();
    const tier = resolveTierFromCookiesAndSession(c, session);
    return NextResponse.json({ tier });
  } catch {
    return NextResponse.json({ tier: 'free' });
  }
}
