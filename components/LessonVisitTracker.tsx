"use client";

import { useEffect, useRef } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import {
  LESSON_PROGRESS_DONE,
  LESSON_PROGRESS_VISITED,
  readLessonProgressValue,
  writeLessonProgressValue,
} from "@/lib/lessonProgressStorage";

/**
 * Przy pierwszym wejściu na lekcję zapisuje localStorage (`0`) i wysyła POST done:false,
 * żeby /kursy mogło pokazać „W trakcie”. Nie nadpisuje stanu ukończenia (`1`).
 */
export default function LessonVisitTracker({
  course,
  lessonId,
}: {
  course: string;
  lessonId: string;
}) {
  const { userId, sessionReady } = useLessonProgressSession();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    const sig = `${userId ?? "guest"}:${course}:${lessonId}`;
    if (lastTracked.current === sig) return;
    lastTracked.current = sig;
    try {
      const v = readLessonProgressValue(localStorage, course, lessonId, userId);
      if (v === LESSON_PROGRESS_DONE) return;
      if (v !== LESSON_PROGRESS_VISITED) {
        writeLessonProgressValue(localStorage, course, lessonId, userId, LESSON_PROGRESS_VISITED);
        void fetch("/api/progress/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course, lessonId, done: false, visitOnly: true }),
        });
      }
    } catch {
      // ignore
    }
  }, [course, lessonId, userId, sessionReady]);

  return null;
}
