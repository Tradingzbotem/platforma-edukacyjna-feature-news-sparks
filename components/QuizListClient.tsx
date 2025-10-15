'use client';

import { useEffect, useMemo, useState } from 'react';
import { QuizCard, type QuizCardMeta } from './QuizCard';
import { useRouter, useSearchParams } from 'next/navigation';

type TagKey = 'ALL' | 'START' | 'FX' | 'CFD' | 'PRO' | 'EXTRA' | 'REG';

const TAGS: Array<{ key: TagKey; label: string }> = [
  { key: 'ALL', label: 'Wszystkie' },
  { key: 'START', label: 'Start' },
  { key: 'FX', label: 'FX' },
  { key: 'CFD', label: 'CFD' },
  { key: 'PRO', label: 'Pro' },
  { key: 'EXTRA', label: 'Extra' },
  { key: 'REG', label: 'Regulacje' },
];

const MODES: Array<{ key: 'quick' | 'full' | 'exam'; label: string }> = [
  { key: 'quick', label: 'Szybki (10)' },
  { key: 'full', label: 'Pełny' },
  { key: 'exam', label: 'Egzamin' },
];

export function QuizListClient({ cards }: { cards: QuizCardMeta[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'quick' | 'full' | 'exam'>('full');
  const [activeTags, setActiveTags] = useState<TagKey[]>(['ALL']);

  // initialize from URL/localStorage
  useEffect(() => {
    const q0 = search?.get('q') ?? '';
    const mode0 = (search?.get('mode') as any) ?? '';
    const tag0 = search?.get('tag')?.toUpperCase() as TagKey | undefined;
    setQ(q0);
    if (mode0 === 'quick' || mode0 === 'full' || mode0 === 'exam') setMode(mode0);
    if (tag0 && TAGS.some(t => t.key === tag0)) setActiveTags([tag0]);
    try {
      const saved = localStorage.getItem('fxedu:quiz:q');
      if (saved && !q0) setQ(saved);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist q to localStorage and URL (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem('fxedu:quiz:q', q); } catch {}
      const params = new URLSearchParams(search?.toString());
      if (q) params.set('q', q); else params.delete('q');
      params.set('mode', mode);
      if (activeTags.length === 1 && activeTags[0] !== 'ALL') params.set('tag', activeTags[0]); else params.delete('tag');
      router.replace(`/quizy${params.toString() ? `?${params.toString()}` : ''}`);
    }, 300);
    return () => clearTimeout(id);
  }, [q, mode, activeTags, router, search]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return cards.filter(c => {
      const tagOk = activeTags.includes('ALL') ? true : activeTags.includes(c.tag as any);
      const qOk = !ql ? true : (c.title + ' ' + c.blurb).toLowerCase().includes(ql);
      return tagOk && qOk; // AND between tag filter and search
    });
  }, [cards, q, activeTags]);

  const onToggleTag = (key: TagKey) => {
    setActiveTags(prev => {
      if (key === 'ALL') return ['ALL'];
      const next = prev.includes('ALL') ? [] : [...prev];
      const i = next.indexOf(key);
      if (i >= 0) next.splice(i, 1); else next.push(key);
      if (next.length === 0) return ['ALL'];
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {TAGS.map(t => {
            const active = activeTags.includes(t.key) && !(activeTags.length > 1 && t.key === 'ALL');
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onToggleTag(t.key)}
                aria-pressed={active}
                className={`text-xs px-3 py-1.5 rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  active ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs opacity-70" htmlFor="quiz-mode">Tryb:&nbsp;</label>
          <select
            id="quiz-mode"
            className="rounded-xl bg-white/5 border border-white/10 px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            aria-label="Wybierz tryb startu quizu"
          >
            {MODES.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Szukaj: np. pips, CFD, MiFID…"
            className="w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
            aria-label="Szukaj w tytułach i opisach"
          />
        </div>
      </div>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <QuizCard key={c.slug} meta={c as any} mode={mode} query={q} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-sm text-white/70">
            Brak wyników dla wybranych filtrów. Zmień frazę lub kategorię.
          </div>
        )}
      </section>
    </div>
  );
}


