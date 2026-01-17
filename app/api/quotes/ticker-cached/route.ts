// app/api/quotes/ticker-cached/route.ts
// Cache'owany endpoint - aktualizuje się rzadko (co 15-30 min) aby uniknąć limitów API

import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_REST = 'https://finnhub.io/api/v1';
const CACHE_TTL = 15 * 60 * 1000; // 15 minut cache

// Cache w pamięci (persystuje między requestami)
const cache = new Map<string, { data: any; expires: number; lastFetch: number }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('symbols');
    
    if (!symbolsParam) {
      return NextResponse.json({ results: {} }, { status: 200 });
    }

    const symbols = symbolsParam.split(',').filter(Boolean);
    if (symbols.length === 0) {
      return NextResponse.json({ results: {} }, { status: 200 });
    }

    const token =
      process.env.FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
      '';

    if (!token) {
      return NextResponse.json({ results: {} }, { status: 200 }); // Zwróć pusty zamiast błędu
    }

    const now = Date.now();
    const results: Record<string, any> = {};
    const symbolsToFetch: string[] = [];

    // Sprawdź cache dla każdego symbolu
    for (const symbol of symbols) {
      const cached = cache.get(symbol);
      if (cached && cached.expires > now) {
        results[symbol] = cached.data;
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Pobierz brakujące symbole (tylko jeśli cache wygasł)
    if (symbolsToFetch.length > 0) {
      const fetchPromises = symbolsToFetch.map(async (symbol) => {
        try {
          const url = `${FINNHUB_REST}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const r = await fetch(url, {
            cache: 'no-store',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!r.ok) {
            if (r.status === 403) {
              // Ciche ignorowanie 403 - użyj stare cache jeśli dostępne
              const oldCache = cache.get(symbol);
              if (oldCache) return { symbol, quote: oldCache.data };
              return { symbol, quote: null };
            }
            throw new Error(`HTTP ${r.status}`);
          }

          const j = await r.json();
          const price = typeof j.c === 'number' ? j.c : undefined;
          const prevClose = typeof j.pc === 'number' ? j.pc : undefined;
          const dpFromApi = typeof j.dp === 'number' ? j.dp : undefined;
          
          // Oblicz zmianę procentową
          let changePct: number | undefined = undefined;
          if (price != null && prevClose != null && prevClose !== 0) {
            changePct = ((price - prevClose) / prevClose) * 100;
          }
          
          // Walidacja: sprawdź czy zmiana jest realistyczna (max ±15% dla ropy/forex, ±5% dla indeksów)
          const isOil = symbol.includes('WTICO') || symbol.includes('BCO');
          const isForex = symbol.includes('EUR') || symbol.includes('USD') || symbol.includes('JPY') || symbol.includes('GBP');
          const maxChange = isOil ? 15 : isForex ? 5 : 10; // maksymalna realistyczna zmiana w %
          
          if (changePct != null && Math.abs(changePct) > maxChange) {
            // Jeśli obliczona zmiana jest nierealistyczna, użyj wartości z API (dp) jeśli dostępna
            if (dpFromApi != null && Math.abs(dpFromApi) <= maxChange) {
              changePct = dpFromApi;
            } else if (dpFromApi != null) {
              // Jeśli dp też jest nierealistyczna, ogranicz do maksymalnej wartości
              changePct = Math.max(-maxChange, Math.min(maxChange, dpFromApi));
            } else {
              // Jeśli nie ma dp, ogranicz obliczoną wartość
              changePct = Math.max(-maxChange, Math.min(maxChange, changePct));
            }
          } else if (changePct == null && dpFromApi != null) {
            // Jeśli nie udało się obliczyć, użyj wartości z API
            changePct = dpFromApi;
          }

          const quote = { price, prevClose, changePct, lastTs: Date.now() };
          
          // Zapisz w cache na 15 minut
          cache.set(symbol, {
            data: quote,
            expires: now + CACHE_TTL,
            lastFetch: now,
          });

          return { symbol, quote };
        } catch (err) {
          // W przypadku błędu użyj starego cache jeśli dostępne
          const oldCache = cache.get(symbol);
          if (oldCache) return { symbol, quote: oldCache.data };
          return { symbol, quote: null };
        }
      });

      const fetched = await Promise.allSettled(fetchPromises);
      for (const res of fetched) {
        if (res.status === 'fulfilled' && res.value?.quote) {
          results[res.value.symbol] = res.value.quote;
        }
      }
    }

    return NextResponse.json(
      { results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Ticker Cached API] Error:', message);
    return NextResponse.json({ results: {} }, { status: 200 }); // Zwróć pusty zamiast błędu
  }
}
