import Link from "next/link";
import type { ReactNode } from "react";

function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
}: {
  coursePath: "zaawansowane" | "forex" | "cfd";
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
      <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-8">{children}</article>
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
      coursePath="zaawansowane"
      courseTitle="Zaawansowane"
      lessonNumber={5}
      title="Psychologia i operacyjka: rutyny, checklisty, dziennik, limity"
      minutes={13}
      prevSlug="lekcja-4"
    >
      <section>
        <h2 className="text-xl font-semibold">Rutyna przed sesją</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Kalendarz makro i wydarzenia dla Twoich rynków.</li>
          <li>Aktualizacja 1R (vol/ATR) i lista scenariuszy „jeśli A → to B”.</li>
          <li>Szybki self-check: sen/stres/rozproszenia — jeśli słabo, obniż ryzyko lub odpuść.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist wejścia i wyjścia</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Setup potwierdzony? Kontekst zgodny? Spread/slip akceptowalne?</li>
          <li>SL logiczny, TP zgodny ze statystyką (R:R, struktura, targety).</li>
          <li>Wpis do dziennika: motyw, poziomy, plan prowadzenia pozycji.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Kontrola tiltu i limity</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Limit strat na dzień/tydzień (np. 2R / 5R). Po limicie — koniec sesji.</li>
          <li>Reguła „2 straty z rzędu → przerwa 30 min / spacer”.</li>
          <li>Minimalizuj uznaniowość: przygotowane z góry scenariusze i reguły.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Dziennik i przeglądy</h2>
        <p className="mt-2 text-slate-300">
          Loguj: setup, kontekst, SL/TP, wynik w R, emocje, błąd/plus, ocena jakości (A/B/C). Co tydzień: win-rate,
          AvgWin/AvgLoss, EV, net R, Max DD, decyzje (co ograniczyć/testować). Raz w miesiącu — przegląd portfela
          i korelacji (czy coś zjada EV?).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenia</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1">
          <li>Wydrukuj checklistę wejścia/wyjścia + limity w R i trzymaj przy monitorze.</li>
          <li>Ustaw automatyczny skrót do zrzutów ekranu i notatek (usuń tarcie).</li>
          <li>Przez 2 tygodnie rób przegląd tygodniowy z metrykami i konkretną decyzją „co zmieniam”.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
