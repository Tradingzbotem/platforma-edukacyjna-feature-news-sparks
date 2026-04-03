// components/ProSwitch.tsx
'use client';
import { useProPlan } from './useProPlan';

export default function ProSwitch() {
  const { pro, enable, disable } = useProPlan();

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{pro ? 'Pełny test (dev) aktywny' : 'Tryb DEMO'}</div>
          <div className="text-sm text-slate-300">
            {pro ? 'Symulacja pełnego dostępu do testów i certyfikatów.' : 'Ograniczenie: pierwsze 10 pytań.'}
          </div>
        </div>
        <button
          onClick={pro ? disable : enable}
          className={`rounded-lg px-4 py-2 font-semibold ${
            pro ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {pro ? 'Wyłącz pełny test' : 'Aktywuj pełny test (dev)'}
        </button>
      </div>
    </div>
  );
}
