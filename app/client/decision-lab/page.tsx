'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  ChevronDown,
  ChevronUp,
  Brain,
  Upload,
  FileText,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { getRetrospectiveAnalyzeEligibility } from '@/lib/decision-lab/retrospectiveAnalyzeEligibility';

// Dynamic import for TradingView to avoid SSR issues
const TradingViewAdvancedEmbed = dynamic(
  () => import('@/components/widgets/TradingViewAdvancedEmbed'),
  { ssr: false }
);

// Dynamic import for Recharts to avoid SSR issues
const ResponsiveContainerDynamic = dynamic(
  async () => (await import('recharts')).ResponsiveContainer,
  { ssr: false }
);
const BarChartDynamic = dynamic(
  async () => (await import('recharts')).BarChart,
  { ssr: false }
);
const BarDynamic = dynamic(
  async () => (await import('recharts')).Bar,
  { ssr: false }
);
const XAxisDynamic = dynamic(
  async () => (await import('recharts')).XAxis,
  { ssr: false }
);
const YAxisDynamic = dynamic(
  async () => (await import('recharts')).YAxis,
  { ssr: false }
);
const TooltipDynamic = dynamic(
  async () => (await import('recharts')).Tooltip,
  { ssr: false }
);
const CellDynamic = dynamic(
  async () => (await import('recharts')).Cell,
  { ssr: false }
);
const LineChartDynamic = dynamic(
  async () => (await import('recharts')).LineChart,
  { ssr: false }
);
const LineDynamic = dynamic(
  async () => (await import('recharts')).Line,
  { ssr: false }
);
const RadarChartDynamic = dynamic(
  async () => (await import('recharts')).RadarChart,
  { ssr: false }
);
const PolarGridDynamic = dynamic(
  async () => (await import('recharts')).PolarGrid,
  { ssr: false }
);
const PolarAngleAxisDynamic = dynamic(
  async () => (await import('recharts')).PolarAngleAxis,
  { ssr: false }
);
const PolarRadiusAxisDynamic = dynamic(
  async () => (await import('recharts')).PolarRadiusAxis,
  { ssr: false }
);
const RadarDynamic = dynamic(
  async () => (await import('recharts')).Radar,
  { ssr: false }
);

type DecisionEntry = {
  id: number;
  user_id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  horizon: 'INTRADAY' | 'SWING' | 'POSITION';
  thesis: string;
  market_mode: 'TREND' | 'RANGE' | 'NEWS';
  confidence: number;
  status: 'OPEN' | 'REVIEWED';
  outcome: 'WIN' | 'LOSE' | 'NEUTRAL' | null;
  note: string | null;
  created_at: string;
  reviewed_at: string | null;
  emotional_state: 'CALM' | 'ANXIOUS' | 'EXCITED' | 'RUSHED' | 'CONFIDENT' | 'UNCERTAIN' | null;
  actual_action: 'ENTERED_AS_PLANNED' | 'DID_NOT_ENTER' | 'CHANGED_MIND' | 'ENTERED_DIFFERENTLY' | 'WAITED_TOO_LONG' | null;
  risk_notes: string | null;
  time_of_day: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | null;
  ai_analysis: {
    outcome?: 'WIN' | 'LOSE' | 'NEUTRAL';
    score?: number;
    analysis?: string;
    what_went_well?: string[];
    what_could_be_better?: string[];
    lessons_learned?: string[];
    market_context?: string;
  } | null;
  ai_analyzed_at: string | null;
};

const SYMBOLS = ['US100', 'US500', 'XAUUSD', 'XTIUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'DE40', 'US30'];
const DIRECTIONS = ['LONG', 'SHORT'] as const;
const HORIZONS = ['INTRADAY', 'SWING', 'POSITION'] as const;
const MARKET_MODES = ['TREND', 'RANGE', 'NEWS'] as const;
const CONFIDENCE_LEVELS = [1, 2, 3, 4, 5] as const;
const EMOTIONAL_STATES = ['CALM', 'CONFIDENT', 'UNCERTAIN', 'ANXIOUS', 'EXCITED', 'RUSHED'] as const;
const ACTUAL_ACTIONS = ['ENTERED_AS_PLANNED', 'DID_NOT_ENTER', 'CHANGED_MIND', 'ENTERED_DIFFERENTLY', 'WAITED_TOO_LONG'] as const;

// Map Decision Lab symbols to TradingView symbols
function mapSymbolToTradingView(symbol: string): string {
  const mapping: Record<string, string> = {
    US100: 'OANDA:NAS100USD',
    US500: 'CAPITALCOM:US500',
    XAUUSD: 'OANDA:XAUUSD',
    XTIUSD: 'OANDA:WTICOUSD',
    EURUSD: 'OANDA:EURUSD',
    GBPUSD: 'OANDA:GBPUSD',
    USDJPY: 'OANDA:USDJPY',
    DE40: 'OANDA:DE30EUR',
    US30: 'OANDA:NAS100USD', // US30 might not be available, fallback to US100
  };
  return mapping[symbol] || 'OANDA:NAS100USD';
}

// Helper functions
function formatRoughTimeUntilFromHoursRemaining(hoursRemaining: number): string {
  if (hoursRemaining <= 0) return '';
  if (hoursRemaining < 24) {
    const h = Math.ceil(hoursRemaining);
    return `za ok. ${h} godz.`;
  }
  const d = Math.ceil(hoursRemaining / 24);
  if (d === 1) return 'za ok. 1 dzień';
  return `za ok. ${d} dni`;
}

function aggregateByMode(entries: DecisionEntry[]) {
  const counts: Record<string, number> = { TREND: 0, RANGE: 0, NEWS: 0 };
  entries.forEach((e) => {
    counts[e.market_mode] = (counts[e.market_mode] || 0) + 1;
  });
  return counts;
}

function aggregateByDay(entries: DecisionEntry[], days: number = 14) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const dayMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    dayMap[key] = 0;
  }

  entries.forEach((e) => {
    const entryDate = new Date(e.created_at);
    if (entryDate >= startDate) {
      const date = entryDate.toISOString().split('T')[0];
      if (dayMap.hasOwnProperty(date)) {
        dayMap[date]++;
      }
    }
  });

  return Object.entries(dayMap)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
      count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function computeProfile(entries: DecisionEntry[]) {
  if (entries.length === 0) return null;

  // Most common symbol
  const symbolCounts: Record<string, number> = {};
  entries.forEach((e) => {
    symbolCounts[e.symbol] = (symbolCounts[e.symbol] || 0) + 1;
  });
  const mostCommonSymbol =
    Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Most common market_mode
  const modeCounts = aggregateByMode(entries);
  const mostCommonMode =
    Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Direction percentage
  const longCount = entries.filter((e) => e.direction === 'LONG').length;
  const longPct = entries.length > 0 ? Math.round((longCount / entries.length) * 100) : 0;
  const shortPct = 100 - longPct;

  // Average confidence
  const avgConfidence =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length
      : 0;

  return {
    mostCommonSymbol,
    mostCommonMode,
    longPct,
    shortPct,
    avgConfidence: Number(avgConfidence.toFixed(1)),
  };
}

function computeInsights(entries: DecisionEntry[]) {
  if (entries.length === 0) {
    return {
      marketMode: { mode: '—', pct: 0, text: 'Brak danych' },
      direction: { direction: '—', pct: 0, text: 'Brak danych' },
      consistency: { changes: 0, pct: 0, text: 'Brak danych' },
    };
  }

  // Insight 1: Most common market_mode
  const modeCounts = aggregateByMode(entries);
  const totalModes = Object.values(modeCounts).reduce((a, b) => a + b, 0);
  const mostCommonModeEntry = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
  const modePct = totalModes > 0 ? Math.round((mostCommonModeEntry[1] / totalModes) * 100) : 0;

  // Insight 2: Dominant direction
  const longCount = entries.filter((e) => e.direction === 'LONG').length;
  const longPct = Math.round((longCount / entries.length) * 100);
  const shortPct = 100 - longPct;
  const dominantDirection = longPct >= shortPct ? 'LONG' : 'SHORT';
  const dominantPct = dominantDirection === 'LONG' ? longPct : shortPct;

  // Insight 3: Consistency (direction changes)
  let changes = 0;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].direction !== entries[i - 1].direction) {
      changes++;
    }
  }
  const changePct = entries.length > 1 ? Math.round((changes / (entries.length - 1)) * 100) : 0;
  const consistencyText =
    changePct > 50
      ? 'Często zmieniasz kierunek — możliwa impulsywność'
      : 'Wysoka konsekwencja kierunku — stabilny proces';

  const getMarketModeText = (mode: string) => {
    if (mode === 'TREND') return 'rynek był w trendzie';
    if (mode === 'RANGE') return 'rynek poruszał się w bok';
    if (mode === 'NEWS') return 'rynek reagował na ważne wiadomości';
    return mode;
  };

  const getDirectionText = (dir: string) => {
    if (dir === 'LONG') return 'obstawiasz wzrost rynku';
    if (dir === 'SHORT') return 'obstawiasz spadek rynku';
    return dir;
  };

  return {
    marketMode: {
      mode: mostCommonModeEntry[0],
      pct: modePct,
      text: `Najczęściej podejmujesz decyzje, gdy ${getMarketModeText(mostCommonModeEntry[0])} (${modePct}% decyzji)`,
    },
    direction: {
      direction: dominantDirection,
      pct: dominantPct,
      text: `Najczęściej ${getDirectionText(dominantDirection)} (${dominantPct}% decyzji)`,
    },
    consistency: {
      changes,
      pct: changePct,
      text: consistencyText,
    },
  };
}

function computeBestConditions(entries: DecisionEntry[]) {
  if (entries.length === 0) {
    return {
      bestEmotionalState: null,
      bestTimeOfDay: null,
      bestMarketMode: null,
      actionVsPlanned: null,
      emotionalImpact: null,
    };
  }

  // Filter reviewed entries with outcomes
  const reviewed = entries.filter((e) => e.status === 'REVIEWED' && e.outcome);
  if (reviewed.length === 0) {
    return {
      bestEmotionalState: null,
      bestTimeOfDay: null,
      bestMarketMode: null,
      actionVsPlanned: null,
      emotionalImpact: null,
    };
  }

  const wins = reviewed.filter((e) => e.outcome === 'WIN');
  const losses = reviewed.filter((e) => e.outcome === 'LOSE');

  // Best emotional state (highest win rate)
  const emotionalStateStats: Record<string, { wins: number; total: number }> = {};
  reviewed.forEach((e) => {
    if (e.emotional_state) {
      if (!emotionalStateStats[e.emotional_state]) {
        emotionalStateStats[e.emotional_state] = { wins: 0, total: 0 };
      }
      emotionalStateStats[e.emotional_state].total++;
      if (e.outcome === 'WIN') emotionalStateStats[e.emotional_state].wins++;
    }
  });

  const bestEmotionalState = Object.entries(emotionalStateStats)
    .map(([state, stats]) => ({
      state,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .filter((s) => s.total >= 2)
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Best time of day
  const timeOfDayStats: Record<string, { wins: number; total: number }> = {};
  reviewed.forEach((e) => {
    if (e.time_of_day) {
      if (!timeOfDayStats[e.time_of_day]) {
        timeOfDayStats[e.time_of_day] = { wins: 0, total: 0 };
      }
      timeOfDayStats[e.time_of_day].total++;
      if (e.outcome === 'WIN') timeOfDayStats[e.time_of_day].wins++;
    }
  });

  const bestTimeOfDay = Object.entries(timeOfDayStats)
    .map(([time, stats]) => ({
      time,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .filter((s) => s.total >= 2)
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Best market mode
  const marketModeStats: Record<string, { wins: number; total: number }> = {};
  reviewed.forEach((e) => {
    if (!marketModeStats[e.market_mode]) {
      marketModeStats[e.market_mode] = { wins: 0, total: 0 };
    }
    marketModeStats[e.market_mode].total++;
    if (e.outcome === 'WIN') marketModeStats[e.market_mode].wins++;
  });

  const bestMarketMode = Object.entries(marketModeStats)
    .map(([mode, stats]) => ({
      mode,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .filter((s) => s.total >= 2)
    .sort((a, b) => b.winRate - a.winRate)[0];

  // Action vs planned
  const actionStats: Record<string, { wins: number; total: number }> = {};
  reviewed.forEach((e) => {
    if (e.actual_action) {
      if (!actionStats[e.actual_action]) {
        actionStats[e.actual_action] = { wins: 0, total: 0 };
      }
      actionStats[e.actual_action].total++;
      if (e.outcome === 'WIN') actionStats[e.actual_action].wins++;
    }
  });

  const actionVsPlanned = Object.entries(actionStats)
    .map(([action, stats]) => ({
      action,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  // Emotional impact (compare calm/confident vs anxious/rushed)
  const calmEntries = reviewed.filter((e) => e.emotional_state === 'CALM' || e.emotional_state === 'CONFIDENT');
  const emotionalEntries = reviewed.filter((e) => e.emotional_state === 'ANXIOUS' || e.emotional_state === 'RUSHED' || e.emotional_state === 'EXCITED');

  const calmWinRate = calmEntries.length > 0
    ? (calmEntries.filter((e) => e.outcome === 'WIN').length / calmEntries.length) * 100
    : null;
  const emotionalWinRate = emotionalEntries.length > 0
    ? (emotionalEntries.filter((e) => e.outcome === 'WIN').length / emotionalEntries.length) * 100
    : null;

  return {
    bestEmotionalState,
    bestTimeOfDay,
    bestMarketMode,
    actionVsPlanned,
    emotionalImpact: {
      calmWinRate,
      emotionalWinRate,
      calmTotal: calmEntries.length,
      emotionalTotal: emotionalEntries.length,
    },
  };
}

function computeDisciplineMetrics(entries: DecisionEntry[]) {
  if (entries.length === 0) {
    return {
      plannedVsActual: null,
      reviewRate: 0,
      consistency: null,
    };
  }

  const reviewed = entries.filter((e) => e.status === 'REVIEWED');
  const reviewRate = entries.length > 0 ? (reviewed.length / entries.length) * 100 : 0;

  // Planned vs actual
  const withActualAction = reviewed.filter((e) => e.actual_action);
  const enteredAsPlanned = withActualAction.filter((e) => e.actual_action === 'ENTERED_AS_PLANNED').length;
  const didNotEnter = withActualAction.filter((e) => e.actual_action === 'DID_NOT_ENTER' || e.actual_action === 'WAITED_TOO_LONG').length;
  const changedMind = withActualAction.filter((e) => e.actual_action === 'CHANGED_MIND' || e.actual_action === 'ENTERED_DIFFERENTLY').length;

  return {
    plannedVsActual: withActualAction.length > 0 ? {
      enteredAsPlannedPct: (enteredAsPlanned / withActualAction.length) * 100,
      didNotEnterPct: (didNotEnter / withActualAction.length) * 100,
      changedMindPct: (changedMind / withActualAction.length) * 100,
      total: withActualAction.length,
    } : null,
    reviewRate,
    consistency: {
      reviewedCount: reviewed.length,
      totalCount: entries.length,
    },
  };
}

// Funkcja oceny jakości tezy
function evaluateThesisQuality(thesis: string): { level: 'GOOD' | 'OK' | 'WEAK'; hints: string[] } {
  const trimmed = thesis.trim().toLowerCase();
  const hints: string[] = [];

  // WEAK: < 20 znaków
  if (trimmed.length < 20) {
    return { level: 'WEAK', hints: ['Teza jest zbyt krótka (min. 20 znaków)', 'Dodaj konkretne informacje o warunku wejścia', 'Określ poziom lub wydarzenie'] };
  }

  // Sprawdzanie ogólników
  const generalPhrases = ['bo tak', 'tak będzie', 'wydaje mi się', 'na pewno', 'myślę że', 'wydaje się', 'prawdopodobnie'];
  const hasOnlyGenerals = generalPhrases.some(phrase => trimmed.includes(phrase)) && 
    !/\d{3,}/.test(trimmed) && // brak liczb
    !/[hH][14]|d1|intraday|swing|position/i.test(trimmed) && // brak timeframe
    !/(entry|sl|tp|stop loss|take profit|invalidation|rr|wybicie|korekta|konsolidacja|trend|news)/i.test(trimmed); // brak elementów planu

  if (hasOnlyGenerals) {
    return { level: 'WEAK', hints: ['Unikaj ogólników typu "wydaje mi się"', 'Dodaj konkretne liczby/poziomy', 'Określ warunek wejścia i anulowania'] };
  }

  // Liczenie konkretów dla GOOD
  let concreteCount = 0;
  const concreteElements = [
    { regex: /\d{3,}/, name: 'poziom/liczba' },
    { regex: /[hH][14]|d1|intraday|swing|position/i, name: 'timeframe' },
    { regex: /(entry|sl|tp|stop loss|take profit|invalidation|rr|wybicie|korekta|konsolidacja|trend|news)/i, name: 'element planu' },
  ];

  concreteElements.forEach(({ regex }) => {
    if (regex.test(trimmed)) {
      concreteCount++;
    }
  });

  if (concreteCount >= 2) {
    return { level: 'GOOD', hints: [] };
  }

  // OK: ma pewne elementy ale nie wystarczające
  if (concreteCount === 1) {
    hints.push('Dodaj więcej konkretów (poziomy, timeframe, warunki)');
    if (!/\d{3,}/.test(trimmed)) {
      hints.push('Podaj konkretne liczby/poziomy');
    }
    return { level: 'OK', hints: hints.slice(0, 2) };
  }

  // OK: brak konkretów ale nie jest WEAK
  hints.push('Dodaj konkretne poziomy/liczby');
  hints.push('Określ timeframe (H1/H4/D1)');
  hints.push('Opisz warunek wejścia');
  return { level: 'OK', hints: hints.slice(0, 2) };
}

export default function DecisionLabPage() {
  const [entries, setEntries] = useState<DecisionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState<Record<number, string>>({});
  const [reviewActualAction, setReviewActualAction] = useState<Record<number, 'ENTERED_AS_PLANNED' | 'DID_NOT_ENTER' | 'CHANGED_MIND' | 'ENTERED_DIFFERENTLY' | 'WAITED_TOO_LONG'>>({});
  const [expandedChartId, setExpandedChartId] = useState<number | null>(null);
  const [analyzingEntryId, setAnalyzingEntryId] = useState<number | null>(null);
  const [transactionStatement, setTransactionStatement] = useState('');
  const [analyzingStatement, setAnalyzingStatement] = useState(false);
  const [statementAnalysis, setStatementAnalysis] = useState<any>(null);
  const [showStatementExample, setShowStatementExample] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Filters
  const [filterMarketMode, setFilterMarketMode] = useState<string>('ALL');
  const [filterDecisionStatus, setFilterDecisionStatus] = useState<'PENDING' | 'REVIEWED' | 'ALL'>('PENDING');
  const [showMoreCards, setShowMoreCards] = useState(false);
  const [expandedAiAnalysisId, setExpandedAiAnalysisId] = useState<number | null>(null);
  const [expandedStatementAnalysis, setExpandedStatementAnalysis] = useState(false);
  const [expandedThesisIds, setExpandedThesisIds] = useState<Set<number>>(new Set());

  // Form state
  const [formSymbol, setFormSymbol] = useState('US100');
  const [formDirection, setFormDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [formHorizon, setFormHorizon] = useState<'INTRADAY' | 'SWING' | 'POSITION'>('INTRADAY');
  const [formMarketMode, setFormMarketMode] = useState<'TREND' | 'RANGE' | 'NEWS'>('TREND');
  const [formConfidence, setFormConfidence] = useState<number>(3);
  const [formThesis, setFormThesis] = useState('');
  const [formEntry, setFormEntry] = useState<string>('');
  const [formStopLoss, setFormStopLoss] = useState<string>('');
  const [formTakeProfit, setFormTakeProfit] = useState<string>('');
  const [formRiskPercent, setFormRiskPercent] = useState<string>('');
  const [formInvalidation, setFormInvalidation] = useState<string>('');
  const [formSetupType, setFormSetupType] = useState<'BREAKOUT'|'PULLBACK'|'REVERSAL'|'NEWS'|'OTHER' | ''>('');
  const [formTimeframes, setFormTimeframes] = useState<string[]>([]);
  const [aiOpinion, setAiOpinion] = useState<{
    verdict: 'OK' | 'REVISE' | 'NO_GO';
    headline: string;
    summary: string;
    assumptions?: string[];
    missing?: string[];
    risks?: string[];
    riskManagement: {
      hasSL: boolean;
      rr: number | null;
      positionRiskComment: string;
    };
    invalidationQuality?: 'GOOD' | 'WEAK' | 'MISSING';
    nextChecks?: string[];
    rewriteDecision?: {
      thesis?: string;
      invalidation?: string;
    };
  } | null>(null);
  const [analyzingDecision, setAnalyzingDecision] = useState(false);
  const [improvingThesis, setImprovingThesis] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/decision-lab/entries?limit=50', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      setEntries(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formThesis.trim() || formThesis.length > 240) {
      setError('Powód decyzji jest wymagany i może mieć maksymalnie 240 znaków');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        symbol: formSymbol,
        direction: formDirection,
        horizon: formHorizon,
        thesis: formThesis.trim(),
        market_mode: formMarketMode,
        confidence: formConfidence,
      };

      // Konwersje pól numerycznych: Number(x.replace(',', '.')) i jeśli finite -> dodaj
      if (formEntry.trim()) {
        const entryNum = Number(formEntry.replace(',', '.'));
        if (isFinite(entryNum)) {
          payload.entry = entryNum;
        }
      }
      if (formStopLoss.trim()) {
        const stopLossNum = Number(formStopLoss.replace(',', '.'));
        if (isFinite(stopLossNum)) {
          payload.stopLoss = stopLossNum;
        }
      }
      if (formTakeProfit.trim()) {
        const takeProfitNum = Number(formTakeProfit.replace(',', '.'));
        if (isFinite(takeProfitNum)) {
          payload.takeProfit = takeProfitNum;
        }
      }
      if (formRiskPercent.trim()) {
        const riskPercentNum = Number(formRiskPercent.replace(',', '.'));
        if (isFinite(riskPercentNum)) {
          payload.riskPercent = riskPercentNum;
        }
      }

      // invalidation: trim, jeśli nie pusty -> dodaj
      if (formInvalidation.trim()) {
        payload.invalidation = formInvalidation.trim();
      }

      // setupType: jeśli nie pusty string -> dodaj
      if (formSetupType) {
        payload.setupType = formSetupType;
      }

      // timeframes: jeśli nie pusta tablica -> dodaj
      if (formTimeframes.length > 0) {
        payload.timeframes = formTimeframes;
      }

      const res = await fetch('/api/decision-lab/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save decision');
      }

      // Reset form
      setFormThesis('');
      setFormConfidence(3);
      setAiOpinion(null);
      setSuccess('Decyzja zapisana!');
      // Refresh entries
      await fetchEntries();
    } catch (err: any) {
      setError(err.message || 'Failed to save decision');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIAnalysis = async (entryId: number) => {
    setAnalyzingEntryId(entryId);
    try {
      setError(null);
      const res = await fetch('/api/decision-lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          typeof err?.error === 'string'
            ? err.error
            : 'Nie udało się uruchomić oceny wstecznej AI.';
        throw new Error(msg);
      }

      await res.json();
      await fetchEntries(); // Refresh entries
      setSuccess('Decyzja przeanalizowana przez AI!');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze decision');
    } finally {
      setAnalyzingEntryId(null);
    }
  };

  const handleDecisionOpinion = async () => {
    if (!formThesis.trim()) {
      setError('Wypełnij wszystkie pola przed analizą');
      return;
    }

    if (!formStopLoss.trim()) {
      setError('Stop Loss jest wymagany');
      return;
    }

    const slNum = Number(formStopLoss.replace(',', '.'));
    if (!isFinite(slNum)) {
      setError('Stop Loss musi być liczbą');
      return;
    }

    setAnalyzingDecision(true);
    setAiOpinion(null);
    try {
      setError(null);
      const payload: any = {
        symbol: formSymbol,
        direction: formDirection,
        horizon: formHorizon,
        thesis: formThesis.trim(),
        market_mode: formMarketMode,
        confidence: formConfidence,
        stopLoss: slNum,
      };

      if (formEntry.trim()) {
        payload.entry = parseFloat(formEntry);
      }
      if (formTakeProfit.trim()) {
        payload.takeProfit = parseFloat(formTakeProfit);
      }
      if (formRiskPercent.trim()) {
        payload.riskPercent = parseFloat(formRiskPercent);
      }
      if (formInvalidation.trim()) {
        payload.invalidation = formInvalidation.trim();
      }
      if (formSetupType) {
        payload.setupType = formSetupType;
      }
      if (formTimeframes.length > 0) {
        payload.timeframes = formTimeframes;
      }

      const res = await fetch('/api/decision-lab/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze decision');
      }

      const data = await res.json();
      setAiOpinion(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze decision');
    } finally {
      setAnalyzingDecision(false);
    }
  };

  const handleThesisImprove = async () => {
    if (!formThesis.trim()) {
      setError('Teza nie może być pusta');
      return;
    }

    setImprovingThesis(true);
    try {
      setError(null);
      const payload: any = {
        symbol: formSymbol,
        direction: formDirection,
        horizon: formHorizon,
        thesis: formThesis.trim(),
        market_mode: formMarketMode,
      };

      if (formEntry.trim()) {
        const entryNum = Number(formEntry.replace(',', '.'));
        if (isFinite(entryNum)) {
          payload.entry = entryNum;
        }
      }
      if (formStopLoss.trim()) {
        const stopLossNum = Number(formStopLoss.replace(',', '.'));
        if (isFinite(stopLossNum)) {
          payload.stopLoss = stopLossNum;
        }
      }
      if (formTakeProfit.trim()) {
        const takeProfitNum = Number(formTakeProfit.replace(',', '.'));
        if (isFinite(takeProfitNum)) {
          payload.takeProfit = takeProfitNum;
        }
      }
      if (formInvalidation.trim()) {
        payload.invalidation = formInvalidation.trim();
      }
      if (formSetupType) {
        payload.setupType = formSetupType;
      }
      if (formTimeframes.length > 0) {
        payload.timeframes = formTimeframes;
      }

      const res = await fetch('/api/decision-lab/thesis-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to improve thesis');
      }

      const data = await res.json();
      setFormThesis(data.improvedThesis || formThesis);
      
      if (data.improvedInvalidation && (!formInvalidation.trim() || formInvalidation.length < 20)) {
        setFormInvalidation(data.improvedInvalidation);
      }

      setSuccess('Teza ulepszona przez AI!');
    } catch (err: any) {
      setError(err.message || 'Failed to improve thesis');
    } finally {
      setImprovingThesis(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      setError(null);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // For CSV files, read directly on client
      if (fileExtension === 'csv' || fileExtension === 'txt') {
        const text = await file.text();
        setTransactionStatement(text);
        setUploadingFile(false);
        return;
      }
      
      // For Excel files (xlsx, xls), send to API for parsing
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/decision-lab/transactions/parse-file', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to parse file');
        }
        
        const data = await res.json();
        setTransactionStatement(data.text || '');
        setUploadingFile(false);
        return;
      }
      
      throw new Error('Nieobsługiwany format pliku. Obsługiwane formaty: CSV, TXT, XLSX, XLS');
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setUploadingFile(false);
    }
  };

  const handleStatementAnalysis = async () => {
    const trimmed = transactionStatement.trim();
    
    if (!trimmed) {
      setError('Wklej statement transakcji do analizy');
      return;
    }

    // Basic validation: check if input looks too minimal
    if (trimmed.length < 100) {
      setError('Statement jest zbyt krótki. Wklej pełny statement transakcji zawierający szczegóły transakcji (kierunek, czas, P&L, wielkość pozycji, itp.).');
      return;
    }

    // Check if it looks like just a symbol and direction (e.g., "us100 up")
    const isMinimalInput = /^[a-z0-9]+\s+(up|down|long|short|kup|sprzedaj)$/i.test(trimmed);
    if (isMinimalInput) {
      setError('Wprowadzony tekst jest zbyt krótki i nie zawiera pełnych informacji o transakcjach. Wklej pełny statement transakcji z Twojego brokera zawierający listę transakcji z datami, kierunkami, wartościami P&L i wielkościami pozycji.');
      return;
    }

    setAnalyzingStatement(true);
    try {
      setError(null);
      const res = await fetch('/api/decision-lab/transactions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement_text: transactionStatement.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze statement');
      }

      const data = await res.json();
      setStatementAnalysis(data.analysis);
      setSuccess('Statement przeanalizowany przez AI!');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze statement');
    } finally {
      setAnalyzingStatement(false);
    }
  };

  const handleQuickReview = async (entryId: number, outcome: 'WIN' | 'LOSE' | 'NEUTRAL') => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Optimistic update
    const originalEntry = { ...entry };
    const updatedEntries = entries.map((e) =>
      e.id === entryId
        ? {
            ...e,
            status: 'REVIEWED' as const,
            outcome,
            reviewed_at: new Date().toISOString(),
            note: reviewNote[entryId] || null,
            actual_action: reviewActualAction[entryId] || null,
          }
        : e
    );
    setEntries(updatedEntries);
    setExpandedNoteId(null);

    try {
      setError(null);
      const res = await fetch(`/api/decision-lab/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REVIEWED',
          outcome,
          note: reviewNote[entryId]?.trim() || null,
          actual_action: reviewActualAction[entryId] || null,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setEntries(entries.map((e) => (e.id === entryId ? originalEntry : e)));
        const err = await res.json();
        throw new Error(err.error || 'Failed to update entry');
      }

      // Update with server response
      const updated = await res.json();
      setEntries(entries.map((e) => (e.id === entryId ? updated : e)));
      setReviewNote((prev) => {
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
      setReviewActualAction((prev) => {
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update entry');
      // Revert on error
      setEntries(entries.map((e) => (e.id === entryId ? originalEntry : e)));
    }
  };

  // Filtered entries (sorted by created_at DESC)
  const filteredEntries = useMemo(() => {
    let filtered = entries.filter((e) => {
      if (filterMarketMode !== 'ALL' && e.market_mode !== filterMarketMode) return false;
      
      // Filter by decision status (pending/reviewed/all)
      if (filterDecisionStatus === 'PENDING') {
        // "Oczekuje na ocenę": status === "OPEN" OR ai_analysis == null
        return e.status === 'OPEN' || e.ai_analysis == null;
      } else if (filterDecisionStatus === 'REVIEWED') {
        // "Ocenione": status === "REVIEWED" OR ai_analysis != null
        return e.status === 'REVIEWED' || e.ai_analysis != null;
      }
      // "Wszystkie": no additional filtering
      return true;
    });
    
    // Sort: newest first
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [entries, filterMarketMode, filterDecisionStatus]);

  // Count entries for each filter type
  const pendingCount = useMemo(() => {
    return entries.filter((e) => e.status === 'OPEN' || e.ai_analysis == null).length;
  }, [entries]);

  const reviewedCount = useMemo(() => {
    return entries.filter((e) => e.status === 'REVIEWED' || e.ai_analysis != null).length;
  }, [entries]);

  const allCount = entries.length;

  // Computed data
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const entriesLast30Days = entries.filter((e) => new Date(e.created_at) >= last30Days);

  const profile = computeProfile(entriesLast30Days);
  const insights = computeInsights(entriesLast30Days);
  const bestConditions = computeBestConditions(entriesLast30Days);
  const disciplineMetrics = computeDisciplineMetrics(entriesLast30Days);
  const modeCounts = aggregateByMode(entries);
  const dayData = aggregateByDay(entries, 14);

  // Chart data for RadarChart
  const radarData = MARKET_MODES.map((mode) => ({
    mode,
    value: modeCounts[mode] || 0,
    fullMark: Math.max(...Object.values(modeCounts), 1),
  }));

  const COLORS = {
    TREND: '#3b82f6',
    RANGE: '#10b981',
    NEWS: '#f59e0b',
  };

  const getConfidenceLabel = (level: number) => {
    if (level <= 2) return 'Niska pewność';
    if (level === 3) return 'Średnia pewność';
    return 'Wysoka pewność';
  };

  const getMarketModeLabel = (mode: string) => {
    if (mode === 'TREND') return 'Rynek w trendzie';
    if (mode === 'RANGE') return 'Rynek w konsolidacji';
    if (mode === 'NEWS') return 'Dzień z ważnymi wiadomościami';
    return mode;
  };

  const getDirectionLabel = (direction: string) => {
    if (direction === 'LONG') return 'Na wzrost';
    if (direction === 'SHORT') return 'Na spadek';
    return direction;
  };

  const getHorizonLabel = (horizon: string) => {
    if (horizon === 'INTRADAY') return 'Na dziś';
    if (horizon === 'SWING') return 'Na kilka dni';
    if (horizon === 'POSITION') return 'Na dłużej';
    return horizon;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'OPEN') return 'Oczekuje na ocenę';
    if (status === 'REVIEWED') return 'Oceniona';
    return status;
  };

  const getOutcomeLabel = (outcome: string | null) => {
    if (outcome === 'WIN') return 'Decyzja trafna';
    if (outcome === 'LOSE') return 'Decyzja nietrafna';
    if (outcome === 'NEUTRAL') return 'Brak wyraźnego wyniku';
    return outcome;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>

        {/* Premium Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Decision Lab — Twój dziennik decyzji rynkowych
              </h1>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/20">
                Edukacyjnie — bez rekomendacji
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-lg text-white/80 leading-relaxed">
                Zapisuj pomysły na rynek i wracaj do nich, aby sprawdzić, jak faktycznie się zachowałeś. To narzędzie edukacyjne, które pomaga budować dyscyplinę i świadomość ryzyka.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                Zamiast zgadywać, czy „masz rację", widzisz, w jakich warunkach podejmujesz najlepsze decyzje, a kiedy emocje lub pośpiech przejmują kontrolę.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 backdrop-blur">
            <h3 className="text-sm font-semibold text-white/90 mb-4">Jak to działa</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center">1</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90 mb-1">Zapisz decyzję</div>
                  <div className="text-xs text-white/60">Dodaj pomysł na rynek z kontekstem i parametrami</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center">2</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90 mb-1">Oceń przed wejściem</div>
                  <div className="text-xs text-white/60">Użyj AI, aby zweryfikować hipotezę i zidentyfikować ryzyka</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center">3</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90 mb-1">Wracaj i ucz się</div>
                  <div className="text-xs text-white/60">Analizuj wyniki i wyciągaj wnioski z przeszłych decyzji</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Success message */}
        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-emerald-200">{success}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}

        {/* Quick Start Section */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Szybki start</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                document.getElementById('add-decision-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex-1 rounded-xl bg-white text-slate-900 font-semibold px-6 py-4 hover:opacity-90 transition-opacity text-center"
            >
              Dodaj decyzję
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('recent-decisions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-4 transition-colors text-center"
            >
              Oceń ostatnie decyzje
            </button>
          </div>
        </div>

        {/* Main Content: 2-column layout */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Column: Add Decision Form (Mobile: order-2, Desktop: order-1, col-span-8) */}
          <div id="add-decision-form-wrapper" className="col-span-12 lg:col-span-8 order-2 lg:order-1">
            <form id="add-decision-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    {DIRECTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormDirection(d)}
                        className={`flex-1 rounded-xl px-4 py-2 font-medium transition-colors ${
                          formDirection === d
                            ? d === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {d === 'LONG' ? (
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 inline mr-1" />
                        )}
                        {getDirectionLabel(d)}
                      </button>
                    ))}
                  </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Na jaki okres</label>
                  <div className="flex gap-2">
                    {HORIZONS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setFormHorizon(h)}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                          formHorizon === h
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {getHorizonLabel(h)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Jaka była sytuacja na rynku?</label>
                  <div className="flex gap-2">
                    {MARKET_MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormMarketMode(m)}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                          formMarketMode === m
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {getMarketModeLabel(m)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Czy rynek był w wyraźnym trendzie, poruszał się w bok, czy reagował na ważne wiadomości?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jak bardzo byłeś przekonany?
                  </label>
                  <div className="flex gap-1">
                    {CONFIDENCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormConfidence(level)}
                        className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                          formConfidence === level
                            ? level <= 2
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : level === 3
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Subiektywna ocena — jak bardzo wierzyłeś w tę decyzję w momencie jej podejmowania.
                  </p>
                </div>

            {/* Bottom section: Remaining fields */}
            <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-1">Krok 2: Kontekst</h3>
              <p className="text-xs text-white/60">Opisz hipotezę i warunki rynkowe</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Dlaczego podjąłeś tę decyzję?</label>
                <span className="text-xs text-white/50">
                  {formThesis.length}/240
                </span>
              </div>
              <textarea
                value={formThesis}
                onChange={(e) => {
                  if (e.target.value.length <= 240) setFormThesis(e.target.value);
                }}
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                placeholder="Opisz swoją hipotezę i kontekst rynkowy..."
              />
              <p className="text-xs text-white/50 mt-1">
                Im więcej konkretu, tym lepsza analiza
              </p>
              {formThesis.trim() && (() => {
                const quality = evaluateThesisQuality(formThesis);
                return (
                  <div className={`mt-2 rounded-lg p-3 ${
                    quality.level === 'GOOD'
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : quality.level === 'OK'
                        ? 'bg-yellow-500/10 border border-yellow-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${
                        quality.level === 'GOOD'
                          ? 'text-emerald-300'
                          : quality.level === 'OK'
                            ? 'text-yellow-300'
                            : 'text-red-300'
                      }`}>
                        {quality.level === 'GOOD' && 'Dobra teza'}
                        {quality.level === 'OK' && 'Da się analizować, ale można doprecyzować'}
                        {quality.level === 'WEAK' && 'Słaba teza — analiza będzie mało użyteczna'}
                      </span>
                    </div>
                    {quality.hints.length > 0 && (
                      <ul className="space-y-1 mt-2">
                        {quality.hints.map((hint, idx) => (
                          <li key={idx} className="text-xs text-white/70">• {hint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Trading Parameters Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Parametry (krok 3)</h3>
                <p className="text-xs text-white/60">Opcjonalne, ale poprawia jakość analizy</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Entry <span className="text-white/50">(opcjonalnie)</span></label>
                <input
                  type="number"
                  value={formEntry}
                  onChange={(e) => setFormEntry(e.target.value)}
                  step="any"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="np. 18250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stop Loss <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={formStopLoss}
                  onChange={(e) => setFormStopLoss(e.target.value)}
                  step="any"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="np. 18100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Take Profit <span className="text-white/50">(opcjonalnie)</span></label>
                <input
                  type="number"
                  value={formTakeProfit}
                  onChange={(e) => setFormTakeProfit(e.target.value)}
                  step="any"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="np. 18500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk % <span className="text-white/50">(opcjonalnie)</span></label>
                <input
                  type="number"
                  value={formRiskPercent}
                  onChange={(e) => setFormRiskPercent(e.target.value)}
                  step="any"
                  min="0"
                  max="100"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="np. 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Invalidation <span className="text-white/50">(opcjonalnie)</span></label>
                <input
                  type="text"
                  value={formInvalidation}
                  onChange={(e) => setFormInvalidation(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="np. Break below 18000"
                />
                <p className="text-xs text-white/50 mt-1">
                  Warunek unieważnienia — co konkretnie ma się stać (poziom/zdarzenie), żeby anulować decyzję przed/po wejściu. Przykład: 'Dla LONG: zamknięcie H4 poniżej 25480'.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Setup Type <span className="text-white/50">(opcjonalnie)</span></label>
                <select
                  value={formSetupType}
                  onChange={(e) => setFormSetupType(e.target.value as any || '')}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="">Wybierz...</option>
                  <option value="BREAKOUT">BREAKOUT</option>
                  <option value="PULLBACK">PULLBACK</option>
                  <option value="REVERSAL">REVERSAL</option>
                  <option value="NEWS">NEWS</option>
                  <option value="OTHER">OTHER</option>
                </select>
                <p className="text-xs text-white/50 mt-1">
                  Typ setupu — jaki schemat grasz: BREAKOUT (wybicie), PULLBACK (korekta do poziomu), REVERSAL (odwrócenie), NEWS (pod wydarzenie), OTHER (inne).
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Timeframes <span className="text-white/50">(opcjonalnie)</span></label>
                <div className="flex gap-2 flex-wrap">
                  {['H1', 'H4', 'D1'].map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => {
                        setFormTimeframes((prev) =>
                          prev.includes(tf) ? prev.filter((t) => t !== tf) : [...prev, tf]
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        formTimeframes.includes(tf)
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {/* AI Opinion Button - Show when all fields are filled */}
            {formThesis.trim() && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleThesisImprove}
                    disabled={improvingThesis}
                    className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 px-6 py-3 font-semibold hover:from-green-500/30 hover:to-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {improvingThesis ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-green-300 border-t-transparent rounded-full" />
                        Ulepszanie...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Ulepsz tezę (AI)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDecisionOpinion}
                    disabled={analyzingDecision}
                    className="rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-6 py-3 font-semibold hover:from-blue-500/30 hover:to-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {analyzingDecision ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-300 border-t-transparent rounded-full" />
                        Analizowanie przez AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Analizuj decyzję przez AI
                      </>
                    )}
                  </button>
                </div>

                {/* Display AI Opinion */}
                {aiOpinion && (
                  <div className={`mt-4 rounded-xl border p-4 ${
                    aiOpinion.verdict === 'OK'
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : aiOpinion.verdict === 'REVISE'
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-start gap-2 mb-3">
                      <Brain className={`h-5 w-5 mt-0.5 ${
                        aiOpinion.verdict === 'OK' ? 'text-emerald-400' : aiOpinion.verdict === 'REVISE' ? 'text-yellow-400' : 'text-red-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            aiOpinion.verdict === 'OK'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : aiOpinion.verdict === 'REVISE'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                          }`}>
                            {aiOpinion.verdict}
                          </span>
                          <span className="text-sm font-semibold text-white/90">{aiOpinion.headline}</span>
                        </div>
                        <p className="text-sm text-white/80 mb-3">{aiOpinion.summary}</p>

                        {aiOpinion.missing && aiOpinion.missing.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-orange-300 mb-1">Brakuje:</div>
                            <ul className="space-y-1">
                              {aiOpinion.missing.map((item: string, idx: number) => (
                                <li key={idx} className="text-xs text-white/70">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiOpinion.risks && aiOpinion.risks.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-red-300 mb-1">Ryzyka:</div>
                            <ul className="space-y-1">
                              {aiOpinion.risks.map((item: string, idx: number) => (
                                <li key={idx} className="text-xs text-white/70">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiOpinion.riskManagement && (
                          <div className="mb-3 pt-2 border-t border-white/10">
                            <div className="text-xs font-medium text-blue-300 mb-1">Zarządzanie ryzykiem:</div>
                            {aiOpinion.riskManagement.rr !== null && (
                              <div className="text-xs text-white/70 mb-1">R:R = {aiOpinion.riskManagement.rr.toFixed(2)}</div>
                            )}
                            {aiOpinion.riskManagement.positionRiskComment && (
                              <p className="text-xs text-white/70">{aiOpinion.riskManagement.positionRiskComment}</p>
                            )}
                          </div>
                        )}

                        {aiOpinion.nextChecks && aiOpinion.nextChecks.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-purple-300 mb-1">Sprawdź przed wejściem:</div>
                            <ul className="space-y-1">
                              {aiOpinion.nextChecks.map((item: string, idx: number) => (
                                <li key={idx} className="text-xs text-white/70">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiOpinion.rewriteDecision && (aiOpinion.rewriteDecision.thesis || aiOpinion.rewriteDecision.invalidation) && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="text-xs font-medium text-cyan-300 mb-1">Sugerowana poprawa:</div>
                            {aiOpinion.rewriteDecision.thesis && (
                              <p className="text-xs text-white/70 mb-1"><strong>Teza:</strong> {aiOpinion.rewriteDecision.thesis}</p>
                            )}
                            {aiOpinion.rewriteDecision.invalidation && (
                              <p className="text-xs text-white/70"><strong>Invalidation:</strong> {aiOpinion.rewriteDecision.invalidation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !formThesis.trim()}
              className="w-full md:w-auto rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Zapisywanie...' : 'Zapisz decyzję'}
            </button>
            </div>
          </form>
          </div>

          {/* Right Column: Recent Decisions (Mobile: order-1, Desktop: order-2, col-span-4) */}
          <div id="recent-decisions" className="col-span-12 lg:col-span-4 order-1 lg:order-2">
            {/* Enhanced Recent Decisions with Filters */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold">Ostatnie decyzje</h2>
                
                {/* Segmented Control Filter */}
                <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDecisionStatus('PENDING');
                      setShowMoreCards(false);
                    }}
                    aria-pressed={filterDecisionStatus === 'PENDING'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      filterDecisionStatus === 'PENDING'
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    Oczekuje na ocenę ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDecisionStatus('REVIEWED');
                      setShowMoreCards(false);
                    }}
                    aria-pressed={filterDecisionStatus === 'REVIEWED'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      filterDecisionStatus === 'REVIEWED'
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    Ocenione ({reviewedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDecisionStatus('ALL');
                      setShowMoreCards(false);
                    }}
                    aria-pressed={filterDecisionStatus === 'ALL'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 ${
                      filterDecisionStatus === 'ALL'
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    Wszystkie ({allCount})
                  </button>
          </div>
        </div>

              {loading ? (
                <div className="text-center py-8 text-white/60">Ładowanie...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  {entries.length === 0
                    ? 'Brak decyzji. Dodaj pierwszą!'
                    : 'Brak decyzji pasujących do filtrów.'}
                </div>
              ) : (
                <>
                  <div className="mb-3 text-xs text-white/60">
                    {filterDecisionStatus === 'PENDING' && `${pendingCount} decyzji do oceny`}
                    {filterDecisionStatus === 'REVIEWED' && `${reviewedCount} decyzji ocenionych`}
                    {filterDecisionStatus === 'ALL' && `${allCount} decyzji łącznie`}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {(showMoreCards ? filteredEntries : filteredEntries.slice(0, 6)).map((entry) => {
                      const thesisLines = entry.thesis.split('\n').length;
                      const thesisTooLong = entry.thesis.length > 100;
                      const showExpandThesis = thesisTooLong && !expandedThesisIds.has(entry.id);
                      
                      return (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors"
                        >
                          {/* Top bar: instrument + status + date */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold">{entry.symbol}</h3>
                            <div className="flex items-center gap-2">
                              {entry.status === 'OPEN' ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                                  {getStatusLabel(entry.status)}
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                  {getStatusLabel(entry.status)}
                                </span>
                              )}
                              <span className="text-xs text-white/50">
                                {new Date(entry.created_at).toLocaleDateString('pl-PL', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                entry.direction === 'LONG'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {getDirectionLabel(entry.direction)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">
                              {getMarketModeLabel(entry.market_mode)}
                            </span>
                            {entry.status === 'REVIEWED' && entry.outcome && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  entry.outcome === 'WIN'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : entry.outcome === 'LOSE'
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-white/10 text-white/80'
                                }`}
                              >
                                {getOutcomeLabel(entry.outcome)}
                              </span>
                            )}
                          </div>

                          {/* Thesis with expand/collapse */}
                          <div className="mb-3">
                            {showExpandThesis ? (
                              <>
                                <p className="text-sm text-white/80 line-clamp-2 mb-1">{entry.thesis}</p>
                                <button
                                  onClick={() => setExpandedThesisIds(new Set([...expandedThesisIds, entry.id]))}
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  Pokaż więcej
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-white/80 mb-1">{entry.thesis}</p>
                                {expandedThesisIds.has(entry.id) && (
                                  <button
                                    onClick={() => {
                                      const newSet = new Set(expandedThesisIds);
                                      newSet.delete(entry.id);
                                      setExpandedThesisIds(newSet);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                  >
                                    Pokaż mniej
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Ocena wsteczna AI (po minimalnym czasie od zapisu) */}
                          {entry.ai_analysis ? (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-medium text-white/90 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                                  Ocena wsteczna AI
                                </span>
                                {entry.ai_analyzed_at && (
                                  <span className="text-xs text-white/45">
                                    {new Date(entry.ai_analyzed_at).toLocaleString('pl-PL', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                              {typeof entry.ai_analysis.score === 'number' && (
                                <p className="text-xs text-white/60 mb-2">
                                  Trafność (edukacyjnie): {entry.ai_analysis.score}/100
                                </p>
                              )}
                              {expandedAiAnalysisId === entry.id ? (
                                <div className="space-y-3 text-sm text-white/80">
                                  {entry.ai_analysis.analysis && (
                                    <p className="whitespace-pre-wrap">{entry.ai_analysis.analysis}</p>
                                  )}
                                  {entry.ai_analysis.market_context && (
                                    <div>
                                      <div className="text-xs font-semibold text-white/50 mb-1">Kontekst rynku</div>
                                      <p className="whitespace-pre-wrap text-white/75">{entry.ai_analysis.market_context}</p>
                                    </div>
                                  )}
                                  {entry.ai_analysis.what_went_well && entry.ai_analysis.what_went_well.length > 0 && (
                                    <div>
                                      <div className="text-xs font-semibold text-emerald-300/90 mb-1">Co poszło dobrze</div>
                                      <ul className="list-disc list-inside space-y-1 text-white/75">
                                        {entry.ai_analysis.what_went_well.map((line, i) => (
                                          <li key={i}>{line}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {entry.ai_analysis.what_could_be_better &&
                                    entry.ai_analysis.what_could_be_better.length > 0 && (
                                      <div>
                                        <div className="text-xs font-semibold text-amber-300/90 mb-1">Co można poprawić</div>
                                        <ul className="list-disc list-inside space-y-1 text-white/75">
                                          {entry.ai_analysis.what_could_be_better.map((line, i) => (
                                            <li key={i}>{line}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  {entry.ai_analysis.lessons_learned && entry.ai_analysis.lessons_learned.length > 0 && (
                                    <div>
                                      <div className="text-xs font-semibold text-blue-300/90 mb-1">Wnioski</div>
                                      <ul className="list-disc list-inside space-y-1 text-white/75">
                                        {entry.ai_analysis.lessons_learned.map((line, i) => (
                                          <li key={i}>{line}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedAiAnalysisId(null)}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                  >
                                    Zwiń analizę
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setExpandedAiAnalysisId(entry.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  Pokaż analizę AI
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              {(() => {
                                const elig = getRetrospectiveAnalyzeEligibility(entry.created_at, entry.horizon);
                                const waitLabel = formatRoughTimeUntilFromHoursRemaining(elig.hoursRemaining);
                                return (
                                  <>
                                    <p className="text-xs text-white/50 mb-2">
                                      {elig.canAnalyze
                                        ? 'Możesz poprosić AI o krótką ocenę wsteczną (edukacyjnie, bez rekomendacji inwestycyjnych).'
                                        : `Ocena wsteczna odblokuje się ${waitLabel} (min. ${elig.minHours} h od zapisu dla „${getHorizonLabel(entry.horizon)}”). Od ok. ${elig.canAnalyzeAfter.toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`}
                                    </p>
                                    <button
                                      type="button"
                                      disabled={!elig.canAnalyze || analyzingEntryId === entry.id}
                                      onClick={() => handleAIAnalysis(entry.id)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10"
                                    >
                                      <Sparkles className="h-4 w-4 text-amber-300" />
                                      {analyzingEntryId === entry.id ? 'Analizowanie…' : 'Oceń wstecz przez AI'}
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {filteredEntries.length > 6 && !showMoreCards && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowMoreCards(true)}
                        className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        Pokaż więcej ({filteredEntries.length - 6} więcej)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statement Analysis Section - Accordion at bottom (only once, at the bottom) */}
        <div className="rounded-2xl bg-white/5 border border-white/10 mb-8 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedStatementAnalysis(!expandedStatementAnalysis)}
            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Analiza statementu (opcjonalnie)
            </h2>
            {expandedStatementAnalysis ? (
              <ChevronUp className="h-5 w-5 text-white/60" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white/60" />
            )}
          </button>
          {expandedStatementAnalysis && (
            <div className="px-6 pb-6 border-t border-white/10 pt-6">
              <p className="text-sm text-white/70 mb-4">
                Wklej pełny statement transakcji z Twojego brokera zawierający listę transakcji z datami, kierunkami (buy/sell, long/short), wartościami P&L, wielkościami pozycji i symbolami instrumentów. Możesz także wgrać plik (CSV, Excel) od brokera. AI przeanalizuje Twoje decyzje i wskaże, co można było zrobić lepiej w kontekście analizy technicznej i fundamentalnej.
              </p>
              
              {/* Example Statement Section */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowStatementExample(!showStatementExample)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2"
                >
                  <FileText className="h-4 w-4" />
                  {showStatementExample ? 'Ukryj' : 'Pokaż'} przykład jak powinien wyglądać statement
                  {showStatementExample ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showStatementExample && (
                  <div className="rounded-lg bg-white/5 border border-white/10 p-4 mb-4">
                    <p className="text-xs text-white/60 mb-3">
                      Przykład poprawnego formatu statementu (CSV z nagłówkami):
                    </p>
                    <pre className="text-xs text-white/80 bg-black/20 p-3 rounded overflow-x-auto">
{`Ticket,Open Date,Close Date,Instrument,Type,Volume,Open Price,Close Price,Gross P&L,Swap,Commission,Net P&L
123456,2024-01-15 10:30:00,2024-01-15 14:20:00,EURUSD,Buy,0.10,1.08500,1.08750,25.00,0.00,0.00,25.00
123457,2024-01-15 11:15:00,2024-01-15 16:45:00,GBPUSD,Sell,0.10,1.27000,1.26800,20.00,0.00,0.00,20.00
123458,2024-01-16 09:00:00,2024-01-16 12:30:00,US100,Buy,0.05,16800.00,16850.00,25.00,0.00,0.00,25.00
123459,2024-01-16 13:00:00,2024-01-16 15:00:00,EURUSD,Sell,0.20,1.09000,1.08800,-40.00,0.00,0.00,-40.00`}
                    </pre>
                    <p className="text-xs text-white/60 mt-3">
                      <strong>Wymagane kolumny:</strong> Instrument (symbol), Type (Buy/Sell lub Long/Short), Net P&L (wartość P&L). 
                      Opcjonalnie: daty, volume, ceny. Statement może być w formacie CSV, TXT lub Excel (XLSX, XLS).
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Statement transakcji</label>
              
              {/* File Upload Option */}
              <div className="mb-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-sm text-white/80">
                  <Upload className="h-4 w-4" />
                  Wgraj plik (CSV, Excel)
                  <input
                    type="file"
                    accept=".csv,.txt,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    disabled={uploadingFile || analyzingStatement}
                  />
                </label>
                {uploadingFile && (
                  <span className="text-xs text-blue-400 ml-2">Wgrywanie pliku...</span>
                )}
              </div>
              
              <textarea
                value={transactionStatement}
                onChange={(e) => setTransactionStatement(e.target.value)}
                rows={6}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                placeholder="Wklej tutaj pełny statement transakcji z Twojego brokera (CSV, tekst, Excel) zawierający listę transakcji z datami, kierunkami, wartościami P&L, wielkościami pozycji i symbolami instrumentów..."
              />
            </div>
            <button
              onClick={handleStatementAnalysis}
              disabled={analyzingStatement || !transactionStatement.trim() || uploadingFile}
              className="w-full md:w-auto rounded-xl bg-blue-500 text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzingStatement ? 'Analizowanie...' : (
                <>
                  <Brain className="h-4 w-4" />
                  Analizuj statement przez AI
                </>
              )}
            </button>
            </div>
            {statementAnalysis && (
              <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Wynik analizy AI</h3>
              {statementAnalysis.summary && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60 mb-1">Win Rate</div>
                      <div className="text-xl font-bold">{statementAnalysis.summary.win_rate?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60 mb-1">Total Trades</div>
                      <div className="text-xl font-bold">{statementAnalysis.summary.total_trades || 0}</div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60 mb-1">Net P&L</div>
                      <div className={`text-xl font-bold ${(statementAnalysis.summary.net_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {typeof statementAnalysis.summary.net_pnl === 'number' 
                          ? statementAnalysis.summary.net_pnl.toFixed(2) 
                          : (statementAnalysis.summary.net_pnl || 0)}
                      </div>
                    </div>
                    {statementAnalysis.summary.profit_factor && (
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs text-white/60 mb-1">Profit Factor</div>
                        <div className="text-xl font-bold">
                          {statementAnalysis.summary.profit_factor === Infinity 
                            ? '∞' 
                            : statementAnalysis.summary.profit_factor.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                  {statementAnalysis.by_instrument && Array.isArray(statementAnalysis.by_instrument) && statementAnalysis.by_instrument.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-3">Wyniki per instrument</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {statementAnalysis.by_instrument.map((inst: any, idx: number) => (
                          <div key={idx} className="rounded-xl bg-white/5 p-3">
                            <div className="text-sm font-semibold mb-2">{inst.instrument}</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white/60">Transakcje:</span>
                                <span className="text-white/80">{inst.trades}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Win Rate:</span>
                                <span className="text-white/80">{inst.win_rate.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Net P&L:</span>
                                <span className={`font-semibold ${inst.net_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {inst.net_pnl.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {statementAnalysis.detailed_analysis && (
                <div className="rounded-xl bg-white/5 p-4 mb-4">
                  <div className="text-sm text-white/80 whitespace-pre-wrap">{statementAnalysis.detailed_analysis}</div>
                </div>
              )}
              {statementAnalysis.recommendations && Array.isArray(statementAnalysis.recommendations) && statementAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Rekomendacje</h4>
                  <div className="space-y-2">
                    {statementAnalysis.recommendations.slice(0, 5).map((rec: any, idx: number) => (
                      <div key={idx} className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
                        {rec.recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
            </div>
          )}
          </div>
        </div>
    </main>
  );
}
