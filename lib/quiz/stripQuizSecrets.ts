import type { QuizQuestion, QuizQuestionPublic } from "@/data/quizzes/types";

export function stripQuizQuestionForClient(q: QuizQuestion): QuizQuestionPublic {
  if (q.type === "scenario") {
    return { type: "scenario", id: q.id, question: q.question };
  }
  return {
    type: "mcq",
    id: q.id,
    question: q.question,
    options: [...q.options],
    topic: q.topic,
    difficulty: q.difficulty,
  };
}

export function stripQuizQuestionsForClient(questions: QuizQuestion[]): QuizQuestionPublic[] {
  return questions.map(stripQuizQuestionForClient);
}
