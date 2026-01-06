// app/api/quotes/finnhub-spark/route.ts
export const runtime = 'nodejs';

type Range = '7d' | '30d';
type Interval = '1h' | '4h' | '1d';

function toResolution(interval: Interval): string {
  if (interval === '1h') return '60';
  if (interval === '4h') return '240';
  return 'D';
}

function secondsBack(range: Range, interval: Interval): number {
  if (interval === '1d') return (range === '7d' ? 7 : 30) * 24 * 3600;
  if (interval === '4h') return (range === '7d' ? 42 : 180) * 4 * 3600;
  return (range === '7d' ? 168 : 720) * 3600; // 1h points
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbol = (url.searchParams.get('symbol') || '').trim();
    const range = (url.searchParams.get('range') as Range) || '7d';
    const interval = (url.searchParams.get('interval') as Interval) || '1h';
    if (!symbol) return Response.json({ ok: true, symbol, series: [] }, { status: 200 });

    const token =
      process.env.FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
      '';
    if (!token) {
      return Response.json({ ok: false, error: 'Missing FINNHUB_KEY', symbol, series: [] }, { status: 200 });
    }

    const to = Math.floor(Date.now() / 1000);
    const from = to - secondsBack(range, interval);
    const resolution = toResolution(interval);

    const endpoint = `https://finnhub.io/api/v1/forex/candle?symbol=${encodeURIComponent(
      symbol
    )}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}&token=${token}`;

    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) {
      return Response.json({ ok: false, error: String(res.status), symbol, series: [] }, { status: 200 });
    }
    const j = (await res.json()) as any;
    // Expected: { c: number[], t: number[], s: 'ok' }
    const closes: number[] = Array.isArray(j?.c) ? j.c : [];
    const times: number[] = Array.isArray(j?.t) ? j.t : [];
    const series: Array<[number, number]> = closes
      .map((c, i): [number, number] => [Number(times[i]) * 1000, Number(c)])
      .filter((p) => isFinite(p[0]) && isFinite(p[1]));

    return Response.json({ ok: true, symbol, series }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Zamiast 500 zwracamy 200 z ok:false, aby nie spamować logów błędami DEV
    return Response.json({ ok: false, error: message, series: [] }, { status: 200 });
  }
}

export async function POST() {
  return Response.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 });
}


