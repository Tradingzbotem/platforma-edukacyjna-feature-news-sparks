/**
 * Egzamin certyfikacyjny FXEDULAB — typy domenowe (v1).
 * Wartości statusów odpowiadają enumowi Prisma `CertificationExamAttemptStatus`.
 */

import type { CertificationTrack } from '@/lib/certifications/types';

export type CertificationExamAttemptStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PASSED'
  | 'FAILED'
  | 'EXPIRED';

/** Zapis w JSON: wybór jednej opcji lub krótka odpowiedź tekstowa. */
export type ExamAnswerStored =
  | { kind: 'single_choice'; optionId: string }
  | { kind: 'open_text'; text: string };

/**
 * Mapowanie id pytania → odpowiedź.
 * Legacy: wcześniejsze rekordy mogły mieć same stringi (traktowane jak optionId dla MC).
 */
export type ExamAnswersMap = Record<string, ExamAnswerStored | string>;

export type CertificationExamAttemptDto = {
  id: string;
  userId: string;
  track: CertificationTrack;
  status: CertificationExamAttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  scorePercent: number | null;
  passed: boolean | null;
  answers: ExamAnswersMap | null;
  timeLimitMinutes: number;
  createdAt: string;
  updatedAt: string;
};

/** Wiersz listy admina (bez odpowiedzi z egzaminu). */
export type AdminExamAttemptRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  track: CertificationTrack;
  status: CertificationExamAttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  scorePercent: number | null;
  passed: boolean | null;
  timeLimitMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type ExamQuestionSingleChoice = {
  type: 'single_choice';
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
};

export type ExamQuestionOpenText = {
  type: 'open_text';
  id: string;
  prompt: string;
  /** Krótka wskazówka dla oceniającego — tylko w podglądzie administratora, nigdy w payloadzie dla kandydata. */
  hint?: string;
  maxLength?: number;
};

/** Wersja wysyłana do kandydata: bez podpowiedzi do pytań otwartych. */
export type ExamQuestionOpenTextPublic = Omit<ExamQuestionOpenText, 'hint'>;

export type ExamQuestionPublic = ExamQuestionSingleChoice | ExamQuestionOpenTextPublic;

/**
 * Pytania wysyłane do klienta wyłącznie po stronie serwera, gdy `getIsAdmin()` === true.
 * `correctOptionId` nigdy nie występuje w `ExamQuestionPublic`.
 */
export type ExamQuestionSingleChoiceAdminPreview = ExamQuestionSingleChoice & {
  correctOptionId: string;
};
export type ExamQuestionAdminPreview = ExamQuestionSingleChoiceAdminPreview | ExamQuestionOpenText;

/** Bank placeholderów (serwer): MC z kluczem + pytania otwarte. */
export type ExamPlaceholderMc = ExamQuestionSingleChoice & { correctOptionId: string };
export type ExamPlaceholderInternal = ExamPlaceholderMc | ExamQuestionOpenText;
