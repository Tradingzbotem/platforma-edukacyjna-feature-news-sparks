'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { NewsItemEnriched } from '@/lib/news/types';
import NewsTicker from './NewsTicker';
import NewsFilters, { type Filters } from './NewsFilters';
import NewsFeed from './NewsFeed';
import BriefingPanel from './BriefingPanel';
import ImpactedInstruments from './ImpactedInstruments';
import EducationCards from './EducationCards';

export default function NewsCommandCenter() {
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

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {/* HERO */}
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">Informacje na czas</h1>
        <p className="mt-1 text-slate-300">Szybkie fakty, wpływ na instrumenty i możliwe reakcje rynku (AI).</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
          <div className="rounded border border-white/10 px-2 py-1">Ostatnia aktualizacja: {minutesAgo === null ? '—' : `${minutesAgo} min temu`}</div>
          <div className="rounded border border-white/10 px-2 py-1">Nowe dziś: {newToday}</div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded overflow-hidden border border-white/10">
              {[24,48,72].map(h => (
                <button key={h} onClick={() => setRange(h as 24|48|72)} className={`px-3 py-1 text-xs ${range===h ? 'bg-white text-slate-900' : 'text-white/80 bg-transparent hover:bg-white/10'}`}>{h}h</button>
              ))}
            </div>
            <button onClick={() => setLive(v => !v)} className={`rounded px-3 py-1 text-xs border ${live ? 'border-emerald-400 text-emerald-300' : 'border-white/20 text-white/70'}`}>
              {live ? 'LIVE' : 'Pauza'}
            </button>
            <label className="ml-2 flex items-center gap-2 text-white/70">
              <input type="checkbox" className="accent-white" checked={showMiniCharts} onChange={e => setShowMiniCharts(e.target.checked)} />
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
          {isLoading && <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-white/70">Ładowanie…</div>}
          {!isLoading && <NewsFeed items={items} showMiniCharts={showMiniCharts} />}
        </div>

        {/* Right */}
        <div className="space-y-4">
          <ImpactedInstruments items={items} />
          <BriefingPanel window={range === 24 ? '24h' : range === 48 ? '48h' : '72h'} />
        </div>
      </div>
    </div>
  );
}


