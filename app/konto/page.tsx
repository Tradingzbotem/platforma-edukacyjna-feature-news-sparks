// app/konto/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { getProgressSummary } from "@/lib/db";
import { cookies } from "next/headers";
import { resolveTierFromCookiesAndSession, type Tier } from "@/lib/panel/access";
import FeaturedAIQuick from "@/components/dashboard/FeaturedAIQuick";
import EmotionsGauge from "@/components/dashboard/EmotionsGauge";
import MobileStickyBar from "@/components/dashboard/MobileStickyBar";
import ChallengeResults from "../account/components/ChallengeResults";

// ten widok powinien zawsze widzieć świeżą sesję
export const dynamic = 'force-dynamic';


/* ────────── małe klocki UI ────────── */
function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="rounded-2xl p-6 bg-white/5 border border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle ? (
            <div className="mt-1 text-sm text-white/60">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4 text-white/80">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
      {children}
    </span>
  );
}

/* ────────── strona ────────── */
export default async function Page() {
  // 1) pobierz sesję z iron-session (SSR)
  const session = await getSession();
  const c = await cookies();

  // 2) jeśli nie zalogowany → przekieruj na logowanie z powrotem na /konto
  if (!session.userId) {
    redirect("/logowanie?next=/konto");
  }

  // 3) bezpieczne dane do UI
  const email = String(session.email ?? "");
  const name = String(session.email ?? session.userId ?? "Nowy użytkownik")
    .split("@")[0]
    .toLowerCase();

  

  // realne statystyki z bazy (per user)
  const summary = await getProgressSummary(session.userId);
  const stats = {
    coursesDone: summary.coursesDone,
    quizzesDone: summary.quizzesDone,
    streak: 0,
    lastLogin: new Date().toLocaleDateString(),
    progress: Math.min(100, Math.round((summary.coursesDone / 100) * 100) || 0),
  };

  const now = new Date();
  const deadline = new Date();
  deadline.setUTCHours(23, 59, 0, 0);
  const deadlineLabel = `${String(deadline.getUTCHours()).padStart(2, '0')}:${String(deadline.getUTCMinutes()).padStart(2, '0')} Zulu`;

  // Panel (EDU) — pokaż aktualny tier i CTA wyboru pakietu w obrębie konta
  const tier = resolveTierFromCookiesAndSession(c, session);
  const tierLabel: 'FREE' | 'STARTER' | 'PRO' | 'ELITE' =
    tier === 'elite' ? 'ELITE' : tier === 'pro' ? 'PRO' : tier === 'starter' ? 'STARTER' : 'FREE';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* powitanie */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Cześć, {name} 👋</h2>
          {email ? <p className="mt-1 text-white/70">{email}</p> : null}
        </div>

        {/* statystyki */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Ukończone kursy" value={`${stats.coursesDone}`} />
          <Stat label="Rozwiązane quizy" value={`${stats.quizzesDone}`} />
          <Stat label="Passa (dni)" value={`${stats.streak}`} />
          <Stat label="Ostatnie logowanie" value={stats.lastLogin || "—"} />
        </div>

        {/* Featured AI (zamiast sekcji "Wróć tu dziś") */}
        <div className="mt-6">
          <FeaturedAIQuick />
        </div>

        {/* karty (przeniesione Szybkie akcje poniżej) */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <Card title="Szybkie akcje">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kursy"
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Przejdź do kursów
              </Link>
              <Link
                href="/quizy"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Rozwiąż quiz
              </Link>
              <Link
                href="/symulator"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Kalkulator pozycji
              </Link>
              <Link
                href="/news"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Szybkie info od AI
              </Link>
              <Link
                href="/challenge"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Przejdź do challengu
              </Link>
            </div>
            <div className="mt-4 text-sm text-white/60">
              Tip: zacznij od modułu <b>Podstawy</b>, a potem sprawdź się w
              10-pytaniowym quizie.
            </div>
          </Card>

          {/* Panel Rynkowy (EDU) — integracja wyboru pakietu w koncie */}
          <Card
            title="Panel rynkowy (EDU)"
            subtitle={`Twój plan: ${tierLabel}`}
            right={<Pill>{tierLabel}</Pill>}
          >
            <p className="text-sm text-white/70">
              Moduły: kalendarz 7 dni, mapy techniczne, playbooki eventowe i więcej.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/konto/panel-rynkowy"
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Wejdź do panelu
              </Link>
              <Link
                href="/konto/upgrade"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Wybierz/ulepsz pakiet
              </Link>
            </div>
          </Card>

          <Card
            title="Dostęp"
            subtitle="Masz pełny, bezpłatny dostęp do wszystkich treści i narzędzi."
            right={<Pill>FREE</Pill>}
          >
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Wszystkie kursy i lekcje.</li>
              <li>Quizy i egzaminy próbne.</li>
              <li>Materiały do pobrania i kalkulatory.</li>
              <li>Brak paywalla, brak ograniczeń.</li>
            </ul>
          </Card>

          <Card title="Sesja" subtitle="Zarządzanie zalogowaniem i kontem.">
            <div className="flex flex-wrap gap-3">
              {/* POST do API, by zniszczyć sesję po stronie serwera */}
              <form action="/api/auth/logout" method="post">
                <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                  Wyloguj
                </button>
              </form>
              <Link
                href="/konto/ustawienia"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Ustawienia konta
              </Link>
              <Link
                href="/api/auth/session"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Podgląd sesji (debug)
              </Link>
            </div>
          </Card>
        </div>

        {/* Wyniki Challenge: historia picków z Neon */}
        <div className="mt-6">
          <ChallengeResults userId={session.userId!} />
        </div>

        {/* postęp + odznaki + aktywność + prawa kolumna: emocje */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <Card
            title="Postęp w programie"
            subtitle="Szacowany progres na podstawie ukończonych sekcji."
            right={<span className="text-sm">{stats.progress}%</span>}
          >
            <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/80"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Podstawy", "w-3/4"],
                ["Forex", "w-2/3"],
                ["CFD", "w-1/2"],
                ["Zaawansowane", "w-1/3"],
              ].map(([label, width]) => (
                <div key={label as string}>
                  <div className="text-white/60">{label}</div>
                  <div className="mt-1 h-1.5 bg-white/10 rounded">
                    <div className={`h-full ${width as string} bg-white/70 rounded`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Prawa kolumna: Emocje inwestorów */}
          <div className="lg:col-span-1">
            <EmotionsGauge />
          </div>

          <Card
            title="Ostatnia aktywność"
            subtitle="Ostatnie zadania, które wykonałeś."
          >
            {summary.recentQuizResults.length === 0 ? (
              <div className="text-sm text-white/60">Brak aktywności. Rozwiąż quiz lub ukończ lekcję.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {summary.recentQuizResults.slice(0, 5).map((r, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>Quiz: {r.slug.toUpperCase()}</span>
                    <span className="text-white/60">
                      {r.score}/{r.total} · {new Date(r.at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* polecane / następne kroki */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <Card title="Polecane moduły na start">
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/kursy/podstawy"
                  className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  Podstawy inwestowania
                </Link>{" "}
                — ryzyko, dźwignia, typy zleceń, świece.
              </li>
              <li>
                <Link
                  href="/kursy/forex"
                  className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  Forex
                </Link>{" "}
                — pary walutowe, pipsy/loty, sesje, makro.
              </li>
              <li>
                <Link
                  href="/kursy/cfd"
                  className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  CFD
                </Link>{" "}
                — mechanika CFD, finansowanie overnight, indeksy i surowce.
              </li>
            </ul>
          </Card>

          <Card title="Następne kroki">
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Wybierz moduł i przerób 2–3 krótkie lekcje.</li>
              <li>Sprawdź się w 10-pytaniowym quizie.</li>
              <li>
                Dołącz do{" "}
                <Link
                  href="/forum"
                  className="underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  forum dyskusyjnego
                </Link>{" "}
                i podziel się postępami.
              </li>
            </ol>
          </Card>
        </div>

        {/* Mobile sticky bar (client) */}
        <MobileStickyBar />
      </div>
    </main>
  );
}

/* client-subcomponent for progress ring */
function ProgressRing({ value }: { value: number }) {
  const radius = 18;
  const cx = 20;
  const cy = 20;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);
  return (
    <svg width="40" height="40" role="img" aria-label={`Postęp ${clamped}%`}>
      <circle cx={cx} cy={cy} r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="none" />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#fff"
        strokeWidth="4"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#fff">{clamped}%</text>
    </svg>
  );
}
