import Link from "next/link";
import type { Metadata } from "next";

import MaterialyModulModuleLessonGrid from "@/components/materialy-modul/MaterialyModulModuleLessonGrid";
import MaterialyModulModuleProgress from "@/components/materialy-modul/MaterialyModulModuleProgress";
import { PSYCHOLOGIA_INWESTOWANIA_COURSE_ID } from "@/lib/courseProgressClient";

import { PSYCHOLOGIA_LEKCJE } from "./lessons";

export const metadata: Metadata = {
  title: "Psychologia inwestowania — spis lekcji | Materiały",
  description:
    "Błędy poznawcze, emocje, dyscyplina, tilt i dziennik — proces pod realny handel FX/CFD.",
};

export default function Page() {
  const lessons = PSYCHOLOGIA_LEKCJE.map(({ slug, title, blurb, minutes }) => ({
    slug,
    title,
    blurb,
    minutes,
  }));
  const lessonSlugs = lessons.map((l) => l.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-12 lg:px-8 animate-fade-in">
      <Link
        href="/kursy"
        className="inline-flex text-sm text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        ← Wróć do kursów
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#0a0f1a] to-[#080d16] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] md:p-8 md:shadow-lg">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
          aria-hidden
        />
        <header className="relative">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-200/80">Materiały · moduł</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Psychologia inwestowania — spis lekcji
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
            Poznasz błędy poznawcze, pułapki emocjonalne i zasady budowania procesu, który pozwala działać spokojniej i
            bardziej konsekwentnie.
          </p>
        </header>

        <MaterialyModulModuleProgress courseId={PSYCHOLOGIA_INWESTOWANIA_COURSE_ID} lessonSlugs={lessonSlugs} />
      </section>

      <MaterialyModulModuleLessonGrid
        courseId={PSYCHOLOGIA_INWESTOWANIA_COURSE_ID}
        moduleBasePath="/kursy/materialy/psychologia-inwestowania"
        lessons={lessons}
      />

      <div className="mt-10">
        <Link
          href="/kursy"
          className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          ← Wróć do kursów
        </Link>
      </div>
    </div>
  );
}
