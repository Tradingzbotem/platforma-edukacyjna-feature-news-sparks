import type { CertificationTrack } from '@/lib/certifications/types';

/**
 * Ścieżki dostępne w UI egzaminu — zgodne z enum certyfikatu / Prisma.
 * Domyślny wybór w kliencie: pierwsza pozycja (FOREX_FUNDAMENTALS).
 */
export const CERT_EXAM_SELECTABLE_TRACKS = [
  'FOREX_FUNDAMENTALS',
  'TECHNICAL_ANALYSIS',
  'RISK_MANAGEMENT',
] as const satisfies readonly CertificationTrack[];

export function isSelectableExamTrack(value: string): value is CertificationTrack {
  return (CERT_EXAM_SELECTABLE_TRACKS as readonly string[]).includes(value);
}

/** @deprecated Użyj CERT_EXAM_SELECTABLE_TRACKS; zostawione dla ewentualnych importów legacy. */
export const CERT_EXAM_V1_ACTIVE_TRACK: CertificationTrack = 'FOREX_FUNDAMENTALS';

/** Limit czasu (minuty) — docelowo egzekwowany po stronie serwera; v1: informacja + placeholder UI. */
export const CERT_EXAM_V1_TIME_LIMIT_MINUTES = 90;

/**
 * Próg zaliczenia dla placeholderowego scoringu — nie jest to finalna logika produkcyjna.
 * Po PASSED można w przyszłości podpiąć wydanie certyfikatu (osobny krok).
 */
export const CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT = 70;
