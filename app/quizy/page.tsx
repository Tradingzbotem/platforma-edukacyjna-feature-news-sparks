// app/quizy/page.tsx
// SSR-only: filtr po tagu (?tag=FX|CFD|REG|PRO|EXTRA|START) i wyszukiwarka (?q=)
// Liczba pytań pobierana z QUIZZES. Kafelki bez paczki → "Wkrótce".

import Link from "next/link";
import type { Metadata } from "next";
import type { QuizPack } from "@/data/quizzes";
import { QUIZZES } from "@/data/quizzes";
import { QuizListClient } from "@/components/QuizListClient";
import { QuizyHeroEngagement } from "@/components/QuizyHeroEngagement";
import AccessGuard from "../components/AccessGuard";

export const metadata: Metadata = {
  title: "Quizy | FX EduLab",
  description:
    "Quizy kontrolne: utrwalenie wiedzy z modułów, wykrywanie luk i przygotowanie do praktyki oraz tematów regulacyjnych.",
};

type CardMeta = {
  slug: string;
  tag: "START" | "FX" | "CFD" | "PRO" | "EXTRA" | "REG";
  title: string;
  blurb: string;
};

const CARDS: CardMeta[] = [
  {
    slug: "podstawy",
    tag: "START",
    title: "Podstawy",
    blurb: "Rynek, pipsy/loty, zlecenia, dźwignia, sesje, spread.",
  },
  {
    slug: "forex",
    tag: "FX",
    title: "Forex",
    blurb: "Pary walutowe, wartość pipsa, sesje, ryzyko i praktyka.",
  },
  {
    slug: "cfd",
    tag: "CFD",
    title: "CFD",
    blurb: "Mechanika kontraktów, margin, rollover/financing, indeksy/surowce.",
  },
  {
    slug: "zaawansowane",
    tag: "PRO",
    title: "Zaawansowane",
    blurb: "Edge/EV, R:R, Kelly, backtest OOS, pułapki statystyczne.",
  },
  {
    slug: "materialy",
    tag: "EXTRA",
    title: "Materiały",
    blurb: "AT, patterny świecowe, psychologia, kalendarz makro.",
  },
  {
    slug: "regulacje",
    tag: "REG",
    title: "Regulacje w praktyce",
    blurb: "Kwalifikacja klienta, ryzyko i komunikat, dokumenty i koszty, wykonanie, marketing — scenariusze jak w pracy.",
  },
];

async function unwrap<T>(x: T | Promise<T>): Promise<T> {
  return x instanceof Promise ? await x : x;
}

function getPack(slug: string): QuizPack | undefined {
  return (QUIZZES as Record<string, QuizPack | undefined>)[slug];
}
function getCount(slug: string): number {
  return getPack(slug)?.questions.length ?? 0;
}

function HeroStatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03]",
        "px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        "min-w-[8.5rem]",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-white/90">{value}</p>
    </div>
  );
}

function PathFlowArrow() {
  return (
    <div
      className="hidden lg:flex items-center justify-center shrink-0 w-9 xl:w-11 min-h-[2.5rem] select-none"
      aria-hidden
    >
      <span className="text-2xl xl:text-[1.75rem] font-normal leading-none text-emerald-300/85 mix-blend-normal drop-shadow-[0_0_14px_rgba(52,211,153,0.45),0_0_1px_rgba(255,255,255,0.5)]">
        →
      </span>
    </div>
  );
}

function QuizPathStrip() {
  const steps = [
    {
      id: "start",
      n: "01",
      title: "Start",
      desc: "Baza: mechanika rynku i zleceń.",
      href: "#quizy-glowne",
    },
    {
      id: "fx",
      n: "02",
      title: "Forex",
      desc: "Pary, sesje, wykonanie w praktyce.",
      href: "#quizy-glowne",
    },
    {
      id: "cfd",
      n: "03",
      title: "CFD",
      desc: "Kontrakty, koszty, ekspozycja.",
      href: "#quizy-glowne",
    },
  ] as const;

  const lastBoxClass = [
    "flex-1 min-w-0 rounded-xl border border-white/12",
    "bg-gradient-to-b from-white/[0.09] to-white/[0.04]",
    "px-3.5 py-3 md:px-4",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    "transition-colors duration-200 hover:border-emerald-400/25 hover:bg-white/[0.07]",
  ].join(" ");

  return (
    <section id="quizy-path" aria-labelledby="quiz-path-title" className="space-y-3 scroll-mt-24">
      <h2 id="quiz-path-title" className="text-sm font-semibold text-white">
        Ścieżka quizów
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch lg:flex-nowrap lg:gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 min-w-0 items-stretch gap-0">
            {i > 0 ? <PathFlowArrow /> : null}
            <Link
              href={s.href}
              scroll
              className={[
                lastBoxClass,
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45",
              ].join(" ")}
            >
              <p className="text-[10px] font-mono tabular-nums text-emerald-400/55 mb-0.5">{s.n}</p>
              <p className="text-sm font-semibold text-white/88 leading-tight">{s.title}</p>
              <p className="mt-1 text-xs text-white/55 leading-snug line-clamp-2">{s.desc}</p>
            </Link>
          </div>
        ))}
        <div className="flex flex-1 min-w-0 items-stretch gap-0">
          <PathFlowArrow />
          <div className={lastBoxClass}>
            <p className="text-[10px] font-mono tabular-nums text-emerald-400/55 mb-0.5">04</p>
            <p className="text-sm font-semibold text-white/88 leading-tight">Zaawansowane / regulacje</p>
            <p className="mt-1 text-xs text-white/55 leading-snug">
              <Link
                href="#quizy-glowne"
                scroll
                className="underline underline-offset-2 decoration-white/20 hover:decoration-emerald-400/50 text-white/70 hover:text-white/90"
              >
                Quiz Pro
              </Link>
              <span className="text-white/35" aria-hidden>
                {" "}
                ·{" "}
              </span>
              <Link
                href="#quizy-regulacje"
                scroll
                className="underline underline-offset-2 decoration-white/20 hover:decoration-emerald-400/50 text-white/70 hover:text-white/90"
              >
                regulacje
              </Link>
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-white/40">
        Kolejność odpowiada ścieżce modułów na{" "}
        <Link
          href="/kursy"
          className="underline underline-offset-2 decoration-white/15 hover:decoration-white/40 text-white/55 hover:text-white/70"
        >
          /kursy
        </Link>
        . Kliknięcie przewinie do wybranej sekcji listy.
      </p>
    </section>
  );
}

function QuizIntroCards() {
  const bullet =
    "mt-1.5 shrink-0 inline-block w-1.5 h-1.5 rounded-full ring-1 ring-white/15 opacity-80";
  const panel =
    "rounded-2xl bg-white/[0.015] backdrop-blur-sm border border-white/[0.04] p-3.5 md:p-4 transition-colors duration-200 hover:border-white/[0.055]";

  return (
    <section
      aria-labelledby="quiz-intro-why"
      className="grid md:grid-cols-2 gap-3 md:gap-4 opacity-[0.92]"
    >
      <div className={panel}>
        <h2 id="quiz-intro-why" className="text-base font-semibold text-white/65">
          Po co robić quizy
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-white/46">
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-emerald-500/70`} aria-hidden />
            Utrwalają wiedzę z lekcji w formie decyzji — szybciej niż same notatki.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-sky-500/70`} aria-hidden />
            Pokazują luki: które definicje lub liczenia są jeszcze „płytkie”.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-amber-500/70`} aria-hidden />
            Spinają moduły w jedną linię: od podstaw, przez FX/CFD, po pro i regulacje.
          </li>
        </ul>
      </div>
      <div className={panel}>
        <h3 className="text-base font-semibold text-white/65">Jak z nich korzystać</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-white/46">
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-fuchsia-500/70`} aria-hidden />
            Po bloku lekcji uruchom quiz z danego modułu — najpierw pełny, potem ewentualnie szybki powtórka.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-cyan-500/70`} aria-hidden />
            Tryb egzaminu: mniej podpowiedzi, więcej presji czasowej — dobry test przed certyfikatem lub poważniejszym materiałem.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-rose-500/70`} aria-hidden />
            Wynik i postęp zapisują się lokalnie; możesz wyczyścić zapis i zacząć od zera bez zmiany treści quizu.
          </li>
        </ul>
      </div>
    </section>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; tag?: string } | Promise<{ q?: string; tag?: string }>;
}) {
  const sp = searchParams ? await unwrap(searchParams) : undefined;
  const q = (sp?.q ?? "").toString().trim().toLowerCase();
  const tag = (sp?.tag ?? "ALL").toString().toUpperCase() as "ALL" | CardMeta["tag"];

  const cardsFiltered = CARDS.filter((c) => {
    const tagOk = tag === "ALL" ? true : c.tag === tag;
    const qOk = !q ? true : (c.title + " " + c.blurb).toLowerCase().includes(q);
    return tagOk && qOk;
  });

  const totalOpen = CARDS.filter((c) => Boolean(getPack(c.slug))).length;
  const totalQuestions = CARDS.reduce((acc, c) => acc + getCount(c.slug), 0);

  const liveQuizSummaries = CARDS.filter((c) => Boolean(getPack(c.slug))).map((c) => ({
    slug: c.slug,
    title: c.title,
    questionsCount: getCount(c.slug),
  }));

  return (
    <AccessGuard required="auth">
      <main className="mx-auto max-w-6xl p-6 md:p-8 text-white animate-fade-in min-h-screen">
        <div className="space-y-3">
          <header className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 hover:scale-105 px-3 py-1.5 text-sm border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
                  aria-label="Wróć na stronę główną"
                >
                  ← Strona główna
                </Link>
                <nav
                  className="hidden md:flex items-center gap-2 text-sm"
                  aria-label="Szybka nawigacja po sekcjach quizów"
                >
                  <Link
                    href="#quizy-glowne"
                    className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Główne
                  </Link>
                  <Link
                    href="#quizy-materialy"
                    className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Materiały
                  </Link>
                  <Link
                    href="#quizy-regulacje"
                    className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Regulacje
                  </Link>
                </nav>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90 mb-1.5">
                  Strefa sprawdzenia wiedzy
                </p>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                  Quizy — sprawdź wiedzę i domknij naukę w praktyce
                </h1>
                <p className="mt-2 text-sm md:text-base text-white/75 max-w-2xl leading-snug">
                  Krótkie testy po modułach: utrwalasz pojęcia, widzisz braki i przygotowujesz się do głębszej pracy oraz
                  tematów regulacyjnych. To ten sam język co na ścieżce{" "}
                  <Link
                    href="/kursy"
                    className="underline underline-offset-2 decoration-white/20 hover:decoration-white/45 text-white/80 hover:text-white"
                  >
                    kursów
                  </Link>
                  — tylko w formie pytań.
                </p>
                <p className="mt-2 text-sm text-white/55 max-w-2xl leading-snug">
                  Dostęp do listy jest otwarty; przy starcie quizu wybierasz tryb (szybki, pełny lub egzamin) w pasku narzędzi
                  poniżej.
                </p>
                <QuizyHeroEngagement liveQuizzes={liveQuizSummaries} />
              </div>
              <div
                className="shrink-0 flex flex-wrap gap-2 lg:flex-col lg:items-stretch lg:max-w-[220px]"
                aria-label="Skrótowe statystyki quizów"
              >
                <HeroStatChip label="Quizy (dostępne / w katalogu)" value={`${totalOpen} / ${CARDS.length}`} />
                <HeroStatChip label="Pytań łącznie (wszystkie paczki)" value={totalQuestions} />
                <HeroStatChip label="Tryb startu" value="Wybór w toolbarze" />
              </div>
            </div>
          </header>

          <QuizPathStrip />
          <QuizIntroCards />
        </div>

        <div className="mt-10 md:mt-14">
          <QuizListClient
            cards={cardsFiltered.map((c) => ({
              slug: c.slug,
              tag: c.tag,
              title: c.title,
              blurb: c.blurb,
              questionsCount: getCount(c.slug),
              live: Boolean(getPack(c.slug)),
            }))}
          />
        </div>
      </main>
    </AccessGuard>
  );
}
