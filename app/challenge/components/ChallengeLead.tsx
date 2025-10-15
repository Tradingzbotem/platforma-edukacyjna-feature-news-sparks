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
        <h1 className="text-balance text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          Challenge: Przewidywalność
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-pretty text-sm md:text-base leading-relaxed text-muted-foreground">
          Każdego dnia możesz sprawdzić swoją intuicję rynkową.
          Wybierz instrument, przejrzyj skrót z modułu <span className="font-semibold text-white/90">News</span>,
          oceń kierunek (<span className="font-semibold text-green-400">↑</span> /
          <span className="font-semibold text-red-400"> ↓</span> /
          <span className="font-semibold text-yellow-400"> ↔</span>) i horyzont,
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
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 text-center shadow-sm transition hover:border-blue-400/30 hover:shadow-blue-500/10"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-white">{`Krok ${step}: ${title}`}</p>
              <p className="text-muted-foreground text-sm mt-1">{desc}</p>
            </li>
          ))}
        </ol>

        {show6hRule && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Po rozstrzygnięciu rundy slot wyzwania otrzyma nową edycję w ciągu
            {' '}<strong>30 sekund</strong> (ta sama klasa aktywa lub rotacja z puli).
          </p>
        )}
      </div>

      {/* ───────────── Sekcja "Na jakiej podstawie" ───────────── */}
      <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-inner">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-white/80">
          Na jakiej podstawie prognozujesz wzrost lub spadek?
        </h2>
        <ul className="mx-auto grid max-w-4xl gap-2 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
          <li>
            <span className="font-medium text-white">• Skrót z modułu News:</span> ostatnie nagłówki i tematy (makro, geopolityka, guidance spółek)
          </li>
          <li>
            <span className="font-medium text-white">• Kontekst makro:</span> CPI/PPI, NFP, decyzje banków centralnych, rentowności
          </li>
          <li>
            <span className="font-medium text-white">• Sygnały rynkowe:</span> zmiana 24h / 5D, mini-sparkline, wolumen (jeśli dostępny)
          </li>
          <li>
            <span className="font-medium text-white">• Czynniki specyficzne:</span> sezonowość (NG), interwencje (USDJPY), newsy spółek (TSLA, NVDA)
          </li>
        </ul>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-5 text-muted-foreground">
          🔹 To moduł edukacyjny – <strong>nie stanowi porady inwestycyjnej</strong>.
        </p>
      </div>
    </section>
  );
}
