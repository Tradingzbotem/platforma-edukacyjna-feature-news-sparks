import { NextRequest, NextResponse } from "next/server";

import { COURSES } from "@/data/courses";
import { getLessonProgressRowMapForCourse, isDatabaseConfigured } from "@/lib/db";
import { KURSY_MAIN_SLUGS } from "@/lib/kursyProgress";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function isMainCourseSlug(s: string): s is (typeof KURSY_MAIN_SLUGS)[number] {
  return (KURSY_MAIN_SLUGS as readonly string[]).includes(s);
}

/**
 * Mapa postępu lekcji z bazy dla spisu modułu (zalogowany) — spójna z licznikiem na /kursy.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const course = req.nextUrl.searchParams.get("course")?.trim() ?? "";
  if (!course || !isMainCourseSlug(course) || !COURSES[course]) {
    return NextResponse.json({ error: "INVALID_COURSE" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ lessons: {} as Record<string, { done: boolean }> });
  }

  try {
    const lessons = await getLessonProgressRowMapForCourse(session.userId, course);
    return NextResponse.json({ lessons });
  } catch {
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }
}
