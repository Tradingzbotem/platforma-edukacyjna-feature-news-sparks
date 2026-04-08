"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { fetchCourseProgress, subscribeCourseProgressChanged } from "@/lib/courseProgressClient";

export type MaterialyModulLessonCard = {
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
};

type Props = {
  courseId: string;
  /** Bazowy URL modułu, bez końcowego slasha, np. `/kursy/materialy/analiza-techniczna` */
  moduleBasePath: string;
  lessons: MaterialyModulLessonCard[];
};

export default function MaterialyModulModuleLessonGrid({ courseId, moduleBasePath, lessons }: Props) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    const { progress: p } = await fetchCourseProgress(courseId);
    setProgress(p);
  }, [courseId]);

  useEffect(() => {
    void refresh();
    return subscribeCourseProgressChanged(() => {
      void refresh();
    });
  }, [refresh]);

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-2 md:gap-6" aria-label="Lekcje modułu">
      {lessons.map((l, i) => {
        const completed = !!progress[l.slug];
        return (
          <article
            key={l.slug}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-md hover:shadow-black/30"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white/60">Lekcja {i + 1}</span>
                {completed ? (
                  <span className="text-xs font-medium text-emerald-400">Ukończona</span>
                ) : (
                  <span className="text-xs font-medium text-white/50">W toku</span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-white">{l.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{l.blurb}</p>
              <p className="mt-3 text-sm text-white/50">⏱ {l.minutes} min</p>
            </div>
            <div className="mt-5">
              <Link
                href={`${moduleBasePath}/${l.slug}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg sm:w-auto"
              >
                {completed ? "Powtórz" : "Rozpocznij"}
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}
