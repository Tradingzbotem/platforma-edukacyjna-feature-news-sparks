import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { requireTier } from '@/lib/panel/ssrGate';
import CoachAiClient from '.';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const { unlocked } = requireTier(c, session, 'elite');

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* back */}
        <div className="mt-3">
          <Link
            href="/konto/panel-rynkowy"
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
          >
            ← Wróć do Panelu rynkowego (EDU)
          </Link>
        </div>

        {/* header */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Coach AI (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Asystent edukacyjny do scenariuszy, checklist i interpretacji danych. Bez rekomendacji i bez „sygnałów”.
          </p>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny wyłącznie w ELITE.</div>
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
          <div className="mt-6">
            <CoachAiClient />
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


