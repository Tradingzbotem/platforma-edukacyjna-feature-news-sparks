import Link from "next/link";
import type { ReactNode } from "react";

function LessonLayout({
  coursePath, courseTitle, title, minutes, children,
}: {
  coursePath: "materialy";
  courseTitle: string;
  title: string;
  minutes: number;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link href={`/kursy`} className="text-sm underline">← Wróć do kursów</Link>
      <header className="space-y-1">
        <p className="text-slate-400 text-sm">{courseTitle} • ⏱ {minutes} min</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
      </header>
      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-6">
        {children}
      </article>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="materialy"
      courseTitle="Materiały dodatkowe"
      title="Kalendarz ekonomiczny — jak go czytać i nie dać się zaskoczyć"
      minutes={10}
    >
      <section>
        <h2 className="text-xl font-semibold">Po co kalendarz?</h2>
        <p className="mt-2 text-slate-300">
          Kalendarz ekonomiczny porządkuje publikacje makro (CPI, NFP, decyzje banków, PMI, PKB itp.),
          pokazuje <em>czas</em>, <em>ważność</em>, <em>prognozę</em> i <em>odczyt</em>. Pozwala zaplanować
          trading (ALBO uniknąć ekspozycji) w oknach wysokiej zmienności.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h3 className="font-semibold">Filtry, na co patrzeć</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
            <li>Strefa czasowa konta / brokera.</li>
            <li>Wysoka ważność (3 „gwiazdki”).</li>
            <li>Waluty zgodne z Twoim instrumentem (USD/EUR/GBP/JPY…).</li>
            <li>Decyzje banków, CPI, NFP, dane z rynku pracy, PMI/ISM.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h3 className="font-semibold">Plan na dane</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
            <li>„Flat” przed publikacją (brak pozycji), lub mniejszy lot.</li>
            <li>Szerszy SL/TP albo brak zleceń oczekujących tuż przy cenie.</li>
            <li>Po odczycie — poczekaj na „drugi ruch” po pierwszej świecy.</li>
            <li>Sprawdź potrojony swap w środę, jeśli trzymasz pozycje.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist przed sesją</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1 text-slate-300">
          <li>Przejrzałem dzień/tydzień w kalendarzu i zaznaczyłem „czerwone” godziny.</li>
          <li>Wiem, gdzie NIE traduję (okna danych) i co robię po publikacji.</li>
          <li>Loty policzone na stałe 1R, z uwzględnieniem możliwego poślizgu.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-zadanie</h2>
        <p className="mt-2 text-slate-300">
          Wybierz tydzień z ważnymi danymi (np. decyzja FOMC). Zrób plan: kiedy grać, kiedy „flat”,
          jak zmieniasz sizing. Po zakończeniu tygodnia porównaj plan z rzeczywistością.
        </p>
      </section>
    </LessonLayout>
  );
}
