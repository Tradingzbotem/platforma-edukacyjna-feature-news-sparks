import 'server-only';

import type { InputJsonValue } from '@prisma/client/runtime/client';

import type { CertificationExamAttemptStatus } from '@/lib/certification-exam/types';
import { getPrisma } from '@/lib/prisma';
import type { CertificationTrack } from '@/lib/certifications/types';

export async function repoFindExamAttemptByIdForUser(attemptId: string, userId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationExamAttempt.findFirst({
    where: { id: attemptId, userId },
  });
}

export async function repoFindInProgressExamAttempt(userId: string, track: CertificationTrack) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationExamAttempt.findFirst({
    where: { userId, track, status: 'IN_PROGRESS' },
    orderBy: { createdAt: 'desc' },
  });
}

/** Ostatnie aktywne podejście użytkownika (dowolna ścieżka) — jedna sesja na wejście w moduł. */
export async function repoFindAnyInProgressExamAttempt(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationExamAttempt.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function repoCreateExamAttempt(data: {
  userId: string;
  track: CertificationTrack;
  timeLimitMinutes: number;
  startedAt: Date;
}) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationExamAttempt.create({
    data: {
      userId: data.userId,
      track: data.track,
      status: 'IN_PROGRESS',
      startedAt: data.startedAt,
      timeLimitMinutes: data.timeLimitMinutes,
    },
  });
}

export async function repoUpdateExamAttemptAnswers(
  attemptId: string,
  userId: string,
  answersJson: InputJsonValue,
) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationExamAttempt.updateMany({
    where: { id: attemptId, userId, status: 'IN_PROGRESS' },
    data: { answersJson },
  });
}

export async function repoSubmitExamAttempt(
  attemptId: string,
  userId: string,
  data: {
    answersJson: InputJsonValue;
    scorePercent: number;
    passed: boolean;
    status: 'PASSED' | 'FAILED';
    submittedAt: Date;
  },
) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const res = await prisma.certificationExamAttempt.updateMany({
    where: { id: attemptId, userId, status: 'IN_PROGRESS' },
    data: {
      answersJson: data.answersJson,
      scorePercent: data.scorePercent,
      passed: data.passed,
      status: data.status,
      submittedAt: data.submittedAt,
    },
  });
  if (res.count === 0) return null;
  return repoFindExamAttemptByIdForUser(attemptId, userId);
}

export async function repoListExamAttemptsForAdmin(args: {
  status?: CertificationExamAttemptStatus;
  track?: CertificationTrack;
  limit?: number;
}) {
  const prisma = getPrisma();
  if (!prisma) return [];
  const take = Math.min(Math.max(args.limit ?? 400, 1), 500);
  return prisma.certificationExamAttempt.findMany({
    where: {
      ...(args.status ? { status: args.status } : {}),
      ...(args.track ? { track: args.track } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take,
  });
}

export async function repoDeleteExamAttemptById(attemptId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;
  const res = await prisma.certificationExamAttempt.deleteMany({
    where: { id: attemptId },
  });
  return res.count > 0;
}

/** Statystyki na landing egzaminu (wszystkie ścieżki użytkownika). */
export async function repoGetUserExamLandingStats(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const [totalAttempts, activeAttempt, lastFinished] = await Promise.all([
    prisma.certificationExamAttempt.count({ where: { userId } }),
    prisma.certificationExamAttempt.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.certificationExamAttempt.findFirst({
      where: { userId, status: { in: ['PASSED', 'FAILED'] } },
      orderBy: { submittedAt: 'desc' },
    }),
  ]);

  return {
    totalAttempts,
    hasActiveAttempt: Boolean(activeAttempt),
    lastFinished,
  };
}
