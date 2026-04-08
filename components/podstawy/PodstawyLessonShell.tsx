"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import LessonHeaderCard from "@/components/education/LessonHeaderCard";

export type PodstawyLessonShellProps = {
  lessonNumber: number;
  /** Domyślnie 5 */
  totalLessons?: number;
  title: string;
  lead?: ReactNode;
  /** Etykieta czasu czytania (np. 15) — wyświetlane jako „X min” */
  minutes?: number;
  prevHref?: string;
  nextHref?: string;
  /** Domyślnie „Następna lekcja” */
  nextLabel?: string;
  /** Domyślnie „Poprzednia lekcja” */
  prevLabel?: string;
  /** Np. `<LessonVisitTracker … />` */
  tracker?: ReactNode;
  /** Przyciski ukończenia / spisu — slot w hero */
  actions?: ReactNode;
  children: ReactNode;
};

/** Wspólny pasek akcji dla lekcji z lokalnym stanem `done` + `toggle` (lekcje 2–5). */
export function PodstawyLessonHeaderActions({
  done,
  onToggle,
  backHref = "/kursy/podstawy",
}: {
  done: boolean;
  onToggle: () => void;
  backHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity ${
          done
            ? "bg-emerald-400/90 text-slate-900 hover:opacity-90"
            : "border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
        }`}
        title={done ? "Oznacz jako nieukończoną" : "Oznacz jako ukończoną"}
      >
        {done ? "✓ Ukończono" : "Oznacz jako ukończoną"}
      </button>
      <Link
        href={backHref}
        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
      >
        ← Spis lekcji
      </Link>
    </div>
  );
}

/**
 * Wspólny szkielet stron lekcji modułu Podstawy — tylko warstwa prezentacyjna.
 * Logika postępu przekazywana przez `tracker` i `actions` (np. PodstawyLessonActions).
 */
export default function PodstawyLessonShell({
  lessonNumber,
  totalLessons = 5,
  title,
  lead,
  minutes,
  prevHref,
  nextHref,
  nextLabel = "Następna lekcja",
  prevLabel = "Poprzednia lekcja",
  tracker,
  actions,
  children,
}: PodstawyLessonShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {tracker}
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Ścieżka nawigacji" className="text-sm text-slate-400">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <Link
                href="/kursy"
                className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Kursy
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li>
              <Link
                href="/kursy/podstawy"
                className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Podstawy
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li className="font-medium text-white">
              Lekcja {lessonNumber}
              {totalLessons ? ` z ${totalLessons}` : ""}
            </li>
          </ol>
        </nav>

        <LessonHeaderCard
          className="mt-6"
          module="Podstawy"
          title={title}
          duration={typeof minutes === "number" ? `${minutes} min` : undefined}
          backHref="/kursy/podstawy"
          lead={lead}
          actions={actions}
          footer={
            actions ? undefined : (
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                Lekcja {lessonNumber}/{totalLessons}
              </div>
            )
          }
        />

        <section aria-label="Treść lekcji" className="mt-8">
          <h2 className="sr-only">Treść lekcji</h2>
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
            <div className="mx-auto max-w-none space-y-8 sm:space-y-10">{children}</div>
          </div>
        </section>

        <nav
          aria-label="Poprzednia i następna lekcja"
          className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-h-[2.75rem] items-center">
            {prevHref ? (
              <Link
                href={prevHref}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10 sm:w-auto"
              >
                <span className="text-slate-400 transition-colors group-hover:text-white" aria-hidden>
                  ←
                </span>
                {prevLabel}
              </Link>
            ) : (
              <span className="text-sm text-slate-600">To jest pierwsza lekcja</span>
            )}
          </div>
          <div className="flex min-h-[2.75rem] items-center sm:justify-end">
            {nextHref ? (
              <Link
                href={nextHref}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/35 bg-indigo-500/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/25 sm:w-auto"
              >
                {nextLabel}
                <span className="text-indigo-200 transition-colors group-hover:text-white" aria-hidden>
                  →
                </span>
              </Link>
            ) : (
              <span className="text-sm text-slate-600">Koniec ścieżki</span>
            )}
          </div>
        </nav>
      </div>
    </main>
  );
}
