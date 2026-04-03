import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/thesis-improve
 * body: {
 *   symbol: string,
 *   direction: 'LONG' | 'SHORT',
 *   horizon: 'INTRADAY' | 'SWING' | 'POSITION',
 *   thesis: string,
 *   market_mode: 'TREND' | 'RANGE' | 'NEWS',
 *   entry?: number,
 *   stopLoss?: number,
 *   takeProfit?: number,
 *   invalidation?: string,
 *   setupType?: string,
 *   timeframes?: string[]
 * }
 * 
 * Ulepsza tezę decyzji rynkowej przez przepisanie na 1-2 zdania z konkretami
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
      entry,
      stopLoss,
      takeProfit,
      invalidation,
      setupType,
      timeframes
    } = data || {};

    if (!symbol || !direction || !horizon || !thesis || !market_mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const context = [
      'Decyzja rynkowa do ulepszenia tezy:',
      `- Symbol: ${symbol}`,
      `- Kierunek: ${direction === 'LONG' ? 'Wzrost (LONG)' : 'Spadek (SHORT)'}`,
      `- Horyzont: ${horizon === 'INTRADAY' ? 'Na dziś' : horizon === 'SWING' ? 'Na kilka dni' : 'Na dłużej'}`,
      `- Aktualna teza: ${thesis}`,
      `- Sytuacja rynkowa: ${market_mode === 'TREND' ? 'Rynek w trendzie' : market_mode === 'RANGE' ? 'Rynek w konsolidacji' : 'Dzień z ważnymi wiadomościami'}`,
      entry != null ? `- Entry: ${entry}` : `- Entry: (brak)`,
      stopLoss != null ? `- Stop Loss: ${stopLoss}` : `- Stop Loss: (brak)`,
      takeProfit != null ? `- Take Profit: ${takeProfit}` : `- Take Profit: (brak)`,
      invalidation ? `- Invalidation: ${invalidation}` : `- Invalidation: (brak)`,
      setupType ? `- Setup Type: ${setupType}` : `- Setup Type: (brak)`,
      Array.isArray(timeframes) && timeframes.length ? `- Timeframes: ${timeframes.join(', ')}` : `- Timeframes: (brak)`
    ].join('\n');

    const systemPrompt = `Jesteś asystentem ulepszającym tezy decyzyjne w kontekście edukacyjnym. Twoim zadaniem jest przepisanie tezy na 1-2 zdania, konkretnie i zwięźle.

ZAKAZ: NIE wymyślaj danych rynkowych (CPI, MA, RSI, wskaźniki techniczne, historyczne dane cenowe). Masz TYLKO dane z payloadu.

CEL:
- Przepisz tezę na 1-2 zdania, konkretnie: warunek wejścia, warunek anulowania, spójność z kierunkiem i horyzontem.
- Jeśli brakuje konkretów (poziomy/liczby), dopisz placeholdery w stylu: "po wybiciu powyżej [poziom]" albo "po zamknięciu H1/H4 powyżej [poziom]" — ale TYLKO jeśli użytkownik nie podał liczby; NIE wymyślaj liczb.
- Używaj konkretów z payloadu (entry, stopLoss, takeProfit, setupType, timeframes) jeśli są dostępne.
- Jeśli użytkownik podał liczby - używaj ich; jeśli nie - używaj placeholderów.

FORMAT ODPOWIEDZI JSON:
{
  "improvedThesis": "przepisana teza w 1-2 zdaniach, konkretnie i zwięźle",
  "improvedInvalidation": "sugestia invalidation jeśli była brakująca/słaba (opcjonalnie, tylko jeśli potrzebne)"
}

Jeśli invalidation już jest dobra lub nie ma potrzeby jej ulepszania, zwróć null lub pomiń pole improvedInvalidation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Ulepsz następującą tezę decyzji:\n\n${context}\n\nPrzepisz ją na 1-2 zdania z konkretami, używając danych z payloadu. Jeśli brakuje liczb - użyj placeholderów [poziom], ale NIE wymyślaj liczb.` },
      ],
      max_tokens: 300,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let result: any = {};
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response', e);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Validate required fields
    if (!result.improvedThesis) {
      console.error('AI response missing improvedThesis', content);
      return NextResponse.json({ error: 'AI response missing improvedThesis' }, { status: 500 });
    }

    return NextResponse.json({
      improvedThesis: result.improvedThesis,
      improvedInvalidation: result.improvedInvalidation || null,
    });
  } catch (err: any) {
    console.error('Decision lab thesis improve error', err);
    return NextResponse.json({ error: err.message || 'Failed to improve thesis' }, { status: 500 });
  }
}
