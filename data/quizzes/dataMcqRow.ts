/**
 * Wspólny kształt rekordu MCQ dla quizów z rozszerzonym feedbackiem (jak Podstawy).
 * Mapowany w `index.ts` do `QuizMcqQuestion`.
 */
export type DataMcqRow = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
  explanation: string;
  explanationIncorrect?: string;
  consequenceCorrect: string;
  consequenceWrong: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
};
