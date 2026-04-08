import "server-only";

import type { KursyModuleProgress } from "@/lib/kursyModuleProgressTypes";
import { ANALIZA_LEKCJE } from "@/app/kursy/materialy/analiza-techniczna/lessons";
import { FORMACJE_LEKCJE } from "@/app/kursy/materialy/formacje-swiecowe/lessons";
import { KALENDARZ_EKONOMICZNY_LEKCJE } from "@/app/kursy/materialy/kalendarz-ekonomiczny/lessons";
import { PSYCHOLOGIA_LEKCJE } from "@/app/kursy/materialy/psychologia-inwestowania/lessons";
import { COURSES } from "@/data/courses";
import {
  getLessonProgressRowsForMainCourses,
  getLessonProgressRowsForRegulacje,
  type LessonProgressRow,
} from "@/lib/db";
import { lessonPathForCourse } from "@/lib/kursyLessonPaths";
/** Główne moduły z sekcji „Główne moduły” na /kursy — muszą istnieć w COURSES. */
export const KURSY_MAIN_SLUGS = ["podstawy", "forex", "cfd", "zaawansowane"] as const;

export type KursyMainSlug = (typeof KURSY_MAIN_SLUGS)[number];

export type { KursyModuleProgress };

/** URL lekcji — zgodny z `lessonPathForCourse` (statyczne moduły vs /lekcje/). */
export function lessonHrefForCourse(courseSlug: string, lessonId: string): string {
  return lessonPathForCourse(courseSlug, lessonId);
}

/**
 * Agreguje postęp z lesson_progress dla zalogowanego użytkownika.
 * Bez userId zwraca mapę z zerami (np. awaria sesji — strona nadal się wyświetli).
 *
 * Reguły kart /kursy (zgodne z licznikiem „X / Y lekcji”, który liczy wyłącznie ukończenia):
 * - **Nie rozpoczęto** — `doneLessons === 0` (wizyty bez ukończenia nie zmieniają etykiety).
 * - **W trakcie** — `0 < doneLessons < total`.
 * - **Ukończono** — `doneLessons >= total`.
 * - **Kontynuuj** — etykieta na podstawie pierwszej nieukończonej lekcji; **link** zawsze na spis lekcji `/kursy/{slug}` (podstawy, forex, cfd, zaawansowane).
 * - **doneLessons** — tylko lekcje z `done=true` (licznik X/Y na karcie).
 */
/** Agregacja postępu jednego kursu z listy wierszy `lesson_progress`. */
function kursyModuleProgressFromRows(
  slug: string,
  rows: LessonProgressRow[],
  actionHref: string
): KursyModuleProgress | null {
  const course = COURSES[slug];
  if (!course) return null;

  const lessonIds = course.lessons.map((l) => l.id);
  const total = lessonIds.length;
  if (!lessonIds[0]) return null;

  const doneMap = new Map<string, { done: boolean; updated_at: Date }>();
  for (const r of rows) {
    if (r.course !== slug) continue;
    const prev = doneMap.get(r.lesson_id);
    const t = r.updated_at;
    if (!prev || t >= prev.updated_at) {
      doneMap.set(r.lesson_id, { done: r.done, updated_at: t });
    }
  }

  let doneLessons = 0;
  let lastAt: Date | null = null;
  for (const id of lessonIds) {
    const row = doneMap.get(id);
    if (row) {
      if (row.done) doneLessons++;
      if (!lastAt || row.updated_at > lastAt) lastAt = row.updated_at;
    }
  }

  const state: KursyModuleProgress["state"] =
    doneLessons >= total ? "completed" : doneLessons > 0 ? "in_progress" : "not_started";

  const nextIncomplete = lessonIds.find((id) => !doneMap.get(id)?.done);

  let cta: string;
  if (state === "completed") {
    cta = "Powtórz";
  } else if (state === "in_progress" && nextIncomplete) {
    cta = "Kontynuuj";
  } else {
    cta = "Rozpocznij";
  }

  return {
    courseSlug: slug,
    totalLessons: total,
    doneLessons,
    state,
    actionHref,
    cta,
    lastActivityAt: lastAt ? lastAt.toISOString() : null,
  };
}

export async function getKursyMainModulesProgress(
  userId: string | undefined | null
): Promise<Map<string, KursyModuleProgress>> {
  const rows = userId ? await getLessonProgressRowsForMainCourses(userId) : [];

  const out = new Map<string, KursyModuleProgress>();

  for (const slug of KURSY_MAIN_SLUGS) {
    const p = kursyModuleProgressFromRows(slug, rows, `/kursy/${slug}`);
    if (p) out.set(slug, p);
  }

  return out;
}

/** Postęp kursu „Regulacje i egzaminy” (/kursy/regulacje) z `lesson_progress`. */
export async function getKursyRegulacjeProgress(
  userId: string | undefined | null
): Promise<KursyModuleProgress> {
  const rows = userId ? await getLessonProgressRowsForRegulacje(userId) : [];
  const p = kursyModuleProgressFromRows("regulacje", rows, "/kursy/regulacje");
  if (p) {
    return p.state === "not_started" ? { ...p, cta: "Rozpocznij naukę" } : p;
  }
  const reg = COURSES["regulacje"];
  const fallback = kursyModuleProgressFromCounts(
    "regulacje",
    reg?.lessons.length ?? 0,
    0,
    "/kursy/regulacje",
    null
  );
  return fallback.state === "not_started"
    ? { ...fallback, cta: "Rozpocznij naukę" }
    : fallback;
}

function kursyModuleProgressFromCounts(
  courseSlug: string,
  totalLessons: number,
  doneLessons: number,
  actionHref: string,
  lastActivityAt: string | null
): KursyModuleProgress {
  const state: KursyModuleProgress["state"] =
    totalLessons <= 0
      ? "not_started"
      : doneLessons >= totalLessons
        ? "completed"
        : doneLessons > 0
          ? "in_progress"
          : "not_started";

  let cta: string;
  if (state === "completed") {
    cta = "Powtórz";
  } else if (state === "in_progress") {
    cta = "Kontynuuj";
  } else {
    cta = "Rozpocznij";
  }

  return {
    courseSlug,
    totalLessons,
    doneLessons,
    state,
    actionHref,
    cta,
    lastActivityAt,
  };
}

/**
 * Postęp modułów „Materiały dodatkowe” na /kursy.
 * Moduły wielolekcyjne: `session.courseProgress[courseId]` (slug lekcji → ukończono).
 */
export function getKursyExtraMaterialsProgress(
  courseProgress: Record<string, Record<string, boolean>> | undefined
): Map<string, KursyModuleProgress> {
  const cp = courseProgress ?? {};
  const out = new Map<string, KursyModuleProgress>();

  const atMap = cp["analiza-techniczna"] ?? {};
  const atDone = ANALIZA_LEKCJE.filter((l) => atMap[l.slug]).length;
  const atTotal = ANALIZA_LEKCJE.length;
  out.set(
    "analiza-techniczna",
    kursyModuleProgressFromCounts(
      "analiza-techniczna",
      atTotal,
      atDone,
      "/kursy/materialy/analiza-techniczna",
      null
    )
  );

  const fsMap = cp["formacje-swiecowe"] ?? {};
  const fsDone = FORMACJE_LEKCJE.filter((l) => fsMap[l.slug]).length;
  const fsTotal = FORMACJE_LEKCJE.length;
  out.set(
    "formacje-swiecowe",
    kursyModuleProgressFromCounts(
      "formacje-swiecowe",
      fsTotal,
      fsDone,
      "/kursy/materialy/formacje-swiecowe",
      null
    )
  );

  const piMap = cp["psychologia-inwestowania"] ?? {};
  const piDone = PSYCHOLOGIA_LEKCJE.filter((l) => piMap[l.slug]).length;
  const piTotal = PSYCHOLOGIA_LEKCJE.length;
  out.set(
    "psychologia-inwestowania",
    kursyModuleProgressFromCounts(
      "psychologia-inwestowania",
      piTotal,
      piDone,
      "/kursy/materialy/psychologia-inwestowania",
      null
    )
  );

  const keMap = cp["kalendarz-ekonomiczny"] ?? {};
  const keDone = KALENDARZ_EKONOMICZNY_LEKCJE.filter((l) => keMap[l.slug]).length;
  const keTotal = KALENDARZ_EKONOMICZNY_LEKCJE.length;
  out.set(
    "kalendarz-ekonomiczny",
    kursyModuleProgressFromCounts(
      "kalendarz-ekonomiczny",
      keTotal,
      keDone,
      "/kursy/materialy/kalendarz-ekonomiczny",
      null
    )
  );

  return out;
}
