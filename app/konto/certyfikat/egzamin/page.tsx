import Link from 'next/link';
import { redirect } from 'next/navigation';

import ExamEntryClient from '@/app/konto/certyfikat/egzamin/ExamEntryClient';
import { CERT_EXAM_V1_TIME_LIMIT_MINUTES } from '@/lib/certification-exam/constants';
import { getInProgressExamAttemptForUser, getUserExamLandingStats } from '@/lib/certification-exam/service';
import { PUBLIC_CERT_FXEDULAB_PATH } from '@/lib/certifications/publicCertInfoPath';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function ReadinessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/42">{label}</dt>
      <dd className="m-0 text-sm font-medium text-white/88 sm:text-right">{value}</dd>
    </div>
  );
}

export default async function CertificationExamLandingPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect('/logowanie?next=/konto/certyfikat/egzamin');
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    redirect(`${PUBLIC_CERT_FXEDULAB_PATH}#jak-dziala-egzamin`);
  }

  const prisma = getPrisma();
  const dbOk = Boolean(prisma);

  let examStats: Awaited<ReturnType<typeof getUserExamLandingStats>> = null;
  if (dbOk) {
    const inProgress = await getInProgressExamAttemptForUser(session.userId);
    if (inProgress?.status === 'IN_PROGRESS') {
      redirect(`/konto/certyfikat/egzamin/${encodeURIComponent(inProgress.id)}`);
    }
    examStats = await getUserExamLandingStats(session.userId);
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/konto/certyfikat" className="text-sm text-white/55 transition hover:text-white">
          ← Certyfikat FXEDULAB
        </Link>
        <Link href="/client" className="text-sm text-white/45 transition hover:text-white/70">
          Panel →
        </Link>
      </div>

      {/* 1. Hero — centralny kafelek wejścia */}
      <section className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0a0c10] via-slate-950 to-black px-6 py-10 text-center shadow-[0_0_64px_-22px_rgba(245,158,11,0.32)] sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(251,191,36,0.1),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-amber-500/[0.07] blur-3xl"
        />
        <div className="relative">
          <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-[2rem]">
            Egzamin certyfikacyjny FXEDULAB
          </h1>
        </div>
      </section>

      <ExamEntryClient dbOk={dbOk} />

      {/* 3. Informacje — grid 2 kolumny (desktop), status na pełną szerokość */}
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6 lg:items-stretch">
          <section className="flex h-full flex-col rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.045] to-white/[0.02] px-5 py-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Zanim rozpoczniesz</p>
            <ul className="mt-5 flex flex-1 flex-col space-y-3.5 text-sm leading-relaxed text-white/70">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500/55" aria-hidden />
                <span>
                  Jedno uruchomione podejście to jedna sesja egzaminacyjna. Po wysłaniu odpowiedzi nie edytujesz ich w ramach
                  tego samego startu.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500/55" aria-hidden />
                <span>Wynik i status są zapisywane w systemie i przypisywane do Twojego konta.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500/55" aria-hidden />
                <span>To nie jest quiz edukacyjny. W trakcie sesji nie ma podpowiedzi ani materiałów pomocniczych.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500/55" aria-hidden />
                <span>
                  Zarezerwuj ok. {CERT_EXAM_V1_TIME_LIMIT_MINUTES} minut oraz stabilne środowisko. Wymagana jest ciągła
                  koncentracja.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-500/55" aria-hidden />
                <span>Certyfikat przysługuje wyłącznie po pozytywnym zaliczeniu zgodnie z regułami aktywnej ścieżki.</span>
              </li>
            </ul>
          </section>

          <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-7 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Twoja gotowość</p>
            <p className="mt-2 text-xs text-white/48">Podgląd statusu — dane mogą ulec rozszerzeniu w kolejnych wersjach modułu.</p>
            <dl className="mt-5 flex flex-1 flex-col">
              <ReadinessRow label="Status wiedzy" value="Brak oceny" />
              <ReadinessRow label="Ukończone moduły" value="Niezweryfikowane" />
              <ReadinessRow label="Ostatnia aktywność" value="brak" />
              <ReadinessRow label="Rekomendacja" value="Możesz podejść do egzaminu" />
            </dl>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.09] via-[#0c0e12] to-black px-5 py-7 shadow-[0_0_56px_-24px_rgba(245,158,11,0.3)] sm:px-8 lg:col-span-2">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
            />
            <div className="relative lg:mx-auto lg:max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400/85">Status egzaminu</p>
              <p className="mt-2 text-xs text-white/48">
                Łącznie ze wszystkich ścieżek przypisanych do konta (wybór ścieżki powyżej nie zmienia tego podsumowania).
              </p>
              <dl className="mt-5 space-y-0">
                <ReadinessRow
                  label="Liczba podejść"
                  value={examStats ? String(examStats.totalAttempts) : '—'}
                />
                <ReadinessRow label="Ostatni wynik" value={examStats?.lastResultLabel ?? '—'} />
                <ReadinessRow label="Status" value={examStats?.statusLabel ?? '—'} />
                <ReadinessRow label="Próba aktywna" value={examStats?.activeAttemptLabel ?? '—'} />
              </dl>
              <p className="mt-5 border-t border-amber-500/15 pt-4 text-xs leading-relaxed text-white/52">
                Po rozpoczęciu egzaminu sesja zostaje przypisana do konta.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
