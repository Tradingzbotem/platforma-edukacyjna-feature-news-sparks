// app/api/admin/calendar/last-import/route.ts — Get last import timestamp
import { NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check admin access
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ lastImport: null });
    }

    // Get the most recent createdAt timestamp from MacroCalendarEvent
    const result = await sql`
      SELECT MAX("createdAt") as "lastImport"
      FROM "MacroCalendarEvent"
    `;

    const lastImport = result.rows[0]?.lastImport || null;

    return NextResponse.json({
      lastImport: lastImport ? new Date(lastImport).toISOString() : null,
    });
  } catch (error: any) {
    console.error('[Calendar Last Import] Error:', error);
    return NextResponse.json(
      {
        lastImport: null,
        error: error?.message || 'Błąd podczas pobierania daty ostatniego importu',
      },
      { status: 500 }
    );
  }
}
