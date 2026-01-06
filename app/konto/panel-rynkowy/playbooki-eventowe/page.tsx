// app/konto/panel-rynkowy/playbooki-eventowe/page.tsx — Moduł: Playbooki eventowe (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import { PLAYBOOKS } from '@/lib/panel/playbooks';
import PlaybooksListClient from './PlaybooksListClient';

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
          <span className="text-white/70">Playbooki eventowe</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Playbooki eventowe (EDU)</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/70">EDU</span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/70">Premium</span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white/70">Bez sygnałów</span>
          </div>
          <p className="mt-3 text-white/80 max-w-3xl">
            Zestaw edukacyjnych schematów interpretacji wydarzeń makro: na co patrzeć, typowe mechanizmy reakcji,
            kiedy reakcja bywa odwracana oraz jakie ryzyka warto brać pod uwagę. Bez rekomendacji i bez „sygnałów”.
          </p>
        </div>

        {/* intro info cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
            <div className="text-sm font-semibold text-white">Po co są playbooki?</div>
            <p className="mt-2 text-sm text-white/80">
              Porządkują proces: co sprawdzać przed, w trakcie i po publikacji. Uczą mechanizmów, nie „co robić”.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
            <div className="text-sm font-semibold text-white">Dlaczego to ważne?</div>
            <p className="mt-2 text-sm text-white/80">
              Duże publikacje kształtują narrację i zmienność. Świadome czytanie danych redukuje chaos i błędy interpretacji.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
            <div className="text-sm font-semibold text-white">AI na żądanie</div>
            <p className="mt-2 text-sm text-white/80">
              Każda zakładka generuje treść na żywo (EDU). Zawsze bez „sygnałów”. Możesz odświeżyć w dowolnym momencie.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
            <div className="text-sm font-semibold text-white">Jak korzystać?</div>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-white/80">
              <li>Wybierz event i sekcję (TL;DR, Przed, W trakcie…).</li>
              <li>Odhaczaj checklistę — śledź postęp.</li>
              <li>Użyj quizu i słownika, by utrwalić wiedzę.</li>
            </ul>
          </div>
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
        ) : (
          <PlaybooksListClient items={PLAYBOOKS} />
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

