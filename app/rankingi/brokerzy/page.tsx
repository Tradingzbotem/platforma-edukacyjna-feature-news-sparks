'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import BrokerCard, { type Broker as BrokerCardType } from "./components/BrokerCard";

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

/* ───────────────────────── data ───────────────────────── */
type Broker = {
  name: string;
  short?: string;
  rating: number; // 1..5 (subiektywna, edukacyjna „ocena wygody” – możesz edytować)
  platforms: string[];
  markets: string[];
  pros: string[];
  cons: string[];
  note?: string;
};

const BROKERS: Broker[] = [
  {
    name: "XTB",
    rating: 4.5,
    platforms: ["xStation"],
    markets: ["Forex", "Indeksy", "Surowce", "Akcje/ETF (CFD i/lub spot)"],
    pros: [
      "Własna, szybka platforma xStation z dobrym wykresem",
      "Obszerne materiały edukacyjne i webinary",
      "Szeroka oferta instrumentów",
    ],
    cons: [
      "Warunki handlowe różnią się między klasami aktywów",
      "Niektóre opłaty zależne od aktywności – sprawdź tabelę opłat",
    ],
    note: "Krótki komentarz: sprawdź, czy dostępne jest oprocentowanie środków/lokata, konto profesjonalne oraz handel na akcjach syntetycznych; dostępność i warunki zależą od regionu.",
  },
  {
    name: "IG",
    rating: 4.6,
    platforms: ["IG platform", "ProRealTime", "MT4 (wybrane oferty)"],
    markets: ["Forex", "Indeksy", "Akcje/ETF (CFD)", "Obligacje", "Towary"],
    pros: ["Bardzo szeroki wybór rynków", "Stabilna infrastruktura, rozbudowane narzędzia"],
    cons: ["Opłaty i prowizje zależne od rynku i rodzaju rachunku"],
  },
  {
    name: "CMC Markets",
    rating: 4.4,
    platforms: ["Next Generation", "MT4 (wybrane oferty)"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: ["Dobra realizacja i narzędzia analityczne", "Szerokie spektrum indeksów"],
    cons: ["Krzywe opłat mogą się różnić w zależności od regionu"],
  },
  {
    name: "Saxo Bank",
    short: "Saxo",
    rating: 4.3,
    platforms: ["SaxoTraderGO / PRO"],
    markets: ["Forex", "CFD", "Akcje/ETF", "Obligacje", "Futures", "Opcje"],
    pros: ["Bogata oferta instrumentów poza CFD", "Zaawansowana platforma"],
    cons: ["Zwykle wyższy próg depozytu i/lub opłaty nieaktywności"],
  },
  {
    name: "Pepperstone",
    rating: 4.4,
    platforms: ["MT4", "MT5", "cTrader", "TradingView (wybrane)"],
    markets: ["Forex", "Indeksy", "Towary", "Krypto (CFD)"],
    pros: ["Popularne platformy (MT4/5, cTrader)", "Konkurencyjne spready na FX"],
    cons: ["Oferta akcji spot bywa ograniczona – głównie CFD"],
  },
  {
    name: "IC Markets",
    rating: 4.3,
    platforms: ["MT4", "MT5", "cTrader"],
    markets: ["Forex", "Indeksy", "Towary", "Obligacje (CFD)"],
    pros: ["Bardzo szeroka oferta par FX", "Niskie koszty transakcyjne na wybranych typach rachunków"],
    cons: ["W godzinach publikacji danych możliwe większe rozszerzenia spreadu"],
  },
  {
    name: "OANDA",
    rating: 4.2,
    platforms: ["OANDA Trade", "MT4", "TradingView (wybrane)"],
    markets: ["Forex", "Indeksy", "Towary", "Krypto (CFD)"],
    pros: ["Przejrzysta platforma własna", "Dobre API / integracje (na wybranych rynkach)"],
    cons: ["Zakres instrumentów zależny od regionu"],
  },
  {
    name: "AvaTrade",
    rating: 4.0,
    platforms: ["MT4", "MT5", "AvaTradeGO"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)", "Krypto (CFD)"],
    pros: ["Proste w obsłudze aplikacje mobilne", "Szeroka oferta CFD"],
    cons: ["Model kosztów zależny od typu rachunku – weryfikuj przed startem"],
  },
  {
    name: "XM",
    rating: 4.0,
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: ["Duża baza materiałów edukacyjnych", "Rachunki z małymi wolumenami (np. mikro)"],
    cons: ["Prowizje/spready zależne od konta i regionu"],
  },
  {
    name: "Admirals (dawniej Admiral Markets)",
    rating: 4.2,
    platforms: ["MT4", "MT5", "Web/Portal"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje/ETF (CFD i/lub spot – w zależności od oferty)"],
    pros: ["Dobre materiały edukacyjne i analizy rynkowe", "Szeroka gama indeksów i towarów"],
    cons: ["Warunki różnią się między regionami i klasami aktywów – sprawdź lokalną ofertę"],
  },
];

/* ───────────────────────── page ───────────────────────── */
export default function RankingsPage() {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BROKERS; // kolejność: od XTB do Admirals
    return BROKERS.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.platforms.some(p => p.toLowerCase().includes(q)) ||
      b.markets.some(m => m.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* header */}
        <header className="space-y-2">
          <Link href="/" className="text-sm underline">← Strona główna</Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Rankingi brokerów (CFD / Forex)</h1>
          <p className="text-white/70 max-w-3xl">
            Poniżej zebraliśmy znane marki działające na rynku CFD/Forex. To <strong>nie jest rekomendacja</strong> ani porada
            inwestycyjna — warunki (spready, prowizje, finansowanie, opłaty) i dostępne rynki różnią się w zależności od kraju
            i typu rachunku. <strong>Zawsze weryfikuj ofertę na oficjalnej stronie brokera oraz wymagania regulacyjne</strong>.
          </p>
        </header>

        {/* search */}
        <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-4">
          <label className="block text-sm text-white/70 mb-2">Wyszukaj po nazwie / platformie / rynku</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="np. xStation, MT5, indeksy…"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>

        {/* list: compact cards grid */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BrokerCard key={b.name} broker={b as unknown as BrokerCardType} />
          ))}
        </section>

        {/* disclaimer */}
        <div className="text-xs text-white/60">
          Handel instrumentami z dźwignią wiąże się z wysokim ryzykiem szybkiej utraty środków. Zanim założysz rachunek,
          sprawdź wymogi regulacyjne, koszty i ryzyka właściwe dla Twojej sytuacji i jurysdykcji.
        </div>
      </div>
    </main>
  );
}
