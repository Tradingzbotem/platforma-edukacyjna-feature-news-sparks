/**
 * Mapowanie wyniku procentowego na poziom certyfikacji (MVP — do rozszerzenia przy egzaminie).
 */
export type CertificationLevelCode = 'FOUNDATION' | 'PROFICIENT' | 'DISTINCTION';

const THRESHOLD_PROFICIENT = 70;
const THRESHOLD_DISTINCTION = 90;

export function mapScoreToLevel(scorePercent: number): CertificationLevelCode {
  const s = Math.max(0, Math.min(100, Math.round(scorePercent)));
  if (s >= THRESHOLD_DISTINCTION) return 'DISTINCTION';
  if (s >= THRESHOLD_PROFICIENT) return 'PROFICIENT';
  return 'FOUNDATION';
}

export function levelDisplayName(code: CertificationLevelCode): string {
  switch (code) {
    case 'DISTINCTION':
      return 'Distinction';
    case 'PROFICIENT':
      return 'Proficient';
    default:
      return 'Foundation';
  }
}
