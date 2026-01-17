import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/features/me
 * Returns feature flags for the logged-in user
 */
export async function GET() {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS user_feature_flags (
        user_id TEXT NOT NULL,
        feature TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, feature)
      )
    `;

    const { rows } = await sql<{ feature: string; enabled: boolean }>`
      SELECT feature, enabled
      FROM user_feature_flags
      WHERE user_id = ${userId}
    `;

    // Convert to object for easier access
    const flags: Record<string, boolean> = {};
    rows.forEach((row) => {
      flags[row.feature] = row.enabled;
    });

    return NextResponse.json({ ok: true, flags }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
