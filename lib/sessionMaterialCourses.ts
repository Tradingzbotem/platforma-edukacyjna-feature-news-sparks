import { ANALIZA_LEKCJE } from "@/app/kursy/materialy/analiza-techniczna/lessons";
import { FORMACJE_LEKCJE } from "@/app/kursy/materialy/formacje-swiecowe/lessons";
import { KALENDARZ_EKONOMICZNY_LEKCJE } from "@/app/kursy/materialy/kalendarz-ekonomiczny/lessons";
import { PSYCHOLOGIA_LEKCJE } from "@/app/kursy/materialy/psychologia-inwestowania/lessons";

/** Kursy materiałów dodatkowych zapisujące postęp lekcji w `session.courseProgress`. */
const LESSON_SLUGS_BY_COURSE: Record<string, readonly string[]> = {
  "analiza-techniczna": ANALIZA_LEKCJE.map((l) => l.slug),
  "formacje-swiecowe": FORMACJE_LEKCJE.map((l) => l.slug),
  "psychologia-inwestowania": PSYCHOLOGIA_LEKCJE.map((l) => l.slug),
  "kalendarz-ekonomiczny": KALENDARZ_EKONOMICZNY_LEKCJE.map((l) => l.slug),
};

export function isSessionMaterialCourse(courseId: string): boolean {
  return Object.prototype.hasOwnProperty.call(LESSON_SLUGS_BY_COURSE, courseId);
}

export function isValidSessionMaterialLesson(courseId: string, lessonSlug: string): boolean {
  const slugs = LESSON_SLUGS_BY_COURSE[courseId];
  return slugs ? slugs.includes(lessonSlug) : false;
}
