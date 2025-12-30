import Link from "next/link";
import type { ReactNode } from "react";

/** Lokalny szablon – w TYM pliku */
function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
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
      <Link href={`/kursy/${coursePath}`} className="text-sm underline">← Wróć do spisu</Link>

      <header className="space-y-1">
        <p className="text-slate-400 text-sm">
          <span>{courseTitle}</span>
          <span> — </span>
          <span>Lekcja</span> <span>{lessonNumber}</span>
          <span> • ⏱ </span>
          <span>{minutes}</span> <span>min</span>
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>

      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-6">
        {children}
      </article>

      <nav className="flex items-center justify-between">
        <Link className="underline" href={`/kursy/${coursePath}/${prevSlug ?? ""}`}>← Poprzednia lekcja</Link>
        <span />
      </nav>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="forex"
      courseTitle="Forex"
      lessonNumber={5}
      title="Plan transakcyjny i dziennik"
      minutes={12}
      prevSlug="lekcja-4"
    >
      {/* CELE LEKCJI */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
          <li>Ułożyć <strong>jednostronicowy plan</strong> z jasnymi regułami wejść/wyjść i zarządzania ryzykiem.</li>
          <li>Stworzyć <strong>checklisty rutyn</strong> (przed/po sesji) i scorecard jakości sygnału.</li>
          <li>Wdrożyć <strong>dziennik transakcyjny</strong> z metrykami do regularnego przeglądu.</li>
        </ul>
      </section>

      {/* DLACZEGO PLAN */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Dlaczego plan i dziennik są kluczowe</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-4">
            <h3 className="font-semibold text-emerald-300">Plan = standard działania</h3>
            <p className="mt-1 text-slate-300">
              Zdejmuje ciężar improwizacji, porządkuje decyzje i skraca czas reakcji. To „ramy”, w których poruszasz się konsekwentnie.
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/5 border border-sky-400/20 p-4">
            <h3 className="font-semibold text-sky-300">Dziennik = zwrot z doświadczenia</h3>
            <p className="mt-1 text-slate-300">
              Dane → analiza → decyzje. Bez zapisu nie wiesz, co faktycznie działa i gdzie uciekają R-ki.
            </p>
          </div>
        </div>
      </section>

      {/* STRUKTURA PLANU */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Struktura planu transakcyjnego (1 strona)</h2>
        <div className="grid md:grid-cols-2 gap-4 text-slate-300">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">1) Zakres i rynki</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>TF główny/wyzwalający (np. H1/M15).</li>
              <li>Instrumenty (2–4 pary max; korelacje uwzględnione).</li>
              <li>Sesje handlu (np. Londyn + nakładka NY).</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">2) Setupy</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Warunki wejścia (trend/konsolidacja, S/R, sygnał).</li>
              <li>Typ zlecenia (Market/Limit/Stop) i kontekst.</li>
              <li>Lokacja SL/TP (za swingiem, wg ATR, R:R min).</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">3) Ryzyko i wielkość pozycji</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Stałe <strong>1R</strong> (np. 0.5–1% salda).</li>
              <li>Limity: dzienny −2R, tygodniowy −5R.</li>
              <li>Volatility targeting (ATR↑ → loty↓).</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">4) Wykonanie i zarządzanie</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Bracket: SL/TP od razu, bez „gołych” pozycji.</li>
              <li>Plan trailingu (opcjonalnie) i częściowych realizacji.</li>
              <li>Reguła przerwy po limicie lub 3 stratach z rzędu.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SCORECARD SETUPU */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Scorecard jakości sygnału (A/B/C)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-4">
            <h3 className="font-semibold text-emerald-300">A — wysokiej jakości</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
              <li>Zbieżność: trend, S/R, sygnał, sesja.</li>
              <li>R:R ≥ 2.0 po kosztach.</li>
              <li>Niski spread/poślizg (czas dnia OK).</li>
            </ul>
          </div>
          <div className="rounded-xl bg-amber-500/5 border border-amber-400/20 p-4">
            <h3 className="font-semibold text-amber-300">B — średnia jakość</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
              <li>Brak jednego elementu (np. gorsza sesja).</li>
              <li>R:R około 1.5–2.0.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-rose-500/5 border border-rose-400/20 p-4">
            <h3 className="font-semibold text-rose-300">C — niebiorę</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
              <li>R:R &lt; 1.5 lub brak kontekstu.</li>
              <li>Wysoki spread/poślizg (np. minuta po newsie).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RUTYNY I CHECKLISTY */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Rutyny — checklisty przed/po sesji</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Przed sesją</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
              <li>Kalendarz danych (czerwone eventy).</li>
              <li>Trend/struktura na TF wyższym.</li>
              <li>Poziomy S/R i scenariusze (breakout/pullback).</li>
              <li>Ryzyko 1R ustawione w kalkulatorze.</li>
              <li>Brak korelacji z otwartymi pozycjami.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Po sesji</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
              <li>Uzupełnij dziennik: screeny, R i komentarz.</li>
              <li>Oceń scorecard (A/B/C) i jakość wykonania.</li>
              <li>Aktualizuj metryki (winrate, avg R, net R).</li>
              <li>1 wniosek na jutro (konkretny, mierzalny).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DZIENNIK — SZABLONY */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Dziennik transakcyjny — co zapisywać</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-black/30 border border-white/10 p-4">
            <h3 className="font-semibold">Przed wejściem</h3>
            <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">
{`Setup: Pullback do S/R w trendzie wzrostowym (M15 w zgodzie z H1)
Wejście: Buy Limit 1.0865 (konfluencja z VWAP)
SL/TP: 1.0850 / 1.0905  → R:R ≈ 2.7
Ryzyko: 1R = 0.8% salda; lot = 0.27 (kalkulator)
Scorecard: A (zbieżność + sesja Londyn)
Notatka: Unikać wejść w 1 min po newsach.`}
            </pre>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-4">
            <h3 className="font-semibold">Po wyjściu</h3>
            <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">
{`Wynik: +2.1R (częściowa realizacja przy 1.5R)
Wykonanie: zgodnie z planem; trailing aktywny dopiero po 1.5R
Emocje: neutralne; brak FOMO po TP
Wnioski: dobry wybór sesji; powtórzyć schemat.`}
            </pre>
          </div>
        </div>
      </section>

      {/* METRYKI */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Metryki do śledzenia</h2>
        <div className="grid md:grid-cols-3 gap-4 text-slate-300">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Skuteczność</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Winrate (w %).</li>
              <li>Średni zysk/strata w R.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Efektywność</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Net R / tydzień / miesiąc.</li>
              <li>CTR setupów A/B (ile branych vs dostępnych).</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Kontrola ryzyka</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Maks. DD (w R i %).</li>
              <li>Średni poślizg/spread (po kosztach).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRZEGLĄD TYGODNIA */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Przegląd tygodnia (30–45 min)</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
          <li>Policz metryki: winrate, avg R, net R, DD.</li>
          <li>Przejrzyj screeny zwycięzców i przegranych — co łączy grupy?</li>
          <li>Wybierz <strong>1</strong> działanie na kolejny tydzień (np. zakaz trade’u 5 min po newsie).</li>
          <li>Zaktualizuj plan/dziennik (wersjonowanie zmian, krótka notatka „dlaczego”).</li>
        </ol>
      </section>

      {/* NAJCZĘSTSZE BŁĘDY */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Najczęstsze błędy i jak je ujarzmić</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
          <li><strong>Overtrading</strong> — limit dzienny/tygodniowy, przerwa po 3 stratach.</li>
          <li><strong>Brak 1R</strong> — wymuszone liczenie lota przed wejściem (kalkulator).</li>
          <li><strong>FOMO po newsach</strong> — zakaz handlu X minut po publikacji.</li>
          <li><strong>Niekompletny dziennik</strong> — minimalny szablon + nawyk 5 minut po sesji.</li>
        </ul>
      </section>

      {/* ZADANIE + QUIZ */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
        <h2 className="text-xl font-semibold">Zadanie</h2>
        <p className="text-slate-300">
          Zbuduj 1-stronicowy plan i szablon dziennika. Wykonaj <strong>10 transakcji na demo</strong>, policz metryki
          (winrate, avg R, net R, DD) i zapisz 3 wnioski na kolejny tydzień.
        </p>

        <h3 className="font-semibold">Mini-quiz</h3>
        <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
          <li>Co to jest 1R i jak go używasz w praktyce?</li>
          <li>Podaj trzy elementy scorecard „A”.</li>
          <li>Wymień dwie metryki, które monitorujesz co tydzień.</li>
        </ol>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="flex flex-wrap gap-3">
          <Link href="/symulator" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">
            Otwórz kalkulatory (loty / margin)
          </Link>
          <Link href="/kursy/forex" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            ← Wróć do spisu lekcji
          </Link>
        </div>
      </section>
    </LessonLayout>
  );
}
