import {
  LESSON_PROGRESS_DONE,
  LESSON_PROGRESS_VISITED,
  writeLessonProgressValue,
} from "@/lib/lessonProgressStorage";

/** Wywołuj wyłącznie po stronie klienta (localStorage + fetch). */
export function pushPodstawyLessonProgress(
  lessonSlug: string,
  completed: boolean,
  userId: string | null
) {
  if (typeof window === "undefined") return;
  try {
    writeLessonProgressValue(
      localStorage,
      "podstawy",
      lessonSlug,
      userId,
      completed ? LESSON_PROGRESS_DONE : LESSON_PROGRESS_VISITED
    );
  } catch {
    // ignore
  }
  void fetch("/api/progress/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course: "podstawy",
      lessonId: lessonSlug,
      done: completed,
    }),
  });
}
