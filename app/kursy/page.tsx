// app/kursy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

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
};

function PageHeader() {
  return (
    <header className="space-y-3">
      {/* Pasek powrotny + skróty sekcji */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/10"
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
            className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/10"
          >
            Moduły
          </Link>
          <Link
            href="#materialy"
            className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/10"
          >
            Materiały
          </Link>
          <Link
            href="#egzaminy"
            className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/10"
          >
            Egzaminy
          </Link>
        </nav>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Kursy</h1>
        <p className="text-white/70">
          Wybierz ścieżkę lub materiał dodatkowy. Zacznij od „Podstaw”, a potem
          przechodź do kolejnych modułów – wszystko w tempie dopasowanym do Ciebie.
        </p>
      </div>
    </header>
  );
}

function Intro() {
  return (
    <section
      aria-labelledby="intro-title"
      className="grid md:grid-cols-2 gap-5"
    >
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 id="intro-title" className="text-xl font-bold">
          Czego się nauczysz
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden />
            Fundamentów rynku: pipsy/loty, zlecenia (market/limit/stop), dźwignia
            i mechanika wykonania zleceń w praktyce.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-sky-400" aria-hidden />
            Analizy i procesu: S/R, momentum, zarządzanie ryzykiem, R-multiple,
            dziennik transakcyjny i checklisty decyzyjne.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden />
            Ram operacyjnych: rollover/swap, godziny sesji, wpływ danych makro,
            margin & equity, dobre praktyki wykonawcze.
          </li>
        </ul>
        <p className="mt-4 text-xs text-white/60">
          Materiały mają charakter wyłącznie edukacyjny i nie stanowią porad ani
          rekomendacji inwestycyjnych.
        </p>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h3 className="text-xl font-bold">Jak wykorzystasz w praktyce</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-fuchsia-400" aria-hidden />
            Budowanie planu gry: definicja setupów, kryteria wejścia/wyjścia,
            parametry ryzyka i harmonogram pracy na rynku.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-cyan-400" aria-hidden />
            Ćwiczenie na danych: rozwiąż{" "}
            <Link href="/quizy" className="underline underline-offset-2 decoration-white/30 hover:decoration-white">
              quizy kontrolne
            </Link>{" "}
            i sprawdź kalkulacje w{" "}
            <Link href="/symulator" className="underline underline-offset-2 decoration-white/30 hover:decoration-white">
              kalkulatorze/symulatorze
            </Link>
            .
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden />
            Operacyjnie: znajomość kosztów (spread/poślizg/swap), zarządzanie
            wielkością pozycji i przygotowanie pod wydarzenia makro.
          </li>
        </ul>
        <div className="mt-4 flex gap-2">
          <Link
            href="/quizy"
            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            aria-label="Przejdź do quizów"
          >
            Rozwiąż quiz
          </Link>
          <Link
            href="/symulator"
            className="px-3 py-1.5 text-sm rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
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
    <section id={id} className="space-y-4 scroll-mt-24" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-2xl font-bold">
        {title}
      </h2>
      {/* Mniejsze kafelki → gęstsza siatka */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}

function Card({ tag, title, description, href, cta = "Otwórz" }: CardProps) {
  return (
    <div className="h-full rounded-2xl bg-[#0b1220] border border-white/10 p-4 flex flex-col shadow-[0_0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition-shadow">
      {tag ? (
        <span className="inline-block text-[10px] tracking-wide uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-md w-fit text-white/70">
          {tag}
        </span>
      ) : (
        <span className="h-4" aria-hidden="true" />
      )}

      <div className="mt-2">
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>
        {description ? (
          <p className="mt-2 text-white/70 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <Link
          href={href}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label={`${cta}: ${title}`}
        >
          {cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Strona
   ────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 space-y-10 text-white">
      <PageHeader />

      {/* WPROWADZENIE */}
      <Intro />

      {/* GŁÓWNE MODUŁY */}
      <Section id="moduly" title="Główne moduły">
        <Card
          tag="Podstawy"
          title="Podstawy"
          description="Praktyczne ABC inwestowania: jak czytać notowania i świece, rodzaje zleceń (market/limit/stop), działanie dźwigni i marginu oraz jak policzyć wielkość pozycji w pips/lot. To baza pod dalsze moduły oraz quizy kontrolne."
          href="/kursy/podstawy/lekcja-1"
          cta="Rozpocznij"
        />
        <Card
          tag="Forex"
          title="Forex"
          description="Struktura i specyfika par walutowych, różnice kwotowań, sesje i godziny największej płynności, wpływ danych makro (NFP, CPI) na spready i zmienność. Zestaw dobrych praktyk wykonawczych i checklist decyzyjnych."
          href="/kursy/forex/lekcja-1"
          cta="Rozpocznij"
        />
        <Card
          tag="CFD"
          title="CFD — indeksy i surowce"
          description="Mechanika CFD na US100/US500, DAX oraz surowce (złoto, ropa). Koszty (spread, swap, poślizg), rollover oraz zarządzanie wielkością pozycji przy różnych godzinach handlu. Zrozumienie ekspozycji i ryzyka w praktyce."
          href="/kursy/cfd/lekcja-1"
          cta="Rozpocznij"
        />
        <Card
          tag="Pro"
          title="Zaawansowane"
          description="Budowa przewagi (edge) i EV, backtest z kontrolą OOS, Monte Carlo, sizing (np. Kelly/vol-target), runbook operacyjny i elementy psychologii procesu. Moduł układa wiedzę w spójny system pracy."
          href="/kursy/zaawansowane/lekcja-1"
          cta="Rozpocznij"
        />
      </Section>

      {/* MATERIAŁY DODATKOWE */}
      <Section id="materialy" title="Materiały dodatkowe">
        <Card
          title="Analiza techniczna"
          description="Sposoby identyfikacji trendu i konsolidacji, strefy S/R, średnie i momentum oraz praca na wielu interwałach (multi-TF). Zestaw ćwiczeń i przykładowych scenariuszy do wykorzystania w planie gry."
          href="/kursy/materialy/analiza-techniczna"
        />
        <Card
          title="Formacje świecowe"
          description="Pin bar, engulfing, inside bar w realnym kontekście: gdzie mają sens, a gdzie zawodzą. Najczęstsze błędy interpretacyjne i checklisty potwierdzeń, by unikać sygnałów o niskiej jakości."
          href="/kursy/materialy/formacje-swiecowe"
        />
        <Card
          title="Psychologia inwestowania"
          description="Błędy poznawcze i pułapki emocjonalne, dyscyplina wykonawcza, nawyki i retrospektywa po sesji. Jak budować rutynę sprzyjającą konsekwencji bez wchodzenia w rekomendacje."
          href="/kursy/materialy/psychologia"
        />
        <Card
          title="Kalendarz ekonomiczny"
          description="Przegląd tygodnia makro, rozpoznawanie publikacji o podwyższonym ryzyku, praktyki przygotowania (zawężanie ryzyka, przerwy w handlu) i omówienie wpływu danych na spready i poślizg."
          href="/kursy/materialy/kalendarz"
        />
      </Section>

      {/* EGZAMINY / REGULACJE */}
      <Section id="egzaminy" title="Egzaminy / regulacje">
        <Card
          tag="Regulacje"
          title="Przewodnik: KNF, ESMA, MiFID"
          description="Kluczowe pojęcia: test adekwatności, ochrona klienta, ryzyka, KID/KIID i dokumentacja. Zrozumiesz ramy regulacyjne, w których porusza się broker i klient detaliczny."
          href="/kursy/egzaminy/przewodnik"
        />
        <Card
          tag="Regulacje"
          title="KNF — ścieżka nauki"
          description="Zakres tematyczny, przykładowe pytania kontrolne oraz materiał uzupełniający. Kładziemy nacisk na odpowiedzialną edukację i rozumienie ryzyk instrumentów z dźwignią."
          href="/kursy/egzaminy/knf"
        />
        <Card
          tag="Regulacje"
          title="CySEC — ścieżka nauki"
          description="Reguły wspólne UE, wymogi informacyjne i podstawy zgodności (compliance). Materiał porządkuje terminy i przygotowuje do dalszego samodzielnego zgłębiania przepisów."
          href="/kursy/egzaminy/cysec"
        />
      </Section>
    </main>
  );
}
