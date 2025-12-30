'use client';

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

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
      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-8">{children}</article>
      <nav className="flex items-center justify-between">
        {prevSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${prevSlug}`}>← Poprzednia lekcja</Link>
        ) : <span/>}
        {nextSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${nextSlug}`}>Następna lekcja →</Link>
        ) : <span/>}
      </nav>
    </main>
  );
}

/* ───────────────────── UI helpers ───────────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">{children}</div>;
}
function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-white/70">{label}</div>
      {children}
      {help ? <div className="mt-1 text-xs text-white/50">{help}</div> : null}
    </label>
  );
}
function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      inputMode="decimal"
      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
    />
  );
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
    />
  );
}

/* ───────────────────── Logika lekcji ───────────────────── */
type Pair = "EURUSD" | "GBPUSD" | "USDJPY" | "AUDUSD" | "USDCAD" | "USDCHF" | "EURPLN" | "GBPJPY";
type AccountCcy = "USD" | "EUR" | "PLN";

const pipSizeFor = (pair: Pair) => (pair.endsWith("JPY") ? 0.01 : 0.0001);
const quoteCcyOf = (pair: Pair): "USD" | "JPY" | "CHF" | "CAD" | "PLN" | "EUR" => pair.slice(3) as any;

/** pip per 1 lot (w walucie kwotowanej), następnie konwersja do waluty konta */
function usePipValue({
  pair, lots, convQuoteToAccount,
}: {
  pair: Pair;
  lots: number;
  convQuoteToAccount: number; // 1 waluta kwotowana = X waluta konta
}) {
  const pipSize = pipSizeFor(pair);
  const pipPerLotInQuote = pipSize * 100_000; // standard FX
  const pipPerLotInAccount = pipPerLotInQuote * (convQuoteToAccount || 1);
  const pipForLots = pipPerLotInAccount * (lots || 0);
  return { pipSize, pipPerLotInAccount, pipForLots };
}

export default function Page() {
  /* Kalkulator 1: wartość pipsa */
  const [accountCcy, setAccountCcy] = useState<AccountCcy>("USD");
  const [pair, setPair] = useState<Pair>("EURUSD");
  const [price, setPrice] = useState<number>(1.085); // kurs pary (przydatny do podpowiedzi konwersji dla JPY)
  const [lots, setLots] = useState<number>(0.10);
  const [conv, setConv] = useState<number>(1); // 1 QUOTE = X ACCOUNT

  // Drobna podpowiedź: dla konta USD na USDJPY często wygodne ~ 1/price
  const autoHint =
    pair === "USDJPY" && accountCcy === "USD"
      ? (price ? (1 / price) : 0)
      : 1;

  const { pipSize, pipPerLotInAccount, pipForLots } = usePipValue({
    pair, lots, convQuoteToAccount: conv || 1,
  });

  /* Kalkulator 2: loty z 1R */
  const [balance, setBalance] = useState<number>(10_000);
  const [riskPct, setRiskPct] = useState<number>(1);
  const [slPips, setSlPips] = useState<number>(20);

  const riskCash = useMemo(() => balance * (Math.max(0, riskPct) / 100), [balance, riskPct]);
  const lotsFromRisk = useMemo(() => {
    const denom = Math.max(0.0000001, slPips * pipPerLotInAccount);
    return riskCash / denom;
  }, [riskCash, slPips, pipPerLotInAccount]);

  return (
    <LessonLayout
      coursePath="forex"
      courseTitle="Forex"
      lessonNumber={2}
      title="Pipsy, punkty i loty"
      minutes={16}
      prevSlug="lekcja-1"
      nextSlug="lekcja-3"
    >
      {/* CELE */}
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozróżnisz <strong>pips</strong> (np. 0.0001) i <strong>punkt</strong> (np. 0.00001) w 5-cyfrowych kwotowaniach.</li>
          <li>Policzysz wartość 1 pipsa dla 1.00 / 0.10 / 0.01 lota na różnych parach (w tym JPY).</li>
          <li>Obliczysz <strong>wielkość pozycji</strong> ze stałego 1R dla danego SL (w pipsach).</li>
        </ul>
      </section>

      {/* Teoria */}
      <section className="prose prose-invert prose-slate max-w-none">
        <h2>Definicje i niuanse</h2>
        <ul>
          <li><strong>Pip</strong> — standardowy krok notowań: na EURUSD zwykle <code>0.0001</code>, na parach z JPY <code>0.01</code>.</li>
          <li><strong>Punkt</strong> — najmniejsza zmiana w kwotowaniu brokera (często 10 punktów = 1 pips na majors).</li>
          <li><strong>Lot</strong> — 1.00 lot = 100&nbsp;000 jednostek waluty bazowej; dostępne mini (0.10), mikro (0.01).</li>
          <li><strong>Wartość pipsa</strong> dla 1 lota ≈ <code>pipSize × 100&nbsp;000</code> w walucie <em>kwotowanej</em>, potem przelicz do waluty konta.</li>
        </ul>

        <h3>Przykłady</h3>
        <ul>
          <li><strong>EURUSD (konto USD):</strong> 1 pip/1 lot ≈ 10 USD; 0.10 lota → ~1 USD/pip.</li>
          <li><strong>USDJPY (konto USD):</strong> 1 pip/1 lot ≈ <code>1000 / cena</code> USD (np. przy 145.00 ≈ 6.90 USD).</li>
          <li><strong>EURPLN (konto PLN):</strong> 1 pip/1 lot ≈ <code>0.0001 × 100&nbsp;000 = 10 PLN</code>.</li>
        </ul>
      </section>

      {/* Kalkulator: wartość pipsa */}
      <section>
        <h2 className="text-xl font-semibold">Kalkulator: wartość pipsa</h2>
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Waluta konta">
              <Select value={accountCcy} onChange={(e) => setAccountCcy(e.target.value as AccountCcy)}>
                <option>USD</option>
                <option>EUR</option>
                <option>PLN</option>
              </Select>
            </Field>
            <Field label="Para walutowa">
              <Select value={pair} onChange={(e) => setPair(e.target.value as Pair)}>
                <option>EURUSD</option>
                <option>GBPUSD</option>
                <option>USDJPY</option>
                <option>AUDUSD</option>
                <option>USDCAD</option>
                <option>USDCHF</option>
                <option>EURPLN</option>
                <option>GBPJPY</option>
              </Select>
            </Field>
            <Field label="Cena (kurs pary)">
              <NumberInput value={price} onChange={(e) => setPrice(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">
                Dla JPY 1 pip = 0.01. Dla konta USD na USDJPY możesz użyć konwersji ≈ <code>1/cena</code> (podpowiedź: {autoHint ? autoHint.toFixed(6) : "—"}).
              </div>
            </Field>
            <Field label="Loty">
              <NumberInput value={lots} onChange={(e) => setLots(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label={`1 ${quoteCcyOf(pair)} = X ${accountCcy}`}>
              <NumberInput value={conv} onChange={(e) => setConv(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">
                Gdy waluta kwotowana = waluta konta → wpisz <strong>1</strong>. Inaczej wpisz kurs konwersji (QUOTE→{accountCcy}).
              </div>
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Pip (krok notowań): <strong>{pipSize}</strong></div>
              <div>1 pip / 1 lot (w {accountCcy}): <strong>{pipPerLotInAccount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {accountCcy}</strong></div>
              <div>1 pip dla {lots.toFixed(2)} lot: <strong>{pipForLots.toLocaleString(undefined, { maximumFractionDigits: 4 })} {accountCcy}</strong></div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-white/80">
                Wzór: <code>pipSize × 100&nbsp;000</code> (w QUOTE) × <code>konwersja QUOTE→{accountCcy}</code> × <code>loty</code>
              </div>
              <div className="text-xs text-white/50 mt-1">Różni brokerzy mogą mieć inne mnożniki dla CFD FX — to narzędzie ma charakter edukacyjny.</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Kalkulator: loty z 1R */}
      <section>
        <h2 className="text-xl font-semibold">Kalkulator: wielkość pozycji (stałe 1R)</h2>
        <Card>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={`Saldo konta (${accountCcy})`}>
              <NumberInput value={balance} onChange={(e) => setBalance(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Ryzyko na transakcję (%)">
              <NumberInput value={riskPct} onChange={(e) => setRiskPct(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Stop-Loss (pips)">
              <NumberInput value={slPips} onChange={(e) => setSlPips(parseFloat(e.target.value || "0"))} />
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>1R (kwotowo):</div>
              <div className="text-lg font-semibold">{riskCash.toLocaleString(undefined, { maximumFractionDigits: 2 })} {accountCcy}</div>
              <div className="mt-2 text-white/70">Korzystamy z wartości 1 pips / 1 lot wyliczonej powyżej.</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Loty (≈) z 1R:</div>
              <div className="text-lg font-semibold">{isFinite(lotsFromRisk) ? lotsFromRisk.toFixed(2) : "0.00"} lot</div>
              <div className="mt-2 text-white/70">Wzór: <code>loty = 1R / (SL_pips × wartość_pipsa_1lot)</code></div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Wartość 1 pips dla tych lotów:</div>
              <div className="text-lg font-semibold">
                {(pipPerLotInAccount * Math.max(0, lotsFromRisk)).toLocaleString(undefined, { maximumFractionDigits: 2 })} {accountCcy}
              </div>
              <div className="mt-2 text-xs text-white/50">Pamiętaj o koszcie spreadu i prowizji (ECN), szczególnie na niskich SL.</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Przykłady liczbowe */}
      <section>
        <h2 className="text-xl font-semibold">Przykłady</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
            <h3 className="font-semibold">EURUSD (konto USD)</h3>
            <p className="mt-1 text-slate-300">
              1 pip/1 lot ≈ 10 USD. 1R = 40 USD, SL = 16 pips → loty ≈ 40 / (16 × 10) = <strong>0.25</strong>.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
            <h3 className="font-semibold">USDJPY (konto USD, cena 145.00)</h3>
            <p className="mt-1 text-slate-300">
              1 pip/1 lot ≈ 1000/145 ≈ 6.90 USD. 1R = 100 USD, SL = 20 pips → loty ≈ 100 / (20 × 6.90) ≈ <strong>0.72</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Checklista + ćwiczenia */}
      <section className="prose prose-invert prose-slate max-w-none">
        <h2>Checklista</h2>
        <ul>
          <li>SL wynika z techniki (S/R, ATR), a nie z „widzi-mi-się”.</li>
          <li>Lot z 1R policzony z poprawną wartością pipsa (uwzględnij walutę konta!).</li>
          <li>Spread/poślizg nie niszczy R:R (szczególnie na niskich TF i małych SL).</li>
        </ul>

        <h3>Ćwiczenia (5–10 min)</h3>
        <ol>
          <li>EURUSD, konto USD: 1R = 0.7% z 6000 USD, SL = 18 pips. Ile lotów?</li>
          <li>USDJPY 150.00, konto USD: oszacuj 1 pip/1 lot oraz loty dla 1R = 75 USD i SL = 12 pips.</li>
          <li>EURPLN, konto PLN: policz 1 pip/1 lot i 1 pip dla 0.12 lota.</li>
        </ol>
      </section>
    </LessonLayout>
  );
}
