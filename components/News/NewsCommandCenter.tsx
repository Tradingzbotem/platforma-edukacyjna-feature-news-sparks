'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { NewsItemEnriched } from '@/lib/news/types';
import NewsTicker from './NewsTicker';
import NewsFilters, { type Filters } from './NewsFilters';
import NewsFeed from './NewsFeed';
import BriefingPanel from './BriefingPanel';
import ImpactedInstruments from './ImpactedInstruments';
import EducationCards from './EducationCards';

export default function NewsCommandCenter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [range, setRange] = useState<24 | 48 | 72>(72);
  const [live, setLive] = useState(true);
  const [showMiniCharts, setShowMiniCharts] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    q: '',
    categories: [],
    minImpact: 1,
    sentiment: 'any',
    watchlistOnly: false,
  });
  const [items, setItems] = useState<NewsItemEnriched[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [newToday, setNewToday] = useState<number>(0);

  const watchlistParam = ''; // reserved for future: read from user state

  async function load() {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('hours', String(range));
    if (filters.q) params.set('q', filters.q);
    if (filters.categories.length) params.set('categories', filters.categories.join(','));
    if (filters.minImpact) params.set('minImpact', String(filters.minImpact));
    if (filters.sentiment && filters.sentiment !== 'any') params.set('sentiment', filters.sentiment);
    if (filters.watchlistOnly && watchlistParam) params.set('watchlist', watchlistParam);
    if (process.env.NODE_ENV !== 'production') params.set('includeDemo', '1');
    const res = await fetch(`/api/news/list?${params.toString()}`, { cache: 'no-store' }).catch(() => null);
    const json = res && res.ok ? await res.json() : { items: [], updatedAt: null, newToday: 0 };
    setItems(Array.isArray(json.items) ? json.items : []);
    setLastUpdated(json.updatedAt || null);
    setNewToday(Number(json.newToday || 0));
    setIsLoading(false);
  }

  useEffect(() => { load(); }, [range, JSON.stringify(filters)]);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => { load(); }, 120_000);
    return () => clearInterval(id);
  }, [live, range, JSON.stringify(filters)]);

  const minutesAgo = useMemo(() => {
    if (!lastUpdated) return null;
    const diff = Date.now() - new Date(lastUpdated).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }, [lastUpdated]);

  // Handle refresh=now URL parameter - trigger immediate refresh
  const didManualRefresh = useRef(false);
  useEffect(() => {
    const refreshParam = searchParams?.get('refresh');
    if (refreshParam === 'now' && !didManualRefresh.current) {
      didManualRefresh.current = true;
      // Remove refresh parameter from URL
      const params = new URLSearchParams(searchParams?.toString());
      params.delete('refresh');
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
      
      // Trigger refresh immediately
      (async () => {
        try {
          await fetch('/api/jobs/news/refresh', { cache: 'no-store' });
        } catch {}
        // Re-load after backend refresh attempt
        load();
      })();
      // Reset flag after 5 minutes to allow future auto-refresh if needed
      setTimeout(() => { didManualRefresh.current = false; }, 5 * 60 * 1000);
    }
  }, [searchParams, pathname, router]);

  // Auto-trigger backend refresh when data looks stale (no new today or last update very old)
  const didAutoRefresh = useRef(false);
  useEffect(() => {
    const shouldAutoRefresh =
      live &&
      !isLoading &&
      !didAutoRefresh.current &&
      !didManualRefresh.current &&
      ((minutesAgo !== null && minutesAgo > 60) || newToday === 0);

    if (!shouldAutoRefresh) return;

    didAutoRefresh.current = true;
    (async () => {
      try {
        await fetch('/api/jobs/news/refresh', { cache: 'no-store' });
      } catch {}
      // Re-load after backend refresh attempt
      load();
      // allow a future auto refresh after some time if still stale
      setTimeout(() => { didAutoRefresh.current = false; }, 10 * 60 * 1000);
    })();
  }, [live, isLoading, minutesAgo, newToday]);

  return (
    <main id="content" className="relative min-h-screen bg-slate-950 text-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20 animate-fade-in">
        {/* HERO */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1 text-xs text-white/80 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-300/50 animate-pulse-glow" />
            <span className="tracking-wide">INFORMACJE NA CZAS</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Informacje na czas
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-6 max-w-2xl">
            Szybkie fakty, wpływ na instrumenty i możliwe reakcje rynku (AI). Monitoruj najważniejsze wydarzenia rynkowe w czasie rzeczywistym.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Impact pokazuje potencjalny wpływ na rynek (1-5)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>TimeEdge oznacza świeżość informacji (0-10)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Najedź na metryki, aby zobaczyć wyjaśnienia</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 mb-6">
            <div className="rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1 shadow-sm">Ostatnia aktualizacja: {minutesAgo === null ? '—' : `${minutesAgo} min temu`}</div>
            <div className="rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1 shadow-sm">Nowe dziś: {newToday}</div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex rounded-full overflow-hidden border border-white/10 shadow-sm">
                {[24,48,72].map(h => (
                  <button key={h} onClick={() => setRange(h as 24|48|72)} className={`px-3 py-1 text-xs transition-all duration-150 ${range===h ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 bg-transparent hover:bg-white/10'}`}>{h}h</button>
                ))}
              </div>
              <button onClick={() => setLive(v => !v)} className={`rounded-full px-3 py-1 text-xs border transition-all duration-150 shadow-sm hover:shadow-md ${live ? 'border-emerald-400 text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/15' : 'border-white/20 text-white/70 hover:bg-white/10'}`}>
                {live ? 'LIVE' : 'Pauza'}
              </button>
              <label className="ml-2 flex items-center gap-2 text-white/70">
                <input type="checkbox" className="accent-emerald-400" checked={showMiniCharts} onChange={e => setShowMiniCharts(e.target.checked)} />
                Mini wykresy
              </label>
            </div>
          </div>
        </header>

      {/* TICKER */}
      <NewsTicker hours={range} live={live} />

      {/* EDU content */}
      <EducationCards />

        {/* LAYOUT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px,1fr,320px]">
          {/* Left */}
          <NewsFilters value={filters} onChange={setFilters} />

          {/* Center feed */}
          <div>
            {isLoading && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-md p-12 text-center shadow-lg">
                <div className="inline-block w-12 h-12 border-3 border-white/20 border-t-emerald-400 rounded-full animate-spin mb-4 shadow-sm" />
                <div className="text-white/70 font-medium">Ładowanie wiadomości...</div>
                <div className="text-sm text-white/50 mt-2">To może chwilę potrwać</div>
              </div>
            )}
            {!isLoading && <NewsFeed items={items} showMiniCharts={showMiniCharts} />}
          </div>

          {/* Right */}
          <div className="space-y-4">
            <ImpactedInstruments items={items} />
            <BriefingPanel window={range === 24 ? '24h' : range === 48 ? '48h' : '72h'} />
          </div>
        </div>
      </div>
    </main>
  );
}


