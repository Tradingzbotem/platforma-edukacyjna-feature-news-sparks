'use client';

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

/** Lokalny szablon lekcji — w TYM samym pliku */
function LessonLayout({
  coursePath,
  courseTitle,
  lessonNumber,
  title,
  minutes,
  children,
  prevSlug,
  nextSlug,
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
      <Link href={`/kursy/${coursePath}`} className="text-sm underline">
        ← Wróć do spisu
      </Link>

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

      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-8">
        {children}
      </article>

      <nav className="flex items-center justify-between">
        {prevSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${prevSlug}`}>
            ← Poprzednia lekcja
          </Link>
        ) : (
          <span />
        )}

        {nextSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${nextSlug}`}>
            Następna lekcja →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}

/* ────────────────────── UI helpers ────────────────────── */
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

/* ────────────────────── Logika kalkulatorów ────────────────────── */
type Pair = "EURUSD" | "GBPUSD" | "USDJPY" | "AUDUSD" | "USDCAD" | "USDCHF" | "EURPLN";
type AccountCcy = "USD" | "EUR" | "PLN";

const pipSizeFor = (pair: Pair) => (pair.endsWith("JPY") ? 0.01 : 0.0001);
const quoteCcyOf = (pair: Pair): "USD" | "JPY" | "CHF" | "CAD" | "PLN" | "EUR" => pair.slice(3) as any;

/** Wartość pipsa: bazowo pipSize * 100 000 w walucie kwotowanej → przelicz na walutę konta */
function usePipValue({
  pair,
  lots,
  price,
  convQuoteToAccount,
}: {
  pair: Pair;
  lots: number;
  price: number;
  convQuoteToAccount: number; // 1 waluta kwotowana = X waluta konta
}) {
  const pipSize = pipSizeFor(pair);
  const pipPerLotInQuote = pipSize * 100_000; // dla 1.00 lota
  // wyjątek: pary, gdzie potrzebna jest zależność od ceny (np. USDJPY przy koncie USD – i tak rozwiązujemy to przez conv)
  const pipPerLotInAccount = pipPerLotInQuote * (convQuoteToAccount || 1);
  const pipForLots = pipPerLotInAccount * (lots || 0);
  return { pipSize, pipPerLotInAccount, pipForLots };
}

/** Carry/rollover — uproszczone przybliżenie edukacyjne na bazie różnicy stóp rocznych */
function estimateDailyCarry({
  baseRate,
  quoteRate,
  notional, // nominal w walucie kwotowanej
  position, // long/short pary
}: {
  baseRate: number; // % rocznie
  quoteRate: number; // % rocznie
  notional: number;
  position: "long" | "short";
}) {
  // Dla longa w parze BASE/QUOTE "pożyczasz" QUOTE i "lokujesz" BASE → znak zależy od (baseRate - quoteRate)
  // Dla shorta odwrotnie (znak się odwraca).
  const diff = (baseRate - quoteRate) / 100; // jako ułamek
  const daily = (notional * diff) / 365;
  return position === "long" ? daily : -daily;
}

/* ────────────────────── Lekcja: strona ────────────────────── */
export default function Page() {
  /* Kalkulator 1: pips & spread */
  const [accountCcy, setAccountCcy] = useState<AccountCcy>("USD");
  const [pair, setPair] = useState<Pair>("EURUSD");
  const [price, setPrice] = useState<number>(1.085); // kurs pary
  const [lots, setLots] = useState<number>(0.20);
  const [conv, setConv] = useState<number>(1); // 1 waluta kwotowana = X waluta konta
  const [spreadPips, setSpreadPips] = useState<number>(0.8);

  const { pipSize, pipPerLotInAccount, pipForLots } = usePipValue({
    pair,
    lots,
    price,
    convQuoteToAccount: conv || 1,
  });
  const spreadCost = useMemo(() => (Math.max(0, spreadPips) * Math.max(0, pipForLots)), [spreadPips, pipForLots]);

  /* Kalkulator 2: rollover/carry */
  const [baseRate, setBaseRate] = useState<number>(4.0);
  const [quoteRate, setQuoteRate] = useState<number>(5.0);
  const [position, setPosition] = useState<"long" | "short">("long");
  const notionalPerLot = 100_000; // 1.00 lot FX
  const notional = (notionalPerLot * Math.max(0, lots)) * (conv || 1); // w walucie konta (przyjmijmy uproszczenie)
  const dailyCarry = useMemo(() => estimateDailyCarry({ baseRate, quoteRate, notional, position }), [baseRate, quoteRate, notional, position]);

  return (
    <LessonLayout
      coursePath="forex"
      courseTitle="Forex"
      lessonNumber={1}
      title="Wprowadzenie do rynku walutowego"
      minutes={18}
      nextSlug="lekcja-2"
    >
      {/* CELE */}
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Rozumiesz strukturę par (base/quote), kwotowania <strong>bid/ask</strong> i koszt <strong>spreadu</strong>.</li>
          <li>Wiesz czym są <strong>pips</strong> i <strong>lot</strong>, umiesz oszacować wartość ruchu i koszt wejścia.</li>
          <li>Kojarzysz sesje (Tokio/Londyn/Nowy Jork) i ich typową aktywność.</li>
          <li>Wiesz czym jest <strong>rollover (swap/carry)</strong> i od czego zależy znak (+/−).</li>
        </ul>
      </section>

      {/* Czym jest Forex */}
      <section>
        <h2 className="text-xl font-semibold">Forex — jak to działa?</h2>
        <p className="mt-2 text-slate-300">
          Rynek walutowy (FX) to rynek <strong>OTC</strong> (pozagiełdowy) działający 24/5. Handlujemy parami walut, np. <code>EURUSD</code>,
          gdzie <strong>EUR</strong> to waluta bazowa (base), a <strong>USD</strong> — kwotowana (quote). Kwotowanie 1.0850 oznacza:
          1 EUR kosztuje 1.0850 USD.
        </p>

        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Majors</h3>
            <p className="text-slate-300 mt-1 text-sm">EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD — najpłynniejsze, zwykle niższy spread.</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Minors (crossy)</h3>
            <p className="text-slate-300 mt-1 text-sm">EURGBP, EURJPY, GBPJPY itd. Spread bywa wyższy, zależnie od pary/sesji.</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Exotics</h3>
            <p className="text-slate-300 mt-1 text-sm">EURPLN, USDZAR itp. Niższa płynność, szerszy spread i częściej większy poślizg.</p>
          </div>
        </div>
      </section>

      {/* Bid/Ask/Spread */}
      <section>
        <h2 className="text-xl font-semibold">Bid / Ask / Spread</h2>
        <p className="mt-2 text-slate-300">
          Market maker wystawia dwie ceny: <strong>bid</strong> (po której <em>sprzedasz</em> bazową) i <strong>ask</strong> (po której <em>kupisz</em> bazową).
          Różnica to <strong>spread</strong> — Twój startowy koszt wejścia/wyjścia. Po danych makro spread może się rozszerzać.
        </p>
        <div className="rounded-xl bg-amber-500/5 border border-amber-400/20 p-4 mt-3 text-sm">
          <strong>Przykład:</strong> EURUSD 1.0849/1.0851 → spread 2 pipsy. Dla 0.20 lota 1 pip ≈ 2 USD → koszt wejścia ≈ 4 USD + prowizja (jeśli jest).
        </div>
      </section>

      {/* Sesje i zmienność */}
      <section>
        <h2 className="text-xl font-semibold">Sesje i zmienność</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300">
          <li><strong>Tokio (APAC)</strong> – często konsolidacja (wyjątki: JPY/AUD/NZD).</li>
          <li><strong>Londyn (EU)</strong> – największa płynność; impuls dnia.</li>
          <li><strong>Nowy Jork (US)</strong> – druga fala ruchu; ważna „nakładka” EU–US.</li>
        </ul>
        <p className="text-xs text-white/50 mt-2">Strategię dopasuj do pory dnia (range vs. momentum), pamiętając o kalendarzu makro.</p>
      </section>

      {/* Rollover / Swap */}
      <section>
        <h2 className="text-xl font-semibold">Rollover (swap/carry)</h2>
        <p className="mt-2 text-slate-300">
          Jeśli przetrzymujesz pozycję przez „noc” (cut-off u brokera), naliczane są punkty swapowe. Ich znak zależy
          od różnicy stóp procentowych walut w parze i kierunku pozycji (long/short). W środy często księgowany jest potrójny swap (weekend).
        </p>
      </section>

      {/* Kalkulator 1: Pips & spread */}
      <section>
        <h2 className="text-xl font-semibold">Mini-kalkulator: wartość pipsa i koszt spreadu</h2>
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
              </Select>
            </Field>
            <Field label="Cena (kurs pary)">
              <NumberInput value={price} onChange={(e) => setPrice(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">
                Dla USDJPY 1 pip = 0.01. Konwersję ustaw niżej (np. JPY→USD ≈ 1/price).
              </div>
            </Field>
            <Field label="Loty">
              <NumberInput value={lots} onChange={(e) => setLots(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label={`1 ${quoteCcyOf(pair)} = X ${accountCcy}`}>
              <NumberInput value={conv} onChange={(e) => setConv(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">
                Jeśli waluta kwotowana = waluta konta → wpisz <strong>1</strong>. W innym przypadku wpisz kurs konwersji (quote→konto).
              </div>
            </Field>
            <Field label="Spread (pips)">
              <NumberInput value={spreadPips} onChange={(e) => setSpreadPips(parseFloat(e.target.value || "0"))} />
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Pip (krok notowań): <strong>{pipSize}</strong></div>
              <div>1 pip / 1 lot (w {accountCcy}):{" "}
                <strong>{pipPerLotInAccount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {accountCcy}</strong>
              </div>
              <div>1 pip dla {lots.toFixed(2)} lot:{" "}
                <strong>{pipForLots.toLocaleString(undefined, { maximumFractionDigits: 4 })} {accountCcy}</strong>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Koszt spreadu na wejściu:{" "}
                <strong>{spreadCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} {accountCcy}</strong>
              </div>
              <div className="text-xs text-white/50 mt-1">
                W praktyce dolicza się też prowizja (na kontach ECN) i ewentualny poślizg.
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Kalkulator 2: Carry */}
      <section>
        <h2 className="text-xl font-semibold">Mini-kalkulator: rollover / carry</h2>
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stopa bazowa (BASE, % rocznie)">
              <NumberInput value={baseRate} onChange={(e) => setBaseRate(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Stopa kwotowana (QUOTE, % rocznie)">
              <NumberInput value={quoteRate} onChange={(e) => setQuoteRate(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Pozycja">
              <Select value={position} onChange={(e) => setPosition(e.target.value as "long" | "short")}>
                <option value="long">Long (kupno pary)</option>
                <option value="short">Short (sprzedaż pary)</option>
              </Select>
            </Field>
            <Field label="Nominał (liczony ≈ z lotów)">
              <NumberInput disabled value={notional} />
              <div className="mt-1 text-xs text-white/50">
                Przybliżenie: 1.00 lot ≈ 100&nbsp;000; przemnożone przez konwersję do waluty konta.
              </div>
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
            <div>
              Szacowany <strong>swap dzienny</strong>:{" "}
              <span className={dailyCarry >= 0 ? "text-emerald-300 font-semibold" : "text-rose-300 font-semibold"}>
                {dailyCarry.toLocaleString(undefined, { maximumFractionDigits: 2 })} {accountCcy} / dzień
              </span>
            </div>
            <div className="text-xs text-white/50 mt-1">
              Edukacyjne przybliżenie. Rzeczywiste punkty swapowe zależą od brokera, instrumentu i dnia tygodnia (środowy „potrójny” rollover).
            </div>
          </div>
        </Card>
      </section>

      {/* Przykład liczbowy */}
      <section>
        <h2 className="text-xl font-semibold">Przykład liczbowy</h2>
        <p className="mt-2 text-slate-300">
          Kupujesz EURUSD <strong>0.50</strong> lota przy 1.0850, <strong>SL = 15</strong> pips, <strong>TP = 30</strong> pips.
          Dla EURUSD 1 pip / 1 lot ≈ 10 USD → dla 0.50 lota: ≈ 5 USD/pip.
          Ryzyko ≈ 15 × 5 = <strong>75 USD</strong> (1R). Potencjalny zysk ≈ 30 × 5 = <strong>150 USD</strong> (2R).
        </p>
      </section>

      {/* Uważaj na */}
      <section>
        <h2 className="text-xl font-semibold">Uważaj na</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Szeroki spread i poślizg na danych (CPI, NFP, decyzje banków centralnych).</li>
          <li>Za duże loty względem SL — utrata kontroli nad 1R.</li>
          <li>Swap przy długim przetrzymaniu pozycji — szczególnie na parach o dużej różnicy stóp.</li>
        </ul>
      </section>

      {/* Checklista + ćwiczenia */}
      <section>
        <h2 className="text-xl font-semibold">Checklist & ćwiczenia</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Checklist przed wejściem</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-300 text-sm">
              <li>Kalendarz makro czysty w horyzoncie setupu?</li>
              <li>SL/TP wynikają z techniki (S/R, ATR), a loty z 1R?</li>
              <li>Spread/poślizg nie niszczy R:R?</li>
              <li>Masz plan na rollover, jeśli pozycja przejdzie przez noc?</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-semibold">Ćwiczenia (5–10 min)</h3>
            <ol className="mt-2 list-decimal pl-6 space-y-1 text-slate-300 text-sm">
              <li>Policz koszt spreadu dla EURUSD przy 0.30 lota i spreadzie 0.9 pipsa.</li>
              <li>Załóż 1R = 0.8% konta i SL = 18 pipsów. Ile lotów otworzysz?</li>
              <li>Stopy: BASE 3.5%, QUOTE 5.0%. Jaki będzie znak carry na longu i na shortcie?</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="text-xs text-white/50">
        Materiały mają charakter edukacyjny i nie stanowią rekomendacji inwestycyjnych.
      </section>
    </LessonLayout>
  );
}
