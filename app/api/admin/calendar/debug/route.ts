// app/api/admin/calendar/debug/route.ts — Debug endpoint to check calendar data
import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { ensureMacroCalendarTable } from '@/lib/panel/ensureMacroCalendar';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    await ensureMacroCalendarTable();

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as count FROM "MacroCalendarEvent"`;
    const totalCount = Number(countResult.rows[0]?.count || 0);

    // Get date range
    const dateRange = await sql`
      SELECT MIN(date) as min_date, MAX(date) as max_date, COUNT(*) as count
      FROM "MacroCalendarEvent"
    `;
    const minDate = dateRange.rows[0]?.min_date || null;
    const maxDate = dateRange.rows[0]?.max_date || null;

    // Get sample events
    const sample = await sql`
      SELECT date, time, event, region, importance, currency
      FROM "MacroCalendarEvent"
      ORDER BY date ASC, time ASC NULLS LAST
      LIMIT 10
    `;

    // Get events for next 30 days
    const today = new Date().toISOString().slice(0, 10);
    const in30Days = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const upcomingCount = await sql`
      SELECT COUNT(*) as count
      FROM "MacroCalendarEvent"
      WHERE date >= ${today} AND date <= ${in30Days}
    `;
    const upcoming = Number(upcomingCount.rows[0]?.count || 0);

    return NextResponse.json({
      totalCount,
      dateRange: {
        min: minDate,
        max: maxDate,
      },
      upcomingCount: upcoming,
      sample: sample.rows,
      today,
      in30Days,
    });
  } catch (error: any) {
    console.error('[Calendar Debug] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Błąd podczas sprawdzania danych',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
