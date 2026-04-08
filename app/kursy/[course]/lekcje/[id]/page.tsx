// app/kursy/[course]/lekcje/[id]/page.tsx

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AccessGate from '@/components/AccessGate';
import { COURSES } from '@/data/courses';
import { LESSONS, type LessonDoc } from '@/data/lessons';
import LessonBody from '@/components/LessonBody';
import LessonQuiz from '@/components/LessonQuiz';
import LessonVisitTracker from '@/components/LessonVisitTracker';
import KursyLessonProgressActions from '@/components/kursy/KursyLessonProgressActions';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function accessLabel(access: LessonDoc['access']) {
  if (access === 'public') return 'Publiczna';
  if (access === 'auth') return 'Dla zalogowanych';
  return 'Plan PRO';
}

export default async function Page({
  params,
}: {
  params: Promise<{ course: string; id: string }>;
}) {
  const { course: courseSlug, id } = await params;

  const course = (COURSES as any)[courseSlug];
  if (!course) return notFound();

  if (course.slug === 'zaawansowane') {
    if (/^lekcja-\d+$/.test(id)) {
      redirect(`/kursy/zaawansowane/${id}`);
    }
    const advLegacy: Record<string, string> = {
      'adv-01': 'lekcja-1',
      'adv-02': 'lekcja-2',
      'adv-03': 'lekcja-3',
      'adv-04': 'lekcja-4',
    };
    if (advLegacy[id]) redirect(`/kursy/zaawansowane/${advLegacy[id]}`);
    redirect('/kursy/zaawansowane');
  }

  if ((course.slug === 'forex' || course.slug === 'cfd') && /^lekcja-\d+$/.test(id)) {
    redirect(`/kursy/${course.slug}/${id}`);
  }

  const fxCfdLegacy: Record<string, Record<string, string>> = {
    forex: {
      'fx-01': 'lekcja-1',
      'fx-02': 'lekcja-2',
      'fx-03': 'lekcja-3',
      'fx-04': 'lekcja-4',
    },
    cfd: {
      'cfd-01': 'lekcja-1',
      'cfd-02': 'lekcja-2',
      'cfd-03': 'lekcja-3',
      'cfd-04': 'lekcja-4',
    },
  };
  const legacyLekcja = fxCfdLegacy[course.slug]?.[id];
  if (legacyLekcja) {
    redirect(`/kursy/${course.slug}/${legacyLekcja}`);
  }

  const lesson: LessonDoc | undefined = LESSONS[course.slug]?.[id];
  if (!lesson) return notFound();

  const order = course.lessons.map((l: any) => l.id);
  const idx = order.indexOf(lesson.id);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  const lessonPosition = idx >= 0 ? idx + 1 : null;
  const lessonTotal = order.length;

  return (
    <AccessGate required={lesson.access}>
      <LessonVisitTracker course={course.slug} lessonId={lesson.id} />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Breadcrumbs */}
        <nav aria-label="Ścieżka nawigacji" className="text-sm text-slate-400">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <Link href="/kursy" className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline">
                Kursy
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li>
              <Link
                href={`/kursy/${course.slug}`}
                className="text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {course.title}
              </Link>
            </li>
            <li className="text-slate-600" aria-hidden>
              /
            </li>
            <li className="font-medium text-white line-clamp-2" title={lesson.title}>
              {lesson.title}
            </li>
          </ol>
        </nav>

        {/* Hero lekcji */}
        <header className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2e] via-[#0d1524] to-[#0a0f18] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-3">
              {lessonPosition != null ? (
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-300/90">
                  Lekcja {lessonPosition}
                  {lessonTotal ? ` z ${lessonTotal}` : ''}
                  {course.title ? ` · ${course.title}` : ''}
                </p>
              ) : (
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-300/90">{course.title}</p>
              )}
              <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-[1.75rem] md:leading-tight">
                {lesson.title}
              </h1>
              {course.subtitle ? (
                <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-400">{course.subtitle}</p>
              ) : null}
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 sm:max-w-md sm:items-end">
              <div className="flex flex-wrap justify-end gap-2">
                {lesson.duration ? (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                    {lesson.duration}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                  {accessLabel(lesson.access)}
                </span>
              </div>
              <KursyLessonProgressActions
                course={course.slug}
                lessonId={lesson.id}
                backHref={`/kursy/${course.slug}`}
              />
            </div>
          </div>
        </header>

        {/* Treść lekcji */}
        <section aria-labelledby="lesson-content-heading" className="mt-8">
          <h2 id="lesson-content-heading" className="sr-only">
            Treść lekcji
          </h2>
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
            <LessonBody content={lesson.content} />
          </div>
        </section>

        {/* Quiz */}
        {lesson.quiz ? (
          <section aria-label="Quiz lekcji" className="mt-10">
            <LessonQuiz
              course={course.slug}
              lessonId={lesson.id}
              title={lesson.quiz.title}
              questions={lesson.quiz.questions}
            />
          </section>
        ) : null}

        {/* Nawigacja między lekcjami */}
        <nav
          aria-label="Poprzednia i następna lekcja"
          className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-h-[2.75rem] flex items-center">
            {prevId ? (
              <Link
                href={`/kursy/${course.slug}/lekcje/${prevId}`}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10 sm:w-auto"
              >
                <span className="text-slate-400 transition-colors group-hover:text-white" aria-hidden>
                  ←
                </span>
                Poprzednia lekcja
              </Link>
            ) : (
              <span className="text-sm text-slate-600">To jest pierwsza lekcja</span>
            )}
          </div>
          <div className="min-h-[2.75rem] flex items-center sm:justify-end">
            {nextId ? (
              <Link
                href={`/kursy/${course.slug}/lekcje/${nextId}`}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/35 bg-indigo-500/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-indigo-400/50 hover:bg-indigo-500/25 sm:w-auto"
              >
                Następna lekcja
                <span className="text-indigo-200 transition-colors group-hover:text-white" aria-hidden>
                  →
                </span>
              </Link>
            ) : (
              <span className="text-sm text-slate-600">To jest ostatnia lekcja modułu</span>
            )}
          </div>
        </nav>
      </div>
    </AccessGate>
  );
}
