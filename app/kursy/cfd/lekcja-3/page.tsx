'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/* ─────────────────── wspólny layout (jak w poprzednich lekcjach) ─────────────────── */
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

/* ─────────────────── drobne komponenty ─────────────────── */
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

/* ─────────────────── Kalkulator: tick/lot → P&L, 1R ─────────────────── */
function TickLotCalculator() {
  const KEY = "cfd:l3:ticklot";
  const [pointValue1Lot, setPointValue1Lot] = useState(0.5); // USD/pt przy 1.00 lot
  const [lots, setLots] = useState(1.0);
  const [movePts, setMovePts] = useState(10);                 // ruch ceny w punktach
  const [stopPts, setStopPts] = useState(15);                 // 1R w punktach

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setPointValue1Lot(p.pointValue1Lot ?? pointValue1Lot);
        setLots(p.lots ?? lots);
        setMovePts(p.movePts ?? movePts);
        setStopPts(p.stopPts ?? stopPts);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ pointValue1Lot, lots, movePts, stopPts }));
    }
  }, [pointValue1Lot, lots, movePts, stopPts]);

  const perPointCash = useMemo(() => lots * pointValue1Lot, [lots, pointValue1Lot]);
  const pnl = useMemo(() => +(movePts * perPointCash).toFixed(2), [movePts, perPointCash]);
  const oneR = useMemo(() => +(stopPts * perPointCash).toFixed(2), [stopPts, perPointCash]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Kalkulator tick/lot</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Wartość 1 pkt przy 1.00 locie (USD)</span>
            <input value={pointValue1Lot} onChange={(e)=>setPointValue1Lot(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
          <label className="grid gap-1">
            <span>Loty</span>
            <input value={lots} onChange={(e)=>setLots(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Ruch (pkt)</span>
            <input value={movePts} onChange={(e)=>setMovePts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
          <label className="grid gap-1">
            <span>Stop = 1R (pkt)</span>
            <input value={stopPts} onChange={(e)=>setStopPts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <Stat label="P&L za ruch" value={`$${pnl.toLocaleString()}`} />
        <Stat label="1R (USD)" value={`$${oneR.toLocaleString()}`} />
        <Stat label="Równowartość ruchu w R" value={oneR > 0 ? (pnl/oneR).toFixed(2) : "0"} />
      </div>

      <p className="text-xs text-white/60 mt-1">
        Wartość punktu sprawdzisz w specyfikacji instrumentu u brokera (czasem różna dla „mikro/mini/standard”).
      </p>
    </div>
  );
}

/* ─────────────────── Kalkulator: ATR / stop → loty (sizing) ─────────────────── */
function AtrSizing() {
  const KEY = "cfd:l3:atr";
  const [balance, setBalance] = useState(2500);
  const [riskPct, setRiskPct] = useState(0.5); // % na 1R
  const [stopPts, setStopPts] = useState(15);  // ATR/stop w pkt
  const [pointValue1Lot, setPointValue1Lot] = useState(0.5);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setBalance(p.balance ?? balance);
        setRiskPct(p.riskPct ?? riskPct);
        setStopPts(p.stopPts ?? stopPts);
        setPointValue1Lot(p.pointValue1Lot ?? pointValue1Lot);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ balance, riskPct, stopPts, pointValue1Lot }));
    }
  }, [balance, riskPct, stopPts, pointValue1Lot]);

  const riskCash = useMemo(() => +(balance * (riskPct/100)).toFixed(2), [balance, riskPct]);
  const lots = useMemo(() => {
    const denom = stopPts * pointValue1Lot;
    return +(denom > 0 ? riskCash / denom : 0).toFixed(2);
  }, [riskCash, stopPts, pointValue1Lot]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Sizing z ATR/stopu (1R)</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Kapitał (USD)</span>
            <input value={balance} onChange={(e)=>setBalance(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
          <label className="grid gap-1">
            <span>Ryzyko na 1R (%)</span>
            <input value={riskPct} onChange={(e)=>setRiskPct(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Stop / ATR (pkt)</span>
            <input value={stopPts} onChange={(e)=>setStopPts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
          <label className="grid gap-1">
            <span>Wartość 1 pkt przy 1.00 locie (USD)</span>
            <input value={pointValue1Lot} onChange={(e)=>setPointValue1Lot(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <Stat label="1R (USD)" value={`$${riskCash.toLocaleString()}`} />
        <Stat label="Loty" value={`${lots}`} />
        <Stat label="Wartość 1 pkt (USD) przy tych lotach" value={`$${(lots*pointValue1Lot).toFixed(2)}`} />
      </div>

      <p className="text-xs text-white/60 mt-1">
        Formuła: <em>loty = (kapitał × ryzyko%) / (stop(punkty) × wartość pkt (USD) dla 1 lota)</em>.
      </p>
    </div>
  );
}

/* ─────────────────── Plan dnia (checklista + notatki) ─────────────────── */
function DayPlan() {
  const KEY = "cfd:l3:dayplan";
  type Item = { id: string; label: string; done: boolean };
  const defaultItems: Item[] = [
    { id: "cal", label: "Sprawdź kalendarz makro/raporty (CPI, NFP, EIA, wyniki)", done: false },
    { id: "vol", label: "Zaktualizuj ATR/stop i loty pod 1R", done: false },
    { id: "sr",  label: "Zaznacz S/R i przygotuj scenariusze A→B", done: false },
    { id: "risk",label: "Sprawdź koszt w R (spread/prowizja/swap)", done: false },
  ];
  const [items, setItems] = useState<Item[]>(defaultItems);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p.items)) setItems(p.items);
        if (typeof p.notes === "string") setNotes(p.notes);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ items, notes }));
    }
  }, [items, notes]);

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const reset = () => setItems(defaultItems);

  const doneCount = items.filter(i=>i.done).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Plan dnia</h3>
        <div className="text-sm text-white/70">{doneCount}/{items.length} wykonane</div>
      </div>
      <div className="grid gap-2">
        {items.map(i => (
          <label key={i.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-white" checked={i.done} onChange={()=>toggle(i.id)} />
            <span className={i.done ? "line-through text-white/50" : ""}>{i.label}</span>
          </label>
        ))}
      </div>
      <textarea
        className="w-full mt-2 min-h-[90px] px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30 text-sm"
        placeholder="Notatki / scenariusze (np. jeśli DE40 wybije 15-min high po 9:05, szukam pullbacku do ...)"
        value={notes}
        onChange={e=>setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={reset} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Reset</button>
      </div>
    </div>
  );
}

/* ─────────────────── Mini-quiz ─────────────────── */
type Q = { q: string; a: number; opts: string[] };
const QUIZ: Q[] = [
  { q: "Na których godzinach często pojawia się zwiększona zmienność na głównych indeksach USA (CET)?", a: 2, opts: ["13:30 i 16:00", "10:00 i 14:30", "15:30 (otwarcie) i 20:00 (fixing)", "22:00 i 23:30"] },
  { q: "Po co znasz wartość ticka/punktu na danym rynku?", a: 1, opts: ["Żeby dobrać kolor świec", "Aby poprawnie policzyć loty i 1R", "Bo spread jest wtedy niższy", "Żeby ominąć triple swap"] },
  { q: "Jaki raport jest typowym katalizatorem dla ropy (WTI/Brent)?", a: 0, opts: ["EIA (zapasy ropy)", "NFP", "ISM Services", "CPI w strefie euro"] },
];
function MiniQuiz() {
  const KEY = "cfd:l3:quiz";
  const [picked, setPicked] = useState<(number|null)[]>(() => Array(QUIZ.length).fill(null));
  const [checked, setChecked] = useState(false);
  const score = useMemo(() => picked.reduce<number>((sum, v, i) => (v === QUIZ[i].a ? sum+1 : sum), 0), [picked]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) { try { const p = JSON.parse(raw); if (Array.isArray(p) && p.length === QUIZ.length) setPicked(p); } catch {} }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(picked));
  }, [picked]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold">Mini-quiz</h3>
      <div className="mt-3 space-y-4">
        {QUIZ.map((qa, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3">
            <div className="font-medium">{i+1}) {qa.q}</div>
            <div className="mt-2 grid gap-2 text-sm">
              {qa.opts.map((o, j) => {
                const isCorrect = checked && j === qa.a;
                const isWrong = checked && picked[i] === j && j !== qa.a;
                return (
                  <label key={j} className="flex items-center gap-2">
                    <input type="radio" className="accent-white" name={`q${i}`} checked={picked[i]===j}
                      onChange={()=>setPicked(prev => { const c=[...prev]; c[i]=j; return c; })} disabled={checked}/>
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
          {!checked && <button onClick={()=>setChecked(true)} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Sprawdź</button>}
          {checked && <button onClick={()=>{ setChecked(false); setPicked(Array(QUIZ.length).fill(null)); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Reset</button>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STRONA LEKCJI ─────────────────── */
export default function Page() {
  return (
    <LessonLayout
      coursePath="cfd" courseTitle="CFD" lessonNumber={3} minutes={18}
      title="Indeksy i surowce — godziny, tick, raporty, praktyka"
      prevSlug="lekcja-2" nextSlug="lekcja-4"
    >
      <section>
        <h2 className="text-xl font-semibold">Godziny handlu (orientacyjnie)</h2>
        <p className="mt-2 text-slate-300">Zawsze potwierdź w specyfikacji u swojego brokera (święta, przerwy techniczne, DST itp.).</p>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-4">Rynek</th>
                <th className="py-2 pr-4">Sesja główna (CET)</th>
                <th className="py-2 pr-4">Uwaga</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="py-2 pr-4">US500 / US100</td>
                <td className="py-2 pr-4">15:30–22:00</td>
                <td className="py-2 pr-4">Podwyższona zmienność: 15:30 (otwarcie) i ~20:00 (fixing).</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="py-2 pr-4">DE40 (DAX)</td>
                <td className="py-2 pr-4">09:00–17:30</td>
                <td className="py-2 pr-4">Otwarcie 09:00 — skoki/spread; uwaga na dane 11:00/14:30.</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="py-2 pr-4">Złoto (XAUUSD)</td>
                <td className="py-2 pr-4">~00:00–23:00</td>
                <td className="py-2 pr-4">Przerwy tech., wahania swapu; wrażliwe na USD/real yields.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="info" title="Spread i poślizg o poranku">
          Na otwarciach (np. 09:00 dla DE40, 15:30 dla USA) spread i poślizg bywają większe. Jeżeli Twój system wymaga
          wąskich SL, rozważ handlowanie po ustabilizowaniu pierwszych minut.
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Tick value / punkt i wielkość kontraktu</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>DE40: często 1 pkt = 1 € przy 1.00 lot (wariant CFD standard). Mikro/mimi mogą mieć inne mnożniki.</li>
          <li>XAUUSD: przykładowo 0.01 może odpowiadać $0.10/pips — <em>sprawdź u brokera</em>.</li>
          <li>Znajomość wartości ticka = poprawny sizing i realna ocena R:R.</li>
        </ul>
        <div className="mt-4">
          <TickLotCalculator />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Raporty i katalizatory</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Indeksy: CPI, NFP, decyzje banków centralnych, wyniki megakapów.</li>
          <li>Ropa (WTI/Brent): raport EIA (śr), spotkania OPEC, zapowiedzi zmian podaży.</li>
          <li>Metale: real yields, USD, PMI; patrz też na ryzyko geopolityczne.</li>
        </ul>
        <Callout type="tip" title="Kalendarz + plan">
          Zaznacz z wyprzedzeniem godziny publikacji. Jeżeli publikacja „przecina” Twoją strefę wejścia — poczekaj na
          reakcję i dopiero potem oceniaj setup.
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sizing z ATR/stopu (praktyka)</h2>
        <p className="mt-2 text-slate-300">
          Dostosuj wolumen do bieżącej zmienności: im większy ATR/stop w punktach, tym mniejsze loty,
          żeby zachować stałe 1R w $/%. Poniżej szybki kalkulator:
        </p>
        <div className="mt-3">
          <AtrSizing />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Plan dnia (przykład)</h2>
        <p className="mt-2 text-slate-300">Użyj listy kontrolnej i notatek — zapisują się lokalnie w przeglądarce.</p>
        <div className="mt-3">
          <DayPlan />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Zadanie</h2>
        <p className="mt-2 text-slate-300">
          Dla DE40, US100 i XAUUSD spisz: godziny aktywnej sesji, wartość punktu/ticka i kluczowe raporty.
          Przez tydzień prowadź „plan dnia” i porównaj wyniki vs. brak planu.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-quiz</h2>
        <MiniQuiz />
      </section>
    </LessonLayout>
  );
}
