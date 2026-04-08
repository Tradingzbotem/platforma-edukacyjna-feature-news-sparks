/**
 * Krótka etykieta poziomu w hero (np. PRO zamiast PROFICIENT).
 */
export function certificationLevelHeroLabel(level: string): string {
  const u = level.trim().toUpperCase();
  if (u === 'PROFICIENT') return 'PRO';
  if (u === 'DISTINCTION') return 'DISTINCTION';
  if (u === 'FOUNDATION') return 'FOUNDATION';
  return level;
}
