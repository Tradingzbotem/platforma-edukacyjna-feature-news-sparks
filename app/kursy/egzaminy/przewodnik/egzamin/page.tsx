// app/kursy/egzaminy/przewodnik/egzamin/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { notFound } from 'next/navigation';
import ExamRunner, { type ExamQuestion } from '@/components/ExamRunner';
import AccessGuard from '@/app/components/AccessGuard';
import * as PRZEWODNIK from '@/data/exams/przewodnik';

function getMeta(version?: string) {
  let title: string;
  let questions: ExamQuestion[];

  switch (version) {
    case '1':
    case 'v1':
      title = PRZEWODNIK.versions.v1.title;
      questions = PRZEWODNIK.versions.v1.questions;
      break;
    case '2':
    case 'v2':
      title = PRZEWODNIK.versions.v2.title;
      questions = PRZEWODNIK.versions.v2.questions;
      break;
    case '3':
    case 'v3':
      title = PRZEWODNIK.versions.v3.title;
      questions = PRZEWODNIK.versions.v3.questions;
      break;
    case '4':
    case 'v4':
      title = PRZEWODNIK.versions.v4.title;
      questions = PRZEWODNIK.versions.v4.questions;
      break;
    case '5':
    case 'v5':
      title = PRZEWODNIK.versions.v5.title;
      questions = PRZEWODNIK.versions.v5.questions;
      break;
    default:
      // Domyślnie wersja 1
      title = PRZEWODNIK.versions.v1.title;
      questions = PRZEWODNIK.versions.v1.questions;
  }

  if (!Array.isArray(questions) || questions.length === 0) return null;
  return { title, questions };
}

export default function Page({
  searchParams,
}: {
  searchParams?: { v?: string };
}) {
  const version = searchParams?.v;
  const meta = getMeta(version);
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

  // Opis w zależności od wersji
  const descriptions: Record<string, string> = {
    v1: 'Egzamin sprawdzający podstawową wiedzę z zakresu regulacji KNF, ESMA i MiFID II. Obejmuje podstawowe pojęcia, dokumenty klienta oraz wymogi informacyjne.',
    v2: 'Egzamin skupiający się na ochronie klienta, testach adekwatności i odpowiedniości, oraz wymogach dotyczących kategoryzacji klientów i ujawniania kosztów.',
    v3: 'Egzamin dotyczący marketingu i compliance. Sprawdza wiedzę z zakresu materiałów promocyjnych, governance produktu, oraz wymogów dotyczących przekazu marketingowego.',
    v4: 'Egzamin poświęcony zasadzie best execution oraz zarządzaniu konfliktami interesów. Obejmuje polityki realizacji zleceń, raportowanie oraz procedury ograniczania konfliktów.',
    v5: 'Egzamin podsumowujący wszystkie moduły przewodnika. Sprawdza kompleksową wiedzę z zakresu regulacji, ochrony klienta, marketingu, best execution i compliance.',
  };

  const description = descriptions[version || 'v1'] || descriptions.v1;

  return (
    <AccessGuard required="auth">
      <ExamRunner
        slug="przewodnik"
        title={meta.title}
        questions={normalized}
        backHref="/kursy/egzaminy/przewodnik"
        isPro={true}
        durationMinutes={25}
        description={description}
      />
    </AccessGuard>
  );
}
