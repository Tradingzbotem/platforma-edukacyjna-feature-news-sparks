// app/api/brief/auto-latest/route.ts
import { NextResponse } from 'next/server';
import { getBriefs, addBrief, type Brief } from '../_store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isFresh(tsIso?: string, maxAgeMs = 24 * 3600 * 1000): boolean {
  if (!tsIso) return false;
  const ts = new Date(tsIso).getTime();
  if (!ts || Number.isNaN(ts)) return false;
  return Date.now() - ts < maxAgeMs;
}

function hasUsefulData(b: Brief | null | undefined): boolean {
  if (!b) return false;
  const hasBullets = Array.isArray(b.bullets) && b.bullets.length > 0;
  const hasContent = typeof (b as any).content === 'string' && (b as any).content.length > 0;
  const m = b.metrics || {};
  const hasMetrics =
    m.rsi != null || m.adx != null || m.macd != null || m.volume != null || (typeof m.dist200 === 'string' && m.dist200.length > 0);
  return hasBullets || hasContent || hasMetrics;
}

function hasMetricsOnly(b: Brief | null | undefined): boolean {
  if (!b) return false;
  const m = b.metrics || {};
  return (
    m.rsi != null ||
    m.adx != null ||
    m.macd != null ||
    m.volume != null ||
    (typeof m.dist200 === 'string' && m.dist200.length > 0)
  );
}

async function ensureGenerated(baseUrl: string): Promise<void> {
  // If no OpenAI key, generator will respond with 500 – ignore in that case
  const strictPrompt =
    'Napisz po polsku krótki briefing rynkowy (EDU). ZWRÓĆ JSON z polami {bullets[], content, sentiment, metrics{rsi, adx, macd, volume, dist200}, opinion}. ' +
    'W bullets wypisz 6–8 punktów. UPEWNIJ SIĘ, że metrics zawiera liczby (jeśli nie masz, oszacuj konserwatywnie). ' +
    'Bez porad inwestycyjnych. Tytuł: „Szybki briefing — GEN”.';
  try {
    await fetch(`${baseUrl}/api/brief/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'pl',
        range: '24h',
        type: 'GEN',
        prompt: strictPrompt,
      }),
      cache: 'no-store',
    }).catch(() => null);
  } catch {
    // ignore
  }
}

async function synthesizeFromSpark(baseUrl: string): Promise<Brief | null> {
  try {
    const r = await fetch(
      `${baseUrl}/api/quotes/sparkline?symbols=US100&range=7d&interval=1h`,
      { cache: 'no-store' },
    );
    if (!r.ok) return null;
    const j = await r.json();
    const series: Array<[number, number]> =
      Array.isArray(j?.data) && j.data[0]?.series ? j.data[0].series : [];
    if (!series.length) return null;
    const closes = series
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((p: [number, number]) => p[1]);

    // Helpers
    const sma = (arr: number[], period: number, idx: number) => {
      const start = Math.max(0, idx - period + 1);
      const slice = arr.slice(start, idx + 1);
      if (slice.length < period) return undefined;
      const sum = slice.reduce((a, b) => a + b, 0);
      return sum / slice.length;
    };
    // RSI(14)
    const rsiPeriod = 14;
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - rsiPeriod; i < closes.length; i++) {
      if (i <= 0) continue;
      const chg = closes[i] - closes[i - 1];
      if (chg >= 0) gains += chg;
      else losses += -chg;
    }
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod || 1e-9;
    const rs = avgGain / avgLoss;
    const rsiRaw = 100 - 100 / (1 + rs);
    const rsi = Math.max(1, Math.min(99, Math.round(rsiRaw)));

    // MACD(12,26)
    const ema = (period: number) => {
      const k = 2 / (period + 1);
      let value = closes[0];
      for (let i = 1; i < closes.length; i++) value = closes[i] * k + value * (1 - k);
      return value;
    };
    const ema12 = ema(12);
    const ema26 = ema(26);
    const macd = ema12 - ema26;

    // ADX(14) — uproszczony proxy na podstawie znormalizowanego momentum
    const adx = Math.min(
      40,
      Math.max(5, Math.abs(macd) * 3 + Math.abs((rsi - 50) / 2)),
    );

    // Dist to MA200 (fallback to MA100 if not enough)
    const last = closes[closes.length - 1];
    const maPeriod = closes.length >= 200 ? 200 : Math.min(100, closes.length);
    const ma = sma(closes, maPeriod, closes.length - 1) || last;
    const dist200 = ma ? `${(((last - ma) / ma) * 100).toFixed(1)}%` : undefined;

    const nowIso = new Date().toISOString();
    const brief: Brief = {
      id: `auto-synth-${Date.now()}`,
      ts_iso: nowIso,
      title: `Szybki briefing — GEN (${new Date().toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })})`,
      bullets: [
        'Syntetyczny wpis na bazie ruchu US100 (fallback).',
        'Dane demo — bez porad inwestycyjnych.',
      ],
      content:
        'Wpis uzupełniający powstał automatycznie, aby dostarczyć podstawowe metryki kiedy generator AI był niedostępny.',
      sentiment: 'Neutralny',
      metrics: {
        rsi: Number.isFinite(rsi) ? Number(rsi) : undefined,
        adx: Number.isFinite(adx) ? Number(adx.toFixed(0)) : undefined,
        macd: Number.isFinite(macd) ? Number(macd.toFixed(2)) : undefined,
        volume: 'Średnie',
        dist200,
      },
      opinion: rsi > 55 ? 'Przewaga wzrostu' : rsi < 45 ? 'Przewaga spadku' : 'Konsolidacja',
      type: 'GEN',
    };
    try {
      await addBrief(brief);
    } catch {}
    return brief;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const forceEnrich = ['1', 'true', 'yes'].includes((url.searchParams.get('enrich') || '').toLowerCase());
    const requireMetrics = forceEnrich; // when enrich requested, require real metrics

    // Determine dynamic base (works in dev and prod)
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${url.protocol}//${url.host}`);

    // 1) Read current latest GEN brief
    let all = await getBriefs();
    let latestGen: Brief | null =
      all
        .filter((b) => (b.type || 'GEN') === 'GEN')
        .sort((a, b) => new Date(b.ts_iso).getTime() - new Date(a.ts_iso).getTime())[0] || null;

    // 2) If missing or stale/unhelpful -> try to generate a new one (OpenAI key must be present)
    const needGenerate =
      !latestGen ||
      !isFresh(latestGen.ts_iso) ||
      (requireMetrics ? !hasMetricsOnly(latestGen) : (forceEnrich && !hasUsefulData(latestGen)));
    if (needGenerate) {
      await ensureGenerated(base);
      // Reload after generation attempt
      all = await getBriefs();
      latestGen =
        all
          .filter((b) => (b.type || 'GEN') === 'GEN')
          .sort((a, b) => new Date(b.ts_iso).getTime() - new Date(a.ts_iso).getTime())[0] || null;
      // If still stale OR missing metrics (required) OR otherwise not useful -> synthesize from sparkline as a fallback
      const stillBad =
        !isFresh(latestGen?.ts_iso) ||
        (requireMetrics ? !hasMetricsOnly(latestGen) : !hasUsefulData(latestGen));
      if (stillBad) {
        latestGen = (await synthesizeFromSpark(base)) || latestGen;
      }
    }

    return NextResponse.json(
      { ok: true, brief: latestGen },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const POST = GET;


