import 'server-only';

import type { InputJsonValue } from '@prisma/client/runtime/client';

import {
  CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT,
  CERT_EXAM_V1_TIME_LIMIT_MINUTES,
} from '@/lib/certification-exam/constants';
import { isAnswersCompleteForQuestions } from '@/lib/certification-exam/answersCodec';
import { prismaExamAttemptToDto } from '@/lib/certification-exam/mapper';
import {
  getAdminPreviewQuestionsForTrack,
  getPlaceholderQuestionsForTrack,
  scorePlaceholderAttempt,
} from '@/lib/certification-exam/placeholderQuestions';
import {
  repoCreateExamAttempt,
  repoFindAnyInProgressExamAttempt,
  repoFindExamAttemptByIdForUser,
  repoGetUserExamLandingStats,
  repoSubmitExamAttempt,
  repoUpdateExamAttemptAnswers,
} from '@/lib/certification-exam/repository';
import type {
  CertificationExamAttemptDto,
  ExamAnswersMap,
  ExamQuestionAdminPreview,
  ExamQuestionPublic,
} from '@/lib/certification-exam/types';
import type { CertificationTrack } from '@/lib/certifications/types';
import { getPrisma } from '@/lib/prisma';

function mergeAnswers(existing: ExamAnswersMap | null, patch: ExamAnswersMap): ExamAnswersMap {
  return { ...(existing ?? {}), ...patch };
}

function isPrismaMissingTableError(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  const msg = String((e as Error)?.message ?? '').toLowerCase();
  return code === 'P2021' || msg.includes('does not exist') || msg.includes('no such table');
}

export async function getInProgressExamAttemptForUser(userId: string): Promise<CertificationExamAttemptDto | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const row = await repoFindAnyInProgressExamAttempt(userId);
    return row ? prismaExamAttemptToDto(row) : null;
  } catch (e) {
    if (isPrismaMissingTableError(e)) return null;
    throw e;
  }
}

export type UserExamLandingStats = {
  totalAttempts: number;
  hasActiveAttempt: boolean;
  lastResultLabel: string;
  statusLabel: string;
  activeAttemptLabel: string;
};

export async function getUserExamLandingStats(userId: string): Promise<UserExamLandingStats | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const raw = await repoGetUserExamLandingStats(userId);
    if (!raw) return null;

    const { totalAttempts, hasActiveAttempt, lastFinished } = raw;

    let lastResultLabel = 'brak';
    if (lastFinished) {
      const pct = lastFinished.scorePercent;
      const pctPart = typeof pct === 'number' ? ` (${pct}%)` : '';
      if (lastFinished.status === 'PASSED') {
        lastResultLabel = `Zaliczono${pctPart}`;
      } else if (lastFinished.status === 'FAILED') {
        lastResultLabel = `Niezaliczono${pctPart}`;
      }
    }

    let statusLabel = 'Nie rozpoczęto';
    if (totalAttempts > 0) {
      if (hasActiveAttempt) {
        statusLabel = 'W toku';
      } else if (lastFinished?.status === 'PASSED') {
        statusLabel = 'Ostatnie podejście zaliczone';
      } else if (lastFinished?.status === 'FAILED') {
        statusLabel = 'Ostatnie podejście niezaliczone';
      } else {
        statusLabel = 'Rozpoczęto';
      }
    }

    return {
      totalAttempts,
      hasActiveAttempt,
      lastResultLabel,
      statusLabel,
      activeAttemptLabel: hasActiveAttempt ? 'tak' : 'nie',
    };
  } catch (e) {
    if (isPrismaMissingTableError(e)) return null;
    throw e;
  }
}

/**
 * Start / wznowienie egzaminu dla wybranego tracka.
 *
 * Reguła produktowa (v1): co najwyżej jedno aktywne podejście IN_PROGRESS na użytkownika (dowolna ścieżka).
 * — Ten sam track co aktywna sesja → zwracamy istniejący attempt (brak duplikatu).
 * — Inny track niż aktywna sesja → konflikt (409 w API); user musi dokończyć lub wejść w bieżącą sesję.
 */
export type StartOrResumeExamAttemptResult =
  | { ok: true; attempt: CertificationExamAttemptDto }
  | { ok: false; reason: 'other_track_active'; activeAttempt: CertificationExamAttemptDto };

export async function startOrResumeExamAttempt(
  userId: string,
  track: CertificationTrack,
): Promise<StartOrResumeExamAttemptResult | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const anyActive = await repoFindAnyInProgressExamAttempt(userId);
    if (anyActive) {
      const dto = prismaExamAttemptToDto(anyActive);
      if (dto.track === track) {
        return { ok: true, attempt: dto };
      }
      return { ok: false, reason: 'other_track_active', activeAttempt: dto };
    }

    const row = await repoCreateExamAttempt({
      userId,
      track,
      timeLimitMinutes: CERT_EXAM_V1_TIME_LIMIT_MINUTES,
      startedAt: new Date(),
    });
    if (!row) return null;
    return { ok: true, attempt: prismaExamAttemptToDto(row) };
  } catch (e) {
    if (isPrismaMissingTableError(e)) return null;
    throw e;
  }
}

export async function getExamAttemptForUser(
  attemptId: string,
  userId: string,
): Promise<CertificationExamAttemptDto | null> {
  const row = await repoFindExamAttemptByIdForUser(attemptId, userId);
  if (!row) return null;
  return prismaExamAttemptToDto(row);
}

export async function patchExamAnswers(
  attemptId: string,
  userId: string,
  patch: ExamAnswersMap,
): Promise<CertificationExamAttemptDto | null> {
  const row = await repoFindExamAttemptByIdForUser(attemptId, userId);
  if (!row || row.status !== 'IN_PROGRESS') return null;

  const current = prismaExamAttemptToDto(row).answers;
  const merged = mergeAnswers(current, patch);
  const updated = await repoUpdateExamAttemptAnswers(attemptId, userId, merged as InputJsonValue);
  if (!updated || updated.count === 0) return null;

  const next = await repoFindExamAttemptByIdForUser(attemptId, userId);
  return next ? prismaExamAttemptToDto(next) : null;
}

export type SubmitExamAttemptResult =
  | { ok: true; attempt: CertificationExamAttemptDto }
  | {
      ok: false;
      reason: 'not_found' | 'not_in_progress' | 'missing_answers' | 'incomplete_answers' | 'persist_failed';
    };

/**
 * Zakończenie podejścia: placeholderowy scoring, status PASSED | FAILED.
 * Po PASSED — w przyszłości można wywołać wydanie certyfikatu (osobny produkt / reguły dostępu).
 */
export async function submitExamAttempt(
  attemptId: string,
  userId: string,
  answersOverride?: ExamAnswersMap | null,
): Promise<SubmitExamAttemptResult> {
  const row = await repoFindExamAttemptByIdForUser(attemptId, userId);
  if (!row) return { ok: false, reason: 'not_found' };
  if (row.status !== 'IN_PROGRESS') return { ok: false, reason: 'not_in_progress' };

  const dto = prismaExamAttemptToDto(row);
  const answers: ExamAnswersMap | null =
    answersOverride && Object.keys(answersOverride).length > 0
      ? mergeAnswers(dto.answers, answersOverride)
      : dto.answers;

  if (!answers || Object.keys(answers).length === 0) {
    return { ok: false, reason: 'missing_answers' };
  }

  const track = row.track as CertificationTrack;
  const questions = getPlaceholderQuestionsForTrack(track);
  if (!isAnswersCompleteForQuestions(questions, answers)) {
    return { ok: false, reason: 'incomplete_answers' };
  }
  const { scorePercent } = scorePlaceholderAttempt(track, answers);
  const passed = scorePercent >= CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT;
  const status = passed ? 'PASSED' : 'FAILED';
  const submittedAt = new Date();

  const final = await repoSubmitExamAttempt(attemptId, userId, {
    answersJson: answers as InputJsonValue,
    scorePercent,
    passed,
    status,
    submittedAt,
  });
  if (!final) return { ok: false, reason: 'persist_failed' };
  return { ok: true, attempt: prismaExamAttemptToDto(final) };
}

export function getPublicQuestionsForAttempt(dto: CertificationExamAttemptDto): ExamQuestionPublic[] | null {
  if (dto.status !== 'IN_PROGRESS') return null;
  return getPlaceholderQuestionsForTrack(dto.track);
}

/** Klucze odpowiedzi MC — tylko dla zalogowanego admina; nigdy nie zwracaj tego dla zwykłego użytkownika. */
export function getAdminPreviewQuestionsForAttempt(dto: CertificationExamAttemptDto): ExamQuestionAdminPreview[] | null {
  if (dto.status !== 'IN_PROGRESS') return null;
  return getAdminPreviewQuestionsForTrack(dto.track);
}
