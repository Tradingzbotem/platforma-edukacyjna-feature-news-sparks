// app/konto/panel-rynkowy/kalendarz-7-dni/page.tsx — Moduł: Kalendarz 7 dni (EDU)
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { getSession } from '@/lib/session';
import { CALENDAR_7D, type CalendarEvent } from '@/lib/panel/calendar7d';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import CalendarClient from './CalendarClient';
import { inferImpact } from '@/lib/panel/calendarImpact';

type ApiEvent = {
  date: string;
  time?: string;
  region?: string;
  title: string;
  importance?: 'low' | 'medium' | 'high';
};

function normalizeRegion(r?: string): CalendarEvent['region'] {
  const v = String(r || '').toUpperCase();
  if (v === 'US' || v === 'EU' || v === 'UK' || v === 'DE' || v === 'FR') return v;
  return 'US';
}

function educationalWhyHow(title: string, region: CalendarEvent['region']): Pick<CalendarEvent, 'why' | 'how'> {
  const t = title.toLowerCase();
  const isCpi = t.includes('cpi') || t.includes('inflac') || t.includes('hicp');
  const isNfp = t.includes('nfp') || t.includes('non-farm');
  const isPce = t.includes('pce');
  const isPmi = t.includes('pmi') || t.includes('ism');
  const isFomc = t.includes('fomc') || t.includes('minutes') || t.includes('fed');
  const isGdp = t.includes('gdp') || t.includes('pkb');
  const isUnemp = t.includes('unemployment') || t.includes('bezroboc');
  const isRetailSales = t.includes('retail sales');
  const isOil = t.includes('crude') || t.includes('eia') || t.includes('api') || t.includes('zapasy ropy') || t.includes('oil');

  if (isCpi) {
    if (region === 'US') {
      return {
        why: 'Preferowana przez Fed miara presji cenowej wpływa na oczekiwania dot. stóp i narrację polityki.',
        how: 'Wyższa inflacja vs konsensus często wzmacnia USD i podnosi rentowności; indeksy zależne od „higher for longer”.',
      };
    }
    return {
      why: 'Inflacja w Europie kształtuje oczekiwania wobec polityki EBC i krzywą bundów.',
      how: 'Zaskoczenia wobec konsensusu często wpływają na EUR i bundy; skala reakcji zależy od odchylenia i trendu.',
    };
  }
  if (isNfp) {
    return {
      why: 'Rynek pracy w USA steruje oczekiwaniami stóp i oceną ryzyka recesji/miękkiego lądowania.',
      how: 'Duże odchylenie od konsensusu bywa impulsem kierunkowym na USD i rentownościach; znaczenie rewizji i szczegółów.',
    };
  }
  if (isPce) {
    return {
      why: 'Preferowana przez Fed miara inflacji; ważna dla trajektorii polityki pieniężnej.',
      how: 'Odczyt wyżej od prognoz bywa „hawkish”: wzmacnia USD i rentowności; kontekst trendu ma znaczenie.',
    };
  }
  if (isPmi) {
    return {
      why: 'Indeks aktywności (PMI/ISM) daje wskazówki co do cyklu i presji cenowej w komponentach.',
      how: 'Silne zaskoczenia mogą poruszać indeksy i USD/EUR; trwałość zależy od narracji i potwierdzeń w kolejnych danych.',
    };
  }
  if (isFomc) {
    return {
      why: 'Minutes/komunikacja Fed zmieniają bilans ryzyk i wrażliwość na dane.',
      how: 'Ton jastrzębi/gołębi często wpływa na USD, rentowności i indeksy; znaczenie rośnie przy zmianie narracji.',
    };
  }
  if (isGdp) {
    return {
      why: 'PKB kształtuje ocenę dynamiki wzrostu oraz oczekiwań wobec stóp.',
      how: 'Duże odchylenia bywają kierunkowe dla FX i indeksów; znaczenie zależy od trendu i tła globalnego.',
    };
  }
  if (isUnemp) {
    return {
      why: 'Stopa bezrobocia uzupełnia obraz rynku pracy i ryzyka cyklu.',
      how: 'Wzrost bywa „dovish”, spadek „hawkish”; rynek często ocenia łącznie z NFP i rewizjami.',
    };
  }
  if (isRetailSales) {
    return {
      why: 'Konsumpcja jest istotną częścią PKB; dynamika sprzedaży wpływa na ocenę cyklu.',
      how: 'Silne odchylenia vs prognozy mogą poruszać indeksy i USD krótkoterminowo; trwałość zależna od trendu.',
    };
  }
  if (isOil) {
    return {
      why: 'Zapasy ropy wpływają na równowagę popyt–podaż i sentyment w energii.',
      how: 'Spadek zapasów bywa wsparciem dla ropy; wzrost – negatywny; liczy się też produkcja i popyt.',
    };
  }
  return {
    why: 'Wydarzenie makro mogące wpływać na sentyment i trajektorię oczekiwań rynkowych.',
    how: 'Reakcja zależy od skali zaskoczenia vs konsensus oraz kontekstu (trend, polityka).',
  };
}

// inferImpact przeniesiony do '@/lib/panel/calendarImpact'

function importanceBadge(importance: CalendarEvent['importance']) {
  const styles =
    importance === 'high'
      ? 'text-red-300 border-red-400/30 bg-red-500/10'
      : importance === 'medium'
      ? 'text-amber-300 border-amber-400/30 bg-amber-500/10'
      : 'text-white/70 border-white/20 bg-white/5';
  const label = importance === 'high' ? 'wysoka' : importance === 'medium' ? 'średnia' : 'niska';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${styles}`}>
      Ważność: {label}
    </span>
  );
}

export default async function Page() {
  const session = await getSession();
  const c = await cookies();

  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = isTierAtLeast(effectiveTier, 'starter');

  // SSR: spróbuj pobrać „live” kalendarz z /api/ai/calendar; w razie błędu — fallback do EDU
  let events: CalendarEvent[] = CALENDAR_7D;
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 8000);
    // Unikamy wewnętrznego "internal fetch" Next (który próbuje czytać .next/routes-manifest.json)
    // Budujemy bezwzględny URL na podstawie nagłówków żądania.
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const base = `${proto}://${host}`;
    const r = await fetch(`${base}/api/ai/calendar?days=30&limit=100`, { cache: 'no-store', signal: ac.signal }); // Increased limit to show more events
    clearTimeout(to);
    if (r.ok) {
      const j = await r.json().catch(() => ({} as any));
      const arr: ApiEvent[] = Array.isArray(j?.items) ? j.items : [];
      if (arr.length > 0) {
        events = arr.map<CalendarEvent>((it) => {
          const region = normalizeRegion(it.region);
          const { why, how } = educationalWhyHow(String(it.title || ''), region);
          return {
            date: String(it.date || '').slice(0, 10),
            time: String(it.time || '').slice(0, 5) || '00:00',
            region,
            event: String(it.title || '').trim(),
            importance: ((): CalendarEvent['importance'] => {
              const v = String(it.importance || '').toLowerCase();
              return v === 'high' ? 'high' : v === 'medium' ? 'medium' : 'low';
            })(),
            why,
            how,
          };
        });
      }
    }
  } catch {
    // zostaw fallback CALENDAR_7D
  }

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
          <span className="text-white/70">Kalendarz</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Kalendarz makro — 30 dni (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Zestawienie kluczowych wydarzeń makro w horyzoncie miesiąca z filtrami ważności i
            wyróżnieniem kategorii (CPI, NFP, PKB, zapasy ropy).
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
            {/* legend */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold">Legenda</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                  Ważność: niska
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                  Ważność: średnia
                </span>
                <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">
                  Ważność: wysoka
                </span>
              </div>
              <ul className="mt-3 list-disc pl-5 text-white/70 text-sm space-y-1">
                <li>Masz wgląd w najważniejsze wydarzenia i wiesz, na co zwrócić uwagę.</li>
                <li>Budujesz scenariusze warunkowe zamiast szukać „pewnych sygnałów”.</li>
                <li>Interpretujesz dane w kontekście trendu, cyklu i oczekiwań rynku.</li>
                <li>Wnioski łączysz z własnym planem działania i zarządzaniem ryzykiem.</li>
                <li>To materiały edukacyjne — bez rekomendacji inwestycyjnych.</li>
              </ul>
            </div>

            {/* interactive list with filters and categories */}
            <CalendarClient events={events} />
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
