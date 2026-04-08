/**
 * Klientowy podział stanu quizu (/quizy):
 * - postęp roboczy: fxedu.quiz.{slug} (SavedState w QuizRunner)
 * - wynik po „Zakończ”: fxedu:quiz:completed:{slug}
 */

export type QuizCompletedRecordV1 = {
  v: 1;
  slug: string;
  status: "completed";
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  /** Odpowiedzi w kolejności bieżącej sesji (indeksy MCQ lub tekst scenariusza). */
  answersSnapshot: Array<number | string | null>;
  incorrectIds: string[];
};

const completedKey = (slug: string) => `fxedu:quiz:completed:${slug}`;

export const QUIZ_LEGACY_STATE_KEY = (slug: string) => `fxedu.quiz.${slug}`;
export const QUIZ_SESSION_KEY = (slug: string) => `fxedu:quiz:session:${slug}`;
export const QUIZ_PROGRESS_KEY = (slug: string) => `fxedu:quiz:progress:${slug}`;

export function readQuizCompleted(slug: string): QuizCompletedRecordV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(completedKey(slug));
    if (!raw) return null;
    const p = JSON.parse(raw) as QuizCompletedRecordV1;
    if (!p || p.v !== 1 || p.status !== "completed" || p.slug !== slug) return null;
    return p;
  } catch {
    return null;
  }
}

export function writeQuizCompleted(
  slug: string,
  rec: {
    score: number;
    total: number;
    percentage: number;
    completedAt: string;
    answersSnapshot: Array<number | string | null>;
    incorrectIds: string[];
  }
) {
  if (typeof window === "undefined") return;
  const full: QuizCompletedRecordV1 = {
    v: 1,
    slug,
    status: "completed",
    score: rec.score,
    total: rec.total,
    percentage: rec.percentage,
    completedAt: rec.completedAt,
    answersSnapshot: rec.answersSnapshot,
    incorrectIds: rec.incorrectIds,
  };
  try {
    localStorage.setItem(completedKey(slug), JSON.stringify(full));
  } catch {}
}

export function clearQuizCompleted(slug: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(completedKey(slug));
  } catch {}
}

/** Usuwa zapis roboczy (pytania, sesja, pasek postępu na liście). */
export function clearQuizInProgressStorage(slug: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(QUIZ_LEGACY_STATE_KEY(slug));
    localStorage.removeItem(QUIZ_SESSION_KEY(slug));
    localStorage.removeItem(QUIZ_PROGRESS_KEY(slug));
  } catch {}
}

type LegacySaved = {
  checked?: boolean;
  idx?: number;
  answers?: Array<number | string | null>;
};

export function readQuizCardState(slug: string): {
  completed: QuizCompletedRecordV1 | null;
  inProgress: boolean;
  reviewPending: boolean;
} {
  const completed = readQuizCompleted(slug);
  let saved: LegacySaved | null = null;
  try {
    const r = localStorage.getItem(QUIZ_LEGACY_STATE_KEY(slug));
    if (r) saved = JSON.parse(r) as LegacySaved;
  } catch {}
  const reviewPending = !!(saved && saved.checked === true && !completed);
  const hasAnswers = !!(saved?.answers && saved.answers.some((a) => a !== null));
  const inProgress = !!(saved && saved.checked !== true && (hasAnswers || (saved.idx ?? 0) > 0));
  return { completed, inProgress, reviewPending };
}
