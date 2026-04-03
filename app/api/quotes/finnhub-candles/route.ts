// app/api/quotes/finnhub-candles/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Interval = '1h' | '4h' | '1d';

function toResolution(interval: Interval): string {
  if (interval === '1h') return '60';
  if (interval === '4h') return '240';
  return 'D';
}

function rangeToSeconds(range: string): number {
  // prosto i jasno: obsługujemy tylko to, co potrzebne
  if (range === '7d') return 7 * 24 * 60 * 60;
  if (range === '30d') return 30 * 24 * 60 * 60;
  if (range === '90d') return 90 * 24 * 60 * 60;
  return 30 * 24 * 60 * 60; // default
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol')?.trim();
    const range = (url.searchParams.get('range')?.trim() || '30d').toLowerCase();
    const interval = (url.searchParams.get('interval')?.trim() || '4h') as Interval;

    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const token = process.env.FINNHUB_API_KEY;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Missing FINNHUB_API_KEY' }, { status: 500 });
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - rangeToSeconds(range);

    const endpoint = new URL('https://finnhub.io/api/v1/forex/candle');
    endpoint.searchParams.set('symbol', symbol);
    endpoint.searchParams.set('resolution', toResolution(interval));
    endpoint.searchParams.set('from', String(fromSec));
    endpoint.searchParams.set('to', String(nowSec));
    endpoint.searchParams.set('token', token);

    const res = await fetch(endpoint.toString(), {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });

    const j = (await res.json()) as any;

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Finnhub error (${res.status})`, details: j },
        { status: 502 }
      );
    }

    if (!j || j.s !== 'ok' || !Array.isArray(j.t) || !Array.isArray(j.c)) {
      return NextResponse.json(
        { ok: false, error: 'Brak danych świecowych', details: j },
        { status: 502 }
      );
    }

    // Normalizujemy do jednej, czytelnej struktury
    const candles = j.t.map((t: number, i: number) => ({
      t: Number(t) * 1000, // ms
      o: Number(j.o?.[i]),
      h: Number(j.h?.[i]),
      l: Number(j.l?.[i]),
      c: Number(j.c?.[i]),
      v: Array.isArray(j.v) ? Number(j.v?.[i]) : null,
    }));

    return NextResponse.json(
      { ok: true, symbol, interval, range, candles },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
