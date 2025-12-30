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
      lessonNumber={4}
      title="Sizing pro: Kelly (częściowy), fixed-fractional, volatility targeting i portfel"
      minutes={15}
      prevSlug="lekcja-3"
      nextSlug="lekcja-5"
    >
      <section>
        <h2 className="text-xl font-semibold">Fixed-fractional vs Kelly</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Fixed-fractional</strong> — stały % kapitału na 1R (np. 0.5%): proste, przewidywalne DD.</li>
          <li><strong>Kelly</strong> — maksymalny wzrost, ale olbrzymia zmienność; praktycznie używamy <em>części Kelly</em> (0.25–0.5×).</li>
        </ul>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-3">
          <h3 className="font-semibold">Orientacyjny wzór</h3>
          <p className="text-slate-300 mt-1">
            Kelly ≈ <code>EV / Var</code> (w R). Wrażliwe na ogony — używaj z pokorą i zawsze częściowo.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Volatility targeting</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Skaluj lot odwrotnie do ATR/σ: wysoka vol → mniejszy lot, niska vol → większy.</li>
          <li>Na poziomie portfela: wagi ~ 1/σ (lub 1/σ²), by zrównoważyć ryzyko między strategiami/rynkami.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Portfel i korelacje</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Silnie skorelowane pomysły nie są niezależnymi źródłami alfa.</li>
          <li>Limity na czynniki (np. „risk-on beta”, „USD-beta”) i łączną ekspozycję.</li>
          <li>Testuj, jak agregacja strategii zmienia DD i EV (często poprawia ścieżkę PnL).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenie</h2>
        <p className="mt-2 text-slate-300">
          Dla 3 rynków policz ATR i zaproponuj wagi 1/vol. Zasymuluj PnL portfela vs pojedynczy rynek (w R).
          Dobierz risk/trade, by 10-percentyl DD (z Monte Carlo) mieścił się w Twoim limicie.
        </p>
      </section>
    </LessonLayout>
  );
}
