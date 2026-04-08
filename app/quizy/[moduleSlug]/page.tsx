import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import type { QuizQuestion } from "@/data/quizzes";
import * as Q from "@/data/quizzes";
import { isRegisteredQuizModuleSlug, getQuizModuleBySlug } from "@/data/quizzes/quizModules";
import AccessGuard from "@/app/components/AccessGuard";
import { QuizModuleHubProgress } from "@/components/QuizModuleHubProgress";
import { QuizModuleQuizzesSection } from "@/components/QuizModuleQuizzesSection";
import { summaryQuizSlug, thematicQuizSlugs } from "@/lib/quiz/moduleThematicProgress";
import { getIsAdmin } from "@/lib/admin";
import { stripQuizQuestionsForClient } from "@/lib/quiz/stripQuizSecrets";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Params = { moduleSlug: string };
type Search = { mix?: string | string[]; exam?: string | string[]; t?: string | string[]; mode?: string | string[] };

type QuizPack = { title: string; questions: QuizQuestion[] };

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

export async function generateMetadata({ params }: { params: Params | Promise<Params> }) {
  const { moduleSlug } = await unwrap(params);
  const mod = getQuizModuleBySlug(moduleSlug);
  if (mod) {
    return { title: `${mod.title} — quizy | FX EduLab` };
  }
  const ns = Q as unknown as { QUIZZES?: Record<string, QuizPack> };
  const pack = ns.QUIZZES?.[moduleSlug];
  if (pack) {
    return { title: `${pack.title} | FX EduLab` };
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
  const { moduleSlug } = await unwrap(params);

  if (isRegisteredQuizModuleSlug(moduleSlug)) {
    const mod = getQuizModuleBySlug(moduleSlug)!;
    const thematicSlugs = thematicQuizSlugs(mod);
    const summarySlug = summaryQuizSlug(mod);

    return (
      <AccessGuard required="auth">
        <main className="min-h-screen bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/quizy"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 hover:scale-105 px-3 py-1.5 text-sm border border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                ← Wszystkie quizy
              </Link>
              <Link
                href="/kursy"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm border border-white/10 text-white/70 hover:text-white transition-all"
              >
                Ścieżka kursów
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mt-8">{mod.title} — quizy modułu</h1>
            <p className="text-white/70 mt-2 max-w-3xl leading-relaxed">{mod.description}</p>

            <QuizModuleHubProgress
              moduleSlug={moduleSlug}
              thematicQuizSlugs={thematicSlugs}
              summaryQuizSlug={summarySlug}
            />

            <QuizModuleQuizzesSection
              moduleSlug={moduleSlug}
              quizzes={mod.quizzes.map((quiz, idx) => ({
                slug: quiz.slug,
                title: quiz.title,
                shortDescription: quiz.shortDescription,
                estimatedMinutes: quiz.estimatedMinutes,
                questionCount: quiz.questionIds.length,
                isModuleSummary: quiz.isModuleSummary,
                indexOneBased: idx + 1,
                totalQuizzes: mod.quizzes.length,
              }))}
            />
          </div>
        </main>
      </AccessGuard>
    );
  }

  const ns = Q as unknown as {
    QUIZZES?: Record<string, QuizPack>;
    default?: Record<string, QuizPack>;
  };
  const quizzes: Record<string, QuizPack> = ns.QUIZZES ?? ns.default ?? {};
  const pack = quizzes[moduleSlug];
  if (!pack) return notFound();

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

  const isAdmin = await getIsAdmin();
  const questions = isAdmin ? pack.questions : stripQuizQuestionsForClient(pack.questions);

  return (
    <AccessGuard required="auth">
      <Suspense fallback={<div className="min-h-screen bg-slate-950" aria-hidden />}>
        <QuizRunner
          slug={moduleSlug}
          title={pack.title}
          questions={questions}
          backHref="/quizy"
          shuffleQuestions={mix}
          shuffleOptions={mix}
          examMode={examMode}
          examMinutes={examMinutes}
          startMode={startMode}
          reviewMode={reviewMode}
          adminAnswerPreview={isAdmin}
          answerSecrets={isAdmin ? "full" : "protected"}
          verifyContext={{ kind: "pack", packSlug: moduleSlug }}
        />
      </Suspense>
    </AccessGuard>
  );
}
