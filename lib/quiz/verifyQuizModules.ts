import { QUIZ_MODULES } from "@/data/quizzes/quizModules";
import { QUESTION_BANKS } from "@/data/quizzes/questionBanks";

const EXPECTED_QUIZZES_PER_MODULE = 6;

/**
 * Sprawdza spójność QUIZ_MODULES z QUESTION_BANKS.
 * Zwraca listę komunikatów błędów (pusta = OK).
 */
export function verifyQuizModules(): string[] {
  const errors: string[] = [];

  for (const mod of QUIZ_MODULES) {
    if (mod.quizzes.length !== EXPECTED_QUIZZES_PER_MODULE) {
      errors.push(
        `Moduł "${mod.slug}": oczekiwano ${EXPECTED_QUIZZES_PER_MODULE} quizów, jest ${mod.quizzes.length}.`,
      );
    }

    const bank = QUESTION_BANKS[mod.questionBank];
    if (!bank) {
      errors.push(`Moduł "${mod.slug}": brak banku pytań "${mod.questionBank}".`);
      continue;
    }

    const idToQuestion = new Map(bank.map((q) => [q.id, q]));
    const seenInModule = new Set<string>();

    for (const quiz of mod.quizzes) {
      if (quiz.questionIds.length < 1) {
        errors.push(`Moduł "${mod.slug}", quiz "${quiz.slug}": brak questionIds.`);
      }

      for (const qid of quiz.questionIds) {
        if (seenInModule.has(qid)) {
          errors.push(
            `Moduł "${mod.slug}": duplikat questionId "${qid}" (quiz "${quiz.slug}").`,
          );
        }
        seenInModule.add(qid);

        if (!idToQuestion.has(qid)) {
          errors.push(
            `Moduł "${mod.slug}", quiz "${quiz.slug}": brak pytania id="${qid}" w banku "${mod.questionBank}".`,
          );
        }
      }
    }
  }

  return errors;
}

export function assertQuizModulesValid(): void {
  const errors = verifyQuizModules();
  if (errors.length === 0) return;
  const msg = ["Quiz modules validation failed:", ...errors.map((e) => `  - ${e}`)].join("\n");
  throw new Error(msg);
}
