"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCourseProgress, markLessonDone, subscribeCourseProgressChanged } from "@/lib/courseProgressClient";

const DEFAULT_NEXT_NAV_ID = "materialy-next-lesson-nav";

type Props = {
  courseId: string;
  lessonSlug: string;
  hasNext: boolean;
  /** Element do przewinięcia po ukończeniu, gdy jest następna lekcja */
  nextLessonNavId?: string;
};

export default function MaterialyModulLessonCompleteButton({
  courseId,
  lessonSlug,
  hasNext,
  nextLessonNavId = DEFAULT_NEXT_NAV_ID,
}: Props) {
  const [done, setDone] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    const { progress, authenticated: auth } = await fetchCourseProgress(courseId);
    setAuthenticated(auth);
    setDone(!!progress[lessonSlug]);
    setLoaded(true);
  }, [courseId, lessonSlug]);

  useEffect(() => {
    void refresh();
    return subscribeCourseProgressChanged(() => {
      void refresh();
    });
  }, [refresh]);

  const handleComplete = async () => {
    if (done || !authenticated || pending) return;
    setPending(true);
    try {
      const ok = await markLessonDone(courseId, lessonSlug);
      if (ok) {
        setDone(true);
        if (hasNext) {
          requestAnimationFrame(() => {
            document.getElementById(nextLessonNavId)?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          });
        }
      }
    } finally {
      setPending(false);
    }
  };

  if (!loaded) {
    return <div className="mt-8 min-h-[2.75rem]" aria-busy="true" />;
  }

  return (
    <div className="mt-8 flex justify-center sm:justify-start">
      {!authenticated ? (
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          Zaloguj się, aby zapisywać ukończenie lekcji w koncie.
        </p>
      ) : done ? (
        <span className="inline-flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200">
          Ukończono ✓
        </span>
      ) : (
        <button
          type="button"
          onClick={() => void handleComplete()}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/15 disabled:opacity-60"
        >
          {pending ? "Zapisywanie…" : "Ukończ lekcję"}
        </button>
      )}
    </div>
  );
}
