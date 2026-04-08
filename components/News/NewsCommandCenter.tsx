'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { NewsItemEnriched } from '@/lib/news/types';
import NewsTicker from './NewsTicker';
import { type Filters } from './NewsFilters';
import ImpactedInstruments from './ImpactedInstruments';
import EducationCards from './EducationCards';
import DecisionTable from '@/app/news/components/DecisionTable';
import NewsTopThreeNow from './NewsTopThreeNow';

export default function NewsCommandCenter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [range, setRange] = useState<24 | 48 | 72>(72);
  const [live, setLive] = useState(true);
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

  const watchlistParam = '';

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

  useEffect(() => {
    load();
  }, [range, JSON.stringify(filters)]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      load();
    }, 120_000);
    return () => clearInterval(id);
  }, [live, range, JSON.stringify(filters)]);

  const minutesAgo = useMemo(() => {
    if (!lastUpdated) return null;
    const diff = Date.now() - new Date(lastUpdated).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }, [lastUpdated]);

  const didManualRefresh = useRef(false);
  useEffect(() => {
    const refreshParam = searchParams?.get('refresh');
    if (refreshParam === 'now' && !didManualRefresh.current) {
      didManualRefresh.current = true;
      const params = new URLSearchParams(searchParams?.toString());
      params.delete('refresh');
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);

      (async () => {
        try {
          await fetch('/api/jobs/news/refresh', { cache: 'no-store' });
        } catch {}
        load();
      })();
      setTimeout(() => {
        didManualRefresh.current = false;
      }, 5 * 60 * 1000);
    }
  }, [searchParams, pathname, router]);

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
      load();
      setTimeout(() => {
        didAutoRefresh.current = false;
      }, 10 * 60 * 1000);
    })();
  }, [live, isLoading, minutesAgo, newToday]);

  return (
    <main id="content" className="relative min-h-screen bg-slate-950 text-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20 animate-fade-in">
        {/* Hero — jeden panel startowy */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_28px_90px_-28px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/10">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent"
            aria-hidden
          />

          <div className="relative px-5 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex justify-center w-full mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/90">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)] animate-pulse-glow" />
                  Na żywo
                </div>
              </div>

              <h1 className="text-[1.85rem] sm:text-4xl md:text-[2.65rem] font-semibold leading-[1.06] tracking-[-0.025em] text-white mb-4 max-w-4xl">
                Rynek w czasie rzeczywistym
              </h1>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl sm:max-w-2xl mx-auto mb-8">
                Najważniejsze wydarzenia, instrumenty pod wpływem i szybki kontekst rynkowy — uporządkowane tak, by szybciej
                ocenić sytuację.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8 max-w-4xl mx-auto w-full">
              <div className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <svg className="w-5 h-5 text-emerald-400/90 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45 mb-0.5">Wpływ (impact)</div>
                  <p className="text-sm text-white/75 leading-snug">Skala siły wydarzenia od 1 do 5.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <svg className="w-5 h-5 text-emerald-400/90 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45 mb-0.5">TimeEdge</div>
                  <p className="text-sm text-white/75 leading-snug">Świeżość przewagi informacyjnej 0–10.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 sm:col-span-2 lg:col-span-1">
                <svg className="w-5 h-5 text-sky-400/90 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45 mb-0.5">Tabela</div>
                  <p className="text-sm text-white/75 leading-snug">Kliknij wiersz, by rozwinąć kontekst i przejść do źródła.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-2 border-t border-white/[0.07]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-black/25 px-3.5 py-1.5 text-xs text-white/70">
                  Ostatnia aktualizacja:{' '}
                  <span className="font-medium text-white/90 tabular-nums">
                    {minutesAgo === null ? '—' : `${minutesAgo} min temu`}
                  </span>
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 px-3.5 py-1.5 text-xs text-white/70">
                  Nowe dziś: <span className="font-medium text-white/90 tabular-nums">{newToday}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wide text-white/40 mr-1 hidden sm:inline">Zakres</span>
                <div className="flex rounded-full overflow-hidden border border-white/15 bg-black/20">
                  {[24, 48, 72].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setRange(h as 24 | 48 | 72)}
                      className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        range === h ? 'bg-white text-slate-900' : 'text-white/75 hover:bg-white/10'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setLive((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
                    live
                      ? 'border-emerald-400/45 text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/20 shadow-[0_0_20px_-4px_rgba(16,185,129,0.35)]'
                      : 'border-white/20 text-white/65 hover:bg-white/10'
                  }`}
                >
                  {live ? 'LIVE' : 'Pauza'}
                </button>
              </div>
            </div>
          </div>

          <NewsTicker hours={range} live={live} embedded />
        </div>

        <NewsTopThreeNow items={items} />

        <DecisionTable items={items} isLoading={isLoading} filters={filters} onFiltersChange={setFilters} />

        <div className="mb-8">
          <ImpactedInstruments items={items} variant="featured" />
        </div>

        <EducationCards />
      </div>
    </main>
  );
}
