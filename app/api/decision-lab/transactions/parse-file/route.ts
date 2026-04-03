import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/decision-lab/transactions/parse-file
 * body: FormData with 'file' field
 * 
 * Parsuje plik Excel (XLSX, XLS) lub CSV i zwraca tekst do analizy
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getSession();
    const userId = session.userId || session.email;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check feature flag
    const hasDecisionLab = await hasFeature(userId, 'decision_lab');
    if (!hasDecisionLab) {
      return NextResponse.json({ error: 'feature_disabled' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Handle CSV/TXT files - just read as text
    if (fileExtension === 'csv' || fileExtension === 'txt') {
      const text = await file.text();
      return NextResponse.json({ 
        success: true,
        text: text,
        format: 'csv'
      });
    }

    // Handle Excel files (XLSX, XLS)
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Try to find the sheet with transaction data
      // Look for sheets with names like 'trades', 'transactions', 'statement', or use first sheet
      let sheetName = workbook.SheetNames[0];
      const lowerNames = workbook.SheetNames.map(n => n.toLowerCase());
      
      if (lowerNames.some(n => n.includes('trade') || n.includes('transaction') || n.includes('statement'))) {
        sheetName = workbook.SheetNames[lowerNames.findIndex(n => n.includes('trade') || n.includes('transaction') || n.includes('statement'))];
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to CSV format (this will preserve the structure)
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      
      return NextResponse.json({
        success: true,
        text: csvText,
        format: 'excel',
        sheet_name: sheetName
      });
    }

    return NextResponse.json({ 
      error: 'Nieobsługiwany format pliku. Obsługiwane formaty: CSV, TXT, XLSX, XLS' 
    }, { status: 400 });

  } catch (err: any) {
    console.error('File parsing error', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to parse file' 
    }, { status: 500 });
  }
}
