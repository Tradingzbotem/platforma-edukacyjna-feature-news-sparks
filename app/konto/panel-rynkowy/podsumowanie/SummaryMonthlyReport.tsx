'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { EduMonthlyReport } from '@/lib/panel/monthlyReports';

type Props = {
  reports: EduMonthlyReport[];
};

export default function SummaryMonthlyReport({ reports }: Props) {
  // Pobierz najnowszy raport (lub kilka najnowszych)
  const latestReports = useMemo(() => {
    return reports.slice(0, 1); // Pokaż tylko najnowszy w podsumowaniu
  }, [reports]);

  const latestReport = latestReports[0];

  // Oblicz reżim zmienności
  const avgAbsMove = useMemo(() => {
    const moves = latestReport?.movesForCalculator ?? [];
    if (!moves.length) return 0;
    return (
      moves.reduce((a, m) => a + Math.abs(m.movePct), 0) /
      moves.length
    );
  }, [latestReport]);
  const regime = avgAbsMove >= 2.0 ? 'wysoka' : avgAbsMove >= 1.0 ? 'średnia' : 'niska';

  if (!latestReport) {
    return (
      <div className="text-white/70 text-sm">
        <p>Brak dostępnych raportów miesięcznych.</p>
      </div>
    );
  }

  // Formatuj datę eventu
  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Najnowszy raport - główna karta */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="text-xs text-white/70 mb-1">Najnowszy raport</div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-2">
              {latestReport.title}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">{latestReport.tldr}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 flex-shrink-0">
            ELITE
          </span>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <div className="text-xs text-white/70">Główna narracja</div>
            <div className="mt-1 text-white/90 text-xs line-clamp-2">{latestReport.narrative}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <div className="text-xs text-white/70">Kluczowe eventy</div>
            <div className="mt-1 text-2xl font-extrabold text-white/90">{latestReport.keyEvents.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <div className="text-xs text-white/70">Reżim zmienności</div>
            <div className="mt-1 text-lg font-extrabold text-white/90 capitalize">{regime}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
            <div className="text-xs text-white/70">Scenariusze</div>
            <div className="mt-1 text-lg font-extrabold text-white/90">{latestReport.scenarios.length}</div>
          </div>
        </div>

        {/* Najważniejsze eventy */}
        {latestReport.keyEvents.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-white mb-2">Najważniejsze eventy miesiąca</div>
            <div className="space-y-2">
              {latestReport.keyEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-slate-950/40 p-3 flex items-start gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="text-xs text-white/70">{formatEventDate(event.date)}</div>
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold mt-1 ${
                        event.importance === 'high'
                          ? 'text-red-300 border border-red-400/30 bg-red-500/10'
                          : event.importance === 'medium'
                          ? 'text-amber-300 border border-amber-400/30 bg-amber-500/10'
                          : 'text-white/70 border border-white/20 bg-white/5'
                      }`}
                    >
                      {event.importance === 'high' ? 'Wysoka' : event.importance === 'medium' ? 'Średnia' : 'Niska'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{event.name}</div>
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{event.whatToWatch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenariusze - skrót */}
        {latestReport.scenarios.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-white mb-2">Scenariusze miesiąca</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {latestReport.scenarios.slice(0, 3).map((scenario, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <div className="text-xs font-semibold text-white mb-1">{scenario.name}</div>
                  <div className="text-xs text-white/70 line-clamp-2">
                    {scenario.conditions[0] || 'Brak warunków'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pułapki */}
        {latestReport.pitfalls.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
            <div className="text-xs font-semibold text-amber-200 mb-1">Pułapka miesiąca</div>
            <p className="text-xs text-amber-200/90">{latestReport.pitfalls[0]}</p>
          </div>
        )}

        {/* Link do pełnego raportu */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link
            href={`/konto/panel-rynkowy/raport-miesieczny/${latestReport.ym}`}
            className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
          >
            Otwórz pełny raport →
          </Link>
          {reports.length > 1 && (
            <Link
              href="/konto/panel-rynkowy/raport-miesieczny"
              className="ml-3 inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              Zobacz wszystkie raporty ({reports.length}) →
            </Link>
          )}
        </div>
      </div>

      {/* Dodatkowe informacje */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white/90 mb-1">Kluczowe tematy</p>
          <p className="text-xs text-white/60 line-clamp-2">
            {latestReport.whatHappened[0] || 'Najważniejsze wydarzenia miesiąca'}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white/90 mb-1">Wnioski rynkowe</p>
          <p className="text-xs text-white/60 line-clamp-2">
            {latestReport.whyItMoved[0] || 'Analiza zachowania rynku'}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white/90 mb-1">Scenariusze</p>
          <p className="text-xs text-white/60">
            {latestReport.scenarios.length} scenariuszy do sprawdzenia
          </p>
        </div>
      </div>
    </div>
  );
}
