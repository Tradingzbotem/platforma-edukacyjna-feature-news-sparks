// app/kursy/egzaminy/knf/egzamin/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { notFound } from 'next/navigation';
import ExamRunner, { type ExamQuestion } from '@/components/ExamRunner';
import AccessGuard from '@/app/components/AccessGuard';
import * as KNF from '@/data/exams/knf';

function getMeta() {
  const title = (KNF as any)?.title ?? 'Egzamin — KNF';
  const questions = (KNF as any)?.questions as ExamQuestion[] | undefined;
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
    hint: q.hint,
  }));

  return (
    <AccessGuard required="auth">
      <ExamRunner
        slug="knf"
        title={meta.title}
        questions={normalized}
        backHref="/kursy/egzaminy/knf"
        isPro={true}
        durationMinutes={20}
        description="Egzamin sprawdzający wiedzę z zakresu regulacji KNF, ryzyka, kosztów i dobrych praktyk zgodnie z wymogami MiFID II. Obejmuje testy adekwatności, ochronę klienta oraz zarządzanie ryzykiem."
      />
    </AccessGuard>
  );
}
