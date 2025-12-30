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
        <Link className="underline" href={`/kursy/${coursePath}/${prevSlug ?? ""}`}>← Poprzednia lekcja</Link>
        <Link className="underline" href={`/kursy/${coursePath}/${nextSlug ?? ""}`}>Następna lekcja →</Link>
      </nav>
    </main>
  );
}

/* ────────────── UI helpers ────────────── */
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

/* ────────────── Asystent typu zlecenia ────────────── */
type Side = "long" | "short";
type Scenario = "breakout" | "pullback" | "natychmiast";
type Priority = "fill" | "price";
type TIF = "GTC" | "Day" | "IOC" | "FOK";

function recommendOrder(
  side: Side,
  scenario: Scenario,
  priority: Priority,
  current: number,
  entry: number
) {
  const above = entry > current;
  const below = entry < current;

  if (scenario === "natychmiast") {
    return { type: "Market", why: "Potrzebujesz wejścia tu i teraz — akceptujesz możliwy poślizg." };
  }
  if (scenario === "breakout") {
    if (priority === "fill") {
      return side === "long"
        ? { type: "Buy Stop", why: "Wejście na wybicie powyżej bieżącej ceny – priorytet pewne wykonanie." }
        : { type: "Sell Stop", why: "Wejście na wybicie w dół – priorytet pewne wykonanie." };
    } else {
      return side === "long"
        ? { type: "Buy Stop-Limit", why: "Wybicie z kontrolą maksymalnej ceny (po aktywacji realizacja z Limitem)." }
        : { type: "Sell Stop-Limit", why: "Wybicie w dół z kontrolą minimalnej akceptowalnej ceny." };
    }
  }
  // pullback
  return side === "long"
    ? { type: "Buy Limit", why: "Kupno na cofnięciu (poniżej bieżącej ceny) — lepsza cena, brak gwarancji fill." }
    : { type: "Sell Limit", why: "Sprzedaż na podbiciu (powyżej bieżącej ceny) — lepsza cena, brak gwarancji fill." };
}

/* ────────────── Kalkulator kosztu wejścia & R:R ────────────── */
function useEntryCostAndRR({
  spreadPips,
  slipPips,
  lots,
  pipValuePerLot,
  slPips,
  tpPips,
}: {
  spreadPips: number;
  slipPips: number;
  lots: number;
  pipValuePerLot: number;
  slPips: number;
  tpPips: number;
}) {
  const pipValue = Math.max(0, pipValuePerLot) * Math.max(0, lots);
  const entryCostCash = (Math.max(0, spreadPips) + Math.max(0, slipPips)) * pipValue;
  const riskCash = Math.max(0, slPips) * pipValue;
  const rewardCash = Math.max(0, tpPips) * pipValue;
  const rr = riskCash > 0 ? rewardCash / riskCash : 0;
  const entryCostInR = riskCash > 0 ? entryCostCash / riskCash : 0;
  return { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR };
}

/* ────────────── Bracket (wejście + SL/TP) ────────────── */
function pipSizeForPair(pair: string) {
  return pair.endsWith("JPY") ? 0.01 : 0.0001;
}
function slTpPrices({
  pair,
  side,
  entry,
  slPips,
  tpPips,
}: {
  pair: string;
  side: Side;
  entry: number;
  slPips: number;
  tpPips: number;
}) {
  const pip = pipSizeForPair(pair);
  if (!entry || !pip) return { sl: 0, tp: 0 };
  if (side === "long") {
    return { sl: entry - slPips * pip, tp: entry + tpPips * pip };
  } else {
    return { sl: entry + slPips * pip, tp: entry - tpPips * pip };
  }
}

/* ────────────── Strona lekcji ────────────── */
export default function Page() {
  // Asystent
  const [side, setSide] = useState<Side>("long");
  const [scenario, setScenario] = useState<Scenario>("breakout");
  const [priority, setPriority] = useState<Priority>("fill");
  const [tif, setTif] = useState<TIF>("GTC");
  const [current, setCurrent] = useState<number>(1.0850);
  const [entry, setEntry] = useState<number>(1.0900);

  const rec = useMemo(
    () => recommendOrder(side, scenario, priority, current, entry),
    [side, scenario, priority, current, entry]
  );

  // Bracket
  const [pair, setPair] = useState<string>("EURUSD");
  const [slPips, setSlPips] = useState<number>(15);
  const [tpPips, setTpPips] = useState<number>(30);
  const { sl, tp } = useMemo(
    () => slTpPrices({ pair, side, entry, slPips, tpPips }),
    [pair, side, entry, slPips, tpPips]
  );

  // Koszt wejścia & R:R
  const [lots, setLots] = useState<number>(0.30);
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // np. EURUSD/konto USD
  const [spreadPips, setSpreadPips] = useState<number>(0.9);
  const [slipPips, setSlipPips] = useState<number>(0.2);
  const [tpPipsRR, setTpPipsRR] = useState<number>(tpPips); // można stroić niezależnie od „bracketu”

  const { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR } = useEntryCostAndRR({
    spreadPips,
    slipPips,
    lots,
    pipValuePerLot,
    slPips,
    tpPips: tpPipsRR,
  });

  return (
    <LessonLayout
      coursePath="forex"
      courseTitle="Forex"
      lessonNumber={3}
      title="Rodzaje zleceń"
      minutes={18}
      prevSlug="lekcja-2"
      nextSlug="lekcja-4"
    >
      {/* Cele */}
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiesz różnice: <strong>Market</strong>, <strong>Limit</strong>, <strong>Stop</strong>, <strong>Stop-Limit</strong>, <strong>OCO</strong>, <strong>TIF</strong>.</li>
          <li>Dobierasz typ zlecenia do scenariusza: <em>breakout</em> vs <em>pullback</em> vs wejście natychmiastowe.</li>
          <li>Ustawiasz <strong>SL/TP</strong> od razu (bracket), liczysz koszt wejścia i realne <strong>R:R</strong>.</li>
        </ul>
      </section>

      {/* Teoria */}
      <section className="prose prose-invert prose-slate max-w-none">
        <h2>Przegląd zleceń</h2>
        <ul>
          <li><strong>Market</strong> — realizacja natychmiast. + pewność fill; − poślizg możliwy (szczególnie na danych).</li>
          <li><strong>Limit</strong> — wykonanie po wskazanej lub lepszej cenie (long: <em>Buy Limit</em> poniżej rynku; short: <em>Sell Limit</em> powyżej rynku). Brak gwarancji fill.</li>
          <li><strong>Stop</strong> — aktywuje się po dotknięciu triggera (long: <em>Buy Stop</em> powyżej rynku; short: <em>Sell Stop</em> poniżej). Wejście z momentum.</li>
          <li><strong>Stop-Limit</strong> — Stop wyzwala, realizacja Limitem (kontrola max/min ceny, ale ryzyko braku wykonania).</li>
          <li><strong>OCO</strong> — One-Cancels-the-Other (zwykle TP + SL podpięte do pozycji).</li>
        </ul>

        <h3>TIF — Time in Force</h3>
        <ul>
          <li><strong>GTC</strong> — do odwołania, <strong>Day</strong> — do końca dnia sesyjnego.</li>
          <li><strong>IOC</strong> — zrealizuj natychmiast co się da, resztę anuluj; <strong>FOK</strong> — wszystko albo nic od razu.</li>
        </ul>

        <h3>Kiedy których używać?</h3>
        <ul>
          <li><em>Breakout</em> / kontynuacja → Stop / Stop-Limit (price control).</li>
          <li><em>Pullback</em> do strefy popytu/podaży → Limit.</li>
          <li><em>Nagła potrzeba wejścia</em> (hedge, news) → Market (świadomy poślizg).</li>
        </ul>
      </section>

      {/* Asystent wyboru typu zlecenia */}
      <section>
        <h2 className="text-xl font-semibold">Asystent wyboru zlecenia</h2>
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Kierunek">
              <Select value={side} onChange={(e) => setSide(e.target.value as Side)}>
                <option value="long">Long (kupno)</option>
                <option value="short">Short (sprzedaż)</option>
              </Select>
            </Field>
            <Field label="Scenariusz">
              <Select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)}>
                <option value="breakout">Breakout / momentum</option>
                <option value="pullback">Pullback / cofnięcie</option>
                <option value="natychmiast">„Tu i teraz”</option>
              </Select>
            </Field>
            <Field label="Priorytet">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="fill">Pewne wykonanie</option>
                <option value="price">Kontrola ceny</option>
              </Select>
            </Field>
            <Field label="TIF (Time in Force)">
              <Select value={tif} onChange={(e) => setTif(e.target.value as TIF)}>
                <option>GTC</option>
                <option>Day</option>
                <option>IOC</option>
                <option>FOK</option>
              </Select>
            </Field>

            <Field label="Bieżąca cena">
              <NumberInput value={current} onChange={(e) => setCurrent(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Planowana cena wejścia">
              <NumberInput value={entry} onChange={(e) => setEntry(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">Przy breakout cena wejścia zwykle powyżej/pod bieżącą.</div>
            </Field>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-lg">
              Rekomendacja: <strong>{rec.type}</strong> {tif !== "GTC" && <span className="text-white/70">(TIF: {tif})</span>}
            </div>
            <div className="text-sm text-white/70 mt-1">{rec.why}</div>
            <div className="text-xs text-white/50 mt-2">To podpowiedź edukacyjna — decyzję podejmujesz według planu.</div>
          </div>
        </Card>
      </section>

      {/* Budowniczy bracket: ceny SL/TP z pipsów */}
      <section>
        <h2 className="text-xl font-semibold">Ustalanie SL/TP (bracket) z pipsów</h2>
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Para">
              <Select value={pair} onChange={(e) => setPair(e.target.value)}>
                <option>EURUSD</option>
                <option>GBPUSD</option>
                <option>USDJPY</option>
                <option>AUDUSD</option>
                <option>USDCAD</option>
                <option>USDCHF</option>
                <option>EURJPY</option>
                <option>GBPJPY</option>
              </Select>
            </Field>
            <Field label="Kierunek">
              <Select value={side} onChange={(e) => setSide(e.target.value as Side)}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </Select>
            </Field>
            <Field label="Cena wejścia">
              <NumberInput value={entry} onChange={(e) => setEntry(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="SL (pips)">
              <NumberInput value={slPips} onChange={(e) => setSlPips(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="TP (pips)">
              <NumberInput value={tpPips} onChange={(e) => setTpPips(parseFloat(e.target.value || "0"))} />
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>SL cena:</div>
              <div className="text-lg font-semibold">{sl ? sl.toFixed(pair.endsWith("JPY") ? 3 : 5) : "—"}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>TP cena:</div>
              <div className="text-lg font-semibold">{tp ? tp.toFixed(pair.endsWith("JPY") ? 3 : 5) : "—"}</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-white/50">
            Pip: {pair.endsWith("JPY") ? "0.01" : "0.0001"} • Dostosuj precyzję do kwotowań Twojego brokera.
          </div>
        </Card>
      </section>

      {/* Koszt wejścia & R:R */}
      <section>
        <h2 className="text-xl font-semibold">Koszt wejścia i realne R:R</h2>
        <Card>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Loty">
              <NumberInput value={lots} onChange={(e) => setLots(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Wartość 1 pips / 1 lot (np. 10 USD)">
              <NumberInput value={pipValuePerLot} onChange={(e) => setPipValuePerLot(parseFloat(e.target.value || "0"))} />
              <div className="mt-1 text-xs text-white/50">Dla EURUSD/koncie USD przyjmij 10.</div>
            </Field>
            <Field label="SL (pips)">
              <NumberInput value={slPips} onChange={(e) => setSlPips(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="TP (pips)">
              <NumberInput value={tpPipsRR} onChange={(e) => setTpPipsRR(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Spread (pips)">
              <NumberInput value={spreadPips} onChange={(e) => setSpreadPips(parseFloat(e.target.value || "0"))} />
            </Field>
            <Field label="Poślizg (pips)">
              <NumberInput value={slipPips} onChange={(e) => setSlipPips(parseFloat(e.target.value || "0"))} />
            </Field>
          </div>

          <hr className="my-5 border-white/10" />

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Wartość 1 pips (dla {lots.toFixed(2)} lot):</div>
              <div className="text-lg font-semibold">{pipValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div className="mt-2">Koszt wejścia (spread+poślizg):</div>
              <div className="text-lg font-semibold">{entryCostCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>Ryzyko (SL):</div>
              <div className="text-lg font-semibold">{riskCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div className="mt-2">Zysk (TP):</div>
              <div className="text-lg font-semibold">{rewardCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div>R:R = <strong>{isFinite(rr) ? rr.toFixed(2) : "0.00"}</strong></div>
              <div className="mt-2">Koszt wejścia = <strong>{isFinite(entryCostInR) ? entryCostInR.toFixed(2) : "0.00"} R</strong></div>
              <div className="text-xs text-white/50 mt-1">Im mniejszy SL i wyższa zmienność, tym większy wpływ kosztu wejścia.</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenariusze i praktyka */}
{/* Scenariusze i praktyka — czytelny układ z listami */}
<section>
  <h2 className="text-xl font-semibold">Scenariusze i praktyka</h2>

  <div className="mt-4 space-y-6">
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-lg font-semibold">Scenariusze</h3>
      <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
        <li>
          <strong>Wybicie z konsolidacji:</strong> Buy/Sell Stop kilka pipsów za barierą,
          SL po drugiej stronie zakresu, TP przy kolejnym S/R.
        </li>
        <li>
          <strong>Cofnięcie do strefy:</strong> Buy/Sell Limit w strefie, SL za strefą,
          TP do ostatniego swing high/low.
        </li>
        <li>
          <strong>Wejście na news:</strong> Market z mniejszą początkową wielkością +
          plan dokładki po potwierdzeniu.
        </li>
      </ol>
    </div>

    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-lg font-semibold">Dobre praktyki</h3>
      <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
        <li>Używaj bracketu (SL/TP) od razu; rozważ OCO, by uniknąć „gołych” zleceń.</li>
        <li>Dopasuj TIF do strategii (Day dla intraday, GTC dla swingów).</li>
        <li>
          Na niskich TF spread/poślizg potrafią „zabrać” 0.2–0.5R — uwzględnij to w planie.
        </li>
      </ul>
    </div>

    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-lg font-semibold">Checklist</h3>
      <ul className="mt-2 list-disc pl-6 space-y-2 text-slate-300">
        <li>Typ zlecenia zgodny ze scenariuszem (pullback vs breakout vs natychmiast).</li>
        <li>SL techniczny (S/R, ATR), loty z 1R, policzony koszt wejścia.</li>
        <li>TIF i OCO poprawne; brak zleceń „sierot”.</li>
      </ul>
    </div>

    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-lg font-semibold">Ćwiczenia (5–10 min)</h3>
      <ol className="mt-2 list-decimal pl-6 space-y-2 text-slate-300">
        <li>
          Ustaw long na EURUSD: wejście 1.0950, SL 14 pips, TP 28 pips. Policz ceny SL/TP i
          R:R przy spreadzie 0.8 i poślizgu 0.2 pips.
        </li>
        <li>
          Dla shorta na USDJPY (para JPY): wejście 156.20, SL 18 pips, TP 27 pips — wyznacz
          ceny i R:R (pip=0.01).
        </li>
        <li>
          Zmiana TIF z GTC na Day — w jakich sytuacjach jest to korzystne i dlaczego?
        </li>
      </ol>
    </div>
  </div>
</section>

    </LessonLayout>
  );
}
