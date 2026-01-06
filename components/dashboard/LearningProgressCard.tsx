'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { COURSES_LIST } from '@/data/courses';

type CourseProgress = {
  courseSlug: string;
  courseTitle: string;
  courseSubtitle?: string;
  total: number;
  done: number;
  percent: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
  nextLessonDuration?: string;
  firstLessonId?: string;
  lastCompletedId?: string;
  lastCompletedTitle?: string;
  remainingMinutes?: number;
  upcomingTitles?: string[];
};

function readDoneForCourse(courseSlug: string, lessonIds: string[]): Set<string> {
  const set = new Set<string>();
  if (typeof window === 'undefined') return set;
  try {
    for (const id of lessonIds) {
      const k = `progress:${courseSlug}:${id}`;
      const v = localStorage.getItem(k);
      if (v === '1') set.add(id);
    }
  } catch {}
  return set;
}

function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 0;
  // Supported formats: "MM:SS" or "H:MM:SS"
  const parts = duration.split(':').map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) {
    const [m, s] = parts;
    return m + Math.round((s || 0) / 60);
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 60 + m + Math.round((s || 0) / 60);
  }
  return 0;
}

function computeProgress(): CourseProgress[] {
  return COURSES_LIST.map((c) => {
    const ids = c.lessons.map((l) => l.id);
    const doneSet = readDoneForCourse(c.slug, ids);
    const done = ids.filter((id) => doneSet.has(id)).length;
    const total = ids.length || 1;
    const firstLessonId = ids[0];
    const nextLessonId = ids.find((id) => !doneSet.has(id));
    const nextLesson = c.lessons.find((l) => l.id === nextLessonId);
    const nextLessonTitle = nextLesson?.title;
    const nextLessonDuration = nextLesson?.duration;

    const lastCompletedId = [...ids].reverse().find((id) => doneSet.has(id));
    const lastCompletedTitle = c.lessons.find((l) => l.id === lastCompletedId)?.title;

    // Remaining time (sum of durations from next lesson to end)
    const startIndex = nextLessonId ? ids.indexOf(nextLessonId) : -1;
    const remainingMinutes =
      startIndex >= 0
        ? c.lessons
            .slice(startIndex)
            .reduce((acc, l) => acc + parseDurationToMinutes(l.duration), 0)
        : 0;

    // Upcoming 2 lesson titles
    const upcomingTitles =
      startIndex >= 0
        ? c.lessons.slice(startIndex, startIndex + 2).map((l) => l.title || 'Lekcja')
        : [];

    const percent = Math.round((done / total) * 100);
    return {
      courseSlug: c.slug,
      courseTitle: c.title,
      courseSubtitle: c.subtitle,
      total,
      done,
      percent,
      nextLessonId,
      nextLessonTitle,
      nextLessonDuration,
      firstLessonId,
      lastCompletedId,
      lastCompletedTitle,
      remainingMinutes,
      upcomingTitles,
    };
  });
}

export default function LearningProgressCard() {
  const [stamp, setStamp] = useState(0);
  const [list, setList] = useState<CourseProgress[]>(() => computeProgress());

  useEffect(() => {
    setList(computeProgress());
  }, [stamp]);

  // Simple refresh when window regains focus (progress may change on other pages)
  useEffect(() => {
    const onFocus = () => setStamp((v) => v + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const target = useMemo(() => {
    const incomplete = list.find((p) => p.done < p.total);
    return incomplete ?? list[0];
  }, [list]);

  if (!target) return null;

  const width = `${Math.max(0, Math.min(100, target.percent))}%`;
  const nextHref = target.nextLessonId
    ? `/kursy/${target.courseSlug}/lekcje/${target.nextLessonId}`
    : `/kursy/${target.courseSlug}`;
  const overviewHref = `/kursy/${target.courseSlug}`;
  const restartHref = target.firstLessonId
    ? `/kursy/${target.courseSlug}/lekcje/${target.firstLessonId}`
    : overviewHref;
  const repeatHref = target.lastCompletedId
    ? `/kursy/${target.courseSlug}/lekcje/${target.lastCompletedId}`
    : overviewHref;
  const remainingLabel =
    typeof target.remainingMinutes === 'number' && target.remainingMinutes > 0
      ? `~${target.remainingMinutes} min do końca`
      : 'Kurs ukończony';

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Kontynuuj naukę</h2>
          <p className="mt-1 text-xs text-white/60">
            {target.courseSubtitle || 'Wróć do ostatnio przerabianych treści.'}
          </p>
        </div>
        <span className="inline-flex items-center h-6 px-2 rounded-md border border-white/15 bg-white/10 text-[11px] text-white/80">
          {target.courseTitle}
        </span>
      </div>

      <div className="mt-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 min-w-0">
          <div className="text-sm text-white/70">
            {target.nextLessonTitle ? (
              <div className="min-w-0">
                <span className="text-white/80">Następna:</span>{' '}
                <span className="font-medium break-words">{target.nextLessonTitle}</span>
                {target.nextLessonDuration ? (
                  <span className="ml-2 text-white/50">({target.nextLessonDuration})</span>
                ) : null}
              </div>
            ) : (
              <div>Kurs ukończony — możesz powtórzyć materiał.</div>
            )}
            <div className="mt-1 text-xs">{remainingLabel}</div>
          </div>

          <div
            className="mt-3 h-2 rounded bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={target.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Postęp w kursie ${target.courseTitle}`}
          >
            <div
              className="h-2 rounded bg-gradient-to-r from-white/80 via-white to-white/80 transition-[width] duration-500"
              style={{ width }}
            />
          </div>
          <div className="mt-2 text-xs text-white/70">
            {target.done}/{target.total} • {target.percent}%
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={nextHref}
              className="px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
            >
              {target.nextLessonId ? 'Kontynuuj naukę' : 'Przejdź do kursu'}
            </Link>
            <Link href={overviewHref} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              Spis treści
            </Link>
            <Link href="/kursy" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              Wszystkie kursy
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-white/60 break-words">
            <Link href={repeatHref} className="underline hover:opacity-80">Powtórz ostatnią lekcję</Link>
            <span className="mx-1">•</span>
            <Link href={restartHref} className="underline hover:opacity-80">Zacznij od początku</Link>
          </div>

          <div className="mt-5 text-xs text-white/60">Nadchodzące</div>
          <ul className="mt-2 space-y-2">
            {(target.upcomingTitles && target.upcomingTitles.length > 0 ? target.upcomingTitles : ['Brak—kurs ukończony']).map((t, i) => (
              <li key={i} className="text-sm text-white/80 flex items-center gap-2 min-w-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                <span className="break-words">{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-lg font-semibold text-white/90">{target.percent}%</div>
              <div className="text-[11px] text-white/60">Postęp</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-lg font-semibold text-white/90">
                {typeof target.remainingMinutes === 'number' ? Math.max(0, target.remainingMinutes) : 0}m
              </div>
              <div className="text-[11px] text-white/60">Pozostało</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


