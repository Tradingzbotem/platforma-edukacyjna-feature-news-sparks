/**
 * Ścieżki do treści lekcji — statyczne moduły mają `/kursy/{slug}/lekcja-n`,
 * rejestr LESSONS pod `/kursy/{slug}/lekcje/{id}`.
 */
const STATIC_LEKCJA_SLUG_COURSES = new Set([
  "podstawy",
  "forex",
  "cfd",
  "zaawansowane",
]);

export function lessonPathForCourse(courseSlug: string, lessonId: string): string {
  if (STATIC_LEKCJA_SLUG_COURSES.has(courseSlug)) {
    return `/kursy/${courseSlug}/${lessonId}`;
  }
  return `/kursy/${courseSlug}/lekcje/${lessonId}`;
}
