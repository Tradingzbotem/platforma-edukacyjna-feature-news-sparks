import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { userId } = await ctx.params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      activity: {
        lessons: [],
        quizzes: [],
        checklists: [],
      },
    });
  }

  try {
    // Lesson progress
    let lessons: Array<{
      course: string;
      lessonId: string;
      done: boolean;
      updatedAt: string;
    }> = [];
    try {
      const lessonsResult = await sql<{
        course: string;
        lesson_id: string;
        done: boolean;
        updated_at: Date;
      }>`
        SELECT course, lesson_id, done, updated_at
        FROM lesson_progress
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 100
      `;
      lessons = lessonsResult.rows.map((r) => ({
        course: r.course,
        lessonId: r.lesson_id,
        done: r.done,
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
    } catch (error: any) {
      // Ignore "relation does not exist" errors (42P01)
      if (error?.code !== '42P01') {
        throw error;
      }
    }

    // Quiz results
    let quizzes: Array<{
      slug: string;
      score: number;
      total: number;
      percentage: number;
      at: string;
    }> = [];
    try {
      const quizzesResult = await sql<{
        slug: string;
        score: number;
        total: number;
        at: Date;
      }>`
        SELECT slug, score, total, at
        FROM quiz_results
        WHERE user_id = ${userId}
        ORDER BY at DESC
        LIMIT 100
      `;
      quizzes = quizzesResult.rows.map((r) => ({
        slug: r.slug,
        score: r.score,
        total: r.total,
        percentage: Math.round((r.score / r.total) * 100),
        at: new Date(r.at).toISOString(),
      }));
    } catch (error: any) {
      // Ignore "relation does not exist" errors (42P01)
      if (error?.code !== '42P01') {
        throw error;
      }
    }

    // Checklist history
    let checklists: Array<{
      id: string;
      createdAt: string;
      asset: string | null;
      timeframe: string | null;
    }> = [];
    try {
      const checklistsResult = await sql<{
        id: string;
        created_at: Date;
        asset: string | null;
        timeframe: string | null;
      }>`
        SELECT id, created_at, asset, timeframe
        FROM checklist_history
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 100
      `;
      checklists = checklistsResult.rows.map((r) => ({
        id: r.id,
        createdAt: new Date(r.created_at).toISOString(),
        asset: r.asset,
        timeframe: r.timeframe,
      }));
    } catch (error: any) {
      // Ignore "relation does not exist" errors (42P01)
      if (error?.code !== '42P01') {
        throw error;
      }
    }

    return NextResponse.json({
      ok: true,
      activity: {
        lessons,
        quizzes,
        checklists,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}
