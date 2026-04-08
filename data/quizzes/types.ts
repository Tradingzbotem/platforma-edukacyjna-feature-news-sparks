/** Wspólne typy pytań quizowych — używane przez `index.ts`, `questionBanks.ts` i resolvery. */

export type QuizMcqQuestion = {
  type?: "mcq";
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswer?: string;
  explanation?: string;
  explanationIncorrect?: string;
  consequenceCorrect?: string;
  consequenceWrong?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type QuizScenarioQuestion = {
  type: "scenario";
  id: string;
  question: string;
  options?: readonly [];
  correctAnswer: string;
  explanation: string;
  explanationIncorrect?: string;
};

export type QuizQuestion = QuizMcqQuestion | QuizScenarioQuestion;

export type QuizPack = { title: string; questions: QuizQuestion[] };

/** Wersja bez klucza odpowiedzi — bezpieczna do wysłania do klienta (nie-admin). */
export type QuizMcqQuestionPublic = {
  type?: "mcq";
  id: string;
  question: string;
  options: string[];
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type QuizScenarioQuestionPublic = {
  type: "scenario";
  id: string;
  question: string;
};

export type QuizQuestionPublic = QuizMcqQuestionPublic | QuizScenarioQuestionPublic;
