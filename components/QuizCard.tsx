'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearQuizCompleted,
  clearQuizInProgressStorage,
  readQuizCardState,
} from '@/lib/quizClientStorage';
import { FXEDU_QUIZ_LIST_SYNC } from '@/components/QuizyHeroEngagement';
import { getQuizModuleBySlug, isRegisteredQuizModuleSlug } from '@/data/quizzes/quizModules';
import {
  computeQuizModuleDisplayStatus,
  quizModuleDisplayStatusLabelPl,
  type QuizModuleDisplayStatus,
} from '@/lib/quiz/moduleThematicProgress';

export type QuizCardMeta = {
  slug: string;
  tag: 'START' | 'FX' | 'CFD' | 'PRO' | 'EXTRA' | 'REG';
  title: string;
  blurb: string;
  questionsCount: number;
  live: boolean;
};

export type QuizUserState = {
  lastScorePct?: number;
  answered?: number;
  total?: number;
  hasSession?: boolean;
  lastAttemptAt?: string;
  completed?: ReturnType<typeof readQuizCardState>['completed'];
  inProgress?: boolean;
  reviewPending?: boolean;
};

function categoryLabelForTag(tag: QuizCardMeta['tag']): string {
  switch (tag) {
    case 'START':
      return 'Start';
    case 'FX':
      return 'Forex';
    case 'CFD':
      return 'CFD';
    case 'PRO':
      return 'Zaawansowane';
    case 'EXTRA':
      return 'Materiały';
    case 'REG':
      return 'Regulacje';
    default:
      return tag;
  }
}

function statusBadgeClass(kind: 'review' | 'progress' | 'done' | 'soon') {
  switch (kind) {
    case 'review':
      return 'border-amber-400/35 bg-amber-500/12 text-amber-100/90';
    case 'progress':
      return 'border-sky-400/35 bg-sky-500/12 text-sky-100/90';
    case 'done':
      return 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200/90';
    case 'soon':
      return 'border-white/12 bg-white/[0.04] text-white/55';
    default:
      return 'border-white/12 bg-white/[0.04] text-white/55';
  }
}

function moduleStatusBadgeClass(status: QuizModuleDisplayStatus): string {
  switch (status) {
    case 'passed':
      return 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200/90';
    case 'summary_needs_retry':
      return 'border-amber-400/35 bg-amber-500/12 text-amber-100/90';
    case 'ready_for_summary':
      return 'border-cyan-400/28 bg-cyan-500/[0.1] text-cyan-100/88';
    case 'not_started':
      return 'border-white/12 bg-white/[0.04] text-white/55';
    default:
      return 'border-sky-400/35 bg-sky-500/12 text-sky-100/90';
  }
}

function readUserState(slug: string): QuizUserState {
  if (typeof window === 'undefined') return {};
  const keyStats = `fxedu:quiz:stats:${slug}`;
  const keyProgress = `fxedu:quiz:progress:${slug}`;
  const keySession = `fxedu:quiz:session:${slug}`;
  const legacySession = `fxedu.quiz.${slug}`;
  const { completed, inProgress, reviewPending } = readQuizCardState(slug);
  const state: QuizUserState = {
    completed,
    inProgress,
    reviewPending,
  };
  try {
    const s = localStorage.getItem(keyStats);
    if (s) {
      const { lastScorePct, lastAttemptAt } = JSON.parse(s) as Record<string, unknown>;
      if (typeof lastScorePct === 'number') state.lastScorePct = lastScorePct;
      if (typeof lastAttemptAt === 'string') state.lastAttemptAt = lastAttemptAt;
    }
  } catch {}
  try {
    const p = localStorage.getItem(keyProgress);
    if (p) {
      const { answered, total } = JSON.parse(p) as Record<string, unknown>;
      if (typeof answered === 'number') state.answered = answered;
      if (typeof total === 'number') state.total = total;
    }
  } catch {}
  try {
    const hasNew = !!localStorage.getItem(keySession);
    const hasLegacy = !!localStorage.getItem(legacySession);
    state.hasSession = hasNew || hasLegacy;
  } catch {}
  return state;
}

function clampLines(text: string, maxLen = 220): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

function highlight(text: string, q: string) {
  if (!q) return { parts: [text], matches: [] as number[] };
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'ig');
  const parts: string[] = [];
  const matches: number[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    parts.push(text.slice(lastIndex, start));
    parts.push(text.slice(start, end));
    matches.push(parts.length - 1);
    lastIndex = end;
  }
  parts.push(text.slice(lastIndex));
  return { parts, matches };
}

export function QuizCard({
  meta,
  mode,
  query,
  onClick,
  showNextStepHint,
}: {
  meta: QuizCardMeta;
  mode: 'quick' | 'full' | 'exam';
  query: string;
  onClick?: () => void;
  /** Pierwszy „nierozpoczęty” quiz w kolejności listy — podpowiedź pod CTA. */
  showNextStepHint?: boolean;
}) {
  const [userState, setUserState] = useState<QuizUserState>({});
  const [moduleDisplayStatus, setModuleDisplayStatus] = useState<QuizModuleDisplayStatus | null>(null);

  const syncModuleDisplayStatus = useCallback(() => {
    if (!isRegisteredQuizModuleSlug(meta.slug)) {
      setModuleDisplayStatus(null);
      return;
    }
    const mod = getQuizModuleBySlug(meta.slug);
    if (!mod) {
      setModuleDisplayStatus(null);
      return;
    }
    setModuleDisplayStatus(computeQuizModuleDisplayStatus(meta.slug, mod));
  }, [meta.slug]);

  useEffect(() => {
    const refreshLocal = () => setUserState(readUserState(meta.slug));

    refreshLocal();
    syncModuleDisplayStatus();

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (
        e.key === `fxedu:quiz:stats:${meta.slug}` ||
        e.key === `fxedu:quiz:progress:${meta.slug}` ||
        e.key === `fxedu:quiz:session:${meta.slug}` ||
        e.key === `fxedu.quiz.${meta.slug}` ||
        e.key === `fxedu:quiz:completed:${meta.slug}`
      ) {
        refreshLocal();
      }
      if (e.key.startsWith('fxedu:quiz:') || e.key.startsWith('fxedu.quiz.')) {
        syncModuleDisplayStatus();
      }
    };
    const onListSync = () => {
      refreshLocal();
      syncModuleDisplayStatus();
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        refreshLocal();
        syncModuleDisplayStatus();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onListSync);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onListSync);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [meta.slug, syncModuleDisplayStatus]);

  const titleHL = useMemo(() => highlight(meta.title, query), [meta.title, query]);
  const blurbHL = useMemo(() => highlight(meta.blurb, query), [meta.blurb, query]);

  const progressTotal = userState.total ?? meta.questionsCount;
  const progressAnswered = Math.min(userState.answered ?? 0, progressTotal);
  const progressPct = progressTotal > 0 ? Math.round((progressAnswered / progressTotal) * 100) : 0;

  const href = useMemo(() => {
    if (isRegisteredQuizModuleSlug(meta.slug)) {
      return `/quizy/${meta.slug}`;
    }
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    const done =
      userState.completed && !userState.inProgress && !userState.reviewPending;
    if (done) params.set('retry', '1');
    return `/quizy/${meta.slug}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [meta.slug, mode, userState.completed, userState.inProgress, userState.reviewPending]);

  const ctaLabel = !meta.live
    ? 'Wkrótce'
    : userState.reviewPending
      ? 'Dokończ'
      : userState.inProgress
        ? 'Kontynuuj'
        : userState.completed
          ? 'Powtórz'
          : 'Rozpocznij';
  const ctaAria = `${ctaLabel}: ${meta.title}`;

  const categoryBadge = categoryLabelForTag(meta.tag);

  const isModuleCard = meta.live && isRegisteredQuizModuleSlug(meta.slug);

  const statusKind: 'review' | 'progress' | 'done' | 'soon' | null = !meta.live
    ? 'soon'
    : isModuleCard
      ? null
      : userState.reviewPending
        ? 'review'
        : userState.inProgress
          ? 'progress'
          : userState.completed
            ? 'done'
            : null;

  const statusLabel =
    !meta.live
      ? 'Wkrótce'
      : isModuleCard
        ? null
        : userState.reviewPending
          ? 'Podsumowanie'
          : userState.inProgress
            ? 'W toku'
            : userState.completed
              ? 'Ukończony'
              : null;

  const moduleStatusLabel =
    isModuleCard && moduleDisplayStatus ? quizModuleDisplayStatusLabelPl(moduleDisplayStatus) : null;

  return (
    <article
      id={`quiz-card-${meta.slug}`}
      className="h-full rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] border border-white/10 p-4 flex flex-col shadow-sm hover:shadow-lg hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45"
      tabIndex={0}
      aria-label={`${meta.title} — ${meta.blurb}`}
    >
      <div className="flex flex-wrap items-start gap-2 min-h-[1.25rem]">
        <span className="inline-block text-[10px] tracking-wide uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-md w-fit text-white/70 shadow-sm">
          {categoryBadge}
        </span>
        {moduleStatusLabel ? (
          <span
            className={`inline-block text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md border ${moduleStatusBadgeClass(moduleDisplayStatus!)}`}
          >
            {moduleStatusLabel}
          </span>
        ) : statusLabel ? (
          <span
            className={`inline-block text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md border ${statusBadgeClass(statusKind!)}`}
          >
            {statusLabel}
          </span>
        ) : meta.live ? (
          <span className="inline-block text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md border border-white/12 bg-white/[0.04] text-white/55">
            Nie rozpoczęto
          </span>
        ) : null}
      </div>

      <div className="mt-2 min-w-0 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold leading-snug text-white">
          <span className="sr-only">{meta.title}</span>
          <span aria-hidden>
            {titleHL.parts.map((p, i) =>
              titleHL.matches.includes(i) ? (
                <mark key={i} className="bg-yellow-300/30 px-0.5 rounded" aria-hidden>
                  {p}
                </mark>
              ) : (
                <span key={i}>{p}</span>
              ),
            )}
          </span>
        </h3>

        <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-4">
          <span className="sr-only">{clampLines(meta.blurb)}</span>
          <span aria-hidden>
            {blurbHL.parts.map((p, i) =>
              blurbHL.matches.includes(i) ? (
                <mark key={i} className="bg-yellow-300/20 px-0.5 rounded" aria-hidden>
                  {p}
                </mark>
              ) : (
                <span key={i}>{p}</span>
              ),
            )}
          </span>
        </p>

        <p className="mt-3 text-xs text-white/50 tabular-nums">
          {meta.questionsCount} {meta.questionsCount === 1 ? 'pytanie' : 'pytań'}
        </p>

        <div className="mt-3" aria-hidden>
          <div className="h-1.5 w-full rounded-full bg-white/10 shadow-inner">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-white/50">
            Postęp w tej sesji: {progressAnswered}/{progressTotal}
          </div>
        </div>

        {(userState.completed || typeof userState.lastScorePct === 'number') && (
          <p className="mt-2 text-xs text-white/60 leading-snug">
            {userState.completed ? (
              <>
                Ostatni wynik: {userState.completed.score}/{userState.completed.total} (
                {userState.completed.percentage}%)
              </>
            ) : (
              <>Ostatni wynik (zapis lokalny): {Math.round(userState.lastScorePct!)}%</>
            )}
          </p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex w-full flex-col gap-2">
        {meta.live ? (
          <>
            {showNextStepHint ? (
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/65">
                Rekomendowany kolejny krok
              </p>
            ) : null}
            <Link
              href={href}
              onClick={onClick}
              className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/55 transition-all duration-200 shadow-[0_0_22px_rgba(52,211,153,0.32),0_8px_22px_rgba(0,0,0,0.35)] hover:shadow-[0_0_30px_rgba(52,211,153,0.42)] hover:scale-[1.02]"
              aria-label={ctaAria}
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
            {(userState.hasSession || userState.completed) && (
              <button
                type="button"
                onClick={() => {
                  clearQuizInProgressStorage(meta.slug);
                  clearQuizCompleted(meta.slug);
                  try {
                    localStorage.removeItem(`fxedu:quiz:stats:${meta.slug}`);
                  } catch {}
                  setUserState(readUserState(meta.slug));
                  try {
                    window.dispatchEvent(new Event(FXEDU_QUIZ_LIST_SYNC));
                  } catch {}
                }}
                className="w-full text-center text-xs text-white/38 hover:text-white/55 underline decoration-white/12 underline-offset-2 transition-colors py-0.5"
              >
                Wyczyść zapis lokalny
              </button>
            )}
          </>
        ) : (
          <span
            className="inline-flex w-full items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/10 text-white/50 text-sm font-semibold border border-white/10 cursor-not-allowed select-none"
            title="Wkrótce dostępne"
          >
            Wkrótce
          </span>
        )}
      </div>
    </article>
  );
}
