/** Unikalny identyfikator pod-quizu w localStorage (slug w QuizRunner). */
export function moduleQuizStorageSlug(moduleSlug: string, quizSlug: string): string {
  return `${moduleSlug}__${quizSlug}`;
}
