'use client';

import Link from 'next/link';

export default function SummaryCoachAI() {
  const modes = [
    {
      title: 'Wyjaśnij ruch rynku',
      description: 'Krótka, edukacyjna analiza: co było katalizatorem, jakie były alternatywy i ograniczenia.',
    },
    {
      title: 'Przygotowanie pod event',
      description: 'Co sprawdzić przed publikacją: kontekst, ryzyka, typowe reakcje, kiedy uważać.',
    },
    {
      title: 'Scenariusze A/B/C',
      description: 'Warunki IF/THEN/ELSE, invalidation, potwierdzenia oraz ryzyka procesu.',
    },
    {
      title: 'Interpretacja odczytu',
      description: 'Jak czytać odchylenia vs konsensus i co zwykle działa po publikacji.',
    },
  ];

  const eventTemplates = [
    { name: 'CPI', description: 'Headline vs core, typowe reakcje' },
    { name: 'NFP', description: 'Komponenty, możliwe ścieżki reakcji' },
    { name: 'FOMC', description: 'Decyzja i komunikaty, scenariusze' },
    { name: 'Core PCE', description: 'Preferowana przez Fed miara inflacji' },
  ];

  const quickQuestions = [
    'Podsumuj kontekst w 5 punktach',
    'Podaj 3 ryzyka dla bieżącej narracji',
    'Zdefiniuj invalidation dla scenariusza',
    'Zrób checklistę przed publikacją danych',
  ];

  const features = [
    {
      title: 'Kontekst z modułów',
      description: 'Integracja z Kalendarzem, Scenariuszami, Mapami technicznymi i Playbookami',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      title: 'Checklisty procesu',
      description: 'Śledzenie postępu: kontekst, katalizatory, zmienność, invalidation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Słownik pojęć',
      description: 'Definicje terminów: ATR, Invalidation, Core, Risk-on/off, Divergencja',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Notatki i debrief',
      description: 'Zapisywanie wniosków i krótki debrief po publikacji danych',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Główna karta */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Coach AI (EDU) — Premium
              </h3>
              <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                ELITE
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-2">
              Wsparcie w analizie i procesie — pytania/odpowiedzi, bez sygnałów. Scenariusze warunkowe, checklisty,
              interpretacja danych.
            </p>
            <p className="text-xs text-white/60">
              Moduł premium — dostajesz prowadzenie krok po kroku: przygotowanie → publikacja → weryfikacja → debrief.
            </p>
          </div>
        </div>

        {/* Główne funkcje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {features.map((feature, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-slate-950/50 p-3 flex items-start gap-3">
              <div className="flex-shrink-0 text-white/70 mt-0.5">{feature.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white/90 mb-1">{feature.title}</div>
                <div className="text-xs text-white/70">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tryby pracy */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white mb-3">Tryby pracy</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {modes.map((mode, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <div className="text-xs font-semibold text-white mb-1">{mode.title}</div>
              <div className="text-xs text-white/70">{mode.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Event templates */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white mb-3">Gotowe szablony eventów</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {eventTemplates.map((event, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-slate-950/40 p-2.5 text-center">
              <div className="text-xs font-semibold text-white">{event.name}</div>
              <div className="text-[10px] text-white/60 mt-0.5">{event.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Szybkie pytania */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white mb-3">Przykładowe pytania</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {quickQuestions.map((question, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-slate-950/40 p-2.5">
              <div className="text-xs text-white/80">• {question}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Powiązania i kontekst */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white mb-3">Powiązania i kontekst</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="text-xs font-semibold text-white/90 mb-1">DXY / UST2Y / UST10Y</div>
            <div className="text-xs text-white/70">Kierunek USD i rentowności wyznacza kontekst dla wszystkich aktywów</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="text-xs font-semibold text-white/90 mb-1">VIX / Breadth</div>
            <div className="text-xs text-white/70">Zmienność i szerokość rynku jako filtry ryzyka i jakości ruchu</div>
          </div>
        </div>
      </div>

      {/* Link do pełnego modułu */}
      <div className="pt-2">
        <Link
          href="/konto/panel-rynkowy/coach-ai"
          className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-5 py-2.5 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
        >
          Otwórz Coach AI →
        </Link>
      </div>
    </div>
  );
}
