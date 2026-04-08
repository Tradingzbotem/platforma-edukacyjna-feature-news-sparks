import type { QuizScenarioQuestion } from "@/data/quizzes/types";

export function normalizeScenarioAnswerText(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function scenarioAnswerMatches(q: QuizScenarioQuestion, user: string): boolean {
  return normalizeScenarioAnswerText(user) === normalizeScenarioAnswerText(q.correctAnswer);
}
