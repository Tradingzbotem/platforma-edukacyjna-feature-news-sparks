/**
 * Analysis and calculation functions for parsed transactions
 */

import { ParsedTransaction } from './parse';

export interface CalculatedMetrics {
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
  profitFactor: number | null; // null if no losses, "∞" in UI if only profits
  maxWin: number; // alias for largestWin
  maxLoss: number; // alias for largestLoss
}

/**
 * Calculate metrics from parsed transactions
 */
export function calculateMetrics(transactions: ParsedTransaction[]): CalculatedMetrics {
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
      maxWin: 0,
      maxLoss: 0,
      profitFactor: null,
    };
  }

  // Separate wins and losses
  const wins = transactions.filter(t => t.netPnl > 0);
  const losses = transactions.filter(t => t.netPnl < 0);
  
  // Calculate totals
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
    
    const inst = byInstrument[t.instrument];
    inst.trades++;
    inst.netPnl += t.netPnl;
    
    if (t.netPnl > 0) {
      inst.wins++;
    } else if (t.netPnl < 0) {
      inst.losses++;
    }
  }

  // Calculate win rates per instrument
  for (const inst in byInstrument) {
    const stats = byInstrument[inst];
    stats.winRate = stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0;
  }

  // Calculate averages
  const averageWin = wins.length > 0 ? totalProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;
  const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0;

  // Calculate profit factor
  // If no losses, return null (UI will show "∞")
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? Infinity : 0);

  // Find largest win and loss
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.netPnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.netPnl)) : 0;

  // Validation: sum of per-instrument P&L should equal global P&L
  const sumByInstrument = Object.values(byInstrument).reduce((sum, stats) => sum + stats.netPnl, 0);
  const pnlDifference = Math.abs(netPnl - sumByInstrument);
  
  if (pnlDifference > 0.01) {
    console.error('CRITICAL: P&L mismatch detected!', {
      globalNetPnl: netPnl,
      sumByInstrument,
      difference: pnlDifference,
      transactionsCount: transactions.length,
    });
  }

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
    maxWin: largestWin,
    maxLoss: largestLoss,
    profitFactor: profitFactor === Infinity ? null : profitFactor,
  };
}

/**
 * Generate recommendations based on calculated metrics
 */
export function generateRecommendations(metrics: CalculatedMetrics): string[] {
  const recommendations: string[] = [];

  // Sample size warning
  if (metrics.totalTrades < 10) {
    recommendations.push(`Uwaga: mała próba (${metrics.totalTrades} transakcji). Wyniki mogą być niestabilne. Większa próba (50+) daje bardziej wiarygodne statystyki.`);
  }

  // Profit Factor analysis
  if (metrics.profitFactor === null && metrics.totalProfit > 0) {
    // Perfect profit factor (no losses) but check sample size
    if (metrics.totalTrades < 20) {
      recommendations.push(`Profit Factor nieskończony (brak strat), ale mała próba (${metrics.totalTrades} trades). Większa próba pokaże czy to stabilny wynik.`);
    }
  } else if (metrics.profitFactor !== null) {
    if (metrics.profitFactor > 2.0) {
      recommendations.push(`Wysoki Profit Factor (${metrics.profitFactor.toFixed(2)}) wskazuje na dobrą relację zysk/strata. Utrzymaj obecną strategię zarządzania ryzykiem.`);
    } else if (metrics.profitFactor < 1.0) {
      recommendations.push(`Niski Profit Factor (${metrics.profitFactor.toFixed(2)}) - średnie straty przekraczają średnie zyski. Rozważ rewizję strategii wyjścia i zarządzania ryzykiem.`);
    }
  }

  // Win Rate analysis
  if (metrics.winRate === 100 && metrics.totalTrades < 10) {
    recommendations.push(`Win Rate 100% na ${metrics.totalTrades} trades to prawdopodobnie efekt małej próby. Większa próba pokaże rzeczywistą skuteczność.`);
  } else if (metrics.winRate < 30) {
    recommendations.push(`Niski Win Rate (${metrics.winRate.toFixed(1)}%). Sprawdź czy strategia wyjścia nie jest zbyt restrykcyjna lub czy nie wchodzisz zbyt często w słabe setupy.`);
  }

  // Risk/Reward analysis
  if (metrics.riskRewardRatio > 0) {
    if (metrics.riskRewardRatio < 1.0) {
      recommendations.push(`Stosunek R:R (${metrics.riskRewardRatio.toFixed(2)}) poniżej 1:1 - średnie straty większe niż średnie zyski. Rozważ większe cele zysku lub szybsze cięcie strat.`);
    }
  }

  // Instrument concentration
  const instrumentEntries = Object.entries(metrics.byInstrument);
  if (instrumentEntries.length > 0) {
    // Find dominant instrument by P&L
    const sortedByPnl = instrumentEntries.sort((a, b) => Math.abs(b[1].netPnl) - Math.abs(a[1].netPnl));
    const dominant = sortedByPnl[0];
    const dominantPnlShare = Math.abs(dominant[1].netPnl) / Math.max(Math.abs(metrics.netPnl), 0.01) * 100;
    
    if (dominantPnlShare > 70) {
      recommendations.push(`Wysoka koncentracja ryzyka: ${dominant[0]} stanowi ${dominantPnlShare.toFixed(0)}% całkowitego P&L. Rozważ dywersyfikację portfela.`);
    }
  }

  // Commission/Swap analysis (if we have data)
  // This would require access to individual transactions with commission data
  // For now, we skip this unless we pass transactions to this function

  // Outlier analysis
  if (metrics.largestWin > 0 && metrics.largestLoss < 0) {
    const absLargestWin = Math.abs(metrics.largestWin);
    const absLargestLoss = Math.abs(metrics.largestLoss);
    
    if (absLargestWin > metrics.averageWin * 3 || absLargestLoss > metrics.averageLoss * 3) {
      const isLargeWin = absLargestWin > metrics.averageWin * 3;
      const outlierType = isLargeWin ? 'wysoki zysk' : 'wysoka strata';
      recommendations.push(`Wykryto outlier trade: ${outlierType} (${isLargeWin ? metrics.largestWin.toFixed(2) : metrics.largestLoss.toFixed(2)}) znacznie odbiega od średniej. Przeanalizuj co było inne w tym trade.`);
    }
  }

  // Net P&L per instrument recommendations
  instrumentEntries.forEach(([inst, stats]) => {
    if (stats.netPnl < 0 && stats.trades >= 3) {
      recommendations.push(`${inst}: ujemny Net P&L (${stats.netPnl.toFixed(2)}) na ${stats.trades} trades. Sprawdź czy strategia działa na tym instrumencie.`);
    }
  });

  return recommendations.slice(0, 6); // Limit to 6 recommendations
}