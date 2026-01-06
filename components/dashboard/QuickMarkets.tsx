'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Item = {
  key: string;        // US100, EURUSD...
  label: string;      // UI label
  base: number;       // reference price to shape the series around
  decimals: number;   // formatting precision
};

const ITEMS: Item[] = [
  { key: 'US100',  label: 'US100',  base: 25445, decimals: 2 },
  { key: 'EURUSD', label: 'EURUSD', base: 1.187,  decimals: 3 },
  { key: 'GOLD',   label: 'GOLD',   base: 2350,  decimals: 2 },
  { key: 'OIL',    label: 'OIL',    base: 77.2,  decimals: 2 },
];

type Series = Array<[number, number]>;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Deterministic, per-day local generator — no network, stable for the day
function genSeriesForDay(key: string, base: number, points = 24): Series {
  const seed = hashString(`${key}:${startOfToday()}`);
  const now = Date.now();
  const stepMs = 3600 * 1000; // 1h
  const series: Series = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * stepMs;
    const angle = (i / points) * Math.PI * 2;
    const noise = (Math.sin(angle * (1 + (seed % 3))) + Math.cos(angle * 0.7 + (seed % 5))) * 0.5;
    const drift = Math.sin(angle * 0.25) * 0.004;   // ±0.4%
    const value = base * (1 + drift) + noise * base * 0.002; // ±0.2% noise
    series.push([t, Number(value.toFixed(6))]);
  }
  return series;
}

function buildSparkPath(series: Series, w = 84, h = 24): string {
  if (!series?.length) return '';
  const xs = series.map((p) => p[0]);
  const ys = series.map((p) => p[1]);
  const minX = xs[0]!;
  const maxX = xs[xs.length - 1]!;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = Math.max(1, maxX - minX);
  const dy = Math.max(1e-6, maxY - minY);
  const points = series.map(([x, y]) => {
    const px = ((x - minX) / dx) * (w - 2) + 1;
    const py = h - (((y - minY) / dy) * (h - 2) + 1);
    return [px, py] as const;
  });
  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
}

function fmt(n: number | undefined, decimals: number) {
  if (n == null || !isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Sparkline({ d, colorClass }: { d: string; colorClass: string }) {
  const ref = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !d) return;
    try {
      const len = el.getTotalLength();
      el.style.transition = 'none';
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      void el.getBoundingClientRect();
      el.style.transition = 'stroke-dashoffset 700ms ease';
      el.style.strokeDashoffset = '0';
    } catch {}
  }, [d]);
  return (
    <svg width="84" height="24" viewBox="0 0 84 24" aria-hidden>
      <path ref={ref} d={d} fill="none" stroke="currentColor" className={colorClass} strokeWidth="2" />
    </svg>
  );
}

export default function QuickMarkets() {
  const [seriesMap, setSeriesMap] = useState<Record<string, Series>>({});

  // Generate once per mount; stable per day via seed
  useEffect(() => {
    const map: Record<string, Series> = {};
    for (const it of ITEMS) map[it.key] = genSeriesForDay(it.key, it.base);
    setSeriesMap(map);
  }, []);

  const rows = useMemo(() => {
    return ITEMS.map((it) => {
      const s = seriesMap[it.key] || [];
      const last = s.length ? s[s.length - 1][1] : undefined;
      const first = s.length ? s[0][1] : undefined;
      const pct = first != null && last != null && first !== 0 ? ((last - first) / first) * 100 : undefined;
      const up = pct != null ? pct >= 0 : undefined;
      const path = buildSparkPath(s);
      const color = up == null ? 'text-white/40' : up ? 'text-emerald-400' : 'text-rose-400';
      return (
        <div key={it.key} className="py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
          <div className="text-sm text-white/90">{it.label}</div>
          <div className="text-right">
            <div className="font-semibold text-white">{fmt(last, it.decimals)}</div>
            <div className="flex items-center justify-end gap-1 text-xs">
              <span className={color}>
                {up == null ? '…' : up ? '+ ' : '− '}
                {pct != null ? Math.abs(pct).toFixed(2) : '—'}%
              </span>
              <span className="rounded-full border border-white/15 px-1 text-[10px] leading-none text-white/70">24h</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline d={path} colorClass={up == null ? 'text-white/40' : up ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
        </div>
      );
    });
  }, [seriesMap]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quick markets</h2>
        <a href="/konto/panel-rynkowy/kalendarz-7-dni" className="text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white">
          Otwórz kalendarz →
        </a>
      </div>
      <div className="mt-3 divide-y divide-white/10">
        {rows}
      </div>
    </section>
  );
}


