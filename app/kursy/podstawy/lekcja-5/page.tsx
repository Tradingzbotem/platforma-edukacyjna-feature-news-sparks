'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const KEY = "course:podstawy:done";
const SLUG = "lekcja-5";

/* ───────────── UI helpers ───────────── */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">{children}</div>;
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

/* ───────────── Logika: 1 świeca ───────────── */
type Stats = {
  body: number;
  range: number;
  upper: number;
  lower: number;
  bodyPct: number;
  isBull: boolean;
};

function candleStats(o: number, h: number, l: number, c: number): Stats {
  const body = Math.abs(c - o);
  const range = Math.max(0, h - l);
  const upper = Math.max(0, h - Math.max(o, c));
  const lower = Math.max(0, Math.min(o, c) - l);
  const bodyPct = range > 0 ? (body / range) * 100 : 0;
  const isBull = c > o;
  return { body, range, upper, lower, bodyPct, isBull };
}

function classifyCandle(s: Stats) {
  if (s.range === 0) return { label: "brak ruchu", note: "High = Low – brak informacji." };
  const nearTop = s.upper <= Math.max(0.2 * s.range, 0.25 * s.body);
  const nearBottom = s.lower <= Math.max(0.2 * s.range, 0.25 * s.body);

  // Doji – bardzo mały korpus względem zakresu
  if (s.bodyPct <= 10) return { label: "doji", note: "Neutralna świeca – szukaj kontekstu (strefa S/R, zmienność, sesja)." };

  // Marubozu – prawie bez knotów, duży korpus
  if (s.bodyPct >= 60 && s.upper <= 0.05 * s.range && s.lower <= 0.05 * s.range) {
    return { label: s.isBull ? "marubozu bycza" : "marubozu niedźwiedzia", note: "Silny impuls bez wyraźnych knotów." };
  }

  // Pin bary (młot/strzelająca gwiazda)
  const longLower = s.lower >= 2 * s.body && nearTop;   // młot
  const longUpper = s.upper >= 2 * s.body && nearBottom; // shooting star
  if (longLower) return { label: "pin bar (młot)", note: "Długi dolny knot → odrzucenie dołu; sprawdź wsparcie." };
  if (longUpper) return { label: "pin bar (shooting star)", note: "Długi górny knot → odrzucenie góry; sprawdź opór." };

  if (s.bodyPct >= 60) return { label: s.isBull ? "długi korpus (byczy)" : "długi korpus (niedźwiedzi)", note: "Dominująca świeca impulsowa." };
  return { label: s.isBull ? "świeca wzrostowa" : "świeca spadkowa", note: "Brak jednoznacznej formacji – użyj kontekstu." };
}

/* ───────────── Logika: 2 świece ───────────── */
type OHLC = { o: number; h: number; l: number; c: number };

function detectTwoCandlePattern(prev: OHLC, cur: OHLC) {
  const prevBodyLow = Math.min(prev.o, prev.c);
  const prevBodyHigh = Math.max(prev.o, prev.c);
  const curBodyLow = Math.min(cur.o, cur.c);
  const curBodyHigh = Math.max(cur.o, cur.c);

  const prevBear = prev.c < prev.o;
  const prevBull = prev.c > prev.o;
  const curBear = cur.c < cur.o;
  const curBull = cur.c > cur.o;

  const insideBar = cur.h <= prev.h && cur.l >= prev.l;
  const outsideBar = cur.h >= prev.h && cur.l <= prev.l;

  const bullishEngulfing =
    prevBear && curBull && curBodyLow <= prevBodyLow && curBodyHigh >= prevBodyHigh;
  const bearishEngulfing =
    prevBull && curBear && curBodyLow <= prevBodyLow && curBodyHigh >= prevBodyHigh;

  if (bullishEngulfing) return { label: "engulfing byczy", note: "Korpus byczy pochłania poprzedni korpus spadkowy (pot. odwrócenie w górę)." };
  if (bearishEngulfing) return { label: "engulfing niedźwiedzi", note: "Korpus spadkowy pochłania poprzedni korpus wzrostowy (pot. odwrócenie w dół)." };
  if (insideBar) return { label: "inside bar", note: "Konsolidacja – często wybicie nadaje kierunek (szukaj kontekstu)." };
  if (outsideBar) return { label: "outside bar", note: "Zasięg większy niż poprzedniej świecy – zmienność/pojedynek stron." };

  return { label: "brak klasycznej formacji", note: "Może to lokalny swing/recall – sprawdź S/R i trend wyższej ramy." };
}

export default function Page() {
  const [done, setDone] = useState(false);

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

  /* ───────────── Stany: 1 świeca ───────────── */
  const [o, setO] = useState<number>(1.1000);
  const [h, setH] = useState<number>(1.1050);
  const [l, setL] = useState<number>(1.0980);
  const [c, setC] = useState<number>(1.1040);

  const one = useMemo(() => candleStats(o, h, l, c), [o, h, l, c]);
  const oneClass = useMemo(() => classifyCandle(one), [one]);

  /* ───────────── Stany: 2 świece ───────────── */
  const [p, setP] = useState<OHLC>({ o: 1.1020, h: 1.1035, l: 1.0975, c: 1.0985 }); // poprzednia – lekko spadkowa
  const [n, setN] = useState<OHLC>({ o: 1.0980, h: 1.1060, l: 1.0978, c: 1.1055 }); // obecna – mocny byczy korpus
  const two = useMemo(() => detectTwoCandlePattern(p, n), [p, n]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs text-white/60">Moduł: Podstawy • Lekcja 5</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">Czytanie świec</h1>
          <p className="text-white/70 mt-2">Ceny OHLC, interwały i podstawowe formacje świecowe w praktyce.</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-4 py-2 rounded-lg font-semibold ${done ? "bg-green-400 text-slate-900 hover:opacity-90" : "bg-white/10 hover:bg-white/20"}`}
            >
              {done ? "✓ Ukończono" : "Oznacz jako ukończoną"}
            </button>
            <Link href="/kursy/podstawy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">← Spis lekcji</Link>
          </div>
        </header>

        {/* Teoria */}
        <section className="prose prose-invert prose-slate max-w-none">
          <h2>Świeca (OHLC) i interwały</h2>
          <p>Świeca pokazuje cztery ceny: <strong>Open</strong>, <strong>High</strong>, <strong>Low</strong>, <strong>Close</strong> w zadanym czasie (M1, M15, H1, D1…).</p>
          <ul>
            <li><strong>Korpus</strong> – odległość między otwarciem a zamknięciem (kierunek: wzrostowy/spadkowy).</li>
            <li><strong>Knoty (cienie)</strong> – zakres wybicia powyżej/pniżej korpusu (próby rynku, odrzucenia).</li>
            <li><strong>Zakres świecy</strong> – <code>High − Low</code>; <em>body%</em> = korpus / zakres × 100.</li>
          </ul>

          <h2>Formacje bazowe i kontekst</h2>
          <ul>
            <li><strong>Pin bar</strong> (młot / shooting star) – długi knot i mały korpus → odrzucenie poziomu S/R.</li>
            <li><strong>Engulfing</strong> – korpus świecy pochłania korpus poprzedniej (pot. odwrócenie).</li>
            <li><strong>Inside bar</strong> – świeca „w środku” zakresu poprzedniej (konsolidacja → często wybicie).</li>
            <li><strong>Doji</strong> – bardzo mały korpus (niepewność, równowaga podaży/popytu).</li>
          </ul>
          <p><em>Sam kształt nie wystarczy</em> – liczy się miejsce (strefa S/R), trend wyższej ramy, zmienność i timing (sesja, makro).</p>
        </section>

        {/* Lab: 1 świeca */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Laboratorium świecy (1 świeca)</h2>
          <Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Open">
                <NumberInput value={o} onChange={e => setO(parseFloat(e.target.value || "0"))} />
              </Field>
              <Field label="High">
                <NumberInput value={h} onChange={e => setH(parseFloat(e.target.value || "0"))} />
              </Field>
              <Field label="Low">
                <NumberInput value={l} onChange={e => setL(parseFloat(e.target.value || "0"))} />
              </Field>
              <Field label="Close">
                <NumberInput value={c} onChange={e => setC(parseFloat(e.target.value || "0"))} />
              </Field>
            </div>

            <hr className="my-5 border-white/10" />

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Kierunek: <strong>{one.isBull ? "wzrostowa" : "spadkowa"}</strong></div>
                <div>Korpus: <strong>{(one.body).toFixed(5)}</strong></div>
                <div>Górny knot: <strong>{(one.upper).toFixed(5)}</strong></div>
                <div>Dolny knot: <strong>{(one.lower).toFixed(5)}</strong></div>
                <div>Zakres: <strong>{(one.range).toFixed(5)}</strong> • Korpus%: <strong>{one.bodyPct.toFixed(1)}%</strong></div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-lg">Klasyfikacja: <strong>{oneClass.label}</strong></div>
                <div className="text-sm text-white/70 mt-1">{oneClass.note}</div>
                <div className="text-xs text-white/50 mt-2">Uwaga: progi orientacyjne – różne rynki mają różną mikrostrukturę.</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Lab: 2 świece */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Laboratorium układów (2 świece)</h2>
          <Card>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2">Poprzednia świeca</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Open"><NumberInput value={p.o} onChange={e => setP(v => ({ ...v, o: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="High"><NumberInput value={p.h} onChange={e => setP(v => ({ ...v, h: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="Low"><NumberInput value={p.l} onChange={e => setP(v => ({ ...v, l: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="Close"><NumberInput value={p.c} onChange={e => setP(v => ({ ...v, c: parseFloat(e.target.value || "0") }))} /></Field>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Bieżąca świeca</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Open"><NumberInput value={n.o} onChange={e => setN(v => ({ ...v, o: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="High"><NumberInput value={n.h} onChange={e => setN(v => ({ ...v, h: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="Low"><NumberInput value={n.l} onChange={e => setN(v => ({ ...v, l: parseFloat(e.target.value || "0") }))} /></Field>
                  <Field label="Close"><NumberInput value={n.c} onChange={e => setN(v => ({ ...v, c: parseFloat(e.target.value || "0") }))} /></Field>
                </div>
              </div>
            </div>

            <hr className="my-5 border-white/10" />

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="text-lg">Wykryto: <strong>{two.label}</strong></div>
              <div className="text-sm text-white/70 mt-1">{two.note}</div>
              <div className="text-xs text-white/50 mt-2">Engulfing dotyczy <em>korpusu</em> (Open–Close), a inside/outside bar – całego zakresu (High–Low).</div>
            </div>
          </Card>
        </section>

        {/* Praktyka, wskazówki, ćwiczenia */}
        <section className="prose prose-invert prose-slate max-w-none mt-10">
          <h2>Dobre praktyki i kontekst</h2>
          <ul>
            <li>Najpierw <strong>kontekst</strong> (trend wyższej ramy, S/R, zmienność), dopiero potem kształt świecy.</li>
            <li>Szanuj sesje: dużo fałszywych sygnałów poza overlayem Londyn–NY.</li>
            <li>Wlicz koszt wejścia (spread/poślizg) – na niskich interwałach niszczy R:R.</li>
            <li>Stosuj <strong>stałe 1R</strong>, prowadź dziennik screenów (przed/po) – łatwiej ocenisz edge.</li>
          </ul>

          <h3>Ćwiczenia (5–10 min)</h3>
          <ol>
            <li>Znajdź 5 przykładów pin barów na D1 i zaznacz tylko te ze <em>strefy</em> S/R. Które działały lepiej?</li>
            <li>Wybierz 20 inside barów na H4. Zmierz skuteczność wybicia z filtrem trendu vs. bez trendu.</li>
            <li>Policz średni <em>body%</em> dla świec impulsowych na M15 w overlayu EU–US. Czy różni się od reszty dnia?</li>
          </ol>

          <h3>Checklist po lekcji</h3>
          <ul>
            <li>Potrafię policzyć korpus, knoty i <em>body%</em> oraz rozpoznać bazowe formacje świecowe.</li>
            <li>Wiem, że formacja bez kontekstu ma niską wartość predykcyjną.</li>
            <li>Łączę wejścia świecowe z zarządzaniem ryzykiem i realnymi kosztami transakcyjnymi.</li>
          </ul>
        </section>

        {/* Nawigacja */}
        <footer className="mt-10 flex items-center justify-between">
          <Link href="/kursy/podstawy/lekcja-4" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">← Poprzednia</Link>
          <Link href="/kursy/podstawy" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Zakończ moduł</Link>
        </footer>
      </article>
    </main>
  );
}
