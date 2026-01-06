'use client';

import React, { useEffect, useState } from 'react';
import { type UserPick } from '../hooks/usePickStore';

type LocalMap = Record<string, UserPick>;

export default function YourPicks() {
  const [picks, setPicks] = useState<LocalMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fxedu:challenge:picks:v1');
      setPicks(raw ? JSON.parse(raw) : {});
    } catch {
      setPicks({});
    }
  }, []);

  const keys = Object.keys(picks)
    .sort((a, b) => (picks[b]?.ts ?? 0) - (picks[a]?.ts ?? 0))
    .slice(0, 20);

  if (keys.length === 0)
    return (
      <p className="text-center text-xs text-slate-500 mt-6">
        Brak zapisanych typów na dzisiaj.
      </p>
    );

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-center font-semibold text-slate-900">Twoje typy (ostatnie 20)</h3>
      <ul className="divide-y divide-slate-200 text-sm leading-6">
        {keys.map((k) => {
          const p = picks[k];
          return (
            <li key={k} className="flex justify-between py-1">
              <span className="text-slate-900 truncate max-w-[70%]">{k}</span>
              <span className="text-slate-600">
                {dirLabel(p.dir)} ({p.confidence}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function dirLabel(d: 'up' | 'down' | 'flat') {
  if (d === 'up') return '↑ Wzrost';
  if (d === 'down') return '↓ Spadek';
  return '↔ Bez zmian';
}
