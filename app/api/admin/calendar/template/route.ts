// app/api/admin/calendar/template/route.ts — Download Excel template for calendar import
import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create template workbook
    const workbook = XLSX.utils.book_new();

    // Create sample data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const sampleData = [
      // Header row
      ['Data', 'Czas', 'Wal.', 'Wydarzenie', 'Waga', 'Obecny', 'Prognoza', 'Poprzedni'],
      // Sample rows
      [formatDate(today), '13:30', 'USD', 'CPI (m/m) (Dec)', 'wysoka', '', '0.2%', '0.1%'],
      [formatDate(today), '13:30', 'USD', 'CPI (r/r) (Dec)', 'wysoka', '', '3.2%', '3.1%'],
      [formatDate(today), '15:00', 'USD', 'ISM Manufacturing PMI', 'średnia', '', '50.5', '49.8'],
      [formatDate(tomorrow), '13:30', 'USD', 'Retail Sales (m/m)', 'średnia', '', '0.3%', '0.2%'],
      [formatDate(tomorrow), '15:00', 'EUR', 'CPI (r/r) (Dec)', 'wysoka', '', '2.0%', '2.1%'],
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Data
      { wch: 8 },  // Czas
      { wch: 6 },  // Wal.
      { wch: 40 }, // Wydarzenie
      { wch: 10 }, // Waga
      { wch: 12 }, // Obecny
      { wch: 12 }, // Prognoza
      { wch: 12 }, // Poprzedni
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kalendarz');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="kalendarz-makro-szablon.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[Calendar Template] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Błąd podczas generowania szablonu',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
