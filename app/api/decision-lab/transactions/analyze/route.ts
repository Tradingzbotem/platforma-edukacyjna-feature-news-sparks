import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Types for parsed transactions
interface ParsedTransaction {
  ticket?: string;
  openDate?: string;
  closeDate?: string;
  instrument: string;
  type: 'Buy' | 'Sell' | 'buy' | 'sell' | 'LONG' | 'SHORT' | 'long' | 'short';
  volume?: number;
  openPrice?: number;
  closePrice?: number;
  grossPnl?: number;
  swap?: number;
  commission?: number;
  netPnl: number;
}

interface CalculatedMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPnl: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
  byInstrument: Record<string, {
    trades: number;
    wins: number;
    losses: number;
    netPnl: number;
    winRate: number;
  }>;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  _validation?: {
    sumByInstrument: number;
    pnlDifference: number;
    isValid: boolean;
  };
}

// Parse transaction statement
function parseStatement(text: string): ParsedTransaction[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Try to detect header row
  const headerLine = lines[0].toLowerCase();
  const hasHeader = /ticket|data|instrument|type|volume|pnl|profit|loss/i.test(headerLine);
  
  // Try to detect column positions from header
  let headerCols: string[] = [];
  let colIndices: { [key: string]: number } = {};
  
  if (hasHeader) {
    // Try different separators for header: CSV (commas), tabs, or multiple spaces
    if (lines[0].includes(',') && !lines[0].includes('\t')) {
      headerCols = lines[0].split(',').map(h => h.trim().toLowerCase());
    } else if (lines[0].includes('\t')) {
      headerCols = lines[0].split('\t').map(h => h.trim().toLowerCase());
    } else {
      headerCols = lines[0].split(/\s{2,}/).map(h => h.trim().toLowerCase());
    }
    
    // Map column names to indices - be more aggressive in matching
    headerCols.forEach((col, idx) => {
      const colLower = col.toLowerCase();
      // Remove special characters for matching
      const colClean = colLower.replace(/[^\w\s]/g, ' ').trim();
      
      if (colClean.includes('instrument') || colClean.includes('symbol') || colClean === 'symbol' || colClean === 'instrument') {
        colIndices.instrument = idx;
      }
      if (colClean.includes('type') || colClean.includes('direction') || colClean === 'type' || colClean === 'direction' || colClean === 'typ') {
        colIndices.type = idx;
      }
      
      // P&L detection - check for various patterns including Polish
      const isNetPnl = (colClean.includes('net') && (colClean.includes('pnl') || colClean.includes('pl'))) ||
                      colClean === 'net pnl' || colClean === 'net pl' ||
                      colClean.includes('pnl netto') || colClean.includes('pl netto') ||
                      colClean.includes('netto');
      
      const isGrossPnl = (colClean.includes('gross') && (colClean.includes('pnl') || colClean.includes('pl'))) ||
                         colClean === 'gross pnl' || colClean === 'gross pl' ||
                         colClean.includes('pnl brutto') || colClean.includes('pl brutto') ||
                         colClean.includes('brutto');
      
      const isAnyPnl = colClean.includes('pnl') || colClean.includes('pl') || 
                       colClean.includes('profit') || colClean.includes('loss') ||
                       colClean.includes('zysk') || colClean.includes('strata') ||
                       colClean.includes('wynik');
      
      if (isNetPnl) {
        colIndices.netPnl = idx; // Net P&L takes priority
      } else if (isGrossPnl) {
        colIndices.grossPnl = idx;
      } else if (isAnyPnl && colIndices.netPnl === undefined) {
        // Use first P&L column found if net not found
        colIndices.netPnl = idx;
      }
      if (colLower.includes('ticket') || colLower.includes('id') || colLower === 'ticket' || colLower === 'id') {
        colIndices.ticket = idx;
      }
      if ((colLower.includes('open') && colLower.includes('date')) || colLower === 'open date' || colLower === 'data otwarcia') {
        colIndices.openDate = idx;
      }
      if ((colLower.includes('close') && colLower.includes('date')) || colLower === 'close date' || colLower === 'data zamknięcia') {
        colIndices.closeDate = idx;
      }
      if (colLower.includes('volume') || colLower.includes('lot') || colLower === 'volume' || colLower === 'lot') {
        colIndices.volume = idx;
      }
    });
    
    console.log('Detected column indices:', colIndices);
  }
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const transactions: ParsedTransaction[] = [];
  const skippedLines: string[] = [];

  for (let lineIdx = 0; lineIdx < dataLines.length; lineIdx++) {
    const line = dataLines[lineIdx];
    
    // Skip empty lines or lines that look like headers
    if (!line || line.length < 10) continue;
    
    // Skip lines that are clearly headers (contain multiple header words)
    const headerWords = ['ticket', 'data', 'instrument', 'type', 'volume', 'pnl', 'profit', 'loss', 'swap', 'commission'];
    const lowerLine = line.toLowerCase();
    const headerWordCount = headerWords.filter(word => lowerLine.includes(word)).length;
    if (headerWordCount >= 3) {
      console.log(`Skipping line ${lineIdx + 1} (looks like header): ${line.substring(0, 80)}`);
      continue;
    }
    
    // Try different separators: CSV (commas), tabs, or multiple spaces
    let parts: string[] = [];
    let detectedFormat = 'unknown';
    
    // First try CSV format (comma-separated)
    if (line.includes(',') && !line.includes('\t')) {
      parts = line.split(',').map(p => p.trim());
      detectedFormat = 'CSV';
    }
    // Then try tab-separated (common in broker exports)
    else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
      detectedFormat = 'TAB';
    }
    // Then try multiple spaces
    else if (/\s{2,}/.test(line)) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
      detectedFormat = 'SPACES';
    }
    // Last resort: single space (but be more careful)
    else if (line.includes(' ')) {
      const spaceParts = line.split(/\s+/).map(p => p.trim());
      if (spaceParts.length >= 5) { // More parts = more likely to be a transaction
        parts = spaceParts;
        detectedFormat = 'SINGLE_SPACE';
      }
    }
    
    if (parts.length < 3) {
      console.log(`Skipping line ${lineIdx + 1} (format: ${detectedFormat}, parts: ${parts.length}): ${line.substring(0, 80)}`);
      continue;
    }
    
    // Log format detection for first few lines
    if (lineIdx < 3) {
      console.log(`Line ${lineIdx + 1} format: ${detectedFormat}, parts: ${parts.length}, first 3 parts: [${parts.slice(0, 3).join(', ')}]`);
    }

    const transaction: Partial<ParsedTransaction> = {};
    const originalLine = line; // Keep for debugging
    
    // Extract fields using column indices if available
    if (hasHeader && Object.keys(colIndices).length > 0) {
      if (colIndices.instrument !== undefined && parts[colIndices.instrument]) {
        transaction.instrument = parts[colIndices.instrument].toUpperCase();
      }
      if (colIndices.type !== undefined && parts[colIndices.type]) {
        transaction.type = parts[colIndices.type] as any;
      }
      if (colIndices.netPnl !== undefined && parts[colIndices.netPnl]) {
        // Remove all spaces, plus signs, and replace comma with dot
        // Preserve negative sign
        let pnlStr = parts[colIndices.netPnl].replace(/\s/g, '');
        const isNegative = pnlStr.startsWith('-');
        pnlStr = pnlStr.replace(/[+]/g, '').replace(/,/g, '.');
        if (isNegative && !pnlStr.startsWith('-')) {
          pnlStr = '-' + pnlStr;
        }
        const pnl = parseFloat(pnlStr);
        if (!isNaN(pnl)) {
          transaction.netPnl = pnl;
        }
      }
      // Also try gross P&L if net P&L not found
      if (transaction.netPnl === undefined && colIndices.grossPnl !== undefined && parts[colIndices.grossPnl]) {
        let pnlStr = parts[colIndices.grossPnl].replace(/\s/g, '');
        const isNegative = pnlStr.startsWith('-');
        pnlStr = pnlStr.replace(/[+]/g, '').replace(/,/g, '.');
        if (isNegative && !pnlStr.startsWith('-')) {
          pnlStr = '-' + pnlStr;
        }
        const pnl = parseFloat(pnlStr);
        if (!isNaN(pnl)) {
          transaction.netPnl = pnl;
        }
      }
      if (colIndices.ticket !== undefined && parts[colIndices.ticket]) {
        transaction.ticket = parts[colIndices.ticket];
      }
      if (colIndices.openDate !== undefined && parts[colIndices.openDate]) {
        transaction.openDate = parts[colIndices.openDate];
      }
      if (colIndices.closeDate !== undefined && parts[colIndices.closeDate]) {
        transaction.closeDate = parts[colIndices.closeDate];
      }
      if (colIndices.volume !== undefined && parts[colIndices.volume]) {
        const volStr = parts[colIndices.volume].replace(/\s/g, '').replace(',', '.');
        const vol = parseFloat(volStr);
        if (!isNaN(vol)) {
          transaction.volume = vol;
        }
      }
    } else if (hasHeader && colIndices.netPnl === undefined) {
      // Header exists but P&L column not found - try to find it by scanning all columns
      // P&L is usually one of the last columns with larger numeric values
      for (let i = Math.max(0, parts.length - 5); i < parts.length; i++) {
        const part = parts[i];
        const cleaned = part.replace(/\s/g, '').replace(/[+]/g, '').replace(/,/g, '.');
        const value = parseFloat(cleaned);
        if (!isNaN(value) && Math.abs(value) >= 10) { // P&L values are usually >= 10
          // Check if this looks like P&L (has sign or is in typical P&L position)
          if (/[+-]/.test(part) || i >= parts.length - 3) {
            transaction.netPnl = value;
            break;
          }
        }
      }
    }
    
    // Fallback: try to extract from line if column-based parsing didn't work
    if (!transaction.instrument) {
      // Try multiple patterns for instrument
      const instrumentMatch = line.match(/\b([A-Z]{2,6})\b/);
      if (instrumentMatch) {
        transaction.instrument = instrumentMatch[1];
      } else {
        // Try to find instrument in common positions
        // CSV format: ticket,date,date,INSTRUMENT,type,...
        // So instrument is usually at index 3 (4th column)
        if (parts.length >= 4) {
          // Check common positions: 3, 2, 4, 5
          const positions = [3, 2, 4, 5];
          for (const i of positions) {
            if (i < parts.length && /^[A-Z]{2,6}$/.test(parts[i])) {
              transaction.instrument = parts[i];
              break;
            }
          }
          // If not found, scan all parts
          if (!transaction.instrument) {
            for (let i = 0; i < Math.min(parts.length, 10); i++) {
              if (/^[A-Z]{2,6}$/.test(parts[i])) {
                transaction.instrument = parts[i];
                break;
              }
            }
          }
        }
      }
    }

    if (!transaction.type) {
      const typeMatch = line.match(/\b(Buy|Sell|LONG|SHORT|long|short|buy|sell)\b/i);
      if (typeMatch) {
        transaction.type = typeMatch[1] as any;
      } else {
        // Try to find type in common positions
        // CSV format: ticket,date,date,instrument,TYPE,...
        // So type is usually at index 4 (5th column)
        if (parts.length >= 5) {
          // Check common positions: 4, 3, 5
          const positions = [4, 3, 5];
          for (const i of positions) {
            if (i < parts.length) {
              const part = parts[i].toUpperCase();
              if (part === 'BUY' || part === 'SELL' || part === 'LONG' || part === 'SHORT') {
                transaction.type = parts[i] as any;
                break;
              }
            }
          }
          // If not found, scan all parts
          if (!transaction.type) {
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i].toUpperCase();
              if (part === 'BUY' || part === 'SELL' || part === 'LONG' || part === 'SHORT') {
                transaction.type = parts[i] as any;
                break;
              }
            }
          }
        }
      }
    }

    if (transaction.netPnl === undefined) {
      // Try to find P&L in all parts - check each column for P&L-like values
      // P&L is usually one of the last columns and has larger absolute values
      const pnlCandidates: { value: number; index: number; hasSign: boolean; original: string }[] = [];
      
      // In CSV format, net_pnl is usually the last column
      // Try last column first if it looks like a number
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1].trim();
        let cleaned = lastPart.replace(/\s/g, '');
        const isNegative = cleaned.startsWith('-');
        cleaned = cleaned.replace(/[+]/g, '').replace(/,/g, '.');
        if (isNegative && !cleaned.startsWith('-')) {
          cleaned = '-' + cleaned;
        }
        const lastValue = parseFloat(cleaned);
        if (!isNaN(lastValue) && Math.abs(lastValue) > 0.01) {
          // Last column with a number is likely P&L
          transaction.netPnl = lastValue;
        }
      }
      
      // If last column didn't work, check all parts
      if (transaction.netPnl === undefined) {
        // Check each part for P&L-like values
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          // Skip if it looks like an instrument, type, date, or ticket
          if (/^[A-Z]{2,6}$/.test(part) || /^(Buy|Sell|LONG|SHORT)$/i.test(part) || 
              /^\d{4}-\d{2}-\d{2}/.test(part) || /^\d{5,}$/.test(part)) {
            continue;
          }
        
          // Try to parse as number - preserve negative sign
          // Remove spaces, but keep minus sign for negative values
          let cleaned = part.replace(/\s/g, '');
          // Check if it starts with minus (negative value)
          const isNegative = cleaned.startsWith('-');
          cleaned = cleaned.replace(/[+]/g, '').replace(/,/g, '.');
          // If it was negative, ensure minus is preserved
          if (isNegative && !cleaned.startsWith('-')) {
            cleaned = '-' + cleaned;
          }
          const value = parseFloat(cleaned);
          
          if (!isNaN(value) && Math.abs(value) > 0.01) {
            // P&L values are usually larger (hundreds or thousands)
            // and often have signs or are in later columns
            const hasSign = /[+-]/.test(part);
            const isLargeValue = Math.abs(value) >= 10;
            const isLaterColumn = i >= Math.floor(parts.length * 0.5); // Second half of columns
            
            if (isLargeValue || hasSign || isLaterColumn) {
              pnlCandidates.push({ value, index: i, hasSign, original: part });
            }
          }
        }
        
        // Sort candidates: prefer signed values, then larger absolute values, then later columns
        pnlCandidates.sort((a, b) => {
          if (a.hasSign && !b.hasSign) return -1;
          if (!a.hasSign && b.hasSign) return 1;
          if (Math.abs(a.value) !== Math.abs(b.value)) {
            return Math.abs(b.value) - Math.abs(a.value);
          }
          return b.index - a.index; // Later columns preferred
        });
        
        // Also try regex patterns as fallback
        if (pnlCandidates.length === 0) {
          // Improved regex to capture negative values better
          const pnlPattern1 = /([+-]?\s*\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)/g;
          const pnlPattern2 = /(-?\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)/g;
          
          let pnlMatches = line.match(pnlPattern1);
          if (!pnlMatches || pnlMatches.length === 0) {
            pnlMatches = line.match(pnlPattern2);
          }
          
          if (pnlMatches && pnlMatches.length > 0) {
            const regexCandidates = pnlMatches
              .map(match => {
                let cleaned = match.replace(/\s/g, '');
                const isNegative = cleaned.startsWith('-');
                cleaned = cleaned.replace(/[+]/g, '').replace(/,/g, '.');
                if (isNegative && !cleaned.startsWith('-')) {
                  cleaned = '-' + cleaned;
                }
                const value = parseFloat(cleaned);
                return { value, hasSign: /[+-]/.test(match), original: match };
              })
              .filter(c => !isNaN(c.value) && Math.abs(c.value) > 0.01)
              .sort((a, b) => {
                if (a.hasSign && !b.hasSign) return -1;
                if (!a.hasSign && b.hasSign) return 1;
                return Math.abs(b.value) - Math.abs(a.value);
              });
            
            if (regexCandidates.length > 0) {
              transaction.netPnl = regexCandidates[0].value;
            }
          }
        } else {
          // Use the best candidate from column analysis
          transaction.netPnl = pnlCandidates[0].value;
        }
      }
    }

    // If we have instrument, type, and P&L, we have a valid transaction
    if (transaction.instrument && transaction.type && transaction.netPnl !== undefined) {
      const parsedTx = {
        instrument: transaction.instrument,
        type: transaction.type,
        netPnl: transaction.netPnl,
        ...transaction,
      } as ParsedTransaction;
      
      transactions.push(parsedTx);
      
      // Log each parsed transaction for debugging with full details
      console.log(`✓ [${transactions.length}] ${parsedTx.instrument} ${parsedTx.type} P&L=${parsedTx.netPnl.toFixed(2)} | Line: ${line.substring(0, 80)}`);
    } else {
      // Log skipped lines for debugging with details
      if (line.length > 20) {
        const missing = [];
        if (!transaction.instrument) missing.push('instrument');
        if (!transaction.type) missing.push('type');
        if (transaction.netPnl === undefined) missing.push('P&L');
        
        console.log(`✗ Skipped line ${lineIdx + 1} (missing: ${missing.join(', ')}): ${line.substring(0, 100)}`);
        skippedLines.push(line.substring(0, 100));
      }
    }
  }

  // Log parsing results
  console.log(`\n=== PARSING SUMMARY ===`);
  console.log(`Total data lines: ${dataLines.length}`);
  console.log(`Successfully parsed: ${transactions.length} transactions`);
  console.log(`Skipped lines: ${skippedLines.length}`);
  
  if (skippedLines.length > 0 && transactions.length > 0) {
    console.log(`\nSkipped lines (first 10):`);
    skippedLines.slice(0, 10).forEach((line, idx) => {
      console.log(`  ${idx + 1}. ${line}`);
    });
  }
  
  // Estimate expected transaction count (data lines minus potential headers/footers)
  const estimatedTransactions = Math.max(1, dataLines.length - 2); // Subtract 2 for potential header/footer
  const parseRate = transactions.length / estimatedTransactions;
  
  if (parseRate < 0.7 && transactions.length > 0) {
    console.warn(`\n⚠️  WARNING: Low parse rate (${(parseRate * 100).toFixed(1)}%). Expected ~${estimatedTransactions} transactions, parsed ${transactions.length}`);
    console.warn(`This may indicate parser issues. Check skipped lines above.`);
  }
  
  console.log(`=== END PARSING SUMMARY ===\n`);

  return transactions;
}

// Calculate metrics from parsed transactions
function calculateMetrics(transactions: ParsedTransaction[]): CalculatedMetrics {
  if (transactions.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netPnl: 0,
      averageWin: 0,
      averageLoss: 0,
      riskRewardRatio: 0,
      byInstrument: {},
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      _validation: {
        sumByInstrument: 0,
        pnlDifference: 0,
        isValid: true,
      },
    };
  }

  const wins = transactions.filter(t => t.netPnl > 0);
  const losses = transactions.filter(t => t.netPnl < 0);
  const totalProfit = wins.reduce((sum, t) => sum + t.netPnl, 0);
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.netPnl, 0));
  const netPnl = transactions.reduce((sum, t) => sum + t.netPnl, 0);

  // Group by instrument
  const byInstrument: Record<string, {
    trades: number;
    wins: number;
    losses: number;
    netPnl: number;
    winRate: number;
  }> = {};

  for (const t of transactions) {
    if (!byInstrument[t.instrument]) {
      byInstrument[t.instrument] = {
        trades: 0,
        wins: 0,
        losses: 0,
        netPnl: 0,
        winRate: 0,
      };
    }
    byInstrument[t.instrument].trades++;
    byInstrument[t.instrument].netPnl += t.netPnl;
    if (t.netPnl > 0) {
      byInstrument[t.instrument].wins++;
    } else if (t.netPnl < 0) {
      byInstrument[t.instrument].losses++;
    }
  }

  // Calculate win rates per instrument
  for (const inst in byInstrument) {
    const stats = byInstrument[inst];
    stats.winRate = stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0;
  }

  // VALIDATION: Sum of per-instrument P&L must equal global P&L
  const sumByInstrument = Object.values(byInstrument).reduce((sum, stats) => sum + stats.netPnl, 0);
  const pnlDifference = Math.abs(netPnl - sumByInstrument);
  
  if (pnlDifference > 0.01) {
    console.error('CRITICAL: P&L mismatch detected!', {
      globalNetPnl: netPnl,
      sumByInstrument,
      difference: pnlDifference,
      transactionsCount: transactions.length,
      byInstrument: Object.entries(byInstrument).map(([inst, stats]) => ({
        instrument: inst,
        trades: stats.trades,
        netPnl: stats.netPnl,
      })),
    });
    // Still return, but log the error - this should never happen if parser works correctly
  }

  const averageWin = wins.length > 0 ? totalProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;
  const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.netPnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.netPnl)) : 0;

  return {
    totalTrades: transactions.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: transactions.length > 0 ? (wins.length / transactions.length) * 100 : 0,
    totalProfit,
    totalLoss,
    netPnl,
    averageWin,
    averageLoss,
    riskRewardRatio,
    byInstrument,
    largestWin,
    largestLoss,
    profitFactor,
    _validation: {
      sumByInstrument,
      pnlDifference,
      isValid: pnlDifference <= 0.01,
    },
  };
}

/**
 * POST /api/decision-lab/transactions/analyze
 * body: { statement_text: string }
 * 
 * Analizuje statement transakcji przez AI i generuje rekomendacje
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

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const data = await req.json();
    const { statement_text } = data || {};

    if (!statement_text || typeof statement_text !== 'string' || statement_text.trim().length === 0) {
      return NextResponse.json({ error: 'Statement text is required' }, { status: 400 });
    }

    if (statement_text.length > 50000) {
      return NextResponse.json({ error: 'Statement text too long (max 50000 characters)' }, { status: 400 });
    }

    // Validate that the statement contains sufficient information for analysis
    const trimmedText = statement_text.trim();
    
    // Check if input is too short or looks like incomplete data
    // Minimum reasonable statement should have at least 100 characters or contain multiple data points
    if (trimmedText.length < 100) {
      return NextResponse.json({ 
        error: 'Statement jest zbyt krótki. Wklej pełny statement transakcji zawierający szczegóły transakcji (kierunek, czas, P&L, wielkość pozycji, itp.).' 
      }, { status: 400 });
    }

    // Check for common patterns that indicate a complete statement
    // A proper statement should contain multiple transactions or structured data
    const hasMultipleLines = trimmedText.split('\n').filter(line => line.trim().length > 0).length >= 3;
    const hasNumbers = /\d+/.test(trimmedText); // Should contain numbers (prices, P&L, etc.)
    const hasDatesOrTimes = /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}|\d{2}:\d{2}|date|time|czas|data)/i.test(trimmedText);
    const hasTradingTerms = /(buy|sell|long|short|open|close|entry|exit|profit|loss|pnl|volume|size|lot|kup|sprzedaj|otwarcie|zamknięcie|zysk|strata|wielkość)/i.test(trimmedText);
    
    // Check if it looks like just a symbol and direction (e.g., "us100 up")
    const isMinimalInput = /^[a-z0-9]+\s+(up|down|long|short|kup|sprzedaj)$/i.test(trimmedText);
    
    if (isMinimalInput) {
      return NextResponse.json({ 
        error: 'Wprowadzony tekst jest zbyt krótki i nie zawiera pełnych informacji o transakcjach. Wklej pełny statement transakcji z Twojego brokera zawierający:\n- Listę transakcji z datami/czasem\n- Kierunki transakcji (buy/sell, long/short)\n- Wartości P&L (profit/loss)\n- Wielkości pozycji\n- Symbole instrumentów\n\nPrzykład: CSV lub tekst z wieloma transakcjami z pełnymi szczegółami.' 
      }, { status: 400 });
    }

    // Require at least some indicators of a complete statement
    const hasStructure = hasMultipleLines || (hasNumbers && (hasDatesOrTimes || hasTradingTerms));
    
    if (!hasStructure) {
      return NextResponse.json({ 
        error: 'Statement nie zawiera wystarczających informacji do analizy. Wklej pełny statement transakcji zawierający:\n- Listę transakcji z datami/czasem\n- Kierunki transakcji (buy/sell, long/short)\n- Wartości P&L (profit/loss)\n- Wielkości pozycji\n- Symbole instrumentów\n\nPrzykład: CSV lub tekst z wieloma transakcjami z pełnymi szczegółami.' 
      }, { status: 400 });
    }

    // Parse and calculate metrics FIRST (before AI)
    const transactions = parseStatement(trimmedText);
    
    // Estimate expected transaction count from raw text
    const lineCount = trimmedText.split('\n').filter(l => l.trim().length > 10).length;
    const estimatedTransactions = Math.max(1, lineCount - 2); // Subtract header/footer
    
    // Log parsing results for debugging
    console.log(`\n=== STATEMENT ANALYSIS ===`);
    console.log(`Total lines in statement: ${lineCount}`);
    console.log(`Estimated transactions: ~${estimatedTransactions}`);
    console.log(`Parsed transactions: ${transactions.length}`);
    
    if (transactions.length === 0) {
      return NextResponse.json({ 
        error: 'Nie udało się sparsować transakcji ze statementu. Upewnij się, że statement zawiera listę transakcji z instrumentami, kierunkami (Buy/Sell) i wartościami P&L.' 
      }, { status: 400 });
    }

    if (transactions.length < 3) {
      return NextResponse.json({ 
        error: 'Statement zawiera zbyt mało transakcji do analizy. Wymagane minimum 3 transakcje.' 
      }, { status: 400 });
    }
    
    // WARNING: Check if we parsed significantly fewer transactions than expected
    const parseRate = transactions.length / estimatedTransactions;
    if (parseRate < 0.7 && estimatedTransactions > 5) {
      console.warn(`\n⚠️  WARNING: Parsed only ${transactions.length} of ~${estimatedTransactions} expected transactions (${(parseRate * 100).toFixed(1)}%)`);
      console.warn(`This may indicate that some transactions were missed by the parser.`);
    }
    
    if (transactions.length > 0) {
      console.log('Instruments found:', Array.from(new Set(transactions.map(t => t.instrument))));
      console.log('Sample transaction:', {
        instrument: transactions[0].instrument,
        type: transactions[0].type,
        netPnl: transactions[0].netPnl,
      });
    }

    const metrics = calculateMetrics(transactions);
    
    // CRITICAL VALIDATION: Check if P&L sum is consistent
    if (metrics._validation && !metrics._validation.isValid) {
      console.error('\n❌ CRITICAL P&L VALIDATION FAILED:');
      console.error(`  Global Net P&L: ${metrics.netPnl.toFixed(2)}`);
      console.error(`  Sum by Instrument: ${metrics._validation.sumByInstrument.toFixed(2)}`);
      console.error(`  Difference: ${metrics._validation.pnlDifference.toFixed(2)}`);
      console.error(`  Transactions parsed: ${transactions.length}`);
      console.error('This indicates a parser bug - P&L aggregation is inconsistent!');
    } else if (metrics._validation) {
      console.log(`✓ P&L validation passed: ${metrics.netPnl.toFixed(2)} (difference: ${metrics._validation.pnlDifference.toFixed(2)})`);
    }
    
    // Log calculated metrics for debugging
    console.log('\n=== CALCULATED METRICS ===');
    console.log(`  Total Trades: ${metrics.totalTrades}`);
    console.log(`  Winning Trades: ${metrics.winningTrades}`);
    console.log(`  Losing Trades: ${metrics.losingTrades}`);
    console.log(`  Win Rate: ${metrics.winRate.toFixed(1)}%`);
    console.log(`  Total Profit: ${metrics.totalProfit.toFixed(2)}`);
    console.log(`  Total Loss: ${metrics.totalLoss.toFixed(2)}`);
    console.log(`  Net P&L: ${metrics.netPnl.toFixed(2)}`);
    console.log(`  Average Win: ${metrics.averageWin.toFixed(2)}`);
    console.log(`  Average Loss: ${metrics.averageLoss.toFixed(2)}`);
    console.log(`  Risk/Reward Ratio: ${metrics.riskRewardRatio.toFixed(2)}`);
    console.log(`  Profit Factor: ${metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}`);
    console.log('\nBy Instrument (detailed):');
    Object.entries(metrics.byInstrument).forEach(([inst, stats]) => {
      console.log(`  ${inst}:`);
      console.log(`    Trades: ${stats.trades}`);
      console.log(`    Wins: ${stats.wins}, Losses: ${stats.losses}`);
      console.log(`    Win Rate: ${stats.winRate.toFixed(1)}%`);
      console.log(`    Net P&L: ${stats.netPnl.toFixed(2)}`);
    });
    console.log(`=== END STATEMENT ANALYSIS ===\n`);

    // Prepare data for AI interpretation (AI only interprets, doesn't calculate)
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Jesteś ekspertem analizującym statementy transakcji rynkowych w kontekście edukacyjnym.
Twoim zadaniem jest INTERPRETOWAĆ obliczone metryki i dostarczyć analizę opisową opartą na faktach.

KRYTYCZNE ZASADY (MUSISZ PRZESTRZEGAĆ):
1. NIE obliczaj metryk - użyj TYLKO wartości z sekcji "obliczone_metryki"
2. NIE przypisuj stanów emocjonalnych bez danych behawioralnych (czas reakcji, modyfikacje SL, itp.)
3. NIE generuj ogólnych coachingowych fraz bez podstaw w danych
4. Bazuj TYLKO na faktach z obliczonych metryk
5. Jeśli brakuje danych do wniosku - nie wyciągaj go
6. NIE sugeruj działań operacyjnych (zakazane słowa: "zwiększyć", "ograniczyć", "należy", "powinieneś", "trzeba")
7. OPISUJ tylko fakty historyczne, nie sugeruj zmian w strategii
8. Używaj formy opisowej: "Dane pokazują...", "Analiza wykazuje...", "W okresie analizowanym..."

ZAKAZANE FORMY (compliance):
❌ "Zwiększyć udział transakcji na X"
❌ "Ograniczyć transakcje na Y"
❌ "Należy skupić się na Z"
✅ "Dane historyczne pokazują wyższy udział transakcji zyskownych na X"
✅ "W analizowanym okresie transakcje na Y charakteryzowały się..."
✅ "Instrument Z wykazał w okresie analizowanym..."

Analizuj:
1. Opisz statystyki (win rate, R:R ratio, profit factor) jako fakty historyczne
2. Porównaj wyniki per instrument na podstawie obliczonych metryk - tylko opisowo
3. Wskaż mocne strony i obszary do poprawy na podstawie danych - jako obserwacje, nie rekomendacje
4. Sformułuj obserwacje oparte na faktach, bez sugestii operacyjnych
5. Unikaj wniosków o emocjach, psychologii, over-tradingu bez danych behawioralnych
6. Sprawdź fakty narracyjne - jeśli mówisz o częstotliwości, sprawdź dane

ODPOWIEDZ W FORMACIE JSON:
{
  "summary": {
    "total_trades": number (użyj z obliczonych_metryki),
    "winning_trades": number (użyj z obliczonych_metryki),
    "losing_trades": number (użyj z obliczonych_metryki),
    "win_rate": number (użyj z obliczonych_metryki),
    "total_profit": number (użyj z obliczonych_metryki),
    "total_loss": number (użyj z obliczonych_metryki),
    "net_pnl": number (użyj z obliczonych_metryki),
    "average_win": number (użyj z obliczonych_metryki),
    "average_loss": number (użyj z obliczonych_metryki),
    "risk_reward_ratio": number (użyj z obliczonych_metryki)
  },
  "patterns": {
    "best_performing_instruments": ["symbol1", "symbol2"] (na podstawie net_pnl per instrument),
    "worst_performing_instruments": ["symbol1", "symbol2"] (na podstawie net_pnl per instrument),
    "most_traded_instruments": ["symbol1", "symbol2"] (na podstawie liczby transakcji)
  },
  "strengths": ["punkt 1", "punkt 2"] (tylko na podstawie faktów z metryk, jako obserwacje),
  "weaknesses": ["punkt 1", "punkt 2"] (tylko na podstawie faktów z metryk, jako obserwacje),
  "risk_management_assessment": "Opisowa ocena na podstawie R:R ratio, profit factor, średnich zysków/strat - bez sugestii działań",
  "observations": [
    {
      "category": "Zarządzanie ryzykiem" | "Timing" | "Wybór instrumentów" | "Inne",
      "observation": "Obserwacja oparta na faktach (opisowa, bez sugestii działań)",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "detailed_analysis": "Szczegółowa analiza oparta TYLKO na obliczonych metrykach, bez domysłów, bez sugestii operacyjnych. Forma opisowa: 'Dane pokazują...', 'W okresie analizowanym...', 'Analiza wykazuje...'",
  "key_findings": ["Obserwacja 1", "Obserwacja 2", "Obserwacja 3"] (fakty historyczne, bez sugestii działań)
}`;

    const metricsForAI = {
      total_trades: metrics.totalTrades,
      winning_trades: metrics.winningTrades,
      losing_trades: metrics.losingTrades,
      win_rate: Math.round(metrics.winRate * 100) / 100,
      total_profit: Math.round(metrics.totalProfit * 100) / 100,
      total_loss: Math.round(metrics.totalLoss * 100) / 100,
      net_pnl: Math.round(metrics.netPnl * 100) / 100,
      average_win: Math.round(metrics.averageWin * 100) / 100,
      average_loss: Math.round(metrics.averageLoss * 100) / 100,
      risk_reward_ratio: Math.round(metrics.riskRewardRatio * 100) / 100,
      profit_factor: Math.round(metrics.profitFactor * 100) / 100,
      largest_win: Math.round(metrics.largestWin * 100) / 100,
      largest_loss: Math.round(metrics.largestLoss * 100) / 100,
      by_instrument: Object.entries(metrics.byInstrument).map(([inst, stats]) => ({
        instrument: inst,
        trades: stats.trades,
        wins: stats.wins,
        losses: stats.losses,
        net_pnl: Math.round(stats.netPnl * 100) / 100,
        win_rate: Math.round(stats.winRate * 100) / 100,
      })),
    };

    const userPrompt = `Przeanalizuj następujące OBLICZONE METRYKI transakcji. NIE obliczaj ich ponownie - użyj podanych wartości.

OBLICZONE METRYKI:
${JSON.stringify(metricsForAI, null, 2)}

SUROWE DANE (dla kontekstu, ale nie licz z nich metryk):
${trimmedText.substring(0, 2000)}

Zadanie: Zinterpretuj te metryki i sformułuj analizę edukacyjną. Pamiętaj:
- Użyj TYLKO wartości z OBLICZONYCH METRYK
- Nie przypisuj emocji bez danych behawioralnych
- Bazuj na faktach, nie na domysłach
- Porównaj instrumenty na podstawie net_pnl i win_rate
- SPRAWDŹ fakty narracyjne: jeśli mówisz o częstotliwości transakcji per instrument, sprawdź dane w "by_instrument" (pole "trades")
- NIE sugeruj działań operacyjnych - tylko opisuj fakty historyczne
- Używaj formy: "Dane pokazują...", "W okresie analizowanym...", "Analiza wykazuje..."

KRYTYCZNE ZASADY INTERPRETACJI:
1. NISKI WIN RATE ≠ ZŁA STRATEGIA: Jeśli profit_factor > 1 i net_pnl > 0, strategia jest zyskowna mimo niskiego win_rate
2. NAJLEPSZY INSTRUMENT: Określ na podstawie net_pnl, NIE win_rate. Instrument z najwyższym net_pnl jest najlepszy
3. UJEMNE INSTRUMENTY: Jeśli instrument ma ujemny net_pnl, opisz to jako fakt, ale nie sugeruj działań
4. KONCENTRACJA WYNIKU: Jeśli jeden instrument dominuje wynik (np. >50% net_pnl), zauważ to jako obserwację o ryzyku zależności
5. MARGINALNE WYNIKI: Instrument z małym dodatnim net_pnl (np. <5% całkowitego) to "marginalny wynik", nie "najlepszy"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2500,
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    let aiAnalysis: any = {};
    try {
      aiAnalysis = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response', e);
      return NextResponse.json({ error: 'Failed to parse AI analysis' }, { status: 500 });
    }

    // Merge calculated metrics with AI interpretation
    // Override AI's summary with our calculated values to ensure accuracy
    const analysis = {
      summary: {
        total_trades: metrics.totalTrades,
        winning_trades: metrics.winningTrades,
        losing_trades: metrics.losingTrades,
        win_rate: Math.round(metrics.winRate * 100) / 100,
        total_profit: Math.round(metrics.totalProfit * 100) / 100,
        total_loss: Math.round(metrics.totalLoss * 100) / 100,
        net_pnl: Math.round(metrics.netPnl * 100) / 100,
        average_win: Math.round(metrics.averageWin * 100) / 100,
        average_loss: Math.round(metrics.averageLoss * 100) / 100,
        risk_reward_ratio: Math.round(metrics.riskRewardRatio * 100) / 100,
        profit_factor: Math.round(metrics.profitFactor * 100) / 100,
      },
      by_instrument: metricsForAI.by_instrument,
      patterns: aiAnalysis.patterns || {},
      strengths: aiAnalysis.strengths || [],
      weaknesses: aiAnalysis.weaknesses || [],
      risk_management_assessment: aiAnalysis.risk_management_assessment || '',
      // Use observations instead of recommendations (compliance)
      observations: aiAnalysis.observations || aiAnalysis.recommendations || [],
      recommendations: aiAnalysis.observations || aiAnalysis.recommendations || [], // Keep for backward compatibility
      detailed_analysis: aiAnalysis.detailed_analysis || '',
      key_findings: aiAnalysis.key_findings || aiAnalysis.action_plan || [],
      action_plan: aiAnalysis.key_findings || aiAnalysis.action_plan || [], // Keep for backward compatibility
    };

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Transaction statement analysis error', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze statement' }, { status: 500 });
  }
}
