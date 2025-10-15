'use client';

import React from 'react';

function getLS(): { submittedToday: boolean; last7: number[] } {
  try {
    const raw = localStorage.getItem('fxedu:challenge:v1');
    const parsed = raw ? JSON.parse(raw) : null;
    const today = new Date().toISOString().slice(0, 10);
    const submittedToday = parsed?.submittedDate === today;
    const last7 = Array.isArray(parsed?.last7) ? parsed.last7.slice(-7) : [];
    return { submittedToday, last7 };
  } catch {
    return { submittedToday: false, last7: [] };
  }
}

function remainLabel(): string {
  const now = new Date();
  const end = new Date();
  end.setUTCHours(23, 59, 0, 0);
  const diff = Math.max(0, end.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function ChallengeDemoBox() {
  const [state, setState] = React.useState(getLS());
  const [remain, setRemain] = React.useState(remainLabel());

  React.useEffect(() => {
    const id = setInterval(() => {
      setState(getLS());
      setRemain(remainLabel());
    }, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  function submit(val: -1 | 0 | 1) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem('fxedu:challenge:v1');
      const parsed = raw ? JSON.parse(raw) : {};
      const last7: number[] = Array.isArray(parsed?.last7) ? parsed.last7.slice(-6) : [];
      last7.push(val);
      const next = { submittedDate: today, last7, lastTs: Date.now() };
      localStorage.setItem('fxedu:challenge:v1', JSON.stringify(next));
      setState({ submittedToday: true, last7 });
    } catch {}
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">Okno do 23:59 Zulu • Pozostało: {remain}</div>
        <div className="text-sm">Status: {state.submittedToday ? 'Oddano' : 'Nie oddano'}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => submit(1)} className="px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90" aria-label="Oddaj typ w górę">
          Oddaj typ ↑
        </button>
        <button onClick={() => submit(-1)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Oddaj typ w dół">
          Oddaj typ ↓
        </button>
        <button onClick={() => submit(0)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Oddaj typ neutralny">
          Oddaj typ ↔
        </button>
      </div>
      <div className="mt-4 text-sm">
        <div className="text-white/60 mb-1">Wynik ostatnich 7 dni</div>
        <div className="flex gap-1" aria-label="Wyniki 7 dni" role="list">
          {Array.from({ length: 7 }).map((_, i) => {
            const v = state.last7[state.last7.length - 7 + i] ?? null;
            const color = v === 1 ? 'bg-emerald-500' : v === -1 ? 'bg-rose-500' : v === 0 ? 'bg-white/50' : 'bg-white/10';
            return <span key={i} className={`h-3 w-6 rounded ${color}`} role="listitem" aria-hidden />;
          })}
        </div>
      </div>
    </div>
  );
}


