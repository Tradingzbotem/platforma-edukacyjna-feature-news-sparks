"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import {
  KURSY_LESSON_PROGRESS_CHANGED,
} from "@/components/kursy/KursyLessonProgressActions";
import { mergeCourseLessonDisplayStatus } from "@/lib/kursy/mergeCourseLessonDisplayStatus";

type Lesson = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  status?: "completed" | "inProgress";
};

const LESSON_DEFS: Omit<Lesson, "status">[] = [
  {
    slug: "lekcja-1",
    title: "Wprowadzenie do rynku walutowego",
    description: "Pojęcia bazowe, uczestnicy, mechanika FX.",
    minutes: 6,
  },
  {
    slug: "lekcja-2",
    title: "Pipsy, punkty i loty",
    description: "Jak liczyć ruch ceny i wielkość pozycji.",
    minutes: 7,
  },
  {
    slug: "lekcja-3",
    title: "Rodzaje zleceń",
    description: "Market, limit, stop, stop-limit — kiedy których używać.",
    minutes: 8,
  },
  {
    slug: "lekcja-4",
    title: "Dźwignia i ryzyko",
    description: "Ekspozycja, margin, R-multiple i kontrola DD.",
    minutes: 9,
  },
  {
    slug: "lekcja-5",
    title: "Plan transakcyjny i dziennik",
    description: "Reguły wejść/wyjść, checklisty, metryki skuteczności.",
    minutes: 10,
  },
];

const COURSE = "forex" as const;

function CourseIndex({ lessons }: { lessons: Lesson[] }) {
  const done = lessons.filter((l) => l.status === "completed").length;
  const total = lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm p-6 md:p-8 shadow-lg">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Forex — spis lekcji</h1>
        <p className="mt-2 text-slate-300">Startowy moduł. Zacznij od lekcji 1 i idź po kolei.</p>

        <div className="mt-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm text-white/70">
            <span>
              Postęp: {done}/{total} lekcji
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 shadow-sm"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((l, i) => (
          <article
            key={l.slug}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1322] to-[#0a0f1a] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-black/40 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">
                <span>Lekcja</span> <span>{i + 1}</span>
              </span>
              {l.status === "completed" ? (
                <span className="font-medium text-emerald-400">✓ Ukończono</span>
              ) : l.status === "inProgress" ? (
                <span className="text-sky-400">W toku</span>
              ) : (
                <span className="text-slate-400">W toku</span>
              )}
            </div>

            <h2 className="text-xl font-semibold text-white">{l.title}</h2>
            <p className="mt-1 text-slate-300">{l.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">⏱ {l.minutes} min</span>
              <Link
                href={`/kursy/${COURSE}/${l.slug}`}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black shadow-md transition-all duration-200 hover:scale-105 hover:opacity-90 hover:shadow-lg"
              >
                Otwórz
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ForexPage() {
  const { userId, sessionReady } = useLessonProgressSession();
  const [lessons, setLessons] = useState<Lesson[]>(() => LESSON_DEFS.map((d) => ({ ...d, status: undefined })));

  const refresh = useCallback(async () => {
    if (!sessionReady) return;
    let dbMap: Record<string, { done: boolean }> | null = null;
    if (userId) {
      try {
        const r = await fetch(`/api/kursy/course-index-progress?course=${COURSE}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (r.ok) {
          const j = (await r.json()) as { lessons?: Record<string, { done: boolean }> };
          if (j?.lessons && typeof j.lessons === "object") dbMap = j.lessons;
        }
      } catch {
        dbMap = null;
      }
    }
    setLessons(
      LESSON_DEFS.map((d) => ({
        ...d,
        status: mergeCourseLessonDisplayStatus(COURSE, d.slug, userId, dbMap),
      }))
    );
  }, [userId, sessionReady]);

  useEffect(() => {
    void refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key && (e.key.includes(`:${COURSE}:`) || e.key.startsWith("progress:u:"))) void refresh();
    };
    const onCustom = (e: Event) => {
      const c = (e as CustomEvent<{ course?: string }>).detail?.course;
      if (c === COURSE) void refresh();
    };
    const onFocus = () => void refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener(KURSY_LESSON_PROGRESS_CHANGED, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(KURSY_LESSON_PROGRESS_CHANGED, onCustom);
    };
  }, [refresh]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl space-y-6 p-6 animate-fade-in">
        <Link
          href="/kursy"
          className="inline-flex items-center gap-2 text-sm underline transition-colors duration-150 hover:text-white"
        >
          ← Wróć do listy kursów
        </Link>
        <CourseIndex lessons={lessons} />
      </div>
    </main>
  );
}
