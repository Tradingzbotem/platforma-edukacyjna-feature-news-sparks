"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import LessonHeaderCard from "@/components/education/LessonHeaderCard";
import LessonVisitTracker from "@/components/LessonVisitTracker";
import KursyLessonProgressActions from "@/components/kursy/KursyLessonProgressActions";

type CoursePath = "forex" | "cfd";

export default function ForexCfdLessonLayout({
  coursePath,
  courseTitle,
  lessonSlug,
  lessonNumber,
  title,
  minutes,
  children,
  prevSlug,
  nextSlug,
  /** Gdy brak `nextSlug` — link „Zakończ moduł” (np. ostatnia lekcja CFD) */
  finishModuleHref,
}: {
  coursePath: CoursePath;
  courseTitle: string;
  /** Np. lekcja-1 — klucz postępu */
  lessonSlug: string;
  lessonNumber: number;
  title: string;
  /** Domyślny czas w kafelku: 15 MIN, gdy brak */
  minutes?: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
  finishModuleHref?: string;
}) {
  const indexHref = `/kursy/${coursePath}`;

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <LessonVisitTracker course={coursePath} lessonId={lessonSlug} />
      <Link href={indexHref} className="text-sm underline">
        ← Wróć do spisu
      </Link>

      <LessonHeaderCard
        module={courseTitle}
        title={title}
        duration={typeof minutes === "number" ? `${minutes} min` : undefined}
        backHref={indexHref}
        actions={
          <KursyLessonProgressActions course={coursePath} lessonId={lessonSlug} backHref={indexHref} />
        }
      />

      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-8">{children}</article>

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
        ) : finishModuleHref ? (
          <Link className="underline" href={finishModuleHref}>
            Zakończ moduł
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
