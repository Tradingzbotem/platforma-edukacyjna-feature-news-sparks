// app/konto/panel-rynkowy/checklisty/page.tsx — Moduł: Checklisty (EDU)
import Link from 'next/link';
import { PanelModuleNav } from '@/components/panel/PanelModuleNav';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession, hasFullPanelAccess } from '@/lib/panel/access';
import ChecklistClient from './ChecklistClient';

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams?: PageSearchParams }) {
  const sp = (await searchParams) ?? {};
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = hasFullPanelAccess(effectiveTier);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-1">
          <PanelModuleNav searchParams={sp} moduleTitle="Checklisty" />
        </div>

        {/* header */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Checklisty (EDU)</h1>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest w pełnym dostępie (Founders NFT).</div>
              </div>
              <Link
                href="/cennik"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Uzyskaj dostęp
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ChecklistClient />
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

