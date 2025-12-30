import Link from "next/link";
import type { ReactNode } from "react";

/** Lokalny szablon lekcji (nie wymaga importów z zewnątrz) */
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
        <span />
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
      lessonNumber={1}
      title="Edge i wartość oczekiwana (EV) — jak liczyć i utrzymać przewagę"
      minutes={14}
      nextSlug="lekcja-2"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Zdefiniujesz <strong>edge</strong> oraz <strong>EV</strong> (expectancy) w jednostkach <em>R</em>.</li>
          <li>Zrozumiesz relację <em>win-rate</em> ↔ <em>AvgWin</em> ↔ <em>AvgLoss</em>.</li>
          <li>Dowiesz się, co w realnym handlu „zjada” EV i jak temu przeciwdziałać.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Podstawy: R i EV</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>1R</strong> = stała kwota ryzyka na trade (np. 0.5% lub 1% kapitału).</li>
          <li><strong>EV (w R)</strong> = <code>WR × AvgWin − (1−WR) × AvgLoss</code>.</li>
          <li><strong>Edge</strong> = dodatnie EV po uwzględnieniu kosztów i poślizgu.</li>
        </ul>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-3">
          <h3 className="font-semibold">Przykład</h3>
          <p className="text-slate-300 mt-1">
            WR = 43%, AvgWin = 2.2R, AvgLoss = 1.0R → EV = 0.43×2.2 − 0.57×1.0 = <strong>0.376R</strong>/trade.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Czułość EV na parametry</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-4">WR</th>
                <th className="py-2 pr-4">AvgWin</th>
                <th className="py-2 pr-4">AvgLoss</th>
                <th className="py-2 pr-4">EV (R)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { wr: 0.40, aw: 2.0, al: 1.0 },
                { wr: 0.45, aw: 2.0, al: 1.0 },
                { wr: 0.40, aw: 2.2, al: 1.0 },
                { wr: 0.43, aw: 2.2, al: 1.1 },
              ].map((r) => {
                const ev = r.wr * r.aw - (1 - r.wr) * r.al;
                return (
                  <tr key={`${r.wr}-${r.aw}-${r.al}`} className="border-t border-white/10">
                    <td className="py-2 pr-4">{Math.round(r.wr*100)}%</td>
                    <td className="py-2 pr-4">{r.aw.toFixed(2)}R</td>
                    <td className="py-2 pr-4">{r.al.toFixed(2)}R</td>
                    <td className="py-2 pr-4">{ev.toFixed(3)}R</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-slate-300">
          Małe poprawki w <em>AvgLoss</em> (np. ciut ciaśniejszy, ale sensowny SL) często dają większy skok EV niż pogoń za 1–2% WR.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Co psuje EV w realu?</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozsuwanie SL („niech jeszcze oddycha”) → rośnie <em>AvgLoss</em>.</li>
          <li>Branie zbyt wcześnie profitu z obawy → spada <em>AvgWin</em>.</li>
          <li>Warunki rynkowe z szerokim spreadem/slipem → koszt zjada część R.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenia</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1">
          <li>Policz WR/AvgWin/AvgLoss/EV dla ostatnich 50–100 zagrań.</li>
          <li>Znajdź 2 działania, które najbardziej podniosą EV (np. stały trailing, filtr godzin).</li>
          <li>Ustal „regułę żelazną” minimalizującą <em>AvgLoss</em> (np. brak przenoszenia SL).</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
