import type { QuizModuleConfig } from "@/data/quizzes/quizModules";
import { readQuizCardState } from "@/lib/quizClientStorage";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";

export function thematicQuizSlugs(mod: QuizModuleConfig): string[] {
  return mod.quizzes.filter((q) => !q.isModuleSummary).map((q) => q.slug);
}

export function summaryQuizSlug(mod: QuizModuleConfig): string | null {
  const q = mod.quizzes.find((x) => x.isModuleSummary);
  return q?.slug ?? null;
}

/** Minimalny wynik quizu podsumowującego (%) wymagany do zaliczenia modułu. */
export const QUIZ_MODULE_SUMMARY_PASS_PERCENT = 70;

/**
 * Status modułu w UI — wyłącznie na podstawie localStorage (ukończenie + wynik podsumowania).
 */
export type QuizModuleDisplayStatus =
  | "not_started"
  | "in_progress"
  | "ready_for_summary"
  | "summary_needs_retry"
  | "passed";

export function quizModuleDisplayStatusLabelPl(status: QuizModuleDisplayStatus): string {
  switch (status) {
    case "not_started":
      return "Nie rozpoczęto";
    case "in_progress":
      return "W toku";
    case "ready_for_summary":
      return "Gotowy na podsumowanie";
    case "summary_needs_retry":
      return "Podsumowanie do poprawy";
    case "passed":
      return "Ukończony";
    default:
      return "W toku";
  }
}

/**
 * Zaliczenie modułu: wszystkie quizy tematyczne ukończone + podsumowanie ukończone + wynik podsumowania ≥ próg.
 * Wywołuj wyłącznie po stronie klienta (odczyt localStorage).
 */
export function computeQuizModuleDisplayStatus(
  moduleSlug: string,
  mod: QuizModuleConfig,
): QuizModuleDisplayStatus {
  const thematicSlugs = thematicQuizSlugs(mod);
  const sumSlug = summaryQuizSlug(mod);
  const thematicTotal = thematicSlugs.length;

  let thematicCompleted = 0;
  let thematicHasActivity = false;
  for (const qs of thematicSlugs) {
    const st = readQuizCardState(moduleQuizStorageSlug(moduleSlug, qs));
    if (st.completed) thematicCompleted += 1;
    if (st.inProgress || st.reviewPending) thematicHasActivity = true;
  }

  const allThematicDone = thematicTotal === 0 || thematicCompleted >= thematicTotal;

  if (!sumSlug) {
    if (allThematicDone) return "passed";
    if (thematicCompleted === 0 && !thematicHasActivity) return "not_started";
    return "in_progress";
  }

  const sumSt = readQuizCardState(moduleQuizStorageSlug(moduleSlug, sumSlug));
  const summaryCompleted = !!sumSt.completed;
  const summaryPct =
    typeof sumSt.completed?.percentage === "number" ? sumSt.completed.percentage : null;

  if (allThematicDone && summaryCompleted) {
    const pct = summaryPct ?? 0;
    return pct >= QUIZ_MODULE_SUMMARY_PASS_PERCENT ? "passed" : "summary_needs_retry";
  }

  if (allThematicDone && !summaryCompleted) {
    if (sumSt.inProgress || sumSt.reviewPending) return "in_progress";
    return "ready_for_summary";
  }

  if (thematicCompleted === 0 && !thematicHasActivity) return "not_started";
  return "in_progress";
}
