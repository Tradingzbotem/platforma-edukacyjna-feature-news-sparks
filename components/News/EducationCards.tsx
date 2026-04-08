'use client';
import React from 'react';
import ReactionDiagram from './ReactionDiagram';

function MicroBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/45 font-medium mb-1">{label}</div>
      <div className="text-sm text-white/80 leading-relaxed">{children}</div>
    </div>
  );
}

export default function EducationCards() {
  return (
    <section className="mt-8 space-y-8">
      {/* Dlaczego informacja = przewaga */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-950 p-6 md:p-8 shadow-[0_0_48px_-14px_rgba(16,185,129,0.22)] ring-1 ring-white/10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent"
          aria-hidden
        />
        <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300/95 mb-3">
          Edukacyjny fundament
        </span>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-1 max-w-3xl leading-snug">
          Dlaczego informacja = przewaga (edukacyjnie)
        </h2>
        <p className="text-sm text-white/55 max-w-2xl mb-6 leading-relaxed">
          Zanim przejdziesz do newsów — dwa krótkie filary, które porządkują sposób czytania strumienia.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/12 bg-slate-950/50 backdrop-blur-sm p-5 shadow-inner ring-1 ring-white/5">
            <div className="text-sm font-semibold text-white mb-1">Cel informacji</div>
            <ul className="mt-3 list-disc pl-5 text-sm text-white/80 leading-relaxed space-y-1.5 marker:text-emerald-400/80">
              <li>Szybko odróżniać „szum” od zdarzeń zmieniających wyceny.</li>
              <li>Krótka pętla: informacja → klasyfikacja → instrumenty → decyzja (edukacyjnie).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/12 bg-slate-950/50 backdrop-blur-sm p-5 shadow-inner ring-1 ring-white/5">
            <div className="text-sm font-semibold text-white mb-1">Jak działa przewaga czasu</div>
            <ul className="mt-3 list-disc pl-5 text-sm text-white/80 leading-relaxed space-y-1.5 marker:text-emerald-400/80">
              <li>Pierwsza fala (minuty–godziny), doprecyzowanie (1–7 dni), efekt II rzędu (tygodnie).</li>
              <li>Fakty + kierunek wpływu pomagają wychwycić to, co może być przecenione.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Przykłady: czas = przewaga */}
      <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/70 to-slate-950 ring-1 ring-white/10 p-6 md:p-8 shadow-[0_0_40px_-16px_rgba(245,158,11,0.12)]">
        <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-200/90 mb-3">
          Historia rynku
        </span>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-2">
          Przykłady „czas = przewaga”
        </h2>
        <p className="text-sm text-white/55 max-w-2xl mb-8 leading-relaxed">
          Krótkie case study — typowe mechanizmy i pierwsze fazy reakcji. Do szybkiego skanu, nie do pełnej analizy.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="flex flex-col rounded-xl border border-white/10 bg-slate-950/70 p-5 ring-1 ring-white/5 shadow-lg">
            <div className="mb-4 border-b border-white/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-amber-200/65 font-semibold">Archiwum</span>
              <h3 className="mt-1.5 text-lg font-semibold text-white leading-snug tracking-tight">COVID‑19</h3>
              <p className="mt-1 text-xs font-medium text-white/45">Luty–marzec 2020</p>
            </div>
            <div className="space-y-3.5 flex-1">
              <MicroBlock label="Mechanizm">Lockdowny, paniczna awersja do ryzyka.</MicroBlock>
              <MicroBlock label="Pierwsza reakcja">Indeksy −20/−35%, skok VIX, rentowności w dół.</MicroBlock>
              <MicroBlock label="Co było dalej">
                Edukacyjnie: rozpoznać szok popytowy → obserwować indeksy, VIX, obligacje; potem reakcję na QE/fiskalny impuls.
              </MicroBlock>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5">
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
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-white/10 bg-slate-950/70 p-5 ring-1 ring-white/5 shadow-lg">
            <div className="mb-4 border-b border-white/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-amber-200/65 font-semibold">Archiwum</span>
              <h3 className="mt-1.5 text-lg font-semibold text-white leading-snug tracking-tight">Inwazja Rosji na Ukrainę</h3>
              <p className="mt-1 text-xs font-medium text-white/45">24.02.2022</p>
            </div>
            <div className="space-y-3.5 flex-1">
              <MicroBlock label="Mechanizm">Ryzyko podaży energii/zbóż, sankcje.</MicroBlock>
              <MicroBlock label="Pierwsza reakcja">
                Ropa/gaz/pszenica w górę; EU indeksy w dół; CEE FX w pierwszej fazie słabsze.
              </MicroBlock>
              <MicroBlock label="Co było dalej">
                Edukacyjnie: kanały energii/żywności/regionu → obserwacja surowców, ETF‑ów sektorowych, walut regionu.
              </MicroBlock>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5">
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
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-white/10 bg-slate-950/70 p-5 ring-1 ring-white/5 shadow-lg">
            <div className="mb-4 border-b border-white/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-amber-200/65 font-semibold">Archiwum</span>
              <h3 className="mt-1.5 text-lg font-semibold text-white leading-snug tracking-tight">Cła USA–Chiny</h3>
              <p className="mt-1 text-xs font-medium text-white/45">2024</p>
            </div>
            <div className="space-y-3.5 flex-1">
              <MicroBlock label="Mechanizm">
                Cła nałożone przez Trumpa na chińskie towary, eskalacyjne nagłówki.
              </MicroBlock>
              <MicroBlock label="Pierwsza reakcja">
                Risk‑off w dniach ogłoszeń; US500/US100 w dół; presja na eksporterów/półprzewodniki.
              </MicroBlock>
              <MicroBlock label="Co było dalej">
                Edukacyjnie: klasyfikacja Geo/Makro → obserwacja indeksów amerykańskich i sektorów handlowych; okno reakcji godziny–dni.
              </MicroBlock>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5">
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
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
