'use client';

import Link from "next/link";
import { useMemo, useState, useEffect, type ReactNode } from "react";

/* ───────────────────── Layout (jak u Ciebie) ───────────────────── */
function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
}: {
  coursePath: "cfd"; courseTitle: string; lessonNumber: number; title: string; minutes: number;
  children: ReactNode; prevSlug?: string; nextSlug?: string;
}) {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <Link href={`/kursy/${coursePath}`} className="text-sm underline">← Wróć do spisu</Link>
      <header className="space-y-1">
        <p className="text-slate-400 text-sm">{courseTitle} — Lekcja {lessonNumber} • ⏱ {minutes} min</p>
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

/* ───────────────────── Ramki pomocnicze ───────────────────── */
function Callout({ type = "info", title, children }: { type?: "info"|"tip"|"warn"; title: string; children: ReactNode }) {
  const styles = {
    info: "border-white/15 bg-white/5",
    tip: "border-emerald-400/20 bg-emerald-500/5",
    warn: "border-rose-400/20 bg-rose-500/5",
  }[type];
  return (
    <div className={`rounded-xl border ${styles} p-4`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-slate-300 text-sm">{children}</div>
    </div>
  );
}

/* ───────────────────── Kalkulator kosztów ─────────────────────
   Zakładamy wejście/wyjście „na spread” (bez extra spreadu na wyjściu),
   prowizję jako punkty round-turn, swap jako punkty/dzień, konwersję do $
   przez „wartość punktu przy 1 locie” × loty.
   Wynik: koszt w punktach, $, oraz jako część 1R (w punktach).
───────────────────── */
function CostCalculator() {
  const KEY = "cfd:lesson2:costcalc";

  const [spreadPts, setSpreadPts] = useState(1.0);           // spread w pkt
  const [commissionPts, setCommissionPts] = useState(0);     // prowizja round-turn w pkt
  const [swapLong, setSwapLong] = useState(0.9);             // pkt/dzień
  const [swapShort, setSwapShort] = useState(-0.6);          // pkt/dzień
  const [holdingDays, setHoldingDays] = useState(3);
  const [hasWedTriple, setHasWedTriple] = useState(true);    // czy w okresie jest środa (potrójny swap)
  const [side, setSide] = useState<"long"|"short">("long");

  const [lots, setLots] = useState(1.0);
  const [pointValue1Lot, setPointValue1Lot] = useState(0.5); // USD/pt dla 1 lota (np. DE40 micro)
  const [stopPts, setStopPts] = useState(15);                 // 1R w punktach (SL)

  /* pamiętaj ustawienia (lokalne) */
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        Object.assign(
          {
            spreadPts, commissionPts, swapLong, swapShort, holdingDays, hasWedTriple,
            side, lots, pointValue1Lot, stopPts
          },
          p
        );
        setSpreadPts(p.spreadPts ?? spreadPts);
        setCommissionPts(p.commissionPts ?? commissionPts);
        setSwapLong(p.swapLong ?? swapLong);
        setSwapShort(p.swapShort ?? swapShort);
        setHoldingDays(p.holdingDays ?? holdingDays);
        setHasWedTriple(p.hasWedTriple ?? hasWedTriple);
        setSide(p.side ?? side);
        setLots(p.lots ?? lots);
        setPointValue1Lot(p.pointValue1Lot ?? pointValue1Lot);
        setStopPts(p.stopPts ?? stopPts);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({
        spreadPts, commissionPts, swapLong, swapShort, holdingDays, hasWedTriple,
        side, lots, pointValue1Lot, stopPts
      }));
    }
  }, [spreadPts, commissionPts, swapLong, swapShort, holdingDays, hasWedTriple, side, lots, pointValue1Lot, stopPts]);

  // swap per day w pkt zależnie od strony
  const dailySwap = side === "long" ? swapLong : swapShort;

  // triple w środę = +2x dzienny
  const swapPtsTotal = useMemo(() => {
    const base = holdingDays * dailySwap;
    const triple = hasWedTriple ? 2 * dailySwap : 0;
    return +(base + triple).toFixed(3);
  }, [holdingDays, hasWedTriple, dailySwap]);

  // koszt wejścia w pkt (spread + prowizja round-turn w pkt)
  const entryCostPts = useMemo(() => +(spreadPts + commissionPts).toFixed(3), [spreadPts, commissionPts]);

  // łączny koszt w pkt
  const totalCostPts = useMemo(() => +(entryCostPts + swapPtsTotal).toFixed(3), [entryCostPts, swapPtsTotal]);

  // konwersja kosztu na $ (wartość punktu × loty)
  const perPointCash = useMemo(() => lots * pointValue1Lot, [lots, pointValue1Lot]);
  const totalCostCash = useMemo(() => +(totalCostPts * perPointCash).toFixed(2), [totalCostPts, perPointCash]);

  // 1R w $ i przeliczenie kosztu na R
  const oneRCash = useMemo(() => +(stopPts * perPointCash).toFixed(2), [stopPts, perPointCash]);
  const costInR = useMemo(() => stopPts > 0 ? +(totalCostPts / stopPts).toFixed(3) : 0, [totalCostPts, stopPts]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <h3 className="font-semibold">Kalkulator kosztów (spread + prowizja + swap)</h3>

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <label className="grid gap-1 flex-1">
              <span>Spread (pkt)</span>
              <input value={spreadPts} onChange={e=>setSpreadPts(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
            <label className="grid gap-1 flex-1">
              <span>Prowizja round-turn (pkt)</span>
              <input value={commissionPts} onChange={e=>setCommissionPts(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="grid gap-1 flex-1">
              <span>Swap long (pkt/dzień)</span>
              <input value={swapLong} onChange={e=>setSwapLong(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
            <label className="grid gap-1 flex-1">
              <span>Swap short (pkt/dzień)</span>
              <input value={swapShort} onChange={e=>setSwapShort(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="grid gap-1 flex-1">
              <span>Dni utrzymania</span>
              <input value={holdingDays} onChange={e=>setHoldingDays(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
            <label className="grid gap-1 flex-1">
              <span>Strona</span>
              <select value={side} onChange={e=>setSide(e.target.value as "long"|"short")}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30">
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </label>
          </div>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-white" checked={hasWedTriple}
              onChange={e=>setHasWedTriple(e.target.checked)} />
            <span>Okres obejmuje <strong>środowy rollover ×3</strong></span>
          </label>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <label className="grid gap-1 flex-1">
              <span>Loty</span>
              <input value={lots} onChange={e=>setLots(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
            <label className="grid gap-1 flex-1">
              <span>Wartość 1 pkt przy 1 locie (USD)</span>
              <input value={pointValue1Lot} onChange={e=>setPointValue1Lot(+e.target.value || 0)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
          </div>

          <label className="grid gap-1">
            <span>1R (stop) w punktach</span>
            <input value={stopPts} onChange={e=>setStopPts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">Koszt łączny (pkt)</div>
              <div className="text-lg font-semibold">{totalCostPts}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">Koszt łączny (USD)</div>
              <div className="text-lg font-semibold">${totalCostCash.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">1R (USD)</div>
              <div className="text-lg font-semibold">${oneRCash.toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-white/60 text-xs">Koszt w R</div>
              <div className="text-lg font-semibold">{costInR}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/60">
        Uproszczenie edukacyjne: prowizja podana jako punkty (round-turn), spread liczony raz przy wejściu,
        potrójny swap dodany w postaci +2× dzienny. W praktyce sprawdź specyfikację CFD u brokera
        (tick value/mnożniki, model prowizji).
      </p>
    </div>
  );
}

/* ───────────────────── Mini-quiz ───────────────────── */
type Q = { q: string; a: number; opts: string[] };
const QUIZ: Q[] = [
  {
    q: "Które elementy zwykle tworzą koszt transakcji CFD?",
    a: 3,
    opts: ["Spread i poślizg", "Swap i poślizg", "Prowizja i slippage (zawsze)", "Spread, ewentualna prowizja oraz swap"],
  },
  {
    q: "Potrójny swap w środę oznacza…",
    a: 2,
    opts: [
      "trzykrotnie większy spread tylko w środę",
      "że swap nalicza się tylko w środę",
      "że środowy rollover księguje ~3× dzienny swap",
      "niższe koszty dla pozycji krótkich",
    ],
  },
  {
    q: "Jeśli koszty wynoszą ~0.3R, a target to 2R, realny R:R to około…",
    a: 1,
    opts: ["2.3:1", "1.7:1", "2.0:1", "1.3:1"],
  },
];

function MiniQuiz() {
  const KEY = "cfd:lesson2:quiz";
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(QUIZ.length).fill(null));
  const [checked, setChecked] = useState(false);
  const score = useMemo(() => picked.reduce<number>((sum, v, i) => (v === QUIZ[i].a ? sum + 1 : sum), 0), [picked]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p) && p.length === QUIZ.length) setPicked(p);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(picked));
  }, [picked]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold">Mini-quiz: koszty i R:R</h3>
      <div className="mt-3 space-y-4">
        {QUIZ.map((qa, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3">
            <div className="font-medium">{i + 1}) {qa.q}</div>
            <div className="mt-2 grid gap-2 text-sm">
              {qa.opts.map((o, j) => {
                const isCorrect = checked && j === qa.a;
                const isWrong = checked && picked[i] === j && j !== qa.a;
                return (
                  <label key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      className="accent-white"
                      name={`q${i}`}
                      checked={picked[i] === j}
                      onChange={() => setPicked(prev => { const c = [...prev]; c[i] = j; return c; })}
                      disabled={checked}
                    />
                    <span className={isCorrect ? "text-emerald-300" : isWrong ? "text-rose-300" : ""}>{o}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-white/70">
          {checked ? <>Wynik: <span className="text-white font-semibold">{score}/{QUIZ.length}</span></> : "Zaznacz odpowiedzi i sprawdź wynik."}
        </div>
        <div className="flex gap-2">
          {!checked && (
            <button onClick={() => setChecked(true)} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">
              Sprawdź
            </button>
          )}
          {checked && (
            <button onClick={() => { setChecked(false); setPicked(Array(QUIZ.length).fill(null)); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Strona lekcji ───────────────────── */
export default function Page() {
  return (
    <LessonLayout
      coursePath="cfd" courseTitle="CFD" lessonNumber={2} minutes={16}
      title="Koszty: spread, prowizja, swap. Jak liczyć i planować R:R"
      prevSlug="lekcja-1" nextSlug="lekcja-3"
    >
      <section>
        <h2 className="text-xl font-semibold">Elementy kosztu</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li><strong>Spread</strong> — różnica bid/ask; rośnie w niskiej płynności, na danych, po godzinach.</li>
          <li><strong>Prowizja</strong> — stała/zmienna od wolumenu (część brokerów na indeksach jej nie pobiera).</li>
          <li><strong>Swap (rollover)</strong> — odsetki za utrzymanie pozycji po „cut-off”; w środę często potrójny.</li>
        </ul>
        <Callout type="info" title="Slippage">
          Poślizg nie jest „kosztem stałym”, ale w realnym handlu bywa częścią średniego kosztu. W statystykach warto go
          uwzględniać (np. +0.1–0.3R dla wejść na dane).
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Wzory w praktyce</h2>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <p><strong>Całkowity koszt wejścia</strong> ≈ spread + prowizja (round-turn).</p>
          <p><strong>Swap dzienny</strong> ≈ punkty swapu × loty × wartość punktu (lub liczone w pkt/kontrakt).</p>
          <p><strong>Breakeven</strong> = koszt łączny / wartość 1R (w punktach lub w $).</p>
        </div>
        <p className="mt-2 text-slate-300">
          Jeżeli system ma docelowe R:R = 2:1, ale koszty „zjadają” 0.3R na transakcję, realne R:R spada do ~1.7:1 —
          uwzględniaj to w ocenie strategii.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Przykład liczbowy (DE40)</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Spread 1.0 pkt, prowizja 0, swap 0.9 pkt/dzień (środa ×3).</li>
          <li>Pozycja na 3 dni: koszt ≈ 1.0 + 0 + (0.9 × 3 + 0.9) ≈ <strong>3.7 pkt</strong>.</li>
          <li>Jeśli 1R = 15 pkt, koszt to ~0.25R — planuj targety/stop tak, by to „udźwignąć”.</li>
        </ul>
        <Callout type="tip" title="Modelowanie w arkuszu">
          Zbuduj w arkuszu kolumnę „koszt w R” i odkładaj tam średni spread/prowizję/swap dla swoich rynków. Dzięki temu
          wiesz, jaki minimalny target (w R) ma sens.
        </Callout>

        <div className="mt-4">
          <CostCalculator />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Jak ograniczać koszty?</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Handluj w godzinach najwyższej płynności (mniejszy spread).</li>
          <li>Unikaj długiego utrzymywania pozycji o ujemnym swapie.</li>
          <li>Porównaj konto „spread-only” vs. „prowizja + niski spread” dla Twojej częstotliwości.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zadanie</h2>
        <p className="mt-2 text-slate-300">
          Dla 3 wybranych rynków policz: średni spread, swap long/short, szacowany koszt 1-dniowy i 3-dniowy.
          Uaktualnij arkusz R:R o „koszt w R”.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-quiz</h2>
        <MiniQuiz />
      </section>
    </LessonLayout>
  );
}
