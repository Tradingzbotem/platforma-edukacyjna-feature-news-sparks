/**
 * Banki pytań dla modułów quizowych. Treść pochodzi wyłącznie z istniejących plików danych.
 * Nie importujemy ./index.ts — unikamy cykli z przyszłymi re-eksportami.
 */

import type { DataMcqRow } from "./dataMcqRow";
import type { QuizMcqQuestion, QuizQuestion } from "./types";
import type { PodstawyQuizRow } from "./podstawy";
import { PODSTAWY_QUESTIONS } from "./podstawy";
import { FOREX_QUIZ_DATA } from "./forexData";
import { CFD_QUIZ_DATA } from "./cfdData";
import { ZAAWANSOWANE_QUIZ_DATA } from "./zaawansowaneData";
import { MATERIALY_QUIZ_DATA } from "./materialyData";
import { REGULACJE_QUIZ_DATA } from "./regulacjeData";
import {
  PODSTAWY_MODULE_SUMMARY,
  FOREX_MODULE_SUMMARY,
  CFD_MODULE_SUMMARY,
  ZAAWANSOWANE_MODULE_SUMMARY,
  MATERIALY_MODULE_SUMMARY,
  REGULACJE_MODULE_SUMMARY,
} from "./moduleSummaryQuestions";
import type { QuizQuestionBankKey } from "./quizModules";

function mcqFromDataRow(row: DataMcqRow): QuizMcqQuestion {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    correctIndex: row.correctIndex,
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    explanationIncorrect: row.explanationIncorrect ?? row.explanation,
    consequenceCorrect: row.consequenceCorrect,
    consequenceWrong: row.consequenceWrong,
    topic: row.topic,
    difficulty: row.difficulty,
  };
}

function quizQuestionFromPodstawyRow(q: PodstawyQuizRow): QuizQuestion {
  return {
    type: "mcq" as const,
    id: q.id,
    question: q.question,
    options: [...q.options],
    correctIndex: q.correctIndex,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    explanationIncorrect: q.explanationIncorrect ?? q.explanation,
    consequenceCorrect: q.consequenceCorrect,
    consequenceWrong: q.consequenceWrong,
    topic: q.topic,
    difficulty: q.difficulty,
  };
}

const PODSTAWY_BANK: QuizQuestion[] = [
  ...PODSTAWY_QUESTIONS.map(quizQuestionFromPodstawyRow),
  ...PODSTAWY_MODULE_SUMMARY.map(quizQuestionFromPodstawyRow),
];

const FOREX_BANK: QuizQuestion[] = [
  ...FOREX_QUIZ_DATA.map(mcqFromDataRow),
  ...FOREX_MODULE_SUMMARY.map(mcqFromDataRow),
];
const CFD_BANK: QuizQuestion[] = [
  ...CFD_QUIZ_DATA.map(mcqFromDataRow),
  ...CFD_MODULE_SUMMARY.map(mcqFromDataRow),
];
const ZAAWANSOWANE_BANK: QuizQuestion[] = [
  ...ZAAWANSOWANE_QUIZ_DATA.map(mcqFromDataRow),
  ...ZAAWANSOWANE_MODULE_SUMMARY.map(mcqFromDataRow),
];
const MATERIALY_BANK: QuizQuestion[] = [
  ...MATERIALY_QUIZ_DATA.map(mcqFromDataRow),
  ...MATERIALY_MODULE_SUMMARY.map(mcqFromDataRow),
];
const REGULACJE_BANK: QuizQuestion[] = [
  ...REGULACJE_QUIZ_DATA.map(mcqFromDataRow),
  ...REGULACJE_MODULE_SUMMARY.map(mcqFromDataRow),
];

export const QUESTION_BANKS: Record<QuizQuestionBankKey, readonly QuizQuestion[]> = {
  podstawy: PODSTAWY_BANK,
  forex: FOREX_BANK,
  cfd: CFD_BANK,
  zaawansowane: ZAAWANSOWANE_BANK,
  materialy: MATERIALY_BANK,
  regulacje: REGULACJE_BANK,
};
