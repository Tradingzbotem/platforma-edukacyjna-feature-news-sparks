'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/* ───────────────────── Layout jak w poprzednich lekcjach ───────────────────── */
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

/* ───────────────────── Drobne klocki UI ───────────────────── */
function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "tip" | "warn";
  title: string;
  children: ReactNode;
}) {
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

/* ───────────────────── Kalkulator poślizgu (ile R „zjada”) ───────────────────── */
function SlippageCalculator() {
  const KEY = "cfd:l4:slip";
  // Parametry przykładowe dla DE40 (1 pkt ≈ 1€ na 1.00 lot – sprawdź u brokera)
  const [pointValue1Lot, setPointValue1Lot] = useState(1);   // $/pkt przy 1.00 lot
  const [lots, setLots] = useState(1.0);
  const [plannedStopPts, setPlannedStopPts] = useState(15);  // 1R w pkt (plan)
  const [slipPts, setSlipPts] = useState(0.8);               // poślizg w pkt (ujemny dla nas)
  const [movePts, setMovePts] = useState(10);                // ruch ceny po wejściu (opcjonalnie, by zobaczyć P&L)

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setPointValue1Lot(p.pointValue1Lot ?? pointValue1Lot);
        setLots(p.lots ?? lots);
        setPlannedStopPts(p.plannedStopPts ?? plannedStopPts);
        setSlipPts(p.slipPts ?? slipPts);
        setMovePts(p.movePts ?? movePts);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        KEY,
        JSON.stringify({ pointValue1Lot, lots, plannedStopPts, slipPts, movePts })
      );
    }
  }, [pointValue1Lot, lots, plannedStopPts, slipPts, movePts]);

  // Cash za 1 pkt
  const perPointCash = useMemo(() => lots * pointValue1Lot, [lots, pointValue1Lot]);

  // Planowany 1R w $
  const oneR = useMemo(
    () => +(plannedStopPts * perPointCash).toFixed(2),
    [plannedStopPts, perPointCash]
  );

  // Ile $ „zjadł” poślizg przy wejściu
  const slipCash = useMemo(() => +(Math.max(slipPts, 0) * perPointCash).toFixed(2), [slipPts, perPointCash]);

  // Jaka część 1R została „zjedzona”
  const rEaten = useMemo(() => (oneR > 0 ? slipCash / oneR : 0), [slipCash, oneR]);

  // Efektywny stop po poślizgu (mniejszy bufor)
  const effectiveStopPts = useMemo(
    () => Math.max(plannedStopPts - Math.max(slipPts, 0), 0),
    [plannedStopPts, slipPts]
  );
  const effectiveOneR = useMemo(
    () => +(effectiveStopPts * perPointCash).toFixed(2),
    [effectiveStopPts, perPointCash]
  );

  // Demo P&L po ruchu „movePts”
  const pnl = useMemo(() => +(movePts * perPointCash - slipCash).toFixed(2), [movePts, perPointCash, slipCash]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Kalkulator poślizgu</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Wartość 1 pkt przy 1.00 locie (USD/EUR)</span>
            <input
              value={pointValue1Lot}
              onChange={(e) => setPointValue1Lot(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"
            />
          </label>
          <label className="grid gap-1">
            <span>Loty</span>
            <input
              value={lots}
              onChange={(e) => setLots(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"
            />
          </label>
          <label className="grid gap-1">
            <span>Planowany stop (pkt) = 1R</span>
            <input
              value={plannedStopPts}
              onChange={(e) => setPlannedStopPts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"
            />
          </label>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span>Poślizg na wejściu (pkt)</span>
            <input
              value={slipPts}
              onChange={(e) => setSlipPts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"
            />
          </label>
          <label className="grid gap-1">
            <span>Ruch po wejściu (pkt) — opcjonalnie</span>
            <input
              value={movePts}
              onChange={(e) => setMovePts(+e.target.value || 0)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30"
            />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-2">
        <Stat label="Planowane 1R (cash)" value={`${oneR.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`} />
        <Stat label="Slip „zjada”" value={`${(rEaten * 100).toFixed(1)}% 1R`} />
        <Stat label="Efektywny 1R po slippage" value={`${effectiveOneR.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`} />
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-2">
        <Stat label="P&L za ruch (po uwzgl. slipu)" value={`${pnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`} />
        <Stat label="Efektywny stop (pkt)" value={`${effectiveStopPts.toFixed(2)} pkt`} />
        <Stat label="Wartość 1 pkt (cash)" value={`${(pointValue1Lot * lots).toFixed(2)}`} />
      </div>

      <p className="text-xs text-white/60 mt-1">
        Wniosek: duży slip „zjada” część 1R – rozważ mniejsze loty na otwarciach/danych lub użycie zleceń Limit/Stop-Limit.
      </p>
    </div>
  );
}

/* ───────────────────── Porównanie typów zleceń ───────────────────── */
function OrdersHelp() {
  const [type, setType] = useState<"market" | "limit" | "stoplimit">("market");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <h3 className="font-semibold">Market vs Limit vs Stop-Limit</h3>
      <div className="flex gap-2 text-sm">
        <button
          className={`px-3 py-1 rounded-lg ${type === "market" ? "bg-white text-slate-900" : "bg-white/10"}`}
          onClick={() => setType("market")}
        >
          Market
        </button>
        <button
          className={`px-3 py-1 rounded-lg ${type === "limit" ? "bg-white text-slate-900" : "bg-white/10"}`}
          onClick={() => setType("limit")}
        >
          Limit
        </button>
        <button
          className={`px-3 py-1 rounded-lg ${type === "stoplimit" ? "bg-white text-slate-900" : "bg-white/10"}`}
          onClick={() => setType("stoplimit")}
        >
          Stop-Limit
        </button>
      </div>

      {type === "market" && (
        <Callout type="info" title="Market (natychmiast)">
          Najszybsza realizacja, ale ryzyko poślizgu (szczególnie 09:00 DE40 / 15:30 USA / publikacje).
          Dobry przy <em>impetowych</em> wejściach, kiedy liczy się potwierdzenie.
        </Callout>
      )}
      {type === "limit" && (
        <Callout type="tip" title="Limit (lepsza cena)">
          Gwarantuje maksymalną cenę wejścia (dla kupna), ale nie gwarantuje wypełnienia.
          Użyteczny do pullbacków — jeśli rynek „ucieknie”, nie gonisz i nie łapiesz dużego slipu.
        </Callout>
      )}
      {type === "stoplimit" && (
        <Callout type="info" title="Stop-Limit (aktywacja + limit)">
          Aktywuje się po wybiciu (jak stop), lecz realizuje do ceny limit.
          Chroni przed skrajnym slipem, ale w bardzo szybkim ruchu może w ogóle nie wypełnić.
        </Callout>
      )}

      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Jeśli system wymaga <em>wąskiego</em> SL — rozważ Limit/Stop-Limit.</li>
        <li>Na danych/otwarciach: mniejsze loty albo odpuszczenie pierwszych minut.</li>
        <li>Zawsze testuj koszty (spread + slip) vs. skuteczność wejść.</li>
      </ul>
    </div>
  );
}

/* ───────────────────── Checklista realizacji (zapis lokalny) ───────────────────── */
function ExecutionChecklist() {
  const KEY = "cfd:l4:check";
  type Item = { id: string; label: string; done: boolean };
  const defaults: Item[] = [
    { id: "spread", label: "Sprawdź bieżący spread i płynność (czy nie jest nietypowo szeroko?)", done: false },
    { id: "when", label: "Czy to otwarcie/dane? Jeśli tak — redukuj lot/zmień typ zlecenia", done: false },
    { id: "type", label: "Wybierz typ zlecenia zgodny ze strategią (Market / Limit / Stop-Limit)", done: false },
    { id: "r", label: "Przelicz 1R po uwzględnieniu potencjalnego slipu", done: false },
  ];
  const [items, setItems] = useState<Item[]>(defaults);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const reset = () => setItems(defaults);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold">Checklist realizacji</h3>
      <div className="mt-2 grid gap-2 text-sm">
        {items.map((i) => (
          <label key={i.id} className="flex items-center gap-2">
            <input type="checkbox" className="accent-white" checked={i.done} onChange={() => toggle(i.id)} />
            <span className={i.done ? "line-through text-white/50" : ""}>{i.label}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={reset} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ───────────────────── Mini-quiz ───────────────────── */
type Q = { q: string; a: number; opts: string[] };
const QUIZ: Q[] = [
  {
    q: "Co daje zlecenie Limit przy wejściu long?",
    a: 1,
    opts: [
      "Gwarancję wypełnienia po każdej cenie",
      "Maksymalną cenę wejścia (lepszą), ale brak gwarancji wypełnienia",
      "Brak poślizgu i 100% fill",
      "Aktywację po wybiciu, a potem realizację po dowolnej cenie",
    ],
  },
  {
    q: "Dlaczego poślizg „zmniejsza” efektywny 1R?",
    a: 0,
    opts: [
      "Część zaplanowanego ryzyka w $ wykorzystujesz już na wejściu",
      "Bo spread maleje",
      "Bo target rośnie",
      "Bo loty automatycznie się zmniejszają u brokera",
    ],
  },
  {
    q: "Kiedy Stop-Limit może być lepszy niż czysty Stop?",
    a: 2,
    opts: [
      "Gdy chcesz zawsze mieć fill na danych",
      "Gdy spread jest najniższy",
      "Gdy chcesz ograniczyć skrajny slip kosztem ryzyka braku wypełnienia",
      "Nigdy — to to samo",
    ],
  },
];

function MiniQuiz() {
  const KEY = "cfd:l4:quiz";
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(QUIZ.length).fill(null));
  const [checked, setChecked] = useState(false);
  const score = useMemo(
    () => picked.reduce<number>((sum, v, i) => (v === QUIZ[i].a ? sum + 1 : sum), 0),
    [picked]
  );

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
      <h3 className="font-semibold">Mini-quiz</h3>
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
                      onChange={() =>
                        setPicked((prev) => {
                          const c = [...prev];
                          c[i] = j;
                          return c;
                        })
                      }
                      disabled={checked}
                    />
                    <span className={isCorrect ? "text-emerald-300" : isWrong ? "text-rose-300" : ""}>
                      {o}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-white/70">
          {checked ? (
            <>Wynik: <span className="text-white font-semibold">{score}/{QUIZ.length}</span></>
          ) : (
            "Zaznacz odpowiedzi i sprawdź wynik."
          )}
        </div>
        <div className="flex gap-2">
          {!checked && (
            <button
              onClick={() => setChecked(true)}
              className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
            >
              Sprawdź
            </button>
          )}
          {checked && (
            <button
              onClick={() => {
                setChecked(false);
                setPicked(Array(QUIZ.length).fill(null));
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── STRONA LEKCJI ───────────────────── */
export default function Page() {
  return (
    <LessonLayout
      coursePath="cfd"
      courseTitle="CFD"
      lessonNumber={4}
      minutes={16}
      title="Realizacja zleceń i poślizg — jak planować, jak ograniczać"
      prevSlug="lekcja-3"
      nextSlug="lekcja-5"
    >
      <section>
        <h2 className="text-xl font-semibold">Typy zleceń i ich konsekwencje</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Market</strong> — natychmiast, ryzyko poślizgu; sens przy wejściach impetowych.</li>
          <li><strong>Limit</strong> — lepsza cena, ale możliwy brak wypełnienia (pullbacki).</li>
          <li><strong>Stop</strong> — aktywacja po wybiciu; często slip + spread większe na ruchu.</li>
          <li><strong>Stop-Limit</strong> — aktywacja po wybiciu, realizacja do ceny limit (ogranicza skrajny slip).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Skąd się bierze poślizg?</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>Skoki płynności (otwarcia 09:00/15:30, publikacje makro) i mikrosktruktura rynku.</li>
          <li>Tryby out-of-hours, przerwy techniczne, poszerzone widełki kwotowań.</li>
        </ul>
        <Callout type="info" title="Praktyczna obserwacja">
          W pierwszych minutach sesji spread/poślizg bywa największy. Jeżeli system wymaga wąskiego SL — zmniejsz lot
          albo poczekaj na stabilizację.
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Kalkulator poślizgu</h2>
        <SlippageCalculator />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Dobór typu zlecenia</h2>
        <OrdersHelp />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist realizacji</h2>
        <ExecutionChecklist />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ćwiczenie</h2>
        <p className="mt-2 text-slate-300">
          Otwórz wykres DE40 i zaznacz 10 świec z największym spreadem/ruchem na otwarciu.
          W jakich godzinach i po jakich publikacjach pojawia się największy slip?
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-quiz</h2>
        <MiniQuiz />
      </section>
    </LessonLayout>
  );
}
