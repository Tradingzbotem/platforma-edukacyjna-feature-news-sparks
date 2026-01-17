'use client';
import React from 'react';

export type BrokersFiltersState = {
  supportPL: boolean;
  regulatedEU: boolean;
  mt4mt5: boolean;
  cTrader: boolean;
  ownPlatform: boolean;
  education: boolean;
  promotions: boolean;
};

export type BrokersSortKey = "curated" | "rating" | "support" | "education" | "lowCosts";

export default function BrokersFilters({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  sortKey,
  onSortKeyChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  filters: BrokersFiltersState;
  onFiltersChange: (s: Partial<BrokersFiltersState>) => void;
  sortKey: BrokersSortKey;
  onSortKeyChange: (k: BrokersSortKey) => void;
}) {
  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active
          ? "bg-white text-slate-900 border-white"
          : "bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/[0.08]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-4 space-y-3 relative">
      <div>
        <label className="block text-sm text-white/70 mb-2">Wyszukaj po nazwie / platformie / rynku</label>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="np. xStation, MT5, indeksy…"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {chip("Wsparcie PL", filters.supportPL, () => onFiltersChange({ supportPL: !filters.supportPL }))}
        {chip("Regulowany (UE)", filters.regulatedEU, () => onFiltersChange({ regulatedEU: !filters.regulatedEU }))}
        {chip("MT4/MT5", filters.mt4mt5, () => onFiltersChange({ mt4mt5: !filters.mt4mt5 }))}
        {chip("cTrader", filters.cTrader, () => onFiltersChange({ cTrader: !filters.cTrader }))}
        {chip("Własna platforma", filters.ownPlatform, () => onFiltersChange({ ownPlatform: !filters.ownPlatform }))}
        {chip("E-booki/edukacja", filters.education, () => onFiltersChange({ education: !filters.education }))}
        {chip("Promocje", filters.promotions, () => onFiltersChange({ promotions: !filters.promotions }))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <label className="text-sm text-white/70">Sortowanie:</label>
        <select
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value as BrokersSortKey)}
          className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm"
        >
          <option value="curated">Domyślna (redakcyjna)</option>
          <option value="rating">Ocena</option>
          <option value="support">Najlepsze wsparcie</option>
          <option value="education">Najwięcej edukacji</option>
          <option value="lowCosts">Najniższe koszty (deklarowane)</option>
        </select>
        <a
          href="#blacklist"
          className="absolute bottom-4 right-4 flex items-center justify-center px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs font-semibold transition-colors whitespace-nowrap"
          title="Czarna lista"
        >
          BLACKLIST
        </a>
      </div>
    </div>
  );
}


