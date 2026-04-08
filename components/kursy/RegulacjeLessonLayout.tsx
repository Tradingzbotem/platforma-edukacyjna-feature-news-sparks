import Link from "next/link";
import type { ReactNode } from "react";
import LessonHeaderCard from "@/components/education/LessonHeaderCard";
import LessonVisitTracker from "@/components/LessonVisitTracker";
import KursyLessonProgressActions from "@/components/kursy/KursyLessonProgressActions";

const INDEX_HREF = "/kursy/regulacje";

export default function RegulacjeLessonLayout({
  lessonSlug,
  lessonNumber,
  title,
  minutes,
  children,
  prevSlug,
  nextSlug,
}: {
  lessonSlug: string;
  lessonNumber: number;
  title: string;
  /** Domyślny czas w kafelku: 15 MIN, gdy brak */
  minutes?: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl space-y-6 p-6 animate-fade-in md:p-8">
        <LessonVisitTracker course="regulacje" lessonId={lessonSlug} />
        <Link
          href={INDEX_HREF}
          className="inline-flex items-center gap-2 text-sm underline transition-colors duration-150 hover:text-white"
        >
          ← Wróć do spisu
        </Link>

        <LessonHeaderCard
          module="Regulacje i egzaminy"
          title={title}
          duration={typeof minutes === "number" ? `${minutes} min` : undefined}
          backHref={INDEX_HREF}
          actions={
            <KursyLessonProgressActions
              course="regulacje"
              lessonId={lessonSlug}
              backHref={INDEX_HREF}
            />
          }
        />

        <article className="space-y-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] p-6 shadow-lg backdrop-blur-sm md:space-y-8">
          {children}
        </article>

        <nav className="flex items-center justify-between border-t border-white/10 pt-4">
          {prevSlug ? (
            <Link
              className="underline transition-colors duration-150 hover:text-white"
              href={`/kursy/regulacje/${prevSlug}`}
            >
              ← Poprzednia lekcja
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link
              className="underline transition-colors duration-150 hover:text-white"
              href={`/kursy/regulacje/${nextSlug}`}
            >
              Następna lekcja →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}
