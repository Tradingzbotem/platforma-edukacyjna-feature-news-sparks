import 'server-only';

import { findUsersBasicByIds } from '@/lib/db';
import { prismaExamAttemptToDto } from '@/lib/certification-exam/mapper';
import { repoDeleteExamAttemptById, repoListExamAttemptsForAdmin } from '@/lib/certification-exam/repository';
import type { AdminExamAttemptRow } from '@/lib/certification-exam/types';

function isPrismaMissingTableError(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  const msg = String((e as Error)?.message ?? '').toLowerCase();
  return code === 'P2021' || msg.includes('does not exist') || msg.includes('no such table');
}

/** Ostatnie podejścia do egzaminu certyfikacyjnego (admin): bez treści odpowiedzi. */
export async function listAdminExamAttemptRows(): Promise<AdminExamAttemptRow[]> {
  try {
    const rows = await repoListExamAttemptsForAdmin({});
    if (rows.length === 0) return [];
    const userMap = await findUsersBasicByIds(rows.map((r) => r.userId));
    return rows.map((row) => {
      const dto = prismaExamAttemptToDto(row);
      const u = userMap.get(row.userId);
      return {
        id: dto.id,
        userId: dto.userId,
        userEmail: u?.email ?? null,
        userName: u?.name ?? null,
        track: dto.track,
        status: dto.status,
        startedAt: dto.startedAt,
        submittedAt: dto.submittedAt,
        scorePercent: dto.scorePercent,
        passed: dto.passed,
        timeLimitMinutes: dto.timeLimitMinutes,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      };
    });
  } catch (e) {
    if (isPrismaMissingTableError(e)) return [];
    throw e;
  }
}

export async function deleteExamAttemptAsAdmin(attemptId: string): Promise<boolean> {
  const id = attemptId.trim();
  if (!id) return false;
  try {
    return await repoDeleteExamAttemptById(id);
  } catch (e) {
    if (isPrismaMissingTableError(e)) return false;
    throw e;
  }
}
