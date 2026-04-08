import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findQuizQuestion } from "@/lib/quiz/findQuizQuestion";
import { scenarioAnswerMatches } from "@/lib/quiz/scenarioAnswerGrading";
import type { QuizMcqQuestion, QuizScenarioQuestion } from "@/data/quizzes/types";

export const runtime = "nodejs";

type Body =
  | {
      scope: "module";
      moduleSlug: string;
      quizSlug: string;
      questionId: string;
      mcqOriginalIndex: number;
    }
  | {
      scope: "module";
      moduleSlug: string;
      quizSlug: string;
      questionId: string;
      scenarioText: string;
    }
  | {
      scope: "pack";
      packSlug: string;
      questionId: string;
      mcqOriginalIndex: number;
    }
  | {
      scope: "pack";
      packSlug: string;
      questionId: string;
      scenarioText: string;
    };

function isMcqBody(b: Body): b is Extract<Body, { mcqOriginalIndex: number }> {
  return "mcqOriginalIndex" in b;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.scope !== "module" && body.scope !== "pack") {
    return NextResponse.json({ error: "bad_scope" }, { status: 400 });
  }

  const q =
    body.scope === "module"
      ? findQuizQuestion({
          scope: "module",
          moduleSlug: String(body.moduleSlug ?? ""),
          quizSlug: String(body.quizSlug ?? ""),
          questionId: String(body.questionId ?? ""),
        })
      : findQuizQuestion({
          scope: "pack",
          packSlug: String(body.packSlug ?? ""),
          questionId: String(body.questionId ?? ""),
        });

  if (!q) {
    return NextResponse.json({ error: "question_not_found" }, { status: 404 });
  }

  if (isMcqBody(body)) {
    if (q.type === "scenario") {
      return NextResponse.json({ error: "type_mismatch" }, { status: 400 });
    }
    const mcq = q as QuizMcqQuestion;
    const idx = body.mcqOriginalIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= mcq.options.length) {
      return NextResponse.json({ error: "bad_index" }, { status: 400 });
    }
    const isCorrect = idx === mcq.correctIndex;
    const correctLabel = (mcq.correctAnswer ?? mcq.options[mcq.correctIndex] ?? "").trim() || "—";
    return NextResponse.json({
      kind: "mcq" as const,
      isCorrect,
      correctOriginalIndex: mcq.correctIndex,
      explanation: mcq.explanation,
      explanationIncorrect: mcq.explanationIncorrect ?? mcq.explanation,
      consequenceCorrect: mcq.consequenceCorrect,
      consequenceWrong: mcq.consequenceWrong,
      correctAnswerLabel: correctLabel,
    });
  }

  if (q.type !== "scenario") {
    return NextResponse.json({ error: "type_mismatch" }, { status: 400 });
  }
  const scen = q as QuizScenarioQuestion;
  const text = typeof body.scenarioText === "string" ? body.scenarioText : "";
  const isCorrect = scenarioAnswerMatches(scen, text);
  return NextResponse.json({
    kind: "scenario" as const,
    isCorrect,
    correctAnswer: scen.correctAnswer,
    explanation: scen.explanation,
    explanationIncorrect: scen.explanationIncorrect ?? scen.explanation,
  });
}
