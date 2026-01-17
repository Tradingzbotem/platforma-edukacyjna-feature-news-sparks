import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

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
        news: { totalItems: 0, enrichedItems: 0, recentItems: 0 },
        articles: { total: 0 },
        contact: { total: 0, unhandled: 0 },
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
      () => sql<{ total: string; enriched: string; recent: string }>`
        SELECT 
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE enriched IS NOT NULL)::text AS enriched,
          COUNT(*) FILTER (WHERE published_at > NOW() - INTERVAL '7 days')::text AS recent
        FROM news_items
      `,
      { total: '0', enriched: '0', recent: '0' }
    );
    const newsTotal = Number(newsRow?.total ?? '0');
    const newsEnriched = Number(newsRow?.enriched ?? '0');
    const newsRecent = Number(newsRow?.recent ?? '0');

    // Articles statistics
    const articlesRow = await safeQuerySingle(
      () => sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM "Article"`,
      { count: '0' }
    );
    const articlesTotal = Number(articlesRow?.count ?? '0');

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
        },
        articles: {
          total: articlesTotal,
        },
        contact: {
          total: contactTotal,
          unhandled: contactUnhandled,
        },
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
