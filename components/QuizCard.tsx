'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
};

function readUserState(slug: string): QuizUserState {
  if (typeof window === 'undefined') return {};
  const keyStats = `fxedu:quiz:stats:${slug}`;
  const keyProgress = `fxedu:quiz:progress:${slug}`;
  const keySession = `fxedu:quiz:session:${slug}`;
  const legacySession = `fxedu.quiz.${slug}`;
  const state: QuizUserState = {};
  try {
    const s = localStorage.getItem(keyStats);
    if (s) {
      const { lastScorePct, attempts, lastAttemptAt } = JSON.parse(s) as any;
      if (typeof lastScorePct === 'number') state.lastScorePct = lastScorePct;
      if (typeof lastAttemptAt === 'string') state.lastAttemptAt = lastAttemptAt;
    }
  } catch {}
  try {
    const p = localStorage.getItem(keyProgress);
    if (p) {
      const { answered, total } = JSON.parse(p) as any;
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

function clampLines(text: string, maxLen = 160): string {
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

export function QuizCard({ meta, mode, query, onClick }: {
  meta: QuizCardMeta;
  mode: 'quick' | 'full' | 'exam';
  query: string;
  onClick?: () => void;
}) {
  const [userState, setUserState] = useState<QuizUserState>({});
  useEffect(() => {
    setUserState(readUserState(meta.slug));
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (
        e.key === `fxedu:quiz:stats:${meta.slug}` ||
        e.key === `fxedu:quiz:progress:${meta.slug}` ||
        e.key === `fxedu:quiz:session:${meta.slug}` ||
        e.key === `fxedu.quiz.${meta.slug}`
      ) {
        setUserState(readUserState(meta.slug));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [meta.slug]);

  const titleHL = useMemo(() => highlight(meta.title, query), [meta.title, query]);
  const blurbHL = useMemo(() => highlight(meta.blurb, query), [meta.blurb, query]);

  const progressTotal = userState.total ?? meta.questionsCount;
  const progressAnswered = Math.min(userState.answered ?? 0, progressTotal);
  const progressPct = progressTotal > 0 ? Math.round((progressAnswered / progressTotal) * 100) : 0;

  const href = useMemo(() => {
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    return `/quizy/${meta.slug}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [meta.slug, mode]);

  const ctaLabel = meta.live ? (userState.hasSession ? 'Kontynuuj' : 'Rozpocznij') : 'Wkrótce';
  const ctaAria = `${ctaLabel}: ${meta.title}`;

  return (
    <article
      className="rounded-2xl p-5 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm border border-white/10 shadow-sm hover:shadow-lg hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col justify-between min-h-[240px]"
      tabIndex={0}
      aria-label={`${meta.title} — ${meta.blurb}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold tracking-widest text-white/60">
            {meta.tag}
            {meta.live && (
              <span className="ml-2 inline-block rounded-full border border-white/20 px-2 py-0.5 text-[10px]">
                {meta.questionsCount} {meta.questionsCount === 1 ? 'pytanie' : 'pytań'}
              </span>
            )}
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 text-white/70" aria-hidden>
            {meta.live ? 'OPEN' : 'SOON'}
          </div>
        </div>

        <h3 className="mt-2 text-lg font-semibold leading-snug">
          <span className="sr-only">{meta.title}</span>
          <span aria-hidden>
            {titleHL.parts.map((p, i) => (
              titleHL.matches.includes(i) ? (
                <mark key={i} className="bg-yellow-300/30 px-0.5 rounded" aria-hidden>
                  {p}
                </mark>
              ) : (
                <span key={i}>{p}</span>
              )
            ))}
          </span>
        </h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-2">
          <span className="sr-only">{clampLines(meta.blurb)}</span>
          <span aria-hidden>
            {blurbHL.parts.map((p, i) => (
              blurbHL.matches.includes(i) ? (
                <mark key={i} className="bg-yellow-300/20 px-0.5 rounded" aria-hidden>
                  {p}
                </mark>
              ) : (
                <span key={i}>{p}</span>
              )
            ))}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
          <span>{meta.questionsCount} pytań</span>
          {typeof userState.lastScorePct === 'number' && (
            <>
              <span aria-hidden>·</span>
              <span>ostatni wynik {Math.round(userState.lastScorePct)}%</span>
            </>
          )}
        </div>

        <div className="mt-3" aria-hidden>
          <div className="h-2 w-full rounded-full bg-white/10 shadow-inner">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-white/60">
            Postęp: {progressAnswered}/{progressTotal}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {meta.live ? (
          <Link
            href={href}
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label={ctaAria}
          >
            {ctaLabel}
          </Link>
        ) : (
          <span
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white/10 text-white/60 border border-white/10 cursor-not-allowed select-none shadow-sm"
            title="Wkrótce dostępne"
          >
            Wkrótce
          </span>
        )}
      </div>
    </article>
  );
}



