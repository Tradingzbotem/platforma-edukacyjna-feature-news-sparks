'use client';

import React, { useEffect, useState } from 'react';

type Row = {
  user_id: string;
  ticker: string;
  direction: 'up' | 'down' | 'flat' | null;
  confidence: number | null;
  challenge_key: string | null;
  outcome: 'up' | 'down' | 'flat' | null;
  xp_awarded: number | null;
  created_at: string;
  settled_at: string | null;
};

export default function ChallengeResults({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/challenge/picks?userId=${encodeURIComponent(userId)}&limit=100`, {
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="text-sm text-muted-foreground">Ładowanie wyników…</p>;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Brak zakładów.</p>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-3 text-base font-semibold text-white">Wyniki Challenge</h3>
      {/* mini-podsumowanie */}
      {(() => {
        const settled = rows.filter((r) => r.xp_awarded !== null);
        const wins = settled.filter((r) => (r.xp_awarded ?? 0) > 0).length;
        const totalXP = settled.reduce((s, r) => s + (r.xp_awarded ?? 0), 0);
        const winRate = settled.length ? Math.round((wins / settled.length) * 100) : 0;
        return (
          <div className="mb-3 flex gap-4 text-sm text-white/80">
            <span>Rozliczone: <b>{settled.length}</b></span>
            <span>Skuteczność: <b>{winRate}%</b></span>
            <span>XP (zrealizowane): <b>{totalXP}</b></span>
          </div>
        );
      })()}
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="text-left text-white/70">
            <tr className="[&_th]:py-2 [&_th]:pr-4">
              <th>Data</th>
              <th>Instrument</th>
              <th>Twój typ</th>
              <th>Wynik</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-t [&_td]:border-white/10 [&_td]:py-2 [&_td]:pr-4">
            {rows.map((r, i) => {
              const status = r.xp_awarded == null ? (r.outcome ? 'rozliczanie' : 'w toku') : 'zakończone';
              return (
                <tr key={i}>
                  <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.ticker}</td>
                  <td>
                    {labelDir(r.direction)}{r.confidence ? ` (${r.confidence}%)` : ''}
                  </td>
                  <td>
                    <span className="mr-2">{labelOutcome(r.outcome)}</span>
                    <StatusBadge status={status} />
                  </td>
                  <td>{r.xp_awarded ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-white/60">Pokazujemy ostatnie 100 zakładów (z Neon).</p>
    </div>
  );
}

function labelDir(d: Row['direction']) {
  if (d === 'up') return '↑ Wzrost';
  if (d === 'down') return '↓ Spadek';
  if (d === 'flat') return '↔ Bez zmian';
  return '—';
}
function labelOutcome(o: Row['outcome']) {
  if (o === 'up') return '↑ Wzrost (trafiony?)';
  if (o === 'down') return '↓ Spadek (trafiony?)';
  if (o === 'flat') return '↔ Bez zmian';
  return 'w tok/u (rozliczanie/zakończone)';
}

function StatusBadge({ status }: { status: 'w toku' | 'rozliczanie' | 'zakończone' }) {
  const map = {
    'w toku': 'bg-zinc-500/20 text-zinc-300 border-zinc-400/30',
    'rozliczanie': 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    'zakończone': 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  } as const;
  const cls = map[status];
  return <span className={`rounded-md border px-1.5 py-0.5 text-[11px] ${cls}`}>{status}</span>;
}


