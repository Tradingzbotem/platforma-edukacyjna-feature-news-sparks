import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { getPrisma } from '@/lib/prisma';
import { getFoundersTokenAdminForUser } from '@/lib/founders-token/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/founders-token/by-user?userId=
 * Podgląd rekordu Founders dla wskazanego użytkownika (wraz z notatką admina).
 */
export async function GET(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (!getPrisma()) {
    return NextResponse.json({ ok: false, error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
  }

  const userId = req.nextUrl.searchParams.get('userId')?.trim();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'MISSING_USER_ID' }, { status: 400 });
  }

  const token = await getFoundersTokenAdminForUser(userId);
  return NextResponse.json({ ok: true, token }, { headers: { 'Cache-Control': 'no-store' } });
}
