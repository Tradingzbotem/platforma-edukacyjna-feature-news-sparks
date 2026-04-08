"use client";

import { useEffect, useRef } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import LessonVisitTracker from "@/components/LessonVisitTracker";
import {
  LESSON_PROGRESS_DONE,
  readLessonProgressValue,
  writeLessonProgressValue,
} from "@/lib/lessonProgressStorage";

/**
 * Wizyta → „w trakcie” (LessonVisitTracker). Po przewinięciu ~na dół strony → ukończone (jak przy realnym przeczytaniu).
 */
export default function ZaawansowaneLessonProgressClient({
  lessonSlug,
}: {
  lessonSlug: string;
}) {
  const { userId, sessionReady } = useLessonProgressSession();
  const marked = useRef(false);

  useEffect(() => {
    marked.current = false;
  }, [userId, lessonSlug]);

  useEffect(() => {
    if (!sessionReady) return;
    const tryMarkDone = () => {
      if (marked.current) return;
      try {
        if (readLessonProgressValue(localStorage, "zaawansowane", lessonSlug, userId) === LESSON_PROGRESS_DONE) {
          marked.current = true;
          return;
        }
      } catch {
        return;
      }

      const el = document.documentElement;
      const sh = el.scrollHeight;
      if (sh <= 0) return;
      const pct = (el.scrollTop + el.clientHeight) / sh;
      if (pct < 0.82) return;

      marked.current = true;
      try {
        writeLessonProgressValue(localStorage, "zaawansowane", lessonSlug, userId, LESSON_PROGRESS_DONE);
        window.dispatchEvent(new CustomEvent("kursy-zaawansowane-ls"));
        void fetch("/api/progress/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course: "zaawansowane",
            lessonId: lessonSlug,
            done: true,
          }),
        });
      } catch {
        // ignore
      }
    };

    window.addEventListener("scroll", tryMarkDone, { passive: true });
    tryMarkDone();
    return () => window.removeEventListener("scroll", tryMarkDone);
  }, [lessonSlug, userId, sessionReady]);

  return <LessonVisitTracker course="zaawansowane" lessonId={lessonSlug} />;
}
