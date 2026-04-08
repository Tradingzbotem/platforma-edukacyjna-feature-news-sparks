'use client';

import ExamCTA from '@/components/ExamCTA';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ExamTrackHero from '@/components/kursy/exam-track/ExamTrackHero';
import ExamTrackOverviewCard from '@/components/kursy/exam-track/ExamTrackOverviewCard';
import ExamTrackProgress from '@/components/kursy/exam-track/ExamTrackProgress';
import ExamTrackSidebar from '@/components/kursy/exam-track/ExamTrackSidebar';
import ExamMaterialsLibrary from '@/components/education/ExamMaterialsLibrary';
import {
  ExamTrackMaterialsPanel,
  ExamTrackPracticePanel,
} from '@/components/kursy/exam-track/ExamTrackBottomPanels';
import { parseExamBlockTitle } from '@/components/kursy/exam-track/examTrackDisplay';
import { getExamBlockMeta } from '@/lib/examTrackBlockMeta';
import { LESSONS } from './data';

const AUTH_KEY = 'auth:pro';
const PROGRESS_KEY = 'course:egz:cysec:done';
const EGZAMINY_INDEX_HREF = '/kursy/egzaminy';

type LessonItem = {
  id: string;
  title: string;
  minutes?: number;
  free?: boolean;
  content?: ReactNode | string;
};

const LESSON_LIST = LESSONS as unknown as LessonItem[];

const CYSEC_MATERIALS = [
  {
    title: 'Checklisty compliance CIF',
    description: 'Licencja, kapitał, funkcje kontrolne, outsourcing, skargi klientów — operacyjnie.',
    href: '/materialy/cysec/checklisty',
    type: 'checklist' as const,
  },
  {
    title: 'Notatki CySEC / CIF',
    description: 'Circulars, CFD/marketing, governance — co egzamin lubi powtórzyć.',
    href: '/materialy/cysec/notatki',
    type: 'notes' as const,
  },
  {
    title: 'Ściąga CySEC',
    description: 'Szybkie hasła i wzorce pod test w środowisku cypryjskim.',
    href: '/materialy/cysec/sciaga',
    type: 'cheatsheet' as const,
  },
];

const primaryCtaClass =
  'inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-amber-500/25 hover:bg-amber-500/[0.08]';

function Lock({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="text-3xl">🔒</div>
      <p className="mt-2 text-slate-200">Dostęp po zalogowaniu.</p>
      <div className="mt-3 flex gap-3">
        <Link
          href="/logowanie"
          className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
        >
          Zaloguj / Zarejestruj
        </Link>
        <button
          onClick={() => {
            localStorage.setItem(AUTH_KEY, '1');
            location.reload();
          }}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          title="Przycisk testowy w dev"
        >
          Odblokuj (DEV)
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const firstId = LESSON_LIST[0]?.id ?? 'intro';
  const [active, setActive] = useState<string>(firstId);
  const [done, setDone] = useState<string[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          if (isActive) router.push('/logowanie');
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!Boolean((data as { isLoggedIn?: boolean })?.isLoggedIn)) {
          if (isActive) router.push('/logowanie');
          return;
        }
        if (isActive) setIsAuthChecked(true);
      } catch {
        if (isActive) router.push('/logowanie');
      }
    })();
    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignorujemy błędy parsowania z localStorage (dev)
    }
  }, []);

  const l =
    useMemo(() => LESSON_LIST.find((x) => x.id === active) ?? LESSON_LIST[0], [active]) ?? {
      id: 'intro',
      title: 'Wprowadzenie',
      minutes: 0,
      free: true,
      content: null,
    };

  const locked = false;

  const progress = useMemo(() => {
    const total = LESSON_LIST.length || 1;
    return Math.round((done.length / total) * 100);
  }, [done]);

  const toggleDone = () => {
    const next = done.includes(l.id)
      ? done.filter((x) => x !== l.id)
      : Array.from(new Set([...done, l.id]));
    setDone(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  };

  const lessonIndex = LESSON_LIST.findIndex((x) => x.id === l.id) + 1;
  const { blockLabel } = parseExamBlockTitle(l.title, lessonIndex);
  const blockMeta = getExamBlockMeta('cysec', l.id);

  const durationLabel = typeof l.minutes === 'number' ? `${l.minutes} min` : undefined;

  if (!isAuthChecked) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">Sprawdzanie dostępu...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-6 md:p-8 animate-fade-in">
        <Link
          href="/kursy"
          className="text-sm text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          ← Wróć do kursów
        </Link>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <ExamTrackHero
              badge="Compliance"
              title="CySEC — ścieżka CIF"
              subtitle="Przygotowanie pod nadzór cypryjski i praktykę w firmach inwestycyjnych: CIF, marketing CFD, outsourcing i obsługa skarg w modelu compliance."
              tracksHref={EGZAMINY_INDEX_HREF}
              tracksLabel="Mapa ścieżek"
            />
          </div>
          <ExamTrackProgress percent={Math.min(100, progress)} />
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm leading-relaxed text-slate-200">
          <p className="font-semibold text-white">To nie jest kurs.</p>
          <p className="mt-1 text-slate-300">
            To jest przygotowanie i symulacja egzaminu regulacyjnego.
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          <ExamTrackSidebar
            items={LESSON_LIST.map((m, idx) => {
              const i = idx + 1;
              const { blockLabel: bl, displayTitle: dt } = parseExamBlockTitle(m.title, i);
              return {
                key: m.id,
                blockLabel: bl,
                title: dt,
                minutes: typeof m.minutes === 'number' ? m.minutes : undefined,
                done: done.includes(m.id),
                active: m.id === active,
                onSelect: () => setActive(m.id),
              };
            })}
          />

          <div className="relative space-y-8">
            <ExamTrackOverviewCard
              eyebrow="Cyprus Investment Firms"
              blockLabel={blockLabel}
              title={l.title}
              durationLabel={durationLabel}
              meta={blockMeta}
              actions={
                <button
                  type="button"
                  onClick={toggleDone}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity ${
                    done.includes(l.id)
                      ? 'bg-emerald-400/90 text-slate-900 hover:opacity-90'
                      : 'border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
                  }`}
                  title={
                    done.includes(l.id) ? 'Cofnij status zaliczenia' : 'Oznacz moduł jako opanowany'
                  }
                >
                  {done.includes(l.id) ? '✓ Zaliczone' : 'Oznacz jako zaliczone'}
                </button>
              }
              lockOverlay={<Lock show={locked} />}
            >
              {l.content ?? null}
            </ExamTrackOverviewCard>

            <div className="grid gap-6 md:grid-cols-2">
              <ExamTrackMaterialsPanel>
                <ExamMaterialsLibrary items={CYSEC_MATERIALS} />
              </ExamTrackMaterialsPanel>
              <ExamTrackPracticePanel
                title="Egzamin próbny"
                description="Dwadzieścia pytań z case’ami marketingowymi, governance i ochroną klienta — format zbliżony do rzeczywistych testów wewnętrznych."
              >
                <Link href="/kursy/egzaminy/cysec/egzamin" className={primaryCtaClass}>
                  Uruchom symulację
                </Link>
              </ExamTrackPracticePanel>
            </div>
          </div>
        </div>

        <ExamCTA
          slug="cysec"
          className="rounded-2xl border border-white/10 bg-[#0b1220] px-5 py-5 md:px-6"
        />
      </div>
    </main>
  );
}
