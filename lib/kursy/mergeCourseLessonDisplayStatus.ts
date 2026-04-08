import {
  LESSON_PROGRESS_DONE,
  LESSON_PROGRESS_VISITED,
  readLessonProgressValue,
} from "@/lib/lessonProgressStorage";

export type CourseLessonCardStatus = "completed" | "inProgress" | undefined;

/**
 * Spójny stan kafelka lekcji: pierwszeństwo ukończenia z DB (jak na /kursy), potem localStorage.
 */
export function mergeCourseLessonDisplayStatus(
  course: string,
  lessonSlug: string,
  userId: string | null,
  dbLessons: Record<string, { done: boolean }> | null | undefined
): CourseLessonCardStatus {
  let fromLs: CourseLessonCardStatus;
  try {
    if (typeof window === "undefined") {
      fromLs = undefined;
    } else {
      const v = readLessonProgressValue(localStorage, course, lessonSlug, userId);
      if (v === LESSON_PROGRESS_DONE) fromLs = "completed";
      else if (v === LESSON_PROGRESS_VISITED) fromLs = "inProgress";
      else fromLs = undefined;
    }
  } catch {
    fromLs = undefined;
  }

  const row = dbLessons?.[lessonSlug];
  if (row?.done) return "completed";
  if (fromLs === "completed") return "completed";
  if (row && !row.done) return "inProgress";
  return fromLs;
}
