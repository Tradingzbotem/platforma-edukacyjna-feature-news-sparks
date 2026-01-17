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

  // Filters
  const [filterMarketMode, setFilterMarketMode] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state
  const [formSymbol, setFormSymbol] = useState('US100');
  const [formDirection, setFormDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [formHorizon, setFormHorizon] = useState<'INTRADAY' | 'SWING' | 'POSITION'>('INTRADAY');
  const [formMarketMode, setFormMarketMode] = useState<'TREND' | 'RANGE' | 'NEWS'>('TREND');
  const [formConfidence, setFormConfidence] = useState<number>(3);
  const [formThesis, setFormThesis] = useState('');
  const [aiOpinion, setAiOpinion] = useState<{ 
    opinion: string; 
    isGood: boolean;
    strengths?: string[];
    concerns?: string[];
    suggestion?: string;
  } | null>(null);
  const [analyzingDecision, setAnalyzingDecision] = useState(false);

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
      const res = await fetch('/api/decision-lab/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: formSymbol,
          direction: formDirection,
          horizon: formHorizon,
          thesis: formThesis.trim(),
          market_mode: formMarketMode,
          confidence: formConfidence,
        }),
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
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze decision');
      }

      const data = await res.json();
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

    setAnalyzingDecision(true);
    setAiOpinion(null);
    try {
      setError(null);
      const res = await fetch('/api/decision-lab/opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: formSymbol,
          direction: formDirection,
          horizon: formHorizon,
          thesis: formThesis.trim(),
          market_mode: formMarketMode,
          confidence: formConfidence,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze decision');
      }

      const data = await res.json();
      setAiOpinion({
        opinion: data.opinion || 'Brak opinii',
        isGood: data.isGood || false,
        strengths: data.strengths || [],
        concerns: data.concerns || [],
        suggestion: data.suggestion || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze decision');
    } finally {
      setAnalyzingDecision(false);
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
    return entries
      .filter((e) => {
        if (filterMarketMode !== 'ALL' && e.market_mode !== filterMarketMode) return false;
        if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [entries, filterMarketMode, filterStatus]);

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
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Decision Lab — Twój dziennik decyzji rynkowych
            </h1>
            <div className="space-y-3 mb-4">
              <p className="text-lg text-white/80 leading-relaxed">
                Decision Lab to miejsce, w którym zapisujesz swoje pomysły na rynek i wracasz do nich, aby sprawdzić, jak faktycznie się zachowałeś. Nie chodzi tu o idealne wejścia, lecz o zrozumienie własnego procesu podejmowania decyzji.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                Zamiast zgadywać, czy „masz rację”, widzisz, w jakich warunkach podejmujesz najlepsze decyzje, a kiedy emocje lub pośpiech zaczynają przejmować kontrolę.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                To narzędzie edukacyjne, które pomaga budować dyscyplinę, świadomość ryzyka i konsekwencję w działaniu.
              </p>
            </div>
            <p className="text-sm text-white/50 italic">
              Materiały mają charakter edukacyjny. Nie zawierają rekomendacji inwestycyjnych ani sygnałów transakcyjnych.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold mb-4">Profil decyzyjny (30 dni)</h2>
            {profile ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold mb-1">{profile.mostCommonSymbol}</div>
                  <div className="text-xs text-white/60">Najczęstszy instrument</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">{getMarketModeLabel(profile.mostCommonMode)}</div>
                  <div className="text-xs text-white/60">Najczęstsza sytuacja</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {profile.longPct}% / {profile.shortPct}%
                  </div>
                  <div className="text-xs text-white/60">Na wzrost / Na spadek</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">{profile.avgConfidence}/5</div>
                  <div className="text-xs text-white/60">Średnia pewność</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                Dodaj pierwszą decyzję, aby zbudować profil
              </div>
            )}
          </div>
        </div>

        {/* Best Conditions Analysis */}
        {(bestConditions.bestEmotionalState || bestConditions.bestTimeOfDay || bestConditions.bestMarketMode || bestConditions.emotionalImpact) && (
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Kiedy podejmujesz najlepsze decyzje?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bestConditions.bestEmotionalState && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-white/60 mb-1">Najlepszy stan emocjonalny</div>
                  <div className="text-lg font-bold mb-1">
                    {bestConditions.bestEmotionalState.state === 'CALM' && 'Spokojny'}
                    {bestConditions.bestEmotionalState.state === 'CONFIDENT' && 'Pewny siebie'}
                    {bestConditions.bestEmotionalState.state === 'UNCERTAIN' && 'Niepewny'}
                    {bestConditions.bestEmotionalState.state === 'ANXIOUS' && 'Niespokojny'}
                    {bestConditions.bestEmotionalState.state === 'EXCITED' && 'Podekscytowany'}
                    {bestConditions.bestEmotionalState.state === 'RUSHED' && 'W pośpiechu'}
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round(bestConditions.bestEmotionalState.winRate)}% trafności ({bestConditions.bestEmotionalState.total} decyzji)
                  </div>
                </div>
              )}
              {bestConditions.bestTimeOfDay && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-white/60 mb-1">Najlepsza pora dnia</div>
                  <div className="text-lg font-bold mb-1">
                    {bestConditions.bestTimeOfDay.time === 'MORNING' && 'Rano'}
                    {bestConditions.bestTimeOfDay.time === 'AFTERNOON' && 'Popołudnie'}
                    {bestConditions.bestTimeOfDay.time === 'EVENING' && 'Wieczór'}
                    {bestConditions.bestTimeOfDay.time === 'NIGHT' && 'Noc'}
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round(bestConditions.bestTimeOfDay.winRate)}% trafności ({bestConditions.bestTimeOfDay.total} decyzji)
                  </div>
                </div>
              )}
              {bestConditions.bestMarketMode && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-white/60 mb-1">Najlepsza sytuacja rynkowa</div>
                  <div className="text-lg font-bold mb-1">
                    {getMarketModeLabel(bestConditions.bestMarketMode.mode)}
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round(bestConditions.bestMarketMode.winRate)}% trafności ({bestConditions.bestMarketMode.total} decyzji)
                  </div>
                </div>
              )}
              {bestConditions.emotionalImpact && bestConditions.emotionalImpact.calmWinRate !== null && bestConditions.emotionalImpact.emotionalWinRate !== null && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-white/60 mb-1">Wpływ emocji</div>
                  <div className="text-lg font-bold mb-1">
                    {bestConditions.emotionalImpact.calmWinRate > bestConditions.emotionalImpact.emotionalWinRate
                      ? 'Spokój wygrywa'
                      : 'Emocje obniżają trafność'}
                  </div>
                  <div className="text-xs text-white/60">
                    Spokój: {Math.round(bestConditions.emotionalImpact.calmWinRate)}% vs Emocje: {Math.round(bestConditions.emotionalImpact.emotionalWinRate)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discipline Metrics */}
        {disciplineMetrics.plannedVsActual && (
          <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              Plan vs Rzeczywistość — Dyscyplina w działaniu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-white/60 mb-1">Wszedłem zgodnie z planem</div>
                <div className="text-2xl font-bold mb-1">{Math.round(disciplineMetrics.plannedVsActual.enteredAsPlannedPct)}%</div>
                <div className="text-xs text-white/60">
                  {disciplineMetrics.plannedVsActual.total} ocenionych decyzji
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-white/60 mb-1">Nie wszedłem / Czekałem zbyt długo</div>
                <div className="text-2xl font-bold mb-1">{Math.round(disciplineMetrics.plannedVsActual.didNotEnterPct)}%</div>
                <div className="text-xs text-white/60">Możliwa przesada w ostrożności</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-white/60 mb-1">Zmieniłem zdanie / Wszedłem inaczej</div>
                <div className="text-2xl font-bold mb-1">{Math.round(disciplineMetrics.plannedVsActual.changedMindPct)}%</div>
                <div className="text-xs text-white/60">Możliwa impulsywność</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Częstotliwość przeglądu decyzji</span>
                <span className="text-2xl font-bold">{Math.round(disciplineMetrics.reviewRate)}%</span>
              </div>
              <div className="text-xs text-white/60 mt-1">
                {disciplineMetrics.consistency?.reviewedCount} z {disciplineMetrics.consistency?.totalCount} decyzji ocenionych
              </div>
            </div>
          </div>
        )}

        {/* Top Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold">Sytuacja na rynku</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{insights.marketMode.pct}%</div>
            <div className="text-xs text-white/60">{insights.marketMode.text}</div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              {insights.direction.direction === 'LONG' ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
              <h3 className="text-sm font-semibold">Kierunek rynku</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{insights.direction.pct}%</div>
            <div className="text-xs text-white/60">{insights.direction.text}</div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold">Konsekwencja</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{insights.consistency.pct}%</div>
            <div className="text-xs text-white/60 line-clamp-2">{insights.consistency.text}</div>
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

        {/* Enhanced Add Decision Form */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dodaj decyzję</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Top section: Chart left, Options right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Chart - Left side */}
              <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-white/80">Wykres {formSymbol}</h3>
                </div>
                <div className="h-[400px] lg:h-[450px]">
                  <TradingViewAdvancedEmbed
                    symbol={mapSymbolToTradingView(formSymbol)}
                    className="w-full h-full"
                    containerClassName="h-full w-full"
                  />
                </div>
                <div className="px-3 py-2 text-[10px] text-white/50 border-t border-white/10">
                  Wykres dostarczany przez{' '}
                  <a
                    href="https://www.tradingview.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white/80"
                  >
                    TradingView
                  </a>
                </div>
              </div>

              {/* Options - Right side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Instrument (np. US100, EURUSD)</label>
                  <select
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {SYMBOLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kierunek rynku</label>
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
              </div>
            </div>

            {/* Bottom section: Remaining fields */}
            <div className="space-y-4 pt-4 border-t border-white/10">

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
            </div>

            {/* AI Opinion Button - Show when all fields are filled */}
            {formThesis.trim() && (
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleDecisionOpinion}
                  disabled={analyzingDecision}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-6 py-3 font-semibold hover:from-blue-500/30 hover:to-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* Display AI Opinion */}
                {aiOpinion && (
                  <div className={`mt-4 rounded-xl border p-4 ${
                    aiOpinion.isGood 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-orange-500/10 border-orange-500/20'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <Brain className={`h-5 w-5 mt-0.5 ${
                        aiOpinion.isGood ? 'text-emerald-400' : 'text-orange-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-semibold ${
                            aiOpinion.isGood ? 'text-emerald-300' : 'text-orange-300'
                          }`}>
                            {aiOpinion.isGood ? '✓ Decyzja wygląda dobrze' : '⚠ Warto przemyśleć'}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 mb-3">{aiOpinion.opinion}</p>
                        
                        {aiOpinion.strengths && aiOpinion.strengths.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-emerald-300 mb-1">Mocne strony:</div>
                            <ul className="space-y-1">
                              {aiOpinion.strengths.map((item: string, idx: number) => (
                                <li key={idx} className="text-xs text-white/70">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiOpinion.concerns && aiOpinion.concerns.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-orange-300 mb-1">Wątpliwości:</div>
                            <ul className="space-y-1">
                              {aiOpinion.concerns.map((item: string, idx: number) => (
                                <li key={idx} className="text-xs text-white/70">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiOpinion.suggestion && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="text-xs font-medium text-blue-300 mb-1">Sugestia:</div>
                            <p className="text-xs text-white/70">{aiOpinion.suggestion}</p>
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

        {/* Premium Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Radar Chart - Premium */}
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4">Profil decyzji</h3>
            {radarData.some((d) => d.value > 0) ? (
              <ResponsiveContainerDynamic width="100%" height={300}>
                <RadarChartDynamic data={radarData}>
                  <PolarGridDynamic stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxisDynamic
                    dataKey="mode"
                    tickFormatter={(value) => getMarketModeLabel(value)}
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <PolarRadiusAxisDynamic
                    angle={90}
                    domain={[0, 'dataMax']}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  />
                  <RadarDynamic
                    name="Decyzje"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <TooltipDynamic
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RadarChartDynamic>
              </ResponsiveContainerDynamic>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40">
                Brak danych do wyświetlenia
              </div>
            )}
          </div>

          {/* Line Chart - Helper */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4">Decyzje w czasie (14 dni)</h3>
            {dayData.length > 0 ? (
              <ResponsiveContainerDynamic width="100%" height={300}>
                <LineChartDynamic data={dayData}>
                  <XAxisDynamic
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                  />
                  <YAxisDynamic tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <TooltipDynamic
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <LineDynamic
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChartDynamic>
              </ResponsiveContainerDynamic>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40">
                Brak danych
              </div>
            )}
          </div>
        </div>

        {/* Statement Analysis Section */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            Co można było zrobić lepiej - analiza techniczna i fundamentalna
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Wklej pełny statement transakcji z Twojego brokera zawierający listę transakcji z datami, kierunkami (buy/sell, long/short), wartościami P&L, wielkościami pozycji i symbolami instrumentów. AI przeanalizuje Twoje decyzje i wskaże, co można było zrobić lepiej w kontekście analizy technicznej i fundamentalnej.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Statement transakcji</label>
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
              disabled={analyzingStatement || !transactionStatement.trim()}
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

        {/* Enhanced Recent Decisions with Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">Ostatnie decyzje</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <select
                  value={filterMarketMode}
                  onChange={(e) => setFilterMarketMode(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="ALL">Wszystkie sytuacje</option>
                  {MARKET_MODES.map((m) => (
                    <option key={m} value={m}>
                      {getMarketModeLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="ALL">Wszystkie</option>
                <option value="OPEN">Oczekuje na ocenę</option>
                <option value="REVIEWED">Ocenione</option>
              </select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{entry.symbol}</h3>
                    {entry.status === 'OPEN' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                        {getStatusLabel(entry.status)}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                        {getStatusLabel(entry.status)}
                      </span>
                    )}
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

                  <p className="text-sm text-white/80 mb-3 line-clamp-2">{entry.thesis}</p>

                  {(entry.emotional_state || entry.risk_notes) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.emotional_state && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                          {entry.emotional_state === 'CALM' && 'Spokojny'}
                          {entry.emotional_state === 'CONFIDENT' && 'Pewny siebie'}
                          {entry.emotional_state === 'UNCERTAIN' && 'Niepewny'}
                          {entry.emotional_state === 'ANXIOUS' && 'Niespokojny'}
                          {entry.emotional_state === 'EXCITED' && 'Podekscytowany'}
                          {entry.emotional_state === 'RUSHED' && 'W pośpiechu'}
                        </span>
                      )}
                      {entry.risk_notes && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300" title={entry.risk_notes}>
                          Ryzyko zdefiniowane
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                    <span>
                      {new Date(entry.created_at).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Pewność: {getConfidenceLabel(entry.confidence)}</span>
                  </div>

                  {/* Chart Section */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setExpandedChartId(expandedChartId === entry.id ? null : entry.id)}
                      className="w-full flex items-center justify-between text-xs font-medium text-white/80 hover:text-white transition-colors mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Wykres {entry.symbol}
                      </span>
                      {expandedChartId === entry.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedChartId === entry.id && (
                      <div className="mt-3 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <TradingViewAdvancedEmbed
                          symbol={mapSymbolToTradingView(entry.symbol)}
                          className="w-full"
                          containerClassName="h-full w-full"
                        />
                        <div className="px-3 py-2 text-[10px] text-white/50">
                          Wykres dostarczany przez{' '}
                          <a
                            href="https://www.tradingview.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white/80"
                          >
                            TradingView
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {entry.status === 'OPEN' && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <button
                        onClick={() => handleAIAnalysis(entry.id)}
                        disabled={analyzingEntryId === entry.id}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {analyzingEntryId === entry.id ? (
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

                      <div>
                        <label className="block text-xs font-medium mb-2 text-white/80">
                          Co faktycznie zrobiłeś?
                        </label>
                        <div className="flex gap-1 flex-wrap">
                          {ACTUAL_ACTIONS.map((action) => {
                            const labels: Record<string, string> = {
                              ENTERED_AS_PLANNED: 'Wszedłem zgodnie z planem',
                              DID_NOT_ENTER: 'Nie wszedłem',
                              CHANGED_MIND: 'Zmieniłem zdanie',
                              ENTERED_DIFFERENTLY: 'Wszedłem inaczej',
                              WAITED_TOO_LONG: 'Czekałem zbyt długo',
                            };
                            return (
                              <button
                                key={action}
                                type="button"
                                onClick={() =>
                                  setReviewActualAction((prev) => ({
                                    ...prev,
                                    [entry.id]: reviewActualAction[entry.id] === action ? undefined as any : action,
                                  }))
                                }
                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                                  reviewActualAction[entry.id] === action
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                {labels[action]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedNoteId(expandedNoteId === entry.id ? null : entry.id)
                        }
                        className="text-xs text-white/60 hover:text-white/80 underline"
                      >
                        {expandedNoteId === entry.id ? 'Ukryj notatkę' : 'Dodaj notatkę'}
                      </button>
                      {expandedNoteId === entry.id && (
                        <textarea
                          value={reviewNote[entry.id] || ''}
                          onChange={(e) =>
                            setReviewNote((prev) => ({ ...prev, [entry.id]: e.target.value }))
                          }
                          rows={2}
                          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                          placeholder="Dodaj notatkę (opcjonalnie)..."
                        />
                      )}
                    </div>
                  )}

                  {entry.status === 'REVIEWED' && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      {entry.ai_analysis && (
                        <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-400" />
                            <span className="text-xs font-semibold text-purple-300">Analiza AI</span>
                            {entry.ai_analysis.score && (
                              <span className="text-xs text-white/60 ml-auto">
                                Ocena: {entry.ai_analysis.score}/100
                              </span>
                            )}
                          </div>
                          {entry.ai_analysis.analysis && (
                            <p className="text-xs text-white/80 mb-2">{entry.ai_analysis.analysis}</p>
                          )}
                          {entry.ai_analysis.what_went_well && Array.isArray(entry.ai_analysis.what_went_well) && entry.ai_analysis.what_went_well.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-emerald-300 mb-1">Co poszło dobrze:</div>
                              <ul className="space-y-1">
                                {entry.ai_analysis.what_went_well.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white/70">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {entry.ai_analysis.what_could_be_better && Array.isArray(entry.ai_analysis.what_could_be_better) && entry.ai_analysis.what_could_be_better.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-orange-300 mb-1">Co można poprawić:</div>
                              <ul className="space-y-1">
                                {entry.ai_analysis.what_could_be_better.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white/70">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {entry.ai_analysis.lessons_learned && Array.isArray(entry.ai_analysis.lessons_learned) && entry.ai_analysis.lessons_learned.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-blue-300 mb-1">Wnioski:</div>
                              <ul className="space-y-1">
                                {entry.ai_analysis.lessons_learned.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-white/70">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {entry.actual_action && (
                        <div>
                          <div className="text-xs text-white/60 mb-1">Faktyczne działanie:</div>
                          <div className="text-xs text-white/80 font-medium">
                            {entry.actual_action === 'ENTERED_AS_PLANNED' && '✓ Wszedłem zgodnie z planem'}
                            {entry.actual_action === 'DID_NOT_ENTER' && '✗ Nie wszedłem'}
                            {entry.actual_action === 'CHANGED_MIND' && '↻ Zmieniłem zdanie'}
                            {entry.actual_action === 'ENTERED_DIFFERENTLY' && '↺ Wszedłem inaczej'}
                            {entry.actual_action === 'WAITED_TOO_LONG' && '⏱ Czekałem zbyt długo'}
                          </div>
                        </div>
                      )}
                      {entry.risk_notes && (
                        <div>
                          <div className="text-xs text-white/60 mb-1">Notatki o ryzyku:</div>
                          <p className="text-xs text-white/70 italic">{entry.risk_notes}</p>
                        </div>
                      )}
                      {entry.note && (
                        <div>
                          <div className="text-xs text-white/60 mb-1">Refleksja:</div>
                          <p className="text-xs text-white/60 italic">{entry.note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
