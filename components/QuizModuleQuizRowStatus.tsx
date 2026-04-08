"use client";

import { useCallback, useEffect, useState } from "react";
import { readQuizCardState } from "@/lib/quizClientStorage";
import { FXEDU_QUIZ_LIST_SYNC } from "@/components/QuizyHeroEngagement";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";
import { QUIZ_MODULE_SUMMARY_PASS_PERCENT } from "@/lib/quiz/moduleThematicProgress";

export function QuizModuleQuizRowStatus({
  moduleSlug,
  quizSlug,
  locked = false,
  isModuleSummary = false,
}: {
  moduleSlug: string;
  quizSlug: string;
  /** Gdy true (np. podsumowanie przed odblokowaniem), nie pokazuj stanu z localStorage. */
  locked?: boolean;
  isModuleSummary?: boolean;
}) {
  const storageSlug = moduleQuizStorageSlug(moduleSlug, quizSlug);
  const [label, setLabel] = useState<"review" | "progress" | "done" | "new">("new");

  const sync = useCallback(() => {
    if (locked) return;
    const s = readQuizCardState(storageSlug);
    if (s.reviewPending) setLabel("review");
    else if (s.inProgress) setLabel("progress");
    else if (s.completed) setLabel("done");
    else setLabel("new");
  }, [storageSlug, locked]);

  useEffect(() => {
    if (locked) return;
    sync();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("fxedu:quiz:") || e.key.startsWith("fxedu.quiz.")) sync();
    };
    const onSync = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FXEDU_QUIZ_LIST_SYNC, onSync);
    };
  }, [sync, locked]);

  if (locked) {
    return null;
  }

  const s = readQuizCardState(storageSlug);
  if (isModuleSummary && s.completed) {
    const pct = typeof s.completed.percentage === "number" ? s.completed.percentage : 0;
    if (pct < QUIZ_MODULE_SUMMARY_PASS_PERCENT) {
      return <span className="text-xs font-medium text-amber-200/90">Podsumowanie do poprawy</span>;
    }
    return <span className="text-xs font-medium text-emerald-300">Ukończono</span>;
  }

  if (label === "review") {
    return (
      <span className="text-xs font-medium text-amber-200/90">
        {isModuleSummary ? "Podsumowanie — weryfikacja" : "Do weryfikacji"}
      </span>
    );
  }
  if (label === "progress") {
    return <span className="text-xs font-medium text-sky-200/90">W toku</span>;
  }
  if (label === "done") {
    return <span className="text-xs font-medium text-emerald-300">Ukończono</span>;
  }
  return <span className="text-xs text-white/50">Nie rozpoczęto</span>;
}
