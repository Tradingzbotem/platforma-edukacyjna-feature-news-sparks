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
        <Link className="underline" href={`/kursy/${coursePath}/${nextSlug ?? ""}`}>Następna lekcja →</Link>
      </nav>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="forex"
      courseTitle="Forex"
      lessonNumber={4}
      title="Dźwignia i ryzyko"
      minutes={9}
      prevSlug="lekcja-3"
      nextSlug="lekcja-5"
    >
      {/* CELE LEKCJI */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
          <li>Rozumiesz różnicę między <strong>dźwignią</strong>, <strong>ekspozycją</strong> i <strong>marginem</strong>.</li>
          <li>Umiesz policzyć wymagany depozyt oraz wielkość pozycji przy stałym <strong>1R</strong>.</li>
          <li>Masz plan limitów (dzienny/tygodniowy) i wiesz, czym grozi margin call/stop-out.</li>
        </ul>
      </section>

      {/* DŹWIGNIA I MARGIN */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dźwignia i margin — jak to działa</h2>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="grid md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <p><strong>Dźwignia 1:30</strong> pozwala utrzymać ekspozycję 30× większą od depozytu.
                To nie „gwarancja zysku”, tylko <em>przyspieszacz</em> zysków i strat — kontrolujesz ją
                <strong> wielkością pozycji</strong>.</p>
              <p className="mt-2"><strong>Ekspozycja</strong> = contract size × loty × cena.</p>
              <p><strong>Margin</strong> (depozyt) to część środków „zablokowana”, by pozycja mogła istnieć.</p>
            </div>
            <div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <p className="text-sm text-slate-300">Wzór (waluta ceny):</p>
                <p className="mt-1 text-lg">
                  <code>Margin = (ContractSize × Loty × Cena) / Leverage</code>
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Jeśli waluta ceny ≠ waluta konta → pomnóż przez kurs przeliczeniowy.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-3">
              <h3 className="font-semibold text-emerald-300">Przykład A (EURUSD)</h3>
              <p className="mt-1 text-slate-300">
                1.00 lot, cena 1.1000, dźwignia 1:30.
                <br/>Margin ≈ (100 000 × 1 × 1.1000) / 30 = <strong>3 666.67 USD</strong>.
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/5 border border-amber-400/20 p-3">
              <h3 className="font-semibold text-amber-300">Przykład B (0.25 lota)</h3>
              <p className="mt-1 text-slate-300">
                0.25 lot, cena 1.1000, 1:30 → Margin ≈ <strong>916.67 USD</strong>.
                Mniejszy lot = mniejszy depozyt i mniejsza zmienność P/L.
              </p>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-slate-300">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <h3 className="font-semibold">Kluczowe pojęcia</h3>
              <ul className="mt-2 list-disc pl-6 space-y-2">
                <li><strong>Balance</strong> — saldo.</li>
                <li><strong>Equity</strong> — saldo + bieżący P/L.</li>
                <li><strong>Used margin</strong> — zablokowany depozyt.</li>
                <li><strong>Free margin</strong> — equity − used margin.</li>
                <li><strong>Margin level</strong> — (equity / used margin) × 100%.</li>
              </ul>
            </div>
            <div className="rounded-xl bg-rose-500/5 border border-rose-400/20 p-3">
              <h3 className="font-semibold text-rose-300">Margin call / stop-out</h3>
              <p className="mt-1 text-slate-300">
                Przy niskim <em>margin level</em> broker może najpierw ostrzec (margin call),
                a następnie zamknąć pozycje (stop-out). To powód, dla którego **sizing** i **limity strat**
                są ważniejsze niż „maks dźwignia”.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAŁE 1R I SIZING */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Stałe 1R i wielkość pozycji</h2>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-slate-300">
            <strong>1R</strong> — stałe ryzyko kwotowe na transakcję (np. 0.5–1% salda). Wielkość pozycji liczysz
            tak, aby strata przy SL = 1R, niezależnie od szerokości stopa.
          </p>

          <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
            <p className="text-sm text-slate-300">Wzór na loty (FX):</p>
            <p className="mt-1 text-lg"><code>Loty = (Ryzyko&nbsp;kwotowe) / (SL&nbsp;[pips] × wartość&nbsp;1&nbsp;pipsa dla 1.00&nbsp;lota)</code></p>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-3">
              <h3 className="font-semibold text-emerald-300">Przykład sizingu</h3>
              <p className="mt-1 text-slate-300">
                Saldo 5 000 USD, 1% = <strong>50 USD</strong>, SL = 18 pips, wartość 1 pipsa na 1.00 locie = 10 USD.
                <br/>Loty ≈ 50 / (18 × 10) = <strong>0.28</strong>.
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/5 border border-amber-400/20 p-3">
              <h3 className="font-semibold text-amber-300">Koszt wejścia</h3>
              <p className="mt-1 text-slate-300">
                Na niskich TF spread/poślizg mogą „zabrać” 0.2–0.5R — uwzględniaj to w planie
                (większy SL lub mniejszy lot).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIMITY I DRAWDOWN */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limity i drawdown</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="grid md:grid-cols-3 gap-4 text-slate-300">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <h3 className="font-semibold">Dzienny limit</h3>
              <p className="mt-1">Np. <strong>−2R</strong> — po osiągnięciu przestań handlować.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <h3 className="font-semibold">Tygodniowy limit</h3>
              <p className="mt-1">Np. <strong>−5R</strong> — pauza i przegląd dziennika.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <h3 className="font-semibold">Limit pozycji</h3>
              <p className="mt-1">Unikaj nadmiernej korelacji (np. EURUSD + GBPUSD + EURJPY jednocześnie).</p>
            </div>
          </div>
        </div>
      </section>

      {/* UWAŻAJ NA */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Uważaj na</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Wydarzenia makro (CPI, NFP, decyzje banków) → skoki, poślizg, rozszerzony spread.</li>
            <li>Weekendy i luki otwarcia — rozważ zamykanie/hedging pozycji długoterminowych.</li>
            <li>Potrójny swap w środy i dodatnie/ujemne punkty swapowe przy carry.</li>
            <li>Overtrading po stracie (revenge trading) — trzymaj <em>z góry</em> ustalone limity.</li>
          </ul>
        </div>
      </section>

      {/* CHECKLISTA */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-xl font-semibold">Checklist przed wejściem</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
          <li>Policzony lot pod <strong>1R</strong> i uwzględniony koszt wejścia (spread/poślizg).</li>
          <li>Sprawdzony kalendarz danych i sesja (płynność, spread).</li>
          <li>SL techniczny (S/R, ATR), TP logiczny (R:R, struktura).</li>
          <li>Wolny margin i <em>margin level</em> komfortowe po ewentualnej serii strat.</li>
          <li>Znane limity dzienne/tygodniowe — i gotowość do ich respektowania.</li>
        </ul>
      </section>

      {/* ĆWICZENIA */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-xl font-semibold">Ćwiczenia (5–10 min)</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
          <li>Policz margin dla 0.40 lota na EURUSD przy cenie 1.0950 i dźwigni 1:30.</li>
          <li>Saldo 3 000 USD, 1R = 0.8%, SL 22 pips → ile lotów na EURUSD?</li>
          <li>Ustal własny dzienny/tygodniowy limit i zapisz, kiedy robisz przerwę.</li>
        </ol>
      </section>

      {/* MINI-QUIZ */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h2 className="text-xl font-semibold">Mini-quiz</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
          <li>Dźwignia 1:30 oznacza: A) 30% zysku • B) ekspozycja 30× depozytu • C) 30 pozycji • D) 30% marginu</li>
          <li>Wzór na margin to: A) loty×SL • B) (CS×loty×cena)/lewar • C) equity/used • D) spread×poślizg</li>
          <li>Stop-out występuje, gdy: A) swap=0 • B) margin level spada do progu brokera • C) SL=0 • D) ATR rośnie</li>
        </ol>
        <p className="mt-2 text-slate-400 text-sm">Odpowiedzi: 1) B, 2) B, 3) B.</p>
      </section>
    </LessonLayout>
  );
}
