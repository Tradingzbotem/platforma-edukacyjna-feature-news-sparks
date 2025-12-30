// app/konto/panel-rynkowy/mapy-techniczne/page.tsx — Moduł: Mapy techniczne (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { TECH_MAPS } from '@/lib/panel/techMaps';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = isTierAtLeast(effectiveTier, 'pro'); // PRO/ELITE

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
          </p>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny w PRO/ELITE.</div>
              </div>
              <Link
                href="/konto/upgrade"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Ulepsz plan
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {TECH_MAPS.map((m) => (
              <article key={m.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-white/70">
                    <div className="font-semibold text-white/80">{m.asset} · {m.timeframe}</div>
                    <div className="mt-0.5">Aktualizacja: {new Date(m.updatedAt).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="font-semibold">Trend</div>
                  <p className="mt-1">{m.trend}</p>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="font-semibold">Kluczowe poziomy</div>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {m.keyLevels.map((lv, i) => <li key={i}>{lv}</li>)}
                  </ul>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="font-semibold">Wskaźniki (EDU)</div>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {m.indicators.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="font-semibold">Zmienność</div>
                  <p className="mt-1">{m.volatility}</p>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="font-semibold">Notatki scenariuszowe (EDU)</div>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {m.scenarioNotes.map((nt, i) => <li key={i}>{nt}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}

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

