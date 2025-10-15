'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function Page() {
  // ─────────────────────────────────────────────
  // Mini UI (lokalne, bez exportów)
  // ─────────────────────────────────────────────
  function Card({ children }: { children: React.ReactNode }) {
    return <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">{children}</div>;
  }
  function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} inputMode="decimal" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30" />;
  }
  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (<label className="block"><div className="mb-1 text-sm text-slate-300">{label}</div>{children}</label>);
  }
  function Metric({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-2xl border border-white/10 p-3">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-base font-semibold">{value}</div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Logika obliczeń (lokalna)
  // ─────────────────────────────────────────────
  type Inputs = { budgetEUR: number; cpmEUR: number; epcEUR: number; ctrPct: number; startISO: string; days: number; };
  type Snap = { progress: number; spent: number; impressions: number; clicks: number; revenue: number; profit: number; roiPct: number; projectedRevenue: number; projectedProfit: number; projectedRoiPct: number; };

  function compute(inp: Inputs, now = Date.now()): Snap {
    const start = new Date(inp.startISO).getTime();
    const end = start + inp.days * 24 * 60 * 60 * 1000;
    const progress = Math.max(0, Math.min(1, (now - start) / (end - start)));
    const spent = inp.budgetEUR * progress;

    const imprPerEUR = inp.cpmEUR > 0 ? 1000 / inp.cpmEUR : 0;
    const clicksPerEUR = imprPerEUR * (inp.ctrPct / 100);
    const revPerEUR = clicksPerEUR * inp.epcEUR;

    const impressions = spent * imprPerEUR;
    const clicks = spent * clicksPerEUR;
    const revenue = spent * revPerEUR;
    const profit = revenue - spent;
    const roiPct = spent > 0 ? (profit / spent) * 100 : 0;

    const projectedRevenue = inp.budgetEUR * revPerEUR;
    const projectedProfit = projectedRevenue - inp.budgetEUR;
    const projectedRoiPct = inp.budgetEUR > 0 ? (projectedProfit / inp.budgetEUR) * 100 : 0;

    return { progress, spent, impressions, clicks, revenue, profit, roiPct, projectedRevenue, projectedProfit, projectedRoiPct };
  }

  const eur = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'EUR' }).format(n);
  const pct = (n: number) => `${n.toFixed(2)}%`;
  const int = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

  // ─────────────────────────────────────────────
  // Stan i odświeżanie co 10 min
  // ─────────────────────────────────────────────
  const [budgetEUR, setBudgetEUR] = useState(1000);
  const [cpmEUR, setCpmEUR] = useState(8.66);
  const [epcEUR, setEpcEUR] = useState(0.48);
  const [ctrPct, setCtrPct] = useState(2.04);
  const [days, setDays] = useState(30);
  const [startISO, setStartISO] = useState(() => new Date().toISOString());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10 * 60 * 1000); // co 10 min
    return () => clearInterval(id);
  }, []);

  const s = useMemo(
    () => compute({ budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days }, now),
    [budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days, now]
  );

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">
          <span aria-hidden>←</span> Strona główna
        </Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Symulator kampanii (CPM / CTR / EPC)</h1>
      <p className="mt-2 text-slate-300">Projekcja przychodu i ROI, liniowe wydatkowanie budżetu, odświeżanie co 10 min.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Parametry kampanii</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Budżet (EUR)"><NumberInput type="number" value={budgetEUR} onChange={e => setBudgetEUR(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="CPM (EUR / 1000 wyświetleń)"><NumberInput type="number" step="0.01" value={cpmEUR} onChange={e => setCpmEUR(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="EPC (EUR / klik)"><NumberInput type="number" step="0.01" value={epcEUR} onChange={e => setEpcEUR(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="CTR (%)"><NumberInput type="number" step="0.01" value={ctrPct} onChange={e => setCtrPct(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Czas trwania (dni)"><NumberInput type="number" value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} /></Field>
            <Field label="Start kampanii (ISO)"><NumberInput type="text" value={startISO} onChange={e => setStartISO(e.target.value)} /></Field>
          </div>
          <div className="mt-3 text-xs text-slate-400">Założenia: stały CTR i EPC, liniowe tempo wydatków.</div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">Projekcja na koniec kampanii</h2>
          <ul className="text-sm space-y-2">
            <li><b>Przychód łącznie:</b> {eur(s.projectedRevenue)}</li>
            <li><b>Zysk łącznie:</b> {eur(s.projectedProfit)}</li>
            <li><b>ROI:</b> {pct(s.projectedRoiPct)}</li>
            <li><b>Kliknięcia łącznie:</b> {int(budgetEUR * (1000 / cpmEUR) * (ctrPct / 100))}</li>
            <li><b>Wyświetlenia łącznie:</b> {int(budgetEUR * (1000 / cpmEUR))}</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Postęp (live)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Metric label="Zużyty budżet" value={eur(s.spent)} />
          <Metric label="Przychód (so far)" value={eur(s.revenue)} />
          <Metric label="Zysk (so far)" value={eur(s.profit)} />
          <Metric label="ROI (so far)" value={pct(s.roiPct)} />
          <Metric label="Wyświetlenia" value={int(s.impressions)} />
          <Metric label="Kliknięcia" value={int(s.clicks)} />
          <Metric label="Postęp" value={pct(s.progress * 100)} />
          <Metric label="Autoodświeżanie" value="co 10 minut" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Formuły</h2>
        <div className="text-sm space-y-1">
          <p><b>Impressions:</b> (budget / CPM) × 1000</p>
          <p><b>Clicks:</b> impressions × (CTR ÷ 100)</p>
          <p><b>Revenue:</b> clicks × EPC</p>
          <p><b>Profit:</b> revenue − budget</p>
          <p><b>ROI%:</b> (profit ÷ budget) × 100</p>
          <p><b>Pacing:</b> spent(t) = totalBudget × (elapsedDays ÷ totalDays)</p>
        </div>
      </Card>
    </main>
  );
}
