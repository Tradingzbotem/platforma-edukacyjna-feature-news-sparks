'use client';

import Link from "next/link";
import { useMemo, useState, type ReactNode, useEffect } from "react";

/* ───────────────────── Layout lekcji (zostawiam jak u Ciebie) ───────────────────── */
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
        {prevSlug ? (
          <Link className="underline" href={`/kursy/${coursePath}/${prevSlug}`}>← Poprzednia lekcja</Link>
        ) : <span /> }
        <Link className="underline" href={`/kursy/${coursePath}/${nextSlug ?? ""}`}>Następna lekcja →</Link>
      </nav>
    </main>
  );
}

/* ───────────────────── Pomocnicze „ramki” ───────────────────── */
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

/* ───────────────────── Mini kalkulator: wielkość pozycji + margin ───────────────────── */
function PositionSizing() {
  const [balance, setBalance] = useState<number>(2500);
  const [riskPct, setRiskPct] = useState<number>(0.5);
  const [slPoints, setSlPoints] = useState<number>(25);
  const [pointValue1Lot, setPointValue1Lot] = useState<number>(0.5); // wartość 1 punktu przy 1 locie (np. 0.5 USD/pt)
  const [price, setPrice] = useState<number>(5000);                   // bieżąca cena instrumentu (np. indeks)
  const [leverage, setLeverage] = useState<number>(30);

  const riskCash = useMemo(() => +(balance * (riskPct / 100)).toFixed(2), [balance, riskPct]);
  const lotSize = useMemo(() => {
    if (!slPoints || !pointValue1Lot) return 0;
    const l = riskCash / (slPoints * pointValue1Lot);
    return +Math.max(0, l).toFixed(3);
  }, [riskCash, slPoints, pointValue1Lot]);

  // szacunkowa ekspozycja – przyjmujemy uproszczenie: 1 lot ≈ cena instrumentu (CFD z mnożnikiem 1)
  // różni się u brokerów, dlatego zostawiamy to jako orientacyjny model do rozmowy na kolejnych lekcjach
  const notional = useMemo(() => +(lotSize * price).toFixed(2), [lotSize, price]);
  const margin = useMemo(() => leverage ? +(notional / leverage).toFixed(2) : 0, [notional, leverage]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold">Kalkulator wielkości pozycji i marginu (demo)</h3>
      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
        <label className="grid gap-1">
          <span>Kapitał rachunku (USD)</span>
          <input value={balance} onChange={e=>setBalance(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Ryzyko % (1R)</span>
          <input value={riskPct} onChange={e=>setRiskPct(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>SL (w punktach)</span>
          <input value={slPoints} onChange={e=>setSlPoints(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Wartość 1 punktu przy 1 locie (USD/pt)</span>
          <input value={pointValue1Lot} onChange={e=>setPointValue1Lot(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Cena instrumentu (orientacyjnie)</span>
          <input value={price} onChange={e=>setPrice(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
        <label className="grid gap-1">
          <span>Dźwignia (np. 30)</span>
          <input value={leverage} onChange={e=>setLeverage(+e.target.value || 0)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-white/30" />
        </label>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-white/60">Ryzyko (1R)</div>
          <div className="text-lg font-semibold">${riskCash.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-white/60">Wielkość pozycji (lot)</div>
          <div className="text-lg font-semibold">{lotSize}</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-white/60">Szac. margin</div>
          <div className="text-lg font-semibold">${margin.toLocaleString()}</div>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/60">
        Uwaga: kalkulator jest edukacyjny i upraszcza specyfikację instrumentów (mnożniki/tick-value różnią się między
        brokerami). W praktyce sprawdzaj w specyfikacji CFD: wartość punktu/ticka i wymagany depozyt.
      </p>
    </div>
  );
}

/* ───────────────────── Mini-quiz (3 pytania) ───────────────────── */
type Q = { q: string; a: number; opts: string[] };
const QUIZ: Q[] = [
  {
    q: "CFD „delta ≈ 1” oznacza, że…",
    a: 1,
    opts: [
      "CFD zawsze zarabia 1% dziennie",
      "zmiana ceny CFD jest bardzo zbliżona do zmiany instrumentu bazowego",
      "CFD nie podlega poślizgom",
      "CFD ma stałą wartość ticka na każdym rynku",
    ],
  },
  {
    q: "Margin to…",
    a: 0,
    opts: [
      "depozyt wymagany do utrzymania ekspozycji",
      "to samo co ryzyko 1R",
      "zawsze stała kwota 1000 USD",
      "prowizja maklerska",
    ],
  },
  {
    q: "Które stwierdzenie o ryzykach jest prawdziwe?",
    a: 2,
    opts: [
      "Poślizgi zdarzają się tylko na krypto",
      "Luki nie wpływają na stop-lossy",
      "Luki i dane makro zwiększają ryzyko poślizgu",
      "Swap overnight zawsze jest zerowy",
    ],
  },
];

function MiniQuiz() {
  const KEY = "cfd:lesson1:quiz";
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
      <h3 className="font-semibold">Mini-quiz: sprawdź się</h3>
      <div className="mt-3 space-y-4">
        {QUIZ.map((qa, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3">
            <div className="font-medium">{i + 1}) {qa.q}</div>
            <div className="mt-2 grid gap-2">
              {qa.opts.map((o, j) => {
                const isCorrect = checked && j === qa.a;
                const isWrong = checked && picked[i] === j && j !== qa.a;
                return (
                  <label key={j} className="flex items-center gap-2 text-sm">
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
      coursePath="cfd" courseTitle="CFD" lessonNumber={1} minutes={18}
      title="Wprowadzenie do CFD (mechanika, dźwignia, plusy i ryzyka)" nextSlug="lekcja-2"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Zrozumiesz, czym są kontrakty CFD i jak odwzorowują cenę instrumentu bazowego.</li>
          <li>Poznajesz dźwignię i depozyt zabezpieczający (margin) — oraz jak ich nie mylić z „dużym zyskiem”.</li>
          <li>Wiesz, na co uważać (OTC, poślizg, luki, finansowanie overnight).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Czym są CFD?</h2>
        <p className="mt-2 text-slate-300">
          CFD (Contracts for Difference) rozliczają <em>różnicę ceny</em> pomiędzy otwarciem a zamknięciem pozycji.
          Nie posiadasz aktywa bazowego (np. baryłek ropy), ale Twoja ekspozycja na zmianę ceny jest bardzo zbliżona
          (delta ≈ 1). Broker rozlicza Ci zysk/stratę w walucie rachunku.
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-1">
          <li><strong>Long</strong>: zysk, gdy cena rośnie; <strong>Short</strong>: zysk, gdy cena spada.</li>
          <li><strong>OTC</strong> (over-the-counter): instrument pozagiełdowy — ważna jest jakość dostawcy płynności.</li>
          <li>Popularne rynki: indeksy (US500, DE40), surowce (XAUUSD, WTI), krypto, akcje pojedyncze (CFD na akcje).</li>
        </ul>
        <Callout type="info" title="Słowniczek">
          <ul className="list-disc pl-5">
            <li><strong>Delta ≈ 1</strong> — CFD zmienia się niemal 1:1 z rynkiem bazowym.</li>
            <li><strong>Tick / punkt</strong> — najmniejsza zmiana kwotowania; „wartość punktu” zależy od kontraktu/brokera.</li>
          </ul>
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Dźwignia i margin — jak to liczyć?</h2>
        <p className="mt-2 text-slate-300">
          Dźwignia 1:30 oznacza, że do utrzymania pozycji o ekspozycji 30&nbsp;000 USD potrzebujesz ~1&nbsp;000 USD depozytu
          (upraszczając). Kluczowe jest <strong>zarządzanie wielkością pozycji</strong> pod stałe 1R, a nie „maksymalna dźwignia”.
        </p>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-3">
          <h3 className="font-semibold">Przykład</h3>
          <p className="text-slate-300 mt-1">
            Rachunek 2 500 USD, ryzyko <strong>1R = 0.5%</strong> ⇒ 12.5 USD. Jeśli SL = 25 punktów i wartość 1 punktu
            dla 1 lota wynosi 0.5 USD, to lot = <strong>1R / (SL × wartość punktu)</strong> = 12.5 / (25 × 0.5) = <strong>1.0</strong>.
          </p>
        </div>

        <Callout type="tip" title="Praktyka">
          Zdefiniuj stałe 1R (np. 0.25–1% kapitału) i każdą pozycję licz tak, aby maksymalna strata wynosiła 1R. Dźwignia
          „ustawi się sama” poprzez wielkość pozycji.
        </Callout>

        <div className="mt-4">
          <PositionSizing />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Plusy i pułapki</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-4">
            <h3 className="font-semibold text-emerald-300">Plusy</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Long/short jednym kliknięciem na wielu rynkach.</li>
              <li>Niski próg kapitałowy dzięki dźwigni.</li>
              <li>Prosta ekspozycja na indeksy/surowce bez rolowania futures.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-rose-500/5 border border-rose-400/20 p-4">
            <h3 className="font-semibold text-rose-300">Ryzyka</h3>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Luki i poślizg (szczególnie otwarcia, dane makro).</li>
              <li>Finansowanie overnight (swap), zwłaszcza dla pozycji długich na niektórych rynkach.</li>
              <li>OTC — jakość egzekucji zależy od brokera &amp; płynności.</li>
            </ul>
          </div>
        </div>
        <Callout type="warn" title="Uwaga: ryzyko luki">
          W weekendy i przy istotnych publikacjach ryzyko przeskoku ceny jest zwiększone — stop może zostać zrealizowany z poślizgiem.
        </Callout>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mini-quiz (dla Ciebie)</h2>
        <MiniQuiz />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Rozumiesz long/short i rozliczanie różnicy cen.</li>
          <li>Używasz stałego 1R w sizingu, a nie „ile broker pozwoli”.</li>
          <li>Wiesz, że swap i luki to realne koszty/ryzyka strategii.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
