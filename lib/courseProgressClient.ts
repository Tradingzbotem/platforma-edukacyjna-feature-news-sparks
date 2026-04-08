/** Klient HTTP — postęp kursu w iron-session (API /api/course-progress). */

export const ANALIZA_TECHNICZNA_COURSE_ID = "analiza-techniczna";
export const FORMACJE_SWIECOWE_COURSE_ID = "formacje-swiecowe";
export const PSYCHOLOGIA_INWESTOWANIA_COURSE_ID = "psychologia-inwestowania";
export const KALENDARZ_EKONOMICZNY_COURSE_ID = "kalendarz-ekonomiczny";

const PROGRESS_CHANGED = "course-progress-changed";

export type CourseProgressFetchResult = {
  progress: Record<string, boolean>;
  /** false przy 401 — brak sesji / niezalogowany */
  authenticated: boolean;
};

export async function fetchCourseProgress(courseId: string): Promise<CourseProgressFetchResult> {
  const res = await fetch(
    `/api/course-progress?courseId=${encodeURIComponent(courseId)}`,
    { credentials: "include", cache: "no-store" }
  );
  if (res.status === 401) {
    return { progress: {}, authenticated: false };
  }
  if (!res.ok) {
    return { progress: {}, authenticated: true };
  }
  try {
    const data = (await res.json()) as { progress?: Record<string, boolean> };
    const progress =
      data.progress && typeof data.progress === "object" && !Array.isArray(data.progress)
        ? data.progress
        : {};
    return { progress, authenticated: true };
  } catch {
    return { progress: {}, authenticated: true };
  }
}

/** Zapisuje lekcję jako ukończoną w sesji. Zwraca false przy błędzie lub 401. */
export async function markLessonDone(courseId: string, lessonSlug: string): Promise<boolean> {
  const res = await fetch("/api/course-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ courseId, lessonSlug }),
  });
  if (!res.ok) return false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_CHANGED));
  }
  return true;
}

export function subscribeCourseProgressChanged(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROGRESS_CHANGED, handler);
  return () => window.removeEventListener(PROGRESS_CHANGED, handler);
}
