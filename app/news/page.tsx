// app/news/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import NewsBuckets from './components/NewsBuckets';
import dynamic from 'next/dynamic';

/* ─────────────────────────────────────────────────────────────
   Typy zgodne z /api/news/summarize
   ───────────────────────────────────────────────────────────── */
type Item = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source?: string;
  link?: string;
  detail?: string;
};

type Lang = 'pl' | 'en';

/* ─────────────────────────────────────────────────────────────
   Sparkline (mini wykresy) – typy i cache
   ───────────────────────────────────────────────────────────── */
type Spark = {
  symbol: string;
  points: Array<{ t: number; c: number }>;
  first: number;
  last: number;
};

const SPARK_CACHE_KEY = 'fxedu_sparks_v1';

function readSparkCache(keys: string[], range: string, interval: string) {
  if (typeof window === 'undefined') return {} as Record<string, Spark>;
  try {
    const raw = localStorage.getItem(SPARK_CACHE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as {
      ts: number;
      range: string;
      interval: string;
      map: Record<string, Spark>;
    };
    // cache 15 min i zgodność parametrów
    if (Date.now() - data.ts > 15 * 60 * 1000) return {};
    if (data.range !== range || data.interval !== interval) return {};
    const out: Record<string, Spark> = {};
    keys.forEach(k => {
      if (data.map[k]) out[k] = data.map[k];
    });
    return out;
  } catch {
    return {};
  }
}

function writeSparkCache(map: Record<string, Spark>, range: string, interval: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SPARK_CACHE_KEY);
    const prev = raw ? (JSON.parse(raw) as any) : null;
    const old = prev?.map || {};
    const merged = { ...old, ...map };
    localStorage.setItem(
      SPARK_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), range, interval, map: merged })
    );
  } catch {}
}

/* ─────────────────────────────────────────────────────────────
   Utils
   ───────────────────────────────────────────────────────────── */
const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const relTime = (ts: number, lang: Lang) => {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return lang === 'pl' ? 'przed chwilą' : 'just now';
  if (m < 60) return lang === 'pl' ? `${m} min temu` : `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'pl' ? `${h} h temu` : `${h} h ago`;
  const dd = Math.floor(h / 24);
  return lang === 'pl' ? `${dd} d temu` : `${dd} d ago`;
};

/* ─────────────────────────────────────────────────────────────
   Sentyment (heurystyka) + kolory
   ───────────────────────────────────────────────────────────── */
const POS_PL = ['wzrost', 'rosną', 'spadek inflacji', 'lepszy', 'mocny', 'umocnienie', 'zyskuje', 'rekord'];
const NEG_PL = ['spadek', 'spadają', 'gorzej', 'słaby', 'osłabienie', 'traci', 'ryzyko', 'wojna', 'kryzys', 'obniżka ratingu'];

const POS_EN = ['rally', 'gain', 'beats', 'strong', 'improves', 'cooling inflation', 'surge', 'record'];
const NEG_EN = ['drop', 'falls', 'miss', 'weak', 'selloff', 'risk', 'war', 'crisis', 'downgrade'];

function sentimentOf(text: string, lang: Lang) {
  const t = text.toLowerCase();
  const pos = (lang === 'pl' ? POS_PL : POS_EN).reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0);
  const neg = (lang === 'pl' ? NEG_PL : NEG_EN).reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0);
  if (pos === 0 && neg === 0) return 0;
  return Math.max(-1, Math.min(1, (pos - neg) / Math.max(1, pos + neg)));
}

function sentimentColor(v: number) {
  if (v > 0.25) return 'text-emerald-300';
  if (v < -0.25) return 'text-rose-300';
  return 'text-amber-300';
}

/* ─────────────────────────────────────────────────────────────
   Kategoria + kolory
   ───────────────────────────────────────────────────────────── */
type Cat = 'FX' | 'Indeksy' | 'Surowce' | 'Makro';

function catOf(item: Item): Cat {
  const ins = item.instruments?.map(s => s.toUpperCase()) || [];
  const hasCommo = ins.some(s => ['WTI', 'UKOIL', 'XAUUSD', 'XAGUSD', 'BRENT', 'ZLOTO', 'GOLD'].includes(s));
  const hasFx = ins.some(s => /(USD|EUR|JPY|GBP|CHF|CAD|AUD|NZD)/.test(s));
  const hasEq = ins.some(s => ['US100', 'SPX', 'DAX', 'FTSE', 'NDX', 'DJI'].includes(s));
  if (hasCommo) return 'Surowce';
  if (hasFx) return 'FX';
  if (hasEq) return 'Indeksy';
  return 'Makro';
}

const CAT_COLORS: Record<Cat, { from: string; to: string }> = {
  FX: { from: '#4f46e5', to: '#0891b2' },        // indigo → cyan
  Indeksy: { from: '#10b981', to: '#0ea5e9' },   // emerald → sky
  Surowce: { from: '#f59e0b', to: '#ea580c' },   // amber → orange
  Makro: { from: '#334155', to: '#0f172a' },     // slate shades
};

/* ─────────────────────────────────────────────────────────────
   Illustration SVG (hero/card)
   ───────────────────────────────────────────────────────────── */
function hashInt(s: string, mod = 1000) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function Illustration({
  cat,
  sentiment,
  seed,
  tall,
}: {
  cat: Cat;
  sentiment: number;
  seed: string;
  tall?: boolean;
}) {
  const { from, to } = CAT_COLORS[cat];
  const w = 1200;
  const h = tall ? 420 : 160; // ← mniejsze

  const steps = 10;
  const base = h * 0.6;
  const amp = 28 + (hashInt(seed, 22) % 16);
  const slope = Math.max(-0.9, Math.min(0.9, sentiment)) * 30;

  let d = `M 0 ${base - slope}`;
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * w;
    const jitter = (Math.sin((i + hashInt(seed, 7)) * 1.1) * amp) / 6;
    const y = base - slope + jitter + (i - steps / 2) * (-slope / steps);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  const candles = Array.from({ length: 7 }, (_, i) => {
    const cw = 12;
    const cx = 60 + i * ((w - 140) / 6);
    const ch = 22 + ((i * 13 + hashInt(seed, 40)) % 46);
    const cy = base - ch / 2 + ((i % 2) * 10 - 5);
    return { x: cx, y: cy, w: cw, h: ch };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${cat} illustration`}>
      <defs>
        <linearGradient id={`g-${cat}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <pattern id="grid" width="32" height="16" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={w} height={h} fill={`url(#g-${cat})`} />
      <rect x="0" y="0" width={w} height={h} fill="url(#grid)" />

      {candles.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="3" fill="rgba(255,255,255,0.20)" />
      ))}

      <path d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
      <circle cx={(w * (steps - 0.5)) / steps} cy={base - slope} r="4" fill="rgba(255,255,255,0.95)" />
    </svg>
  );
}

function InfoDniaCard({ brief }: { brief: Brief }) {
  return (
    <article className="rounded-2xl bg-[#0b1220] border border-white/10 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
          <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">AI</span>
          <span>Info dnia</span>
          <span>•</span>
          <time dateTime={brief.ts_iso}>{fmtDate(brief.ts_iso, 'pl')}</time>
        </div>
        <h2 className="text-lg md:text-xl font-bold leading-snug">
          {brief.title || 'Info dnia (AI) — 08:00'}
        </h2>
        <div className="prose prose-invert mt-3 max-w-none text-[15px] leading-relaxed">
          {brief.content.split('\n').map((ln, i) =>
            ln.trim().startsWith('•') || ln.trim().startsWith('-') ? (
              <div key={i}>• {ln.replace(/^[-•]\s*/, '')}</div>
            ) : (
              <p key={i} className="mb-2 last:mb-0">
                {ln}
              </p>
            )
          )}
        </div>
        <div className="mt-3 text-[11px] text-white/50">
          Materiał edukacyjny — to nie jest rekomendacja inwestycyjna.
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   LeadChart – świeższy wykres świecowy z wolumenem (SVG)
   ───────────────────────────────────────────────────────────── */
function LeadChart({ spark, symbol }: { spark?: Spark; symbol?: string }) {
  const [series, setSeries] = useState<Array<{ t: number; c: number }>>(spark?.points || []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (series.length || !symbol) return;
        const url = `/api/quotes/sparkline?symbols=${encodeURIComponent(symbol)}&range=7d&interval=1h`;
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        const json = await res.json();
        const arr: Array<[number, number]> = json?.data?.[0]?.series || [];
        const pts = arr.map(([t, v]) => ({ t, c: Number(v) })).filter(p => isFinite(p.c));
        if (!alive) return;
        setSeries(pts);
      } catch {
        // cichy fallback – zostanie ilustracja
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // jeśli brak danych – pokaż nic (pozwoli wyświetlić fallback wyżej)
  if (!series.length) return null;

  // grupowanie na świece (ok. 36–48 świec na ekran)
  const group = Math.max(2, Math.ceil(series.length / 42));
  const candles = [] as Array<{ t: number; o: number; h: number; l: number; c: number; v: number }>;
  for (let i = 0; i < series.length; i += group) {
    const slice = series.slice(i, i + group);
    if (!slice.length) continue;
    const o = slice[0].c;
    const c = slice[slice.length - 1].c;
    const h = Math.max(...slice.map(p => p.c));
    const l = Math.min(...slice.map(p => p.c));
    const v = slice.reduce((a, p, idx) => (idx === 0 ? a : a + Math.abs(p.c - slice[idx - 1].c)), 0);
    candles.push({ t: slice[slice.length - 1].t, o, h, l, c, v });
  }

  const w = 1200;
  const h = 280;
  const pad = 26;
  const volH = 52;

  const minP = Math.min(...candles.map(k => k.l));
  const maxP = Math.max(...candles.map(k => k.h));
  const min = minP - (maxP - minP) * 0.05;
  const max = maxP + (maxP - minP) * 0.05;

  const xs = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, candles.length - 1);
  const ys = (v: number) => pad + (1 - (v - min) / Math.max(1e-9, max - min)) * (h - pad - volH);
  const yv = (v: number) => h - pad - (v / Math.max(1e-9, Math.max(...candles.map(k => k.v)))) * volH;

  // prosta średnia krocząca po zamknięciach
  const maWindow = Math.max(2, Math.round(candles.length / 10));
  const ma: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const from = Math.max(0, i - maWindow + 1);
    const slice = candles.slice(from, i + 1).map(k => k.c);
    ma.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Lead price chart">
      <defs>
        <linearGradient id="lg-grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={w} height={h} fill="#0b1220" />
      {/* siatka */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`g-${i}`} x1={pad} x2={w - pad} y1={pad + (i * (h - pad - volH - pad)) / 5} y2={pad + (i * (h - pad - volH - pad)) / 5} stroke="rgba(255,255,255,0.07)" />
      ))}

      {/* wolumen */}
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const cw = Math.max(2, (w - 2 * pad) / candles.length * 0.6);
        const x = xs(i) - cw / 2;
        return (
          <rect key={`v-${i}`} x={x} width={cw} y={yv(k.v)} height={h - pad - yv(k.v)} fill={up ? 'rgba(147,197,253,0.35)' : 'rgba(248,113,113,0.35)'} />
        );
      })}

      {/* świece */}
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const col = up ? '#93c5fd' : '#fb7185';
        const cw = Math.max(3, (w - 2 * pad) / candles.length * 0.55);
        const x = xs(i);
        const yOpen = ys(k.o);
        const yClose = ys(k.c);
        const yHigh = ys(k.h);
        const yLow = ys(k.l);
        const rectY = Math.min(yOpen, yClose);
        const rectH = Math.max(2, Math.abs(yClose - yOpen));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={col} strokeWidth={1.2} />
            <rect x={x - cw / 2} y={rectY} width={cw} height={rectH} rx={2} fill={col} />
          </g>
        );
      })}

      {/* MA linia */}
      <path
        d={ma.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)},${ys(v)}`).join(' ')}
        fill="none"
        stroke="#e5e7eb"
        strokeOpacity={0.85}
        strokeWidth={1.5}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Cache newsów (30 min) – per lang + hours
   ───────────────────────────────────────────────────────────── */
const CACHE_KEY = 'fxedu_news_cache_v1';
type CacheEntry = { ts: number; lang: Lang; hours: number; items: Item[] };

function readCache(lang: Lang, hours: number): CacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const arr: CacheEntry[] = JSON.parse(raw);
    const hit = arr.find(e => e.lang === lang && e.hours === hours);
    if (!hit) return null;
    if (Date.now() - hit.ts > 30 * 60 * 1000) return null; // 30 min
    return hit;
  } catch {
    return null;
  }
}

function writeCache(lang: Lang, hours: number, items: Item[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const arr: CacheEntry[] = raw ? JSON.parse(raw) : [];
    const rest = arr.filter(e => !(e.lang === lang && e.hours === hours));
    rest.push({ ts: Date.now(), lang, hours, items });
    localStorage.setItem(CACHE_KEY, JSON.stringify(rest));
  } catch {}
}

/* ─────────────────────────────────────────────────────────────
   Sparkline nastroju (średnia z bucketów 6h)
   ───────────────────────────────────────────────────────────── */
function makeBins(items: Item[], lang: Lang) {
  const now = Date.now();
  const bins = Array.from({ length: 12 }, (_, i) => ({
    from: now - (12 - i) * 6 * 3600 * 1000,
    to: now - (11 - i) * 6 * 3600 * 1000,
    vals: [] as number[],
  }));
  items.forEach(it => {
    const ts = new Date(it.timestamp_iso).getTime();
    const s = sentimentOf(`${it.title}. ${it.summary}`, lang);
    bins.forEach(b => {
      if (ts >= b.from && ts < b.to) b.vals.push(s);
    });
  });
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  return bins.map(b => avg(b.vals));
}

function SentimentSparkline({ items, lang }: { items: Item[]; lang: Lang }) {
  const series = makeBins(items, lang);
  const w = 680, h = 80, pad = 6;
  const xs = (i: number) => pad + (i * (w - 2 * pad)) / (series.length - 1 || 1);
  const ys = (v: number) => {
    const t = (v + 1) / 2;
    return pad + (1 - t) * (h - 2 * pad);
  };
  const d = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)},${ys(v)}`).join(' ');
  const last = series[series.length - 1] ?? 0;

  return (
    <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white/70">Nastroje inwestorów (ostatnie 72h)</div>
        <div className={`text-sm ${sentimentColor(last)}`}>
          {last > 0.25 ? 'Pozytywny' : last < -0.25 ? 'Negatywny' : 'Neutralny'}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Sparkline">
        <line x1={pad} y1={ys(0)} x2={w - pad} y2={ys(0)} className="stroke-white/10" />
        <path d={`${d} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} className="fill-white/10" />
        <path d={d} className="stroke-white/70" fill="none" strokeWidth="2" />
        <circle cx={xs(series.length - 1)} cy={ys(last)} r="3.5" className="fill-white" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mini gauge (etykieta sentymentu)
   ───────────────────────────────────────────────────────────── */
function SentimentGauge({ value }: { value: number }) {
  const pct = Math.round(((value + 1) / 2) * 100);
  return (
    <div className="flex items-center gap-2">
      <svg width="90" height="10" viewBox="0 0 110 14" aria-hidden="true">
        <rect x="0" y="4" width="110" height="6" rx="3" className="fill-white/10" />
        <rect x="0" y="4" width={(110 * pct) / 100} height="6" rx="3" className="fill-white/60" />
      </svg>
      <span className={`text-[11px] ${sentimentColor(value)}`}>
        {value > 0.25 ? 'Pozytywny' : value < -0.25 ? 'Negatywny' : 'Neutralny'}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mini wykres ceny (PriceSparkline)
   ───────────────────────────────────────────────────────────── */
function PriceSparkline({ data, small }: { data: Spark | undefined; small?: boolean }) {
  if (!data || !data.points?.length) return null;

  const w = small ? 140 : 200; // ← mniejsze
  const h = small ? 40 : 56;   // ← mniejsze
  const pad = 6;

  const xs = (i: number, n: number) => pad + (i * (w - 2 * pad)) / Math.max(1, n - 1);
  const min = Math.min(...data.points.map(p => p.c));
  const max = Math.max(...data.points.map(p => p.c));
  const ys = (v: number) => pad + (1 - (v - min) / Math.max(1e-9, max - min)) * (h - 2 * pad);

  const path = data.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i, data.points.length)},${ys(p.c)}`).join(' ');

  const pct = ((data.last - data.first) / data.first) * 100;
  const col = pct > 0.15 ? '#34d399' : pct < -0.15 ? '#fb7185' : '#fbbf24';

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="price sparkline">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.28" />
            <stop offset="100%" stopColor={col} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} fill="url(#sparkFill)" />
        <path
          d={path}
          stroke={col}
          strokeWidth={2}
          fill="none"
        />
        <filter id="g">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={col} floodOpacity="0.8" />
        </filter>
        <circle
          cx={xs(data.points.length - 1, data.points.length)}
          cy={ys(data.last)}
          r={2.6}
          fill={col}
          filter="url(#g)"
        />
      </svg>
      <div className="text-[11px]">
        <div className="font-semibold" style={{ color: col }}>
          {pct >= 0 ? '▲' : '▼'} {pct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Karty (hero + karta listy) – ZMNIEJSZONE
   ───────────────────────────────────────────────────────────── */
function Hero({
  item,
  lang,
  showMini,
  spark,
}: {
  item: Item;
  lang: Lang;
  showMini: boolean;
  spark?: Spark;
}) {
  const cat = catOf(item);
  const s = sentimentOf(`${item.title}. ${item.summary}`, lang);

  return (
    <article className="grid gap-4 md:grid-cols-2 rounded-2xl bg-[#0b1220] border border-white/10 overflow-hidden">
      <div className="relative h-60 md:h-full">{/* ulepszony wykres */}
        {/* jeśli nie ma danych do świec – fallback do ilustracji */}
        <div className="absolute inset-0">
          <LeadChart spark={spark} symbol={item.instruments?.[0]} />
        </div>
        {!spark && (
          <div className="absolute inset-0">
            <Illustration cat={cat} sentiment={s} seed={item.title} tall />
          </div>
        )}
        <div className="absolute left-3 top-3 text-[9px] tracking-widest font-semibold px-2 py-1 rounded bg-black/20 text-white backdrop-blur border border-white/30">
          FX•EDU
        </div>
      </div>
      <div className="p-4 md:p-5">{/* ← mniejsze paddingi */}
        <div className="flex items-start gap-3">
          <div className="text-[11px] text-white/60 flex items-center gap-2">
            {item.source && (
              <span className="uppercase">{item.source}</span>
            )}
            <span>•</span>
            <time dateTime={item.timestamp_iso}>{fmtDate(item.timestamp_iso, lang)}</time>
          </div>
        </div>
        <div className="mt-1 text-left text-xl md:text-2xl font-extrabold leading-snug">{item.title}</div>

        <p className="mt-2 text-white/80 text-[15px]">{item.summary}</p>
        {!!item.detail && <p className="mt-2 text-white/70 text-[14px]">{item.detail}</p>}

        {!!item.instruments?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.instruments.slice(0, 6).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                {t}
              </span>
            ))}
          </div>
        )}

        {showMini && (
          <div className="mt-3">
            <PriceSparkline data={spark} />
          </div>
        )}

        <div className="mt-3">
          <SentimentGauge value={s} />
        </div>
      </div>
    </article>
  );
}

function NewsCard({
  item,
  lang,
  showMini,
  spark,
}: {
  item: Item;
  lang: Lang;
  showMini: boolean;
  spark?: Spark;
}) {
  const cat = catOf(item);
  const s = sentimentOf(`${item.title}. ${item.summary}`, lang);

  return (
    <article className="rounded-xl bg-[#0b1220] border border-white/10 overflow-hidden hover:bg-white/5 transition">
      <div className="relative h-28">{/* kompaktowa ilustracja */}
        <Illustration cat={cat} sentiment={s} seed={item.title} />
        <div className="absolute left-2 top-2 text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-white backdrop-blur border border-white/30">
          FX•EDU
        </div>
      </div>
      <div className="p-4">{/* mniejsze odstępy */}
        <div className="flex items-start gap-3">
          <div className="text-[10px] text-white/60 flex items-center gap-2">
            {item.source && (
              <span className="uppercase">{item.source}</span>
            )}
            <span>•</span>
            <time dateTime={item.timestamp_iso}>
              {new Date(item.timestamp_iso).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        </div>
        <div className="mt-1 text-left text-[16px] md:text-[18px] font-semibold leading-snug">{item.title}</div>

        <p className="mt-1 text-[14px] leading-relaxed text-white/80">{item.summary}</p>
        {!!item.detail && <p className="mt-1 text-[13px] text-white/60">{item.detail}</p>}

        {!!item.instruments?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.instruments.slice(0, 10).map((t, j) => (
              <span
                key={j}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {item.link && (
          <div className="mt-3">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] underline underline-offset-4 text-white/80 hover:text-white"
            >
              {lang === 'pl' ? 'Czytaj źródło' : 'Read source'}
            </a>
          </div>
        )}

        {showMini && (
          <div className="mt-2">
            <PriceSparkline data={spark} small />
          </div>
        )}

        <div className="mt-2">
          <SentimentGauge value={s} />
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton
   ───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#0b1220] border border-white/10 overflow-hidden animate-pulse">
      <div className="h-28 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-28 bg-white/10 rounded" />
        <div className="h-3 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Buckety 24/48/72h – sekcja na dole
   ───────────────────────────────────────────────────────────── */
function Buckets({ items, lang }: { items: Item[]; lang: Lang }) {
  const now = Date.now();
  const b24 = items.filter(i => now - new Date(i.timestamp_iso).getTime() <= 24 * 3600 * 1000);
  const b48 = items.filter(i => {
    const dt = now - new Date(i.timestamp_iso).getTime();
    return dt > 24 * 3600 * 1000 && dt <= 48 * 3600 * 1000;
  });
  const b72 = items.filter(i => {
    const dt = now - new Date(i.timestamp_iso).getTime();
    return dt > 48 * 3600 * 1000 && dt <= 72 * 3600 * 1000;
  });

  const Section = ({ title, data }: { title: string; data: Item[] }) => (
    <section className="mt-8">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {data.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">Brak wpisów.</div>
      ) : (
        <ul className="grid gap-3">
          {data.slice(0, 8).map((it, i) => (
            <li key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-start gap-3">
                <div className="text-[11px] text-white/60 flex items-center gap-2">
                  {it.source && <span className="uppercase">{it.source}</span>}
                  <span>•</span>
                  <time dateTime={it.timestamp_iso}>{fmtDate(it.timestamp_iso, lang)}</time>
                </div>
              </div>
              <div className="mt-1 text-left font-semibold">{it.title}</div>
              <p className="text-sm text-white/80 mt-1">{it.summary}</p>
              {!!it.detail && <p className="mt-1 text-sm text-white/70">{it.detail}</p>}
              {!!it.instruments?.length && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {it.instruments.slice(0, 8).map((t, j) => (
                    <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <>
      <Section title="Ostatnie 24h" data={b24} />
      <Section title="24–48h" data={b48} />
      <Section title="48–72h" data={b72} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SEKCJA AI – Szybkie info (AI)
   ───────────────────────────────────────────────────────────── */
type Brief = {
  id?: string;
  ts_iso: string;
  title: string;
  content: string; // plain text lub markdown
};

const AI_LS_KEY = 'fxedu_quickai_latest_v2';
const SIX_HOURS = 6 * 60 * 60 * 1000;

/* ─────────────────────────────────────────────────────────────
   SEKCJA AI – Szybkie info (AI) — WERSJA UŹRÓDŁOWIONA
   ───────────────────────────────────────────────────────────── */
// Używamy istniejących definicji Brief/AI_LS_KEY/SIX_HOURS z poprzedniej sekcji

function useAIBrief(lang: Lang) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefDaily, setBriefDaily] = useState<Brief | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // wczytaj z LS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(AI_LS_KEY);
      if (raw) setBrief(JSON.parse(raw) as Brief);
    } catch {}
  }, []);

  const save = (b: Brief) => {
    setBrief(b);
    try {
      localStorage.setItem(AI_LS_KEY, JSON.stringify(b));
    } catch {}
  };

  // pobierz najnowszy z listy
  const fetchLatest = async () => {
    setErr(null);
    try {
      const res = await fetch('/api/brief/list?type=GEN&limit=1');
      if (!res.ok) return;
      const json = await res.json();
      const it = json?.items?.[0];
      if (it) {
        const b: Brief = {
          id: it.id ?? undefined,
          ts_iso: it.ts_iso ?? it.timestamp_iso ?? new Date().toISOString(),
          title: it.title ?? 'Szybki briefing — GEN',
          content:
            it.content ??
            it.text ??
            (Array.isArray(it.bullets) ? it.bullets.join('\n') : String(it.body ?? '')),
        };
        save(b);
      }
    } catch {}
  };

  // pobierz dzisiejszy DAILY
  const fetchDaily = async () => {
    try {
      const res = await fetch('/api/brief/list?type=DAILY&limit=1&fallback=true', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      const it = json?.items?.[0];
      if (it) {
        const b: Brief = {
          id: it.id ?? undefined,
          ts_iso: it.ts_iso ?? it.timestamp_iso ?? new Date().toISOString(),
          title: it.title ?? 'Info dnia (AI)',
          content: it.content ?? it.text ?? (Array.isArray(it.bullets) ? it.bullets.join('\n') : String(it.body ?? '')),
        };
        setBriefDaily(b);
        try { localStorage.setItem(AI_LS_KEY + ':daily', JSON.stringify(b)); } catch {}
      }
    } catch {}
  };

  // DOŹYWIENIE: pobierz bazę faktów z 24h (konkretne źródła)
  const getSeedItems = async () => {
    try {
      const res = await fetch('/api/news/summarize?bucket=24h&lang=pl', { method: 'GET', cache: 'force-cache' });
      if (!res.ok) return [];
      const json = await res.json();
      const arr: any[] = Array.isArray(json?.items) ? json.items : [];
      // bierzemy do 20; czyścimy do najważniejszych pól
      return arr
        .slice(0, 20)
        .map((i) => ({
          title: i.title,
          summary: i.summary,
          timestamp_iso: i.timestamp_iso,
          source: i.source,
          link: i.link,
          instruments: i.instruments,
        }))
        .filter((i) => i.title && i.timestamp_iso);
    } catch {
      return [];
    }
  };

  // auto-refresh co 6h (bez blokowania UI)
  useEffect(() => {
    void fetchLatest();
    const t = setInterval(fetchLatest, SIX_HOURS);
    return () => clearInterval(t);
  }, [lang]);

  // wczytaj cache DAILY + natychmiastowy fetch jeśli brak
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(AI_LS_KEY + ':daily');
      if (raw) {
        setBriefDaily(JSON.parse(raw) as Brief);
      } else {
        void fetchDaily();
      }
    } catch {}
    const t = setInterval(fetchDaily, SIX_HOURS);
    return () => clearInterval(t);
  }, [lang]);

  const generateNow = async () => {
    setBusy(true);
    setErr(null);
    try {
      // 1) pobierz świeże fakty (24h)
      const seed = await getSeedItems();
      const nowUtc = new Date().toISOString();

      // 2) jeśli nie ma źródeł — nie wymyślamy; napiszemy krótką notkę
      const hardIntro =
        'Piszesz WYŁĄCZNIE po polsku. Styl edukacyjny, zwięzły, bez rekomendacji inwestycyjnych. Musisz oprzeć się WYŁĄCZNIE na źródłach z ostatnich 24h (podanych w JSON). Nie wymyślaj faktów.';

      const grounding =
        seed.length > 0
          ? `Masz poniżej listę POZYCJI ŹRÓDŁOWYCH z ostatnich 24h (JSON). Opracuj artykuł WYŁĄCZNIE na podstawie tych pozycji — nie dopisuj faktów spoza listy.\n` +
            `W każdym akapicie odnoś się do wydarzeń z datą i godziną (z "timestamp_iso"), np. "(10:35 UTC, 11.10)".\n` +
            `Jeśli czegoś nie wiadomo na podstawie źródeł, napisz wprost "brak danych w źródłach".\n\n` +
            `ŹRÓDŁA (JSON):\n${JSON.stringify(seed, null, 2)}\n`
          : `Nie udało się pobrać pozycji źródłowych z ostatnich 24h. Napisz krótki komunikat: ` +
            `"Brak wystarczających zweryfikowanych informacji z ostatnich 24h w bazie serwisu."`;

      const task =
        `Jest teraz ${nowUtc} (czas UTC). Twoje zadanie: ` +
        `Wypisz w postaci artykułu najważniejsze informacje wpływające na giełdę w USA z ostatnich 24h. ` +
        `Mogą to być m.in. decyzje o stopach procentowych, dane inflacyjne, ewentualny shutdown administracji publicznej w USA ` +
        `oraz inne istotne wydarzenia makro i rynkowe. ` +
        `Struktura:\n` +
        `- Tytuł: "Szybki briefing — GEN (DD.MM.RRRR, GG:MM)"\n` +
        `- Część 1: 3–6 krótkich akapitów (2–3 zdania każdy) – wyłącznie fakty z ostatnich 24h wraz z możliwym mechanizmem wpływu (bez prognoz).\n` +
        `- Część 2: OPINIA AI (2–3 zdania): najpierw krótkoterminowa (1–7 dni) ocena nastroju/ryzyka, potem długoterminowe (1–6 mies.) czynniki do obserwacji. Bez rekomendacji i bez konkretów inwestycyjnych.\n` +
        `- Na końcu 1 zdanie: "Uwaga: Materiał edukacyjny – to nie jest rekomendacja inwestycyjna."`;

      const promptPL = `${hardIntro}\n\n${grounding}\n${task}`;

      // 3) generuj
      const res = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'pl',
          range: '24h',
          prompt: promptPL,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // 4) po wygenerowaniu dociągnij najnowszy zapis (spójny flow z backendem)
      await fetchLatest();
    } catch (e: any) {
      setErr(e?.message || 'Błąd generowania.');
    } finally {
      setBusy(false);
    }
  };

  const tooOld =
    brief?.ts_iso ? Date.now() - new Date(brief.ts_iso).getTime() > SIX_HOURS : true;

  return { brief, briefDaily, busy, err, generateNow, tooOld };
}


/* ─────────────────────────────────────────────────────────────
   Strona
   ───────────────────────────────────────────────────────────── */
export default function NewsPage() {
  // LS – bezpiecznie po montażu
  const [lang, setLang] = useState<Lang>('pl');
  const [hours, setHours] = useState<24 | 48 | 72>(72);

  // mini-wykresy
  const [showMini, setShowMini] = useState(true);
  const SPARK_RANGE = '7d';
  const SPARK_INTERVAL = '1h';
  const [sparks, setSparks] = useState<Record<string, Spark>>({});

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  // filtry
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<Cat | 'ALL'>('ALL');
  const [tickers, setTickers] = useState<string[]>([]);
  const [chosenTicker, setChosenTicker] = useState<string | null>(null);

  // AI brief hook
  const ai = useAIBrief(lang);

  // wczytanie preferencji z LS po montażu
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const l = (localStorage.getItem('news_lang') as Lang) || 'pl';
    const h = (Number(localStorage.getItem('news_hours')) as 24 | 48 | 72) || 72;
    setLang(l);
    setHours(h);
  }, []);

  // zapisy do LS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('news_lang', lang);
  }, [lang]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('news_hours', String(hours));
  }, [hours]);

  async function load(force = false) {
    setBusy(true);
    setError(null);
    try {
      const cached = readCache(lang, hours);
      if (cached) {
        setItems(cached.items);
        setUpdatedAt(cached.ts);
      }

      const bucket = hours === 72 ? '72h' : hours === 48 ? '48h' : '24h';
      const url = `/api/news/summarize?bucket=${encodeURIComponent(bucket)}&lang=${encodeURIComponent(lang)}${force ? '&force=1' : ''}`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr: Item[] = Array.isArray(json?.items) ? json.items : [];
      const clean = arr.filter(i => i.title && i.timestamp_iso);
      setItems(clean);
      setUpdatedAt(Date.now());
      writeCache(lang, hours, clean);
    } catch (e: any) {
      if (!items) setError(e?.message || 'Błąd pobierania danych.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        void load(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, hours]);

  // ranking: świeżość + liczba instrumentów -> lead
  const ranked = useMemo(() => {
    if (!items) return [];
    return items
      .slice()
      .sort((a, b) => {
        const da = new Date(a.timestamp_iso).getTime();
        const db = new Date(b.timestamp_iso).getTime();
        const sa = a.instruments?.length || 0;
        const sb = b.instruments?.length || 0;
        return db + sb * 1e5 - (da + sa * 1e5);
      });
  }, [items]);

  // top tickery (chips)
  useEffect(() => {
    if (!items) return;
    const freq = new Map<string, number>();
    items.forEach(i => (i.instruments || []).forEach(t => freq.set(t, (freq.get(t) || 0) + 1)));
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
    setTickers(top);
  }, [items]);

  // filtry
  const filtered = useMemo(() => {
    let arr = ranked;
    if (catFilter !== 'ALL') arr = arr.filter(i => catOf(i) === catFilter);
    if (chosenTicker) arr = arr.filter(i => (i.instruments || []).includes(chosenTicker));
    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter(i => `${i.title} ${i.summary}`.toLowerCase().includes(qq));
    }
    return arr;
  }, [ranked, catFilter, chosenTicker, q]);

  const lead = filtered[0];
  const rest = filtered.slice(1);

  // mini-wykresy: loader
  async function loadSparks(forSymbols: string[]) {
    const symbols = [...new Set(forSymbols.map(s => s.toUpperCase()))].slice(0, 12);
    if (!symbols.length) return;

    const fromCache = readSparkCache(symbols, SPARK_RANGE, SPARK_INTERVAL);
    if (Object.keys(fromCache).length) {
      setSparks(prev => ({ ...fromCache, ...prev }));
    }

    const missing = symbols.filter(s => !fromCache[s]);
    if (!missing.length) return;

    try {
      const url = `/api/quotes/sparkline?symbols=${encodeURIComponent(missing.join(','))}&range=${encodeURIComponent(SPARK_RANGE)}&interval=${encodeURIComponent(SPARK_INTERVAL)}`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      const json = await res.json();
      const map: Record<string, Spark> = {};
      (json?.data || []).forEach((it: Spark) => {
        map[it.symbol.toUpperCase()] = it;
      });
      if (Object.keys(map).length) {
        setSparks(prev => ({ ...prev, ...map }));
        writeSparkCache(map, SPARK_RANGE, SPARK_INTERVAL);
      }
    } catch {
      // cichy fail
    }
  }

  // odśwież mini-wykresy, kiedy mamy nowe dane/filtry
  useEffect(() => {
    if (!showMini || !filtered.length) return;
    const want = filtered
      .slice(0, 16)
      .map(it => (it.instruments?.[0] || '').toUpperCase())
      .filter(Boolean);
    want.push(...tickers.slice(0, 4));
    void loadSparks(want);
  }, [showMini, filtered, tickers]);

  // paginacja "pokaż więcej"
  const [limit, setLimit] = useState(6);
  useEffect(() => setLimit(6), [filtered]);

  // helper do pobrania sparka dla itemu
  const getSpark = (it: Item) => sparks[(it.instruments?.[0] || '').toUpperCase()];

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8">
      {/* Top bar */}
      <nav className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Strona główna
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* zakres 24/48/72 */}
          <div className="rounded-xl bg-white/10 border border-white/10 p-1 text-sm">
            {[24, 48, 72].map(h => (
              <button
                key={h}
                onClick={() => setHours(h as 24 | 48 | 72)}
                className={`px-3 py-1 rounded-lg ${hours === h ? 'bg-white text-slate-900' : 'hover:bg-white/10'}`}
              >
                {h}h
              </button>
            ))}
          </div>

          {/* język */}
          <select
            value={lang}
            onChange={e => setLang(e.currentTarget.value as Lang)}
            className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
          >
            <option value="pl">Polish</option>
            <option value="en">English</option>
          </select>

          {/* updated info */}
          <div className="text-xs text-white/60 px-2">
            {updatedAt ? (lang === 'pl' ? 'Zaktualizowano' : 'Updated') + ` ${relTime(updatedAt, lang)}` : null}
          </div>

          <button
            onClick={() => void load(true)}
            disabled={busy}
            className="rounded-xl px-4 py-2 bg-white text-slate-900 text-sm font-semibold disabled:opacity-40"
          >
            {busy ? 'Odświeżanie…' : 'Odśwież teraz'}
          </button>
        </div>
      </nav>

      <header className="mb-3">
        <h1 className="text-3xl md:text-4xl font-extrabold">Przegląd rynkowy</h1>
        <p className="mt-1 text-slate-300">
          Zwięzłe podsumowania wraz z możliwymi reakcjami rynku (AI). Informacje mają charakter edukacyjny i nie stanowią doradztwa inwestycyjnego.
        </p>
      </header>

      {/* Pasek cen aktywów (jak na Home) */}
      {(() => {
        const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });
        return (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
            <TickerFinnhubNoSSR className="rounded-2xl" speedSec={42} symbols={[
              'OANDA:NAS100_USD',
              'OANDA:XAU_USD',
              'OANDA:WTICO_USD',
              'OANDA:BCO_USD',
              'OANDA:EUR_USD',
              'OANDA:USD_JPY',
            ]} />
          </section>
        );
      })()}

      {/* Toolbar filtrów */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={lang === 'pl' ? 'Szukaj: np. EURUSD, CPI…' : 'Search: e.g. EURUSD, CPI…'}
          className="flex-1 min-w-[220px] rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
        />
        <div className="rounded-xl bg-white/10 border border-white/10 p-1 text-sm">
          {(['ALL', 'FX', 'Indeksy', 'Surowce', 'Makro'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c as any)}
              className={`px-3 py-1 rounded-lg ${catFilter === c ? 'bg-white text-slate-900' : 'hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>
        {!!tickers.length && (
          <div className="flex flex-wrap items-center gap-1.5">
            {tickers.map(t => (
              <button
                key={t}
                onClick={() => setChosenTicker(prev => (prev === t ? null : t))}
                className={`text-[11px] px-2 py-1 rounded-full border ${
                  chosenTicker === t ? 'bg-white text-slate-900 border-white' : 'bg-white/10 border-white/10 hover:bg-white/20'
                }`}
              >
                {t}
              </button>
            ))}
            {chosenTicker && (
              <button
                onClick={() => setChosenTicker(null)}
                className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 hover:bg-white/20"
              >
                {lang === 'pl' ? 'Wyczyść' : 'Clear'}
              </button>
            )}
          </div>
        )}

        {/* przełącznik mini-wykresów */}
        <label className="ml-auto inline-flex items-center gap-2 text-xs select-none">
          <input
            type="checkbox"
            className="accent-white"
            checked={showMini}
            onChange={e => setShowMini(e.currentTarget.checked)}
          />
          {lang === 'pl' ? 'Mini wykresy' : 'Mini charts'}
        </label>
      </div>

      {/* Błędy / Ładowanie */}
      {error && (
        <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-400/20 p-4 text-rose-200 text-sm">
          {lang === 'pl'
            ? 'Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci, jeśli jest.'
            : 'Could not fetch fresh data. Showing last cached if available.'}
          <div className="mt-1 text-white/70">{error}</div>
        </div>
      )}
      {!items && (
        <section className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </section>
      )}

      {/* Treść */}
      {!!items && items.length === 0 && (
        <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-white/70">
          {lang === 'pl' ? 'Brak wpisów.' : 'No entries.'}
        </div>
      )}

      {!!items && items.length > 0 && (
        <>
          {/* Info dnia (AI) — kompaktowa karta nad Hero */}
          {ai.briefDaily && (
            <div className="mt-4">
              <InfoDniaCard brief={ai.briefDaily} />
            </div>
          )}

          {/* Lead z najświeższej wiadomości (zostaje) */}
          {lead && (
            <div className="mt-4">
              <Hero
                item={lead}
                lang={lang}
                showMini={showMini}
                spark={getSpark(lead)}
              />
            </div>
          )}

          {/* Siatka kart – 2 kolumny, nieco mniejsze kafelki */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {rest.slice(0, limit).map((it, i) => {
              return (
                <NewsCard
                  key={`rest-${it.timestamp_iso}-${i}`}
                  item={it}
                  lang={lang}
                  showMini={showMini}
                  spark={getSpark(it)}
                />
              );
            })}
          </section>

          {rest.length > limit && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setLimit(l => l + 6)}
                className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20"
              >
                {lang === 'pl' ? 'Pokaż więcej' : 'Show more'}
              </button>
            </div>
          )}

          {/* ───────────── Szybkie info (AI) ───────────── */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Szybkie info (AI)</h2>
              <button
                onClick={() => void ai.generateNow()}
                disabled={ai.busy}
                className="rounded-xl px-4 py-2 bg-white text-slate-900 text-sm font-semibold disabled:opacity-40"
              >
                {ai.busy ? 'Generowanie…' : ai.tooOld ? 'Wygeneruj teraz' : 'Odśwież'}
              </button>
            </div>

            {ai.err && (
              <div className="mb-3 rounded-xl bg-rose-500/10 border border-rose-400/20 p-3 text-rose-200 text-sm">
                {ai.err}
              </div>
            )}

            {!ai.brief && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white/70 text-sm">
                Brak świeżej notki. Kliknij „Wygeneruj teraz”, aby stworzyć automatyczne podsumowanie najważniejszych
                faktów z ostatnich 24h.
              </div>
            )}

            {ai.brief && (
              <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">PL</span>
                  <time dateTime={ai.brief.ts_iso}>{fmtDate(ai.brief.ts_iso, 'pl')}</time>
                </div>
                <h3 className="text-lg md:text-xl font-bold">{ai.brief.title || 'Szybki briefing — GEN'}</h3>
                <div className="mt-3 space-y-2">
                  {(() => {
                    const lines = ai.brief.content
                      .split(/\r?\n/)
                      .map(l => l.trim())
                      .filter(Boolean);
                    const blocks: React.ReactNode[] = [];
                    let bullets: string[] = [];
                    const flushBullets = () => {
                      if (!bullets.length) return;
                      blocks.push(
                        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 text-white/85">
                          {bullets.map((b, i) => (
                            <li key={i}>{b.replace(/^[-•]\s*/, '')}</li>
                          ))}
                        </ul>
                      );
                      bullets = [];
                    };
                    lines.forEach((ln, idx) => {
                      if (/^[-•]/.test(ln)) {
                        bullets.push(ln);
                        return;
                      }
                      flushBullets();
                      if (/^opinia/i.test(ln)) {
                        blocks.push(
                          <div key={`op-${idx}`} className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-xs text-white/60 mb-1">Opinia AI</div>
                            <p className="text-[15px] leading-relaxed text-white/90">{ln.replace(/^opinia[^:]*:\s*/i, '')}</p>
                          </div>
                        );
                      } else if (idx === 0) {
                        blocks.push(
                          <p key={`lead-${idx}`} className="text-[16px] md:text-[17px] leading-relaxed text-white/90 font-medium">
                            {ln}
                          </p>
                        );
                      } else {
                        blocks.push(
                          <p key={`p-${idx}`} className="text-[15px] leading-relaxed text-white/80">
                            {ln}
                          </p>
                        );
                      }
                    });
                    flushBullets();
                    return blocks;
                  })()}
                </div>
                <div className="mt-3 text-[11px] text-white/50">
                  Materiał edukacyjny — nie jest to doradztwo inwestycyjne.
                </div>
              </article>
            )}
          </section>

          {/* Buckety czasowe */}
          <NewsBuckets items={items} />
        </>
      )}

      {/* Stopka z dysklajmerem */}
      <footer className="mt-10 text-[11px] text-white/50">
        {lang === 'pl'
          ? 'Wyłącznie materiały edukacyjne. Streszczenia generowane automatycznie; zawsze sprawdź oryginalne źródło.'
          : 'Educational use only. Summaries are auto-generated; always verify the original source.'}
      </footer>
    </main>
  );
}
