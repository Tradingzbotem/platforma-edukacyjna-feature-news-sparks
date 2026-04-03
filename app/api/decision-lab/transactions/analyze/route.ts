import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import OpenAI from 'openai';
import { parseStatement } from '@/lib/statement/parse';
import { calculateMetrics, generateRecommendations } from '@/lib/statement/analyze';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/transactions/analyze
 * body: { statement_text: string }
 * 
 * Analizuje statement transakcji przez AI i generuje rekomendacje
 */
export async function POST(req: Request): Promise<NextResponse> {
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
    const { statement_text } = data || {};

    if (!statement_text || typeof statement_text !== 'string' || statement_text.trim().length === 0) {
      return NextResponse.json({ error: 'Statement text is required' }, { status: 400 });
    }

    if (statement_text.length > 50000) {
      return NextResponse.json({ error: 'Statement text too long (max 50000 characters)' }, { status: 400 });
    }

    // Validate that the statement contains sufficient information for analysis
    const trimmedText = statement_text.trim();
    
    // Check if input is too short or looks like incomplete data
    // Minimum reasonable statement should have at least 100 characters or contain multiple data points
    if (trimmedText.length < 100) {
      return NextResponse.json({ 
        error: 'Statement jest zbyt krótki. Wklej pełny statement transakcji zawierający szczegóły transakcji (kierunek, czas, P&L, wielkość pozycji, itp.).' 
      }, { status: 400 });
    }

    // Check for common patterns that indicate a complete statement
    // A proper statement should contain multiple transactions or structured data
    const hasMultipleLines = trimmedText.split('\n').filter(line => line.trim().length > 0).length >= 3;
    const hasNumbers = /\d+/.test(trimmedText); // Should contain numbers (prices, P&L, etc.)
    const hasDatesOrTimes = /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{2}:\d{2}|date|time|czas|data)/i.test(trimmedText);
    const hasTradingTerms = /(buy|sell|long|short|open|close|entry|exit|profit|loss|pnl|volume|size|lot|kup|sprzedaj|otwarcie|zamknięcie|zysk|strata|wielkość)/i.test(trimmedText);
    
    // Check if it looks like just a symbol and direction (e.g., "us100 up")
    const isMinimalInput = /^[a-z0-9]+\s+(up|down|long|short|kup|sprzedaj)$/i.test(trimmedText);
    
    if (isMinimalInput) {
      return NextResponse.json({ 
        error: 'Wprowadzony tekst jest zbyt krótki i nie zawiera pełnych informacji o transakcjach. Wklej pełny statement transakcji z Twojego brokera zawierający:\n- Listę transakcji z datami/czasem\n- Kierunki transakcji (buy/sell, long/short)\n- Wartości P&L (profit/loss)\n- Wielkości pozycji\n- Symbole instrumentów\n\nPrzykład: CSV lub tekst z wieloma transakcjami z pełnymi szczegółami.' 
      }, { status: 400 });
    }

    // Require at least some indicators of a complete statement
    const hasStructure = hasMultipleLines || (hasNumbers && (hasDatesOrTimes || hasTradingTerms));
    
    if (!hasStructure) {
      return NextResponse.json({ 
        error: 'Statement nie zawiera wystarczających informacji do analizy. Wklej pełny statement transakcji zawierający:\n- Listę transakcji z datami/czasem\n- Kierunki transakcji (buy/sell, long/short)\n- Wartości P&L (profit/loss)\n- Wielkości pozycji\n- Symbole instrumentów\n\nPrzykład: CSV lub tekst z wieloma transakcjami z pełnymi szczegółami.' 
      }, { status: 400 });
    }

    // Parse and calculate metrics FIRST (before AI)
    const parseResult = parseStatement(trimmedText);
    
    if (parseResult.parseError) {
      return NextResponse.json({ 
        error: parseResult.parseError 
      }, { status: 400 });
    }
    
    const transactions = parseResult.transactions;
    
    // Estimate expected transaction count from raw text
    const lineCount = trimmedText.split('\n').filter(l => l.trim().length > 10).length;
    const estimatedTransactions = Math.max(1, lineCount - 2); // Subtract header/footer
    
    // Log parsing results for debugging
    console.log(`\n=== STATEMENT ANALYSIS ===`);
    console.log(`Total lines in statement: ${lineCount}`);
    console.log(`Estimated transactions: ~${estimatedTransactions}`);
    console.log(`Parsed transactions: ${transactions.length}`);
    
    if (transactions.length === 0) {
      return NextResponse.json({ 
        error: 'Nie udało się sparsować transakcji ze statementu. Sprawdź format CSV - wymagane kolumny: Instrument, Type, Net P&L' 
      }, { status: 400 });
    }

    if (transactions.length < 3) {
      return NextResponse.json({ 
        error: 'Statement zawiera zbyt mało transakcji do analizy. Wymagane minimum 3 transakcje.' 
      }, { status: 400 });
    }
    
    // WARNING: Check if we parsed significantly fewer transactions than expected
    const parseRate = transactions.length / estimatedTransactions;
    if (parseRate < 0.7 && estimatedTransactions > 5) {
      console.warn(`\n⚠️  WARNING: Parsed only ${transactions.length} of ~${estimatedTransactions} expected transactions (${(parseRate * 100).toFixed(1)}%)`);
      console.warn(`This may indicate that some transactions were missed by the parser.`);
    }
    
    if (transactions.length > 0) {
      console.log('Instruments found:', Array.from(new Set(transactions.map(t => t.instrument))));
      console.log('Sample transaction:', {
        instrument: transactions[0].instrument,
        type: transactions[0].type,
        netPnl: transactions[0].netPnl,
      });
    }

    const metrics = calculateMetrics(transactions);
    
    // Generate deterministic recommendations
    const recommendations = generateRecommendations(metrics);
    
    // CRITICAL VALIDATION: Check if P&L sum is consistent
    if (metrics._validation && !metrics._validation.isValid) {
      console.error('\n❌ CRITICAL P&L VALIDATION FAILED:');
      console.error(`  Global Net P&L: ${metrics.netPnl.toFixed(2)}`);
      console.error(`  Sum by Instrument: ${metrics._validation.sumByInstrument.toFixed(2)}`);
      console.error(`  Difference: ${metrics._validation.pnlDifference.toFixed(2)}`);
      console.error(`  Transactions parsed: ${transactions.length}`);
      console.error('This indicates a parser bug - P&L aggregation is inconsistent!');
    } else if (metrics._validation) {
      console.log(`✓ P&L validation passed: ${metrics.netPnl.toFixed(2)} (difference: ${metrics._validation.pnlDifference.toFixed(2)})`);
    }
    
    // Log calculated metrics for debugging
    console.log('\n=== CALCULATED METRICS ===');
    console.log(`  Total Trades: ${metrics.totalTrades}`);
    console.log(`  Winning Trades: ${metrics.winningTrades}`);
    console.log(`  Losing Trades: ${metrics.losingTrades}`);
    console.log(`  Win Rate: ${metrics.winRate.toFixed(1)}%`);
    console.log(`  Total Profit: ${metrics.totalProfit.toFixed(2)}`);
    console.log(`  Total Loss: ${metrics.totalLoss.toFixed(2)}`);
    console.log(`  Net P&L: ${metrics.netPnl.toFixed(2)}`);
    console.log(`  Average Win: ${metrics.averageWin.toFixed(2)}`);
    console.log(`  Average Loss: ${metrics.averageLoss.toFixed(2)}`);
    console.log(`  Risk/Reward Ratio: ${metrics.riskRewardRatio.toFixed(2)}`);
    console.log(`  Profit Factor: ${metrics.profitFactor === null ? '∞' : metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}`);
    console.log('\nBy Instrument (detailed):');
    Object.entries(metrics.byInstrument).forEach(([inst, stats]) => {
      console.log(`  ${inst}:`);
      console.log(`    Trades: ${stats.trades}`);
      console.log(`    Wins: ${stats.wins}, Losses: ${stats.losses}`);
      console.log(`    Win Rate: ${stats.winRate.toFixed(1)}%`);
      console.log(`    Net P&L: ${stats.netPnl.toFixed(2)}`);
    });
    console.log(`=== END STATEMENT ANALYSIS ===\n`);

    // Prepare data for AI interpretation (AI only interprets, doesn't calculate)
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Jesteś ekspertem analizującym statementy transakcji rynkowych w kontekście edukacyjnym.
Twoim zadaniem jest INTERPRETOWAĆ obliczone metryki i dostarczyć analizę opisową opartą na faktach.

WAŻNE - CZYTANIE DANYCH:
- Metryki są już obliczone i weryfikowane - użyj TYLKO wartości z "obliczone_metryki"
- Nie parsuj surowych danych - one są tylko dla kontekstu
- Wszystkie liczby (win_rate, net_pnl, profit_factor) są już obliczone poprawnie
- Porównania per instrument używają wartości z "by_instrument" array
- Jeśli widzisz różnicę między surowymi danymi a metrykami - ZAUFAJ METRYKOM

KRYTYCZNE ZASADY (MUSISZ PRZESTRZEGAĆ):
1. NIE obliczaj metryk - użyj TYLKO wartości z sekcji "obliczone_metryki"
2. NIE przypisuj stanów emocjonalnych bez danych behawioralnych (czas reakcji, modyfikacje SL, itp.)
3. NIE generuj ogólnych coachingowych fraz bez podstaw w danych
4. Bazuj TYLKO na faktach z obliczonych metryk
5. Jeśli brakuje danych do wniosku - nie wyciągaj go
6. NIE sugeruj działań operacyjnych (zakazane słowa: "zwiększyć", "ograniczyć", "należy", "powinieneś", "trzeba")
7. OPISUJ tylko fakty historyczne, nie sugeruj zmian w strategii
8. Używaj formy opisowej: "Dane pokazują...", "Analiza wykazuje...", "W okresie analizowanym..."

ZAKAZANE FORMY (compliance):
❌ "Zwiększyć udział transakcji na X"
❌ "Ograniczyć transakcje na Y"
❌ "Należy skupić się na Z"
✅ "Dane historyczne pokazują wyższy udział transakcji zyskownych na X"
✅ "W analizowanym okresie transakcje na Y charakteryzowały się..."
✅ "Instrument Z wykazał w okresie analizowanym..."

Analizuj:
1. Opisz statystyki (win rate, R:R ratio, profit factor) jako fakty historyczne
2. Porównaj wyniki per instrument na podstawie obliczonych metryk - tylko opisowo
3. Wskaż mocne strony i obszary do poprawy na podstawie danych - jako obserwacje, nie rekomendacje
4. Sformułuj obserwacje oparte na faktach, bez sugestii operacyjnych
5. Unikaj wniosków o emocjach, psychologii, over-tradingu bez danych behawioralnych
6. Sprawdź fakty narracyjne - jeśli mówisz o częstotliwości, sprawdź dane

ODPOWIEDZ W FORMACIE JSON:
{
  "summary": {
    "total_trades": number (użyj z obliczonych_metryki),
    "winning_trades": number (użyj z obliczonych_metryki),
    "losing_trades": number (użyj z obliczonych_metryki),
    "win_rate": number (użyj z obliczonych_metryki),
    "total_profit": number (użyj z obliczonych_metryki),
    "total_loss": number (użyj z obliczonych_metryki),
    "net_pnl": number (użyj z obliczonych_metryki),
    "average_win": number (użyj z obliczonych_metryki),
    "average_loss": number (użyj z obliczonych_metryki),
    "risk_reward_ratio": number (użyj z obliczonych_metryki)
  },
  "patterns": {
    "best_performing_instruments": ["symbol1", "symbol2"] (na podstawie net_pnl per instrument),
    "worst_performing_instruments": ["symbol1", "symbol2"] (na podstawie net_pnl per instrument),
    "most_traded_instruments": ["symbol1", "symbol2"] (na podstawie liczby transakcji)
  },
  "strengths": ["punkt 1", "punkt 2"] (tylko na podstawie faktów z metryk, jako obserwacje),
  "weaknesses": ["punkt 1", "punkt 2"] (tylko na podstawie faktów z metryk, jako obserwacje),
  "risk_management_assessment": "Opisowa ocena na podstawie R:R ratio, profit factor, średnich zysków/strat - bez sugestii działań",
  "observations": [
    {
      "category": "Zarządzanie ryzykiem" | "Timing" | "Wybór instrumentów" | "Inne",
      "observation": "Obserwacja oparta na faktach (opisowa, bez sugestii działań)",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "detailed_analysis": "Szczegółowa analiza oparta TYLKO na obliczonych metrykach, bez domysłów, bez sugestii operacyjnych. Forma opisowa: 'Dane pokazują...', 'W okresie analizowanym...', 'Analiza wykazuje...'",
  "key_findings": ["Obserwacja 1", "Obserwacja 2", "Obserwacja 3"] (fakty historyczne, bez sugestii działań)
}`;

    const metricsForAI = {
      total_trades: metrics.totalTrades,
      winning_trades: metrics.winningTrades,
      losing_trades: metrics.losingTrades,
      win_rate: Math.round(metrics.winRate * 100) / 100,
      total_profit: Math.round(metrics.totalProfit * 100) / 100,
      total_loss: Math.round(metrics.totalLoss * 100) / 100,
      net_pnl: Math.round(metrics.netPnl * 100) / 100,
      average_win: Math.round(metrics.averageWin * 100) / 100,
      average_loss: Math.round(metrics.averageLoss * 100) / 100,
      risk_reward_ratio: Math.round(metrics.riskRewardRatio * 100) / 100,
      profit_factor: metrics.profitFactor !== null ? Math.round(metrics.profitFactor * 100) / 100 : null,
      largest_win: Math.round(metrics.largestWin * 100) / 100,
      largest_loss: Math.round(metrics.largestLoss * 100) / 100,
      by_instrument: Object.entries(metrics.byInstrument).map(([inst, stats]) => ({
        instrument: inst,
        trades: stats.trades,
        wins: stats.wins,
        losses: stats.losses,
        net_pnl: Math.round(stats.netPnl * 100) / 100,
        win_rate: Math.round(stats.winRate * 100) / 100,
      })),
    };

    const userPrompt = `Przeanalizuj następujące OBLICZONE METRYKI transakcji. NIE obliczaj ich ponownie - użyj podanych wartości.

OBLICZONE METRYKI:
${JSON.stringify(metricsForAI, null, 2)}

SUROWE DANE (dla kontekstu, ale nie licz z nich metryk):
${trimmedText.substring(0, 2000)}

Zadanie: Zinterpretuj te metryki i sformułuj analizę edukacyjną. Pamiętaj:
- Użyj TYLKO wartości z OBLICZONYCH METRYK
- Nie przypisuj emocji bez danych behawioralnych
- Bazuj na faktach, nie na domysłach
- Porównaj instrumenty na podstawie net_pnl i win_rate
- SPRAWDŹ fakty narracyjne: jeśli mówisz o częstotliwości transakcji per instrument, sprawdź dane w "by_instrument" (pole "trades")
- NIE sugeruj działań operacyjnych - tylko opisuj fakty historyczne
- Używaj formy: "Dane pokazują...", "W okresie analizowanym...", "Analiza wykazuje..."

KRYTYCZNE ZASADY INTERPRETACJI:
1. NISKI WIN RATE ≠ ZŁA STRATEGIA: Jeśli profit_factor > 1 i net_pnl > 0, strategia jest zyskowna mimo niskiego win_rate
2. NAJLEPSZY INSTRUMENT: Określ na podstawie net_pnl, NIE win_rate. Instrument z najwyższym net_pnl jest najlepszy
3. UJEMNE INSTRUMENTY: Jeśli instrument ma ujemny net_pnl, opisz to jako fakt, ale nie sugeruj działań
4. KONCENTRACJA WYNIKU: Jeśli jeden instrument dominuje wynik (np. >50% net_pnl), zauważ to jako obserwację o ryzyku zależności
5. MARGINALNE WYNIKI: Instrument z małym dodatnim net_pnl (np. <5% całkowitego) to "marginalny wynik", nie "najlepszy"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2500,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let aiAnalysis: any = {};
    try {
      aiAnalysis = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response', e);
      return NextResponse.json({ error: 'Failed to parse AI analysis' }, { status: 500 });
    }

    // Merge calculated metrics with AI interpretation
    // Override AI's summary with our calculated values to ensure accuracy
    const analysis = {
      summary: {
        total_trades: metrics.totalTrades,
        winning_trades: metrics.winningTrades,
        losing_trades: metrics.losingTrades,
        win_rate: Math.round(metrics.winRate * 100) / 100,
        total_profit: Math.round(metrics.totalProfit * 100) / 100,
        total_loss: Math.round(metrics.totalLoss * 100) / 100,
        net_pnl: Math.round(metrics.netPnl * 100) / 100,
        average_win: Math.round(metrics.averageWin * 100) / 100,
        average_loss: Math.round(metrics.averageLoss * 100) / 100,
        risk_reward_ratio: Math.round(metrics.riskRewardRatio * 100) / 100,
        profit_factor: metrics.profitFactor !== null ? Math.round(metrics.profitFactor * 100) / 100 : null,
      },
      by_instrument: metricsForAI.by_instrument,
      patterns: aiAnalysis.patterns || {},
      strengths: aiAnalysis.strengths || [],
      weaknesses: aiAnalysis.weaknesses || [],
      risk_management_assessment: aiAnalysis.risk_management_assessment || '',
      // Use observations instead of recommendations (compliance)
      observations: aiAnalysis.observations || aiAnalysis.recommendations || [],
      recommendations: recommendations.length > 0 ? recommendations : (aiAnalysis.observations || aiAnalysis.recommendations || []), // Deterministic recommendations take priority
      detailed_analysis: aiAnalysis.detailed_analysis || '',
      key_findings: aiAnalysis.key_findings || aiAnalysis.action_plan || [],
      action_plan: aiAnalysis.key_findings || aiAnalysis.action_plan || [], // Keep for backward compatibility
    };

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Transaction statement analysis error', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze statement' }, { status: 500 });
  }
}
