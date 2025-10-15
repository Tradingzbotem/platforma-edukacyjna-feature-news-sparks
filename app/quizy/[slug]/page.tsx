// app/quizy/[slug]/page.tsx
import QuizRunner from '@/components/QuizRunner';
import type { QuizQuestion } from '@/components/QuizRunner';
import * as Q from '@/data/quizzes';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;


type Params = { slug: string };
type Search = { mix?: string | string[]; exam?: string | string[]; t?: string | string[]; mode?: string | string[] };

type QuizPack = { title: string; questions: QuizQuestion[] };

// mały helper – działa gdy Next poda `params` jako obiekt albo Promise
async function unwrap<T>(x: T | Promise<T>): Promise<T> {
  return x instanceof Promise ? await x : x;
}

function flag(v?: string | string[]) {
  const s = Array.isArray(v) ? v[0] : v;
  return s === '1';
}
function num(v?: string | string[], fallback = 20) {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params | Promise<Params>;
  searchParams?: Search | Promise<Search>;
}) {
  const { slug } = await unwrap(params);

  // obsłuż zarówno named export (QUIZZES), jak i ewentualny default
  const ns = Q as unknown as {
    QUIZZES?: Record<string, QuizPack>;
    default?: Record<string, QuizPack>;
  };
  const quizzes: Record<string, QuizPack> = ns.QUIZZES ?? ns.default ?? {};

  const pack = quizzes[slug];
  if (!pack) return notFound();

  const sp = searchParams ? await unwrap(searchParams) : undefined;
  // Domyślnie mieszamy pytania/odpowiedzi; można wyłączyć ?mix=0
  const mix = sp?.mix === undefined ? true : flag(sp?.mix);
  const examMode = flag(sp?.exam) || (Array.isArray(sp?.mode) ? sp?.mode[0] === 'exam' : sp?.mode === 'exam');
  const examMinutes = num(sp?.t, 20);

  const startMode = Array.isArray(sp?.mode) ? (sp?.mode[0] as 'quick'|'full'|'exam'|undefined) : (sp?.mode as 'quick'|'full'|'exam'|undefined);
  const questions = pack.questions;

  return (
    <QuizRunner
      slug={slug}
      title={pack.title}
      questions={questions}
      backHref="/quizy"
      shuffleQuestions={mix}
      shuffleOptions={mix}
      examMode={examMode}
      examMinutes={examMinutes}
      startMode={startMode}
      // seed={123456} // opcjonalnie: stałe mieszanie
    />
  );
}
