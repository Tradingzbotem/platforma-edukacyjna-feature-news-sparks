"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readQuizCardState } from "@/lib/quizClientStorage";
import { FXEDU_QUIZ_LIST_SYNC } from "@/components/QuizyHeroEngagement";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";
import { getQuizModuleBySlug } from "@/data/quizzes/quizModules";
import {
  computeQuizModuleDisplayStatus,
  quizModuleDisplayStatusLabelPl,
  QUIZ_MODULE_SUMMARY_PASS_PERCENT,
  type QuizModuleDisplayStatus,
} from "@/lib/quiz/moduleThematicProgress";

function statusPanelTone(status: QuizModuleDisplayStatus): string {
  switch (status) {
    case "passed":
      return "border-emerald-400/25 bg-emerald-500/[0.07]";
    case "summary_needs_retry":
      return "border-amber-400/30 bg-amber-500/[0.08]";
    case "ready_for_summary":
      return "border-cyan-400/25 bg-cyan-500/[0.07]";
    case "not_started":
      return "border-white/[0.08] bg-white/[0.02]";
    default:
      return "border-sky-400/20 bg-sky-500/[0.06]";
  }
}

export function QuizModuleHubProgress({
  moduleSlug,
  thematicQuizSlugs,
  summaryQuizSlug: summarySlugProp,
}: {
  moduleSlug: string;
  thematicQuizSlugs: readonly string[];
  summaryQuizSlug: string | null;
}) {
  const mod = getQuizModuleBySlug(moduleSlug);
  const [thematicDone, setThematicDone] = useState(0);
  const [moduleStatus, setModuleStatus] = useState<QuizModuleDisplayStatus>("not_started");

  const thematicTotal = thematicQuizSlugs.length;

  const recompute = useCallback(() => {
    let n = 0;
    for (const qs of thematicQuizSlugs) {
      if (readQuizCardState(moduleQuizStorageSlug(moduleSlug, qs)).completed) n += 1;
    }
    setThematicDone(n);
    if (mod) {
      setModuleStatus(computeQuizModuleDisplayStatus(moduleSlug, mod));
    } else {
      setModuleStatus("not_started");
    }
  }, [moduleSlug, thematicQuizSlugs, mod]);

  useEffect(() => {
    recompute();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("fxedu:quiz:") || e.key.startsWith("fxedu.quiz.")) recompute();
    };
    const onSync = () => recompute();
    const onVis = () => {
      if (document.visibilityState === "visible") recompute();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [recompute]);

  const summaryStorageSlug =
    summarySlugProp && mod ? moduleQuizStorageSlug(moduleSlug, summarySlugProp) : null;
  const summaryRec = summaryStorageSlug ? readQuizCardState(summaryStorageSlug).completed : null;

  const statusHeadline = useMemo(() => quizModuleDisplayStatusLabelPl(moduleStatus), [moduleStatus]);

  const detailLine = useMemo(() => {
    if (moduleStatus === "passed") {
      return "Moduł zaliczony — spełniono warunki modułu (w tym wynik podsumowania).";
    }
    if (moduleStatus === "summary_needs_retry") {
      const pct = typeof summaryRec?.percentage === "number" ? summaryRec.percentage : null;
      return pct !== null
        ? `Moduł nie jest jeszcze zaliczony. Wynik podsumowania ${pct}% jest poniżej wymaganego progu ${QUIZ_MODULE_SUMMARY_PASS_PERCENT}%.`
        : `Moduł nie jest jeszcze zaliczony. Wynik podsumowania jest poniżej wymaganego progu ${QUIZ_MODULE_SUMMARY_PASS_PERCENT}%.`;
    }
    if (moduleStatus === "ready_for_summary") {
      return `Możesz przejść do quizu podsumowującego — po uzyskaniu min. ${QUIZ_MODULE_SUMMARY_PASS_PERCENT}% moduł zostanie zaliczony.`;
    }
    if (moduleStatus === "not_started") {
      return "Zacznij od quizów tematycznych — po ich ukończeniu odblokujesz podsumowanie.";
    }
    return "Kontynuuj quizy tematyczne; po ukończeniu wszystkich odblokujesz podsumowanie modułu.";
  }, [moduleStatus, summaryRec?.percentage]);

  const footerHint =
    summarySlugProp && moduleStatus !== "passed" && moduleStatus !== "summary_needs_retry" ? (
      <p className="text-xs text-white/45 border-t border-white/[0.06] pt-3">
        Zaliczenie modułu wymaga ukończenia wszystkich quizów tematycznych, ukończenia podsumowania oraz wyniku
        podsumowania co najmniej {QUIZ_MODULE_SUMMARY_PASS_PERCENT}%.
      </p>
    ) : null;

  return (
    <div
      className={`mt-6 rounded-2xl p-4 backdrop-blur-sm border shadow-sm space-y-3 ${statusPanelTone(moduleStatus)}`}
    >
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          Quizy tematyczne:{" "}
          <span className="tabular-nums font-medium text-white/85">
            {thematicDone}/{thematicTotal}
          </span>
        </span>
        <span className="tabular-nums">
          {thematicTotal > 0 ? Math.round((thematicDone / thematicTotal) * 100) : 0}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm"
          style={{
            width: `${thematicTotal > 0 ? Math.round((thematicDone / thematicTotal) * 100) : 0}%`,
          }}
        />
      </div>
      <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Status modułu</p>
        <p className="text-sm font-semibold text-white/90">{statusHeadline}</p>
        <p className="text-xs text-white/65 leading-relaxed">{detailLine}</p>
      </div>
      {footerHint}
    </div>
  );
}
