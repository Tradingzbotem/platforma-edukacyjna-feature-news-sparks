// app/api/quotes/sparkline/route.ts
export const runtime = "nodejs";

type Range = '7d' | '30d';
type Interval = '1h' | '4h' | '1d';

function seedFromSymbol(sym: string): number {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function genSeries(symbol: string, range: Range, interval: Interval): Array<[number, number]> {
  const now = Date.now();
  const points: Array<[number, number]> = [];
  const steps = interval === '1d' ? (range === '7d' ? 7 : 30) : interval === '4h' ? (range === '7d' ? 42 : 180) : (range === '7d' ? 168 : 720);
  const stepMs = interval === '1d' ? 24 * 3600 * 1000 : interval === '4h' ? 4 * 3600 * 1000 : 3600 * 1000;
  const seed = seedFromSymbol(symbol);
  const base = 100 + (seed % 50);
  for (let i = steps - 1; i >= 0; i--) {
    const t = now - i * stepMs;
    const angle = (i / steps) * Math.PI * 2;
    const noise = ((Math.sin(angle * (1 + (seed % 3))) + Math.cos(angle * 0.7 + (seed % 5))) / 2) * 2;
    const value = base + Math.sin(angle) * 5 + noise;
    points.push([t, Number(value.toFixed(2))]);
  }
  return points;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbolsParam = (url.searchParams.get('symbols') || '').trim();
    if (!symbolsParam) return Response.json({ ok: true, data: [] }, { status: 200 });
    const range = (url.searchParams.get('range') as Range) || '7d';
    const interval = (url.searchParams.get('interval') as Interval) || '1h';
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).slice(0, 20);

    const data = symbols.map(sym => ({ symbol: sym, series: genSeries(sym, range, interval) }));
    return Response.json({ ok: true, data }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ ok: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST() {
  return Response.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 });
}


