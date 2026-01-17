import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/analyze
 * body: { entry_id: number }
 * 
 * Automatycznie analizuje decyzję przez AI na podstawie danych rynkowych
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

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const data = await req.json();
    const { entry_id } = data || {};

    if (!entry_id || typeof entry_id !== 'number') {
      return NextResponse.json({ error: 'Invalid entry_id' }, { status: 400 });
    }

    // sanitize Neon connection string
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // Fetch entry
    const entryResult = await sql`
      SELECT id, user_id, symbol, direction, horizon, thesis, market_mode, confidence, 
             created_at, status, outcome, emotional_state, risk_notes
      FROM decision_lab_entries
      WHERE id = ${entry_id} AND user_id = ${userId}
    `;

    if (!entryResult || entryResult.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entry = entryResult[0] as any;

    // Calculate time elapsed since decision
    const decisionDate = new Date(entry.created_at);
    const now = new Date();
    const hoursElapsed = Math.floor((now.getTime() - decisionDate.getTime()) / (1000 * 60 * 60));
    const daysElapsed = Math.floor(hoursElapsed / 24);

    // Determine if enough time has passed based on horizon
    const minHoursByHorizon: Record<string, number> = {
      INTRADAY: 4, // Check after 4 hours
      SWING: 24, // Check after 1 day
      POSITION: 72, // Check after 3 days
    };
    const minHours = minHoursByHorizon[entry.horizon] || 24;

    if (hoursElapsed < minHours) {
      return NextResponse.json({
        error: `Za wcześnie na analizę. Minimalny czas: ${minHours} godzin (horizon: ${entry.horizon})`,
        can_analyze_after: new Date(decisionDate.getTime() + minHours * 60 * 60 * 1000).toISOString(),
      }, { status: 400 });
    }

    // Build context for AI analysis
    const context = `
Decyzja rynkowa do analizy:
- Symbol: ${entry.symbol}
- Kierunek: ${entry.direction === 'LONG' ? 'Wzrost' : 'Spadek'}
- Horyzont: ${entry.horizon === 'INTRADAY' ? 'Na dziś' : entry.horizon === 'SWING' ? 'Na kilka dni' : 'Na dłużej'}
- Teza decyzji: ${entry.thesis}
- Sytuacja rynkowa w momencie decyzji: ${entry.market_mode === 'TREND' ? 'Rynek w trendzie' : entry.market_mode === 'RANGE' ? 'Rynek w konsolidacji' : 'Dzień z ważnymi wiadomościami'}
- Pewność: ${entry.confidence}/5
${entry.emotional_state ? `- Stan emocjonalny: ${entry.emotional_state}` : ''}
${entry.risk_notes ? `- Notatki o ryzyku: ${entry.risk_notes}` : ''}
- Data decyzji: ${decisionDate.toLocaleString('pl-PL')}
- Czas od decyzji: ${daysElapsed > 0 ? `${daysElapsed} dni` : `${hoursElapsed} godzin`}
`;

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Jesteś ekspertem analizującym decyzje rynkowe w kontekście edukacyjnym. 
Twoim zadaniem jest ocenić, czy decyzja była trafna na podstawie horyzontu czasowego i warunków rynkowych.
Analizuj obiektywnie, zwracając uwagę na:
1. Czy rynek faktycznie poszedł w zaplanowanym kierunku w określonym horyzoncie
2. Czy teza decyzji była słuszna
3. Co można było zrobić lepiej (timing, zarządzanie ryzykiem, wybór instrumentu)
4. Czego można się nauczyć z tej decyzji

ODPOWIEDZ W FORMACIE JSON:
{
  "outcome": "WIN" | "LOSE" | "NEUTRAL",
  "score": 0-100, // ocena trafności decyzji
  "analysis": "Szczegółowa analiza decyzji...",
  "what_went_well": ["punkt 1", "punkt 2"],
  "what_could_be_better": ["punkt 1", "punkt 2"],
  "lessons_learned": ["lekcja 1", "lekcja 2"],
  "market_context": "Opis tego co faktycznie działo się na rynku"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Przeanalizuj następującą decyzję:\n\n${context}\n\nPamiętaj: Nie masz dostępu do rzeczywistych danych cenowych w tym momencie, więc oceń na podstawie ogólnej wiedzy o rynkach i kontekstu decyzji. Jeśli to możliwe, zasugeruj obiektywną ocenę.` },
      ],
      max_tokens: 1500,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let aiAnalysis: any = {};
    try {
      aiAnalysis = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response', e);
      aiAnalysis = {
        outcome: 'NEUTRAL',
        score: 50,
        analysis: 'Nie udało się przeanalizować decyzji automatycznie.',
        what_went_well: [],
        what_could_be_better: [],
        lessons_learned: [],
        market_context: '',
      };
    }

    // Update entry with AI analysis
    const updateResult = await sql`
      UPDATE decision_lab_entries
      SET 
        ai_analysis = ${JSON.stringify(aiAnalysis)}::jsonb,
        ai_analyzed_at = ${new Date().toISOString()},
        status = 'REVIEWED',
        outcome = ${aiAnalysis.outcome || null},
        reviewed_at = COALESCE(reviewed_at, ${new Date().toISOString()})
      WHERE id = ${entry_id} AND user_id = ${userId}
      RETURNING id, ai_analysis, ai_analyzed_at, status, outcome, reviewed_at
    `;

    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      entry: updateResult[0],
    });
  } catch (err: any) {
    console.error('Decision lab AI analysis error', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze decision' }, { status: 500 });
  }
}
