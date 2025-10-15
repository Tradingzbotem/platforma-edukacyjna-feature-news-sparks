import Link from "next/link";

type Term = { term: string; def: string };

const TERMS: Term[] = [
  { term: "ATR (Average True Range)", def: "Miara zmienności – średnia z rozstępu świec (z uwzględnieniem luk). Pomaga dobrać SL/TP do warunków rynku." },
  { term: "Ask / Bid / Spread", def: "Ask – cena kupna, Bid – cena sprzedaży. Spread to różnica Ask−Bid (koszt wejścia/wyjścia z pozycji)." },
  { term: "Backtest", def: "Test strategii na danych historycznych. Pamiętaj o podziale na in-sample i out-of-sample oraz o unikaniu dopasowania do danych." },
  { term: "CFD (Contract for Difference)", def: "Kontrakt różnic kursowych – instrument pochodny odwzorowujący cenę aktywa bazowego (np. indeks, surowiec, waluta)." },
  { term: "Drawdown (DD)", def: "Spadek kapitału od szczytu do dołka w danej serii transakcji. Używany do oceny ryzyka strategii." },
  { term: "Dźwignia (Leverage)", def: "Pozwala kontrolować większą pozycję niż depozyt (margin). Zwiększa zarówno zysk, jak i ryzyko straty." },
  { term: "Equity", def: "Wartość rachunku wraz z wynikiem otwartych pozycji (balance + P/L bieżących transakcji)." },
  { term: "EV (Expected Value)", def: "Wartość oczekiwana strategii: EV = P(win)×średni zysk − P(loss)×średnia strata." },
  { term: "Hedge", def: "Zabezpieczenie pozycji przed ryzykiem poprzez transakcję kompensującą (np. instrument skorelowany)." },
  { term: "Kalendarz makro", def: "Harmonogram publikacji danych i wydarzeń ekonomicznych (np. NFP, CPI, posiedzenia banków centralnych)." },
  { term: "Lot", def: "Jednostka wielkości pozycji. Na FX standardowo 1 lot = 100 000 jednostek waluty bazowej; na CFD lot bywa zdefiniowany inaczej (np. 1 lot = 10 × cena indeksu)." },
  { term: "Margin (depozyt)", def: "Kwota blokowana na rachunku pod utrzymanie pozycji z dźwignią. Margin = (ContractSize × Loty × Cena) / Leverage." },
  { term: "Pips / Punkt", def: "Najmniejsza jednostka zmiany notowania (na FX zwykle 0.0001 dla par z 4 miejscami po przecinku)." },
  { term: "R:R (Risk:Reward)", def: "Stosunek ryzyka do potencjalnego zysku w transakcji (np. 1:2). Wpływa na wymagany wskaźnik trafności." },
  { term: "Rollover / Swap", def: "Naliczenie punktów swapowych za utrzymanie pozycji przez noc (wynika z różnic stóp procentowych i kosztów finansowania)." },
  { term: "Slippage", def: "Poślizg cenowy – wykonanie zlecenia po cenie gorszej od oczekiwanej (częste przy niskiej płynności/newsach)." },
  { term: "Stop Loss (SL)", def: "Zlecenie ograniczające stratę – zamyka pozycję przy wskazanej cenie." },
  { term: "Take Profit (TP)", def: "Zlecenie realizujące zysk – automatycznie zamyka pozycję na docelowej cenie." },
  { term: "Tick", def: "Pojedyncza, najmniejsza zmiana kwotowania instrumentu (nie mylić z pipsem)." },
  { term: "Zmienność (Volatility)", def: "Skala i tempo wahań cen instrumentu. Wyższa zmienność = większe ryzyko i potencjał zysku/straty." },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">
          ← Strona główna
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Glosariusz</h1>
        <p className="mt-2 text-white/70">Krótki słownik pojęć Forex/CFD. Materiał edukacyjny – nie stanowi porady inwestycyjnej.</p>
      </header>

      <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">
        <dl className="divide-y divide-white/10">
          {TERMS.map((t) => (
            <div key={t.term} className="py-4">
              <dt className="font-semibold">{t.term}</dt>
              <dd className="mt-1 text-sm text-white/80">{t.def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
