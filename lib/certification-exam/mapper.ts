import type { CertificationExamAttempt as PrismaExamAttempt } from '@prisma/client';

import { normalizeAnswersMap } from '@/lib/certification-exam/answersCodec';
import type { CertificationExamAttemptDto, ExamAnswersMap } from '@/lib/certification-exam/types';

function parseAnswersJson(raw: unknown): ExamAnswersMap | null {
  return normalizeAnswersMap(raw);
}

export function prismaExamAttemptToDto(row: PrismaExamAttempt): CertificationExamAttemptDto {
  return {
    id: row.id,
    userId: row.userId,
    track: row.track as CertificationExamAttemptDto['track'],
    status: row.status as CertificationExamAttemptDto['status'],
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    scorePercent: row.scorePercent ?? null,
    passed: row.passed ?? null,
    answers: parseAnswersJson(row.answersJson),
    timeLimitMinutes: row.timeLimitMinutes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
