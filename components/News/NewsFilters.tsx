'use client';
import React from 'react';
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

export default function NewsFilters({ value, onChange }: Props) {
  const toggleCat = (c: NewsCategory) => {
    const has = value.categories.includes(c);
    onChange({ ...value, categories: has ? value.categories.filter(x => x !== c) : [...value.categories, c] });
  };
  return (
    <aside className="sticky top-4 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
        <input
          value={value.q}
          onChange={e => onChange({ ...value, q: e.target.value })}
          placeholder="Szukaj…"
          className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm outline-none"
        />
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-white/50">Kategorie</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`rounded-full px-3 py-1 text-xs border ${value.categories.includes(c) ? 'bg-white text-slate-900 border-white' : 'text-white/70 border-white/20 hover:border-white/40'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-white/50">Impact</div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.minImpact}
            onChange={(e) => onChange({ ...value, minImpact: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-white/60 mt-1">Min: {value.minImpact}</div>
        </div>
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-white/50">Sentiment</div>
          <div className="mt-2 flex gap-2">
            {(['any', 'positive', 'neutral', 'negative'] as Array<Filters['sentiment']>).map(s => (
              <button
                key={s}
                onClick={() => onChange({ ...value, sentiment: s })}
                className={`rounded-full px-3 py-1 text-xs border ${value.sentiment === s ? 'bg-white text-slate-900 border-white' : 'text-white/70 border-white/20 hover:border-white/40'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={value.watchlistOnly}
              onChange={e => onChange({ ...value, watchlistOnly: e.target.checked })}
              className="accent-white"
            />
            Tylko z watchlisty
          </label>
        </div>
      </div>
    </aside>
  );
}


