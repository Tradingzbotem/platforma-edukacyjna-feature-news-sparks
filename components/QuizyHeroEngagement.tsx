"use client";

import { useCallback, useEffect, useState } from "react";
import { readQuizCardState } from "@/lib/quizClientStorage";

export const FXEDU_QUIZ_LIST_SYNC = "fxedu-quiz-list-sync";

export type LiveQuizSummary = {
  slug: string;
  title: string;
  questionsCount: number;
};

function readProgressCounts(slug: string): { answered: number; total: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`fxedu:quiz:progress:${slug}`);
    if (!raw) return null;
    const j = JSON.parse(raw) as Record<string, unknown>;
    if (typeof j.answered === "number" && typeof j.total === "number") {
      return { answered: j.answered, total: j.total };
    }
  } catch {}
  return null;
}

function pickInProgressLine(quizzes: LiveQuizSummary[]): string | null {
  if (typeof window === "undefined") return null;
  for (const q of quizzes) {
    const { inProgress, reviewPending } = readQuizCardState(q.slug);
    if (reviewPending) {
      return `Jesteś w trakcie: ${q.title} — dokończ podsumowanie`;
    }
    if (inProgress) {
      const p = readProgressCounts(q.slug);
      const total = p?.total ?? q.questionsCount;
      const answered = p?.answered ?? 0;
      if (total > 0) {
        return `Jesteś w trakcie: ${q.title} (${answered}/${total} pytań)`;
      }
      return `Jesteś w trakcie: ${q.title}`;
    }
  }
  return null;
}

export function QuizyHeroEngagement({ liveQuizzes }: { liveQuizzes: LiveQuizSummary[] }) {
  const [progressLine, setProgressLine] = useState<string | null>(null);

  const refreshProgress = useCallback(() => {
    setProgressLine(pickInProgressLine(liveQuizzes));
  }, [liveQuizzes]);

  useEffect(() => {
    refreshProgress();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (
        e.key.startsWith("fxedu:quiz:") ||
        e.key.startsWith("fxedu.quiz.")
      ) {
        refreshProgress();
      }
    };
    const onSync = () => refreshProgress();
    const onVis = () => {
      if (document.visibilityState === "visible") refreshProgress();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refreshProgress]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onPrimary = () => {
    scrollToId("quizy-glowne");
    window.setTimeout(() => {
      document.getElementById("quiz-card-podstawy")?.focus({ preventScroll: true });
    }, 450);
  };

  const onSecondary = () => {
    scrollToId("quizy-path");
  };

  return (
    <div className="mt-5 space-y-3">
      {progressLine ? (
        <p className="text-xs text-emerald-300/80 tabular-nums">{progressLine}</p>
      ) : null}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={onPrimary}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/55 transition-all duration-200 shadow-[0_0_28px_rgba(52,211,153,0.38),0_10px_28px_rgba(0,0,0,0.38)] hover:shadow-[0_0_36px_rgba(52,211,153,0.48)] hover:scale-[1.02]"
        >
          Rozwiąż pierwszy quiz
          <span aria-hidden>↓</span>
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border border-white/14 bg-white/[0.05] text-white/85 hover:bg-white/[0.09] hover:border-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 transition-all duration-200"
        >
          Zobacz ścieżkę quizów
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] leading-snug text-white/38">
        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5">
          Nowy? <span className="text-white/45">→</span> Zacznij od Podstaw
        </span>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5">
          Po kursie? <span className="text-white/45">→</span> Rozwiąż pełny quiz
        </span>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5">
          Przed egzaminem? <span className="text-white/45">→</span> Tryb pełny
        </span>
      </div>
    </div>
  );
}
