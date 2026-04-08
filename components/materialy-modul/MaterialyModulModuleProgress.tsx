"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCourseProgress, subscribeCourseProgressChanged } from "@/lib/courseProgressClient";

type Props = {
  courseId: string;
  lessonSlugs: string[];
};

export default function MaterialyModulModuleProgress({ courseId, lessonSlugs }: Props) {
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

  const doneCount = lessonSlugs.filter((s) => progress[s]).length;
  const total = lessonSlugs.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-inner backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          Postęp: {doneCount}/{total} lekcji
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
