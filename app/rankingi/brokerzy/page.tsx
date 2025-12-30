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
  trusted?: boolean;
  links?: { label: string; href: string }[];
};

const BROKERS: Broker[] = [
  {
    name: "XTB",
    trusted: true,
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
    links: [
      { label: "Strona", href: "https://www.xtb.com" },
    ],
  },
  {
    name: "XGLOBAL Markets",
    trusted: true,
    rating: 4.3,
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: [
      "Popularne platformy MT4/MT5 i prosty onboarding",
      "Konkurencyjne koszty transakcyjne na wybranych rachunkach",
      "Szybka egzekucja na głównych parach FX",
    ],
    cons: [
      "Dostępność instrumentów i opłat zależna od regionu i typu konta",
      "Ograniczona oferta akcji spot — głównie CFD",
    ],
    note: "Zweryfikuj szczegóły oferty, jurysdykcję i wymagania regulacyjne na stronie brokera przed otwarciem rachunku.",
    links: [
      { label: "Strona", href: "https://www.xglobalmarkets.com" },
      { label: "Pobierz e-book (W)", href: "https://lp.xglobalmarkets.com/e-book-w" },
      { label: "Pobierz e-book (B)", href: "https://lp.xglobalmarkets.com/e-book-b" },
    ],
  },
  {
    name: "CMC Markets",
    rating: 4.4,
    platforms: ["Next Generation", "MT4 (wybrane oferty)"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: ["Dobra realizacja i narzędzia analityczne", "Szerokie spektrum indeksów"],
    cons: ["Krzywe opłat mogą się różnić w zależności od regionu"],
    links: [
      { label: "Strona", href: "https://www.cmcmarkets.com" },
    ],
  },
  {
    name: "Saxo Bank",
    short: "Saxo",
    rating: 4.3,
    platforms: ["SaxoTraderGO / PRO"],
    markets: ["Forex", "CFD", "Akcje/ETF", "Obligacje", "Futures", "Opcje"],
    pros: ["Bogata oferta instrumentów poza CFD", "Zaawansowana platforma"],
    cons: ["Zwykle wyższy próg depozytu i/lub opłaty nieaktywności"],
    links: [
      { label: "Strona", href: "https://www.saxo.com" },
    ],
  },
  {
    name: "Pepperstone",
    rating: 4.4,
    platforms: ["MT4", "MT5", "cTrader", "TradingView (wybrane)"],
    markets: ["Forex", "Indeksy", "Towary", "Krypto (CFD)"],
    pros: ["Popularne platformy (MT4/5, cTrader)", "Konkurencyjne spready na FX"],
    cons: ["Oferta akcji spot bywa ograniczona – głównie CFD"],
    links: [
      { label: "Strona", href: "https://pepperstone.com" },
    ],
  },
  {
    name: "IC Markets",
    rating: 4.3,
    platforms: ["MT4", "MT5", "cTrader"],
    markets: ["Forex", "Indeksy", "Towary", "Obligacje (CFD)"],
    pros: ["Bardzo szeroka oferta par FX", "Niskie koszty transakcyjne na wybranych typach rachunków"],
    cons: ["W godzinach publikacji danych możliwe większe rozszerzenia spreadu"],
    links: [
      { label: "Strona", href: "https://www.icmarkets.com" },
    ],
  },
  {
    name: "OANDA",
    rating: 4.2,
    platforms: ["OANDA Trade", "MT4", "TradingView (wybrane)"],
    markets: ["Forex", "Indeksy", "Towary", "Krypto (CFD)"],
    pros: ["Przejrzysta platforma własna", "Dobre API / integracje (na wybranych rynkach)"],
    cons: ["Zakres instrumentów zależny od regionu"],
    links: [
      { label: "Strona", href: "https://www.oanda.com" },
    ],
  },
  {
    name: "AvaTrade",
    rating: 4.0,
    platforms: ["MT4", "MT5", "AvaTradeGO"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)", "Krypto (CFD)"],
    pros: ["Proste w obsłudze aplikacje mobilne", "Szeroka oferta CFD"],
    cons: ["Model kosztów zależny od typu rachunku – weryfikuj przed startem"],
    links: [
      { label: "Strona", href: "https://www.avatrade.com" },
    ],
  },
  {
    name: "XM",
    rating: 4.0,
    platforms: ["MT4", "MT5"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje (CFD)"],
    pros: ["Duża baza materiałów edukacyjnych", "Rachunki z małymi wolumenami (np. mikro)"],
    cons: ["Prowizje/spready zależne od konta i regionu"],
    links: [
      { label: "Strona", href: "https://www.xm.com" },
    ],
  },
  {
    name: "Admirals (dawniej Admiral Markets)",
    rating: 4.2,
    platforms: ["MT4", "MT5", "Web/Portal"],
    markets: ["Forex", "Indeksy", "Towary", "Akcje/ETF (CFD i/lub spot – w zależności od oferty)"],
    pros: ["Dobre materiały edukacyjne i analizy rynkowe", "Szeroka gama indeksów i towarów"],
    cons: ["Warunki różnią się między regionami i klasami aktywów – sprawdź lokalną ofertę"],
    links: [
      { label: "Strona", href: "https://www.admirals.com" },
    ],
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
