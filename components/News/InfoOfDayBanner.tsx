'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';

type BannerData = {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source?: string;
  url?: string;
};

function pickInfoOfDay(items: NewsItemEnriched[]): BannerData | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const todays = items.filter(i => (i.publishedAt || '').startsWith(today));
  // fallback: jeśli brak wpisów "dziś", wybierz z całego zakresu (24h)
  const pool = todays.length ? todays : items;
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => {
    const ia = Number(a.impact || 0);
    const ib = Number(b.impact || 0);
    if (ib !== ia) return ib - ia; // higher impact first
    const ta = Number(a.timeEdge || 0);
    const tb = Number(b.timeEdge || 0);
    if (tb !== ta) return tb - ta; // recency edge
    const pa = new Date(a.publishedAt || 0).getTime();
    const pb = new Date(b.publishedAt || 0).getTime();
    return pb - pa; // newer first
  });
  const top = sorted[0];
  const text = (top.summaryShort && top.summaryShort.trim()) || top.title || '';
  const sentiment = (top.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative';
  if (!text) return null;
  return { text, sentiment, source: top.source, url: top.url };
}

export default function InfoOfDayBanner() {
  const [items, setItems] = useState<NewsItemEnriched[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<BannerData | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        // Prefer higher-impact headlines from the last 24h; include demo to work in dev
        const res = await fetch('/api/news/list?hours=24&minImpact=2&includeDemo=1', { cache: 'no-store' }).catch(() => null);
        if (!res || !res.ok) throw new Error('HTTP');
        const json = await res.json();
        const arr = Array.isArray(json?.items) ? (json.items as NewsItemEnriched[]) : [];
        if (alive) setItems(arr);
        // If no enriched news available, try articles endpoint (LLM-curated headlines)
        if (alive && (!arr || arr.length === 0)) {
          const ar = await fetch('/api/news/articles?bucket=24h', { cache: 'no-store' }).catch(() => null);
          if (ar && 'ok' in ar && ar.ok) {
            const payload = await ar.json().catch(() => null as any);
            const first = Array.isArray(payload?.items) && payload.items.length ? payload.items[0] : null;
            if (first) {
              setFallback({
                text: String(first.title || first.summary || '').trim(),
                sentiment: 'neutral',
                source: 'FX•EDU',
                url: String(first.link || ''),
              });
            }
          }
        }
      } catch (e) {
        if (alive) setError('fail');
      }
    })();
    return () => { alive = false; };
  }, []);

  const primary = useMemo(() => pickInfoOfDay(items || []), [items]);
  const banner = primary || fallback;

  // Prędkość przewijania i mechanizm wypełniania szerokości — HOOKI MUSZĄ BYĆ ZANIM ZWRÓCIMY JSX
  const speedSec = 42;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = useState<number>(6);

  useEffect(() => {
    const recalc = () => {
      const cont = containerRef.current;
      const unit = measureRef.current;
      if (!cont || !unit) return;
      const contW = cont.clientWidth;
      const unitW = unit.clientWidth || 1;
      const base = Math.max(1, Math.ceil(contW / unitW) + 1);
      const needed = Math.max(4, base * 2);
      setCopies((prev) => (prev !== needed ? needed : prev));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, []);

  // Loading placeholder to make the area visible immediately
  if (!error && !banner && items === null) {
    return (
      <div className="w-full border-b bg-amber-500/5 border-amber-500/20 text-amber-100">
        <div className="mx-auto max-w-6xl px-4 py-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" aria-hidden />
            <span className="uppercase tracking-wide font-semibold">Info dnia</span>
            <span className="opacity-70">•</span>
            <span>Ładowanie najważniejszych informacji…</span>
          </div>
        </div>
      </div>
    );
  }
  if (error || !banner) return null;

  const theme =
    banner.sentiment === 'positive'
      ? { wrap: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-100', dot: 'bg-emerald-400' }
      : banner.sentiment === 'negative'
        ? { wrap: 'bg-rose-500/10 border-rose-500/40 text-rose-100', dot: 'bg-rose-400' }
        : { wrap: 'bg-amber-500/10 border-amber-500/30 text-amber-100', dot: 'bg-amber-400' };

  const Phrase = () => (
    <div className="inline-flex items-center gap-3 pr-8 whitespace-nowrap">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${theme.dot}`} aria-hidden />
      <span className="uppercase tracking-wide font-semibold">Info dnia</span>
      <span className="opacity-70">•</span>
      {banner.url ? (
        <a href={banner.url} target="_blank" rel="noopener noreferrer" className="hover:underline whitespace-nowrap">
          {banner.text}
        </a>
      ) : (
        <span className="whitespace-nowrap">{banner.text}</span>
      )}
      {banner.source && <span className="opacity-60">Źródło: {banner.source}</span>}
    </div>
  );

  return (
    <div className={`w-full border-b ${theme.wrap}`}>
      <div ref={containerRef} className="mx-auto max-w-6xl px-4 py-2 text-sm overflow-hidden relative">
        <div
          className="inline-flex will-change-transform whitespace-nowrap"
          style={{ animation: `tickerScroll ${speedSec}s linear infinite` }}
        >
          {Array.from({ length: copies }).map((_, i) => (
            <Phrase key={i} />
          ))}
        </div>
        {/* Niewidoczna próbka do pomiaru szerokości pojedynczej frazy */}
        <div aria-hidden ref={measureRef} className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
          <Phrase />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900/60 to-transparent" />
      </div>

      <style jsx>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}


