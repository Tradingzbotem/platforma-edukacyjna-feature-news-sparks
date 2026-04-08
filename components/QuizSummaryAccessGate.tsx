"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { getQuizModuleBySlug } from "@/data/quizzes/quizModules";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";
import { thematicQuizSlugs } from "@/lib/quiz/moduleThematicProgress";
import { readQuizCardState } from "@/lib/quizClientStorage";
import { FXEDU_QUIZ_LIST_SYNC } from "@/components/QuizyHeroEngagement";

function countThematicCompleted(moduleSlug: string, slugs: readonly string[]): number {
  let n = 0;
  for (const qs of slugs) {
    if (readQuizCardState(moduleQuizStorageSlug(moduleSlug, qs)).completed) n += 1;
  }
  return n;
}

/**
 * Blokuje render `QuizRunner` dla quizu podsumowującego, dopóki nie ukończono
 * wszystkich quizów tematycznych modułu (status `completed` w localStorage).
 */
export function QuizSummaryAccessGate({
  moduleSlug,
  children,
}: {
  moduleSlug: string;
  children: ReactNode;
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [thematicDone, setThematicDone] = useState(0);
  const [thematicTotal, setThematicTotal] = useState(0);

  const recompute = useCallback(() => {
    const mod = getQuizModuleBySlug(moduleSlug);
    if (!mod) {
      setAllowed(true);
      setThematicTotal(0);
      setThematicDone(0);
      return;
    }
    const thematic = thematicQuizSlugs(mod);
    const total = thematic.length;
    const done = countThematicCompleted(moduleSlug, thematic);
    setThematicTotal(total);
    setThematicDone(done);
    setAllowed(total === 0 || done >= total);
  }, [moduleSlug]);

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

  if (allowed === null) {
    return <div className="min-h-screen bg-slate-950" aria-busy="true" aria-label="Sprawdzanie dostępu" />;
  }

  if (!allowed) {
    const hub = `/quizy/${moduleSlug}`;
    const need = Math.max(0, thematicTotal - thematicDone);
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-lg px-4 py-16 animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">Podsumowanie modułu</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Quiz niedostępny</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {thematicTotal === 5 ? (
              <>Ukończ 5 quizów tematycznych, aby odblokować podsumowanie.</>
            ) : (
              <>
                Ukończ wszystkie quizy tematyczne modułu ({thematicDone}/{thematicTotal} ukończonych), aby odblokować
                podsumowanie.
              </>
            )}
          </p>
          {need > 0 ? (
            <p className="mt-2 text-sm text-white/50">
              Pozostało do ukończenia: <span className="tabular-nums font-medium text-white/70">{need}</span>
            </p>
          ) : null}
          <Link
            href={hub}
            className="mt-8 inline-flex rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.09]"
          >
            Wróć do modułu
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
