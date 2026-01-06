'use client';

import { useEffect, useMemo, useState } from 'react';
import type { IntakeState } from './CoachIntake';
import type { ContextSource } from '@/lib/panel/coachContext';
import { isTierAtLeast, type Tier } from '@/lib/panel/access';
import CoachGlossary from './CoachGlossary';

type ChecklistItem = { id: string; label: string };

const BASE_CHECKLIST: ChecklistItem[] = [
  { id: 'context', label: 'Sprawdź kontekst (trend, zakres, sesja)' },
  { id: 'catalysts', label: 'Zidentyfikuj katalizatory i alternatywy' },
  { id: 'volatility', label: 'Oceń zmienność/ryzyko (np. ATR/VIX)' },
  { id: 'invalid', label: 'Ustal warunki invalidation scenariusza' },
  { id: 'conf', label: 'Wypisz możliwe potwierdzenia' },
  { id: 'event', label: 'Jeśli event – zapisz kluczowe komponenty' },
  { id: 'plan', label: 'Zapisz plan „co dalej” (EDU)' },
  { id: 'debrief', label: 'Po publikacji – krótki debrief' },
];

const RELATIONS: { key: string; title: string; blurb: string }[] = [
  { key: 'DXY', title: 'DXY', blurb: 'Silny USD bywa presją na ryzyka i surowce.' },
  { key: 'UST2Y', title: 'UST2Y', blurb: 'Krótszy koniec lepiej łapie zmiany oczekiwań stóp.' },
  { key: 'UST10Y', title: 'UST10Y', blurb: 'Długi koniec: wzrost rentowności to presja na wyceny.' },
  { key: 'VIX', title: 'VIX', blurb: 'Wysoki VIX = większe ryzyko pułapek i fałszywych ruchów.' },
  { key: 'breadth', title: 'Breadth', blurb: 'Szerokość rynku: potwierdza/kwestionuje siłę trendu.' },
];

const DICT: { term: string; def: string }[] = [
  { term: 'ATR', def: 'Średnia rzeczywista zmienność; proxy intensywności ruchu.' },
  { term: 'Invalidation', def: 'Warunek, który neguje bieżący scenariusz.' },
  { term: 'Core', def: 'Miara bez komponentów o dużej zmienności (np. żywność/energia).' },
  { term: 'Risk-on/off', def: 'Orientacyjny sentyment rynku do ryzyka.' },
  { term: 'Divergencja', def: 'Rozjazd między ceną a wskaźnikiem/szerokością rynku.' },
];

export default function CoachStickyPanel({
  intake,
  onQuickInsert,
  contextSource,
  onChangeContextSource,
  tier,
}: {
  intake: IntakeState;
  onQuickInsert: (text: string) => void;
  contextSource: ContextSource;
  onChangeContextSource: (next: ContextSource) => void;
  tier: Tier;
}) {
  const [dictOpen, setDictOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const storageKey = useMemo(() => {
    const whenKey = (intake.when ?? '').slice(0, 10);
    return `coach:cl:${intake.instrument}|${intake.horizon}|${intake.direction}|${whenKey}`.toLowerCase();
  }, [intake.instrument, intake.horizon, intake.direction, intake.when]);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      setChecked(parsed);
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, storageKey]);

  const progress = useMemo(() => {
    const total = BASE_CHECKLIST.length;
    const done = BASE_CHECKLIST.reduce((acc, it) => acc + (checked[it.id] ? 1 : 0), 0);
    return { done, total };
  }, [checked]);

  const quickQuestions = useMemo(
    () => [
      'EDU: Podsumuj kontekst w 5 punktach.',
      'EDU: Podaj 3 ryzyka dla bieżącej narracji.',
      'EDU: Zdefiniuj invalidation dla scenariusza bazowego.',
      'EDU: Jakie powiązania są kluczowe teraz (DXY/UST/VIX)?',
      'EDU: Zrób checklistę przed publikacją danych.',
      'EDU: Stwórz krótkie definicje pojęć użytych w analizie.',
    ],
    []
  );

  return (
    <aside className="space-y-4" aria-label="Kontekst i narzędzia">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90">Kontekst aktywny</div>
        <div className="mt-2 text-xs text-white/70">
          <div>Instrument: <span className="text-white/90">{intake.instrument}</span></div>
          <div>Horyzont: <span className="text-white/90">{intake.horizon}</span></div>
          <div>Kierunek: <span className="text-white/90">{intake.direction}</span></div>
          <div>Kiedy: <span className="text-white/90">{intake.when || '—'}</span></div>
        </div>
        <div className="mt-3">
          <label className="text-[11px] text-white/60">Kontekst modułów (dla odpowiedzi AI)</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
            value={contextSource}
            onChange={(e) => onChangeContextSource(e.target.value as ContextSource)}
            aria-label="Kontekst modułów"
          >
            <option value="none">Brak</option>
            <option value="calendar7d" disabled={!isTierAtLeast(tier, 'starter')}>
              {isTierAtLeast(tier, 'starter') ? 'Kalendarz 7 dni' : 'Kalendarz 7 dni (STARTER) 🔒'}
            </option>
            <option value="scenariosABC" disabled={!isTierAtLeast(tier, 'starter')}>
              {isTierAtLeast(tier, 'starter') ? 'Scenariusze A/B/C' : 'Scenariusze A/B/C (STARTER) 🔒'}
            </option>
            <option value="checklists" disabled={!isTierAtLeast(tier, 'starter')}>
              {isTierAtLeast(tier, 'starter') ? 'Checklisty' : 'Checklisty (STARTER) 🔒'}
            </option>
            <option value="eventPlaybooks" disabled={!isTierAtLeast(tier, 'pro')}>
              {isTierAtLeast(tier, 'pro') ? 'Playbooki eventowe' : 'Playbooki eventowe (PRO) 🔒'}
            </option>
            <option value="techMaps" disabled={!isTierAtLeast(tier, 'pro')}>
              {isTierAtLeast(tier, 'pro') ? 'Mapy techniczne' : 'Mapy techniczne (PRO) 🔒'}
            </option>
          </select>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/90">
            Checklisty <span className="text-xs text-white/60">({progress.done}/{progress.total})</span>
          </div>
          <button
            type="button"
            className="text-[11px] text-white/60 underline underline-offset-2"
            onClick={() =>
              setChecked(
                BASE_CHECKLIST.reduce<Record<string, boolean>>((acc, it) => {
                  acc[it.id] = false;
                  return acc;
                }, {})
              )
            }
            aria-label="Wyzeruj checklistę"
          >
            Wyzeruj
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {BASE_CHECKLIST.map((it) => (
            <label key={it.id} className="flex gap-2 items-start text-xs text-white/80">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-950/60"
                checked={!!checked[it.id]}
                onChange={(e) => setChecked((s) => ({ ...s, [it.id]: e.target.checked }))}
                aria-label={it.label}
              />
              <span>{it.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90">Powiązania (EDU)</div>
        <ul className="mt-2 space-y-1">
          {RELATIONS.map((r) => (
            <li key={r.key} className="text-xs text-white/70">
              <span className="text-white/90">{r.title}:</span> {r.blurb}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDictOpen((v) => !v)}
            className="text-left text-sm font-semibold text-white/90"
            aria-expanded={dictOpen}
            aria-controls="coach-dict"
          >
            Słownik pojęć
          </button>
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Otwórz słownik kafelkowy"
          >
            Otwórz
          </button>
        </div>
        {dictOpen && (
          <ul id="coach-dict" className="mt-2 space-y-1">
            {DICT.map((d) => (
              <li key={d.term} className="text-xs text-white/70">
                <span className="text-white/90">{d.term}:</span> {d.def}
              </li>
            ))}
          </ul>
        )}
        <CoachGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90">Szybkie pytania do Coach AI</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onQuickInsert(q)}
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {q.replace('EDU: ', '').slice(0, 36)}
              {q.length > 36 ? '…' : ''}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}


