// app/api/admin/calendar/import/route.ts — Admin endpoint to import calendar data from Excel (file or pasted table)
import { NextRequest, NextResponse } from 'next/server';
import { getIsAdmin } from '@/lib/admin';
import { sql } from '@vercel/postgres';
import { ensureMacroCalendarTable } from '@/lib/panel/ensureMacroCalendar';
import { isDatabaseConfigured } from '@/lib/db';
import { randomBytes } from 'crypto';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Map currency codes to regions
function inferRegion(currency?: string): string | null {
  if (!currency) return null;
  const c = currency.toUpperCase().trim();
  const regionMap: Record<string, string> = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'UK',
    JPY: 'JP',
    CNY: 'CN',
    CHF: 'CH',
    AUD: 'AU',
    CAD: 'CA',
    NZD: 'NZ',
    SEK: 'SE',
    NOK: 'NO',
    DKK: 'DK',
    PLN: 'PL',
  };
  return regionMap[c] || null;
}

// Infer importance from weight or event name
function inferImportance(weight?: string, event?: string): 'low' | 'medium' | 'high' | null {
  if (weight) {
    const w = weight.toLowerCase().trim();
    if (w.includes('wysok') || w.includes('high') || w === '3' || w === '3.0') return 'high';
    if (w.includes('średn') || w.includes('medium') || w === '2' || w === '2.0') return 'medium';
    if (w.includes('niska') || w.includes('low') || w === '1' || w === '1.0') return 'low';
  }
  if (event) {
    const e = event.toLowerCase();
    // High importance events
    if (
      e.includes('nfp') ||
      e.includes('non-farm') ||
      e.includes('cpi') ||
      e.includes('pce') ||
      e.includes('fomc') ||
      e.includes('fed') ||
      e.includes('interest rate') ||
      e.includes('stopa procentowa')
    ) {
      return 'high';
    }
    // Medium importance events
    if (
      e.includes('ism') ||
      e.includes('pmi') ||
      e.includes('gdp') ||
      e.includes('pkb') ||
      e.includes('retail sales') ||
      e.includes('unemployment') ||
      e.includes('bezroboc')
    ) {
      return 'medium';
    }
  }
  return null;
}

// Parse Polish date string like "poniedziałek, 19 stycznia 2026"
function parsePolishDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  const cleaned = dateStr.trim();
  
  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const months: Record<string, number> = {
    stycznia: 0,
    styczniu: 0, // alternative form
    lutego: 1,
    lutym: 1,
    marca: 2,
    marcu: 2,
    marca: 2,
    kwietnia: 3,
    kwietniu: 3,
    maja: 4,
    maju: 4,
    czerwca: 5,
    czerwcu: 5,
    lipca: 6,
    lipcu: 6,
    sierpnia: 7,
    sierpniu: 7,
    września: 8,
    wrześniu: 8,
    października: 9,
    październiku: 9,
    listopada: 10,
    listopadzie: 10,
    grudnia: 11,
    grudniu: 11,
  };

  try {
    // Format: "poniedziałek, 19 stycznia 2026" or "19 stycznia 2026"
    // Remove weekday if present (poniedziałek, wtorek, środa, etc.)
    let text = cleaned.replace(/^[^,\d]+,?\s*/, ''); // Remove text before comma or first digit
    // Also try removing common weekday names
    text = text.replace(/^(poniedziałek|wtorek|środa|czwartek|piątek|sobota|niedziela),?\s*/i, '');
    
    // Match: day month year (e.g., "19 stycznia 2026")
    const match = text.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const month = months[monthName];
      if (month !== undefined && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
        const date = new Date(year, month, day);
        // Validate the date was created correctly
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date.toISOString().slice(0, 10);
        }
      }
    }
  } catch (e) {
    // fall through
    if (process.env.NODE_ENV === 'development') {
      console.error('[Calendar Import] Date parse error:', e, 'for:', dateStr);
    }
  }
  return null;
}

// Parse time string like "00:50:00", "13:30", "17:54", or just "00:50"
function parseTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  // Match HH:mm or HH:mm:ss format
  const match = cleaned.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return `${hours}:${minutes}`;
  }
  // Also try to parse if it's just numbers like "0030" or "1754"
  const numMatch = cleaned.match(/^(\d{3,4})$/);
  if (numMatch) {
    const num = numMatch[1];
    if (num.length === 3) {
      // "030" -> "00:30"
      return `0${num[0]}:${num.slice(1)}`;
    } else if (num.length === 4) {
      // "1754" -> "17:54"
      return `${num.slice(0, 2)}:${num.slice(2)}`;
    }
  }
  return null;
}

// Parse pasted Excel table data
function parseExcelTable(pastedText: string): Array<{
  date: string;
  time?: string;
  currency?: string;
  event: string;
  weight?: string;
  current?: string;
  forecast?: string;
  previous?: string;
}> {
  const lines = pastedText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Find header row (should contain "Czas", "Wal.", "Wydarzenie", etc.)
  let headerIndex = -1;
  let dateFromHeader: string | null = null;
  
  // First, look for date in first few lines (before header)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const dateMatch = parsePolishDate(lines[i]);
    if (dateMatch) {
      dateFromHeader = dateMatch;
      // Date found, header should be on next line or nearby
      break;
    }
  }
  
  // Then find header row
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('czas') || line.includes('wal.') || line.includes('wydarzenie')) {
      headerIndex = i;
      // If we haven't found date yet, check this line and previous lines
      if (!dateFromHeader) {
        // Check current line
        const dateMatch = parsePolishDate(lines[i]);
        if (dateMatch) {
          dateFromHeader = dateMatch;
        } else if (i > 0) {
          // Check previous line
          const prevDateMatch = parsePolishDate(lines[i - 1]);
          if (prevDateMatch) {
            dateFromHeader = prevDateMatch;
          }
        }
      }
      break;
    }
  }

  if (headerIndex === -1) {
    // Try to find date in first few lines and assume header is next
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const dateMatch = parsePolishDate(lines[i]);
      if (dateMatch) {
        dateFromHeader = dateMatch;
        headerIndex = i + 1;
        break;
      }
    }
    if (headerIndex === -1) headerIndex = 0;
  }

  // Parse header to find column indices
  const headerLine = lines[headerIndex].toLowerCase();
  // Try tab-separated first (Excel paste), then comma-separated (CSV)
  const cols = headerLine.includes('\t')
    ? headerLine.split(/\t/).map((c) => c.trim().toLowerCase())
    : headerLine.split(/,/).map((c) => c.trim().toLowerCase());
  
  // Find column indices - support both Polish and English headers
  const dateCol = cols.findIndex((c) => c.includes('data') || c === 'a' || c.includes('date'));
  const timeCol = cols.findIndex((c) => c.includes('czas') || c === 'b' || c.includes('time'));
  const currencyCol = cols.findIndex((c) => c.includes('wal') || c === 'c' || c.includes('currency') || c.includes('waluta'));
  const eventCol = cols.findIndex((c) => c.includes('wydarzenie') || c === 'd' || c.includes('event') || c.includes('wydarzenie'));
  const weightCol = cols.findIndex((c) => c.includes('waga') || c === 'e' || c.includes('weight') || c.includes('importance'));
  const currentCol = cols.findIndex((c) => c.includes('obecny') || c === 'f' || c.includes('current') || c.includes('actual'));
  const forecastCol = cols.findIndex((c) => c.includes('prognoza') || c === 'g' || c.includes('forecast') || c.includes('expected'));
  const previousCol = cols.findIndex((c) => c.includes('poprzedni') || c === 'h' || c.includes('previous') || c.includes('prior'));

  const results: Array<{
    date: string;
    time?: string;
    currency?: string;
    event: string;
    weight?: string;
    current?: string;
    forecast?: string;
    previous?: string;
  }> = [];

  // Current date - start with header date (if found) or today
  // IMPORTANT: Each row should have its own date in the date column
  let currentDate = dateFromHeader;
  if (!currentDate) {
    // Only use today if no date found in header - but prefer date from each row
    currentDate = new Date().toISOString().slice(0, 10);
  }

  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.toLowerCase().includes('24h') || line.toLowerCase().includes('dzień')) continue;

    // Try tab-separated first (Excel paste), then comma-separated (CSV)
    const cells = line.includes('\t')
      ? line.split(/\t/).map((c) => c.trim())
      : line.split(/,/).map((c) => c.trim());

    // Check if there's a date column - if so, use date from that column for this row
    let rowDate = currentDate; // Default to current date
    if (dateCol >= 0 && cells[dateCol]) {
      // Try to parse date from date column
      const dateStr = cells[dateCol];
      // Try ISO format first (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        rowDate = dateStr;
      } else {
        // Try Polish date format
        const polishDate = parsePolishDate(dateStr);
        if (polishDate) {
          rowDate = polishDate;
        }
      }
      // Update currentDate for subsequent rows without date
      currentDate = rowDate;
    } else {
      // No date column - check if first cell is a date (legacy support)
      const dateMatch = parsePolishDate(cells[0]);
      if (dateMatch) {
        currentDate = dateMatch;
        rowDate = dateMatch;
        continue; // Skip this row, it's just a date marker
      }
    }
    
    // Also check if time column contains "24h" which might indicate a date change
    if (timeCol >= 0 && cells[timeCol] && cells[timeCol].toLowerCase().includes('24h')) {
      // This might be a date separator row, skip it
      continue;
    }

    // Skip if no event column or event is empty
    if (eventCol === -1 || !cells[eventCol]) continue;

    const event = cells[eventCol];
    if (!event || event.toLowerCase().includes('dzień wolny') || event.toLowerCase().includes('holiday')) continue;

    const time = timeCol >= 0 ? parseTime(cells[timeCol]) : null;
    const currency = currencyCol >= 0 ? cells[currencyCol] : null;
    const weight = weightCol >= 0 ? cells[weightCol] : null;
    const current = currentCol >= 0 ? cells[currentCol] : null;
    const forecast = forecastCol >= 0 ? cells[forecastCol] : null;
    const previous = previousCol >= 0 ? cells[previousCol] : null;

    if (event) {
      results.push({
        date: rowDate, // Use date from this row, not global currentDate
        time: time || undefined,
        currency: currency || undefined,
        event,
        weight: weight || undefined,
        current: current || undefined,
        forecast: forecast || undefined,
        previous: previous || undefined,
      });
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await getIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check if request is FormData (file upload) or JSON (pasted text)
    const contentType = req.headers.get('content-type') || '';
    let pastedText = '';
    let clearExisting = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const clearExistingStr = formData.get('clearExisting') as string | null;
      clearExisting = clearExistingStr === 'true';

      if (!file) {
        return NextResponse.json({ error: 'Brak pliku do importu. Wybierz plik Excel.' }, { status: 400 });
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Handle CSV files
      if (fileExtension === 'csv' || fileExtension === 'txt') {
        pastedText = await file.text();
      }
      // Handle Excel/OpenDocument files (XLSX, XLS, ODS)
      else if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'ods') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          // XLSX library automatically detects format (XLSX, XLS, ODS)
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          // Use first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to CSV format (tab-separated to match paste format)
          pastedText = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
        } catch (error: any) {
          return NextResponse.json(
            { error: `Błąd podczas parsowania pliku: ${error?.message || 'Nieprawidłowy format pliku'}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Nieobsługiwany format pliku. Obsługiwane formaty: XLSX, XLS, ODS, CSV' },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON (pasted text)
      const body = await req.json();
      pastedText = body.data || body.text || '';
      clearExisting = body.clearExisting === true;

      if (!pastedText || typeof pastedText !== 'string') {
        return NextResponse.json({ error: 'Brak danych do importu. Wklej tabelę z Excel.' }, { status: 400 });
      }
    }

    // Ensure table exists
    await ensureMacroCalendarTable();

    // Parse data
    const parsed = parseExcelTable(pastedText);
    if (parsed.length === 0) {
      return NextResponse.json(
        { error: 'Nie udało się sparsować danych. Upewnij się, że wklejasz tabelę z kolumnami: Czas, Wal., Wydarzenie, itd.' },
        { status: 400 }
      );
    }

    // Debug: log first few parsed events to help diagnose issues
    if (process.env.NODE_ENV === 'development') {
      console.log('[Calendar Import] Parsed events sample:', parsed.slice(0, 5).map(e => ({
        date: e.date,
        time: e.time,
        event: e.event?.substring(0, 50),
      })));
    }

    // Clear existing if requested
    if (clearExisting) {
      await sql`DELETE FROM "MacroCalendarEvent"`;
    }

    // Insert events
    let inserted = 0;
    let skipped = 0;

    for (const item of parsed) {
      try {
        const id = randomBytes(16).toString('hex');
        const region = inferRegion(item.currency) || null;
        const importance = inferImportance(item.weight, item.event) || null;

        await sql`
          INSERT INTO "MacroCalendarEvent" (
            id, date, time, currency, event, weight, current, forecast, previous, region, importance
          ) VALUES (
            ${id},
            ${item.date},
            ${item.time || null},
            ${item.currency || null},
            ${item.event},
            ${item.weight || null},
            ${item.current || null},
            ${item.forecast || null},
            ${item.previous || null},
            ${region},
            ${importance}
          )
        `;
        inserted++;
      } catch (err: any) {
        // Skip duplicates or errors
        skipped++;
        console.error('[Calendar Import] Error inserting event:', err?.message, item);
      }
    }

    // Get date range of imported events for feedback
    const dateRange = parsed.length > 0 ? {
      min: parsed.reduce((min, e) => e.date < min ? e.date : min, parsed[0].date),
      max: parsed.reduce((max, e) => e.date > max ? e.date : max, parsed[0].date),
    } : null;

    return NextResponse.json(
      {
        success: true,
        message: `Zaimportowano ${inserted} wydarzeń${skipped > 0 ? ` (pominięto ${skipped})` : ''}.`,
        inserted,
        skipped,
        total: parsed.length,
        dateRange,
        sample: parsed.slice(0, 3).map(e => ({
          date: e.date,
          time: e.time,
          event: e.event?.substring(0, 50),
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Calendar Import] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Błąd podczas importu danych',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
