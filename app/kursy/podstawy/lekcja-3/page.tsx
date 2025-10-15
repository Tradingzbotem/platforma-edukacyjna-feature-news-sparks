'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const KEY = "course:podstawy:done";
const SLUG = "lekcja-3";

/** Typy pomocnicze dla asystenta */
type Side = "long" | "short";
type Scenario = "breakout" | "pullback";
type Priority = "fill" | "price";

/** Prosta rekomendacja typu zlecenia */
function recommendOrder(side: Side, scenario: Scenario, priority: Priority, current: number, entry: number) {
  const dir = entry > current ? "above" : entry < current ? "below" : "equal";

  // podstawa: breakout = zlecenie STOP, pullback = LIMIT
  if (scenario === "breakout") {
    if (priority === "fill") {
      return side === "long"
        ? { type: "Buy Stop", why: "Chcesz dołączyć do wybicia powyżej bieżącej ceny i priorytetem jest pewne wykonanie." }
        : { type: "Sell Stop", why: "Chcesz dołączyć do wybicia w dół poniżej bieżącej ceny i priorytetem jest pewne wykonanie." };
    } else {
      return side === "long"
        ? { type: "Buy Stop-Limit", why: "Wybicie + kontrola maks. ceny (Stop wyzwala, Limit ustawia maks. akceptowalną cenę)." }
        : { type: "Sell Stop-Limit", why: "Wybicie w dół + kontrola minimalnej akceptowalnej ceny po aktywacji." };
    }
  }

  // pullback / mean reversion → LIMIT
  if (scenario === "pullback") {
    return side === "long"
      ? { type: "Buy Limit", why: "Kupno na cofnięciu (poniżej bieżącej ceny) – chcesz lepszą cenę od rynku." }
      : { type: "Sell Limit", why: "Sprzedaż na podbiciu (powyżej bieżącej ceny) – chcesz lepszą cenę od rynku." };
  }

  // fallback (lub gdy entry == current)
  if (priority === "fill") {
    return { type: "Market", why: "Potrzebujesz natychmiastowego wejścia po cenie rynkowej (akceptujesz poślizg)." };
  }
  // jeśli jakiś dziwny układ – podpowiedz STOP/LIMIT względem położenia ceny
  if (dir === "above") {
    return side === "long"
      ? { type: "Buy Stop", why: "Cena wejścia jest powyżej bieżącej – to scenariusz wybicia." }
      : { type: "Sell Limit", why: "Dla shorta powyżej bieżącej – sprzedajesz z Limit." };
  }
  if (dir === "below") {
    return side === "long"
      ? { type: "Buy Limit", why: "Dla longa poniżej bieżącej – kupno z Limit na cofnięciu." }
      : { type: "Sell Stop", why: "Dla shorta poniżej bieżącej – wejście na wybicie w dół." };
  }
  return { type: "Market", why: "Brak przewagi kierunkowej – jeśli musisz wejść teraz, użyj Market." };
}

/** Kalkulator kosztu wejścia i R:R */
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
  const pipValue = (pipValuePerLot || 0) * (lots || 0);
  const entryCostCash = useMemo(() => (Math.max(0, spreadPips) + Math.max(0, slipPips)) * pipValue, [spreadPips, slipPips, pipValue]);
  const riskCash = useMemo(() => Math.max(0, slPips) * pipValue, [slPips, pipValue]);
  const rewardCash = useMemo(() => Math.max(0, tpPips) * pipValue, [tpPips, pipValue]);
  const rr = useMemo(() => (riskCash ? rewardCash / riskCash : 0), [rewardCash, riskCash]);
  const entryCostInR = useMemo(() => (riskCash ? entryCostCash / riskCash : 0), [entryCostCash, riskCash]);

  return { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR };
}

export default function Page() {
  const [done, setDone] = useState(false);

  /** Asystent – stany */
  const [side, setSide] = useState<Side>("long");
  const [scenario, setScenario] = useState<Scenario>("breakout");
  const [priority, setPriority] = useState<Priority>("fill");
  const [current, setCurrent] = useState<number>(1.085);
  const [entry, setEntry] = useState<number>(1.090);

  const rec = useMemo(
    () => recommendOrder(side, scenario, priority, current, entry),
    [side, scenario, priority, current, entry]
  );

  /** Kalkulator – stany */
  const [spreadPips, setSpreadPips] = useState<number>(0.8);
  const [slipPips, setSlipPips] = useState<number>(0.2);
  const [lots, setLots] = useState<number>(0.30);
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // np. EURUSD dla konta w USD
  const [slPips, setSlPips] = useState<number>(12);
  const [tpPips, setTpPips] = useState<number>(18);

  const { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR } = useEntryCostAndRR({
    spreadPips,
    slipPips,
    lots,
    pipValuePerLot,
    slPips,
    tpPips,
  });

  // znacznik ukończenia
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw).includes(SLUG));
    } catch {}
  }, []);

  const toggle = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const next = done ? arr.filter(s => s !== SLUG) : Array.from(new Set([...arr, SLUG]));
      localStorage.setItem(KEY, JSON.stringify(next));
      setDone(!done);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Nagłówek */}
        <header className="mb-6">
          <p className="text-xs text-white/60">Moduł: Podstawy • Lekcja 3</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">Rodzaje zleceń</h1>
          <p className="text-white/70 mt-2">
            Market, Limit, Stop, Stop-Limit, OCO, TIF (GTC/Day/IOC/FOK) — czym się różnią, kiedy ich używać
            i jak minimalizować poślizg.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-4 py-2 rounded-lg font-semibold ${
                done ? "bg-green-400 text-slate-900 hover:opacity-90" : "bg-white/10 hover:bg-white/20"
              }`}
              title={done ? "Oznacz jako nieukończoną" : "Oznacz jako ukończoną"}
            >
              {done ? "✓ Ukończono" : "Oznacz jako ukończoną"}
            </button>
            <Link href="/kursy/podstawy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              ← Spis lekcji
            </Link>
          </div>
        </header>

        {/* Teoria */}
        <section className="prose prose-invert prose-slate max-w-none">
          <h2>Przegląd typów zleceń</h2>
          <ul>
            <li>
              <strong>Market</strong> — natychmiastowa realizacja po dostępnej cenie rynkowej. Plus: pewne wykonanie. Minus: możliwy{" "}
              <em>poślizg</em> (różnica między ceną na klik a faktycznym fill).
            </li>
            <li>
              <strong>Limit</strong> — wykonanie po wskazanej lub lepszej cenie. Dla longa:{" "}
              <em>Buy Limit</em> (poniżej rynku), dla shorta: <em>Sell Limit</em> (powyżej rynku). Kontrola ceny, ale brak gwarancji fill.
            </li>
            <li>
              <strong>Stop</strong> — aktywuje się po dotknięciu ceny wyzwalającej (wejście na wybicie/momentum). Long:{" "}
              <em>Buy Stop</em> (powyżej rynku), Short: <em>Sell Stop</em> (poniżej rynku). Pewniejsze wejście w ruch, ryzyko poślizgu.
            </li>
            <li>
              <strong>Stop-Limit</strong> — hybryda: Stop wyzwala, ale do realizacji używany jest Limit (kontrola max/min ceny). Możliwy brak
              wykonania przy szybkim ruchu.
            </li>
            <li>
              <strong>OCO</strong> (One-Cancels-the-Other) — dwa zlecenia, wzajemnie się anulują. Typowo TP i SL podpięte do pozycji.
            </li>
          </ul>

          <h3>Time in Force (TIF)</h3>
          <ul>
            <li><strong>GTC</strong> — Good-Till-Cancelled (do odwołania).</li>
            <li><strong>Day</strong> — ważne do końca dnia handlowego.</li>
            <li><strong>IOC</strong> — Immediate-Or-Cancel (zrealizuj natychmiast, resztę anuluj).</li>
            <li><strong>FOK</strong> — Fill-Or-Kill (zrealizuj w całości natychmiast albo anuluj całość).</li>
          </ul>

          <h2>Kiedy co wybrać?</h2>
          <ul>
            <li><em>Breakout/momentum</em> → Stop (lub Stop-Limit, gdy chcesz ograniczyć cenę).</li>
            <li><em>Pullback/mean reversion</em> → Limit (lepsza cena, ale brak gwarancji wykonania).</li>
            <li><em>Nagła potrzeba wejścia</em> (np. news, hedge) → Market (świadomie akceptujesz poślizg).</li>
          </ul>

          <h3>Ryzyka praktyczne</h3>
          <ul>
            <li><strong>Spread i poślizg</strong> zwiększają koszt wejścia — gorszy start w relacji do SL.</li>
            <li><strong>Luki</strong> (otwarcia) potrafią przeskoczyć poziom Stop/Limit → brak fill albo dużo gorsza cena.</li>
            <li><strong>Partial fill</strong> — przy niskiej płynności wypełnienie tylko części zlecenia.</li>
          </ul>
        </section>

        {/* Narzędzie: Asystent wyboru zlecenia */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Asystent wyboru zlecenia</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Kierunek</div>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as Side)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              >
                <option value="long">Long (kupno)</option>
                <option value="short">Short (sprzedaż)</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Scenariusz</div>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as Scenario)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              >
                <option value="breakout">Breakout / momentum (wybicie)</option>
                <option value="pullback">Pullback / mean reversion (cofnięcie)</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Priorytet</div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              >
                <option value="fill">Pewne wykonanie</option>
                <option value="price">Kontrola ceny</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 text-sm text-white/70">Bieżąca cena</div>
                <input
                  inputMode="decimal"
                  value={current}
                  onChange={(e) => setCurrent(parseFloat(e.target.value || "0"))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-sm text-white/70">Cena wejścia</div>
                <input
                  inputMode="decimal"
                  value={entry}
                  onChange={(e) => setEntry(parseFloat(e.target.value || "0"))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-lg">
              Rekomendacja: <strong>{rec.type}</strong>
            </div>
            <div className="text-sm text-white/70 mt-1">{rec.why}</div>
            <div className="text-xs text-white/50 mt-2">
              Uwaga: rekomendacja nie zastępuje planu transakcyjnego. Zawsze określ z góry poziomy <strong>SL</strong> i{" "}
              <strong>TP</strong> oraz liczbę lotów pod stałe <strong>1R</strong>.
            </div>
          </div>
        </section>

        {/* Narzędzie: koszt wejścia + R:R */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Kalkulator kosztu wejścia i R:R</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Spread (pips)</div>
              <input
                inputMode="decimal"
                value={spreadPips}
                onChange={(e) => setSpreadPips(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Poślizg (pips)</div>
              <input
                inputMode="decimal"
                value={slipPips}
                onChange={(e) => setSlipPips(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Loty</div>
              <input
                inputMode="decimal"
                value={lots}
                onChange={(e) => setLots(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Wartość 1 pips / 1 lot (np. 10 USD)</div>
              <input
                inputMode="decimal"
                value={pipValuePerLot}
                onChange={(e) => setPipValuePerLot(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Stop-Loss (pips)</div>
              <input
                inputMode="decimal"
                value={slPips}
                onChange={(e) => setSlPips(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Take-Profit (pips)</div>
              <input
                inputMode="decimal"
                value={tpPips}
                onChange={(e) => setTpPips(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4 space-y-1">
            <div className="text-sm text-white/80">
              Wartość 1 pips dla {lots.toFixed(2)} lot:{" "}
              <strong>{pipValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="text-sm text-white/80">
              Koszt wejścia (spread + poślizg):{" "}
              <strong>{entryCostCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="text-sm text-white/80">
              Ryzyko kwotowo (SL): <strong>{riskCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="text-sm text-white/80">
              Potencjalny zysk (TP): <strong>{rewardCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="text-lg">
              R:R = <strong>{isFinite(rr) ? rr.toFixed(2) : "0.00"}</strong>{" "}
              • koszt wejścia = <strong>{isFinite(entryCostInR) ? entryCostInR.toFixed(2) : "0.00"} R</strong>
            </div>
            <div className="text-xs text-white/50">
              Wysoki spread/poślizg potrafi „zabrać” znaczną część 1R — uwzględniaj to w planie.
            </div>
          </div>
        </section>

        {/* Scenariusze, dobre praktyki */}
        <section className="prose prose-invert prose-slate max-w-none mt-10">
          <h2>Scenariusze</h2>
          <ol>
            <li>
              <strong>Breakout powyżej oporu</strong>: zlecenie <em>Buy Stop</em> (lub Stop-Limit) kilkanaście punktów
              powyżej poziomu, SL pod świecą wybicia, TP przy kolejnym oporze.
            </li>
            <li>
              <strong>Cofnięcie do wsparcia</strong>: zlecenie <em>Buy Limit</em> na strefie popytu, SL pod strefą, TP do
              ostatniego szczytu.
            </li>
            <li>
              <strong>Wejście „tu i teraz”</strong>: <em>Market</em>, ale z mniejszą wielkością (by ograniczyć ryzyko
              poślizgu), a reszta po potwierdzeniu (np. Stop).
            </li>
          </ol>

          <h3>Checklist po lekcji</h3>
          <ul>
            <li>Dobieram typ zlecenia do scenariusza (breakout/pullback) i priorytetu (fill vs cena).</li>
            <li>Znam konsekwencje spreadu i poślizgu; umiem policzyć ich koszt.</li>
            <li>Używam OCO (TP+SL) i właściwego TIF (GTC/Day/IOC/FOK) zgodnie z planem.</li>
          </ul>
        </section>

        {/* Nawigacja */}
        <footer className="mt-10 flex items-center justify-between">
          <Link
            href="/kursy/podstawy/lekcja-2"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            ← Poprzednia
          </Link>
          <Link
            href="/kursy/podstawy/lekcja-4"
            className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
          >
            Następna →
          </Link>
        </footer>
      </article>
    </main>
  );
}
