import 'server-only';

import type { InputJsonValue } from '@prisma/client/runtime/client';

import { findUserById } from '@/lib/db';
import { generateCertificateId } from '@/lib/certifications/utils/certificate-id';
import { mapScoreToLevel } from '@/lib/certifications/utils/level';
import { generateVerificationToken } from '@/lib/certifications/utils/token';
import { prismaRecordToDto } from '@/lib/certifications/mapper';
import {
  repoAssignUserToCertificationIfUnassigned,
  repoCreateCertification,
  repoDeleteCertification,
  repoFindCertificationById,
  repoFindCertificationByVerificationToken,
  repoFindAllIssuedCertificatesForUser,
  repoFindIssuedCertificateForUser,
  repoFindIssuedCertificateForUserAndTrack,
  repoListCertifications,
  repoUpdateCertificationStatus,
} from '@/lib/certifications/repository';
import type { CertificationRecordDto, IssueCertificateInput } from '@/lib/certifications/types';
import { getExamAttemptForUser } from '@/lib/certification-exam/service';

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function issueCertificate(data: IssueCertificateInput): Promise<CertificationRecordDto | null> {
  const scorePercent = clampScore(data.scorePercent);
  const level = mapScoreToLevel(scorePercent);
  const now = new Date();

  const skillBreakdownJson =
    data.skillBreakdownJson === undefined || data.skillBreakdownJson === null
      ? null
      : data.skillBreakdownJson;

  const row = await repoCreateCertification({
    certificateId: generateCertificateId(),
    verificationToken: generateVerificationToken(),
    fullName: data.fullName.trim(),
    track: data.track,
    scorePercent,
    level,
    issuedAt: now,
    status: 'ISSUED',
    skillBreakdownJson: skillBreakdownJson as InputJsonValue | null,
    userId: data.userId ?? null,
    createdByAdminUserId: data.createdByAdminUserId ?? null,
    notes: data.notes?.trim() ? data.notes.trim() : null,
  });

  if (!row) return null;
  return prismaRecordToDto(row);
}

export async function getCertificateById(id: string): Promise<CertificationRecordDto | null> {
  const row = await repoFindCertificationById(id);
  if (!row) return null;
  return prismaRecordToDto(row);
}

export async function getCertificateByVerificationToken(
  token: string,
): Promise<CertificationRecordDto | null> {
  const row = await repoFindCertificationByVerificationToken(token);
  if (!row) return null;
  return prismaRecordToDto(row);
}

export async function getIssuedCertificateForUser(userId: string): Promise<CertificationRecordDto | null> {
  const row = await repoFindIssuedCertificateForUser(userId);
  if (!row) return null;
  return prismaRecordToDto(row);
}

export async function getIssuedCertificatesForUser(userId: string): Promise<CertificationRecordDto[]> {
  const rows = await repoFindAllIssuedCertificatesForUser(userId);
  return rows.map(prismaRecordToDto);
}

export async function getIssuedCertificateForUserAndTrack(
  userId: string,
  track: IssueCertificateInput['track'],
): Promise<CertificationRecordDto | null> {
  const row = await repoFindIssuedCertificateForUserAndTrack(userId, track);
  if (!row) return null;
  return prismaRecordToDto(row);
}

function isPrismaUniqueViolation(e: unknown): boolean {
  return (e as { code?: string })?.code === 'P2002';
}

function displayNameFromUserEmail(email: string | undefined): string {
  const emailLocal = email?.includes('@') ? email.split('@')[0]?.trim() : '';
  return emailLocal && emailLocal.length > 0 ? emailLocal : 'Użytkownik FXEDULAB';
}

export type EnsureCertificateFromExamResult =
  | { ok: true; certificate: CertificationRecordDto; created: boolean }
  | {
      ok: false;
      error:
        | 'unauthorized'
        | 'not_found'
        | 'not_terminal'
        | 'not_passed'
        | 'db'
        | 'user_profile';
    };

/**
 * Idempotentne wydanie certyfikatu po zaliczonym egzaminie: jeden ISSUED na (user, track).
 * Nie wywołuj automatycznie po submit — tylko z jawnego żądania użytkownika.
 */
export async function ensureCertificateFromPassedExamAttempt(
  userId: string,
  attemptId: string,
): Promise<EnsureCertificateFromExamResult> {
  const attempt = await getExamAttemptForUser(attemptId, userId);
  if (!attempt) return { ok: false, error: 'not_found' };

  if (attempt.status === 'IN_PROGRESS' || attempt.status === 'NOT_STARTED') {
    return { ok: false, error: 'not_terminal' };
  }
  if (attempt.passed !== true) {
    return { ok: false, error: 'not_passed' };
  }

  const existing = await repoFindIssuedCertificateForUserAndTrack(userId, attempt.track);
  if (existing) {
    return { ok: true, certificate: prismaRecordToDto(existing), created: false };
  }

  const profile = await findUserById(userId).catch(() => null);
  if (!profile) return { ok: false, error: 'user_profile' };

  const fullNameRaw = profile.name?.trim();
  const fullName =
    fullNameRaw && fullNameRaw.length > 0 ? fullNameRaw : displayNameFromUserEmail(profile.email ?? undefined);

  const scorePercent = attempt.scorePercent ?? 0;

  try {
    const row = await repoCreateCertification({
      certificateId: generateCertificateId(),
      verificationToken: generateVerificationToken(),
      fullName,
      track: attempt.track,
      scorePercent: clampScore(scorePercent),
      level: mapScoreToLevel(clampScore(scorePercent)),
      issuedAt: new Date(),
      status: 'ISSUED',
      skillBreakdownJson: null,
      userId,
      createdByAdminUserId: null,
      notes: `Wydanie z egzaminu (attempt ${attemptId})`,
    });
    if (!row) return { ok: false, error: 'db' };
    return { ok: true, certificate: prismaRecordToDto(row), created: true };
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      const again = await repoFindIssuedCertificateForUserAndTrack(userId, attempt.track);
      if (again) return { ok: true, certificate: prismaRecordToDto(again), created: false };
    }
    console.error('[ensureCertificateFromPassedExamAttempt]', e);
    return { ok: false, error: 'db' };
  }
}

export async function listCertificates(): Promise<CertificationRecordDto[]> {
  const rows = await repoListCertifications();
  return rows.map(prismaRecordToDto);
}

export async function revokeCertificate(id: string): Promise<CertificationRecordDto | null> {
  const row = await repoUpdateCertificationStatus(id, 'REVOKED');
  if (!row) return null;
  return prismaRecordToDto(row);
}

export async function deleteCertificate(id: string): Promise<boolean> {
  return repoDeleteCertification(id);
}

export async function assignCertificateOwnerIfUnassigned(
  certificationRecordId: string,
  userId: string,
): Promise<CertificationRecordDto | null> {
  const row = await repoAssignUserToCertificationIfUnassigned(certificationRecordId, userId);
  if (!row) return null;
  return prismaRecordToDto(row);
}
