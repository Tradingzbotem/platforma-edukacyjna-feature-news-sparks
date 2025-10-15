'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Sentiment = 'bullish' | 'bearish' | 'neutral' | 'Pozytywny' | 'Negatywny' | 'Neutralny' | string;

type Brief = {
  ts_iso: string;
  sentiment?: Sentiment;
};

type ApiResponse = { ok: boolean; items?: Brief[] };

const LS_KEY_LAST = 'fxedu:emotions:last';
const LS_KEY_SERIES = 'fxedu:emotions:series';
const POLL_MS = 60_000;
const LS_KEY_LAST_AT = 'fxedu:emotions:lastAt';
// (Price integration removed from UI per request)

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

  // Polling (guarded for Strict Mode and throttled across tabs)
  useEffect(() => {
    let alive = true;
    const startedRef = { current: false } as { current: boolean };
    const busyRef = { current: false } as { current: boolean };

    async function pull(force = false) {
      if (!alive || busyRef.current) return;
      // cross-tab throttle
      try {
        const lastAtRaw = localStorage.getItem(LS_KEY_LAST_AT);
        const lastAt = lastAtRaw ? Number(lastAtRaw) : 0;
        const now = Date.now();
        if (!force && now - lastAt < POLL_MS - 2500) {
          // use cached value if present
          const raw = localStorage.getItem(LS_KEY_LAST);
          const v = raw ? Number(JSON.parse(raw)) : 50;
          setScore(Number.isFinite(v) ? v : 50);
          setTs(new Date(now).toISOString());
          // clear previous errors implicitly by refreshing TS
          return;
        }
      } catch {}

      busyRef.current = true;
      const items = await fetchBrief24h();
      if (!alive) { busyRef.current = false; return; }
      if (items) {
        const s = calcScore(items);
        setScore(s);
        try {
          localStorage.setItem(LS_KEY_LAST, JSON.stringify(s));
          localStorage.setItem(LS_KEY_LAST_AT, String(Date.now()));
        } catch {}
        setTs(new Date().toISOString());
      } else {
        // fallback to last stored
        try {
          const raw = localStorage.getItem(LS_KEY_LAST);
          const v = raw ? Number(JSON.parse(raw)) : 50;
          setScore(Number.isFinite(v) ? v : 50);
        } catch { setScore(50); }
      }
      busyRef.current = false;
    }

    // initial tick (throttled)
    void pull(true);
    const id = setInterval(() => void pull(), POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Price fetching removed from UI per request

  const arc = useMemo(() => buildArcPath(score), [score]);

  return (
    <section aria-label="Emocje inwestorów" className="rounded-2xl p-5 sm:p-6 bg-white/5 border border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Emocje inwestorów</h3>
          <p className="text-white/60 text-sm">Skala 0–100 (Fear → Greed)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">{score}</div>
          <div className="text-[11px] text-white/60">{ts ? new Date(ts).toLocaleTimeString() : '—'}</div>
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
            <path d={buildArcPath(100)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={14} />
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
      <circle cx={cx} cy={cy} r={4} fill="#fff" fillOpacity="0.9" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#fff" strokeOpacity="0.9" strokeWidth={2} />
    </g>
  );
}

// Sparkline and price spark removed

