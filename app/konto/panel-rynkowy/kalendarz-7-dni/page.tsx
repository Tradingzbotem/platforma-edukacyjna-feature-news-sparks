// app/konto/panel-rynkowy/kalendarz-7-dni/page.tsx — Moduł: Kalendarz 7 dni (EDU)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { CALENDAR_7D, type CalendarEvent } from '@/lib/panel/calendar7d';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';

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
          <span className="text-white/70">Kalendarz 7 dni</span>
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Kalendarz 7 dni (EDU)</h1>
          <p className="mt-2 text-white/80 max-w-3xl">
            Zestawienie kluczowych wydarzeń makro na najbliższy tydzień. Pomaga przygotować scenariusze,
            zrozumieć, co bywa ważne dla rynku i gdzie mogą pojawić się większe ruchy — bez „sygnałów”
            i bez rekomendacji inwestycyjnych.
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

            {/* list */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {CALENDAR_7D.map((ev, idx) => (
                <article key={`${ev.date}-${ev.time}-${idx}`} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/70">
                      <div className="font-semibold text-white/80">{ev.date} · {ev.time}</div>
                      <div className="mt-0.5">{ev.region}</div>
                    </div>
                    {importanceBadge(ev.importance)}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{ev.event}</h3>
                  <div className="mt-2 text-sm text-white/80">
                    <div className="font-semibold">Dlaczego to ważne</div>
                    <p className="mt-1">{ev.why}</p>
                  </div>
                  <div className="mt-2 text-sm text-white/80">
                    <div className="font-semibold">Jak rynek często reaguje</div>
                    <p className="mt-1">{ev.how}</p>
                  </div>
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
