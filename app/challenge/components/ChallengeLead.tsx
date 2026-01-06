'use client';

import React from 'react';

type Props = {
  defaultHorizons?: string[];
  show6hRule?: boolean;
};

export default function ChallengeLead({
  defaultHorizons = ['EOD', '48h', '5 dni/5 sesji'],
  show6hRule = true,
}: Props) {
  return (
    <section className="mb-14">
      {/* ───────────── Nagłówek ───────────── */}
      <header className="mx-auto max-w-4xl text-center space-y-3">
        <h1 className="text-balance text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Challenge: Przewidywalność
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-pretty text-sm md:text-base leading-relaxed text-slate-600">
          Każdego dnia możesz sprawdzić swoją intuicję rynkową.
          Wybierz instrument, przejrzyj skrót z modułu <span className="font-semibold text-slate-900">News</span>,
          oceń kierunek (<span className="font-semibold text-emerald-600">↑</span> /
          <span className="font-semibold text-rose-600"> ↓</span> /
          <span className="font-semibold text-yellow-600"> ↔</span>) i horyzont,
          a po rozliczeniu zobacz, jak poradziła sobie Twoja analiza.
        </p>
      </header>

      {/* ───────────── Kafelki kroków ───────────── */}
      <div className="mx-auto mt-8 max-w-5xl">
        <ol className="grid gap-3 text-sm leading-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '1',
              title: 'Wybierz instrument',
              desc: `np. ${defaultHorizons.join(', ')}`,
              icon: '📊',
            },
            {
              step: '2',
              title: 'Zobacz skrót z News',
              desc: 'AI pokazuje kluczowe nagłówki i czynniki',
              icon: '🧠',
            },
            {
              step: '3',
              title: 'Wskaż kierunek + pewność',
              desc: '↑ / ↓ / ↔ oraz 50–90%',
              icon: '🎯',
            },
            {
              step: '4',
              title: 'Poczekaj na rozliczenie',
              desc: 'wynik liczony według realnej punktacji',
              icon: '⏱️',
            },
          ].map(({ step, title, desc, icon }) => (
            <li
              key={step}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-slate-900">{`Krok ${step}: ${title}`}</p>
              <p className="text-slate-600 text-sm mt-1">{desc}</p>
            </li>
          ))}
        </ol>

        {show6hRule && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Po rozstrzygnięciu rundy slot wyzwania otrzyma nową edycję w ciągu
            {' '}<strong>30 sekund</strong> (ta sama klasa aktywa lub rotacja z puli).
          </p>
        )}
      </div>

      {/* ───────────── Sekcja "Na jakiej podstawie" ───────────── */}
      <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-900">
          Na jakiej podstawie prognozujesz wzrost lub spadek?
        </h2>
        <ul className="mx-auto grid max-w-4xl gap-2 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
          <li>
            <span className="font-medium text-slate-900">• Skrót z modułu News:</span> ostatnie nagłówki i tematy (makro, geopolityka, guidance spółek)
          </li>
          <li>
            <span className="font-medium text-slate-900">• Kontekst makro:</span> CPI/PPI, NFP, decyzje banków centralnych, rentowności
          </li>
          <li>
            <span className="font-medium text-slate-900">• Sygnały rynkowe:</span> zmiana 24h / 5D, mini-sparkline, wolumen (jeśli dostępny)
          </li>
          <li>
            <span className="font-medium text-slate-900">• Czynniki specyficzne:</span> sezonowość (NG), interwencje (USDJPY), newsy spółek (TSLA, NVDA)
          </li>
        </ul>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-5 text-slate-500">
          🔹 To moduł edukacyjny – <strong>nie stanowi porady inwestycyjnej</strong>.
        </p>
      </div>
    </section>
  );
}
