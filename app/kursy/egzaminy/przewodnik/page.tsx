'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ExamTrackHero from "@/components/kursy/exam-track/ExamTrackHero";
import ExamTrackOverviewCard from "@/components/kursy/exam-track/ExamTrackOverviewCard";
import ExamTrackProgress from "@/components/kursy/exam-track/ExamTrackProgress";
import ExamTrackSidebar from "@/components/kursy/exam-track/ExamTrackSidebar";
import ExamMaterialsLibrary from "@/components/education/ExamMaterialsLibrary";
import {
  ExamTrackMaterialsPanel,
  ExamTrackPracticePanel,
} from "@/components/kursy/exam-track/ExamTrackBottomPanels";
import { parseExamBlockTitle } from "@/components/kursy/exam-track/examTrackDisplay";
import { getExamBlockMeta } from "@/lib/examTrackBlockMeta";
import { LESSONS } from "./data";

const AUTH_KEY = 'auth:pro';
const PROGRESS_KEY = 'course:egz:przewodnik:done';
const EGZAMINY_INDEX_HREF = "/kursy/egzaminy";

const examSimLinkClass =
  "group block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-200 transition-all hover:border-amber-500/20 hover:bg-amber-500/[0.04]";
const PRZEWODNIK_MATERIALS = [
  {
    title: "Checklisty regulacyjne",
    description: "KNF, ESMA, dokumenty klienta, incydenty — lista kontrolna pod audyt wewnętrzny.",
    href: "/materialy/przewodnik/checklisty",
    type: "checklist" as const,
  },
  {
    title: "Notatki skrótowe",
    description: "Jak łączy się nadzór krajowy, wytyczne UE i MiFID w jednej linii decyzyjnej.",
    href: "/materialy/przewodnik/notatki",
    type: "notes" as const,
  },
  {
    title: "Ściąga egzaminacyjna",
    description: "Ultra skrót: definicje, różnice, typowe pułapki pytań.",
    href: "/materialy/przewodnik/sciaga",
    type: "cheatsheet" as const,
  },
];

function LockOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="text-3xl">🔒</div>
      <p className="mt-2 text-center text-slate-200">Moduł dla zalogowanych (lub DEV odblokuj).</p>
      <div className="mt-3 flex gap-3">
        <Link href="/logowanie" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Zaloguj / Zarejestruj</Link>
        <button onClick={() => { localStorage.setItem(AUTH_KEY, '1'); location.reload(); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Odblokuj (DEV)</button>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [active, setActive] = useState<string>(LESSONS[0].slug);
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
    return () => { isActive = false; };
  }, [router]);

  useEffect(() => {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) setDone(JSON.parse(raw));
  }, []);

  const lesson = LESSONS.find((l) => l.slug === active)!;
  const locked = false;
  const progress = useMemo(() => Math.round(done.length / LESSONS.length * 100), [done]);
  const toggle = () => {
    const key = lesson.slug;
    const next = done.includes(key) ? done.filter((x) => x !== key) : Array.from(new Set([...done, key]));
    setDone(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  };

  const lessonIndex = LESSONS.findIndex((l) => l.slug === lesson.slug) + 1;
  const { blockLabel } = parseExamBlockTitle(lesson.title, lessonIndex);
  const blockMeta = getExamBlockMeta("przewodnik", lesson.slug);

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
        <Link href="/kursy" className="text-sm text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline">
          ← Wróć do kursów
        </Link>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <ExamTrackHero
              badge="Exam readiness"
              title="Przewodnik: KNF · ESMA · MiFID"
              subtitle="Skondensowana ścieżka pod egzamin i pracę w compliance: orientacja regulatorowa, limity, ochrona klienta i typowe pułapki testowe."
              tracksHref={EGZAMINY_INDEX_HREF}
              tracksLabel="Mapa ścieżek"
            />
          </div>
          <ExamTrackProgress percent={progress} />
        </div>

        <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          <ExamTrackSidebar
            items={LESSONS.map((l, idx) => {
              const i = idx + 1;
              const { blockLabel: bl, displayTitle: dt } = parseExamBlockTitle(l.title, i);
              return {
                key: l.slug,
                blockLabel: bl,
                title: dt,
                minutes: l.minutes,
                done: done.includes(l.slug),
                active: l.slug === active,
                onSelect: () => setActive(l.slug),
              };
            })}
          />

          <div className="relative space-y-8">
            <ExamTrackOverviewCard
              eyebrow="Przewodnik regulacyjny"
              blockLabel={blockLabel}
              title={lesson.title}
              durationLabel={`${lesson.minutes} min`}
              meta={blockMeta}
              actions={
                <button
                  type="button"
                  onClick={toggle}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity ${
                    done.includes(lesson.slug)
                      ? "bg-emerald-400/90 text-slate-900 hover:opacity-90"
                      : "border border-white/15 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                  }`}
                  title={
                    done.includes(lesson.slug)
                      ? "Cofnij status zaliczenia"
                      : "Oznacz moduł jako opanowany"
                  }
                >
                  {done.includes(lesson.slug) ? "✓ Zaliczone" : "Oznacz jako zaliczone"}
                </button>
              }
              lockOverlay={<LockOverlay show={locked} />}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <ExamTrackMaterialsPanel>
                <ExamMaterialsLibrary items={PRZEWODNIK_MATERIALS} />
              </ExamTrackMaterialsPanel>
              <ExamTrackPracticePanel
                title="Symulacje egzaminu"
                description="Pięć wersji testów po 20 pytań: wyjaśnienia, wyniki, powtarzalne scenariusze."
              >
                <div className="space-y-2">
                  <Link href="/kursy/egzaminy/przewodnik/egzamin?v=1" className={examSimLinkClass}>
                    <span className="font-medium text-white group-hover:text-amber-100/95">Wersja 1</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Podstawy regulacyjne</span>
                  </Link>
                  <Link href="/kursy/egzaminy/przewodnik/egzamin?v=2" className={examSimLinkClass}>
                    <span className="font-medium text-white group-hover:text-amber-100/95">Wersja 2</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Ochrona klienta i testy</span>
                  </Link>
                  <Link href="/kursy/egzaminy/przewodnik/egzamin?v=3" className={examSimLinkClass}>
                    <span className="font-medium text-white group-hover:text-amber-100/95">Wersja 3</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Marketing i compliance</span>
                  </Link>
                  <Link href="/kursy/egzaminy/przewodnik/egzamin?v=4" className={examSimLinkClass}>
                    <span className="font-medium text-white group-hover:text-amber-100/95">Wersja 4</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Best execution i konflikty</span>
                  </Link>
                  <Link href="/kursy/egzaminy/przewodnik/egzamin?v=5" className={examSimLinkClass}>
                    <span className="font-medium text-white group-hover:text-amber-100/95">Wersja 5</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Materiały i egzamin</span>
                  </Link>
                </div>
              </ExamTrackPracticePanel>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
