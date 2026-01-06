// app/konto/panel-rynkowy/mapy-techniczne/page.tsx — Moduł: Mapy techniczne (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { getTechMaps } from '@/lib/panel/techMapsStore';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import TechMapsClient from './TechMapsClient';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = isTierAtLeast(effectiveTier, 'pro'); // PRO/ELITE
  const items = await getTechMaps();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* breadcrumbs */}
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
            ← Strona główna
          </Link>
          <span className="text-white/30">/</span>
          <Link href="/konto/panel-rynkowy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
            Panel (EDU)
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Mapy techniczne (EDU)</span>
        </div>

        {/* back */}
        <div className="mt-3">
          <Link
            href="/konto/panel-rynkowy"
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
          >
            ← Wróć do Panelu (EDU)
          </Link>
        </div>

        {/* header */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Mapy techniczne (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Opisowy, edukacyjny przegląd trendu, kluczowych poziomów, kontekstu wskaźników oraz zmienności.
            Celem jest zbudowanie ramy do scenariuszy — bez rekomendacji i bez „sygnałów”.
            To jedna z najważniejszych zakładek: mapy wskazują pułapy, na których aktywo może silnie zareagować,
            pomagając planować wejścia/wyjścia i zarządzanie ryzykiem z wyprzedzeniem.
          </p>
        </div>

        {/* module explainer */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <div className="font-semibold text-white">Czym są mapy techniczne?</div>
            <p className="mt-1">
              To krótkie, edukacyjne karty kontekstu. Wskazują strukturę ruchu (trend lub range),
              najważniejsze strefy cenowe oraz podstawowe sygnały tła z prostych wskaźników i zmienności.
              Nie są to „sygnały wejścia/wyjścia”, lecz rama do planowania scenariuszy.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <div className="font-semibold text-white">Elementy karty</div>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li><span className="font-semibold text-white">Trend</span>: zarys kierunku i czynników (USD, stopy, dane).</li>
              <li><span className="font-semibold text-white">Kluczowe poziomy</span>: strefy wsparcia/oporu do walidacji i retestów.</li>
              <li><span className="font-semibold text-white">Wskaźniki (EDU)</span>: prosty kontekst (MA, RSI, MACD) bez nadmiaru.</li>
              <li><span className="font-semibold text-white">Zmienność</span>: środowisko ATR i momenty przyspieszeń (CPI/NFP, decyzje banków).</li>
              <li><span className="font-semibold text-white">Notatki scenariuszowe</span>: warunkowe „co jeśli…”, baza planów A/B/C.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <div className="font-semibold text-white">Jak czytać</div>
            <ol className="mt-1 list-decimal pl-5 space-y-1">
              <li>Wybierz aktywo i interwał zgodny z Twoją decyzją.</li>
              <li>Oceń trend: grasz z ruchem czy kontrujesz konsolidację.</li>
              <li>Zaznacz 2–3 kluczowe strefy — pracuj na retestach, nie na „magic numbers”.</li>
              <li>Wskaźniki traktuj jako kontekst, nie punkt wejścia.</li>
              <li>Dopasuj plan A/B/C i inwalidację do aktualnej zmienności.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <div className="font-semibold text-white">Dobre praktyki (EDU)</div>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>Łącz mapy z kalendarzem i scenariuszami — stawiaj na konfluencję.</li>
              <li>Myśl strefami, nie pojedynczym poziomem; szukaj potwierdzeń na retestach.</li>
              <li>Uwzględniaj środowisko zmienności — to filtr ryzyka, nie wróg.</li>
              <li>Z góry ustal punkt unieważnienia — dyscyplina &gt; prognoza.</li>
            </ul>
          </article>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny w PRO/ELITE.</div>
              </div>
              <Link
                href="/kontakt?topic=zakup-pakietu"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Ulepsz plan
              </Link>
            </div>
          </div>
        ) : <TechMapsClient items={items} />}

        {/* disclaimer */}
        <div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
          <p className="text-amber-200 text-sm">
            EDU: brak rekomendacji inwestycyjnych, brak „sygnałów”. Decyzje podejmujesz samodzielnie.
          </p>
        </div>
      </section>
    </main>
  );
}

