import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';
import { QUIZZES } from '@/data/quizzes';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ userId: string; slug: string }> }
) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { userId, slug } = await ctx.params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      attempts: [],
      quizData: null,
    });
  }

  try {
    // Get all attempts for this user and quiz
    const attemptsResult = await sql<{
      score: number;
      total: number;
      at: Date;
      answers: any;
    }>`
      SELECT score, total, at, answers
      FROM quiz_results
      WHERE user_id = ${userId} AND slug = ${slug}
      ORDER BY at DESC
    `;

    // Get quiz questions
    const quizPack = QUIZZES[slug as keyof typeof QUIZZES];
    const quizData = quizPack ? {
      title: quizPack.title,
      questions: quizPack.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    } : null;

    const attempts = attemptsResult.rows.map((r) => ({
      score: r.score,
      total: r.total,
      percentage: Math.round((r.score / r.total) * 100),
      at: new Date(r.at).toISOString(),
      answers: r.answers || null,
      errors: r.answers ? (r.answers as any[]).filter((a: any) => !a.isCorrect) : [],
    }));

    return NextResponse.json({
      ok: true,
      attempts,
      quizData,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    // Ignore "relation does not exist" errors
    if (error?.code === '42P01') {
      return NextResponse.json({
        ok: true,
        attempts: [],
        quizData: null,
      });
    }
    console.error('Error fetching quiz details:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to fetch quiz details' },
      { status: 500 }
    );
  }
}
