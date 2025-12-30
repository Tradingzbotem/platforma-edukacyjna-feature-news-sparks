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
        <Link className="underline" href={`/kursy/${coursePath}/${nextSlug ?? ""}`}>Następna lekcja →</Link>
      </nav>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="zaawansowane"
      courseTitle="Zaawansowane"
      lessonNumber={3}
      title="Statystyka wyników: rozkłady, drawdown, risk of ruin, Monte Carlo"
      minutes={15}
      prevSlug="lekcja-2"
      nextSlug="lekcja-4"
    >
      <section>
        <h2 className="text-xl font-semibold">Rozkład wyników ≠ normalny</h2>
        <p className="mt-2 text-slate-300">
          Wyniki w R często mają „grube ogony”. Oceniaj medianę, kwartyle i 5–10 percentyl, a nie tylko średnią.
          Zwracaj uwagę na asymetrię (np. rzadkie duże zyski vs częstsze małe straty).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Drawdown (DD)</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Max DD</strong> — największy spadek kapitału od szczytu (w R lub %).</li>
          <li><strong>Time to Recover</strong> — jak długo trwa powrót do ATH.</li>
          <li>Dobierz 1R tak, by typowy DD nie łamał Twojej psychiki (i planu).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Risk of Ruin</h2>
        <p className="mt-2 text-slate-300">
          Przybliżenia RoR opierają się na EV, wariancji i kapitale. Z doświadczenia — zmniejszenie ryzyka/trade z 1% do 0.5%
          często obcina RoR kilkukrotnie bez dużej utraty tempa wzrostu.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Monte Carlo</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Losuj kolejność zagrań (lub bootstrapuj wyniki), aby poznać spektrum ścieżek kapitału.</li>
          <li>Patrz na 5–10 percentyl <em>najgorszych</em> DD — to Twoja „poduszka bezpieczeństwa”.</li>
          <li>Testuj różne ryzyko/trade i zobacz, gdzie DD staje się nieakceptowalny.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zadanie</h2>
        <p className="mt-2 text-slate-300">
          Weź 100 ostatnich wyników w R, wykonaj 1000 permutacji Monte Carlo. Zanotuj medianę EV, 10-percentyl Max DD
          i dobierz ryzyko/trade tak, aby 10-percentyl mieścił się w Twojej tolerancji.
        </p>
      </section>
    </LessonLayout>
  );
}
