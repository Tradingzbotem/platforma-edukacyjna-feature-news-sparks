import type { QuizQuestion } from "@/data/quizzes/types";
import {
  getQuizModuleBySlug,
  type QuizModuleConfig,
  type QuizModuleQuizConfig,
  type QuizQuestionBankKey,
} from "@/data/quizzes/quizModules";
import { QUESTION_BANKS } from "@/data/quizzes/questionBanks";
import { assertQuizModulesValid, verifyQuizModules } from "@/lib/quiz/verifyQuizModules";

let devValidationDone = false;

function runDevValidationOnce(): void {
  if (process.env.NODE_ENV !== "development") return;
  if (devValidationDone) return;
  devValidationDone = true;
  const errors = verifyQuizModules();
  if (errors.length === 0) return;
  console.error(
    "[quiz modules] Spójność danych modułów quizowych:\n%s",
    errors.map((e) => `  - ${e}`).join("\n"),
  );
}

export function getQuestionBank(key: QuizQuestionBankKey): readonly QuizQuestion[] | undefined {
  runDevValidationOnce();
  return QUESTION_BANKS[key];
}

export { getQuizModuleBySlug };

export function getQuizConfig(
  moduleSlug: string,
  quizSlug: string,
): QuizModuleQuizConfig | undefined {
  runDevValidationOnce();
  const mod = getQuizModuleBySlug(moduleSlug);
  if (!mod) return undefined;
  return mod.quizzes.find((q) => q.slug === quizSlug);
}

function buildIdMap(bank: readonly QuizQuestion[]): Map<string, QuizQuestion> {
  return new Map(bank.map((q) => [q.id, q]));
}

export type ModuleQuizQuestionsResult =
  | { status: "ok"; questions: QuizQuestion[] }
  | { status: "module_not_found"; questions: [] }
  | { status: "quiz_not_found"; questions: [] }
  | { status: "missing_question_ids"; questions: []; missingIds: string[] };

/**
 * Pytania dla konkretnego quizu w module, w kolejności z konfiguracji.
 * Przy brakujących id w banku zwraca status `missing_question_ids` i pustą listę (all-or-nothing).
 */
export function getQuestionsForModuleQuiz(
  moduleSlug: string,
  quizSlug: string,
): ModuleQuizQuestionsResult {
  runDevValidationOnce();

  const mod = getQuizModuleBySlug(moduleSlug);
  if (!mod) return { status: "module_not_found", questions: [] };

  const quiz = mod.quizzes.find((q) => q.slug === quizSlug);
  if (!quiz) return { status: "quiz_not_found", questions: [] };

  const bank = QUESTION_BANKS[mod.questionBank];
  const byId = buildIdMap(bank);

  const ordered: QuizQuestion[] = [];
  const missing: string[] = [];

  for (const id of quiz.questionIds) {
    const q = byId.get(id);
    if (q) ordered.push(q);
    else missing.push(id);
  }

  if (missing.length > 0) {
    return { status: "missing_question_ids", questions: [], missingIds: missing };
  }

  return { status: "ok", questions: ordered };
}

/**
 * Ścisła walidacja — użyj w testach / skrypcie CI; w dev wystarczy komunikat z verifyQuizModules.
 */
export function assertQuizModulesDataValid(): void {
  assertQuizModulesValid();
}

export type { QuizModuleConfig, QuizModuleQuizConfig, QuizQuestionBankKey };
