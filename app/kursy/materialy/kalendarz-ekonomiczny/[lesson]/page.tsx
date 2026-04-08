import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import MaterialyModulLessonCompleteButton from "@/components/materialy-modul/MaterialyModulLessonCompleteButton";
import MaterialyModulLessonModuleProgressBar from "@/components/materialy-modul/MaterialyModulLessonModuleProgressBar";
import LessonSectionPanel from "@/components/LessonSectionPanel";
import { KALENDARZ_EKONOMICZNY_COURSE_ID } from "@/lib/courseProgressClient";

import {
  KALENDARZ_EKONOMICZNY_LEKCJA_SEKCJE,
  KALENDARZ_EKONOMICZNY_LEKCJE,
  getKalendarzEkonomLesson,
  kalendarzEkonomLessonIndex,
} from "../lessons";

type PageProps = { params: Promise<{ lesson: string }> };

const MODULE_PATH = "/kursy/materialy/kalendarz-ekonomiczny";
const MODULE_BREADCRUMB = "Kalendarz ekonomiczny";

export function generateStaticParams() {
  return KALENDARZ_EKONOMICZNY_LEKCJE.map((l) => ({ lesson: l.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lesson: slug } = await params;
  const lekcja = getKalendarzEkonomLesson(slug);
  if (!lekcja) return { title: "Lekcja | Kalendarz ekonomiczny" };
  return {
    title: `${lekcja.title} | Kalendarz ekonomiczny`,
    description: lekcja.blurb,
  };
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}

export default async function Page({ params }: PageProps) {
  const { lesson: slug } = await params;
  const lekcja = getKalendarzEkonomLesson(slug);
  if (!lekcja) notFound();

  const idx = kalendarzEkonomLessonIndex(slug);
  const lessonNumber = idx + 1;
  const total = KALENDARZ_EKONOMICZNY_LEKCJE.length;
  const lessonSlugs = KALENDARZ_EKONOMICZNY_LEKCJE.map((l) => l.slug);
  const prev = idx > 0 ? KALENDARZ_EKONOMICZNY_LEKCJE[idx - 1] : undefined;
  const next = idx < KALENDARZ_EKONOMICZNY_LEKCJE.length - 1 ? KALENDARZ_EKONOMICZNY_LEKCJE[idx + 1] : undefined;

  return (
    <main className="min-h-[70vh] text-white">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8 md:pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            href="/kursy"
            className="group inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            ← Wróć do kursów
          </Link>
          <Link
            href={MODULE_PATH}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            ← Wróć do kalendarza ekonomicznego
          </Link>
        </div>

        <nav aria-label="Ścieżka nawigacji" className="mt-6 text-sm text-slate-400">
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
                href={MODULE_PATH}
                className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {MODULE_BREADCRUMB}
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li className="font-medium text-white">
              Lekcja {lessonNumber} z {total}
            </li>
          </ol>
        </nav>

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121a2e] via-[#0c1424] to-[#070b14] p-6 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8 md:p-9 ring-1 ring-inset ring-white/[0.05]">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-500/[0.12] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-indigo-200/75">
              <span className="rounded-md border border-indigo-400/25 bg-indigo-500/10 px-2 py-1 text-[11px] text-indigo-100/90">
                {MODULE_BREADCRUMB}
              </span>
              <span className="text-slate-500" aria-hidden>
                ·
              </span>
              <span>Lekcja {lessonNumber}</span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-slate-300">
                <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {lekcja.minutes} min czytania
              </span>
            </div>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-[1.85rem] md:leading-snug">
              {lekcja.title}
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-400">{lekcja.intro}</p>
            <p className="mt-1 max-w-2xl border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-500">
              {next ? (
                <>
                  To fundament modułu — po zapoznaniu się z treścią przejdź dalej{" "}
                  <span className="text-slate-400">(następna lekcja na dole strony)</span>.
                </>
              ) : (
                <>
                  Ostatnia lekcja modułu — wróć do spisu i przygotuj plan A/B/C na najbliższy blok makro w kalendarzu.
                </>
              )}
            </p>
          </div>
        </header>

        <MaterialyModulLessonModuleProgressBar
          courseId={KALENDARZ_EKONOMICZNY_COURSE_ID}
          lessonSlugs={lessonSlugs}
          lessonNumber={lessonNumber}
          totalLessons={total}
        />
        <div className="mt-10 flex flex-col gap-10 md:mt-12 md:gap-12 lg:gap-14">
          {KALENDARZ_EKONOMICZNY_LEKCJA_SEKCJE.map(({ pole, tytul, variant, eyebrow }) => (
            <LessonSectionPanel key={pole} variant={variant} title={tytul} eyebrow={eyebrow}>
              <BulletList items={lekcja[pole]} />
            </LessonSectionPanel>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-3 md:mt-16" aria-hidden>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/10" />
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">Koniec treści</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/10" />
        </div>

        <MaterialyModulLessonCompleteButton
          courseId={KALENDARZ_EKONOMICZNY_COURSE_ID}
          lessonSlug={slug}
          hasNext={!!next}
        />

        <nav
          id="materialy-next-lesson-nav"
          aria-label="Nawigacja między lekcjami"
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4"
        >
          {prev ? (
            <Link
              href={`${MODULE_PATH}/${prev.slug}`}
              className="group flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 shadow-sm transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:justify-start sm:px-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-400 transition-colors group-hover:border-white/15 group-hover:text-white">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Poprzednia</span>
                <span className="line-clamp-2 text-sm font-semibold text-white">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <div className="flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-center text-xs text-slate-600 sm:justify-start sm:px-5 sm:text-left">
              Początek modułu
            </div>
          )}

          {next ? (
            <Link
              href={`${MODULE_PATH}/${next.slug}`}
              className="group flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/35 bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-slate-950/80 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(79,70,229,0.35)] transition-all hover:border-indigo-400/50 hover:from-indigo-500/30 sm:justify-end sm:px-5"
            >
              <span className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200/80">Następna</span>
                <span className="line-clamp-2 text-sm font-semibold text-white">{next.title}</span>
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

        <p className="mt-6 text-center sm:text-left">
          <Link
            href={MODULE_PATH}
            className="text-sm text-slate-500 underline-offset-4 transition-colors hover:text-slate-300 hover:underline"
          >
            ← Wróć do spisu lekcji
          </Link>
        </p>
      </div>
    </main>
  );
}
