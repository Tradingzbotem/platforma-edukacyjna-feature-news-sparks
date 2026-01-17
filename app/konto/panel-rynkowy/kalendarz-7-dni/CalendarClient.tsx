'use client';

import { useMemo, useState } from 'react';
import type { CalendarEvent } from '@/lib/panel/calendar7d';
import { inferImpact } from '@/lib/panel/calendarImpact';

type Props = {
  events: CalendarEvent[];
};

type ImpactKey = 'low' | 'medium' | 'high';
type GroupMode = 'type' | 'impact';
type AssetTab = 'oil' | 'fx' | 'gold' | 'indices' | 'rates' | 'general';

function ImportanceBadge({ importance }: { importance: ImpactKey }) {
  const styles =
    importance === 'high'
      ? 'text-red-300 border-red-400/30 bg-red-500/10'
      : importance === 'medium'
      ? 'text-amber-300 border-amber-400/30 bg-amber-500/10'
      : 'text-white/70 border-white/20 bg-white/5';
  const label = importance === 'high' ? 'wysoka' : importance === 'medium' ? 'średnia' : 'niska';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${styles}`}>
      Ważność: {label}
    </span>
  );
}

function categorizeEventType(title: string): { key: string; label: string; order: number } {
  const t = title.toLowerCase();
  const isOil = t.includes('crude') || t.includes('eia') || t.includes('api') || t.includes('zapasy') || t.includes('oil');
  const isCpi = t.includes('cpi') || t.includes('inflac') || t.includes('hicp');
  const isNfp = t.includes('nfp') || t.includes('non-farm');
  const isGdp = t.includes('gdp') || t.includes('pkb');
  if (isOil) return { key: 'oil', label: 'Ropa — zapasy (cotygodniowo)', order: 1 };
  if (isCpi) return { key: 'cpi', label: 'Inflacja (CPI/HICP)', order: 2 };
  if (isNfp) return { key: 'nfp', label: 'Rynek pracy (NFP)', order: 3 };
  if (isGdp) return { key: 'gdp', label: 'PKB', order: 4 };
  return { key: 'other', label: 'Pozostałe', order: 9 };
}

function categorizeImpact(ev: CalendarEvent): { key: string; label: string; order: number } {
  const info = inferImpact(ev);
  const chips = info.chips || [];
  // Proste mapowanie chipów → szerokie kategorie rynku
  const isFX = chips.some((c) => /USD|EUR|JPY|GBP|PLN|CAD|CHF|AUD|NZD/.test(c));
  const isIndex = chips.some((c) => ['US100', 'DAX', 'FTSE100'].includes(c));
  const isCommod = chips.some((c) => ['WTI', 'Brent', 'Złoto', 'Energy'].includes(c));
  const isRates = chips.some((c) => /(10Y)|Bund|UST/i.test(c));
  if (isFX) return { key: 'fx', label: 'FX (waluty)', order: 1 };
  if (isIndex) return { key: 'indices', label: 'Indeksy', order: 2 };
  if (isCommod) return { key: 'commodities', label: 'Surowce', order: 3 };
  if (isRates) return { key: 'rates', label: 'Obligacje / Stopy', order: 4 };
  return { key: 'other-impact', label: 'Inne', order: 9 };
}

function getAssetTags(ev: CalendarEvent): Set<AssetTab> {
  const tags = new Set<AssetTab>();
  const byType = categorizeEventType(ev.event);
  if (byType.key === 'oil') tags.add('oil');
  const info = inferImpact(ev);
  const chips = info.chips || [];
  const isFX = chips.some((c) => /USD|EUR|JPY|GBP|PLN|CAD|CHF|AUD|NZD/.test(c));
  const isIndex = chips.some((c) => ['US100', 'DAX', 'FTSE100'].includes(c));
  const isRates = chips.some((c) => /(10Y)|Bund|UST/i.test(c));
  const isGold = chips.some((c) => /Złoto|XAU|GOLD/i.test(c));
  if (isFX) tags.add('fx');
  if (isIndex) tags.add('indices');
  if (isRates) tags.add('rates');
  if (isGold) tags.add('gold');
  return tags;
}

export default function CalendarClient({ events }: Props) {
  const [impacts, setImpacts] = useState<Record<ImpactKey, boolean>>({
    high: true,
    medium: true,
    low: false,
  });
  const [groupMode, setGroupMode] = useState<GroupMode>('type');
  const [assetTab, setAssetTab] = useState<AssetTab>('oil');

  const filtered = useMemo(() => {
    const byImpact = events.filter((e) => impacts[e.importance]);
    return byImpact.filter((e) => {
      const tags = getAssetTags(e);
      if (assetTab === 'oil') return tags.has('oil');
      if (assetTab === 'fx') return tags.has('fx');
      if (assetTab === 'gold') return tags.has('gold');
      if (assetTab === 'indices') return tags.has('indices');
      if (assetTab === 'rates') return tags.has('rates');
      // general: brak konkretnych tagów
      return tags.size === 0;
    });
  }, [events, impacts, assetTab]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; order: number; items: CalendarEvent[] }>();
    for (const ev of filtered) {
      const cat = groupMode === 'impact' ? categorizeImpact(ev) : categorizeEventType(ev.event);
      if (!map.has(cat.key)) {
        map.set(cat.key, { label: cat.label, order: cat.order, items: [] });
      }
      map.get(cat.key)!.items.push(ev);
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [filtered, groupMode]);

  function toggleImpact(key: ImpactKey) {
    setImpacts((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {/* Asset tabs */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">Zakładki: aktywo</div>
        <div className="mt-2 inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setAssetTab('oil')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'oil' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            Ropa
          </button>
          <button
            type="button"
            onClick={() => setAssetTab('fx')}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'fx' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            FX
          </button>
          <button
            type="button"
            onClick={() => setAssetTab('gold')}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'gold' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            Złoto
          </button>
          <button
            type="button"
            onClick={() => setAssetTab('indices')}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'indices' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            Indeksy
          </button>
          <button
            type="button"
            onClick={() => setAssetTab('rates')}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'rates' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            Obligacje / Stopy
          </button>
          <button
            type="button"
            onClick={() => setAssetTab('general')}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${assetTab === 'general' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
          >
            Ogólne
          </button>
        </div>
        <div className="mt-2 text-xs text-white/60">
          Wybierz zakładkę, aby zobaczyć wydarzenia istotne dla: ropy (EIA, zapasy), FX (CPI, NFP...), złota (CPI/PCE, ton Fed),
          indeksów (PMI/ISM, CPI/NFP), obligacji/stóp (CPI/PCE, PKB, komunikacja banków centralnych) lub ogólne (pozostałe).
        </div>
      </div>

      {/* Filters + Grouping */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Filtr: ważność wydarzeń</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleImpact('high')}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] ${
                impacts.high ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-white/15 bg-white/5 text-white/60'
              }`}
            >
              wysoka
            </button>
            <button
              type="button"
              onClick={() => toggleImpact('medium')}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] ${
                impacts.medium ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-white/15 bg-white/5 text-white/60'
              }`}
            >
              średnia
            </button>
            <button
              type="button"
              onClick={() => toggleImpact('low')}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] ${
                impacts.low ? 'border-white/20 bg-white/10 text-white/80' : 'border-white/15 bg-white/5 text-white/60'
              }`}
            >
              niska
            </button>
          </div>
          <div className="mt-2 text-xs text-white/60">
            Zakres: 30 dni. Zaznacz ważność, aby zawęzić listę wydarzeń.
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Grupuj według</div>
          <div className="mt-2 inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setGroupMode('type')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md ${groupMode === 'type' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
            >
              Typ wydarzenia
            </button>
            <button
              type="button"
              onClick={() => setGroupMode('impact')}
              className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${groupMode === 'impact' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
            >
              Wpływ (rynek)
            </button>
          </div>
          <div className="mt-2 text-xs text-white/60">
            Wybierz, czy chcesz grupować po rodzaju publikacji (np. CPI, NFP) czy po rynku, na który typowo wpływa (FX, indeksy, surowce, obligacje).
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="mt-6 space-y-6">
        {/* Info box / suggestion for selected asset */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          {assetTab === 'oil' && (
            <p>Ropa: najczęściej reaguje na cotygodniowe zapasy (EIA), decyzje OPEC/OPEC+, oraz sygnały popytowe z PMI/ISM i PKB.</p>
          )}
          {assetTab === 'fx' && (
            <p>FX: kluczowe są dane inflacyjne (CPI/PCE), rynek pracy (NFP), oraz ścieżka stóp (komunikacja banków centralnych).</p>
          )}
          {assetTab === 'gold' && (
            <p>Złoto: wrażliwe na inflację (CPI/PCE), realne stopy (rentowności vs inflacja) i ton banków centralnych (Fed, EBC).</p>
          )}
          {assetTab === 'indices' && (
            <p>Indeksy: reagują na CPI/NFP/PMI/ISM i wyniki PKB; liczy się kierunek oczekiwań co do stóp i wzrostu.</p>
          )}
          {assetTab === 'rates' && (
            <p>Obligacje/Stopy: dane inflacyjne (CPI/PCE), PKB i guidance banków centralnych kształtują rentowności.</p>
          )}
          {assetTab === 'general' && (
            <p>Ogólne: przegląd istotnych publikacji makro bez przypisania do konkretnego aktywa.</p>
          )}
        </div>
        {grouped.map((group) => (
          <section key={group.label}>
            <h2 className="text-base font-semibold text-white/90">{group.label}</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {group.items.map((ev, idx) => (
                <article key={`${ev.date}-${ev.time}-${idx}`} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/70">
                      <div className="font-semibold text-white/80">
                        {ev.date} · {ev.time}
                      </div>
                      <div className="mt-0.5">{ev.region}</div>
                    </div>
                    <ImportanceBadge importance={ev.importance} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{ev.event}</h3>
                  <div className="mt-2 text-sm text-white/80">
                    <div className="font-semibold">Dlaczego to ważne</div>
                    <p className="mt-1">{ev.why}</p>
                  </div>
                  <div className="mt-2 text-sm text-white/80">
                    <div className="font-semibold">Jak rynek często reaguje</div>
                    <p className="mt-1">{ev.how}</p>
                  </div>
                  {(() => {
                    const info = inferImpact(ev);
                    return (
                      <>
                        <div className="mt-3 text-sm text-white/80">
                          <div className="text-sm font-semibold">Na co zwykle wpływa</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {info.chips.length > 0 ? (
                              info.chips.map((c, i) => (
                                <span
                                  key={`${c}-${i}`}
                                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] text-white/80"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-white/50 text-[12px]">—</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-white/70">
                          <div className="text-sm font-semibold text-white/80">Przykładowa reakcja (edukacyjnie)</div>
                          <div className="mt-1 space-y-1 leading-relaxed">
                            {info.reactionLines.length > 0 ? (
                              info.reactionLines.map((line, i) => (
                                <p key={i} className="text-white/70">{line}</p>
                              ))
                            ) : (
                              <p className="text-white/50">Reakcja zależy od zaskoczenia vs konsensus oraz kontekstu rynkowego.</p>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          </section>
        ))}
        {!grouped.length && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            Brak bieżących wydarzeń dla wybranych filtrów. Sugerowane: {assetTab === 'oil' && 'cotygodniowe EIA lub decyzje OPEC/OPEC+'}
            {assetTab === 'fx' && 'CPI, PCE, NFP lub posiedzenia banków centralnych'}
            {assetTab === 'gold' && 'CPI/PCE i komunikacja Fed wpływają na realne stopy i złoto'}
            {assetTab === 'indices' && 'CPI/NFP/PMI/ISM oraz komunikacja banków centralnych'}
            {assetTab === 'rates' && 'CPI/PCE, PKB i guidance banków centralnych'}
            {assetTab === 'general' && 'zbiór większych publikacji (CPI, NFP, PKB, PMI/ISM)'}
            .
          </div>
        )}
      </div>
    </>
  );
}


