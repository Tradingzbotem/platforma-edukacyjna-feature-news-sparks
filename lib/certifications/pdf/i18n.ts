import 'server-only';

export type { PdfLocale, PdfBilingual, CertificatePdfBilingualCopy } from '@/lib/certifications/pdf/bilingualCopy';
export { getCertificatePdfBilingualCopy, getTrackPdfBilingual } from '@/lib/certifications/pdf/bilingualCopy';

import type { PdfLocale } from '@/lib/certifications/pdf/bilingualCopy';

export function normalizePdfLocale(raw: string | undefined | null): PdfLocale {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'en') return 'en';
  return 'pl';
}
