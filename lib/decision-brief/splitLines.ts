/** Jedna linia = jeden punkt listy (puste pomijane). */
export function splitBriefLines(raw: string | null | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
