/**
 * Parser for trading statement CSV files
 * Handles RFC-4180 compliant CSV with proper quote and comma handling
 */

export interface ParsedTransaction {
  ticket?: string;
  openDate?: string;
  closeDate?: string;
  instrument: string;
  type: 'Buy' | 'Sell' | 'buy' | 'sell' | 'LONG' | 'SHORT' | 'long' | 'short';
  volume?: number;
  openPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  closePrice?: number;
  grossPnl?: number;
  swap?: number;
  commission?: number;
  netPnl: number;
}

/**
 * Parse a number string, handling:
 * - Comma to dot conversion (e.g., "25,50" -> 25.50)
 * - Space removal (e.g., "25 550" -> 25550)
 * - Quote removal
 * - Negative sign preservation
 */
function parseNumber(str: string | undefined | null): number | undefined {
  if (!str || typeof str !== 'string') return undefined;
  
  let cleaned = str.trim();
  
  // Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Preserve negative sign
  const isNegative = cleaned.startsWith('-');
  cleaned = cleaned.replace(/^[+-]/, '');
  
  // Remove spaces
  cleaned = cleaned.replace(/\s/g, '');
  
  // Replace comma with dot
  cleaned = cleaned.replace(/,/g, '.');
  
  // Remove any remaining non-numeric characters except dot
  cleaned = cleaned.replace(/[^\d.]/g, '');
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) return undefined;
  
  return isNegative ? -num : num;
}

/**
 * Simple CSV parser compliant with RFC-4180
 * Handles quoted fields with commas inside
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result.map(f => f.trim());
}

/**
 * Normalize column name for matching
 */
function normalizeColumnName(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find column index by matching normalized name
 */
function findColumnIndex(columns: string[], patterns: string[]): number | undefined {
  const normalizedColumns = columns.map(normalizeColumnName);
  
  for (const pattern of patterns) {
    const normalizedPattern = normalizeColumnName(pattern);
    const index = normalizedColumns.findIndex(col => 
      col === normalizedPattern || col.includes(normalizedPattern) || normalizedPattern.includes(col)
    );
    if (index !== -1) return index;
  }
  
  return undefined;
}

/**
 * Parse trading statement from CSV text
 */
export function parseStatement(text: string): {
  transactions: ParsedTransaction[];
  parseError?: string;
} {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length < 2) {
    return { transactions: [], parseError: 'Statement zawiera zbyt mało linii (min. 2: nagłówek + 1 transakcja)' };
  }

  // Detect header row
  const headerLine = lines[0];
  const hasHeader = /ticket|instrument|type|pnl|profit|loss/i.test(headerLine);
  
  if (!hasHeader) {
    return { transactions: [], parseError: 'Nie znaleziono nagłówka CSV. Wymagane kolumny: Ticket, Instrument, Type, Net P&L (lub podobne)' };
  }

  // Parse header
  const headerColumns = parseCSVLine(headerLine);
  
  // Map column indices
  const colIndices: {
    ticket?: number;
    openDate?: number;
    closeDate?: number;
    instrument?: number;
    type?: number;
    volume?: number;
    openPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    closePrice?: number;
    grossPnl?: number;
    swap?: number;
    commission?: number;
    netPnl?: number;
  } = {};

  // Find required columns
  colIndices.ticket = findColumnIndex(headerColumns, ['Ticket', 'ID', 'Id']);
  colIndices.openDate = findColumnIndex(headerColumns, ['Open Date', 'OpenDate', 'Data Otwarcia', 'Open Time']);
  colIndices.closeDate = findColumnIndex(headerColumns, ['Close Date', 'CloseDate', 'Data Zamknięcia', 'Close Time']);
  colIndices.instrument = findColumnIndex(headerColumns, ['Instrument', 'Symbol', 'Asset', 'Pair']);
  colIndices.type = findColumnIndex(headerColumns, ['Type', 'Direction', 'Side', 'Typ']);
  colIndices.volume = findColumnIndex(headerColumns, ['Volume', 'Lot', 'Size', 'Wielkość']);
  colIndices.openPrice = findColumnIndex(headerColumns, ['Open Price', 'OpenPrice', 'Entry', 'Entry Price']);
  colIndices.stopLoss = findColumnIndex(headerColumns, ['Stop Loss', 'StopLoss', 'SL', 'Stop']);
  colIndices.takeProfit = findColumnIndex(headerColumns, ['Take Profit', 'TakeProfit', 'TP', 'Target']);
  colIndices.closePrice = findColumnIndex(headerColumns, ['Close Price', 'ClosePrice', 'Exit', 'Exit Price']);
  colIndices.grossPnl = findColumnIndex(headerColumns, ['Gross P&L', 'Gross P/L', 'Gross PnL', 'Gross PL', 'P&L Brutto']);
  colIndices.swap = findColumnIndex(headerColumns, ['Swap', 'Rollover', 'Interest']);
  colIndices.commission = findColumnIndex(headerColumns, ['Commission', 'Comm', 'Fee', 'Prowizja']);
  colIndices.netPnl = findColumnIndex(headerColumns, ['Net P&L', 'Net P/L', 'Net PnL', 'Net PL', 'P&L Netto', 'Netto']);

  // Check required columns
  if (colIndices.instrument === undefined) {
    return { transactions: [], parseError: 'Nie znaleziono kolumny Instrument/Symbol w nagłówku CSV' };
  }
  
  if (colIndices.type === undefined) {
    return { transactions: [], parseError: 'Nie znaleziono kolumny Type/Direction w nagłówku CSV' };
  }
  
  if (colIndices.netPnl === undefined) {
    // Try to find any P&L column as fallback
    if (colIndices.grossPnl !== undefined) {
      colIndices.netPnl = colIndices.grossPnl;
    } else {
      return { transactions: [], parseError: 'Nie znaleziono kolumny Net P&L w nagłówku CSV' };
    }
  }

  // Parse data rows
  const transactions: ParsedTransaction[] = [];
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    
    // Skip empty lines or lines that look like headers/footers
    if (!line || line.length < 5) continue;
    
    // Skip lines that are clearly headers (contain multiple header words)
    const headerWords = ['ticket', 'data', 'instrument', 'type', 'volume', 'pnl', 'profit', 'loss', 'swap', 'commission', 'total', 'sum'];
    const lowerLine = normalizeColumnName(line);
    const headerWordCount = headerWords.filter(word => lowerLine.includes(word)).length;
    if (headerWordCount >= 3) {
      continue;
    }

    // Parse CSV line
    const parts = parseCSVLine(line);
    
    if (parts.length < 3) {
      // Try tab-separated as fallback
      const tabParts = line.split('\t').map(p => p.trim());
      if (tabParts.length >= 3) {
        // Use tab-separated parts but map to header indices
        // This won't work perfectly but might help
        continue; // For now, skip tab-separated if CSV parsing failed
      }
      continue;
    }

    // Extract fields using column indices
    const instrument = parts[colIndices.instrument!]?.toUpperCase().trim();
    const type = parts[colIndices.type!]?.trim();
    const netPnl = parseNumber(parts[colIndices.netPnl!]);

    // Validate required fields
    if (!instrument || !/^[A-Z]{2,6}$/.test(instrument)) continue;
    if (!type || !/^(Buy|Sell|LONG|SHORT|buy|sell|long|short)$/i.test(type)) continue;
    if (netPnl === undefined || !isFinite(netPnl)) continue;

    // Build transaction object
    const transaction: ParsedTransaction = {
      instrument,
      type: type as any,
      netPnl,
    };

    // Add optional fields
    if (colIndices.ticket !== undefined) {
      transaction.ticket = parts[colIndices.ticket]?.trim();
    }
    if (colIndices.openDate !== undefined) {
      transaction.openDate = parts[colIndices.openDate]?.trim();
    }
    if (colIndices.closeDate !== undefined) {
      transaction.closeDate = parts[colIndices.closeDate]?.trim();
    }
    if (colIndices.volume !== undefined) {
      transaction.volume = parseNumber(parts[colIndices.volume]);
    }
    if (colIndices.openPrice !== undefined) {
      transaction.openPrice = parseNumber(parts[colIndices.openPrice]);
    }
    if (colIndices.stopLoss !== undefined) {
      transaction.stopLoss = parseNumber(parts[colIndices.stopLoss]);
    }
    if (colIndices.takeProfit !== undefined) {
      transaction.takeProfit = parseNumber(parts[colIndices.takeProfit]);
    }
    if (colIndices.closePrice !== undefined) {
      transaction.closePrice = parseNumber(parts[colIndices.closePrice]);
    }
    if (colIndices.grossPnl !== undefined && colIndices.grossPnl !== colIndices.netPnl) {
      transaction.grossPnl = parseNumber(parts[colIndices.grossPnl]);
    }
    if (colIndices.swap !== undefined) {
      transaction.swap = parseNumber(parts[colIndices.swap]);
    }
    if (colIndices.commission !== undefined) {
      transaction.commission = parseNumber(parts[colIndices.commission]);
    }

    transactions.push(transaction);
  }

  if (transactions.length === 0) {
    return { transactions: [], parseError: 'Nie udało się sparsować żadnej transakcji. Sprawdź format CSV - wymagane kolumny: Instrument, Type, Net P&L' };
  }

  return { transactions };
}