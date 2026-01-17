import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PATCH /api/decision-lab/entries/[id]
 * body: {
 *   status?: 'OPEN' | 'REVIEWED',
 *   outcome?: 'WIN' | 'LOSE' | 'NEUTRAL',
 *   note?: string,
 *   reviewed_at?: string (ISO timestamp),
 *   actual_action?: 'ENTERED_AS_PLANNED' | 'DID_NOT_ENTER' | 'CHANGED_MIND' | 'ENTERED_DIFFERENTLY' | 'WAITED_TOO_LONG'
 * }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check feature flag
    const hasDecisionLab = await hasFeature(userId, 'decision_lab');
    if (!hasDecisionLab) {
      return NextResponse.json({ error: 'feature_disabled' }, { status: 403 });
    }

    const { id } = await params;
    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
    }

    const data = await req.json();
    const { status, outcome, note, reviewed_at, actual_action } = data || {};

    // Validate allowed fields
    if (status !== undefined && !['OPEN', 'REVIEWED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (outcome !== undefined && !['WIN', 'LOSE', 'NEUTRAL'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
    }

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // First, verify the entry belongs to the user
    const checkResult = await sql`
      SELECT id FROM decision_lab_entries
      WHERE id = ${entryId} AND user_id = ${userId}
    `;

    if (!checkResult || checkResult.length === 0) {
      return NextResponse.json({ error: 'Entry not found or access denied' }, { status: 404 });
    }

    // Build update query - only update fields that are provided
    // Use conditional SQL fragments
    const hasStatus = status !== undefined;
    const hasOutcome = outcome !== undefined;
    const hasNote = note !== undefined;
    const hasReviewedAt = reviewed_at !== undefined;
    const hasActualAction = actual_action !== undefined;
    const shouldAutoSetReviewedAt = status === 'REVIEWED' && !hasReviewedAt;

    if (!hasStatus && !hasOutcome && !hasNote && !hasReviewedAt && !hasActualAction && !shouldAutoSetReviewedAt) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Ensure schema has new columns
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS emotional_state TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS actual_action TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS risk_notes TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS time_of_day TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analysis JSONB NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ NULL`;

    const finalResult = await sql`
      UPDATE decision_lab_entries
      SET 
        ${hasStatus ? sql`status = ${status}` : sql`status = status`},
        ${hasOutcome ? sql`outcome = ${outcome}` : sql`outcome = outcome`},
        ${hasNote ? sql`note = ${note}` : sql`note = note`},
        ${hasActualAction ? sql`actual_action = ${actual_action}` : sql`actual_action = actual_action`},
        reviewed_at = CASE
          ${hasReviewedAt 
            ? sql`WHEN TRUE THEN ${reviewed_at ? new Date(reviewed_at).toISOString() : null}`
            : sql``
          }
          ${shouldAutoSetReviewedAt 
            ? sql`WHEN reviewed_at IS NULL THEN ${new Date().toISOString()}`
            : sql``
          }
          ELSE reviewed_at
        END
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, ai_analysis, ai_analyzed_at
    `;

    if (!finalResult || finalResult.length === 0) {
      return NextResponse.json({ error: 'Entry not found or no changes made' }, { status: 404 });
    }

    const row = finalResult[0] as any;
    return NextResponse.json(row);
  } catch (err: any) {
    console.error('Decision lab entry update error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
