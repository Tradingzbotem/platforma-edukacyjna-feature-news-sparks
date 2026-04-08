import type { CertificationTrack } from '@/lib/certifications/types';

export type PdfLocale = 'pl' | 'en';

/** Para EN (główny) + PL (podpis / mniejszy tekst) — jeden dokument PDF / podgląd UI. */
export type PdfBilingual = {
  en: string;
  pl: string;
};

export type CertificatePdfBilingualCopy = {
  brandSubtle: PdfBilingual;
  prestigeBrand: PdfBilingual;
  mainTitle: PdfBilingual;
  certifiesIntro: PdfBilingual;
  completionLine: PdfBilingual;
  metaScore: PdfBilingual;
  metaLevel: PdfBilingual;
  metaDateIssued: PdfBilingual;
  metaCertificateId: PdfBilingual;
  competencyProfile: PdfBilingual;
  skillFallback: PdfBilingual;
  authSectionTitle: PdfBilingual;
  verifyScan: PdfBilingual;
  footNote: PdfBilingual;
};

const PDF_BILINGUAL: CertificatePdfBilingualCopy = {
  brandSubtle: { en: 'Certification (EDU)', pl: 'Certyfikacja (EDU)' },
  prestigeBrand: { en: 'Official programme credential', pl: 'Oficjalny dokument programu' },
  mainTitle: { en: 'Certificate of Achievement', pl: 'Certyfikat ukończenia' },
  certifiesIntro: { en: 'This certifies that', pl: 'Niniejszym zaświadcza się, że' },
  completionLine: {
    en: 'has successfully completed the certification requirements in',
    pl: 'pomyślnie ukończył(a) wymagania certyfikacyjne w zakresie',
  },
  metaScore: { en: 'Score', pl: 'Wynik' },
  metaLevel: { en: 'Level', pl: 'Poziom' },
  metaDateIssued: { en: 'Date issued', pl: 'Data wystawienia' },
  metaCertificateId: { en: 'Certificate ID', pl: 'ID certyfikatu' },
  competencyProfile: { en: 'Competency profile', pl: 'Profil kompetencji' },
  skillFallback: {
    en: 'A granular competency breakdown was not recorded for this issuance. This credential remains fully verifiable by scanning the QR code.',
    pl: 'Szczegółowy podział kompetencji nie został zapisany przy wystawieniu. Dokument zweryfikujesz, skanując kod QR.',
  },
  authSectionTitle: { en: 'Verification', pl: 'Weryfikacja' },
  verifyScan: {
    en: 'Scan the QR code to verify authenticity',
    pl: 'Zeskanuj kod QR, aby zweryfikować autentyczność',
  },
  footNote: {
    en: 'Issued by FXEDULAB for educational certification. Valid only when confirmed through the official verification flow opened by scanning the QR code.',
    pl: 'Wystawione przez FXEDULAB w ramach certyfikacji edukacyjnej. Ważne po potwierdzeniu w oficjalnym kanale weryfikacji (skan kodu QR).',
  },
};

const TRACK_BILINGUAL: Record<
  CertificationTrack,
  { enBadge: string; plBadge: string; enLine: string; plLine: string }
> = {
  FOREX_FUNDAMENTALS: {
    enBadge: 'FOREX FUNDAMENTALS',
    plBadge: 'PODSTAWY FOREX',
    enLine: 'Forex Fundamentals',
    plLine: 'Podstawy Forex',
  },
  TECHNICAL_ANALYSIS: {
    enBadge: 'TECHNICAL ANALYSIS',
    plBadge: 'ANALIZA TECHNICZNA',
    enLine: 'Technical Analysis',
    plLine: 'Analiza techniczna',
  },
  RISK_MANAGEMENT: {
    enBadge: 'RISK MANAGEMENT',
    plBadge: 'ZARZĄDZANIE RYZYKIEM',
    enLine: 'Risk Management',
    plLine: 'Zarządzanie ryzykiem',
  },
};

export function getCertificatePdfBilingualCopy(): CertificatePdfBilingualCopy {
  return PDF_BILINGUAL;
}

export function getTrackPdfBilingual(track: CertificationTrack): {
  enBadge: string;
  plBadge: string;
  enLine: string;
  plLine: string;
} {
  return TRACK_BILINGUAL[track];
}
