'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/* ───────────────────── Layout (spójny z poprzednimi lekcjami) ───────────────────── */
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
      <article className="rounded-2xl border border-white/10 bg-[#0b1220] p-6 space-y-8">
        {children}
      </article>
      <nav className="flex items-center justify-between">
        <Link className="underline" href={`/kursy/${coursePath}/${prevSlug ?? ""}`}>← Poprzednia lekcja</Link>
        {nextSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${nextSlug}`}>Następna lekcja →</Link>
        ) : (
          <Link className="underline" href={`/kursy/${coursePath}`}>Zakończ moduł</Link>
        )}
      </nav>
    </main>
  );
}

/* ───────────────────── Drobne klocki UI ───────────────────── */
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

/* ───────────────────── Kalkulator 1R / wielkości pozycji ───────────────────── */
function RiskSizer() {
  const KEY = "cfd:l5:riskSizer";
  const [balance, setBalance] = useState(4000);
  const [riskPct, setRiskPct] = useState(0.5);      // % na 1R
  const [stopPts, setStopPts] = useState(12);       // stop w punktach
  const [pointValue1Lot, setPointValue1Lot] = useState(0.5); // $/pkt przy 1.00 lot
  const [atr, setAtr] = useState(12);               // opcjonalnie: ATR (pkt)
  const [atrMult, setAtrMult] = useState(1.0);      // ile ATR = stop

  // wczytaj
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setBalance(p.balance ?? balance);
        setRiskPct(p.riskPct ?? riskPct);
        setStopPts(p.stopPts ?? stopPts);
        setPointValue1Lot(p.pointValue1Lot ?? pointValue1Lot);
        setAtr(p.atr ?? atr);
        setAtrMult(p.atrMult ?? atrMult);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // zapisz
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ balance, riskPct, stopPts, pointValue1Lot, atr, atrMult }));
    }
  }, [balance, riskPct, stopPts, pointValue1Lot, atr, atrMult]);

  // 1R w $
  const oneR = useMemo(() => +(balance * (riskPct/100)).toFixed(2), [balance, riskPct]);

  // alternatywnie: stop z ATR
  const stopFromAtr = useMemo(() => +(atr * atrMult).toFixed(2), [atr, atrMult]);

  // result lotów
  const lots = useMemo(() => {
    const effectiveStop = stopPts > 0 ? stopPts : stopFromAtr; // jeśli user nie poda stopPts, użyj ATR
    const denom = effectiveStop * pointValue1Lot;
    return +(denom > 0 ? oneR / denom : 0).toFixed(2);
  }, [oneR, stopPts, stopFromAtr, pointValue1Lot]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Kalkulator 1R i wielkości pozycji</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Kapitał (USD)</span>
            <input value={balance} onChange={e=>setBalance(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
          </label>
          <label className="grid gap-1">
            <span>Ryzyko na 1R (%)</span>
            <input value={riskPct} onChange={e=>setRiskPct(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
          </label>
          <label className="grid gap-1">
            <span>Wartość 1 pkt przy 1.00 locie (USD)</span>
            <input value={pointValue1Lot} onChange={e=>setPointValue1Lot(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
          </label>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Stop (pkt)</span>
            <input value={stopPts} onChange={e=>setStopPts(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span>ATR (pkt)</span>
              <input value={atr} onChange={e=>setAtr(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
            <label className="grid gap-1">
              <span>× ATR → stop</span>
              <input value={atrMult} onChange={e=>setAtrMult(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
            </label>
          </div>
          <Callout type="info" title="Wskazówka">
            Możesz podać stały stop (pkt) <em>albo</em> użyć ATR× (np. 1.2×ATR). Kalkulator wybierze niezerową wartość.
          </Callout>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <Stat label="1R (USD)" value={`$${oneR.toLocaleString()}`} />
        <Stat label="Loty" value={`${lots}`} />
        <Stat label="Wartość 1 pkt (USD) przy tych lotach" value={`$${(lots*pointValue1Lot).toFixed(2)}`} />
      </div>
    </div>
  );
}

/* ───────────────────── Volatility targeting (ATR porównawczy) ───────────────────── */
function VolTarget() {
  const KEY = "cfd:l5:volTarget";
  const [baselineAtr, setBaselineAtr] = useState(10); // bazowy ATR z testów
  const [baselineLots, setBaselineLots] = useState(2.0);
  const [currentAtr, setCurrentAtr] = useState(15);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setBaselineAtr(p.baselineAtr ?? baselineAtr);
        setBaselineLots(p.baselineLots ?? baselineLots);
        setCurrentAtr(p.currentAtr ?? currentAtr);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ baselineAtr, baselineLots, currentAtr }));
    }
  }, [baselineAtr, baselineLots, currentAtr]);

  const adjLots = useMemo(() => +(baselineAtr > 0 ? baselineLots * (baselineAtr / currentAtr) : 0).toFixed(2), [baselineAtr, baselineLots, currentAtr]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Volatility targeting (ATR)</h3>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <label className="grid gap-1">
          <span>ATR (bazowy) z backtestu</span>
          <input value={baselineAtr} onChange={e=>setBaselineAtr(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Loty (bazowe)</span>
          <input value={baselineLots} onChange={e=>setBaselineLots(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>ATR (bieżący)</span>
          <input value={currentAtr} onChange={e=>setCurrentAtr(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2">
        <Stat label="Skalowanie" value={`× ${(baselineAtr > 0 ? (baselineAtr/currentAtr).toFixed(2) : "0")}`} />
        <Stat label="Loty (dostosowane)" value={`${adjLots}`} />
        <Stat label="Zmiana vs bazowe" value={`${(adjLots - baselineLots >= 0 ? "+" : "")}${(adjLots - baselineLots).toFixed(2)}`} />
      </div>
      <p className="text-xs text-white/60">
        Idea: utrzymuj podobne wahania PnL w R. Gdy ATR↑ → loty↓, gdy ATR↓ → loty↑ (w granicach rozsądku).
      </p>
    </div>
  );
}

/* ───────────────────── Limity dzienne/tygodniowe w R ───────────────────── */
function LimitsPanel() {
  const KEY = "cfd:l5:limits";
  const [dayLimitR, setDayLimitR] = useState(2);
  const [weekLimitR, setWeekLimitR] = useState(5);
  const [dayR, setDayR] = useState(0);   // bilans dnia w R
  const [weekR, setWeekR] = useState(0); // bilans tygodnia w R
  const [sessionsStopped, setSessionsStopped] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setDayLimitR(p.dayLimitR ?? dayLimitR);
        setWeekLimitR(p.weekLimitR ?? weekLimitR);
        setDayR(p.dayR ?? dayR);
        setWeekR(p.weekR ?? weekR);
        setSessionsStopped(p.sessionsStopped ?? sessionsStopped);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ dayLimitR, weekLimitR, dayR, weekR, sessionsStopped }));
    }
  }, [dayLimitR, weekLimitR, dayR, weekR, sessionsStopped]);

  const addR = (val: number) => {
    if (sessionsStopped) return;
    const nrDay = +(dayR + val).toFixed(2);
    const nrWeek = +(weekR + val).toFixed(2);
    setDayR(nrDay);
    setWeekR(nrWeek);
    if (Math.abs(nrDay) >= dayLimitR || Math.abs(nrWeek) >= weekLimitR) {
      setSessionsStopped(true);
    }
  };
  const resetDay = () => { setDayR(0); setSessionsStopped(false); };
  const resetWeek = () => { setWeekR(0); setSessionsStopped(false); };

  const dayPct = Math.min(100, Math.round((Math.abs(dayR) / dayLimitR) * 100));
  const weekPct = Math.min(100, Math.round((Math.abs(weekR) / weekLimitR) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Limity i higiena (w R)</h3>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <label className="grid gap-1">
          <span>Limit dzienny (|R|)</span>
          <input value={dayLimitR} onChange={e=>setDayLimitR(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Limit tygodniowy (|R|)</span>
          <input value={weekLimitR} onChange={e=>setWeekLimitR(+e.target.value||0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-2">
        <div className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between text-sm">
            <span>Dzisiaj</span><span className="font-semibold">{dayR} R</span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded">
            <div className="h-2 bg-white/80 rounded" style={{ width: `${dayPct}%` }} />
          </div>
          <div className="mt-2 flex gap-2 text-sm">
            <button onClick={()=>addR(+1)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">+1R</button>
            <button onClick={()=>addR(-1)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">-1R</button>
            <button onClick={()=>addR(+0.5)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">+0.5R</button>
            <button onClick={()=>addR(-0.5)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">-0.5R</button>
            <button onClick={resetDay} className="ml-auto px-2 py-1 rounded bg-white/10 hover:bg-white/20">Reset dnia</button>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between text-sm">
            <span>Tydzień</span><span className="font-semibold">{weekR} R</span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded">
            <div className="h-2 bg-white/80 rounded" style={{ width: `${weekPct}%` }} />
          </div>
          <div className="mt-2 flex gap-2 text-sm">
            <button onClick={resetWeek} className="ml-auto px-2 py-1 rounded bg-white/10 hover:bg-white/20">Reset tygodnia</button>
          </div>
        </div>
      </div>

      <Callout type={sessionsStopped ? "warn" : "tip"} title={sessionsStopped ? "Koniec sesji!" : "Zasada higieny"}>
        {sessionsStopped
          ? "Osiągnięto limit w R – zgodnie z zasadami przerwij handel do jutra/po weekendzie."
          : "Ustal limity (dzień/tydzień), przerwa po 2 stratach pod rząd, zero „revenge trading”."
        }
      </Callout>
    </div>
  );
}

/* ───────────────────── Dziennik transakcji + metryki + CSV ───────────────────── */
type Trade = {
  id: string;
  date: string;        // YYYY-MM-DD
  market: string;      // np. DE40
  setup: string;       // krótko
  r: number;           // wynik w R (np. +1.2, -0.7)
  comment?: string;
};

function Journal() {
  const KEY = "cfd:l5:journal";
  const [rows, setRows] = useState<Trade[]>([]);
  const [form, setForm] = useState<Trade>({
    id: "",
    date: new Date().toISOString().slice(0,10),
    market: "DE40",
    setup: "",
    r: 0,
    comment: "",
  });

  // load
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try { const p = JSON.parse(raw); if (Array.isArray(p)) setRows(p); } catch {}
    }
  }, []);
  // save
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(rows));
  }, [rows]);

  const add = () => {
    if (!form.setup.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    setRows(prev => [{ ...form, id }, ...prev]);
    setForm(f => ({ ...f, id: "", setup: "", r: 0, comment: "" }));
  };
  const del = (id: string) => setRows(prev => prev.filter(r => r.id !== id));

  // metryki
  const total = rows.length;
  const wins = rows.filter(r => r.r > 0);
  const losses = rows.filter(r => r.r <= 0);
  const winRate = total ? Math.round((wins.length/total)*100) : 0;
  const avgWin = wins.length ? +(wins.reduce((a,b)=>a+b.r,0)/wins.length).toFixed(2) : 0;
  const avgLoss = losses.length ? +(losses.reduce((a,b)=>a+b.r,0)/losses.length).toFixed(2) : 0;
  const netR = +(rows.reduce((a,b)=>a+b.r,0)).toFixed(2);

  // max drawdown w R (na sekwencji w czasie od końca listy)
  const dd = useMemo(() => {
    let peak = 0, cur = 0, maxDD = 0;
    // idziemy od najstarszej do najnowszej
    const seq = [...rows].reverse().map(r=>r.r);
    for (const r of seq) {
      cur += r;
      if (cur > peak) peak = cur;
      const draw = peak - cur;
      if (draw > maxDD) maxDD = draw;
    }
    return +maxDD.toFixed(2);
  }, [rows]);

  const exportCSV = () => {
    const header = "date,market,setup,r,comment\n";
    const lines = rows.slice().reverse().map(r =>
      [r.date, r.market, JSON.stringify(r.setup), r.r, JSON.stringify(r.comment ?? "")].join(",")
    );
    const csv = header + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "journal.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <h3 className="font-semibold">Dziennik wyników</h3>

      <div className="grid md:grid-cols-5 gap-3 text-sm">
        <label className="grid gap-1">
          <span>Data</span>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date: e.target.value}))}
                 className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
        </label>
        <label className="grid gap-1">
          <span>Rynek</span>
          <input value={form.market} onChange={e=>setForm(f=>({...f, market: e.target.value}))}
                 className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span>Setup</span>
          <input value={form.setup} onChange={e=>setForm(f=>({...f, setup: e.target.value}))}
                 placeholder="np. pullback do S/R po wybiciu"
                 className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
        </label>
        <label className="grid gap-1">
          <span>Wynik (R)</span>
          <input value={form.r} onChange={e=>setForm(f=>({...f, r: +e.target.value||0}))}
                 className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
        </label>
        <label className="grid gap-1 md:col-span-5">
          <span>Komentarz (opcjonalnie)</span>
          <input value={form.comment} onChange={e=>setForm(f=>({...f, comment: e.target.value}))}
                 className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"/>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={add} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Dodaj wpis</button>
        <button onClick={exportCSV} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Eksport CSV</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <Stat label="Win-rate" value={`${winRate}%`} />
        <Stat label="Avg win (R)" value={`${avgWin}`} />
        <Stat label="Avg loss (R)" value={`${avgLoss}`} />
        <Stat label="Net (R)" value={`${netR}`} />
        <Stat label="Max DD (R)" value={`${dd}`} />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-2 pr-3">Data</th>
              <th className="py-2 pr-3">Rynek</th>
              <th className="py-2 pr-3">Setup</th>
              <th className="py-2 pr-3">R</th>
              <th className="py-2 pr-3">Komentarz</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="py-2 pr-3">{r.date}</td>
                <td className="py-2 pr-3">{r.market}</td>
                <td className="py-2 pr-3">{r.setup}</td>
                <td className={`py-2 pr-3 ${r.r > 0 ? "text-emerald-300" : r.r < 0 ? "text-rose-300" : ""}`}>{r.r}</td>
                <td className="py-2 pr-3">{r.comment}</td>
                <td className="py-2 pr-3">
                  <button onClick={()=>del(r.id)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Usuń</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="border-t border-white/10">
                <td className="py-3 pr-3 text-white/60" colSpan={6}>Brak wpisów. Dodaj pierwszą transakcję powyżej.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Callout type="info" title="Uwaga metodologiczna">
        Notuj setup, kontekst i emocje. Cotygodniowo podsumuj win-rate, avg win/loss i Net R. Decyzje: co zostaje, co zmienić, co testować.
      </Callout>
    </div>
  );
}

/* ───────────────────── Mini-quiz ───────────────────── */
type Q = { q: string; a: number; opts: string[] };
const QUIZ: Q[] = [
  {
    q: "Co oznacza 1R w kontekście ryzyka?",
    a: 2,
    opts: [
      "Zawsze 1% kapitału",
      "Stały target zysku",
      "Kwotę, którą akceptujesz stracić w pojedynczej transakcji",
      "Maksymalną liczbę transakcji dziennie",
    ],
  },
  {
    q: "Jeśli ATR rośnie, aby utrzymać podobną zmienność PnL:",
    a: 1,
    opts: ["Zwiększasz loty", "Zmniejszasz loty", "Zostawiasz bez zmian", "Zmieniasz brokerów"],
  },
  {
    q: "Limit tygodniowy ustawiłeś na 5R. Po -1R, +0.5R, -2R, -0.5R masz:",
    a: 0,
    opts: ["-3R (kontynuuj wg zasad, ale blisko limitu)", "-1R", "-5R (koniec tygodnia)", "0R"],
  },
];

function MiniQuiz() {
  const KEY = "cfd:l5:quiz";
  const [picked, setPicked] = useState<(number|null)[]>(() => Array(QUIZ.length).fill(null));
  const [checked, setChecked] = useState(false);
  const score = useMemo(() => picked.reduce<number>((sum,v,i)=> (v===QUIZ[i].a ? sum+1 : sum), 0), [picked]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) { try { const p = JSON.parse(raw); if (Array.isArray(p) && p.length===QUIZ.length) setPicked(p); } catch {} }
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
                           onChange={()=>setPicked(prev=>{ const c=[...prev]; c[i]=j; return c; })} disabled={checked}/>
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
          {checked ? <>Wynik: <span className="text-white font-semibold">{score}/{QUIZ.length}</span></>
                   : "Zaznacz odpowiedzi i sprawdź wynik."}
        </div>
        <div className="flex gap-2">
          {!checked && <button onClick={()=>setChecked(true)} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Sprawdź</button>}
          {checked && <button onClick={()=>{ setChecked(false); setPicked(Array(QUIZ.length).fill(null)); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Reset</button>}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── STRONA LEKCJI 5 ───────────────────── */
export default function Page() {
  return (
    <LessonLayout
      coursePath="cfd"
      courseTitle="CFD"
      lessonNumber={5}
      minutes={20}
      title="Zarządzanie ryzykiem: 1R, sizing, ATR, limity i dziennik"
      prevSlug="lekcja-4"
      // nextSlug brak (ostatnia) → pokaż „Zakończ moduł”
    >
      {/* 1R i wzór */}
      <section>
        <h2 className="text-xl font-semibold">1R i wzór na wielkość pozycji</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1">
          <li>Wybierz ryzyko 1R (np. 0.5–1% kapitału).</li>
          <li>Określ SL w punktach/pipsach (technicznie: S/R, struktura, ATR).</li>
          <li>Policz lot: <strong>lot = 1R / (SL × wartość punktu)</strong>.</li>
        </ol>
        <div className="mt-4"><RiskSizer /></div>
      </section>

      {/* Vol targeting */}
      <section>
        <h2 className="text-xl font-semibold">Volatility targeting (ATR)</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Gdy ATR rośnie — zmniejszasz lot; gdy spada — możesz zwiększyć.</li>
          <li>Cel: podobne wahania PnL (w R) niezależnie od zmienności rynku.</li>
        </ul>
        <div className="mt-3"><VolTarget /></div>
      </section>

      {/* Limity */}
      <section>
        <h2 className="text-xl font-semibold">Limity i higiena</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Limit dzienny: np. 2R; tygodniowy: 5R. Po osiągnięciu — koniec sesji.</li>
          <li>Przerwa po 2 stratach pod rząd, zakaz „revenge trading”.</li>
        </ul>
        <div className="mt-3"><LimitsPanel /></div>
      </section>

      {/* Dziennik */}
      <section>
        <h2 className="text-xl font-semibold">Dziennik wyników</h2>
        <p className="mt-2 text-slate-300">
          Zapisuj: setup, screen, SL/TP, wynik w R, emocje, błąd/plus. Cotygodniowy raport: win-rate, avg win/avg loss,
          net R, największy DD. Decyzje: co zostaje, co ograniczyć, co testować.
        </p>
        <div className="mt-3"><Journal /></div>
      </section>

      {/* Zadanie + Mini-quiz */}
      <section>
        <h2 className="text-xl font-semibold">Zadanie</h2>
        <ol className="mt-2 list-decimal pl-6 space-y-1">
          <li>Ustal 1R i limity (dzień/tydzień). Wydrukuj i powieś przy biurku.</li>
          <li>Przygotuj arkusz dziennika (lub użyj powyższego) i zrób 10 transakcji na demo.</li>
          <li>Podsumuj: win-rate, avg win/loss, net R, max DD. Wnioski na kolejny tydzień.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-quiz</h2>
        <MiniQuiz />
      </section>

      <Callout type="info" title="Zastrzeżenie edukacyjne">
        Materiały mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnych.
      </Callout>
    </LessonLayout>
  );
}
