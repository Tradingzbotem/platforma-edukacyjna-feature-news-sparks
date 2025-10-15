'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

/* ───────────────────────── Typy + obliczenia ───────────────────────── */

export type CampaignInputs = {
  budgetEUR: number;  // budżet całkowity
  cpmEUR: number;     // koszt 1000 wyśw.
  epcEUR: number;     // zarobek per klik
  ctrPct: number;     // CTR w %
  startISO: string;   // start kampanii (ISO)
  days: number;       // długość kampanii (dni)
};

export type CampaignSnapshot = {
  tms: number;
  progress: number;       // 0..1
  spent: number;          // wydane €
  impressions: number;
  clicks: number;
  revenue: number;        // przychód €
  profit: number;         // zysk €
  roiPct: number;         // ROI % dla dotychczas
  projectedRevenue: number;
  projectedProfit: number;
  projectedRoiPct: number;
};

export function computeSnapshot(inp: CampaignInputs, now = Date.now()): CampaignSnapshot {
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

  return {
    tms: now,
    progress,
    spent,
    impressions,
    clicks,
    revenue,
    profit,
    roiPct,
    projectedRevenue,
    projectedProfit,
    projectedRoiPct,
  };
}

/* ───────────────────────── Pomocnicze ───────────────────────── */

const eur = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'EUR' }).format(n);
const pct = (n: number) => `${n.toFixed(2)}%`;
const int = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n));

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-slate-300">{label}</div>
      {children}
    </label>
  );
}
function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      inputMode="decimal"
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
    />
  );
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
    />
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-base font-semibold text-white">{value}</div>
    </div>
  );
}

/* ───────────────────────── GŁÓWNY KOMPONENT ─────────────────────────
   UWAGA: to jest *default export* o nazwie AdRevenueSimulator
   ─────────────────────────────────────────────────────────────────── */
export default function AdRevenueSimulator() {
  const [budgetEUR, setBudgetEUR] = useState(1000);
  const [cpmEUR, setCpmEUR] = useState(8.66);
  const [epcEUR, setEpcEUR] = useState(0.48);
  const [ctrPct, setCtrPct] = useState(2.04);
  const [days, setDays] = useState(30);
  const [startISO, setStartISO] = useState(() => new Date().toISOString());

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const snap = useMemo(
    () => computeSnapshot({ budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days }, now),
    [budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days, now]
  );

  const chartData = useMemo(() => {
    const points = 11;
    const data: Array<{ name: string; revenue: number; spent: number }> = [];
    for (let i = 0; i < points; i++) {
      const frac = i / (points - 1);
      const at = new Date(new Date(startISO).getTime() + frac * days * 24 * 60 * 60 * 1000).getTime();
      const s = computeSnapshot({ budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days }, at);
      data.push({ name: `${Math.round(frac * 100)}%`, revenue: s.revenue, spent: s.spent });
    }
    return data;
  }, [budgetEUR, cpmEUR, epcEUR, ctrPct, startISO, days]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Parametry kampanii</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Budżet (EUR)">
              <NumberInput type="number" min={0} step={1} value={budgetEUR} onChange={e => setBudgetEUR(parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="CPM (EUR / 1000 wyświetleń)">
              <NumberInput type="number" min={0} step={0.01} value={cpmEUR} onChange={e => setCpmEUR(parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="EPC (EUR / klik)">
              <NumberInput type="number" min={0} step={0.01} value={epcEUR} onChange={e => setEpcEUR(parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="CTR (%)">
              <NumberInput type="number" min={0} step={0.01} value={ctrPct} onChange={e => setCtrPct(parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Czas trwania (dni)">
              <NumberInput type="number" min={1} step={1} value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} />
            </Field>
            <Field label="Start kampanii (ISO)">
              <TextInput type="text" value={startISO} onChange={e => setStartISO(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => setStartISO(new Date().toISOString())}>
                  Ustaw na TERAZ
                </button>
                <button className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/10 hover:bg-white/20" onClick={() => setNow(Date.now())}>
                  Odśwież teraz
                </button>
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">Projekcja na koniec kampanii</h2>
          <ul className="text-sm space-y-2">
            <li><b>Przychód łącznie:</b> {eur(snap.projectedRevenue)}</li>
            <li><b>Zysk łącznie:</b> {eur(snap.projectedProfit)}</li>
            <li><b>ROI:</b> {pct(snap.projectedRoiPct)}</li>
            <li><b>Kliknięcia łącznie:</b> {int(budgetEUR * (1000 / cpmEUR) * (ctrPct / 100))}</li>
            <li><b>Wyświetlenia łącznie:</b> {int(budgetEUR * (1000 / cpmEUR))}</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">Założenia: liniowe wydatkowanie budżetu; stały CTR i EPC.</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Postęp (live)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Metric label="Zużyty budżet" value={eur(snap.spent)} />
          <Metric label="Przychód (so far)" value={eur(snap.revenue)} />
          <Metric label="Zysk (so far)" value={eur(snap.profit)} />
          <Metric label="ROI (so far)" value={pct(snap.roiPct)} />
          <Metric label="Wyświetlenia" value={int(snap.impressions)} />
          <Metric label="Kliknięcia" value={int(snap.clicks)} />
          <Metric label="Postęp" value={pct(snap.progress * 100)} />
          <Metric label="Auto-odświeżanie" value="co 10 minut" />
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`)} />
              <Tooltip formatter={(v: number) => eur(v)} />
              <Line type="monotone" dataKey="spent" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* opcjonalnie, gdybyś chciał używać funkcji liczących gdzie indziej */
export { eur, pct, int };
