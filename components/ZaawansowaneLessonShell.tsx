import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Library } from "lucide-react";
import LessonHeaderCard from "@/components/education/LessonHeaderCard";
import ZaawansowaneLessonProgressClient from "@/components/ZaawansowaneLessonProgressClient";
import KursyLessonProgressActions from "@/components/kursy/KursyLessonProgressActions";

/**
 * Wspólny layout statycznych lekcji modułu Zaawansowane (tylko /kursy/zaawansowane/lekcja-*).
 */
export default function ZaawansowaneLessonShell({
  lessonNumber,
  lessonSlug,
  title,
  minutes,
  prevSlug,
  nextSlug,
  children,
}: {
  lessonNumber: number;
  /** np. lekcja-1 — zapis postępu w localStorage / API */
  lessonSlug: string;
  title: string;
  /** Domyślny czas w kafelku: 15 MIN, gdy brak */
  minutes?: number;
  prevSlug?: string;
  nextSlug?: string;
  children: ReactNode;
}) {
  const indexHref = "/kursy/zaawansowane";

  return (
    <main className="min-h-[70vh] bg-slate-950 text-white">
      <ZaawansowaneLessonProgressClient lessonSlug={lessonSlug} />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 md:pt-10">
        <Link
          href={indexHref}
          className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
        >
          <Library className="h-4 w-4 text-indigo-300/90 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Wróć do spisu
        </Link>

        <LessonHeaderCard
          className="mt-8"
          module="Zaawansowane"
          title={title}
          duration={typeof minutes === "number" ? `${minutes} min` : undefined}
          backHref={indexHref}
          actions={
            <KursyLessonProgressActions
              course="zaawansowane"
              lessonId={lessonSlug}
              backHref={indexHref}
            />
          }
        />

        <article className="mt-10 flex flex-col gap-12 md:mt-12 md:gap-14">{children}</article>

        <div
          className="mt-14 flex items-center gap-3 md:mt-16"
          aria-hidden
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/10" />
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Koniec treści</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/10" />
        </div>

        <nav
          aria-label="Nawigacja między lekcjami"
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4"
        >
          {prevSlug ? (
            <Link
              href={`/kursy/zaawansowane/${prevSlug}`}
              className="group flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 shadow-sm transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:justify-start sm:px-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-400 transition-colors group-hover:border-white/15 group-hover:text-white">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Poprzednia</span>
                <span className="text-sm font-semibold text-white">Lekcja {lessonNumber - 1}</span>
              </span>
            </Link>
          ) : (
            <div className="flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-center text-xs text-slate-600 sm:justify-start sm:px-5 sm:text-left">
              Początek modułu
            </div>
          )}

          {nextSlug ? (
            <Link
              href={`/kursy/zaawansowane/${nextSlug}`}
              className="group flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/35 bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-slate-950/80 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(79,70,229,0.35)] transition-all hover:border-indigo-400/50 hover:from-indigo-500/30 sm:justify-end sm:px-5"
            >
              <span className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200/80">Następna</span>
                <span className="text-sm font-semibold text-white">Lekcja {lessonNumber + 1}</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-300/30 bg-indigo-500/20 text-indigo-100 transition-colors group-hover:bg-indigo-500/30">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </span>
            </Link>
          ) : (
            <div className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-950/20 px-4 py-3 text-center sm:items-end sm:text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80">Moduł</span>
              <span className="text-sm font-semibold text-emerald-100/95">To była ostatnia lekcja</span>
            </div>
          )}
        </nav>
      </div>
    </main>
  );
}
