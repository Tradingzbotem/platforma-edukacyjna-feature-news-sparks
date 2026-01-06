'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Sentiment = 'bullish' | 'bearish' | 'neutral' | 'Pozytywny' | 'Negatywny' | 'Neutralny' | string;
type Trend = 'up' | 'down' | 'neutral';

type Brief = {
  ts_iso: string;
  sentiment?: Sentiment;
};

type ApiResponse = { ok: boolean; items?: Brief[] };

const LS_KEY_LAST = 'fxedu:emotions:last';
const LS_KEY_SERIES = 'fxedu:emotions:series';
const POLL_MS = 60_000;
const LS_KEY_LAST_AT = 'fxedu:emotions:lastAt';

// US100-relative baseline storage
const BASE_KEY_PRICE = 'fxedu:emotions:us100:basePrice';
const BASE_KEY_AT = 'fxedu:emotions:us100:baseAt';
const US100_SYMBOL = 'OANDA:NAS100_USD'; // Finnhub forex symbol for NAS100 CFD
// Sensitivity: changePct of ±3% maps to 0..100 extremes
const SENSITIVITY_PCT = 3;

function isMarketOpenNow(date = new Date()): boolean {
  // Proste założenie: CFD 24/5 — zamknięte w weekend (sob-niedz).
  // Jeśli weekend → zamroź wskaźnik.
  const day = date.getUTCDay(); // 0=Sunday, 6=Saturday
  return day !== 0 && day !== 6;
}

function toBasicSentiment(s?: Sentiment): 'bullish' | 'bearish' | 'neutral' {
  const v = String(s || '').toLowerCase();
  if (v.includes('pozy') || v.includes('bull')) return 'bullish';
  if (v.includes('neg') || v.includes('bear')) return 'bearish';
  return 'neutral';
}

function calcScore(items: Brief[]): number {
  const counts = items.reduce(
    (acc, it) => {
      const s = toBasicSentiment(it.sentiment);
      if (s === 'bullish') acc.bullish += 1;
      else if (s === 'bearish') acc.bearish += 1;
      else acc.neutral += 1;
      return acc;
    },
    { bullish: 0, bearish: 0, neutral: 0 }
  );
  const total = counts.bullish + counts.bearish + counts.neutral;
  const score = 50 + ((counts.bullish - counts.bearish) / Math.max(1, total)) * 50;
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function fetchBrief24h(): Promise<Brief[] | null> {
  try {
    const res = await fetch('/api/brief/list?bucket=24h&limit=50', { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as ApiResponse;
    const arr = Array.isArray(j?.items) ? j.items : [];
    return arr.length ? arr : [];
  } catch {
    return null;
  }
}

// Removed sparkline/series persistence per latest UI requirements

export default function EmotionsGauge() {
  // Fixed initial value for SSR/CSR parity
  const [score, setScore] = useState<number>(50);
  const [ts, setTs] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [baseAt, setBaseAt] = useState<number | null>(null);
  const [settingBase, setSettingBase] = useState<boolean>(false);
  const [trend, setTrend] = useState<Trend>('neutral');

  // Helpers
  const publicToken =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ||
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
    '';

  async function fetchUs100Price(): Promise<number | null> {
    try {
      if (publicToken) {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(US100_SYMBOL)}&token=${publicToken}`;
        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json() as any;
        const price = typeof j?.c === 'number' ? j.c : null;
        return price != null && Number.isFinite(price) ? price : null;
      }
      // Fallback: synthetic last value from sparkline demo endpoint
      const r = await fetch(`/api/quotes/sparkline?symbols=US100&range=7d&interval=1h`, { cache: 'no-store' });
      const j = await r.json();
      const arr: Array<{ symbol: string; series: Array<[number, number]> }> = Array.isArray(j?.data) ? j.data : [];
      const s = arr.find(x => x.symbol === 'US100')?.series ?? [];
      const last = s.length ? s[s.length - 1][1] : null;
      return last != null && Number.isFinite(last) ? last : null;
    } catch {
      return null;
    }
  }

  function pctToScore(changePct: number): number {
    const clamped = Math.max(-SENSITIVITY_PCT, Math.min(SENSITIVITY_PCT, changePct));
    const ratio = clamped / SENSITIVITY_PCT; // -1..1
    const raw = 50 + ratio * 50;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  // Load baseline from LS (or set on first successful price fetch)
  useEffect(() => {
    try {
      const baseRaw = localStorage.getItem(BASE_KEY_PRICE);
      const atRaw = localStorage.getItem(BASE_KEY_AT);
      const bp = baseRaw ? Number(JSON.parse(baseRaw)) : null;
      const ba = atRaw ? Number(atRaw) : null;
      setBasePrice(bp && Number.isFinite(bp) ? bp : null);
      setBaseAt(ba && Number.isFinite(ba) ? ba : null);
    } catch {}
  }, []);

  // Polling (guarded for Strict Mode and throttled across tabs)
  useEffect(() => {
    let alive = true;
    const busyRef = { current: false } as { current: boolean };

    async function pull(force = false) {
      // Jeśli rynek nieczynny (weekend) – nie aktualizuj wskazania
      if (!isMarketOpenNow()) {
        setTs(new Date().toISOString());
        return;
      }
      if (!alive || busyRef.current) return;

      // cross-tab throttle for gauge updates
      try {
        const lastAtRaw = localStorage.getItem(LS_KEY_LAST_AT);
        const lastAt = lastAtRaw ? Number(lastAtRaw) : 0;
        const now = Date.now();
        if (!force && now - lastAt < POLL_MS - 2500) {
          const raw = localStorage.getItem(LS_KEY_LAST);
          const v = raw ? Number(JSON.parse(raw)) : 50;
          setScore(Number.isFinite(v) ? v : 50);
          setTs(new Date(now).toISOString());
          return;
        }
      } catch {}

      busyRef.current = true;

      // 1) Read latest US100 price
      const price = await fetchUs100Price();
      if (!alive) { busyRef.current = false; return; }

      let nextScore: number | null = null;

      if (price != null) {
        let bp = basePrice;
        if (bp == null) {
          // initialize baseline
          bp = price;
          setBasePrice(bp);
          setBaseAt(Date.now());
          try {
            localStorage.setItem(BASE_KEY_PRICE, JSON.stringify(bp));
            localStorage.setItem(BASE_KEY_AT, String(Date.now()));
          } catch {}
        }
        if (bp != null && bp !== 0) {
          const changePct = ((price - bp) / bp) * 100;
          setTrend(changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'neutral');
          nextScore = pctToScore(changePct);
        }
      }

      // 2) Fallback to brief sentiment score if price unavailable
      if (nextScore == null) {
        const items = await fetchBrief24h();
        if (items) nextScore = calcScore(items);
        setTrend('neutral');
      }

      if (nextScore == null) nextScore = 50;

      setScore(nextScore);
      setTs(new Date().toISOString());
      try {
        localStorage.setItem(LS_KEY_LAST, JSON.stringify(nextScore));
        localStorage.setItem(LS_KEY_LAST_AT, String(Date.now()));
      } catch {}

      busyRef.current = false;
    }

    // initial tick (throttled)
    void pull(true);
    const id = setInterval(() => void pull(), POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [basePrice]);

  const arc = useMemo(() => buildArcPath(score), [score]);

  async function handleSetBaselineNow() {
    try {
      setSettingBase(true);
      const price = await fetchUs100Price();
      if (price != null) {
        const now = Date.now();
        setBasePrice(price);
        setBaseAt(now);
        try {
          localStorage.setItem(BASE_KEY_PRICE, JSON.stringify(price));
          localStorage.setItem(BASE_KEY_AT, String(now));
        } catch {}
        // Reset gauge to neutral immediately after setting baseline
        setScore(50);
        setTrend('neutral');
        setTs(new Date(now).toISOString());
        try {
          localStorage.setItem(LS_KEY_LAST, JSON.stringify(50));
          localStorage.setItem(LS_KEY_LAST_AT, String(now));
        } catch {}
      }
    } finally {
      setSettingBase(false);
    }
  }

  return (
    <section aria-label="Emocje inwestorów" className="rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Emocje inwestorów</h3>
          <p className="text-slate-500 text-sm">Skala 0–100 (Fear → Greed)</p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetBaselineNow}
              disabled={settingBase}
              className="text-[11px] text-slate-600 underline underline-offset-4 hover:text-slate-800 disabled:opacity-50"
              aria-label="Ustaw bazę na teraz (US100)"
            >
              {settingBase ? 'Ustawianie…' : 'Ustaw bazę na teraz'}
            </button>
            <span
              className={
                `text-[11px] ` +
                (trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500')
              }
              aria-live="polite"
            >
              {trend === 'up' ? 'wzrost' : trend === 'down' ? 'spadek' : 'neutral'}
            </span>
            {baseAt != null && (
              <span className="text-[11px] text-slate-400">
                Baza: {new Date(baseAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900" aria-live="polite" aria-atomic="true">{score}</div>
          <div className="text-[11px] text-slate-500">{ts ? new Date(ts).toLocaleTimeString() : '—'}</div>
        </div>
      </div>

      <div className="mt-4">
        {/* Gauge */}
        <div className="flex items-center justify-center">
          <svg
            width="220" height="120" viewBox="0 0 220 120"
            role="img" aria-label={`Gauge emocji ${score} na 100`}
          >
            {/* background arc */}
            <path d={buildArcPath(100)} fill="none" stroke="rgba(15,23,42,0.15)" strokeWidth={14} />
            {/* active arc */}
            <path d={arc} fill="none" stroke="url(#grad)" strokeWidth={14} strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {/* tick */}
            {renderNeedle(score)}
          </svg>
        </div>
      </div>
    </section>
  );
}

function buildArcPath(value: number): string {
  // Map 0..100 → 180..0 degrees over a semicircle
  const clamped = Math.max(0, Math.min(100, value));
  const endAngle = Math.PI - (clamped / 100) * Math.PI; // radians, from left (PI) to right (0)
  const radius = 90;
  const cx = 110;
  const cy = 110;
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy - radius * Math.sin(endAngle);
  const largeArc = clamped > 50 ? 1 : 0; // more than half
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
}

function renderNeedle(value: number) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = Math.PI - (clamped / 100) * Math.PI; // 180..0
  const cx = 110;
  const cy = 110;
  const r = 78;
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#0f172a" fillOpacity="0.9" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#0f172a" strokeOpacity="0.9" strokeWidth={2} />
    </g>
  );
}

// Sparkline and price spark removed

