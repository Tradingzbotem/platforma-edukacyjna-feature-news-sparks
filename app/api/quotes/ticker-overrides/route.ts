// app/api/quotes/ticker-overrides/route.ts
// Endpoint zwracający wszystkie override'y dla tickera

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

type RouteContext = { params: Promise<{ asset: string }> };

async function ensureTable() {
  if (!isDatabaseConfigured()) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS price_overrides (
        asset TEXT PRIMARY KEY,
        price NUMERIC NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
  } catch {
    // ignore
  }
}

function getMemStore(): Record<string, { price: number; updated_at: string }> {
  const g = globalThis as any;
  if (!g.__PRICE_OVERRIDES__) g.__PRICE_OVERRIDES__ = {};
  return g.__PRICE_OVERRIDES__;
}

// Mapowanie symboli OANDA na nazwy assetów
function mapSymbolToAsset(symbol: string): string | null {
  const s = symbol.toUpperCase();
  if (s === 'OANDA:NAS100_USD') return 'US100';
  if (s === 'OANDA:XAU_USD') return 'XAUUSD';
  if (s === 'OANDA:WTICO_USD') return 'WTI';
  if (s === 'OANDA:BCO_USD') return 'BRENT';
  if (s === 'OANDA:EUR_USD') return 'EURUSD';
  if (s === 'OANDA:USD_JPY') return 'USDJPY';
  if (s === 'OANDA:US500_USD') return 'US500';
  return null;
}

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

    const results: Record<string, { price: number; prevClose: number; changePct: number; lastTs: number }> = {};
    const now = Date.now();

    // Mapuj symbole na assety
    const assetMap = new Map<string, string>();
    for (const symbol of symbols) {
      const asset = mapSymbolToAsset(symbol);
      if (asset) {
        assetMap.set(symbol, asset);
      }
    }

    // Pobierz override'y z bazy danych
    if (isDatabaseConfigured() && assetMap.size > 0) {
      try {
        await ensureTable();
        const assets = Array.from(assetMap.values());
        const { rows } = await sql<{ asset: string; price: string }>`
          SELECT asset, price::text FROM price_overrides WHERE asset = ANY(${assets})
        `;
        
        for (const row of rows) {
          const price = Number(row.price);
          if (Number.isFinite(price) && price > 0) {
            // Znajdź symbol dla tego assetu
            for (const [symbol, asset] of assetMap.entries()) {
              if (asset === row.asset) {
                results[symbol] = {
                  price,
                  prevClose: price,
                  changePct: 0,
                  lastTs: now - 3600000, // Oznacz jako "stare"
                };
                break;
              }
            }
          }
        }
      } catch {
        // Fallback do memory store
      }
    }

    // Sprawdź memory store dla brakujących
    const mem = getMemStore();
    for (const [symbol, asset] of assetMap.entries()) {
      if (results[symbol]) continue; // Już mamy z DB
      
      const inMem = mem[asset];
      if (inMem && Number.isFinite(inMem.price) && inMem.price > 0) {
        results[symbol] = {
          price: inMem.price,
          prevClose: inMem.price,
          changePct: 0,
          lastTs: now - 3600000,
        };
      }
    }

    // Sprawdź ENV variables dla brakujących
    for (const [symbol, asset] of assetMap.entries()) {
      if (results[symbol]) continue; // Już mamy
      
      const envKey = `OVERRIDE_${asset}_PRICE`;
      const envVal = process.env[envKey as any];
      const envNum = envVal != null ? Number(envVal) : NaN;
      if (Number.isFinite(envNum) && envNum > 0) {
        results[symbol] = {
          price: envNum,
          prevClose: envNum,
          changePct: 0,
          lastTs: now - 3600000,
        };
      }
    }

    return NextResponse.json(
      { results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Ticker Overrides API] Error:', message);
    return NextResponse.json({ results: {} }, { status: 200 }); // Zwróć pusty wynik zamiast błędu
  }
}
