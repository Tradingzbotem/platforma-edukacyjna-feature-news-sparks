import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/entries
 * body: {
 *   symbol: string,
 *   direction: 'LONG' | 'SHORT',
 *   horizon: 'INTRADAY' | 'SWING' | 'POSITION',
 *   thesis: string (max 240),
 *   market_mode: 'TREND' | 'RANGE' | 'NEWS',
 *   confidence: number (1-5),
 *   emotional_state?: 'CALM' | 'ANXIOUS' | 'EXCITED' | 'RUSHED' | 'CONFIDENT' | 'UNCERTAIN',
 *   risk_notes?: string (max 200)
 * }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check feature flag
    const hasDecisionLab = await hasFeature(userId, 'decision_lab');
    if (!hasDecisionLab) {
      return NextResponse.json({ error: 'feature_disabled' }, { status: 403 });
    }

    const data = await req.json();
    const { symbol, direction, horizon, thesis, market_mode, confidence, emotional_state, risk_notes } = data || {};
    
    // Extract time of day from timestamp
    const timeOfDay = (() => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) return 'MORNING';
      if (hour >= 12 && hour < 18) return 'AFTERNOON';
      if (hour >= 18 && hour < 22) return 'EVENING';
      return 'NIGHT';
    })();

    // Validation
    if (!symbol || !direction || !horizon || !thesis || !market_mode || confidence === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['LONG', 'SHORT'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    if (!['INTRADAY', 'SWING', 'POSITION'].includes(horizon)) {
      return NextResponse.json({ error: 'Invalid horizon' }, { status: 400 });
    }

    if (!['TREND', 'RANGE', 'NEWS'].includes(market_mode)) {
      return NextResponse.json({ error: 'Invalid market_mode' }, { status: 400 });
    }

    if (typeof confidence !== 'number' || confidence < 1 || confidence > 5) {
      return NextResponse.json({ error: 'Confidence must be between 1 and 5' }, { status: 400 });
    }

    if (typeof thesis !== 'string' || thesis.length > 240) {
      return NextResponse.json({ error: 'Thesis must be a string with max 240 characters' }, { status: 400 });
    }

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // ensure schema (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS decision_lab_entries (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        direction TEXT NOT NULL,
        horizon TEXT NOT NULL,
        thesis TEXT NOT NULL,
        market_mode TEXT NOT NULL,
        confidence INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        outcome TEXT NULL,
        note TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        reviewed_at TIMESTAMPTZ NULL
      )
    `;

    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'OPEN'`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS outcome TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS note TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS emotional_state TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS actual_action TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS risk_notes TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS time_of_day TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analysis JSONB NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ NULL`;

    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_created_at ON decision_lab_entries (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_status ON decision_lab_entries (user_id, status)`;

    const result = await sql`
      INSERT INTO decision_lab_entries (user_id, symbol, direction, horizon, thesis, market_mode, confidence, emotional_state, risk_notes, time_of_day)
      VALUES (${userId}, ${symbol}, ${direction}, ${horizon}, ${thesis}, ${market_mode}, ${confidence}, ${emotional_state || null}, ${risk_notes || null}, ${timeOfDay})
      RETURNING id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day
    `;

    const row = result[0] as any;
    return NextResponse.json(row);
  } catch (err: any) {
    console.error('Decision lab entry insert error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/decision-lab/entries?status=open|reviewed&limit=50
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check feature flag
    const hasDecisionLab = await hasFeature(userId, 'decision_lab');
    if (!hasDecisionLab) {
      return NextResponse.json({ error: 'feature_disabled' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // ensure schema (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS decision_lab_entries (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        direction TEXT NOT NULL,
        horizon TEXT NOT NULL,
        thesis TEXT NOT NULL,
        market_mode TEXT NOT NULL,
        confidence INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        outcome TEXT NULL,
        note TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        reviewed_at TIMESTAMPTZ NULL,
        emotional_state TEXT NULL,
        actual_action TEXT NULL,
        risk_notes TEXT NULL,
        time_of_day TEXT NULL
      )
    `;

    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS emotional_state TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS actual_action TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS risk_notes TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS time_of_day TEXT NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analysis JSONB NULL`;
    await sql`ALTER TABLE decision_lab_entries ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ NULL`;

    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_created_at ON decision_lab_entries (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_status ON decision_lab_entries (user_id, status)`;

    let query;
    if (statusFilter === 'open' || statusFilter === 'reviewed') {
      query = sql`
        SELECT id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, ai_analysis, ai_analyzed_at
        FROM decision_lab_entries
        WHERE user_id = ${userId} AND status = ${statusFilter.toUpperCase()}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, ai_analysis, ai_analyzed_at
        FROM decision_lab_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;
    const rows = result as unknown as any[];

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Decision lab entries list error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
