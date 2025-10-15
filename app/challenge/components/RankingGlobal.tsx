'use client';
import React, { useEffect, useState } from 'react';

type RankRow = { user_id: string; total_xp: number; trades: number };

export default function RankingGlobal() {
  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/challenge/ranking')
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-sm text-muted-foreground mt-6">Ładowanie rankingu...</p>;

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-inner">
      <h3 className="mb-3 text-center font-semibold text-white">Ranking globalny (Top 10)</h3>
      {rows.length === 0 && <p className="text-center text-xs text-muted-foreground">Brak danych</p>}
      <ol className="text-sm leading-6">
        {rows.map((r, i) => (
          <li key={r.user_id} className="flex justify-between border-b border-white/5 py-1">
            <span>
              <span className="text-white/80 font-medium">{i + 1}.</span> {r.user_id}
            </span>
            <span className="text-white/70">{r.total_xp} XP <span className="opacity-60 text-xs">({r.trades} typów)</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
