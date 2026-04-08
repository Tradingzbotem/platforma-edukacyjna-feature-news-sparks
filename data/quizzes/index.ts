// data/quizzes/index.ts
// Typy, rejestr QUIZZES i mapowanie paczek. Treść rozszerzonych quizów: `podstawy.ts`, `*Data.ts`, `*QuizData.ts`.

import type { DataMcqRow } from "./dataMcqRow";
import { PODSTAWY_QUESTIONS } from "./podstawy";
import { FOREX_QUIZ_DATA } from "./forexData";
import { CFD_QUIZ_DATA } from "./cfdData";
import { ZAAWANSOWANE_QUIZ_DATA } from "./zaawansowaneData";
import { MATERIALY_QUIZ_DATA } from "./materialyData";
import { REGULACJE_QUIZ_DATA } from "./regulacjeData";
import { REGULACJE_MODULE_SUMMARY } from "./moduleSummaryQuestions";
import { KNF_QUIZ_DATA } from "./knfQuizData";
import { CYSEC_QUIZ_DATA } from "./cysecQuizData";
import { MIFID_QUIZ_DATA } from "./mifidQuizData";
import type { QuizMcqQuestion, QuizPack, QuizQuestion } from "./types";

export type {
  QuizMcqQuestion,
  QuizMcqQuestionPublic,
  QuizPack,
  QuizQuestion,
  QuizQuestionPublic,
  QuizScenarioQuestion,
  QuizScenarioQuestionPublic,
} from "./types";

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

// ============================================================================
// KNF
// ============================================================================
const KNF_QUESTIONS: QuizQuestion[] = KNF_QUIZ_DATA.map(mcqFromDataRow);

const KNF_PACK: QuizPack = { title: "KNF (PL) — wiedza regulacyjna", questions: KNF_QUESTIONS };

// ============================================================================
// CYSEC
// ============================================================================
const CYSEC_QUESTIONS: QuizQuestion[] = CYSEC_QUIZ_DATA.map(mcqFromDataRow);

const CYSEC_PACK: QuizPack = { title: "CySEC (CY) — wiedza regulacyjna", questions: CYSEC_QUESTIONS };

// ============================================================================
// MiFID II
// ============================================================================
const MIFID_QUESTIONS: QuizQuestion[] = MIFID_QUIZ_DATA.map(mcqFromDataRow);

const MIFID_PACK: QuizPack = { title: "MiFID II (UE) — podstawy i praktyka", questions: MIFID_QUESTIONS };

// ============================================================================
// PODSTAWY — rozszerzony model treści, 32+ pytań (data/quizzes/podstawy.ts)
// ============================================================================
const BASIC_QUESTIONS: QuizQuestion[] = PODSTAWY_QUESTIONS.map((q) => ({
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
}));

const BASIC_PACK: QuizPack = { title: "Podstawy — ABC rynku", questions: BASIC_QUESTIONS };

// ============================================================================
// FOREX (27 pytań)
// ============================================================================
const FOREX_QUESTIONS: QuizQuestion[] = FOREX_QUIZ_DATA.map(mcqFromDataRow);

const FOREX_PACK: QuizPack = { title: "Forex — pary, pipy, sesje", questions: FOREX_QUESTIONS };

// ============================================================================
// CFD (26 pytań)
// ============================================================================
const CFD_QUESTIONS: QuizQuestion[] = CFD_QUIZ_DATA.map(mcqFromDataRow);

const CFD_PACK: QuizPack = { title: "CFD — mechanika i koszty", questions: CFD_QUESTIONS };

// ============================================================================
// MATERIAŁY (25 pytań) — AT, psychologia, kalendarz
// ============================================================================
const MATERIALS_QUESTIONS: QuizQuestion[] = MATERIALY_QUIZ_DATA.map(mcqFromDataRow);

const MATERIALS_PACK: QuizPack = {
  title: "Materiały — AT, psychologia, kalendarz",
  questions: MATERIALS_QUESTIONS,
};

// ============================================================================
// ZAAWANSOWANE (25 pytań) — edge, statystyka, testy, automatyzacja
// ============================================================================
const ADVANCED_QUESTIONS: QuizQuestion[] = ZAAWANSOWANE_QUIZ_DATA.map(mcqFromDataRow);

const ADVANCED_PACK: QuizPack = {
  title: "Zaawansowane — systemy i algotrading",
  questions: ADVANCED_QUESTIONS,
};

// ============================================================================
// REGULACJE — moduł modułowy + pełna paczka do listy /quizy
// ============================================================================
const REGULACJE_QUESTIONS: QuizQuestion[] = [
  ...REGULACJE_QUIZ_DATA.map(mcqFromDataRow),
  ...REGULACJE_MODULE_SUMMARY.map(mcqFromDataRow),
];

const REGULACJE_PACK: QuizPack = {
  title: "Regulacje w praktyce",
  questions: REGULACJE_QUESTIONS,
};

// ============================================================================
// REJESTR
// ============================================================================
export const QUIZZES: Record<string, QuizPack> = {
  // nowe/rozszerzone
  podstawy: BASIC_PACK,
  forex: FOREX_PACK,
  cfd: CFD_PACK,
  materialy: MATERIALS_PACK,
  zaawansowane: ADVANCED_PACK,
  regulacje: REGULACJE_PACK,

  // istniejące (legacy — przekierowania z /quizy/knf|cysec|mifid na /quizy/regulacje)
  knf: KNF_PACK,
  cysec: CYSEC_PACK,
  mifid: MIFID_PACK,
} as const;
