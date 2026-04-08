'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { QuizCard, type QuizCardMeta } from './QuizCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { readQuizCardState } from '@/lib/quizClientStorage';
import { FXEDU_QUIZ_LIST_SYNC } from '@/components/QuizyHeroEngagement';
import { getQuizModuleBySlug, isRegisteredQuizModuleSlug } from '@/data/quizzes/quizModules';
import { computeQuizModuleDisplayStatus } from '@/lib/quiz/moduleThematicProgress';

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

const MAIN_TAGS = new Set(['START', 'FX', 'CFD', 'PRO']);

function partitionBySection(cards: QuizCardMeta[]) {
  const main: QuizCardMeta[] = [];
  const extra: QuizCardMeta[] = [];
  const reg: QuizCardMeta[] = [];
  for (const c of cards) {
    if (MAIN_TAGS.has(c.tag)) main.push(c);
    else if (c.tag === 'EXTRA') extra.push(c);
    else if (c.tag === 'REG') reg.push(c);
  }
  return { main, extra, reg };
}

function QuizSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="space-y-4 scroll-mt-24 animate-fade-in"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className="text-2xl font-bold text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </section>
  );
}

export function QuizListClient({ cards }: { cards: QuizCardMeta[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'quick' | 'full' | 'exam'>('full');
  const [activeTags, setActiveTags] = useState<TagKey[]>(['ALL']);

  useEffect(() => {
    const q0 = search?.get('q') ?? '';
    const mode0 = (search?.get('mode') as string) ?? '';
    const tag0 = search?.get('tag')?.toUpperCase() as TagKey | undefined;
    setQ(q0);
    if (mode0 === 'quick' || mode0 === 'full' || mode0 === 'exam') setMode(mode0);
    if (tag0 && TAGS.some((t) => t.key === tag0)) setActiveTags([tag0]);
    try {
      const saved = localStorage.getItem('fxedu:quiz:q');
      if (saved && !q0) setQ(saved);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem('fxedu:quiz:q', q);
      } catch {}
      const params = new URLSearchParams(search?.toString());
      if (q) params.set('q', q);
      else params.delete('q');
      params.set('mode', mode);
      if (activeTags.length === 1 && activeTags[0] !== 'ALL') params.set('tag', activeTags[0]);
      else params.delete('tag');
      router.replace(`/quizy${params.toString() ? `?${params.toString()}` : ''}`);
    }, 300);
    return () => clearTimeout(id);
  }, [q, mode, activeTags, router, search]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return cards.filter((c) => {
      const tagOk = activeTags.includes('ALL') ? true : activeTags.includes(c.tag as TagKey);
      const qOk = !ql ? true : (c.title + ' ' + c.blurb).toLowerCase().includes(ql);
      return tagOk && qOk;
    });
  }, [cards, q, activeTags]);

  const { main, extra, reg } = useMemo(() => partitionBySection(filtered), [filtered]);

  const orderedFiltered = useMemo(() => [...main, ...extra, ...reg], [main, extra, reg]);

  const [hintSlug, setHintSlug] = useState<string | null>(null);

  const recomputeHint = useCallback(() => {
    if (typeof window === 'undefined') return;
    for (const c of orderedFiltered) {
      if (!c.live) continue;
      if (isRegisteredQuizModuleSlug(c.slug)) {
        const mod = getQuizModuleBySlug(c.slug);
        if (mod && computeQuizModuleDisplayStatus(c.slug, mod) !== 'passed') {
          setHintSlug(c.slug);
          return;
        }
        continue;
      }
      const { completed, inProgress, reviewPending } = readQuizCardState(c.slug);
      if (!completed && !inProgress && !reviewPending) {
        setHintSlug(c.slug);
        return;
      }
    }
    setHintSlug(null);
  }, [orderedFiltered]);

  useEffect(() => {
    recomputeHint();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('fxedu:quiz:') || e.key.startsWith('fxedu.quiz.')) {
        recomputeHint();
      }
    };
    const onSync = () => recomputeHint();
    const onVis = () => {
      if (document.visibilityState === 'visible') recomputeHint();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [recomputeHint]);

  const onToggleTag = (key: TagKey) => {
    setActiveTags((prev) => {
      if (key === 'ALL') return ['ALL'];
      const next = prev.includes('ALL') ? [] : [...prev];
      const i = next.indexOf(key);
      if (i >= 0) next.splice(i, 1);
      else next.push(key);
      if (next.length === 0) return ['ALL'];
      return next;
    });
  };

  const toolbarWrap =
    'rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0b1220]/95 via-[#0a0f18]/90 to-[#070d14]/95 ' +
    'shadow-[0_0_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] p-3 md:p-4';

  return (
    <div className="space-y-10 md:space-y-12">
      <div className={toolbarWrap} aria-label="Filtry i wyszukiwarka quizów">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {TAGS.map((t) => {
              const active =
                activeTags.includes(t.key) && !(activeTags.length > 1 && t.key === 'ALL');
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onToggleTag(t.key)}
                  aria-pressed={active}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                    active
                      ? 'bg-white text-slate-900 border-white shadow-md'
                      : 'bg-white/[0.04] text-white/78 border-white/10 hover:bg-white/[0.08] hover:border-white/15'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[11px] font-medium uppercase tracking-wide text-white/45 whitespace-nowrap" htmlFor="quiz-mode">
                Tryb
              </label>
              <select
                id="quiz-mode"
                className="rounded-lg bg-white/[0.06] border border-white/12 px-2.5 py-2 text-sm text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 min-w-[9.5rem]"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'quick' | 'full' | 'exam')}
                aria-label="Wybierz tryb startu quizu"
              >
                {MODES.map((m) => (
                  <option key={m.key} value={m.key} className="bg-slate-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Szukaj: np. pips, CFD, MiFID…"
              className="w-full sm:w-56 md:w-64 rounded-lg bg-white/[0.06] border border-white/12 px-3 py-2 text-sm text-white/90 placeholder:text-white/35 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
              aria-label="Szukaj w tytułach i opisach"
            />
          </div>
        </div>
      </div>

      <div className="space-y-10 md:space-y-12">
        {main.length > 0 ? (
          <QuizSection id="quizy-glowne" title="Główne quizy">
            {main.map((c) => (
              <QuizCard
                key={c.slug}
                meta={c}
                mode={mode}
                query={q}
                showNextStepHint={hintSlug === c.slug}
              />
            ))}
          </QuizSection>
        ) : null}

        {extra.length > 0 ? (
          <QuizSection id="quizy-materialy" title="Materiały dodatkowe">
            {extra.map((c) => (
              <QuizCard
                key={c.slug}
                meta={c}
                mode={mode}
                query={q}
                showNextStepHint={hintSlug === c.slug}
              />
            ))}
          </QuizSection>
        ) : null}

        {reg.length > 0 ? (
          <QuizSection id="quizy-regulacje" title="Regulacje">
            {reg.map((c) => (
              <QuizCard
                key={c.slug}
                meta={c}
                mode={mode}
                query={q}
                showNextStepHint={hintSlug === c.slug}
              />
            ))}
          </QuizSection>
        ) : null}

        {filtered.length === 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 p-6 text-sm text-white/70 shadow-lg">
            Brak wyników dla wybranych filtrów. Zmień frazę lub kategorię.
          </div>
        )}
      </div>
    </div>
  );
}
