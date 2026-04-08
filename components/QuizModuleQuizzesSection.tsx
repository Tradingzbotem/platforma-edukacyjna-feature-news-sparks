"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getQuizModuleBySlug } from "@/data/quizzes/quizModules";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";
import {
  QUIZ_MODULE_SUMMARY_PASS_PERCENT,
  summaryQuizSlug,
  thematicQuizSlugs,
} from "@/lib/quiz/moduleThematicProgress";
import { readQuizCardState } from "@/lib/quizClientStorage";
import { FXEDU_QUIZ_LIST_SYNC } from "@/components/QuizyHeroEngagement";
import { QuizModuleQuizRowStatus } from "@/components/QuizModuleQuizRowStatus";

export type QuizModuleQuizzesSectionRow = {
  slug: string;
  title: string;
  shortDescription: string;
  estimatedMinutes?: number;
  questionCount: number;
  isModuleSummary?: boolean;
  indexOneBased: number;
  totalQuizzes: number;
};

export function QuizModuleQuizzesSection({
  moduleSlug,
  quizzes,
}: {
  moduleSlug: string;
  quizzes: readonly QuizModuleQuizzesSectionRow[];
}) {
  const mod = getQuizModuleBySlug(moduleSlug);
  const thematicSlugs = mod ? thematicQuizSlugs(mod) : [];
  const thematicRequired = thematicSlugs.length;
  const moduleSummarySlug = mod ? summaryQuizSlug(mod) : null;

  const [thematicDone, setThematicDone] = useState(0);
  const [summaryPct, setSummaryPct] = useState<number | null>(null);
  const [summaryCompleted, setSummaryCompleted] = useState(false);

  const recompute = useCallback(() => {
    if (!mod) {
      setThematicDone(0);
      setSummaryPct(null);
      setSummaryCompleted(false);
      return;
    }
    let n = 0;
    for (const qs of thematicSlugs) {
      if (readQuizCardState(moduleQuizStorageSlug(moduleSlug, qs)).completed) n += 1;
    }
    setThematicDone(n);
    if (moduleSummarySlug) {
      const sumSt = readQuizCardState(moduleQuizStorageSlug(moduleSlug, moduleSummarySlug));
      setSummaryCompleted(!!sumSt.completed);
      setSummaryPct(typeof sumSt.completed?.percentage === "number" ? sumSt.completed.percentage : null);
    } else {
      setSummaryCompleted(false);
      setSummaryPct(null);
    }
  }, [mod, moduleSlug, thematicSlugs, moduleSummarySlug]);

  useEffect(() => {
    recompute();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("fxedu:quiz:") || e.key.startsWith("fxedu.quiz.")) recompute();
    };
    const onSync = () => recompute();
    const onVis = () => document.visibilityState === "visible" && recompute();
    window.addEventListener("storage", onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [recompute]);

  const summaryUnlocked = thematicRequired === 0 || thematicDone >= thematicRequired;
  const summaryBelowPass =
    summaryCompleted &&
    (typeof summaryPct === "number" ? summaryPct : 0) < QUIZ_MODULE_SUMMARY_PASS_PERCENT;

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      {quizzes.map((quiz) => {
        const isSummary = !!quiz.isModuleSummary;
        const locked = isSummary && !summaryUnlocked;
        const summaryNeedsRetry = isSummary && summaryUnlocked && summaryBelowPass;
        return (
          <article
            key={quiz.slug}
            className={`rounded-2xl p-6 backdrop-blur-sm border transition-all duration-200 shadow-sm ${
              locked
                ? "border-white/[0.07] bg-white/[0.02] opacity-95"
                : "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs text-white/60">
                  Quiz <span className="tabular-nums">{quiz.indexOneBased}</span> / {quiz.totalQuizzes}
                </div>
                {isSummary ? (
                  <span className="rounded-full border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100/90">
                    Podsumowanie
                  </span>
                ) : null}
                {locked ? (
                  <span className="rounded-full border border-rose-400/35 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100/90">
                    Zablokowany
                  </span>
                ) : null}
              </div>
              <QuizModuleQuizRowStatus
                moduleSlug={moduleSlug}
                quizSlug={quiz.slug}
                locked={locked}
                isModuleSummary={isSummary}
              />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-white">{quiz.title}</h2>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">{quiz.shortDescription}</p>
            {locked ? (
              <p className="mt-3 text-xs leading-relaxed text-white/50">
                {thematicRequired === 5 ? (
                  <>Ukończ 5 quizów tematycznych, aby odblokować podsumowanie.</>
                ) : (
                  <>
                    Ukończ wszystkie quizy tematyczne ({thematicDone}/{thematicRequired}), aby odblokować podsumowanie.
                  </>
                )}
              </p>
            ) : null}
            {summaryNeedsRetry ? (
              <div
                className="mt-3 rounded-xl border border-amber-400/35 bg-amber-500/[0.08] px-3 py-2.5 text-xs leading-relaxed text-amber-50/95"
                role="status"
              >
                <p className="font-semibold text-amber-100/95">Moduł nie jest jeszcze zaliczony</p>
                <p className="mt-1 text-amber-50/90">
                  Wynik podsumowania jest poniżej {QUIZ_MODULE_SUMMARY_PASS_PERCENT}%. Popraw quiz podsumowujący, aby
                  zaliczyć moduł.
                </p>
              </div>
            ) : null}
            {typeof quiz.estimatedMinutes === "number" ? (
              <p className="mt-2 text-xs text-white/50">Szacunek: ~{quiz.estimatedMinutes} min</p>
            ) : null}
            <div className="mt-4 flex items-center justify-between text-sm text-white/60">
              <span className="tabular-nums">{quiz.questionCount} pytań</span>
              {locked ? (
                <span
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-white/40 font-semibold cursor-not-allowed"
                  title="Ukończ wszystkie quizy tematyczne modułu (status: ukończono), aby wejść w podsumowanie."
                >
                  Zablokowane
                </span>
              ) : (
                <Link
                  href={`/quizy/${moduleSlug}/${quiz.slug}`}
                  className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {summaryNeedsRetry ? "Popraw podsumowanie" : "Otwórz"}
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
