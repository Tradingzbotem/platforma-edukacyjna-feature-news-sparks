// app/konto/panel-rynkowy/playbooki-eventowe/[slug]/page.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';
import { getPlaybookBySlug } from '@/lib/panel/playbooks';
import PlaybookDetailClient from '../PlaybookDetailClient';

type Params = { slug: string };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const c = await cookies();
  const effectiveTier = resolveTierFromCookiesAndSession(c, session);
  const unlocked = isTierAtLeast(effectiveTier, 'pro'); // PRO/ELITE

  const p = await params;
  const sp = searchParams ? await searchParams : undefined;
  const playbook = getPlaybookBySlug(p.slug);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* breadcrumbs */}
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">← Strona główna</Link>
          <span className="text-white/30">/</span>
          <Link href="/konto/panel-rynkowy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">Panel (EDU)</Link>
          <span className="text-white/30">/</span>
          <Link href="/konto/panel-rynkowy/playbooki-eventowe" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">Playbooki eventowe</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/70">{playbook ? playbook.title : 'Nie znaleziono'}</span>
        </div>

        {/* back */}
        <div className="mt-3">
          <Link href="/konto/panel-rynkowy/playbooki-eventowe" className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
            ← Wróć do listy playbooków
          </Link>
        </div>

        {!unlocked ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Zablokowane</div>
                <div className="text-sm text-white/70 mt-1">Ten moduł jest dostępny w PRO/ELITE.</div>
              </div>
              <Link
                href="/kontakt?topic=zakup-pakietu"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Ulepsz plan
              </Link>
            </div>
          </div>
        ) : playbook ? (
          <PlaybookDetailClient item={playbook} initialTab={(typeof sp?.tab === 'string' ? (sp?.tab as any) : undefined)} />
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-white/80">Nie znaleziono playbooka.</div>
          </div>
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


