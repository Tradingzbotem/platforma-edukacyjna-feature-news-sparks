// app/konto/panel-rynkowy/page.tsx — Konsumpcja zakupionych pakietów (EDU)
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { resolveTierFromCookiesAndSession, isTierAtLeast, type Tier } from '@/lib/panel/access';

type UiPlan = 'FREE' | 'STARTER' | 'PRO' | 'ELITE';
type ModuleTier = Exclude<Tier, 'free'>;

function tierToPlanLabel(tier: Tier): UiPlan {
  if (tier === 'elite') return 'ELITE';
  if (tier === 'pro') return 'PRO';
  if (tier === 'starter') return 'STARTER';
  return 'FREE';
}

const MODULES: { title: string; blurb: string; tier: ModuleTier; slug: string; implemented: boolean }[] = [
  // Starter
  { title: 'Kalendarz 7 dni', blurb: 'Kluczowe wydarzenia makro z najbliższego tygodnia.', tier: 'starter', slug: 'kalendarz-7-dni', implemented: true },
  { title: 'Scenariusze A/B/C', blurb: 'Warunki wejścia, unieważnienia i ryzyka — planowo.', tier: 'starter', slug: 'scenariusze-abc', implemented: true },
  { title: 'Checklisty', blurb: 'Gotowe listy kontroli przed i po transakcji.', tier: 'starter', slug: 'checklisty', implemented: true },

  // Pro
  { title: 'Mapy techniczne (EDU)', blurb: 'Poziomy, struktury i zmienność jako kontekst.', tier: 'pro', slug: 'mapy-techniczne', implemented: true },
  { title: 'Playbooki eventowe', blurb: 'Typowe reakcje rynku na dane i wydarzenia.', tier: 'pro', slug: 'playbooki-eventowe', implemented: true },

  // Elite
  { title: 'Coach AI (EDU)', blurb: 'Wsparcie w analizie — pytania/odpowiedzi, bez sygnałów.', tier: 'elite', slug: 'coach-ai', implemented: true },
  { title: 'Raport miesięczny (EDU)', blurb: 'Podsumowanie kontekstu i scenariuszy.', tier: 'elite', slug: 'raport-miesieczny', implemented: true },
];

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const effectivePlan: UiPlan = tierToPlanLabel(effectiveTier);
  const loggedIn = Boolean(session?.userId) || c.get('auth')?.value === '1';
  const upgradeHref = loggedIn ? '/konto/upgrade' : `/logowanie?next=${encodeURIComponent('/konto/upgrade')}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* header */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Twój dostęp do Panelu (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-2xl">
            Poniżej znajdziesz moduły dostępne w Twoim planie oraz te, które możesz odblokować, ulepszając plan.
          </p>
        </div>

        {/* plan card */}
        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Twój plan</div>
              <div className="mt-1 text-2xl font-extrabold">{effectivePlan}</div>
            </div>
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Zalogowany
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  Niezalogowany
                </span>
              )}
              {effectivePlan !== 'ELITE' && (
                <Link
                  href={upgradeHref}
                  className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Ulepsz plan
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* modules */}
        <div className="mt-8">
          <h2 className="text-xl md:text-2xl font-bold">Moduły</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MODULES.map((m) => {
              const unlocked = isTierAtLeast(effectiveTier, m.tier);

              return (
                <div
                  key={m.slug}
                  className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5"
                >
                  <div className="text-sm text-white/60">
                    {m.tier === 'starter' ? 'Starter' : m.tier === 'pro' ? 'Pro' : 'Elite'}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{m.title}</div>
                  <p className="mt-1 text-sm text-white/70">{m.blurb}</p>

                  {unlocked ? (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            m.implemented
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/20 bg-white/5 text-white/70'
                          }`}
                        >
                          {m.implemented ? 'Dostępne' : 'Wkrótce'}
                        </span>
                        {m.tier === 'elite' && (
                          <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                            ELITE
                          </span>
                        )}
                      </div>

                      {m.implemented ? (
                        <Link
                          href={`/konto/panel-rynkowy/${m.slug}`}
                          className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                        >
                          Wejdź do modułu
                        </Link>
                      ) : (
                        <Link
                          href="/ebooki#plany"
                          className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                        >
                          Zobacz ofertę
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[11px]">
                          Zablokowane
                        </span>
                        <span className="hidden sm:inline">
                          {m.tier === 'starter'
                            ? 'Dostępne w STARTER/PRO/ELITE'
                            : m.tier === 'pro'
                            ? 'Dostępne w PRO/ELITE'
                            : 'Dostępne w ELITE'}
                        </span>
                      </div>
                      <Link
                        href={upgradeHref}
                        className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                      >
                        Ulepsz plan
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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