"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCourseProgress, subscribeCourseProgressChanged } from "@/lib/courseProgressClient";

type Props = {
  courseId: string;
  lessonSlugs: string[];
  lessonNumber: number;
  totalLessons: number;
};

export default function MaterialyModulLessonModuleProgressBar({
  courseId,
  lessonSlugs,
  lessonNumber,
  totalLessons,
}: Props) {
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

  const completedCount = lessonSlugs.filter((s) => progress[s]).length;
  const pct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <section
      className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-inner backdrop-blur-sm"
      aria-label="Postęp w module"
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-200">
          Lekcja {lessonNumber} z {totalLessons}
        </span>
        <span className="tabular-nums text-slate-400">
          Moduł: {completedCount}/{totalLessons} ({pct}%)
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
