import 'server-only';

import type { CertificationRecord as PrismaCertificationRecord } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/client';

import { getPrisma } from '@/lib/prisma';

export type CreateCertificationRecordData = {
  certificateId: string;
  verificationToken: string;
  fullName: string;
  track: PrismaCertificationRecord['track'];
  scorePercent: number;
  level: string;
  issuedAt: Date | null;
  status: PrismaCertificationRecord['status'];
  skillBreakdownJson?: InputJsonValue | null;
  pdfUrl?: string | null;
  userId?: string | null;
  createdByAdminUserId?: string | null;
  notes?: string | null;
};

export async function repoCreateCertification(
  data: CreateCertificationRecordData,
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationRecord.create({ data });
}

export async function repoFindCertificationById(
  id: string,
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationRecord.findUnique({ where: { id } });
}

export async function repoFindCertificationByVerificationToken(
  token: string,
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationRecord.findUnique({ where: { verificationToken: token } });
}

export async function repoListCertifications(): Promise<PrismaCertificationRecord[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.certificationRecord.findMany({ orderBy: { createdAt: 'desc' } });
}

/** Jeden aktywny certyfikat na użytkownika (produkt 1:1). */
export async function repoFindIssuedCertificateForUser(
  userId: string,
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationRecord.findFirst({
    where: { userId, status: 'ISSUED' },
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

/** Wszystkie wydane certyfikaty użytkownika (osobny rekord na ścieżkę). */
export async function repoFindAllIssuedCertificatesForUser(
  userId: string,
): Promise<PrismaCertificationRecord[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.certificationRecord.findMany({
    where: { userId, status: 'ISSUED' },
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

/** Wydany certyfikat dla użytkownika na danej ścieżce (brak duplikatu per track). */
export async function repoFindIssuedCertificateForUserAndTrack(
  userId: string,
  track: PrismaCertificationRecord['track'],
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.certificationRecord.findFirst({
    where: { userId, status: 'ISSUED', track },
    orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

/** Ustawia userId tylko gdy rekord istnieje i nie ma jeszcze przypisania. */
export async function repoAssignUserToCertificationIfUnassigned(
  id: string,
  userId: string,
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  const cur = await prisma.certificationRecord.findUnique({ where: { id } });
  if (!cur || cur.userId) return null;
  try {
    return await prisma.certificationRecord.update({
      where: { id },
      data: { userId },
    });
  } catch {
    return null;
  }
}

export async function repoUpdateCertificationStatus(
  id: string,
  status: PrismaCertificationRecord['status'],
): Promise<PrismaCertificationRecord | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.certificationRecord.update({
      where: { id },
      data: { status },
    });
  } catch {
    return null;
  }
}

export async function repoDeleteCertification(id: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    await prisma.certificationRecord.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
