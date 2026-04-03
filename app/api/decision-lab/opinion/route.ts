import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/opinion
 * body: {
 *   symbol: string,
 *   direction: 'LONG' | 'SHORT',
 *   horizon: 'INTRADAY' | 'SWING' | 'POSITION',
 *   thesis: string,
 *   market_mode: 'TREND' | 'RANGE' | 'NEWS',
 *   confidence: number
 * }
 * 
 * Analizuje decyzję przed zapisaniem i daje opinię czy to dobra decyzja
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
    const { 
      symbol, 
      direction, 
      horizon, 
      thesis, 
      market_mode, 
      confidence,
      entry,
      stopLoss,
      takeProfit,
      riskPercent,
      invalidation,
      setupType,
      timeframes
    } = data || {};

    if (!symbol || !direction || !horizon || !thesis || !market_mode || confidence === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sl = Number(stopLoss);
    if (!isFinite(sl)) {
      return NextResponse.json({ error: 'Stop Loss jest wymagany (liczba)' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const context = [
      'Analizowana decyzja rynkowa:',
      `- Symbol: ${symbol}`,
      `- Kierunek: ${direction === 'LONG' ? 'Wzrost (LONG)' : 'Spadek (SHORT)'}`,
      `- Horyzont: ${horizon === 'INTRADAY' ? 'Na dziś' : horizon === 'SWING' ? 'Na kilka dni' : 'Na dłużej'}`,
      `- Teza decyzji: ${thesis}`,
      `- Sytuacja rynkowa: ${market_mode === 'TREND' ? 'Rynek w trendzie' : market_mode === 'RANGE' ? 'Rynek w konsolidacji' : 'Dzień z ważnymi wiadomościami'}`,
      `- Pewność: ${confidence}/5`,
      entry != null ? `- Entry: ${entry}` : `- Entry: (brak)`,
      `- Stop Loss: ${sl}`,
      takeProfit != null ? `- Take Profit: ${takeProfit}` : `- Take Profit: (brak)`,
      riskPercent != null ? `- Risk %: ${riskPercent}%` : `- Risk %: (brak)`,
      invalidation ? `- Invalidation: ${invalidation}` : `- Invalidation: (brak)`,
      setupType ? `- Setup Type: ${setupType}` : `- Setup Type: (brak)`,
      Array.isArray(timeframes) && timeframes.length ? `- Timeframes: ${timeframes.join(', ')}` : `- Timeframes: (brak)`
    ].join('\n');

    const systemPrompt = `Jesteś walidatorem decyzji rynkowych w kontekście edukacyjnym. Twoim zadaniem jest merytoryczna analiza decyzji PRZED jej podjęciem.

ZAKAZ: Nie używaj i nie wymyślaj danych rynkowych, których nie ma w kontekście (zakaz: CPI, MA, formacje, świeczki, "ostatnie sesje", wskaźniki techniczne, historyczne dane cenowe). Nie oceniaj kierunku rynku; oceniaj jakość planu i ryzyka.

MINIMALNE STANDARDY (wymuszaj):
1. Thesis: jeśli < 20 znaków lub zbyt ogólna (bez konkretu) -> verdict="NO_GO" lub "REVISE", w missing: "Doprecyzuj tezę (co konkretnie, dlaczego, kiedy)"
2. Stop Loss: zawsze wymagany -> hasSL=true (potwierdź to w riskManagement.hasSL)
3. Invalidation: jeśli brak -> invalidationQuality="MISSING", w rewriteDecision.invalidation zaproponuj konkretną wersję (np. "Dla LONG: zamknięcie H4 poniżej X", "Dla SHORT: zamknięcie H4 powyżej Y")
4. Risk %: jeśli brak -> w missing dodaj "Określ % ryzyka na transakcję"
5. Entry+TP: jeśli brak któregoś -> rr=null, w missing: "Określ Entry i Take Profit, aby obliczyć R:R"
6. R:R: oblicz TYLKO jeśli są WSZYSTKIE liczby (entry, takeProfit, stopLoss) i są POPRAWNE:
   - Dla LONG: jeśli entry <= sl -> rr=null, w risks: "Entry <= SL (błąd w parametrach)"
   - Dla SHORT: jeśli sl <= entry -> rr=null, w risks: "SL <= Entry (błąd w parametrach)"
   - Wzór LONG: (TP - Entry) / (Entry - SL), SHORT: (Entry - TP) / (SL - Entry)
7. NextChecks: max 6 pozycji, praktyczne (spread, płynność, warunki anulacji, plan wyjścia, timing wejścia)

WYMUSZ FORMAT:
- assumptions/missing/risks: ZAWSZE tablice (mogą być puste [])
- Jeśli verdict != "OK": preferuj 2-5 pozycji w missing/risks
- Ton: KONKRETNY - "Brakuje: X", "Ryzyko: Y", "Następny krok: Z" (NIE "warto rozważyć", "można pomyśleć")

VERDICT:
- "OK": wszystkie kluczowe elementy obecne, thesis konkretna, plan spójny
- "REVISE": potencjał ale brakuje/poprawić elementy (np. brak TP, słaba invalidation)
- "NO_GO": thesis zbyt ogólna <20 znaków, brak podstaw, ryzyko nieokreślone

ODPOWIEDZ W FORMACIE JSON (polski, konkretnie, zero psychologizowania):
{
  "verdict": "OK" | "REVISE" | "NO_GO",
  "headline": "krótkie zdanie max 90 znaków",
  "summary": "2-4 zdania, konkretne, bez lania wody",
  "assumptions": ["założenie 1", "założenie 2"],
  "missing": ["Brakuje: X", "Brakuje: Y"],
  "risks": ["Ryzyko: X", "Ryzyko: Y"],
  "riskManagement": {
    "hasSL": true | false,
    "rr": number | null,
    "positionRiskComment": "1-2 zdania o ryzyku"
  },
  "invalidationQuality": "GOOD" | "WEAK" | "MISSING",
  "nextChecks": ["Następny krok: X", "Następny krok: Y"],
  "rewriteDecision": {
    "thesis": "przepisana teza w 1-2 zdaniach (bardziej precyzyjna)",
    "invalidation": "lepsza wersja invalidation (jeśli brak/słaba)"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Przeanalizuj następującą decyzję przed jej podjęciem:\n\n${context}\n\nPamiętaj: To analiza przed podjęciem decyzji, nie po fakcie. Oceń czy decyzja jest przemyślana i sensowna.` },
      ],
      max_tokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let opinion: any = {};
    try {
      opinion = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response', e);
      return NextResponse.json({ error: 'Failed to parse AI opinion' }, { status: 500 });
    }

    // Validate required fields
    if (!opinion.verdict || !opinion.headline || !opinion.summary || !opinion.riskManagement) {
      console.error('AI response schema mismatch', content);
      return NextResponse.json({ error: 'AI response schema mismatch' }, { status: 500 });
    }

    return NextResponse.json(opinion);
  } catch (err: any) {
    console.error('Decision lab opinion error', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze decision' }, { status: 500 });
  }
}
