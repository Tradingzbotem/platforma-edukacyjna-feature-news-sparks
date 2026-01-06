// app/konto/plan/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { resolveTierFromCookiesAndSession, type Tier } from "@/lib/panel/access";

export const dynamic = 'force-dynamic';

function PlanBadge({ tier }: { tier: Tier }) {
  const label = tier === 'elite' ? 'ELITE' : tier === 'pro' ? 'PRO' : tier === 'starter' ? 'STARTER' : 'FREE';
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs">
      <span className="opacity-70">Plan</span>
      <strong>{label}</strong>
    </span>
  );
}

export default async function Page() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/logowanie?next=/konto/plan");
  }
  const c = await cookies();
  const tier = resolveTierFromCookiesAndSession(c, session);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href="/client" className="text-sm text-white/70 hover:text-white">
            ← Powrót do panelu
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Mój plan</h1>
              <p className="mt-1 text-white/70">
                Poniżej znajdziesz status Twojej subskrypcji oraz funkcje w ramach planu.
              </p>
            </div>
            <PlanBadge tier={tier} />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Status</div>
            <div className="mt-1 text-sm text-white/80">
              {tier === 'elite' && <>Masz aktywny plan ELITE. Masz dostęp do wszystkich modułów.</>}
              {tier === 'pro' && <>Masz aktywny plan PRO. Część modułów premium jest odblokowana.</>}
              {tier === 'starter' && <>Masz aktywny plan STARTER. Podstawowe moduły są odblokowane.</>}
              {tier === 'free' && <>Korzystasz z planu FREE. Rozważ upgrade, aby odblokować więcej.</>}
            </div>
          </div>

          {/* Szybki dostęp do treści planu */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">Dostępne w Twoim planie</div>
              <Link
                href="/konto/panel-rynkowy"
                className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:opacity-90"
              >
                Otwórz Panel (EDU)
              </Link>
            </div>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
              {(tier === 'starter' || tier === 'pro' || tier === 'elite') && (
                <>
                  <li>
                    <Link href="/konto/panel-rynkowy/kalendarz-7-dni" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Kalendarz 7 dni
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/scenariusze-abc" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Scenariusze A/B/C
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/checklisty" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Checklisty
                    </Link>
                  </li>
                </>
              )}
              {(tier === 'pro' || tier === 'elite') && (
                <>
                  <li>
                    <Link href="/konto/panel-rynkowy/mapy-techniczne" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Mapy techniczne (EDU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/playbooki-eventowe" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Playbooki eventowe
                    </Link>
                  </li>
                </>
              )}
              {tier === 'elite' && (
                <>
                  <li>
                    <Link href="/konto/panel-rynkowy/coach-ai" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Coach AI (EDU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/raport-miesieczny" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Raport miesięczny (EDU)
                    </Link>
                  </li>
                </>
              )}
              {tier === 'free' && (
                <li className="text-white/70">Brak aktywnego planu — wybierz plan, aby zobaczyć dostępne moduły.</li>
              )}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Zarządzanie</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/client#plany"
                className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Zmień/wybierz plan
              </Link>
              <Link
                href={`/kontakt?topic=zakup-pakietu&plan=${encodeURIComponent(tier === 'free' ? 'pro' : tier)}`}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                Skontaktuj się w sprawie zakupu
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid md:grid-cols-3">
              <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                <div className="text-sm font-semibold text-white/90">Egzaminy i certyfikaty</div>
                <div className="mt-1 text-xs text-white/70">
                  Pełne testy i certyfikaty dostępne w PRO/ELITE.
                </div>
              </div>
              <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                <div className="text-sm font-semibold text-white/90">Panel rynkowy</div>
                <div className="mt-1 text-xs text-white/70">
                  Scenariusze, mapy techniczne, raporty. Najwięcej w ELITE.
                </div>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold text-white/90">AI Coach</div>
                <div className="mt-1 text-xs text-white/70">
                  Dostępny w planie ELITE (wersja edukacyjna).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


