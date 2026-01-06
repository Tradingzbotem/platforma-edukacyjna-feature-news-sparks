// app/konto/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { getProgressSummary } from "@/lib/db";
import { cookies } from "next/headers";
import { resolveTierFromCookiesAndSession, type Tier } from "@/lib/panel/access";
import MobileStickyBar from "@/components/dashboard/MobileStickyBar";
import AssetsBar from "@/components/dashboard/v2/AssetsBar";
import WatchlistLite from "@/components/dashboard/v2/WatchlistLite";
import ContinueLearningCard from "@/components/dashboard/v2/ContinueLearningCard";
import TodayBriefCard from "@/components/dashboard/v2/TodayBriefCard";
import BrokersCard from "@/components/dashboard/v2/BrokersCard";
import ToolsGrid from "@/components/dashboard/v2/ToolsGrid";

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
    <section className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle ? (
            <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 border border-slate-200">
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
    redirect("/logowanie?next=/client");
  }

  // Nowy panel po zalogowaniu: przekieruj na dashboard klienta
  redirect("/client");

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
    <main className="min-h-screen bg-transparent text-white">
      <div className="theme-konto-dark mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* powitanie */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Cześć, {name} 👋</h2>
          {email ? <p className="mt-1 text-white/60">{email}</p> : null}
        </div>

        {/* akcje globalne: tylko wyloguj (przeniesione z karty „Sesja”) */}
        {/* Usunięto lokalny przycisk wylogowania – dostępny w nagłówku */}

        {/* Rząd 1: Aktywa + Watchlist */}
        <div className="mt-6 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <AssetsBar />
          </div>
          <div className="lg:col-span-2">
            <WatchlistLite />
          </div>
        </div>

        {/* Rząd 2: Kontynuuj naukę + Dzisiejszy brief */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ContinueLearningCard />
          </div>
          <div className="lg:col-span-2">
            <TodayBriefCard />
          </div>
        </div>

        {/* Rząd 3: Brokerzy + Narzędzia */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <BrokersCard />
          <ToolsGrid />
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
      <circle cx={cx} cy={cy} r={radius} stroke="rgba(15,23,42,0.15)" strokeWidth="4" fill="none" />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="#2563eb"
        strokeWidth="4"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#0f172a">{clamped}%</text>
    </svg>
  );
}
