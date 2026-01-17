import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/feature-flags
 * Body: {
 *   userId: string,
 *   feature: "decision_lab",
 *   enabled: boolean
 * }
 */
export async function POST(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, feature, enabled } = body;

    if (!userId || !feature || typeof enabled !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'INVALID_PARAMS' }, { status: 400 });
    }

    // Validate feature name
    if (feature !== 'decision_lab') {
      return NextResponse.json({ ok: false, error: 'INVALID_FEATURE' }, { status: 400 });
    }

    // Ensure table exists (idempotent)
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
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user_id ON user_feature_flags (user_id)`;

    // UPSERT feature flag
    await sql`
      INSERT INTO user_feature_flags (user_id, feature, enabled, updated_at)
      VALUES (${userId}, ${feature}, ${enabled}, now())
      ON CONFLICT (user_id, feature)
      DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()
    `;

    return NextResponse.json({ ok: true, userId, feature, enabled });
  } catch (error: any) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}

/**
 * GET /api/admin/feature-flags?userId=xxx
 * Returns all feature flags for a user
 */
export async function GET(req: NextRequest) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'MISSING_USER_ID' }, { status: 400 });
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

    return NextResponse.json({ ok: true, flags: rows });
  } catch (error: any) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json({ ok: false, error: error.message || 'INTERNAL_ERROR' }, { status: 500 });
  }
}
