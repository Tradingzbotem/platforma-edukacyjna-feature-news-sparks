import { Suspense } from "react";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import type { QuizQuestion } from "@/data/quizzes";
import AccessGuard from "@/app/components/AccessGuard";
import {
  getQuestionsForModuleQuiz,
  getQuizConfig,
  getQuizModuleBySlug,
} from "@/lib/quiz/resolveModuleQuiz";
import { moduleQuizStorageSlug } from "@/lib/quiz/moduleQuizStorageSlug";
import { QuizSummaryAccessGate } from "@/components/QuizSummaryAccessGate";
import { getIsAdmin } from "@/lib/admin";
import { stripQuizQuestionsForClient } from "@/lib/quiz/stripQuizSecrets";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Params = { moduleSlug: string; quizSlug: string };
type Search = { mix?: string | string[]; exam?: string | string[]; t?: string | string[]; mode?: string | string[] };

async function unwrap<T>(x: T | Promise<T>): Promise<T> {
  return x instanceof Promise ? await x : x;
}

function flag(v?: string | string[]) {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "1";
}
function num(v?: string | string[], fallback = 20) {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const { moduleSlug, quizSlug } = await unwrap(params);
  const mod = getQuizModuleBySlug(moduleSlug);
  const quiz = getQuizConfig(moduleSlug, quizSlug);
  if (mod && quiz) {
    return { title: `${quiz.title} — ${mod.title} | FX EduLab` };
  }
  return { title: "Quiz | FX EduLab" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params | Promise<Params>;
  searchParams?: Search | Promise<Search>;
}) {
  const { moduleSlug, quizSlug } = await unwrap(params);

  const mod = getQuizModuleBySlug(moduleSlug);
  const quiz = getQuizConfig(moduleSlug, quizSlug);
  if (!mod || !quiz) return notFound();

  const resolved = getQuestionsForModuleQuiz(moduleSlug, quizSlug);
  if (resolved.status !== "ok" || resolved.questions.length === 0) return notFound();

  const sp = searchParams ? await unwrap(searchParams) : undefined;
  const mix = sp?.mix === undefined ? true : flag(sp?.mix);
  const modeParam = Array.isArray(sp?.mode) ? sp?.mode[0] : sp?.mode;
  const reviewMode = modeParam === "review";
  const examMode = flag(sp?.exam) || modeParam === "exam";
  const examMinutes = num(sp?.t, 20);

  const startMode =
    modeParam === "quick" || modeParam === "full" || modeParam === "exam"
      ? (modeParam as "quick" | "full" | "exam")
      : undefined;

  const storageSlug = moduleQuizStorageSlug(moduleSlug, quizSlug);
  const pagePath = `/quizy/${moduleSlug}/${quizSlug}`;
  const isAdmin = await getIsAdmin();
  const questions = isAdmin ? resolved.questions : stripQuizQuestionsForClient(resolved.questions);

  const runner = (
    <QuizRunner
      slug={storageSlug}
      pagePath={pagePath}
      title={quiz.title}
      questions={questions as QuizQuestion[]}
      backHref={`/quizy/${moduleSlug}`}
      shuffleQuestions={mix}
      shuffleOptions={mix}
      examMode={examMode}
      examMinutes={examMinutes}
      startMode={startMode}
      reviewMode={reviewMode}
      adminAnswerPreview={isAdmin}
      answerSecrets={isAdmin ? "full" : "protected"}
      verifyContext={{ kind: "module", moduleSlug, quizSlug }}
    />
  );

  return (
    <AccessGuard required="auth">
      <Suspense fallback={<div className="min-h-screen bg-slate-950" aria-hidden />}>
        {quiz.isModuleSummary ? (
          <QuizSummaryAccessGate moduleSlug={moduleSlug}>{runner}</QuizSummaryAccessGate>
        ) : (
          runner
        )}
      </Suspense>
    </AccessGuard>
  );
}
