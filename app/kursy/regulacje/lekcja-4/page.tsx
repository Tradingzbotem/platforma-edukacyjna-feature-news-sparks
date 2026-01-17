import Link from "next/link";
import type { ReactNode } from "react";

function LessonLayout({
  coursePath, courseTitle, lessonNumber, title, minutes, children, prevSlug, nextSlug,
}: {
  coursePath: "regulacje";
  courseTitle: string;
  lessonNumber: number;
  title: string;
  minutes: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6 animate-fade-in">
        <Link href={`/kursy/${coursePath}`} className="inline-flex items-center gap-2 text-sm underline hover:text-white transition-colors duration-150">← Wróć do spisu</Link>

        <header className="space-y-1">
          <p className="text-slate-400 text-sm">
            <span>{courseTitle}</span>
            <span> — </span>
            <span>Lekcja</span> <span>{lessonNumber}</span>
            <span> • ⏱ </span>
            <span>{minutes}</span> <span>min</span>
          </p>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
        </header>

        <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a] backdrop-blur-sm p-6 space-y-8 shadow-lg">
          {children}
        </article>

        <nav className="flex items-center justify-between pt-4 border-t border-white/10">
          {prevSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${prevSlug}`}>← Poprzednia lekcja</Link>
          ) : <span />}
          {nextSlug ? (
            <Link className="underline hover:text-white transition-colors duration-150" href={`/kursy/${coursePath}/${nextSlug}`}>Następna lekcja →</Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <LessonLayout
      coursePath="regulacje"
      courseTitle="Regulacje i egzaminy"
      lessonNumber={4}
      minutes={10}
      title="Ochrona klienta: limity dźwigni i negative balance"
      prevSlug="lekcja-3"
      nextSlug="lekcja-5"
    >
      <section>
        <h2 className="text-xl font-semibold">Cele lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-2">
          <li>Poznasz <strong>limity dźwigni ESMA</strong> dla różnych kategorii instrumentów.</li>
          <li>Zrozumiesz, czym jest <strong>margin close-out</strong> i kiedy następuje.</li>
          <li>Dowiesz się, czym jest <strong>negative balance protection</strong>.</li>
          <li>Poznasz proces <strong>opt-up</strong> i jego konsekwencje.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Limity dźwigni ESMA dla klientów detalicznych</h2>
        <p className="mt-2 text-slate-300">
          ESMA wprowadziła limity dźwigni dla różnych kategorii instrumentów w celu ochrony klientów detalicznych przed nadmiernym ryzykiem.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-500/5 backdrop-blur-sm border border-indigo-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-indigo-200">Tabela limitów dźwigni ESMA</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/70">Instrument</th>
                  <th className="text-left py-2 text-white/70">Limit dźwigni</th>
                  <th className="text-left py-2 text-white/70">Przykłady</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-2">FX majors</td>
                  <td className="py-2"><strong>1:30</strong></td>
                  <td className="py-2">EURUSD, GBPUSD, USDJPY</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2">Złoto i duże indeksy</td>
                  <td className="py-2"><strong>1:20</strong></td>
                  <td className="py-2">XAUUSD, US100, US500</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2">Inne towary i indeksy</td>
                  <td className="py-2"><strong>1:10</strong></td>
                  <td className="py-2">OIL, DAX, inne indeksy</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2">Akcje</td>
                  <td className="py-2"><strong>1:5</strong></td>
                  <td className="py-2">Wszystkie akcje</td>
                </tr>
                <tr>
                  <td className="py-2">Kryptowaluty</td>
                  <td className="py-2"><strong>1:2</strong></td>
                  <td className="py-2">BTC, ETH, inne krypto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Margin Close-Out</h2>
        <p className="mt-2 text-slate-300">
          Zgodnie z regulacjami ESMA, broker musi zamknąć pozycje klienta detalicznego, gdy <strong>equity spadnie do 50%</strong> wymaganego depozytu zabezpieczającego (margin).
        </p>
        <div className="mt-4 rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-red-200">Przykład margin close-out</h3>
          <p className="text-slate-300 mt-1 text-sm">
            Klient ma depozyt 1000 EUR i otwiera pozycję wymagającą margin 200 EUR (dźwignia 1:5). 
            Jeśli equity spadnie do 100 EUR (50% z 200 EUR), broker automatycznie zamknie pozycję, 
            aby zapobiec dalszym stratom.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Negative Balance Protection</h2>
        <p className="mt-2 text-slate-300">
          <strong>Negative balance protection</strong> oznacza, że rachunek klienta nie może zejść poniżej zera — 
          klient nie może stracić więcej niż wpłacony depozyt. To obowiązkowa ochrona dla klientów detalicznych w UE.
        </p>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Przed wprowadzeniem</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Przed wprowadzeniem negative balance protection, klienci mogli stracić więcej niż wpłacony depozyt, 
              szczególnie przy gwałtownych ruchach rynku (np. „flash crash”).
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-emerald-200">Po wprowadzeniu</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Dzięki negative balance protection, klient detaliczny nie może stracić więcej niż wpłacony depozyt. 
              Jeśli rachunek spadnie do zera, broker automatycznie zamknie wszystkie pozycje.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Opt-Up (Zmiana kategorii klienta)</h2>
        <p className="mt-2 text-slate-300">
          Klient detaliczny może poprosić o zmianę kategorii na profesjonalną (opt-up), co oznacza rezygnację z niektórych ochron regulacyjnych, 
          w tym limitów dźwigni. Proces wymaga spełnienia określonych kryteriów.
        </p>
        <div className="mt-4 rounded-xl bg-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 shadow-sm">
          <h3 className="font-semibold text-amber-200">Kryteria opt-up na profesjonalnego</h3>
          <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
            <li>Wartość portfela przekracza <strong>500 000 EUR</strong></li>
            <li>LUB klient ma odpowiednie doświadczenie w sektorze finansowym</li>
            <li>LUB wielkość transakcji wskazuje na profesjonalizm</li>
            <li>Klient musi wyrazić świadomą zgodę i zrozumieć konsekwencje</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Konsekwencje opt-up</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-red-500/5 backdrop-blur-sm border border-red-400/20 p-4 shadow-sm">
            <h3 className="font-semibold text-red-200">Rezygnacja z ochron</h3>
            <ul className="text-slate-300 mt-1 space-y-1 text-sm list-disc pl-6">
              <li>Rezygnacja z limitów dźwigni ESMA — możliwość wyższych dźwigni</li>
              <li>Rezygnacja z negative balance protection — możliwość strat większych niż depozyt</li>
              <li>Mniej szczegółowe informacje o kosztach</li>
              <li>Możliwość wyższego ryzyka</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-sm">
            <h3 className="font-semibold text-white">Proces jest jednokierunkowy</h3>
            <p className="text-slate-300 mt-1 text-sm">
              Opt-up jest procesem jednokierunkowym — klient może przejść z detalicznego na profesjonalnego, 
              ale nie odwrotnie (z wyjątkiem szczególnych przypadków). Decyzja powinna być przemyślana.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Checklist po lekcji</h2>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Znam <strong>limity dźwigni ESMA</strong> dla różnych kategorii instrumentów.</li>
          <li>Rozumiem, że <strong>margin close-out</strong> następuje przy 50% wymaganego depozytu.</li>
          <li>Wiem, czym jest <strong>negative balance protection</strong> i dlaczego jest ważne.</li>
          <li>Rozumiem proces <strong>opt-up</strong> i jego konsekwencje.</li>
          <li>Wiem, że opt-up jest procesem jednokierunkowym i wymaga świadomej zgody.</li>
        </ul>
      </section>
    </LessonLayout>
  );
}
