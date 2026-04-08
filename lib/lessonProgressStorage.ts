/** Lista ukończonych lekcji Podstawy (gość / legacy). */
export const PODSTAWY_DONE_LIST_KEY = "course:podstawy:done";

/**
 * Klucz postępu lekcji w localStorage.
 * Dla zalogowanego użytkownika zawsze `progress:u:{userId}:…` — wtedy ProgressSync nie „przenosi”
 * postępu między kontami na tym samym urządzeniu.
 */
export function lessonProgressStorageKey(course: string, lessonId: string, userId?: string | null) {
  if (userId) return `progress:u:${userId}:${course}:${lessonId}`;
  return `progress:${course}:${lessonId}`;
}

export function podstawyDoneListStorageKey(userId?: string | null) {
  if (userId) return `${PODSTAWY_DONE_LIST_KEY}:u:${userId}`;
  return PODSTAWY_DONE_LIST_KEY;
}

export function readLessonProgressValue(
  ls: Storage,
  course: string,
  lessonId: string,
  userId: string | null
): string | null {
  if (userId) {
    const scoped = ls.getItem(lessonProgressStorageKey(course, lessonId, userId));
    if (scoped !== null) return scoped;
    return ls.getItem(lessonProgressStorageKey(course, lessonId, null));
  }
  return ls.getItem(lessonProgressStorageKey(course, lessonId, null));
}

export function writeLessonProgressValue(
  ls: Storage,
  course: string,
  lessonId: string,
  userId: string | null,
  value: string
) {
  ls.setItem(lessonProgressStorageKey(course, lessonId, userId), value);
  if (userId) {
    try {
      ls.removeItem(lessonProgressStorageKey(course, lessonId, null));
    } catch {
      /* ignore */
    }
  }
}

/** Odczyt listy slugów ukończonych lekcji Podstawy (scoped ∪ legacy przy zalogowanym). */
export function readPodstawyDoneSlugSet(ls: Storage, userId: string | null): Set<string> {
  const out = new Set<string>();
  const merge = (raw: string | null) => {
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return;
      for (const x of arr) {
        if (typeof x === "string" && x.length) out.add(x);
      }
    } catch {
      /* ignore */
    }
  };
  try {
    if (userId) {
      merge(ls.getItem(podstawyDoneListStorageKey(userId)));
      merge(ls.getItem(podstawyDoneListStorageKey(null)));
      return out;
    }
    merge(ls.getItem(podstawyDoneListStorageKey(null)));
  } catch {
    /* ignore */
  }
  return out;
}

export function writePodstawyDoneSlugArray(ls: Storage, userId: string | null, slugs: string[]) {
  const key = podstawyDoneListStorageKey(userId);
  ls.setItem(key, JSON.stringify(slugs));
  if (userId) {
    try {
      ls.removeItem(podstawyDoneListStorageKey(null));
    } catch {
      /* ignore */
    }
  }
}

/** W trakcie / rozpoczęte — sync jako lesson_progress.done = false */
export const LESSON_PROGRESS_VISITED = "0";
/** Ukończone — sync jako lesson_progress.done = true */
export const LESSON_PROGRESS_DONE = "1";
