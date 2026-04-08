export type BriefSensitivity = 'wysoka' | 'średnia' | 'niska';

export function normalizeBriefSensitivity(raw: string | null | undefined): BriefSensitivity {
  const s = (raw || '').trim().toLowerCase();
  if (s === 'wysoka' || s === 'średnia' || s === 'niska') return s as BriefSensitivity;
  return 'średnia';
}
