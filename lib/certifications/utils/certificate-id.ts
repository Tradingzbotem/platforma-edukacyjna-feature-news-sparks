import { randomBytes } from 'crypto';

import { CERTIFICATE_ID_PREFIX } from '@/lib/certifications/constants';

/**
 * Publiczny, unikalny identyfikator certyfikatu (nie mylić z wewnętrznym id rekordu Prisma).
 */
export function generateCertificateId(): string {
  const part = randomBytes(6).toString('hex').toUpperCase();
  return `${CERTIFICATE_ID_PREFIX}-${part}`;
}

export function isLikelyCertificateId(value: string): boolean {
  const v = value.trim();
  return v.length >= 12 && v.startsWith(CERTIFICATE_ID_PREFIX);
}
