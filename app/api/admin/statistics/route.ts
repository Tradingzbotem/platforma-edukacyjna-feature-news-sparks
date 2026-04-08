import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured, listUsersBasic } from '@/lib/db';

export const runtime = 'nodejs';

async function safeQuery<T>(
  query: () => Promise<{ rows: T[] }>,
  defaultValue: T[]
): Promise<T[]> {
  try {
    const result = await query();
    return result.rows;
  } catch (error: any) {
    // Ignore "relation does not exist" errors (42P01)
    if (error?.code === '42P01') {
      return defaultValue;
    }
    throw error;
  }
}

async function safeQuerySingle<T>(
  query: () => Promise<{ rows: T[] }>,
  defaultValue: T | null
): Promise<T | null> {
  try {
    const result = await query();
    return result.rows[0] ?? defaultValue;
  } catch (error: any) {
    // Ignore "relation does not exist" errors (42P01)
    if (error?.code === '42P01') {
      return defaultValue;
    }
    throw error;
  }
}

export async function GET() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      stats: {
        users: { total: 0, byPlan: {}, active: 0, online: 0 },
        courses: { totalLessons: 0, completedLessons: 0, uniqueUsers: 0 },
        quizzes: { totalAttempts: 0, uniqueUsers: 0, averageScore: 0 },
        news: {
          totalItems: 0,
          enrichedItems: 0,
          recentItems: 0,
          itemsLast48h: 0,
          itemsLast24h: 0,
          lastIngestAt: null,
          lastEnrichedAt: null,
        },
        articles: { total: 0, createdToday: 0, lastCreatedAt: null, lastUpdatedAt: null },
        priceOverrides: { lastUpdatedAt: null },
        contact: { total: 0, unhandled: 0 },
        userLearning: [],
      },
    });
  }

  try {
    // Users statistics
    const usersStats = await safeQuery(
      () => sql<{ plan: string | null; count: string; active: string; online: string }>`
        SELECT 
          plan,
          COUNT(*)::text AS count,
          COUNT(*) FILTER (WHERE last_active_at IS NOT NULL AND last_active_at > NOW() - INTERVAL '30 days')::text AS active,
          COUNT(*) FILTER (WHERE last_active_at IS NOT NULL AND (NOW() - last_active_at) < INTERVAL '5 minutes')::text AS online
        FROM users
        GROUP BY plan
      `,
      []
    );

    const totalUsersRow = await safeQuerySingle(
      () => sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM users`,
      { count: '0' }
    );
    const usersTotal = Number(totalUsersRow?.count ?? '0');
    
    const byPlan: Record<string, number> = {};
    let activeUsers = 0;
    let onlineUsers = 0;
    
    for (const row of usersStats) {
      const plan = row.plan || 'free';
      byPlan[plan] = Number(row.count);
      activeUsers += Number(row.active);
      onlineUsers += Number(row.online);
    }

    // Courses statistics
    const coursesRow = await safeQuerySingle(
      () => sql<{ total: string; completed: string; unique_users: string }>`
        SELECT 
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE done = TRUE)::text AS completed,
          COUNT(DISTINCT user_id)::text AS unique_users
        FROM lesson_progress
      `,
      { total: '0', completed: '0', unique_users: '0' }
    );
    const coursesTotal = Number(coursesRow?.total ?? '0');
    const coursesCompleted = Number(coursesRow?.completed ?? '0');
    const coursesUniqueUsers = Number(coursesRow?.unique_users ?? '0');

    // Quizzes statistics
    const quizzesRow = await safeQuerySingle(
      () => sql<{ total: string; unique_users: string; avg_score: string }>`
        SELECT 
          COUNT(*)::text AS total,
          COUNT(DISTINCT user_id)::text AS unique_users,
          COALESCE(AVG(score::float / NULLIF(total, 0) * 100)::text, '0') AS avg_score
        FROM quiz_results
      `,
      { total: '0', unique_users: '0', avg_score: '0' }
    );
    const quizzesTotal = Number(quizzesRow?.total ?? '0');
    const quizzesUniqueUsers = Number(quizzesRow?.unique_users ?? '0');
    const quizzesAvgScore = Number(quizzesRow?.avg_score ?? '0');

    // News statistics
    const newsRow = await safeQuerySingle(
      () => sql<{ total: string; enriched: string; recent: string; last48h: string; last24h: string }>`
        SELECT 
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE enriched IS NOT NULL)::text AS enriched,
          COUNT(*) FILTER (WHERE published_at > NOW() - INTERVAL '7 days')::text AS recent,
          COUNT(*) FILTER (WHERE COALESCE(published_at, created_at) > NOW() - INTERVAL '48 hours')::text AS last48h,
          COUNT(*) FILTER (WHERE COALESCE(published_at, created_at) > NOW() - INTERVAL '24 hours')::text AS last24h
        FROM news_items
      `,
      { total: '0', enriched: '0', recent: '0', last48h: '0', last24h: '0' }
    );
    const newsTotal = Number(newsRow?.total ?? '0');
    const newsEnriched = Number(newsRow?.enriched ?? '0');
    const newsRecent = Number(newsRow?.recent ?? '0');
    const newsLast48h = Number(newsRow?.last48h ?? '0');
    const newsLast24h = Number(newsRow?.last24h ?? '0');

    const newsActivityRow = await safeQuerySingle(
      () => sql<{ last_ingest: Date | null; last_enriched: Date | null }>`
        SELECT
          MAX(created_at) AS last_ingest,
          MAX((enriched->>'enrichedAt')::timestamptz) AS last_enriched
        FROM news_items
      `,
      { last_ingest: null, last_enriched: null }
    );
    const newsLastIngestAt = newsActivityRow?.last_ingest
      ? new Date(newsActivityRow.last_ingest).toISOString()
      : null;
    const newsLastEnrichedAt = newsActivityRow?.last_enriched
      ? new Date(newsActivityRow.last_enriched).toISOString()
      : null;

    // Articles statistics (+ utworzone dziś wg kalendarza Europe/Warsaw)
    const articlesRow = await safeQuerySingle(
      () => sql<{ count: string; today: string }>`
        SELECT 
          COUNT(*)::text AS count,
          COUNT(*) FILTER (
            WHERE ("createdAt" AT TIME ZONE 'Europe/Warsaw')::date = (NOW() AT TIME ZONE 'Europe/Warsaw')::date
          )::text AS today
        FROM "Article"
      `,
      { count: '0', today: '0' }
    );
    const articlesTotal = Number(articlesRow?.count ?? '0');
    const articlesCreatedToday = Number(articlesRow?.today ?? '0');

    const articlesActivityRow = await safeQuerySingle(
      () => sql<{ last_created: Date | null; last_updated: Date | null }>`
        SELECT
          MAX("createdAt") AS last_created,
          MAX("updatedAt") AS last_updated
        FROM "Article"
      `,
      { last_created: null, last_updated: null }
    );
    const articlesLastCreatedAt = articlesActivityRow?.last_created
      ? new Date(articlesActivityRow.last_created).toISOString()
      : null;
    const articlesLastUpdatedAt = articlesActivityRow?.last_updated
      ? new Date(articlesActivityRow.last_updated).toISOString()
      : null;

    const priceMaxRow = await safeQuerySingle(
      () => sql<{ max_u: Date | null }>`
        SELECT MAX(updated_at) AS max_u FROM price_overrides
      `,
      { max_u: null }
    );
    const pricesLastUpdatedAt = priceMaxRow?.max_u ? new Date(priceMaxRow.max_u).toISOString() : null;

    // Contact messages statistics
    const contactRow = await safeQuerySingle(
      () => sql<{ total: string; unhandled: string }>`
        SELECT 
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE handled = FALSE OR handled IS NULL)::text AS unhandled
        FROM contact_messages
      `,
      { total: '0', unhandled: '0' }
    );
    const contactTotal = Number(contactRow?.total ?? '0');
    const contactUnhandled = Number(contactRow?.unhandled ?? '0');

    const usersList = await listUsersBasic();
    const lessonProgressRows = await safeQuery(
      () =>
        sql<{
          user_id: string;
          course: string;
          lesson_id: string;
          done: boolean;
          updated_at: Date;
        }>`
        SELECT user_id, course, lesson_id, done, updated_at
        FROM lesson_progress
        ORDER BY user_id, course, lesson_id
      `,
      [],
    );
    const quizResultRows = await safeQuery(
      () =>
        sql<{ user_id: string; slug: string; score: number; total: number; at: Date }>`
        SELECT user_id, slug, score, total, at
        FROM quiz_results
        ORDER BY user_id, at DESC
      `,
      [],
    );

    const lessonsByUser = new Map<
      string,
      Array<{ course: string; lessonId: string; done: boolean; updatedAt: string }>
    >();
    for (const r of lessonProgressRows) {
      const list = lessonsByUser.get(r.user_id) ?? [];
      list.push({
        course: r.course,
        lessonId: r.lesson_id,
        done: Boolean(r.done),
        updatedAt: new Date(r.updated_at).toISOString(),
      });
      lessonsByUser.set(r.user_id, list);
    }

    const quizzesByUser = new Map<
      string,
      Array<{ slug: string; score: number; total: number; at: string; percentage: number }>
    >();
    for (const r of quizResultRows) {
      const list = quizzesByUser.get(r.user_id) ?? [];
      const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
      list.push({
        slug: r.slug,
        score: r.score,
        total: r.total,
        at: new Date(r.at).toISOString(),
        percentage: pct,
      });
      quizzesByUser.set(r.user_id, list);
    }

    const userLearning = usersList.map((u) => {
      const lessons = lessonsByUser.get(u.id) ?? [];
      const quizzes = quizzesByUser.get(u.id) ?? [];
      const lessonsDone = lessons.filter((l) => l.done).length;
      return {
        userId: u.id,
        email: u.email,
        plan: u.plan,
        lessons,
        quizzes,
        summary: {
          lessonRows: lessons.length,
          lessonsDone,
          quizAttempts: quizzes.length,
          distinctQuizSlugs: new Set(quizzes.map((q) => q.slug)).size,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      stats: {
        users: {
          total: usersTotal,
          byPlan,
          active: activeUsers,
          online: onlineUsers,
        },
        courses: {
          totalLessons: coursesTotal,
          completedLessons: coursesCompleted,
          uniqueUsers: coursesUniqueUsers,
        },
        quizzes: {
          totalAttempts: quizzesTotal,
          uniqueUsers: quizzesUniqueUsers,
          averageScore: Math.round(quizzesAvgScore * 100) / 100,
        },
        news: {
          totalItems: newsTotal,
          enrichedItems: newsEnriched,
          recentItems: newsRecent,
          itemsLast48h: newsLast48h,
          itemsLast24h: newsLast24h,
          lastIngestAt: newsLastIngestAt,
          lastEnrichedAt: newsLastEnrichedAt,
        },
        articles: {
          total: articlesTotal,
          createdToday: articlesCreatedToday,
          lastCreatedAt: articlesLastCreatedAt,
          lastUpdatedAt: articlesLastUpdatedAt,
        },
        priceOverrides: {
          lastUpdatedAt: pricesLastUpdatedAt,
        },
        contact: {
          total: contactTotal,
          unhandled: contactUnhandled,
        },
        userLearning,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
