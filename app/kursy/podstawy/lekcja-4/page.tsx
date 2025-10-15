'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const KEY = "course:podstawy:done";
const SLUG = "lekcja-4";

/* ───────────────── UI helpers ───────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">{children}</div>
  );
}
function Field({
  label, children, help,
}: { label: string; children: React.ReactNode; help?: string }) {
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
function RangeInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      {...props}
      className="w-full accent-white"
    />
  );
}

/* ─────────────── Kalkulatory (logika) ─────────────── */
function useLeverageCalculations({
  balance,
  leverage,
  lots,
  notionalPerLot, // wartość nominalna 1.00 lota (np. 100 000 dla FX)
}: {
  balance: number;
  leverage: number; // 1:x
  lots: number;
  notionalPerLot: number;
}) {
  const exposure = useMemo(() => Math.max(0, notionalPerLot) * Math.max(0, lots), [notionalPerLot, lots]);
  const marginRequired = useMemo(() => (leverage > 0 ? exposure / leverage : 0), [exposure, leverage]);
  const freeAfter = useMemo(() => balance - marginRequired, [balance, marginRequired]);
  const maxLotsByMargin = useMemo(
    () => (notionalPerLot > 0 ? (balance * leverage) / notionalPerLot : 0),
    [balance, leverage, notionalPerLot]
  );
  return { exposure, marginRequired, freeAfter, maxLotsByMargin };
}

function useRiskSizing({
  balance, riskPct, slPips, pipValuePerLot, lots,
}: {
  balance: number; riskPct: number; slPips: number; pipValuePerLot: number; lots: number;
}) {
  const riskCash = useMemo(() => balance * (Math.max(0, riskPct) / 100), [balance, riskPct]);
  const pipValue = useMemo(() => Math.max(0, pipValuePerLot) * Math.max(0, lots), [pipValuePerLot, lots]);
  const riskFromSL = useMemo(() => Math.max(0, slPips) * pipValue, [slPips, pipValue]);
  return { riskCash, pipValue, riskFromSL };
}

export default function Page() {
  const [done, setDone] = useState(false);

  // Stany do kalkulatorów
  const [balance, setBalance] = useState<number>(10_000);
  const [leverage, setLeverage] = useState<number>(30); // 1:30
  const [notionalPerLot, setNotionalPerLot] = useState<number>(100_000); // FX: 1 lot = 100 000
  const [lots, setLots] = useState<number>(0.50);

  const [riskPct, setRiskPct] = useState<number>(1);   // 1R = 1% konta
  const [slPips, setSlPips] = useState<number>(20);
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // np. EURUSD, konto USD

  const { exposure, marginRequired, freeAfter, maxLotsByMargin } = useLeverageCalculations({
    balance, leverage, lots, notionalPerLot
  });
  const { riskCash, pipValue, riskFromSL } = useRiskSizing({
    balance, riskPct, slPips, pipValuePerLot, lots
  });

  // loty „z ryzyka” (przy danym SL i wartości pipsa/lot)
  const lotsByRisk = useMemo(() => {
    const denom = Math.max(0.0000001, slPips * pipValuePerLot); // zabezpieczenie przed 0
    return riskCash / denom;
  }, [riskCash, slPips, pipValuePerLot]);

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

  // Co-jeśli dla dźwigni
  const [whatIfLev, setWhatIfLev] = useState<number>(30);
  const whatIfMargin = useMemo(() => (whatIfLev > 0 ? (notionalPerLot * lots) / whatIfLev : 0), [whatIfLev, notionalPerLot, lots]);
  const whatIfFree = useMemo(() => balance - whatIfMargin, [balance, whatIfMargin]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs text-white/60">Moduł: Podstawy • Lekcja 4</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">Dźwignia i ryzyko</h1>
          <p className="text-white/70 mt-2">
            Ekspozycja, depozyt zabezpieczający (margin) oraz zasada stałego ryzyka na transakcję. Jak dobrać loty tak,
            aby jednocześnie <em>mieć wystarczający margin</em> i <em>trzymać stałe 1R</em>.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-4 py-2 rounded-lg font-semibold ${done ? "bg-green-400 text-slate-900 hover:opacity-90" : "bg-white/10 hover:bg-white/20"}`}
              title={done ? "Oznacz jako nieukończoną" : "Oznacz jako ukończoną"}
            >
              {done ? "✓ Ukończono" : "Oznacz jako ukończoną"}
            </button>
            <Link href="/kursy/podstawy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">← Spis lekcji</Link>
          </div>
        </header>

        {/* Definicje i mity */}
        <section className="prose prose-invert prose-slate max-w-none">
          <h2>Podstawy</h2>
          <ul>
            <li><strong>Dźwignia</strong> zwiększa ekspozycję względem kapitału, ale <em>nie zwiększa 1R</em> — 1R definiujesz Ty (ryzyko % konta).</li>
            <li><strong>Depozyt (margin)</strong> to kwota zamrożona jako zabezpieczenie pozycji: <code>margin = nominal / dźwignia</code>.</li>
            <li><strong>Ryzyko na transakcję</strong> (1R) — zwykle 0.5–2% salda. Kluczem jest <em>dobór lotów</em> do SL.</li>
          </ul>

          <h3>Mit vs. prawda</h3>
          <ul>
            <li><em>Mit:</em> „Wyższa dźwignia = większy zysk”. <br/> <em>Prawda:</em> Dźwignia decyduje o wymaganym marginie; o zysku/stracie decyduje wielkość pozycji i ruch ceny.</li>
            <li><em>Mit:</em> „Ryzyko to depozyt”. <br/> <em>Prawda:</em> Ryzyko to strata przy realizacji SL, a nie wysokość wymaganego marginu.</li>
          </ul>
        </section>

        {/* Kalkulator dźwigni & margin */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Kalkulator: dźwignia, ekspozycja i margin</h2>
          <Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Saldo konta">
                <NumberInput value={balance} onChange={e => setBalance(parseFloat(e.target.value || '0'))} />
              </Field>
              <Field label="Dźwignia (1:x)">
                <NumberInput value={leverage} onChange={e => setLeverage(parseFloat(e.target.value || '0'))} />
              </Field>
              <Field label="Wartość nominalna 1.00 lota">
                <NumberInput
                  value={notionalPerLot}
                  onChange={e => setNotionalPerLot(parseFloat(e.target.value || '0'))}
                />
                <div className="mt-1 text-xs text-white/50">
                  FX: 100 000. Indeksy/surowce — wstaw odpowiedni nominał u Twojego brokera.
                </div>
              </Field>
              <Field label="Wielkość pozycji (loty)">
                <NumberInput value={lots} onChange={e => setLots(parseFloat(e.target.value || '0'))} />
              </Field>
            </div>

            <hr className="my-5 border-white/10" />

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Ekspozycja (nominal):</div>
                <div className="text-lg font-semibold">
                  {exposure.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="mt-2">Wymagany margin:</div>
                <div className={`text-lg font-semibold ${marginRequired > balance ? "text-rose-300" : ""}`}>
                  {marginRequired.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Wolny margin po otwarciu:</div>
                <div className={`text-lg font-semibold ${freeAfter < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                  {freeAfter.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="mt-2">Maks. loty „z marginesu” (≈):</div>
                <div className="text-lg font-semibold">
                  {maxLotsByMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })} lot
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Uwaga: obliczenia edukacyjne. Rzeczywisty nominał/mnożniki mogą się różnić między brokerami.
            </div>
          </Card>
        </section>

        {/* Sizing: ryzyko vs. margin */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Sizing: stałe 1R i zgodność z marginesem</h2>
          <Card>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Ryzyko na transakcję (%, 1R)">
                <NumberInput value={riskPct} onChange={e => setRiskPct(parseFloat(e.target.value || '0'))} />
              </Field>
              <Field label="Stop-Loss (pips)">
                <NumberInput value={slPips} onChange={e => setSlPips(parseFloat(e.target.value || '0'))} />
              </Field>
              <Field label="Wartość 1 pips dla 1.00 lota (np. 10 USD)">
                <NumberInput value={pipValuePerLot} onChange={e => setPipValuePerLot(parseFloat(e.target.value || '0'))} />
              </Field>
              <Field label="(Podgląd) Aktualne loty">
                <NumberInput value={lots} onChange={e => setLots(parseFloat(e.target.value || '0'))} />
              </Field>
            </div>

            <hr className="my-5 border-white/10" />

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>1R (kwotowo):</div>
                <div className="text-lg font-semibold">{(balance * (riskPct / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="mt-2">Ryzyko z bieżących lotów (SL):</div>
                <div className={`text-lg font-semibold ${riskFromSL > balance * (riskPct / 100) ? "text-rose-300" : "text-emerald-300"}`}>
                  {riskFromSL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Wartość 1 pips (dla {lots.toFixed(2)} lot):</div>
                <div className="text-lg font-semibold">{pipValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="mt-2">Loty „z ryzyka” (≈):</div>
                <div className="text-lg font-semibold">{lotsByRisk.toLocaleString(undefined, { maximumFractionDigits: 2 })} lot</div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Limit lotów „z marginesu” (≈):</div>
                <div className="text-lg font-semibold">{maxLotsByMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })} lot</div>
                <div className="mt-2 text-xs text-white/60">
                  Ostatecznie wybierz <strong>mniejszą</strong> z wartości: „z ryzyka” vs „z marginesu”.
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Co-jeśli: suwak dźwigni */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Co-jeśli zmienię dźwignię?</h2>
          <Card>
            <div className="grid sm:grid-cols-5 gap-4 items-center">
              <div className="sm:col-span-4">
                <RangeInput
                  min={1}
                  max={100}
                  step={1}
                  value={whatIfLev}
                  onChange={(e) => setWhatIfLev(parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="text-right text-sm">
                1:<span className="text-lg font-semibold">{whatIfLev}</span>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Margin przy {lots.toFixed(2)} lot i 1:{whatIfLev}:</div>
                <div className={`text-lg font-semibold ${whatIfMargin > balance ? "text-rose-300" : ""}`}>
                  {whatIfMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div>Wolny margin po otwarciu:</div>
                <div className={`text-lg font-semibold ${whatIfFree < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                  {whatIfFree.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Niższa dźwignia = większy wymagany margin. To nie zwiększa ryzyka 1R — ale może ograniczyć liczbę lotów możliwych do otwarcia.
            </div>
          </Card>
        </section>

        {/* Dobre praktyki + checklist */}
        <section className="prose prose-invert prose-slate max-w-none mt-10">
          <h2>Dobre praktyki</h2>
          <ul>
            <li>Najpierw określ <strong>1R</strong> (np. 1% konta), potem policz loty z uwzględnieniem <strong>SL</strong> i wartości pipsa.</li>
            <li>Sprawdź, czy przy tych lotach masz wystarczający <strong>margin</strong>. Jeśli nie — zmniejsz loty.</li>
            <li>Nie „ścigaj” dźwigni. Wyższa dźwignia jest tylko narzędziem zmniejszającym margin, nie powodem do zwiększania ryzyka.</li>
          </ul>

          <h3>Checklist po lekcji</h3>
          <ul>
            <li>Potrafię policzyć ekspozycję, margin i wolny margin po otwarciu.</li>
            <li>Umiem dobrać loty tak, by 1R był stały i jednocześnie mieścił się w ograniczeniach marginu.</li>
            <li>Rozumiem, że dźwignia ≠ ryzyko — ryzykiem zarządza <em>wielkość pozycji</em> i <em>odległość SL</em>.</li>
          </ul>
        </section>

        {/* Nawigacja */}
        <footer className="mt-10 flex items-center justify-between">
          <Link href="/kursy/podstawy/lekcja-3" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            ← Poprzednia
          </Link>
          <Link href="/kursy/podstawy/lekcja-5" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">
            Następna →
          </Link>
        </footer>
      </article>
    </main>
  );
}
