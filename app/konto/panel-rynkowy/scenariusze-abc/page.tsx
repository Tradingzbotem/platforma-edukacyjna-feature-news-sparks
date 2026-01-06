// app/konto/panel-rynkowy/scenariusze-abc/page.tsx — Moduł: Scenariusze A/B/C (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { SCENARIOS_ABC } from '@/lib/panel/scenariosABC';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import ScenariosClient from './ScenariosClient';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = isTierAtLeast(effectiveTier, 'starter');

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
          <span className="text-white/70">Scenariusze A/B/C</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Scenariusze A/B/C (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Przykładowe, edukacyjne scenariusze typu „jeśli–to”, które pomagają przygotować plan działania i zrozumieć
            kontekst rynku. To nie są rekomendacje ani sygnały — wykorzystaj je jako inspirację do własnej analizy.
          </p>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny w STARTER/PRO/ELITE.</div>
              </div>
              <Link
                href="/kontakt?topic=zakup-pakietu"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Ulepsz plan
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* mini guide */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/80">
                Jak to czytać: <span className="text-white">1) wybierz aktywo i interwał</span> · <span className="text-white">2) sprawdź poziomy</span> · <span className="text-white">3) porównaj scenariusz A/B/C</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">1) Wybór aktywa/TF</span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">2) Kluczowe poziomy</span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">3) A vs B vs C</span>
              </div>
            </div>

            {/* filters + scenarios (client) */}
            <div className="mt-6">
              <ScenariosClient items={SCENARIOS_ABC} />
            </div>
          </>
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

