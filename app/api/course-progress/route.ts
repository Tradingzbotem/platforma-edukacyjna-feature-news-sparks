import { NextRequest, NextResponse } from "next/server";

import {
  getLessonProgressBooleanMapForCourse,
  isDatabaseConfigured,
  upsertLessonProgress,
} from "@/lib/db";
import { getSession } from "@/lib/session";
import { isSessionMaterialCourse, isValidSessionMaterialLesson } from "@/lib/sessionMaterialCourses";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId || !isSessionMaterialCourse(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  const sessionMap = session.courseProgress?.[courseId] ?? {};
  let dbMap: Record<string, boolean> = {};
  if (isDatabaseConfigured()) {
    try {
      dbMap = await getLessonProgressBooleanMapForCourse(session.userId, courseId);
      for (const [slug, done] of Object.entries(sessionMap)) {
        if (done && !dbMap[slug]) {
          await upsertLessonProgress({
            userId: session.userId,
            course: courseId,
            lessonId: slug,
            done: true,
          });
          dbMap[slug] = true;
        }
      }
    } catch {
      /* brak tabeli / DB — zostaje tylko sesja */
    }
  }

  const progress: Record<string, boolean> = { ...dbMap };
  for (const [k, v] of Object.entries(sessionMap)) {
    if (v) progress[k] = true;
  }
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { courseId, lessonSlug } = body as { courseId?: unknown; lessonSlug?: unknown };
  if (
    typeof courseId !== "string" ||
    !isSessionMaterialCourse(courseId) ||
    typeof lessonSlug !== "string" ||
    !lessonSlug
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!isValidSessionMaterialLesson(courseId, lessonSlug)) {
    return NextResponse.json({ error: "Invalid lesson" }, { status: 400 });
  }

  if (!session.courseProgress) {
    session.courseProgress = {};
  }
  const prev = session.courseProgress[courseId] ?? {};
  session.courseProgress[courseId] = { ...prev, [lessonSlug]: true };
  await session.save();

  if (isDatabaseConfigured()) {
    try {
      await upsertLessonProgress({
        userId: session.userId,
        course: courseId,
        lessonId: lessonSlug,
        done: true,
      });
    } catch {
      /* sesja już zapisana — postęp w UI działa */
    }
  }

  return NextResponse.json({ progress: session.courseProgress[courseId] });
}
