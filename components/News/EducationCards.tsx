'use client';
import React from 'react';
import ReactionDiagram from './ReactionDiagram';

export default function EducationCards() {
  return (
    <section className="mt-6 space-y-6">
      {/* Dlaczego informacja = przewaga */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
        <h2 className="text-lg font-bold">Dlaczego informacja = przewaga (edukacyjnie)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
            <div className="text-sm font-semibold">Cel informacji</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Szybko odróżniać „szum” od zdarzeń zmieniających wyceny.</li>
              <li>Krótka pętla: informacja → klasyfikacja → instrumenty → decyzja (edukacyjnie).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
            <div className="text-sm font-semibold">Jak działa przewaga czasu</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Pierwsza fala (minuty–godziny), doprecyzowanie (1–7 dni), efekt II rzędu (tygodnie).</li>
              <li>Fakty + kierunek wpływu pomagają wychwycić to, co może być przecenione.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Przykłady: czas = przewaga */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
        <h2 className="text-lg font-bold mb-6">Przykłady „czas = przewaga”</h2>
        <div className="mt-3 grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
            <div className="text-sm font-semibold">COVID‑19 (luty–marzec 2020)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Lockdowny, paniczna awersja do ryzyka.</li>
              <li>Indeksy −20/−35%, skok VIX, rentowności w dół.</li>
              <li>Edukacyjnie: rozpoznać szok popytowy → obserwować indeksy, VIX, obligacje; potem reakcję na QE/fiskalny impuls.</li>
            </ul>
            <ReactionDiagram
              title="Reakcja indeksów (SP500)"
              data={[
                { day: 0, value: 0, label: 'Początek' },
                { day: 1, value: -5, label: 'Dzień 1' },
                { day: 2, value: -12, label: 'Dzień 2' },
                { day: 3, value: -20, label: 'Dzień 3' },
                { day: 4, value: -28, label: 'Dzień 4' },
                { day: 5, value: -35, label: 'Dzień 5' },
                { day: 6, value: -30, label: 'Dzień 6' },
                { day: 7, value: -25, label: 'Dzień 7' },
                { day: 10, value: -18, label: 'Dzień 10' },
                { day: 14, value: -10, label: 'Dzień 14' },
              ]}
              color="#ef4444"
            />
          </article>
          <article className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
            <div className="text-sm font-semibold">Inwazja Rosji na Ukrainę (24.02.2022)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Ryzyko podaży energii/zbóż, sankcje.</li>
              <li>Ropa/gaz/pszenica w górę; EU indeksy w dół; CEE FX w pierwszej fazie słabsze.</li>
              <li>Edukacyjnie: kanały energii/żywności/regionu → obserwacja surowców, ETF‑ów sektorowych, walut regionu.</li>
            </ul>
            <ReactionDiagram
              title="Reakcja ropy (Brent)"
              data={[
                { day: 0, value: 0, label: 'Początek' },
                { day: 1, value: 8, label: 'Dzień 1' },
                { day: 2, value: 15, label: 'Dzień 2' },
                { day: 3, value: 22, label: 'Dzień 3' },
                { day: 4, value: 28, label: 'Dzień 4' },
                { day: 5, value: 32, label: 'Dzień 5' },
                { day: 6, value: 30, label: 'Dzień 6' },
                { day: 7, value: 25, label: 'Dzień 7' },
                { day: 10, value: 18, label: 'Dzień 10' },
                { day: 14, value: 12, label: 'Dzień 14' },
              ]}
              color="#f59e0b"
            />
          </article>
          <article className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
            <div className="text-sm font-semibold">Cła USA–Chiny (2024)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Cła nałożone przez Trumpa na chińskie towary, eskalacyjne nagłówki.</li>
              <li>Risk‑off w dniach ogłoszeń; US500/US100 w dół; presja na eksporterów/półprzewodniki.</li>
              <li>Edukacyjnie: klasyfikacja Geo/Makro → obserwacja indeksów amerykańskich i sektorów handlowych; okno reakcji godziny–dni.</li>
            </ul>
            <ReactionDiagram
              title="Reakcja US500"
              data={[
                { day: 0, value: 0, label: 'Początek' },
                { day: 1, value: -2.5, label: 'Dzień 1' },
                { day: 2, value: -4.2, label: 'Dzień 2' },
                { day: 3, value: -3.1, label: 'Dzień 3' },
                { day: 4, value: -5.5, label: 'Dzień 4' },
                { day: 5, value: -6.8, label: 'Dzień 5' },
                { day: 6, value: -5.2, label: 'Dzień 6' },
                { day: 7, value: -4.0, label: 'Dzień 7' },
                { day: 10, value: -2.8, label: 'Dzień 10' },
                { day: 14, value: -1.5, label: 'Dzień 14' },
              ]}
              color="#3b82f6"
            />
          </article>
        </div>
      </div>

      {/* Jak czytać strumień */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5">
        <h2 className="text-lg font-bold">Jak czytać strumień „NOW/BREAKING” (bez cen)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4 text-sm text-white/80">
            <ul className="list-disc pl-5">
              <li>Impact 1–5: potencjalna skala ruchu.</li>
              <li>TimeEdge 0–10: świeżość przewagi informacyjnej.</li>
              <li>Sentiment: kierunek pierwszej reakcji (nie rekomendacja).</li>
              <li>„Najbardziej dotknięte” — suma wpływu newsów na instrumenty w oknie.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4 text-sm text-white/80">
            <div className="text-sm font-semibold">Dobre praktyki (edukacyjnie)</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Weryfikuj źródła; przy niepewności czekaj na drugi nagłówek.</li>
              <li>Najpierw mechanizm/horyzont, potem cena.</li>
              <li>Pamiętaj o zmienności i możliwych odwróceniach.</li>
              <li>Prowadź dziennik — skraca czas przyszłych decyzji.</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-white/50">
          Materiał edukacyjny. Informacje nie stanowią rekomendacji inwestycyjnych ani porady.
        </p>
      </div>
    </section>
  );
}


