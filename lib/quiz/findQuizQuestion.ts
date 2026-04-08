import { QUIZZES } from "@/data/quizzes";
import type { QuizQuestion } from "@/data/quizzes/types";
import { getQuestionsForModuleQuiz } from "@/lib/quiz/resolveModuleQuiz";

export function findQuizQuestion(params:
  | { scope: "module"; moduleSlug: string; quizSlug: string; questionId: string }
  | { scope: "pack"; packSlug: string; questionId: string },
): QuizQuestion | null {
  if (params.scope === "pack") {
    const pack = QUIZZES[params.packSlug];
    return pack?.questions.find((q) => q.id === params.questionId) ?? null;
  }
  const r = getQuestionsForModuleQuiz(params.moduleSlug, params.quizSlug);
  if (r.status !== "ok") return null;
  return r.questions.find((q) => q.id === params.questionId) ?? null;
}
