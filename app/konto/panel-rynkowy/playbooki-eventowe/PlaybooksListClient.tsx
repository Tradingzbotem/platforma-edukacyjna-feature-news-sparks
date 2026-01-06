// app/konto/panel-rynkowy/playbooki-eventowe/PlaybooksListClient.tsx
'use client';

import { useMemo, useState } from 'react';
import PlaybookCard from './PlaybookCard';
import type { Playbook, PlaybookFilter, Region, Importance } from '@/lib/panel/playbooks';

type Props = {
  items: Playbook[];
};

const ALL_REGIONS: Region[] = ['US', 'EU', 'UK'];
const ALL_TYPES: NonNullable<PlaybookFilter['types']> = ['inflacja', 'praca', 'stopy', 'wzrost', 'sentyment'];
const ALL_IMPORTANCE: Importance[] = ['high', 'medium', 'low'];

export default function PlaybooksListClient({ items }: Props) {
  const [search, setSearch] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [types, setTypes] = useState<NonNullable<PlaybookFilter['types']>>([]);
  const [importance, setImportance] = useState<Importance[]>([]);
  const [sort, setSort] = useState<NonNullable<PlaybookFilter['sort']>>('top');

  const filtered = useMemo(() => {
    let list = items.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        return inTitle || inTags;
      });
    }
    if (regions.length) {
      list = list.filter((p) => regions.includes(p.region));
    }
    if (types.length) {
      list = list.filter((p) => types.some((t) => p.tags.includes(t)));
    }
    if (importance.length) {
      list = list.filter((p) => importance.includes(p.importance));
    }
    if (sort === 'updated') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sort === 'alpha') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'pl'));
    } else {
      // 'top' — keep by importance and curated order: high > medium > low
      const weight: Record<Importance, number> = { high: 0, medium: 1, low: 2 };
      list.sort((a, b) => weight[a.importance] - weight[b.importance]);
    }
    return list;
  }, [items, search, regions, types, importance, sort]);

  function toggle<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  return (
    <div className="mt-6">
      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative grow">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj po tytule lub tagach…"
              className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Szukaj playbooków"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/70">Sortuj:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Sortowanie"
            >
              <option value="top">Najważniejsze</option>
              <option value="updated">Ostatnio aktualizowane</option>
              <option value="alpha">Alfabetycznie</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Region */}
          <div>
            <div className="text-xs font-semibold text-white/70">Region</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegions((prev) => toggle(prev, r))}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    regions.includes(r)
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                  }`}
                  aria-pressed={regions.includes(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Typ */}
          <div>
            <div className="text-xs font-semibold text-white/70">Typ</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypes((prev) => toggle(prev, t))}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    types.includes(t)
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                  }`}
                  aria-pressed={types.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Ważność */}
          <div>
            <div className="text-xs font-semibold text-white/70">Ważność</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_IMPORTANCE.map((i) => (
                <button
                  key={i}
                  onClick={() => setImportance((prev) => toggle(prev, i))}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    importance.includes(i)
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                  }`}
                  aria-pressed={importance.includes(i)}
                >
                  {i === 'high' ? 'wysoka' : i === 'medium' ? 'średnia' : 'niska'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((pb) => (
          <PlaybookCard key={pb.slug} item={pb} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Brak wyników dla wybranych filtrów.
          </div>
        )}
      </div>
    </div>
  );
}


