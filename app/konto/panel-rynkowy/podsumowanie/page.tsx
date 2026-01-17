// app/konto/panel-rynkowy/podsumowanie/page.tsx — Podsumowanie modułów pakietu (EDU)
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession, isTierAtLeast, type Tier } from '@/lib/panel/access';
import { CALENDAR_7D, type CalendarEvent } from '@/lib/panel/calendar7d';
import { SCENARIOS_ABC, type ScenarioItem } from '@/lib/panel/scenariosABC';
import { CHECKLISTS } from '@/lib/panel/checklists';
import { PLAYBOOKS } from '@/lib/panel/playbooks';
import { getTechMaps } from '@/lib/panel/techMapsStore';
import { getMonthlyReports } from '@/lib/panel/monthlyReports';
import SummaryCalendar from './SummaryCalendar';
import SummaryScenarios from './SummaryScenarios';
import SummaryChecklists from './SummaryChecklists';
import SummaryPlaybooks from './SummaryPlaybooks';
import SummaryTechMaps from './SummaryTechMaps';
import SummaryMonthlyReport from './SummaryMonthlyReport';
import SummaryCoachAI from './SummaryCoachAI';
import ModuleTile from './ModuleTile';
import HashScrollHandler from './HashScrollHandler';

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const hasStarter = isTierAtLeast(effectiveTier, 'starter');
  const hasPro = isTierAtLeast(effectiveTier, 'pro');
  const hasElite = isTierAtLeast(effectiveTier, 'elite');

  // Pobierz kalendarz (podobnie jak w kalendarz-7-dni/page.tsx)
  let events: CalendarEvent[] = CALENDAR_7D;
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 8000);
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const base = `${proto}://${host}`;
    const r = await fetch(`${base}/api/ai/calendar?days=7&limit=30`, { cache: 'no-store', signal: ac.signal });
    clearTimeout(to);
    if (r.ok) {
      const j = await r.json().catch(() => ({} as any));
      const arr: any[] = Array.isArray(j?.items) ? j.items : [];
      if (arr.length > 0) {
        const normalizeRegion = (r?: string): CalendarEvent['region'] => {
          const v = String(r || '').toUpperCase();
          if (v === 'US' || v === 'EU' || v === 'UK' || v === 'DE' || v === 'FR') {
            return v as CalendarEvent['region'];
          }
          return 'US';
        };
        events = arr.map<CalendarEvent>((it) => {
          return {
            date: String(it.date || '').slice(0, 10),
            time: String(it.time || '').slice(0, 5) || '00:00',
            region: normalizeRegion(it.region),
            event: String(it.title || '').trim(),
            importance: ((): CalendarEvent['importance'] => {
              const v = String(it.importance || '').toLowerCase();
              return v === 'high' ? 'high' : v === 'medium' ? 'medium' : 'low';
            })(),
            why: 'Wydarzenie makroekonomiczne wpływające na rynek.',
            how: 'Reakcja rynku zależy od odchylenia od konsensusu i kontekstu.',
          };
        });
      }
    }
  } catch {
    // użyj fallback CALENDAR_7D
  }

  // Filtruj scenariusze - pokaż tylko najważniejsze (pierwsze 5)
  const topScenarios = SCENARIOS_ABC.slice(0, 5);

  // Pobierz mapy techniczne (tylko jeśli użytkownik ma PRO)
  const techMaps = hasPro ? await getTechMaps() : [];

  // Pobierz raporty miesięczne (tylko jeśli użytkownik ma ELITE)
  const monthlyReports = hasElite ? getMonthlyReports() : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <HashScrollHandler />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* breadcrumbs */}
        <div className="flex items-center gap-3 text-sm text-white/70 mb-6">
          <Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded transition-colors">
            ← Strona główna
          </Link>
          <span className="text-white/30">/</span>
          <Link href="/konto/panel-rynkowy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded transition-colors">
            Panel (EDU)
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">Podsumowanie</span>
        </div>

        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Podsumowanie modułów
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-3xl leading-relaxed">
            Przegląd najważniejszych informacji z wszystkich modułów dostępnych w Twoim pakiecie. Wszystko w jednym miejscu, gotowe do wykorzystania.
          </p>
        </div>

        {/* plan badge */}
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg">
            Plan: {effectiveTier.toUpperCase()}
          </span>
        </div>

        {/* modules summary - grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* STARTER modules */}
          {hasStarter && (
            <>
              {/* Kalendarz 7 dni */}
              <ModuleTile
                title="Kalendarz 7 dni"
                description="Widzisz kluczowe publikacje makroekonomiczne na najbliższe dni i wiesz, kiedy rynek może przyspieszyć. Godziny publikacji, waga wydarzeń i kontekst dla różnych aktywów."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                href="#kalendarz-7-dni"
                tier="starter"
              />

              {/* Scenariusze A/B/C */}
              <ModuleTile
                title="Scenariusze A/B/C"
                description="Gotowe warianty zachowania rynku na dane aktywo i godzinę — plan A, B i C. Warunki aktywacji, potwierdzenia kierunku i alternatywne scenariusze."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                href="#scenariusze-abc"
                tier="starter"
              />

              {/* Checklisty */}
              <ModuleTile
                title="Checklisty"
                description="Lista kontroli przed wejściem i po wyjściu — trzymasz proces, nie emocje. Sprawdź setup, ryzyko i kontekst przed decyzją, a po transakcji wyciągnij wnioski."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                href="#checklisty"
                tier="starter"
              />
            </>
          )}

          {/* PRO modules */}
          {hasPro && (
            <>
              {/* Mapy techniczne */}
              <ModuleTile
                title="Mapy techniczne (EDU)"
                description="Poziomy, struktura i zmienność jako kontekst — wiesz gdzie rynek ma sens. Kluczowe poziomy wsparcia i oporu, struktura trendu oraz zmienność jako filtr ryzyka."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                href="#mapy-techniczne"
                tier="pro"
              />

              {/* Playbooki eventowe */}
              <ModuleTile
                title="Playbooki eventowe"
                description="Typowe reakcje rynku na wydarzenia (CPI, FOMC, NFP) — co zwykle działa i kiedy uważać. Schematy reakcji przed i po publikacji, warunki unieważnienia scenariusza."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                href="#playbooki-eventowe"
                tier="pro"
              />
            </>
          )}

          {/* ELITE modules */}
          {hasElite && (
            <>
              {/* Coach AI */}
              <ModuleTile
                title="Coach AI (EDU)"
                description="Wsparcie w analizie i procesie — pytania/odpowiedzi, bez sygnałów. Wyjaśnienie kontekstu i ryzyk, pomoc w budowie checklisty/scenariusza, edukacyjna interpretacja danych."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
                href="#coach-ai"
                tier="elite"
              />

              {/* Raport miesięczny */}
              <ModuleTile
                title="Raport miesięczny (EDU)"
                description="Podsumowanie miesiąca: kontekst, wnioski i scenariusze na kolejny okres. Najważniejsze tematy i katalizatory, wnioski z zachowania rynku, plan na co patrzeć dalej."
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                href="#raport-miesieczny"
                tier="elite"
              />
            </>
          )}

          {/* Upgrade prompt if not all modules */}
          {!hasStarter && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-lg font-semibold text-amber-200">Odblokuj moduły STARTER</div>
                  <div className="text-sm text-amber-200/80 mt-1">
                    Aby zobaczyć podsumowanie modułów, potrzebujesz pakietu STARTER lub wyższego.
                  </div>
                </div>
                <Link
                  href="/kontakt?topic=zakup-pakietu"
                  className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
                >
                  Wybierz pakiet
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Detailed summaries sections */}
        <div className="mt-16 space-y-16">
          {/* Kalendarz 7 dni */}
          {hasStarter && (
            <section id="kalendarz-7-dni" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Kalendarz 7 dni</h2>
                <p className="text-white/70">
                  Widzisz kluczowe publikacje makroekonomiczne na najbliższe dni i wiesz, kiedy rynek może przyspieszyć.
                </p>
              </div>
              <SummaryCalendar events={events} />
            </section>
          )}

          {/* Scenariusze A/B/C */}
          {hasStarter && (
            <section id="scenariusze-abc" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Scenariusze A/B/C</h2>
                <p className="text-white/70">
                  Gotowe warianty zachowania rynku na dane aktywo i godzinę — plan A, B i C.
                </p>
              </div>
              <SummaryScenarios scenarios={topScenarios} />
            </section>
          )}

          {/* Checklisty */}
          {hasStarter && (
            <section id="checklisty" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Checklisty</h2>
                <p className="text-white/70">
                  Lista kontroli przed wejściem i po wyjściu — trzymasz proces, nie emocje.
                </p>
              </div>
              <SummaryChecklists checklists={CHECKLISTS} />
            </section>
          )}

          {/* Mapy techniczne */}
          {hasPro && (
            <section id="mapy-techniczne" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Mapy techniczne (EDU)</h2>
                <p className="text-white/70">
                  Poziomy, struktura i zmienność jako kontekst — wiesz gdzie rynek ma sens.
                </p>
              </div>
              <SummaryTechMaps items={techMaps} />
            </section>
          )}

          {/* Playbooki eventowe */}
          {hasPro && (
            <section id="playbooki-eventowe" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Playbooki eventowe</h2>
                <p className="text-white/70">
                  Typowe reakcje rynku na wydarzenia (CPI, FOMC, NFP) — co zwykle działa i kiedy uważać.
                </p>
              </div>
              <SummaryPlaybooks playbooks={PLAYBOOKS.slice(0, 3)} />
            </section>
          )}

          {/* Coach AI */}
          {hasElite && (
            <section id="coach-ai" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Coach AI (EDU)</h2>
                <p className="text-white/70">
                  Wsparcie w analizie i procesie — pytania/odpowiedzi, bez sygnałów.
                </p>
              </div>
              <SummaryCoachAI />
            </section>
          )}

          {/* Raport miesięczny */}
          {hasElite && (
            <section id="raport-miesieczny" className="scroll-mt-8">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Raport miesięczny (EDU)</h2>
                <p className="text-white/70">
                  Podsumowanie miesiąca: kontekst, wnioski i scenariusze na kolejny okres.
                </p>
              </div>
              <SummaryMonthlyReport reports={monthlyReports} />
            </section>
          )}
        </div>

        {/* disclaimer */}
        <div className="mt-12 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 backdrop-blur-sm">
          <p className="text-amber-200 text-sm leading-relaxed">
            EDU: brak rekomendacji inwestycyjnych, brak sygnałów. Decyzje podejmujesz samodzielnie.
          </p>
        </div>
      </section>
    </main>
  );
}
