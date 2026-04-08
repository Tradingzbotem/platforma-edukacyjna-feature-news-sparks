"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import { KURSY_LESSON_PROGRESS_CHANGED } from "@/components/kursy/KursyLessonProgressActions";
import { mergeCourseLessonDisplayStatus } from "@/lib/kursy/mergeCourseLessonDisplayStatus";

type Lesson = {
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
  status?: "completed" | "inProgress";
};

const LESSON_DEFS: Omit<Lesson, "status">[] = [
  {
    slug: "lekcja-1",
    title: "Wprowadzenie do CFD",
    blurb: "Czym są CFD i jak działają; różnice vs instrument bazowy.",
    minutes: 6,
  },
  {
    slug: "lekcja-2",
    title: "Koszty i finansowanie overnight",
    blurb: "Spread, prowizja, swap/rollover, punkty potrójne.",
    minutes: 7,
  },
  {
    slug: "lekcja-3",
    title: "Indeksy i surowce — specyfika",
    blurb: "Godziny, przerwy, tick value, ważne raporty.",
    minutes: 8,
  },
  {
    slug: "lekcja-4",
    title: "Realizacja zleceń i poślizg",
    blurb: "Market/Limit/Stop, poślizg, otwarcia i dane.",
    minutes: 9,
  },
  {
    slug: "lekcja-5",
    title: "Zarządzanie ryzykiem w CFD",
    blurb: "Sizing pod 1R, limity, specyficzne ryzyka.",
    minutes: 10,
  },
];

const COURSE = "cfd" as const;

function CourseIndex({ lessons }: { lessons: Lesson[] }) {
  const done = lessons.filter((l) => l.status === "completed").length;
  const progress = Math.round((done / lessons.length) * 100);

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <Link href="/kursy" className="text-sm underline">
        ← Wróć do listy kursów
      </Link>

      <header className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220] p-6 md:p-8">
        <h1 className="text-3xl font-semibold md:text-4xl">CFD — spis lekcji</h1>
        <p className="mt-2 text-slate-300">Kontrakty CFD: mechanika, koszty, indeksy/surowce, egzekucja, ryzyko.</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>
              Postęp: {done}/{lessons.length} lekcji
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-white/80" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {lessons.map((l, i) => (
          <article key={l.slug} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <div>
              <div className="mb-1 text-sm text-slate-400">
                <span>Lekcja</span> <span>{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">{l.title}</h3>
              <p className="mt-2 text-slate-300">{l.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>⏱ {l.minutes} min</span>
                {l.status === "completed" && <span className="text-emerald-400">✓ Ukończono</span>}
                {l.status === "inProgress" && <span className="text-sky-400">W toku</span>}
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/kursy/${COURSE}/${l.slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 font-semibold text-slate-900 hover:opacity-90"
              >
                Otwórz
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default function Page() {
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

  return <CourseIndex lessons={lessons} />;
}
