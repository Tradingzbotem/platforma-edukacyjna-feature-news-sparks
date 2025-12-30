// app/konto/panel-rynkowy/checklisty/page.tsx — Moduł: Checklisty (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { CHECKLISTS } from '@/lib/panel/checklists';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';

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
          <span className="text-white/70">Checklisty</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Checklisty (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Zestaw praktycznych, edukacyjnych list kontrolnych wspierających przygotowanie decyzji: kontekst makro,
            technika i plan ryzyka. Bez rekomendacji i „sygnałów” — wykorzystaj je jako strukturę do własnej analizy.
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
                href="/konto/upgrade"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Ulepsz plan
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* how to use */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold">Jak używać</div>
              <p className="mt-2 text-sm text-white/80">
                Traktuj checklisty jako ramę do własnej analizy: odznaczaj mentalnie punkty, szukaj konfluencji
                i zapisuj wnioski. To materiały EDU — bez rekomendacji inwestycyjnych i bez „sygnałów”.
              </p>
            </div>

            {/* groups */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {CHECKLISTS.map(group => (
                <section key={group.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
                  <h2 className="text-lg font-semibold">{group.title}</h2>
                  {group.subtitle && <p className="mt-1 text-sm text-white/70">{group.subtitle}</p>}
                  <ul className="mt-3 space-y-2">
                    {group.items.map(item => (
                      <li key={item.id} className="text-sm text-white/80">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
                          <div>
                            <div>{item.text}</div>
                            {item.note && <div className="text-xs text-white/60 mt-0.5">{item.note}</div>}
                            {item.tag && (() => {
                              const map: Record<string, { label: string; cls: string }> = {
                                makro: { label: 'Makro', cls: 'border-amber-400/30 bg-amber-500/10 text-amber-300' },
                                technika: { label: 'Technika', cls: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300' },
                                ryzyko: { label: 'Ryzyko', cls: 'border-rose-400/30 bg-rose-500/10 text-rose-300' },
                                sentyment: { label: 'Sentyment', cls: 'border-violet-400/30 bg-violet-500/10 text-violet-300' },
                                zmiennosc: { label: 'Zmienność', cls: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300' },
                              };
                              const m = map[item.tag] || { label: item.tag, cls: 'border-white/20 bg-white/5 text-white/70' };
                              return (
                                <div className="mt-1">
                                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${m.cls}`}>
                                    {m.label}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
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

