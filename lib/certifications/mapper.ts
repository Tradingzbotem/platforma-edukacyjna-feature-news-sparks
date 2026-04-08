import type { CertificationRecord as PrismaCertificationRecord } from '@prisma/client';

import type { CertificationRecordDto, CertificationViewModel } from '@/lib/certifications/types';

function toIso(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString();
}

export function prismaRecordToDto(row: PrismaCertificationRecord): CertificationRecordDto {
  return {
    id: row.id,
    certificateId: row.certificateId,
    verificationToken: row.verificationToken,
    fullName: row.fullName,
    track: row.track,
    scorePercent: row.scorePercent,
    level: row.level,
    issuedAt: toIso(row.issuedAt),
    status: row.status,
    skillBreakdownJson: row.skillBreakdownJson ?? null,
    pdfUrl: row.pdfUrl ?? null,
    userId: row.userId ?? null,
    createdByAdminUserId: row.createdByAdminUserId ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function buildCertificateViewModel(record: CertificationRecordDto): CertificationViewModel {
  return { ...record };
}
