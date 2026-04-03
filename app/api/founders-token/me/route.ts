import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getFoundersTokenForUser, getTransferHistoryForToken } from '@/lib/founders-token/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/founders-token/me
 * Zwraca aktywny Founders Pass zalogowanego użytkownika (lub null) oraz krótką historię transferów.
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (!getPrisma()) {
    return NextResponse.json({ ok: false, error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
  }

  const token = await getFoundersTokenForUser(session.userId);
  const transfers = token ? await getTransferHistoryForToken(token.id) : [];

  return NextResponse.json(
    { ok: true, token, transfers },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
