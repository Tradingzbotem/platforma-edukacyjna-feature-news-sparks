// app/kursy/[course]/lekcje/[id]/page.tsx
// Import klientowego LessonProgress jako *default* (nie named)

import { notFound } from 'next/navigation';
import AccessGate from '@/components/AccessGate';
import { COURSES } from '@/data/courses';
import { LESSONS, type LessonDoc } from '@/data/lessons';
import LessonBody from '@/components/LessonBody';
import LessonQuiz from '@/components/LessonQuiz';
import LessonProgress from '@/components/LessonProgress'; // 👈 WAŻNE: default import

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{ course: string; id: string }>;
}) {
  const { course: courseSlug, id } = await params;

  const course = (COURSES as any)[courseSlug];
  if (!course) return notFound();

  const lesson: LessonDoc | undefined = LESSONS[course.slug]?.[id];
  if (!lesson) return notFound();

  const order = course.lessons.map((l: any) => l.id);
  const idx = order.indexOf(lesson.id);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;

  return (
    <AccessGate required={lesson.access}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* breadcrumbs */}
        <nav className="text-sm opacity-70">
          <a href="/kursy" className="underline">Kursy</a>
          <span> / </span>
          <a href={`/kursy/${course.slug}`} className="underline">{course.title}</a>
          <span> / </span>
          <span className="opacity-100">{lesson.title}</span>
        </nav>

        {/* nagłówek */}
        <header className="mt-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
            <div className="flex items-center gap-2">
              {lesson.duration && <span className="text-xs rounded-full border px-2 py-0.5">{lesson.duration}</span>}
              <span className="text-xs rounded-full border px-2 py-0.5">
                {lesson.access === 'public' ? 'PUBLIC' : lesson.access.toUpperCase()}
              </span>
              <LessonProgress course={course.slug} id={lesson.id} />
            </div>
          </div>
          {course.subtitle && <p className="mt-1 opacity-80">{course.subtitle}</p>}
        </header>

        {/* treść */}
        <div className="mt-6">
          <LessonBody content={lesson.content} />
        </div>

        {/* quiz (opcjonalny) */}
        {lesson.quiz && (
          <LessonQuiz
            course={course.slug}
            lessonId={lesson.id}
            title={lesson.quiz.title}
            questions={lesson.quiz.questions}
          />
        )}

        {/* nawigacja */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            {prevId ? (
              <a href={`/kursy/${course.slug}/lekcje/${prevId}`} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50">
                ← Poprzednia
              </a>
            ) : <span />}
          </div>
          <div>
            {nextId ? (
              <a href={`/kursy/${course.slug}/lekcje/${nextId}`} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50">
                Następna →
              </a>
            ) : <span />}
          </div>
        </div>
      </div>
    </AccessGate>
  );
}
