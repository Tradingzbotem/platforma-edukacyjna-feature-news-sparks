import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import type { ChallengeItem } from "@/components/challenge/ChallengeClient";
import ChallengeLead from './components/ChallengeLead';
import ChallengeHelp from './components/ChallengeHelp';
import ChallengeGrid from './components/ChallengeGrid';
import ChallengeXPBar from './components/ChallengeXPBar';
import YourPicks from './components/YourPicks';
import ChallengeResetPanel from './components/ChallengeResetPanel';


export const dynamic = 'force-dynamic';

async function fetchWeeklyItems(): Promise<ChallengeItem[]> {
  try {
    // Server Component: względne ścieżki do API działają w Next.js
    const res = await fetch(`/api/challenge/events/ai`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const events = Array.isArray(json?.events) ? json.events : [];
    const items: ChallengeItem[] = events.map((e: any) => {
      const date: string = String(e?.date || '');
      const deadline = date ? `${date}T23:59:00Z` : undefined; // 23:59 Zulu danego dnia
      return {
        id: String(e?.id || Math.random().toString(36).slice(2)),
        title: String(e?.title || 'Wyzwanie'),
        instrument: String(e?.instrument || '—'),
        window: String(e?.window || date || 'W tym tygodniu'),
        note: e?.note ? String(e.note) : undefined,
        deadline,
      } satisfies ChallengeItem;
    });
    return items;
  } catch {
    // Fallback: prosta lista na dziś
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, '0');
    const d = String(today.getUTCDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${d}`;
    const deadline = `${isoDate}T23:59:00Z`;
    const fallback: ChallengeItem[] = [
      { id: 'us100_open', title: 'US100 — sesja USA', instrument: 'US100 (NAS100)', window: 'Dziś 15:30', deadline },
      { id: 'xau_48h', title: 'XAUUSD — 48h', instrument: 'Złoto (XAUUSD)', window: 'Dziś–Jutro 48h', deadline },
      { id: 'wti_eod', title: 'Ropa WTI — EOD', instrument: 'WTI (OIL.WTI)', window: 'Dziś 22:00', deadline },
    ];
    return fallback;
  }
}

export default async function Page() {
  // auth guard: tylko zalogowani
  const session = await getSession();
  if (!session.userId) {
    redirect('/logowanie?next=/challenge');
  }

  const items = await fetchWeeklyItems();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <ChallengeLead />
        <ChallengeHelp />
        <div className="mt-10">
          <ChallengeGrid userId={session.userId} />
        </div>
        <ChallengeXPBar />
        <YourPicks />
        <ChallengeResetPanel />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* stary lead usunięty – zastępuje go <ChallengeLead /> */}
        {/*
          TODO: stare karty wyłączone na czas migracji do nowej siatki 12
          <div className="mt-6">
            <ChallengeClient items={items} />
          </div>
        */}

        <div className="mt-8">
          <Link href="/client" className="underline underline-offset-4 decoration-white/30 hover:decoration-white/60 text-white/70 hover:text-white">
            Wróć do konta
          </Link>
        </div>
      </div>
      {/* test panel usunięty w PROD */}
    </main>
  );
}
