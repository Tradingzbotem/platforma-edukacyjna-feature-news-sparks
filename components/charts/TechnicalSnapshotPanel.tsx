'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  assetKey: 'US100' | 'GOLD' | 'OIL' | 'EURUSD' | 'SP500' | 'DAX40' | 'BTCUSD' | 'ETHUSD' | 'USDJPY' | 'GBPUSD';
};

export default function TechnicalSnapshotPanel({ assetKey }: Props) {
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  const [state, setState] = useState<{
    rsi?: number;
    macdHist?: number;
    priceVsSma50Pct?: number;
    priceVsSma200Pct?: number;
    volumeVs20x?: number;
    atr14?: number;
    dayHL?: { h?: number; l?: number };
    weekHL?: { h?: number; l?: number };
    currentPrice?: number;
    loading: boolean;
    error?: string;
  }>({ loading: true });
  const [overrideTimestamp, setOverrideTimestamp] = useState<number>(Date.now());

  const finnhubSymbol = useMemo(() => {
    switch (assetKey) {
      case 'GOLD':
        return 'OANDA:XAU_USD';
      case 'OIL':
        return 'OANDA:WTICO_USD';
      case 'EURUSD':
        return 'OANDA:EUR_USD';
      case 'SP500':
        return 'OANDA:US500_USD';
      case 'DAX40':
        return 'OANDA:DE30_EUR';
      case 'BTCUSD':
        return 'BINANCE:BTCUSDT';
      case 'ETHUSD':
        return 'BINANCE:ETHUSDT';
      case 'USDJPY':
        return 'OANDA:USD_JPY';
      case 'GBPUSD':
        return 'OANDA:GBP_USD';
      case 'US100':
      default:
        return 'OANDA:NAS100_USD';
    }
  }, [assetKey]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        // 1) Prefer internal sparkline (used by Szybkie info AI) for consistency (no external key required)
        const mapKey = assetKey === 'US100' ? 'US100' : 
          assetKey === 'GOLD' ? 'GOLD' : 
          assetKey === 'OIL' ? 'OIL' :
          assetKey === 'EURUSD' ? 'EURUSD' :
          assetKey === 'SP500' ? 'SP500' :
          assetKey === 'DAX40' ? 'DAX40' :
          assetKey === 'BTCUSD' ? 'BTCUSD' :
          assetKey === 'ETHUSD' ? 'ETHUSD' :
          assetKey === 'USDJPY' ? 'USDJPY' :
          assetKey === 'GBPUSD' ? 'GBPUSD' : 'US100';
        const overrideKey = assetKey === 'US100' ? 'US100' : 
          assetKey === 'GOLD' ? 'XAUUSD' : 
          assetKey === 'OIL' ? 'WTI' :
          assetKey === 'EURUSD' ? 'EURUSD' :
          assetKey === 'SP500' ? 'US500' :
          assetKey === 'DAX40' ? 'DE40' :
          assetKey === 'BTCUSD' ? 'BTCUSD' :
          assetKey === 'ETHUSD' ? 'ETHUSD' :
          assetKey === 'USDJPY' ? 'USDJPY' :
          assetKey === 'GBPUSD' ? 'GBPUSD' : 'US100';
        const [r1, ro] = await Promise.all([
          fetch(`/api/quotes/sparkline?symbols=${mapKey}&range=30d&interval=1h`, { cache: 'no-store' }),
          fetch(`/api/panel/price-override/${encodeURIComponent(overrideKey)}`, { cache: 'no-store' }).catch(() => null as any),
        ]);
        let closes: number[] = [];
        let overridePrice: number | undefined = undefined;
        try {
          const jo = ro && ro.ok ? await ro.json().catch(() => ({})) : {};
          if (typeof jo?.price === 'number' && Number.isFinite(jo.price)) overridePrice = jo.price;
        } catch {}
        if (r1.ok) {
          const j1 = await r1.json();
          const series: Array<[number, number]> = j1?.data?.[0]?.series ?? [];
          closes = series.map(p => p[1]);
          // If override price is available, rescale entire series so the last close matches override
          if (overridePrice != null && closes.length > 0 && isFiniteNumber(closes[closes.length - 1]) && closes[closes.length - 1] !== 0) {
            const scale = overridePrice / closes[closes.length - 1];
            closes = closes.map(v => v * scale);
          }
          // Day / week H/L from series
          const now = Date.now();
          const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
          const dayStartMs = dayStart.getTime();
          const weekStartMs = now - 7 * 24 * 3600 * 1000;
          const dayVals = series.filter(p => p[0] >= dayStartMs).map(p => p[1] * (overridePrice && series.length ? (closes[closes.length - 1] / series[series.length - 1][1]) : 1));
          const weekVals = series.filter(p => p[0] >= weekStartMs).map(p => p[1] * (overridePrice && series.length ? (closes[closes.length - 1] / series[series.length - 1][1]) : 1));
          const dayHL = { h: dayVals.length ? Math.max(...dayVals) : undefined, l: dayVals.length ? Math.min(...dayVals) : undefined };
          const weekHL = { h: weekVals.length ? Math.max(...weekVals) : undefined, l: weekVals.length ? Math.min(...weekVals) : undefined };
          // compute indicators from closes
          const sma50 = simpleMovingAverage(closes, 50);
          const sma200 = simpleMovingAverage(closes, 200);
          const rsi14 = rsiWilder(closes, 14);
          const macd = macdHistogram(closes, 12, 26, 9);
          const atrProxy = atrFromClosesWilder(closes, 14);
          const lastClose = overridePrice != null ? overridePrice : closes[closes.length - 1];
          const pv50 = lastClose != null && sma50 != null && sma50 !== 0 ? ((lastClose - sma50) / sma50) * 100 : undefined;
          const pv200 = lastClose != null && sma200 != null && sma200 !== 0 ? ((lastClose - sma200) / sma200) * 100 : undefined;
          if (!cancelled) {
            setState({
              rsi: rsi14 ?? undefined,
              macdHist: macd ?? undefined,
              priceVsSma50Pct: isFiniteNumber(pv50) ? pv50 : undefined,
              priceVsSma200Pct: isFiniteNumber(pv200) ? pv200 : undefined,
              volumeVs20x: undefined,
              atr14: atrProxy ?? undefined,
              dayHL,
              weekHL,
              currentPrice: lastClose,
              loading: false,
            });
            return;
          }
        }
        // 2) Fallback to Finnhub candles if available (for better ATR/volume)
        if (!token) {
          if (!cancelled) setState(s => ({ ...s, loading: false }));
          return;
        }
        const to = Math.floor(Date.now() / 1000);
        const from = to - 3600 * 400;
        const url = `https://finnhub.io/api/v1/forex/candle?symbol=${encodeURIComponent(finnhubSymbol)}&resolution=60&from=${from}&to=${to}&token=${token}`;
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        if (!j || j.s !== 'ok' || !Array.isArray(j.c)) throw new Error('Brak danych świecowych');
        const closes2: number[] = j.c;
        const highs2: number[] = Array.isArray(j.h) ? j.h : [];
        const lows2: number[] = Array.isArray(j.l) ? j.l : [];
        const vols2: number[] | undefined = Array.isArray(j.v) ? j.v : undefined;

        // Check override again for Finnhub path
        let overridePrice2: number | undefined = undefined;
        try {
          const ro2 = await fetch(`/api/panel/price-override/${encodeURIComponent(overrideKey)}`, { cache: 'no-store' }).catch(() => null as any);
          if (ro2 && ro2.ok) {
            const jo2 = await ro2.json().catch(() => ({}));
            if (typeof jo2?.price === 'number' && Number.isFinite(jo2.price)) overridePrice2 = jo2.price;
          }
        } catch {}
        
        const lastClose = overridePrice2 != null ? overridePrice2 : closes2[closes2.length - 1];
        const sma50 = simpleMovingAverage(closes2, 50);
        const sma200 = simpleMovingAverage(closes2, 200);
        const rsi14 = rsiWilder(closes2, 14);
        const atr = atrWilder(highs2, lows2, closes2, 14);
        const macd = macdHistogram(closes2, 12, 26, 9);
        const volRatio =
          vols2 && vols2.length >= 20
            ? vols2[vols2.length - 1] / (average(vols2.slice(-20)) || NaN)
            : undefined;

        const pv50 = lastClose != null && sma50 != null && sma50 !== 0 ? ((lastClose - sma50) / sma50) * 100 : undefined;
        const pv200 = lastClose != null && sma200 != null && sma200 !== 0 ? ((lastClose - sma200) / sma200) * 100 : undefined;

        // H/L (approx. from closes only if highs/lows absent)
        const now = Date.now();
        const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
        const dayStartSec = Math.floor(dayStart.getTime() / 1000);
        const weekStartSec = Math.floor((now - 7 * 24 * 3600 * 1000) / 1000);
        const tsArr: number[] = Array.isArray(j.t) ? j.t : [];
        const dayIdx = tsArr.reduce<number[]>((acc, t, idx) => { if (t >= dayStartSec) acc.push(idx); return acc; }, []);
        const weekIdx = tsArr.reduce<number[]>((acc, t, idx) => { if (t >= weekStartSec) acc.push(idx); return acc; }, []);
        const dayH = highs2.length && dayIdx.length ? Math.max(...dayIdx.map(i => highs2[i])) : undefined;
        const dayL = lows2.length && dayIdx.length ? Math.min(...dayIdx.map(i => lows2[i])) : undefined;
        const weekH = highs2.length && weekIdx.length ? Math.max(...weekIdx.map(i => highs2[i])) : undefined;
        const weekL = lows2.length && weekIdx.length ? Math.min(...weekIdx.map(i => lows2[i])) : undefined;

        if (!cancelled) {
          setState({
            rsi: rsi14 ?? undefined,
            macdHist: macd ?? undefined,
            priceVsSma50Pct: isFiniteNumber(pv50) ? pv50 : undefined,
            priceVsSma200Pct: isFiniteNumber(pv200) ? pv200 : undefined,
            volumeVs20x: isFiniteNumber(volRatio) ? volRatio : undefined,
            atr14: atr ?? undefined,
            dayHL: { h: dayH, l: dayL },
            weekHL: { h: weekH, l: weekL },
            currentPrice: lastClose,
            loading: false,
          });
        }
      } catch (e: any) {
        if (!cancelled) setState({ loading: false, error: e?.message || 'Błąd danych' });
      }
    }
    setState({ loading: true });
    run();
    return () => {
      cancelled = true;
    };
  }, [assetKey, finnhubSymbol, token, overrideTimestamp]);

  // Polling dla override price - odśwież co 10 sekund i przeładuj dane jeśli cena się zmieniła
  useEffect(() => {
    const overrideKey = assetKey === 'US100' ? 'US100' : 
      assetKey === 'GOLD' ? 'XAUUSD' : 
      assetKey === 'OIL' ? 'WTI' :
      assetKey === 'EURUSD' ? 'EURUSD' :
      assetKey === 'SP500' ? 'US500' :
      assetKey === 'DAX40' ? 'DE40' :
      assetKey === 'BTCUSD' ? 'BTCUSD' :
      assetKey === 'ETHUSD' ? 'ETHUSD' :
      assetKey === 'USDJPY' ? 'USDJPY' :
      assetKey === 'GBPUSD' ? 'GBPUSD' : 'US100';
    
    let cancelled = false;
    let lastOverridePrice: number | null = null;
    
    const checkAndReload = async () => {
      if (cancelled) return;
      try {
        const ro = await fetch(`/api/panel/price-override/${encodeURIComponent(overrideKey)}`, { cache: 'no-store' });
        if (ro.ok) {
          const jo = await ro.json().catch(() => ({}));
          const newPrice = typeof jo?.price === 'number' && Number.isFinite(jo.price) ? jo.price : null;
          // Jeśli cena się zmieniła, trigger reload przez zmianę timestamp
          if (newPrice !== null && newPrice !== lastOverridePrice) {
            lastOverridePrice = newPrice;
            setOverrideTimestamp(Date.now());
          }
        }
      } catch {}
    };
    
    // Sprawdź od razu
    checkAndReload();
    
    const interval = setInterval(checkAndReload, 10000); // Co 10 sekund
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [assetKey]);

  const rsi = state.rsi;
  const macdHist = state.macdHist;
  const priceVsSma50Pct = state.priceVsSma50Pct;
  const priceVsSma200Pct = state.priceVsSma200Pct;
  const volumeVs20x = state.volumeVs20x;
  const atr14 = state.atr14;

  const rsiPct = typeof rsi === 'number' ? Math.max(0, Math.min(100, rsi)) : 0;
  const rsiClass = rsiClassification(rsi);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h2 className="text-sm font-semibold">Technika na szybko (EDU)</h2>

      {/* Indicators — raw values with small visuals */}
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wide text-white/60">Wskaźniki (surowe)</div>
        <div className="mt-3 space-y-3 text-sm">
          {state.loading && (
            <div className="text-xs text-white/60">Ładowanie wskaźników…</div>
          )}
          {/* RSI */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">RSI(14)</span>
              <div className="flex items-center gap-2">
                <span className="text-white/90">{typeof rsi === 'number' ? rsi.toFixed(0) : '—'}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ring-1 ring-inset ${badgeClass(rsiClass)}`}
                  title="Klasyfikacja RSI: &lt;30 wyprzedany, 30–70 neutralny, &gt;70 wykupiony"
                >
                  {labelForRsiClass(rsiClass)}
                </span>
              </div>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-2 bg-white/80"
                style={{ width: `${rsiPct}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={rsiPct}
                role="progressbar"
              />
            </div>
          </div>

          {/* MAs */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Cena vs SMA50</span>
              <span className={`rounded-md px-2 py-0.5 text-xs ring-1 ring-inset ${pctBadgeClass(priceVsSma50Pct)}`}>
                {fmtPct(priceVsSma50Pct)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Cena vs SMA200</span>
              <span className={`rounded-md px-2 py-0.5 text-xs ring-1 ring-inset ${pctBadgeClass(priceVsSma200Pct)}`}>
                {fmtPct(priceVsSma200Pct)}
              </span>
            </div>
          </div>

          {/* Volume vs avg 20 */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Wolumen vs średnia 20</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/90 ring-1 ring-inset ring-white/10">
                {typeof volumeVs20x === 'number' ? `${volumeVs20x.toFixed(1)}x` : '—'}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-2 bg-white/70"
                style={{ width: `${Math.max(0, Math.min(100, (typeof volumeVs20x === 'number' ? (volumeVs20x / 2) * 100 : 0)))}%` }}
              />
            </div>
          </div>

          {/* Volatility (ATR14) */}
          <div className="flex items-center justify-between">
            <span className="text-white/80">Zmienność (ATR 14)</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/90 ring-1 ring-inset ring-white/10">
              {typeof atr14 === 'number' ? atr14.toFixed(2) : '—'}
            </span>
          </div>

          {/* MACD histogram */}
          <div className="flex items-center justify-between">
            <span className="text-white/80">MACD (hist)</span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">{typeof macdHist === 'number' ? macdHist.toFixed(3) : '—'}</span>
              <span className={`rounded-md px-2 py-0.5 text-xs ring-1 ring-inset ${macdBadge(macdHist)}`}>
                {typeof macdHist === 'number' ? (macdHist > 0 ? '> 0' : '< 0') : '—'}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-white/50">
          {allUndefined([rsi, macdHist, priceVsSma50Pct, priceVsSma200Pct, volumeVs20x, atr14])
            ? 'Brak danych historycznych do obliczeń wskaźników.'
            : null}
        </div>
      </div>

      {/* News sentiment */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="text-xs uppercase tracking-wide text-white/60">Sentyment wiadomości (24h)</div>
        <div className="mt-2">
          {/* Placeholder sentiment UI (no external calls) */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Sentyment 24h</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70 ring-1 ring-inset ring-white/10">
              w przygotowaniu
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-2 bg-white/30" style={{ width: '50%' }} />
          </div>
          <div className="mt-2">
            <a
              href="/news"
              className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/15 ring-1 ring-inset ring-white/10"
            >
              Otwórz News
            </a>
          </div>
        </div>
      </div>

      {/* Levels — keep placeholders for now */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="text-xs uppercase tracking-wide text-white/60">Poziomy</div>
        <dl className="mt-2 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-white/80">Dziś H / L</dt>
            <dd className="text-white/90">
              {fmtNum(state.dayHL?.h)} / {fmtNum(state.dayHL?.l)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/80">Tydzień H / L</dt>
            <dd className="text-white/90">
              {fmtNum(state.weekHL?.h)} / {fmtNum(state.weekHL?.l)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 text-[11px] text-white/60">Materiał edukacyjny — nie jest doradztwem.</p>
    </section>
  );
}

/* ---------- utils: math/indicators (pure, minimal) ---------- */
function isFiniteNumber(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function average(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function simpleMovingAverage(values: number[], period: number): number | null {
  if (!Array.isArray(values) || values.length < period) return null;
  const slice = values.slice(-period);
  return average(slice);
}

function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = average(values.slice(0, period));
  if (!Number.isFinite(prev)) prev = values[0];
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function rsiWilder(closes: number[], period: number): number | null {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function atrWilder(highs: number[], lows: number[], closes: number[], period: number): number | null {
  const n = Math.min(highs.length, lows.length, closes.length);
  if (n < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < n; i++) {
    const h = highs[i];
    const l = lows[i];
    const pc = closes[i - 1];
    const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
    trs.push(tr);
  }
  // Wilder smoothing
  let atr = average(trs.slice(0, period));
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return atr;
}

// Proxy ATR when only closes are available (approximate TR as |close - prevClose|)
function atrFromClosesWilder(closes: number[], period: number): number | null {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    trs.push(Math.abs(closes[i] - closes[i - 1]));
  }
  let atr = average(trs.slice(0, period));
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return atr;
}
function macdHistogram(closes: number[], fast = 12, slow = 26, signal = 9): number | null {
  if (!Array.isArray(closes) || closes.length < slow + signal) return null;
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  // align arrays
  const n = closes.length;
  const macdLine: number[] = [];
  for (let i = 0; i < n; i++) {
    const ef = emaFast[i];
    const es = emaSlow[i];
    if (isFiniteNumber(ef) && isFiniteNumber(es)) macdLine[i] = ef - es;
  }
  const macdValid = macdLine.filter(isFiniteNumber);
  if (macdValid.length < signal) return null;
  const signalArr = ema(macdValid, signal);
  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalArr[signalArr.length - 1];
  if (!isFiniteNumber(lastMacd) || !isFiniteNumber(lastSignal)) return null;
  return lastMacd - lastSignal;
}
function rsiClassification(rsi: number | undefined): 'oversold' | 'neutral' | 'overbought' | 'unknown' {
  if (typeof rsi !== 'number') return 'unknown';
  if (rsi < 30) return 'oversold';
  if (rsi > 70) return 'overbought';
  return 'neutral';
}

function labelForRsiClass(cls: ReturnType<typeof rsiClassification>) {
  switch (cls) {
    case 'oversold':
      return 'Wyprzedany';
    case 'overbought':
      return 'Wykupiony';
    case 'neutral':
      return 'Neutralny';
    default:
      return '—';
  }
}

function badgeClass(cls: ReturnType<typeof rsiClassification>) {
  switch (cls) {
    case 'oversold':
      return 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30';
    case 'overbought':
      return 'bg-rose-500/15 text-rose-200 ring-rose-400/30';
    case 'neutral':
      return 'bg-white/10 text-white/80 ring-white/20';
    default:
      return 'bg-white/5 text-white/60 ring-white/10';
  }
}

function pctBadgeClass(pct: number | undefined) {
  if (typeof pct !== 'number') return 'bg-white/5 text-white/60 ring-white/10';
  if (pct > 0) return 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30';
  if (pct < 0) return 'bg-rose-500/15 text-rose-200 ring-rose-400/30';
  return 'bg-white/10 text-white/80 ring-white/20';
}

function fmtPct(pct: number | undefined) {
  return typeof pct === 'number' ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '—';
}

function macdBadge(h: number | undefined) {
  if (typeof h !== 'number') return 'bg-white/5 text-white/60 ring-white/10';
  return h > 0 ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30' : 'bg-rose-500/15 text-rose-200 ring-rose-400/30';
}

function allUndefined(arr: Array<unknown>) {
  return arr.every(v => typeof v === 'undefined');
}

function fmtNum(n?: number) {
  return typeof n === 'number'
    ? n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '—';
}



