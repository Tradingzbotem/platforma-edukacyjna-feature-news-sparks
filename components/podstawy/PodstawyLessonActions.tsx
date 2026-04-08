"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import { readPodstawyDoneSlugSet, writePodstawyDoneSlugArray } from "@/lib/lessonProgressStorage";
import { pushPodstawyLessonProgress } from "@/lib/podstawyLessonProgressSync";

type Props = {
  lessonSlug: string;
  backHref?: string;
  /** `inline` — w hero (bez separatora); `footer` — dotychczasowy blok pod treścią */
  variant?: "inline" | "footer";
};

/** Przycisk ukończenia + lista `course:podstawy:done` (obok LessonVisitTracker na stronie). */
export default function PodstawyLessonActions({
  lessonSlug,
  backHref,
  variant = "footer",
}: Props) {
  const { userId, sessionReady } = useLessonProgressSession();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!sessionReady) return;
    try {
      setDone(readPodstawyDoneSlugSet(localStorage, userId).has(lessonSlug));
    } catch {
      // ignore
    }
  }, [lessonSlug, userId, sessionReady]);

  const toggle = useCallback(() => {
    if (!sessionReady) return;
    try {
      const arr = Array.from(readPodstawyDoneSlugSet(localStorage, userId));
      const next = done
        ? arr.filter((s) => s !== lessonSlug)
        : Array.from(new Set([...arr, lessonSlug]));
      writePodstawyDoneSlugArray(localStorage, userId, next);
      setDone(!done);
      pushPodstawyLessonProgress(lessonSlug, !done, userId);
    } catch {
      // ignore
    }
  }, [done, lessonSlug, userId, sessionReady]);

  const wrap =
    variant === "inline"
      ? "flex flex-wrap items-center gap-2 sm:justify-end"
      : "mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6";

  const btnPrimary = `rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity ${
    done
      ? "bg-emerald-400/90 text-slate-900 hover:opacity-90"
      : "border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
  }`;

  const linkClass =
    variant === "inline"
      ? "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
      : "rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-white/25 hover:bg-white/10";

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
      {backHref ? (
        <Link href={backHref} className={linkClass}>
          ← Spis lekcji
        </Link>
      ) : null}
    </div>
  );
}
