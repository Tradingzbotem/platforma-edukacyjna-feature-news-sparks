/**
 * Przekształcenie tytułu bloku na etykietę „Blok n” + krótszy nagłówek (np. bez prefiksu „Moduł 2:”).
 */
export function parseExamBlockTitle(raw: string, blockIndex: number): {
  blockLabel: string;
  displayTitle: string;
} {
  const blockLabel = `Blok ${blockIndex}`;
  const stripped = raw.replace(/^\s*moduł\s*\d+\s*:\s*/i, "").trim();
  return { blockLabel, displayTitle: stripped || raw };
}
