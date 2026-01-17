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
    const { symbol, direction, horizon, thesis, market_mode, confidence } = data || {};

    if (!symbol || !direction || !horizon || !thesis || !market_mode || confidence === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const context = `
Analizowana decyzja rynkowa:
- Symbol: ${symbol}
- Kierunek: ${direction === 'LONG' ? 'Wzrost' : 'Spadek'}
- Horyzont: ${horizon === 'INTRADAY' ? 'Na dziś' : horizon === 'SWING' ? 'Na kilka dni' : 'Na dłużej'}
- Teza decyzji: ${thesis}
- Sytuacja rynkowa: ${market_mode === 'TREND' ? 'Rynek w trendzie' : market_mode === 'RANGE' ? 'Rynek w konsolidacji' : 'Dzień z ważnymi wiadomościami'}
- Pewność: ${confidence}/5
`;

    const systemPrompt = `Jesteś ekspertem analizującym decyzje rynkowe w kontekście edukacyjnym.
Twoim zadaniem jest ocenić, czy zaproponowana decyzja jest sensowna i dobrze przemyślana PRZED jej podjęciem.

Zwróć uwagę na:
1. Czy teza decyzji jest logiczna i spójna z wybranym kierunkiem
2. Czy horyzont czasowy pasuje do sytuacji rynkowej
3. Czy poziom pewności jest adekwatny do sytuacji
4. Czy są jakieś oczywiste błędy w rozumowaniu
5. Czy decyzja jest zbyt impulsywna lub zbyt ostrożna

ODPOWIEDZ W FORMACIE JSON:
{
  "isGood": true | false, // czy decyzja jest dobra
  "opinion": "Szczegółowa opinia o decyzji...", // 2-4 zdania
  "strengths": ["punkt 1", "punkt 2"], // co jest dobre (jeśli isGood=true)
  "concerns": ["punkt 1", "punkt 2"], // co budzi wątpliwości (jeśli isGood=false lub są obawy)
  "suggestion": "Sugestia co można poprawić lub potwierdzenie że decyzja jest OK" // opcjonalna sugestia
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

    return NextResponse.json({
      success: true,
      isGood: opinion.isGood || false,
      opinion: opinion.opinion || 'Nie udało się przeanalizować decyzji.',
      strengths: opinion.strengths || [],
      concerns: opinion.concerns || [],
      suggestion: opinion.suggestion || '',
    });
  } catch (err: any) {
    console.error('Decision lab opinion error', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze decision' }, { status: 500 });
  }
}
