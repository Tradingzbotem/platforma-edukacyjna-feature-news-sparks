'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { isTierAtLeast, type Tier } from '@/lib/panel/access';

type ModuleTier = Exclude<Tier, 'free'>;

type ModuleItem = {
  title: string;
  blurb: string;
  tier: ModuleTier;
  slug: string;
  implemented: boolean;
  benefits: string[];
  tags: string[];
};

type Props = {
  modules: ModuleItem[];
  effectiveTier: Tier;
  upgradeHref: string;
};

const SEGMENTS: Array<{ key: 'all' | ModuleTier; label: string }> = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'elite', label: 'Elite' },
];

export default function ModulesGridClient({ modules, effectiveTier, upgradeHref }: Props) {
  const [segment, setSegment] = useState<'all' | ModuleTier>('all');
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((m) => {
      if (segment !== 'all' && m.tier !== segment) return false;
      if (q) {
        const hay = `${m.title} ${m.blurb} ${m.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (onlyAvailable) {
        if (!(isTierAtLeast(effectiveTier, m.tier) && m.implemented)) return false;
      }
      return true;
    });
  }, [modules, segment, query, onlyAvailable, effectiveTier]);

  return (
    <div className="mt-4">
      {/* filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          {SEGMENTS.map((s) => {
            const active = segment === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSegment(s.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj modułu…"
              className="w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-white/80 select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
            />
            Pokaż tylko dostępne
          </label>
        </div>
      </div>

      {/* grid */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const unlocked = isTierAtLeast(effectiveTier, m.tier);
          const tierLabel = m.tier === 'starter' ? 'Starter' : m.tier === 'pro' ? 'Pro' : 'Elite';

          return (
            <div
              key={m.slug}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/70">{tierLabel}</div>
                  <div className="mt-1 text-lg font-semibold">{m.title}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.tags.slice(0, 3).map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-2 text-sm text-white/80">{m.blurb}</p>

              {m.benefits?.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-white/70">Daje Ci:</div>
                  <ul className="mt-1 space-y-1">
                    {m.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {unlocked ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                        m.implemented
                          ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-white/70'
                      }`}
                    >
                      {m.implemented ? 'Dostępne' : 'Wkrótce'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                      {m.tier === 'starter' ? 'Wymaga Starter' : m.tier === 'pro' ? 'Wymaga Pro' : 'Wymaga Elite'}
                    </span>
                  )}
                </div>

                {unlocked ? (
                  m.implemented ? (
                    <Link
                      href={`/konto/panel-rynkowy/${m.slug}`}
                      className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      Wejdź do modułu
                    </Link>
                  ) : (
                    <Link
                      href="/ebooki#plany"
                      className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      Zobacz ofertę
                    </Link>
                  )
                ) : (
                  <Link
                    href={upgradeHref}
                    className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <span className="mr-1.5" aria-hidden>🔒</span> Ulepsz plan
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


