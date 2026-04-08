/**
 * Postęp ścieżek egzaminowych zapisywany w localStorage przez strony
 * `/kursy/egzaminy/*` — spójne z PROGRESS_KEY w tych plikach.
 */
export const EXAM_TRACK_KURSY_LOCAL = {
  przewodnik: { storageKey: "course:egz:przewodnik:done", totalBlocks: 6 },
  knf: { storageKey: "course:egz:knf:done", totalBlocks: 6 },
  cysec: { storageKey: "course:egz:cysec:done", totalBlocks: 4 },
} as const;
