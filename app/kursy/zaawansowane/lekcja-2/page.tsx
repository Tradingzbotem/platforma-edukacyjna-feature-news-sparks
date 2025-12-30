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
      lessonNumber={2}
      title="Backtest: OOS, walk-forward, unikanie przecieku (leakage)"
      minutes={16}
      prevSlug="lekcja-1"
      nextSlug="lekcja-3"
    >
      <section>
        <h2 className="text-xl font-semibold">Po co OOS?</h2>
        <p className="mt-2 text-slate-300">
          Wynik tylko <em>in-sample</em> (na danych, na których stroisz parametry) bywa iluzją. Walidacja na <strong>OOS</strong> (out-of-sample)
          sprawdza, czy edge jest prawdziwy, a nie „dopasowany”.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Minimalny workflow</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1">
          <li>Podziel dane (np. 70% IN / 30% OOS) z zachowaniem chronologii.</li>
          <li>Stroisz tylko na IN → zamrażasz parametry.</li>
          <li>Walidujesz na OOS. Jeśli OK → prosty <strong>walk-forward</strong> (kilka okien kroczących).</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Unikaj leakage</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Żadnych informacji z przyszłości (look-ahead). Agregaty tylko do momentu decyzji.</li>
          <li>Uważaj na strefy czasowe i timestampy (decyzja vs egzekucja).</li>
          <li>W backteście dodaj koszt: spread, prowizja, typowy slippage.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Jak oceniać stabilność?</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>EV/Sharpe/PF: porównaj IN vs OOS — szukamy degradacji, ale nie zapaści.</li>
          <li>Parametry: mała wrażliwość = większa szansa na realny edge.</li>
          <li>Walk-forward: wyniki zbliżone między oknami → stabilniej.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenie</h2>
        <p className="mt-2 text-slate-300">
          Zrób backtest 100–200 sygnałów, potem OOS i prosty walk-forward (np. 3 okna). Zapisz różnice metryk
          i wypisz 3 hipotezy, czemu OOS spadł (lub nie) względem IN.
        </p>
      </section>
    </LessonLayout>
  );
}
