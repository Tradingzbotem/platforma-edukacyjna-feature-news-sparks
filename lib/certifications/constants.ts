import type { CertificationTrack } from '@/lib/certifications/types';

/** Prefiks publicznego ID certyfikatu (warstwa prezentacji / PDF). */
export const CERTIFICATE_ID_PREFIX = 'FXEDU-EDU';

export const CERTIFICATION_TRACK_LABELS: Record<CertificationTrack, string> = {
  FOREX_FUNDAMENTALS: 'Forex Fundamentals',
  TECHNICAL_ANALYSIS: 'Technical Analysis',
  RISK_MANAGEMENT: 'Risk Management',
};

/** Etykiety ścieżki w UI po polsku (strona produktu / konto). */
export const CERTIFICATION_TRACK_LABELS_PL: Record<CertificationTrack, string> = {
  FOREX_FUNDAMENTALS: 'Forex — fundamenty rynku',
  TECHNICAL_ANALYSIS: 'Analiza techniczna',
  RISK_MANAGEMENT: 'Zarządzanie ryzykiem',
};
