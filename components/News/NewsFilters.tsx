'use client';
import React, { useState } from 'react';
import type { NewsCategory, Sentiment } from '@/lib/news/types';

export type Filters = {
  q: string;
  categories: NewsCategory[];
  minImpact: number;
  sentiment: Sentiment | 'any';
  watchlistOnly: boolean;
};

type Props = {
  value: Filters;
  onChange: (f: Filters) => void;
  onToggleWatchlistOnly?: () => void;
};

const CATS: NewsCategory[] = ['FX', 'Indeksy', 'Surowce', 'Makro', 'Spółki', 'Geo', 'Inne'];

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white/20" />
        </div>
      )}
    </div>
  );
}

export default function NewsFilters({ value, onChange }: Props) {
  const toggleCat = (c: NewsCategory) => {
    const has = value.categories.includes(c);
    onChange({ ...value, categories: has ? value.categories.filter(x => x !== c) : [...value.categories, c] });
  };

  const hasActiveFilters = value.q || value.categories.length > 0 || value.minImpact > 1 || value.sentiment !== 'any' || value.watchlistOnly;

  return (
    <aside className="sticky top-4 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Filtry</h3>
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ q: '', categories: [], minImpact: 1, sentiment: 'any', watchlistOnly: false })}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Wyczyść
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-5">
          <label className="block text-xs text-white/70 mb-2 font-medium">Szukaj wiadomości</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={value.q}
              onChange={e => onChange({ ...value, q: e.target.value })}
              placeholder="Szukaj po tytule, treści..."
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 pl-10 py-2.5 text-sm outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-white/70 font-medium">Kategorie</label>
            <Tooltip content="Wybierz kategorie wiadomości, które Cię interesują. Możesz wybrać wiele kategorii jednocześnie.">
              <svg className="w-3.5 h-3.5 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  value.categories.includes(c)
                    ? 'bg-emerald-400 text-slate-900 border-emerald-400'
                    : 'text-white/70 border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70 font-medium">Minimalny Impact</label>
              <Tooltip content="Impact (1-5) to potencjalna skala wpływu na rynek. Wyższa wartość = większy wpływ. Filtruj tylko wiadomości o wysokim wpływie.">
                <svg className="w-3.5 h-3.5 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Tooltip>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">{value.minImpact}/5</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.minImpact}
            onChange={(e) => onChange({ ...value, minImpact: Number(e.target.value) })}
            className="w-full accent-emerald-400"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/40">Niski</span>
            <span className="text-[10px] text-white/40">Wysoki</span>
          </div>
        </div>

        {/* Sentiment */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-white/70 font-medium">Sentiment</label>
            <Tooltip content="Kierunek pierwszej reakcji rynku. Pozytywny = może wpłynąć pozytywnie, Negatywny = może wpłynąć negatywnie, Neutralny = neutralny wpływ.">
              <svg className="w-3.5 h-3.5 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'any', label: 'Wszystkie', color: 'border-white/20' },
              { key: 'positive', label: 'Pozytywny', color: 'border-emerald-400/30 text-emerald-300' },
              { key: 'neutral', label: 'Neutralny', color: 'border-amber-400/30 text-amber-300' },
              { key: 'negative', label: 'Negatywny', color: 'border-rose-400/30 text-rose-300' },
            ] as Array<{ key: Filters['sentiment']; label: string; color: string }>).map(s => (
              <button
                key={s.key}
                onClick={() => onChange({ ...value, sentiment: s.key })}
                className={`rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                  value.sentiment === s.key
                    ? `${s.color} bg-white/10`
                    : 'text-white/60 border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div className="pt-4 border-t border-white/5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={value.watchlistOnly}
              onChange={e => onChange({ ...value, watchlistOnly: e.target.checked })}
              className="w-4 h-4 accent-emerald-400 cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm text-white/90 font-medium">Tylko z watchlisty</div>
              <div className="text-xs text-white/50 mt-0.5">Pokaż tylko wiadomości dotyczące instrumentów z Twojej watchlisty</div>
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}


