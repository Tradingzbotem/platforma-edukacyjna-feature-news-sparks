import 'server-only';

import { buildCertificateViewModel } from '@/lib/certifications/mapper';
import { getCertificateByVerificationToken } from '@/lib/certifications/service';
import type { VerifyResult } from '@/lib/certifications/types';
import { normalizeVerificationToken } from '@/lib/certifications/utils/token';

/**
 * Publiczna weryfikacja po tokenie (bez ujawniania tokenów innych rekordów).
 */
export async function verifyCertificateByToken(rawToken: string): Promise<VerifyResult> {
  const token = normalizeVerificationToken(rawToken);
  if (!token) {
    return { state: 'not_found' };
  }

  const record = await getCertificateByVerificationToken(token);
  if (!record) {
    return { state: 'not_found' };
  }

  const vm = buildCertificateViewModel(record);

  if (record.status === 'REVOKED') {
    return { state: 'revoked', certificate: vm };
  }

  if (record.status === 'ISSUED') {
    return { state: 'valid', certificate: vm };
  }

  // DRAFT — traktuj jak nieważny dla publicznej weryfikacji
  return { state: 'not_found' };
}
