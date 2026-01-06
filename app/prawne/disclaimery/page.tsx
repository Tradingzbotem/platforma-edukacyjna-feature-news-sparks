import Link from "next/link";

export default function Page() {
  const Updated = () => (
    <p className="text-xs text-white/60">Ostatnia aktualizacja: 2026-01-02</p>
  );

  const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={id} className="text-xl md:text-2xl font-semibold scroll-mt-24">
      {children}
    </h2>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">
      {children}
    </div>
  );

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8">
      {/* Nawigacja */}
      <nav className="flex items-center gap-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
        <Link href="/prawne" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Prawne</Link>
      </nav>

      {/* Nagłówek */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Disclaimery rynkowe</h1>
        <p className="text-slate-300">
          Ważne informacje o charakterze treści, ograniczeniach i ryzykach związanych z rynkami finansowymi.
        </p>
        <Updated />
      </header>

      {/* Spis treści */}
      <Card>
        <div className="text-sm text-white/80 mb-3 font-semibold">Spis treści</div>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ["edukacja", "1. Charakter edukacyjny"],
            ["ryzyko", "2. Ryzyko rynkowe"],
            ["dzwignia", "3. Dźwignia finansowa"],
            ["dane", "4. Dane rynkowe i opóźnienia"],
            ["historyczne", "5. Wyniki historyczne"],
            ["ai", "6. Asystent AI i podsumowania"],
            ["odp", "7. Odpowiedzialność"],
            ["linki", "8. Linki zewnętrzne"],
            ["relacja", "9. Brak relacji doradczej"],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-block rounded-lg px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <section className="space-y-3">
        <H2 id="edukacja">1. Charakter edukacyjny</H2>
        <p className="text-white/80">
          Treści w Serwisie mają charakter wyłącznie edukacyjny i informacyjny. Nie stanowią rekomendacji inwestycyjnych
          ani doradztwa finansowego, podatkowego czy prawnego.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="ryzyko">2. Ryzyko rynkowe</H2>
        <p className="text-white/80">
          Inwestowanie wiąże się z ryzykiem utraty części lub całości zainwestowanego kapitału.
          Warunki rynkowe mogą ulegać szybkim i nieprzewidywalnym zmianom.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dzwignia">3. Dźwignia finansowa</H2>
        <p className="text-white/80">
          Instrumenty z dźwignią (np. CFD/FX) niosą podwyższone ryzyko i nie są odpowiednie dla wszystkich inwestorów.
          Zanim zaczniesz, rozważ swoją sytuację finansową i tolerancję ryzyka.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="dane">4. Dane rynkowe i opóźnienia</H2>
        <p className="text-white/80">
          Dane rynkowe mogą być opóźnione, niepełne lub pochodzić z zewnętrznych źródeł.
          Nie gwarantujemy ich dokładności ani dostępności w czasie rzeczywistym. Wybrane widżety
          mogą korzystać z połączeń do dostawców (np. Binance WebSocket dla krypto, Finnhub REST/WS dla indeksów/FX/surowców).
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="historyczne">5. Wyniki historyczne</H2>
        <p className="text-white/80">
          Wyniki historyczne nie gwarantują przyszłych rezultatów. Symulacje i testy wsteczne mają ograniczenia metodologiczne.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="ai">6. Asystent AI i podsumowania</H2>
        <p className="text-white/80">
          Funkcje AI (EDU), w tym czat i podsumowania aktualności, mają charakter wyłącznie edukacyjny.
          Odpowiedzi modeli językowych mogą być niepełne, nieaktualne lub zawierać uproszczenia.
          Nie stanowią rekomendacji inwestycyjnych ani porad. Źródła nagłówków (np. Reuters, CNBC, FXStreet, Investing.com)
          mogą być agregowane i streszczane; nie weryfikujemy niezależnie każdej informacji.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="odp">7. Odpowiedzialność</H2>
        <p className="text-white/80">
          Serwis nie ponosi odpowiedzialności za decyzje podejmowane na podstawie materiałów edukacyjnych ani za szkody
          wynikłe z ich wykorzystania.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="linki">8. Linki zewnętrzne</H2>
        <p className="text-white/80">
          Odnośniki do podmiotów trzecich służą wyłącznie celom informacyjnym. Nie ponosimy odpowiedzialności za ich treść
          ani polityki.
        </p>
      </section>

      <section className="space-y-3">
        <H2 id="relacja">9. Brak relacji doradczej</H2>
        <p className="text-white/80">
          Korzystanie z Serwisu nie tworzy relacji doradczej między Użytkownikiem a operatorem Serwisu. W razie potrzeby
          skonsultuj się z licencjonowanym doradcą.
        </p>
      </section>

      <div className="pt-4 border-t border-white/10">
        <Link href="/prawne" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/10">← Wróć do „Prawne”</Link>
      </div>
    </main>
  );
}


