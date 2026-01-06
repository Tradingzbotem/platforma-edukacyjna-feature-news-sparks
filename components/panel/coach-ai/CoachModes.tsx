'use client';

import { useMemo } from 'react';

export type ModeItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
};

export type EventTemplate = {
  id: string;
  title: string;
  prompt: string;
};

export default function CoachModes({
  onInsertPrompt,
}: {
  onInsertPrompt: (text: string) => void;
}) {
  const modes: ModeItem[] = useMemo(
    () => [
      {
        id: 'explain-move',
        title: 'Wyjaśnij ruch rynku',
        description:
          'Krótka, edukacyjna analiza: co było katalizatorem, jakie były alternatywy i ograniczenia.',
        prompt:
          'Wyjaśnij EDU: ostatni ruch rynku dla wybranego instrumentu. Podaj katalizatory, alternatywne interpretacje, ograniczenia oraz kiedy ta narracja traci sens. Bez rekomendacji i bez sygnałów.',
      },
      {
        id: 'prepare-event',
        title: 'Przygotowanie pod event',
        description:
          'Co sprawdzić przed publikacją: kontekst, ryzyka, typowe reakcje, kiedy uważać.',
        prompt:
          'Przygotuj EDU checklistę pod event (np. CPI/NFP/FOMC): kontekst, mechanizmy reakcji, typowe pułapki, kiedy scenariusz traci sens. Bez rekomendacji i bez sygnałów.',
      },
      {
        id: 'interpret-step',
        title: 'Interpretacja odczytu (krok po kroku)',
        description:
          'Jak czytać odchylenia vs konsensus i co zwykle działa po publikacji.',
        prompt:
          'Zrób EDU interpretację odczytu krok po kroku: odchylenie vs konsensus, komponenty (headline/core), możliwe ścieżki reakcji, warunki negacji. Bez rekomendacji i bez sygnałów.',
      },
      {
        id: 'scenarios-abc',
        title: 'Scenariusze A/B/C',
        description:
          'Warunki IF/THEN/ELSE, invalidation, potwierdzenia oraz ryzyka procesu.',
        prompt:
          'Zbuduj EDU scenariusz A/B/C: IF → warunki, THEN → oczekiwana interpretacja, ELSE/Invalidation → kiedy porzucić. Dodaj potencjalne potwierdzenia i ryzyka. Bez rekomendacji i bez sygnałów.',
      },
      {
        id: 'risk-vol',
        title: 'Ryzyko i zmienność',
        description:
          'Jak myśleć o ryzyku w zależności od zmienności i warunków rynkowych.',
        prompt:
          'Opisz EDU podejście do ryzyka a zmienność (np. ATR/VIX): filtry, kiedy wstrzymać się, jak unikać pułapek interpretacyjnych. Bez rekomendacji i bez sygnałów.',
      },
      {
        id: 'learning-plan',
        title: 'Plan nauki (co dalej)',
        description:
          'Propozycja kolejnych kroków z materiałami i ćwiczeniami (EDU).',
        prompt:
          'Ułóż EDU plan nauki: 3–5 kroków, krótkie materiały do przejrzenia i ćwiczenia. Bez rekomendacji i bez sygnałów.',
      },
    ],
    []
  );

  const eventTemplates: EventTemplate[] = useMemo(
    () => [
      { id: 'cpi', title: 'CPI', prompt: 'EDU: Przygotuj checklistę i scenariusze pod CPI (headline vs core) + typowe reakcje oraz kiedy rynek odwraca ruch. Bez rekomendacji i bez sygnałów.' },
      { id: 'corepce', title: 'Core PCE', prompt: 'EDU: Checklist pod Core PCE: interpretacja odchyleń, komponenty, scenariusze warunkowe i negacje. Bez rekomendacji i bez sygnałów.' },
      { id: 'nfp', title: 'NFP', prompt: 'EDU: Przygotowanie pod NFP: komponenty (płace, stopa), możliwe ścieżki reakcji i typowe pułapki. Bez rekomendacji i bez sygnałów.' },
      { id: 'fomc-decision', title: 'FOMC Decision', prompt: 'EDU: FOMC – decyzja: jak czytać komunikat, punkty odniesienia, scenariusze A/B oraz invalidation. Bez rekomendacji i bez sygnałów.' },
      { id: 'fomc-minutes', title: 'FOMC Minutes', prompt: 'EDU: Minutes – na co patrzeć (jaka zmiana tonu), co zwykle działa i kiedy uważać. Bez rekomendacji i bez sygnałów.' },
      { id: 'ism', title: 'ISM', prompt: 'EDU: ISM – komponenty (new orders, employment, prices), interpretacja i scenariusze warunkowe. Bez rekomendacji i bez sygnałów.' },
      { id: 'retail-sales', title: 'Retail Sales', prompt: 'EDU: Sprzedaż detaliczna – interpretacja vs konsensus, wpływ na sentyment i możliwe ścieżki. Bez rekomendacji i bez sygnałów.' },
      { id: 'gdp', title: 'GDP', prompt: 'EDU: PKB – komponenty, rewizje, jak wpływa na kontekst i scenariusze A/B/C. Bez rekomendacji i bez sygnałów.' },
    ],
    []
  );

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white/90">Tryby</h3>
        <p className="mt-1 text-xs text-white/60">
          Wybierz tryb – wstawimy gotowy prompt do pola wiadomości.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onInsertPrompt(m.prompt)}
              className="group text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 p-3"
              aria-label={`Wstaw prompt dla trybu: ${m.title}`}
            >
              <div className="text-sm font-medium text-white/90">{m.title}</div>
              <div className="mt-1 text-xs text-white/60">{m.description}</div>
              <div className="mt-2 text-[11px] text-white/45 hidden group-hover:block">
                Kliknij, aby wstawić prompt do inputa (nie wysyła od razu)
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/90">Event templates</h3>
        <p className="mt-1 text-xs text-white/60">
          Gotowe szkielety pytań dla kluczowych publikacji.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {eventTemplates.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onInsertPrompt(e.prompt)}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 px-3 py-2 text-xs text-white/80"
              aria-label={`Wstaw prompt dla wydarzenia: ${e.title}`}
            >
              {e.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


