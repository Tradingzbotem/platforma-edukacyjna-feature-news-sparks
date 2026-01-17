// app/api/quotes/ticker/route.ts
// Proxy dla tickera z cache'owaniem po stronie serwera

import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_REST = 'https://finnhub.io/api/v1';
const CACHE_TTL = 10000; // 10 sekund cache po stronie serwera

// Prosty cache w pamięci (dla wielu requestów jednocześnie)
const cache = new Map<string, { data: any; expires: number }>();
// Deduplikacja requestów w toku
const inFlight = new Map<string, Promise<any>>();
// Licznik błędów 403 (jeśli za dużo, wyłączamy API route)
let error403Count = 0;
const MAX_403_ERRORS = 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('symbols');
    
    if (!symbolsParam) {
      return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').filter(Boolean);
    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const token =
      process.env.FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
      '';

    if (!token) {
      return NextResponse.json({ error: 'Missing FINNHUB token' }, { status: 500 });
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

    // Jeśli za dużo błędów 403, zwróć pusty wynik (fallback w komponencie)
    if (error403Count >= MAX_403_ERRORS) {
      return NextResponse.json({ results: {} }, { status: 200 });
    }

    // Pobierz brakujące symbole równolegle z timeoutem i deduplikacją
    if (symbolsToFetch.length > 0) {
      const fetchPromises = symbolsToFetch.map(async (symbol) => {
        // Deduplikacja - jeśli request już trwa, użyj istniejącego
        if (inFlight.has(symbol)) {
          try {
            return await inFlight.get(symbol);
          } catch {
            // Jeśli istniejący request się nie powiódł, spróbuj ponownie
          }
        }

        const fetchPromise = (async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // Zwiększony timeout

            const url = `${FINNHUB_REST}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
            const r = await fetch(url, {
              cache: 'no-store',
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!r.ok) {
              if (r.status === 403) {
                error403Count++;
                // Nie loguj każdego błędu 403 - tylko pierwszy
                if (error403Count === 1) {
                  console.warn('[Ticker API] Finnhub API returned 403 - token may be invalid or rate limited');
                }
                return { symbol, quote: null };
              }
              throw new Error(`HTTP ${r.status}`);
            }

            // Reset licznika błędów przy sukcesie
            if (error403Count > 0) {
              error403Count = Math.max(0, error403Count - 1);
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
            
            // Zapisz w cache
            cache.set(symbol, {
              data: quote,
              expires: now + CACHE_TTL,
            });

            return { symbol, quote };
          } catch (err) {
            // Ciche ignorowanie błędów (timeout, network, etc.)
            return { symbol, quote: null };
          } finally {
            // Usuń z deduplikacji po zakończeniu
            inFlight.delete(symbol);
          }
        })();

        // Zapisz promise dla deduplikacji
        inFlight.set(symbol, fetchPromise);
        return fetchPromise;
      });

      const fetched = await Promise.allSettled(fetchPromises);
      for (const res of fetched) {
        if (res.status === 'fulfilled' && res.value?.quote) {
          results[res.value.symbol] = res.value.quote;
        }
      }
    }

    // Wyczyść stare wpisy z cache (co 100 requestów)
    if (Math.random() < 0.01) {
      for (const [key, value] of cache.entries()) {
        if (value.expires <= now) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(
      { results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Ticker API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
