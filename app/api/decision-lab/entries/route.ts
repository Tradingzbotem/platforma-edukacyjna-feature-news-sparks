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
    const { symbol, direction, horizon, thesis, market_mode, confidence, emotional_state, risk_notes, entry, stopLoss, takeProfit, riskPercent, invalidation, setupType, timeframes } = data || {};
    
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

    // Validate optional numeric fields
    if (entry !== undefined && entry !== null && !isFinite(Number(entry))) {
      return NextResponse.json({ error: 'entry must be a number' }, { status: 400 });
    }
    if (stopLoss !== undefined && stopLoss !== null && !isFinite(Number(stopLoss))) {
      return NextResponse.json({ error: 'stopLoss must be a number' }, { status: 400 });
    }
    if (takeProfit !== undefined && takeProfit !== null && !isFinite(Number(takeProfit))) {
      return NextResponse.json({ error: 'takeProfit must be a number' }, { status: 400 });
    }
    if (riskPercent !== undefined && riskPercent !== null) {
      const riskNum = Number(riskPercent);
      if (!isFinite(riskNum) || riskNum <= 0 || riskNum > 10) {
        return NextResponse.json({ error: 'riskPercent must be a number between 0 and 10' }, { status: 400 });
      }
    }

    // Validate timeframes
    if (timeframes !== undefined && timeframes !== null) {
      if (!Array.isArray(timeframes)) {
        return NextResponse.json({ error: 'timeframes must be an array' }, { status: 400 });
      }
      const validTimeframes = ['H1', 'H4', 'D1'];
      if (timeframes.some((tf: any) => !validTimeframes.includes(tf))) {
        return NextResponse.json({ error: 'timeframes must contain only H1, H4, or D1' }, { status: 400 });
      }
    }

    // Validate setupType
    if (setupType !== undefined && setupType !== null && setupType !== '') {
      const validSetupTypes = ['BREAKOUT', 'PULLBACK', 'REVERSAL', 'NEWS', 'OTHER'];
      if (!validSetupTypes.includes(setupType)) {
        return NextResponse.json({ error: 'setupType must be one of: BREAKOUT, PULLBACK, REVERSAL, NEWS, OTHER' }, { status: 400 });
      }
    }

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('DB host', new URL(connStr).host);
      console.log('DB dbname', new URL(connStr).pathname);
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

    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_created_at ON decision_lab_entries (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_status ON decision_lab_entries (user_id, status)`;

    const entryNum = entry !== undefined && entry !== null ? Number(entry) : null;
    const stopLossNum = stopLoss !== undefined && stopLoss !== null ? Number(stopLoss) : null;
    const takeProfitNum = takeProfit !== undefined && takeProfit !== null ? Number(takeProfit) : null;
    const riskPercentNum = riskPercent !== undefined && riskPercent !== null ? Number(riskPercent) : null;
    const timeframesArray = Array.isArray(timeframes) && timeframes.length > 0 ? timeframes : null;

    const result = await sql`
      INSERT INTO decision_lab_entries (user_id, symbol, direction, horizon, thesis, market_mode, confidence, emotional_state, risk_notes, time_of_day, entry, stop_loss, take_profit, risk_percent, invalidation, setup_type, timeframes)
      VALUES (${userId}, ${symbol}, ${direction}, ${horizon}, ${thesis}, ${market_mode}, ${confidence}, ${emotional_state || null}, ${risk_notes || null}, ${timeOfDay}, ${entryNum}, ${stopLossNum}, ${takeProfitNum}, ${riskPercentNum}, ${invalidation || null}, ${setupType || null}, ${timeframesArray})
      RETURNING id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, entry, stop_loss, take_profit, risk_percent, invalidation, setup_type, timeframes
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
    if (process.env.NODE_ENV === 'development') {
      console.log('DB host', new URL(connStr).host);
      console.log('DB dbname', new URL(connStr).pathname);
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

    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_created_at ON decision_lab_entries (user_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_decision_lab_user_status ON decision_lab_entries (user_id, status)`;

    let query;
    if (statusFilter === 'open' || statusFilter === 'reviewed') {
      query = sql`
        SELECT id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, ai_analysis, ai_analyzed_at, entry, stop_loss, take_profit, risk_percent, invalidation, setup_type, timeframes
        FROM decision_lab_entries
        WHERE user_id = ${userId} AND status = ${statusFilter.toUpperCase()}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, status, outcome, note, created_at, reviewed_at, emotional_state, actual_action, risk_notes, time_of_day, ai_analysis, ai_analyzed_at, entry, stop_loss, take_profit, risk_percent, invalidation, setup_type, timeframes
        FROM decision_lab_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;
    const rows = result as unknown as any[];

    // Konwersja NUMERIC na number
    const toNum = (v: any): number | null => {
      if (v === null || v === undefined) return null;
      const num = Number(v);
      return isNaN(num) ? null : num;
    };

    // Normalizacja timeframes do string[]
    const normalizeTimeframes = (tf: any): string[] => {
      if (tf === null || tf === undefined) return [];
      if (Array.isArray(tf)) return tf;
      if (typeof tf === 'string') {
        if (tf.startsWith('[')) {
          try {
            const parsed = JSON.parse(tf);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        if (tf.startsWith('{')) {
          // PostgreSQL array format: {H1,H4} -> ['H1', 'H4']
          return tf
            .replace(/^\{|\}$/g, '')
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
        return [];
      }
      return [];
    };

    // Mapowanie snake_case do camelCase
    const mappedRows = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      symbol: row.symbol,
      direction: row.direction,
      horizon: row.horizon,
      thesis: row.thesis,
      market_mode: row.market_mode,
      confidence: row.confidence,
      status: row.status,
      outcome: row.outcome,
      note: row.note,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
      emotional_state: row.emotional_state,
      actual_action: row.actual_action,
      risk_notes: row.risk_notes,
      time_of_day: row.time_of_day,
      ai_analysis: row.ai_analysis,
      ai_analyzed_at: row.ai_analyzed_at,
      entry: toNum(row.entry),
      stopLoss: toNum(row.stop_loss),
      takeProfit: toNum(row.take_profit),
      riskPercent: toNum(row.risk_percent),
      invalidation: row.invalidation,
      setupType: row.setup_type,
      timeframes: normalizeTimeframes(row.timeframes),
    }));

    return NextResponse.json(mappedRows);
  } catch (err: any) {
    console.error('Decision lab entries list error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
