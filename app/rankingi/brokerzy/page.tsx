'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import BrokerCard from "./components/BrokerCard";
import BrokersFilters, { type BrokersFiltersState, type BrokersSortKey } from "./components/BrokersFilters";
import BrokerChecklistPanel from "./components/BrokerChecklistPanel";
import BrokersFAQ from "./components/BrokersFAQ";
import { BROKERS, type Broker } from "../../../data/brokers";

/* ───────────────────────── helpers ───────────────────────── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
      {children}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 hover:bg-white/[0.04] transition">
      {children}
    </article>
  );
}

/* data is imported from data/brokers */

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-sm text-white/80">{children}</p>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */
export default function RankingsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BrokersFiltersState>({
    supportPL: false,
    regulatedEU: false,
    mt4mt5: false,
    cTrader: false,
    ownPlatform: false,
    education: false,
    promotions: false,
  });
  const [sortKey, setSortKey] = useState<BrokersSortKey>("curated");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = BROKERS.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.platforms.some(p => p.toLowerCase().includes(q)) ||
      b.markets.some(m => m.toLowerCase().includes(q))
    );

    // filters
    if (filters.supportPL) arr = arr.filter(b => b.supportPL);
    if (filters.regulatedEU) arr = arr.filter(b => b.regulatedEU);
    if (filters.mt4mt5) arr = arr.filter(b => b.platforms.some(p => ["mt4", "mt5"].includes(p.toLowerCase())));
    if (filters.cTrader) arr = arr.filter(b => b.platforms.some(p => p.toLowerCase().includes("ctrader")));
    if (filters.ownPlatform) arr = arr.filter(b =>
      b.platforms.some(p =>
        ["xstation", "oanda trade", "next generation", "saxotradergo", "saxotrader pro", "avatradego"].some(x => p.toLowerCase().includes(x))
      )
    );
    if (filters.education) arr = arr.filter(b => b.education || (b.links ?? []).some(l => l.label.toLowerCase().includes("e-book")));
    if (filters.promotions) arr = arr.filter(b => b.promotions);

    // sorting
    const score = (b: Broker) => (typeof b.rating === "number" ? b.rating : 0);
    if (sortKey === "rating") arr = arr.slice().sort((a, b) => score(b) - score(a));
    if (sortKey === "support") arr = arr.slice().sort((a, b) => Number(b.supportPL || b.vip24h) - Number(a.supportPL || a.vip24h) || score(b) - score(a));
    if (sortKey === "education") arr = arr.slice().sort((a, b) => Number(b.education) - Number(a.education) || score(b) - score(a));
    if (sortKey === "lowCosts") arr = arr.slice().sort((a, b) => Number(b.lowCostsDeclared) - Number(a.lowCostsDeclared) || score(b) - score(a));

    return arr;
  }, [query, filters, sortKey]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* header */}
        <header className="space-y-3">
          <Link href="/" className="text-sm underline">← Strona główna</Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Rankingi brokerów (CFD / Forex)</h1>
          <p className="text-white/80 leading-relaxed max-w-3xl">
            Zebraliśmy znane marki działające na rynku CFD/Forex. <span className="font-semibold underline decoration-rose-300/70">To nie jest rekomendacja</span> ani porada inwestycyjna.
            Warunki (spready, prowizje, finansowanie, opłaty) i dostępne rynki różnią się w zależności od kraju i typu rachunku.
            <strong> Zawsze weryfikuj ofertę na oficjalnej stronie brokera oraz wymagania regulacyjne.</strong>
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Card><p className="text-sm font-semibold mb-1">Weryfikuj regulację</p><p className="text-sm text-white/80">Sprawdź rejestry (np. UE/CySEC) i podmiot umowy.</p></Card>
            <Card><p className="text-sm font-semibold mb-1">Porównuj koszty</p><p className="text-sm text-white/80">Spread, prowizje, swapy, opłaty nieaktywności.</p></Card>
            <Card><p className="text-sm font-semibold mb-1">Testuj platformy</p><p className="text-sm text-white/80">Demo, stabilność, narzędzia, mobile/desktop, integracje.</p></Card>
            <Card><p className="text-sm font-semibold mb-1">Obsługa i onboarding</p><p className="text-sm text-white/80">Język, godziny, VIP, szybkość odpowiedzi.</p></Card>
          </div>
        </header>

        <BrokersFilters
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={(upd) => setFilters({ ...filters, ...upd })}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
        />

        {/* mobile checklist */}
        <div className="lg:hidden">
          <details className="rounded-2xl border border-white/10 bg-white/[0.03]">
            <summary className="px-4 py-3 cursor-pointer font-semibold">Checklista wyboru brokera</summary>
            <div className="p-4 border-t border-white/10">
              <BrokerChecklistPanel />
            </div>
          </details>
        </div>

        {/* 2-col layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {list.map((b) => (
              <BrokerCard key={b.name} broker={b} />
            ))}
          </section>
          <div className="hidden lg:block">
            <BrokerChecklistPanel />
          </div>
        </div>

        {/* disclaimer */}
        <div className="text-xs text-white/60">
          Handel instrumentami z dźwignią wiąże się z wysokim ryzykiem szybkiej utraty środków. Zanim założysz rachunek,
          sprawdź wymogi regulacyjne, koszty i ryzyka właściwe dla Twojej sytuacji i jurysdykcji.
        </div>

        {/* FAQ */}
        <BrokersFAQ />
      </div>
    </main>
  );
}
