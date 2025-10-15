// app/kursy/egzaminy/cysec/egzamin/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { notFound } from 'next/navigation';
import ExamRunner, { type ExamQuestion } from '@/components/ExamRunner';
import * as CYSEC from '@/data/exams/cysec';

function getMeta() {
  const title = (CYSEC as any)?.title ?? 'Egzamin — CySEC';
  const questions = (CYSEC as any)?.questions as ExamQuestion[] | undefined;
  if (!Array.isArray(questions) || questions.length === 0) return null;
  return { title, questions };
}

export default function Page() {
  const meta = getMeta();
  if (!meta) return notFound();

  // normalize data shape: options -> answers (for ExamRunner)
  const normalized: ExamQuestion[] = meta.questions.map((q: any) => ({
    id: q.id,
    question: q.question,
    answers: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));

  return (
    <ExamRunner
      slug="cysec"
      title={meta.title}
      questions={normalized}
      backHref="/kursy/egzaminy/cysec"
      /* isPro domyślnie false → wersja demo; ustaw isPro={true} jeśli chcesz pełny test */
    />
  );
}
