"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import {
  LESSON_PROGRESS_DONE,
  LESSON_PROGRESS_VISITED,
  readLessonProgressValue,
  writeLessonProgressValue,
} from "@/lib/lessonProgressStorage";

export const KURSY_LESSON_PROGRESS_CHANGED = "kursy-lesson-progress-changed";

type Props = {
  course: string;
  lessonId: string;
  backHref: string;
  /** Domyślnie true — link „← Spis lekcji” */
  showSpisLink?: boolean;
  className?: string;
};

function emitProgressChanged(course: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(KURSY_LESSON_PROGRESS_CHANGED, { detail: { course } }));
  if (course === "zaawansowane") {
    window.dispatchEvent(new CustomEvent("kursy-zaawansowane-ls"));
  }
}

/**
 * Przycisk „Oznacz jako ukończoną” / „✓ Ukończono” + opcjonalnie link do spisu.
 * Zapis: `lessonProgressStorage` + POST `/api/progress/lesson` (zalogowani).
 */
export default function KursyLessonProgressActions({
  course,
  lessonId,
  backHref,
  showSpisLink = true,
  className = "",
}: Props) {
  const { userId, sessionReady } = useLessonProgressSession();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!sessionReady) return;
    try {
      setDone(readLessonProgressValue(localStorage, course, lessonId, userId) === LESSON_PROGRESS_DONE);
    } catch {
      setDone(false);
    }
  }, [course, lessonId, userId, sessionReady]);

  const toggle = useCallback(() => {
    if (!sessionReady) return;
    const nextDone = !done;
    try {
      writeLessonProgressValue(
        localStorage,
        course,
        lessonId,
        userId,
        nextDone ? LESSON_PROGRESS_DONE : LESSON_PROGRESS_VISITED
      );
      setDone(nextDone);
      emitProgressChanged(course);
      void fetch("/api/progress/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, lessonId, done: nextDone }),
      });
    } catch {
      // ignore
    }
  }, [course, lessonId, userId, sessionReady, done]);

  const wrap = `flex flex-wrap items-center gap-2 sm:justify-end ${className}`.trim();
  const btnPrimary = `rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity ${
    done
      ? "bg-emerald-400/90 text-slate-900 hover:opacity-90"
      : "border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
  }`;
  const linkClass =
    "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10";

  if (!sessionReady) {
    return <div className="min-h-[2.75rem]" aria-busy="true" />;
  }

  return (
    <div className={wrap}>
      <button
        type="button"
        onClick={toggle}
        className={btnPrimary}
        title={done ? "Oznacz jako nieukończoną" : "Oznacz jako ukończoną"}
      >
        {done ? "✓ Ukończono" : "Oznacz jako ukończoną"}
      </button>
      {showSpisLink ? (
        <Link href={backHref} className={linkClass}>
          ← Spis lekcji
        </Link>
      ) : null}
    </div>
  );
}
