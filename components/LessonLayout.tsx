import Link from "next/link";
import type { ReactNode } from "react";

export default function LessonLayout({
  coursePath,
  courseTitle,
  lessonNumber,
  title,
  minutes,
  children,
  prevSlug,
  nextSlug,
}: {
  coursePath: "forex" | "cfd" | "zaawansowane";
  courseTitle: string;
  lessonNumber: number;
  title: string;
  minutes: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}) {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link href={`/kursy/${coursePath}`} className="text-sm underline">
        ← Wróć do spisu
      </Link>

      <header className="space-y-1">
        <p className="text-slate-400 text-sm">
          {courseTitle} — Lekcja {lessonNumber} • ⏱ {minutes} min
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>

      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-6">
        {children}
      </article>

      <nav className="flex items-center justify-between">
        {prevSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${prevSlug}`}>
            ← Poprzednia lekcja
          </Link>
        ) : (
          <span />
        )}

        {nextSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${nextSlug}`}>
            Następna lekcja →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
