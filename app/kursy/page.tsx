// app/kursy/page.tsx
import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AccessGuard from "../components/AccessGuard";
import { getSession } from "@/lib/session";
import KursyExamTrackCardClient from "@/components/kursy/KursyExamTrackCardClient";

const EGZAMINY_CTA_PRZEWODNIK = { notStarted: "Przejdź do przygotowania" };
const EGZAMINY_CTA_EXAM_TRACK = { notStarted: "Przejdź do egzaminu" };
import {
  moduleProgressBadgeClass,
  moduleProgressLabel,
} from "@/components/kursy/kursyModuleProgressBadge";
import { EXAM_TRACK_KURSY_LOCAL } from "@/lib/examTrackLocalProgress";
import type { KursyModuleProgress } from "@/lib/kursyModuleProgressTypes";
import {
  getKursyExtraMaterialsProgress,
  getKursyMainModulesProgress,
  getKursyRegulacjeProgress,
} from "@/lib/kursyProgress";

/* ──────────────────────────────────────────────────────────────
   SEO / metadata
   ────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Kursy | FX EduLab",
  description:
    "Wybierz moduł nauki: Podstawy, Forex, CFD oraz Zaawansowane. Wprowadzenie, materiały dodatkowe i ścieżki egzaminacyjne – wyłącznie edukacja.",
};

/* ──────────────────────────────────────────────────────────────
   Typy i małe komponenty
   ────────────────────────────────────────────────────────────── */
type CardProps = {
  tag?: string;
  title: string;
  description?: string;
  href: string;
  cta?: string;
  /** Link do quizu podsumowującego moduł (np. `/quizy/podstawy`). */
  summaryQuizHref?: string;
  /** Etykieta przycisku quizu; domyślnie krótki tekst pod głównym CTA. */
  summaryQuizLabel?: string;
  /** Postęp modułu: główne kursy z `lesson_progress`, materiały dodatkowe z sesji (`courseProgress`). */
  moduleProgress?: KursyModuleProgress;
  /** Jednostka licznika (np. „bloków” dla ścieżek egzaminowych). */
  progressUnit?: string;
};

function PageHeader() {
  return (
    <header className="space-y-2">
      {/* Pasek powrotny + skróty sekcji */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 hover:scale-105 px-3 py-1.5 text-sm border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
          aria-label="Wróć na stronę główną"
        >
          ← Strona główna
        </Link>

        {/* Szybka nawigacja po sekcjach (kotwice) */}
        <nav
          className="hidden md:flex items-center gap-2 text-sm"
          aria-label="Szybka nawigacja po sekcjach"
        >
          <Link
            href="#moduly"
            className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Moduły
          </Link>
          <Link
            href="#materialy"
            className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Materiały
          </Link>
          <Link
            href="#egzaminy"
            className="rounded-lg bg-white/5 hover:bg-white/10 hover:scale-105 px-3 py-1.5 border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Egzaminy
          </Link>
        </nav>
      </div>

      <div className="pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90 mb-1.5">
          Ścieżka nauki
        </p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
          Kursy — zacznij od podstaw i buduj system
        </h1>
        <p className="mt-2 text-sm md:text-base text-white/75 max-w-2xl leading-snug">
          Zacznij od Podstaw, przejdź przez Forex i CFD, a następnie rozwijaj przewagę w
          Zaawansowanych modułach.
        </p>
      </div>
    </header>
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

function LearningPathStrip() {
  const secondary = [
    {
      n: "02",
      title: "Forex",
      desc: "Pary walutowe, sesje i makro w praktyce wykonania.",
    },
    {
      n: "03",
      title: "CFD",
      desc: "Indeksy i surowce: koszty, rollover i ekspozycja.",
    },
    {
      n: "04",
      title: "Zaawansowane",
      desc: "Edge, testy, sizing i spójny system operacyjny.",
    },
  ] as const;

  return (
    <section aria-labelledby="learning-path-title" className="space-y-3">
      <h2 id="learning-path-title" className="text-sm font-semibold text-white">
        Ścieżka nauki
      </h2>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,300px)_minmax(2.25rem,2.75rem)_1fr] lg:grid-rows-[auto_auto] lg:gap-x-0 lg:gap-y-1.5">
        {/* Start: karta + CTA — na lg dzieci siatki przez contents */}
        <div className="flex flex-col items-center gap-1.5 w-full lg:contents">
          <div
            className={[
              "relative w-full overflow-hidden rounded-2xl border-2 border-emerald-400/70",
              "bg-gradient-to-br from-emerald-500/[0.22] via-emerald-950/25 to-[#070d14]",
              "px-5 py-5 md:px-6 md:py-6",
              "shadow-[0_0_32px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]",
              "ring-2 ring-emerald-400/30",
              "lg:col-start-1 lg:row-start-1 lg:self-start",
            ].join(" ")}
          >
            <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/92 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              START TUTAJ
            </span>
            <p className="text-xs font-mono tabular-nums text-emerald-300/90 mb-1 pr-[5.5rem]">
              01
            </p>
            <p className="text-lg md:text-xl font-bold text-white leading-tight tracking-tight">
              Podstawy
            </p>
            <p className="mt-1.5 text-sm text-white/80 leading-snug line-clamp-2 md:line-clamp-none">
              Notowania, zlecenia, dźwignia — baza pod całą ścieżkę.
            </p>
          </div>

          <Link
            href="/kursy/podstawy"
            className="inline-flex w-full max-w-[300px] items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold bg-emerald-500 text-white hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 transition-all duration-200 ease-out hover:scale-105 shadow-[0_0_32px_rgba(16,185,129,0.48),0_0_60px_rgba(52,211,153,0.18),0_10px_28px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.55),0_0_72px_rgba(52,211,153,0.22),0_12px_32px_rgba(0,0,0,0.45)] lg:col-start-1 lg:row-start-2 lg:justify-self-center"
            aria-label="Zacznij od modułu Podstawy"
          >
            Zacznij od Podstaw
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Separator mobile */}
        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent lg:hidden"
          aria-hidden
        />

        <div className="hidden lg:flex lg:col-start-2 lg:row-start-1 items-center justify-center min-h-0 min-w-0">
          <PathFlowArrow />
        </div>

        <div className="flex flex-1 min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:col-start-3 lg:row-start-1 lg:self-start lg:flex-row lg:items-stretch lg:gap-0">
          {secondary.map((s, i) => (
            <Fragment key={s.n}>
              {i > 0 ? <PathFlowArrow /> : null}
              <div
                className={[
                  "flex-1 min-w-0 rounded-xl border border-white/12",
                  "bg-gradient-to-b from-white/[0.09] to-white/[0.04]",
                  "px-3 py-2.5 md:px-3.5 md:py-3",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                ].join(" ")}
              >
                <p className="text-[10px] font-mono tabular-nums text-emerald-400/55 mb-0.5">
                  {s.n}
                </p>
                <p className="text-sm font-semibold text-white/82 leading-tight">{s.title}</p>
                <p className="mt-0.5 text-xs text-white/58 leading-tight line-clamp-2 lg:line-clamp-1">
                  {s.desc}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const bullet =
    "mt-1.5 shrink-0 inline-block w-1.5 h-1.5 rounded-full ring-1 ring-white/15 opacity-80";

  const panel =
    "rounded-2xl bg-white/[0.015] backdrop-blur-sm border border-white/[0.04] p-3.5 md:p-4 transition-colors duration-200 hover:border-white/[0.055]";

  return (
    <section
      aria-labelledby="intro-title"
      className="grid md:grid-cols-2 gap-3 md:gap-4 opacity-[0.92]"
    >
      <div className={panel}>
        <h2 id="intro-title" className="text-base font-semibold text-white/65">
          Czego się nauczysz
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-white/46">
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-emerald-500/70`} aria-hidden />
            Fundamentów rynku: pipsy/loty, zlecenia (market/limit/stop), dźwignia
            i mechanika wykonania zleceń w praktyce.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-sky-500/70`} aria-hidden />
            Analizy i procesu: S/R, momentum, zarządzanie ryzykiem, R-multiple,
            dziennik transakcyjny i checklisty decyzyjne.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-amber-500/70`} aria-hidden />
            Ram operacyjnych: rollover/swap, godziny sesji, wpływ danych makro,
            margin & equity, dobre praktyki wykonawcze.
          </li>
        </ul>
        <p className="mt-3 text-xs text-white/36">
          Materiały mają charakter wyłącznie edukacyjny i nie stanowią porad ani
          rekomendacji inwestycyjnych.
        </p>
      </div>

      <div className={panel}>
        <h3 className="text-base font-semibold text-white/65">Jak wykorzystasz w praktyce</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-white/46">
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-fuchsia-500/70`} aria-hidden />
            Budowanie planu gry: definicja setupów, kryteria wejścia/wyjścia,
            parametry ryzyka i harmonogram pracy na rynku.
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-cyan-500/70`} aria-hidden />
            Ćwiczenie na danych: rozwiąż{" "}
            <Link href="/quizy" className="underline underline-offset-2 decoration-white/20 hover:decoration-white/50 text-white/55 hover:text-white/70">
              quizy kontrolne
            </Link>{" "}
            i sprawdź kalkulacje w{" "}
            <Link href="/symulator" className="underline underline-offset-2 decoration-white/20 hover:decoration-white/50 text-white/55 hover:text-white/70">
              kalkulatorze/symulatorze
            </Link>
            .
          </li>
          <li className="flex items-start gap-2.5">
            <span className={`${bullet} bg-rose-500/70`} aria-hidden />
            Operacyjnie: znajomość kosztów (spread/poślizg/swap), zarządzanie
            wielkością pozycji i przygotowanie pod wydarzenia makro.
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/quizy"
            className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white/55 transition-all duration-200"
            aria-label="Przejdź do quizów"
          >
            Rozwiąż quiz
          </Link>
          <Link
            href="/symulator"
            className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.08] text-white/70 font-medium hover:bg-white/[0.11] border border-white/[0.06] transition-all duration-200"
            aria-label="Przejdź do kalkulatora"
          >
            Kalkulator
          </Link>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-24 animate-fade-in" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-2xl font-bold text-white">
        {title}
      </h2>
      {/* Mniejsze kafelki → gęstsza siatka */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}

function Card({
  tag,
  title,
  description,
  href,
  cta = "Otwórz",
  summaryQuizHref,
  summaryQuizLabel = "Quiz podsumowujący",
  moduleProgress,
  progressUnit = "lekcji",
}: CardProps) {
  const linkHref = moduleProgress?.actionHref ?? href;
  const linkCta = moduleProgress?.cta ?? cta;

  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] border border-white/10 p-4 flex flex-col shadow-sm hover:shadow-lg hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 backdrop-blur-sm">
      <div className="flex flex-wrap items-start gap-2 min-h-[1.25rem]">
        {tag ? (
          <span className="inline-block text-[10px] tracking-wide uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-md w-fit text-white/70 shadow-sm">
            {tag}
          </span>
        ) : (
          <span className="h-4" aria-hidden="true" />
        )}
        {moduleProgress ? (
          <span
            className={`inline-block text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md border ${moduleProgressBadgeClass(moduleProgress.state)}`}
          >
            {moduleProgressLabel(moduleProgress.state)}
          </span>
        ) : null}
      </div>

      <div className="mt-2">
        <h3 className="text-lg font-semibold leading-snug text-white">{title}</h3>
        {moduleProgress ? (
          <p className="mt-1.5 text-xs text-white/50 tabular-nums">
            {moduleProgress.doneLessons} / {moduleProgress.totalLessons} {progressUnit}
          </p>
        ) : null}
        {description ? (
          <p className="mt-2 text-white/70 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex w-full flex-col gap-2">
        <Link
          href={linkHref}
          className="inline-flex w-full items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:opacity-90 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label={`${linkCta}: ${title}`}
        >
          {linkCta}
          <span aria-hidden>→</span>
        </Link>
        {summaryQuizHref ? (
          <Link
            href={summaryQuizHref}
            className="inline-flex w-full items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 border-emerald-400/70 bg-emerald-500/20 text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.12)] hover:bg-emerald-500/30 hover:border-emerald-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
            aria-label={`${summaryQuizLabel} — moduł ${title}`}
          >
            {summaryQuizLabel}
            <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Strona — odczyt postępu: getSession + lesson_progress (serwer, bez osobnego API).
   ────────────────────────────────────────────────────────────── */

export default async function Page() {
  const session = await getSession();
  const progressMap = await getKursyMainModulesProgress(session.userId);
  const pRegulacje = await getKursyRegulacjeProgress(session.userId);
  const extraProgress = getKursyExtraMaterialsProgress(session.courseProgress);

  const pPod = progressMap.get("podstawy")!;
  const pFx = progressMap.get("forex")!;
  const pCfd = progressMap.get("cfd")!;
  const pAdv = progressMap.get("zaawansowane")!;

  const pAt = extraProgress.get("analiza-techniczna")!;
  const pFormacje = extraProgress.get("formacje-swiecowe")!;
  const pPsy = extraProgress.get("psychologia-inwestowania")!;
  const pKal = extraProgress.get("kalendarz-ekonomiczny")!;

  return (
    <AccessGuard required="auth">
      <main className="mx-auto max-w-6xl p-6 md:p-8 text-white animate-fade-in">
      <div className="space-y-3">
        <PageHeader />
        <LearningPathStrip />
        {/* WPROWADZENIE */}
        <Intro />
      </div>

      <div className="mt-12 md:mt-20 space-y-10">
      {/* GŁÓWNE MODUŁY */}
      <Section id="moduly" title="Główne moduły">
        <Card
          tag="Podstawy"
          title="Podstawy"
          description="Praktyczne ABC inwestowania: jak czytać notowania i świece, rodzaje zleceń (market/limit/stop), działanie dźwigni i marginu oraz jak policzyć wielkość pozycji w pips/lot. To baza pod dalsze moduły oraz quizy kontrolne."
          href="/kursy/podstawy"
          cta="Rozpocznij"
          summaryQuizHref="/quizy/podstawy"
          moduleProgress={pPod}
        />
        <Card
          tag="Forex"
          title="Forex"
          description="Struktura i specyfika par walutowych, różnice kwotowań, sesje i godziny największej płynności, wpływ danych makro (NFP, CPI) na spready i zmienność. Zestaw dobrych praktyk wykonawczych i checklist decyzyjnych."
          href="/kursy/forex"
          cta="Rozpocznij"
          summaryQuizHref="/quizy/forex"
          moduleProgress={pFx}
        />
        <Card
          tag="CFD"
          title="CFD — indeksy i surowce"
          description="Mechanika CFD na US100/US500, DAX oraz surowce (złoto, ropa). Koszty (spread, swap, poślizg), rollover oraz zarządzanie wielkością pozycji przy różnych godzinach handlu. Zrozumienie ekspozycji i ryzyka w praktyce."
          href="/kursy/cfd"
          cta="Rozpocznij"
          summaryQuizHref="/quizy/cfd"
          moduleProgress={pCfd}
        />
        <Card
          tag="Pro"
          title="Zaawansowane"
          description="Budowa przewagi (edge) i EV, backtest z kontrolą OOS, Monte Carlo, sizing (np. Kelly/vol-target), runbook operacyjny i elementy psychologii procesu. Moduł układa wiedzę w spójny system pracy."
          href="/kursy/zaawansowane"
          cta="Rozpocznij"
          summaryQuizHref="/quizy/zaawansowane"
          moduleProgress={pAdv}
        />
      </Section>

      {/* MATERIAŁY DODATKOWE */}
      <Section id="materialy" title="Materiały dodatkowe">
        <Card
          tag="AT"
          title="Analiza techniczna"
          description="Sposoby identyfikacji trendu i konsolidacji, strefy S/R, średnie i momentum oraz praca na wielu interwałach (multi-TF). Zestaw ćwiczeń i przykładowych scenariuszy do wykorzystania w planie gry."
          href="/kursy/materialy/analiza-techniczna"
          moduleProgress={pAt}
        />
        <Card
          tag="Formacje"
          title="Formacje świecowe"
          description="Pin bar, engulfing, inside bar w realnym kontekście: gdzie mają sens, a gdzie zawodzą. Najczęstsze błędy interpretacyjne i checklisty potwierdzeń, by unikać sygnałów o niskiej jakości."
          href="/kursy/materialy/formacje-swiecowe"
          moduleProgress={pFormacje}
        />
        <Card
          tag="Psycho"
          title="Psychologia inwestowania"
          description="Błędy poznawcze i pułapki emocjonalne, dyscyplina wykonawcza, nawyki i retrospektywa po sesji. Jak budować rutynę sprzyjającą konsekwencji bez wchodzenia w rekomendacje."
          href="/kursy/materialy/psychologia-inwestowania"
          moduleProgress={pPsy}
        />
        <Card
          tag="Makro"
          title="Kalendarz ekonomiczny"
          description="Przegląd tygodnia makro, rozpoznawanie publikacji o podwyższonym ryzyku, praktyki przygotowania (zawężanie ryzyka, przerwy w handlu) i omówienie wpływu danych na spready i poślizg."
          href="/kursy/materialy/kalendarz-ekonomiczny"
          moduleProgress={pKal}
        />
      </Section>

      {/* EGZAMINY / REGULACJE */}
      <Section id="egzaminy" title="Egzaminy / regulacje">
        <Card
          tag="FOUNDATION"
          title="Regulacje i egzaminy"
          description="Kompleksowy kurs o regulacjach finansowych: MiFID II, ESMA, KNF, testy adekwatności, best execution, ochrona klienta, limity dźwigni, marketing i compliance. Przygotowanie do egzaminów regulacyjnych."
          href="/kursy/regulacje"
          cta="Rozpocznij naukę"
          moduleProgress={pRegulacje}
        />
        <KursyExamTrackCardClient
          tag="PREPARATION"
          title="Przewodnik: KNF, ESMA, MiFID"
          description="Kluczowe pojęcia: test adekwatności, ochrona klienta, ryzyka, KID/KIID i dokumentacja. Zrozumiesz ramy regulacyjne, w których porusza się broker i klient detaliczny."
          href="/kursy/egzaminy/przewodnik"
          ctaLabels={EGZAMINY_CTA_PRZEWODNIK}
          storageKey={EXAM_TRACK_KURSY_LOCAL.przewodnik.storageKey}
          totalBlocks={EXAM_TRACK_KURSY_LOCAL.przewodnik.totalBlocks}
        />
        <KursyExamTrackCardClient
          tag="EXAM TRACK"
          title="KNF — program przygotowania"
          description="Zakres tematyczny, przykładowe pytania kontrolne oraz materiał uzupełniający. Kładziemy nacisk na odpowiedzialną edukację i rozumienie ryzyk instrumentów z dźwignią."
          href="/kursy/egzaminy/knf"
          ctaLabels={EGZAMINY_CTA_EXAM_TRACK}
          storageKey={EXAM_TRACK_KURSY_LOCAL.knf.storageKey}
          totalBlocks={EXAM_TRACK_KURSY_LOCAL.knf.totalBlocks}
        />
        <KursyExamTrackCardClient
          tag="EXAM TRACK"
          title="CySEC — ścieżka CIF"
          description="Reguły wspólne UE, wymogi informacyjne i podstawy zgodności (compliance). Materiał porządkuje terminy i przygotowuje do dalszego samodzielnego zgłębiania przepisów."
          href="/kursy/egzaminy/cysec"
          ctaLabels={EGZAMINY_CTA_EXAM_TRACK}
          storageKey={EXAM_TRACK_KURSY_LOCAL.cysec.storageKey}
          totalBlocks={EXAM_TRACK_KURSY_LOCAL.cysec.totalBlocks}
        />
      </Section>
      </div>
    </main>
    </AccessGuard>
  );
}
