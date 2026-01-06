'use client';
import React from 'react';

export default function EducationCards() {
  return (
    <section className="mt-6 space-y-6">
      {/* Dlaczego informacja = przewaga */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
        <h2 className="text-lg font-bold">Dlaczego informacja = przewaga (edukacyjnie)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">Cel informacji</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Szybko odróżniać „szum” od zdarzeń zmieniających wyceny.</li>
              <li>Krótka pętla: informacja → klasyfikacja → instrumenty → decyzja (edukacyjnie).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">Jak działa przewaga czasu</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Pierwsza fala (minuty–godziny), doprecyzowanie (1–7 dni), efekt II rzędu (tygodnie).</li>
              <li>Fakty + kierunek wpływu pomagają wychwycić to, co może być przecenione.</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold">60‑sekundowa checklista</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-white/80">
            <li>Co się stało? (fakt, źródło, „NOW/BREAKING”)</li>
            <li>Kategoria i kanał wpływu (Makro / Geo / Surowce / Spółki)</li>
            <li>Instrumenty narażone (watchlist) + kierunek pierwszej reakcji</li>
            <li>Horyzont reakcji i ryzyka (rewizje, kontr‑nagłówki)</li>
            <li>Decyzja: obserwacja/uczenie się/ćwiczenie na koncie demo (edukacyjnie)</li>
          </ol>
        </div>
      </div>

      {/* Przykłady: czas = przewaga */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
        <h2 className="text-lg font-bold">Przykłady „czas = przewaga”</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">COVID‑19 (luty–marzec 2020)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Lockdowny, paniczna awersja do ryzyka.</li>
              <li>Indeksy −20/−35%, skok VIX, rentowności w dół.</li>
              <li>Edukacyjnie: rozpoznać szok popytowy → obserwować indeksy, VIX, obligacje; potem reakcję na QE/fiskalny impuls.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">Inwazja Rosji na Ukrainę (24.02.2022)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Ryzyko podaży energii/zbóż, sankcje.</li>
              <li>Ropa/gaz/pszenica w górę; EU indeksy w dół; CEE FX w pierwszej fazie słabsze.</li>
              <li>Edukacyjnie: kanały energii/żywności/regionu → obserwacja surowców, ETF‑ów sektorowych, walut regionu.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold">Cła USA–Chiny (2018–2019)</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/80">
              <li>Rundy ceł, eskalacyjne nagłówki.</li>
              <li>Risk‑off w dniach ogłoszeń; USDCNH w górę; presja na eksporterów/półprzewodniki.</li>
              <li>Edukacyjnie: klasyfikacja Geo/Makro → obserwacja CNH i sektorów handlowych; okno reakcji godziny–dni.</li>
            </ul>
          </article>
        </div>
      </div>

      {/* Jak czytać strumień */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
        <h2 className="text-lg font-bold">Jak czytać strumień „NOW/BREAKING” (bez cen)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            <ul className="list-disc pl-5">
              <li>Impact 1–5: potencjalna skala ruchu.</li>
              <li>TimeEdge 0–10: świeżość przewagi informacyjnej.</li>
              <li>Sentiment: kierunek pierwszej reakcji (nie rekomendacja).</li>
              <li>„Najbardziej dotknięte” — suma wpływu newsów na instrumenty w oknie.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
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


