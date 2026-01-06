// app/konto/panel-rynkowy/page.tsx — Konsumpcja zakupionych pakietów (EDU)
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { resolveTierFromCookiesAndSession, isTierAtLeast, type Tier } from '@/lib/panel/access';
import ModulesGridClient from './ModulesGridClient';

type UiPlan = 'FREE' | 'STARTER' | 'PRO' | 'ELITE';
type ModuleTier = Exclude<Tier, 'free'>;

function tierToPlanLabel(tier: Tier): UiPlan {
  if (tier === 'elite') return 'ELITE';
  if (tier === 'pro') return 'PRO';
  if (tier === 'starter') return 'STARTER';
  return 'FREE';
}

const MODULES: {
  title: string;
  blurb: string;
  tier: ModuleTier;
  slug: string;
  implemented: boolean;
  benefits: string[];
  tags: string[];
}[] = [
  // Starter
  {
    title: 'Kalendarz 7 dni',
    blurb: 'Widzisz kluczowe publikacje makro na najbliższe dni i wiesz, kiedy rynek może przyspieszyć.',
    tier: 'starter',
    slug: 'kalendarz-7-dni',
    implemented: true,
    benefits: ['Godziny publikacji i waga wydarzeń', 'Kontekst: na jakie aktywa wpływa', 'Szybkie podsumowanie „na co uważać”'],
    tags: ['Makro', 'Kontekst'],
  },
  {
    title: 'Scenariusze A/B/C',
    blurb: 'Gotowe warianty zachowania rynku na dane aktywo i godzinę — plan A, B i C.',
    tier: 'starter',
    slug: 'scenariusze-abc',
    implemented: true,
    benefits: ['Warunki aktywacji scenariusza', 'Co potwierdza kierunek (wskaźniki/poziomy)', 'Plan B, gdy rynek robi odwrotnie'],
    tags: ['Scenariusze', 'Proces'],
  },
  {
    title: 'Checklisty',
    blurb: 'Lista kontroli przed wejściem i po wyjściu — trzymasz proces, nie emocje.',
    tier: 'starter',
    slug: 'checklisty',
    implemented: true,
    benefits: ['Check przed decyzją (setup, ryzyko, kontekst)', 'Check po transakcji (wnioski, błędy, statystyka)', 'Stały schemat działania'],
    tags: ['Proces'],
  },

  // Pro
  {
    title: 'Mapy techniczne (EDU)',
    blurb: 'Poziomy, struktura i zmienność jako kontekst — wiesz gdzie rynek „ma sens”.',
    tier: 'pro',
    slug: 'mapy-techniczne',
    implemented: true,
    benefits: ['Kluczowe poziomy i strefy', 'Struktura trendu / range', 'Zmienność jako filtr ryzyka'],
    tags: ['Technika', 'Kontekst'],
  },
  {
    title: 'Playbooki eventowe',
    blurb: 'Typowe reakcje rynku na wydarzenia (CPI, FOMC, NFP) — co zwykle działa i kiedy uważać.',
    tier: 'pro',
    slug: 'playbooki-eventowe',
    implemented: true,
    benefits: ['Schematy reakcji (przed/po publikacji)', 'Warunki, kiedy scenariusz traci sens', 'Korelacje / kontekst'],
    tags: ['Makro', 'Scenariusze'],
  },

  // Elite
  {
    title: 'Coach AI (EDU)',
    blurb: 'Wsparcie w analizie i procesie — pytania/odpowiedzi, bez sygnałów.',
    tier: 'elite',
    slug: 'coach-ai',
    implemented: true,
    benefits: ['Wyjaśnienie kontekstu i ryzyk', 'Pomoc w budowie checklisty/scenariusza', 'Edukacyjna interpretacja danych'],
    tags: ['Proces', 'AI'],
  },
  {
    title: 'Raport miesięczny (EDU)',
    blurb: 'Podsumowanie miesiąca: kontekst, wnioski i scenariusze na kolejny okres.',
    tier: 'elite',
    slug: 'raport-miesieczny',
    implemented: true,
    benefits: ['Najważniejsze tematy i katalizatory', 'Wnioski z zachowania rynku', 'Plan „na co patrzeć” dalej'],
    tags: ['Kontekst'],
  },
];

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const effectivePlan: UiPlan = tierToPlanLabel(effectiveTier);
  const loggedIn = Boolean(session?.userId) || c.get('auth')?.value === '1';
  const upgradeHref = '/kontakt?topic=zakup-pakietu';

  const liveModules = MODULES.filter((m) => m.implemented);
  const accessibleLive = liveModules.filter((m) => isTierAtLeast(effectiveTier, m.tier)).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* plan bar */}
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="grow rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Panel rynkowy (EDU)</h1>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Zobacz, co odblokowuje Twój plan oraz jak możesz rozwinąć dostęp do kolejnych modułów.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  EDU
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[380px] rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-white/70">Twój plan</div>
                <div className="mt-1 text-2xl font-extrabold flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-sm font-semibold">
                    {effectivePlan}
                  </span>
                  {loggedIn ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                      Zalogowany
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                      Gość
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-white/80">
                  Dostęp do modułów: <span className="font-semibold">{accessibleLive}</span>/<span className="font-semibold">{liveModules.length}</span>
                </div>
              </div>
              {effectivePlan !== 'ELITE' && (
                <Link
                  href={upgradeHref}
                  className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Wybierz/ulepsz pakiet
                </Link>
              )}
            </div>
            <p className="mt-3 text-[12px] leading-5 text-white/60">
              EDU: brak rekomendacji inwestycyjnych, brak „sygnałów”. Decyzje podejmujesz samodzielnie.
            </p>
          </div>
        </div>

        {/* divider */}
        <div className="mt-6 border-t border-white/10" />

        {/* modules */}
        <div className="mt-8">
          <h2 className="text-xl md:text-2xl font-bold">Moduły</h2>
          <ModulesGridClient modules={MODULES} effectiveTier={effectiveTier} upgradeHref={upgradeHref} />
        </div>

        {/* subtle bottom spacing */}
        <div className="h-6" />
      </section>
    </main>
  );
}