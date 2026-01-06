'use client';

import { useEffect, useId, useMemo, useState } from 'react';

export type IntakeState = {
  instrument: 'US100' | 'XAUUSD' | 'EURUSD' | 'UST10Y' | 'DXY';
  horizon: 'M5' | 'M15' | 'H1' | 'H4' | 'D1';
  direction: 'Wzrost' | 'Spadek' | 'Niepewne';
  when?: string; // ISO string or datetime-local string
  whatHappened: string;
};

export default function CoachIntake({
  value,
  onChange,
  onComposeQuestion,
}: {
  value: IntakeState;
  onChange: (next: IntakeState) => void;
  onComposeQuestion: (prompt: string) => void;
}) {
  const formId = useId();
  const [local, setLocal] = useState<IntakeState>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    onChange(local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.instrument, local.horizon, local.direction, local.when, local.whatHappened]);

  const question = useMemo(() => buildPrompt(local), [local]);

  return (
    <div
      aria-label="Intake formularz — opisz sytuację"
      className="rounded-xl border border-white/10 bg-slate-900/40 p-3"
    >
      <div className="text-xs font-medium text-white/80">Intake / Opisz sytuację</div>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select
          id={`${formId}-instrument`}
          label="Instrument"
          value={local.instrument}
          onChange={(v) => setLocal((s) => ({ ...s, instrument: v as IntakeState['instrument'] }))}
          options={['US100', 'XAUUSD', 'EURUSD', 'UST10Y', 'DXY']}
        />
        <Select
          id={`${formId}-horizon`}
          label="Horyzont"
          value={local.horizon}
          onChange={(v) => setLocal((s) => ({ ...s, horizon: v as IntakeState['horizon'] }))}
          options={['M5', 'M15', 'H1', 'H4', 'D1']}
        />
        <Select
          id={`${formId}-direction`}
          label="Kierunek"
          value={local.direction}
          onChange={(v) => setLocal((s) => ({ ...s, direction: v as IntakeState['direction'] }))}
          options={['Wzrost', 'Spadek', 'Niepewne']}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={`${formId}-when`} className="text-[11px] text-white/60">
            Kiedy
          </label>
          <input
            id={`${formId}-when`}
            aria-label="Kiedy"
            type="datetime-local"
            value={local.when ?? ''}
            onChange={(e) => setLocal((s) => ({ ...s, when: e.target.value }))}
            className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>
      <div className="mt-2">
        <label htmlFor={`${formId}-what`} className="sr-only">
          Co się stało?
        </label>
        <textarea
          id={`${formId}-what`}
          value={local.whatHappened}
          onChange={(e) => setLocal((s) => ({ ...s, whatHappened: e.target.value }))}
          placeholder="Co się stało?"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-[11px] text-white/50">
          EDU: bez rekomendacji i bez sygnałów — tylko proces i interpretacja.
        </div>
        <button
          type="button"
          onClick={() => onComposeQuestion(question)}
          className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 text-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Ułóż pytanie
        </button>
      </div>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-white/60">
        {label}
      </label>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildPrompt(s: IntakeState): string {
  const intro = `EDU: ${s.instrument} ${s.horizon} — kierunek: ${s.direction}${s.when ? `, kiedy: ${s.when}` : ''}.`;
  const body = s.whatHappened?.trim()
    ? `Kontekst: ${s.whatHappened.trim()}`
    : 'Kontekst: brak dodatkowych szczegółów.';
  const task =
    'Zadanie: wyjaśnij co mogło mieć wpływ na ten ruch (mechanizmy, alternatywy), ' +
    'wskaż warunki negacji/invalidation oraz typowe pułapki interpretacyjne. Bez rekomendacji i bez sygnałów.';
  return `${intro}\n${body}\n${task}\nUwaga: odpowiedź wyłącznie EDU (bez rekomendacji i bez sygnałów).`;
}


