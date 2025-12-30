import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { requireTier } from '@/lib/panel/ssrGate';
import { MONTHLY_REPORT } from '@/lib/panel/monthlyReport';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const { unlocked } = requireTier(c, session, 'elite'); // ELITE only

  const updatedAt = new Date(MONTHLY_REPORT.updatedAt).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* breadcrumbs */}
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
            ← Strona główna
          </Link>
            <span className="text-white/30">/</span>
          <Link
            href="/konto/panel-rynkowy"
            className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
          >
            Panel (EDU)
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Raport miesięczny</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Raport miesięczny (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Przegląd kontekstu i ryzyk na najbliższy miesiąc: makro, sentyment, watchlist i procedura pracy.
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
          <>
            {/* meta card */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-white/70">Miesiąc</div>
                  <div className="mt-1 text-2xl font-extrabold">{MONTHLY_REPORT.monthLabel}</div>
                  <div className="mt-2 text-sm text-white/70">Aktualizacja: {updatedAt}</div>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  ELITE
                </span>
              </div>
              <p className="mt-4 text-sm text-white/80">{MONTHLY_REPORT.scopeNote}</p>
            </div>

            {/* sections */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {MONTHLY_REPORT.sections.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5"
                >
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                  <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-white/80">
                    {s.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  {s.note && <p className="mt-3 text-xs text-white/60">{s.note}</p>}
                </article>
              ))}
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

