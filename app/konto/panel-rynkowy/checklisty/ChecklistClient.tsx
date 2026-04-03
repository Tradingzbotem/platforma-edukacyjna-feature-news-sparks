'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { ChecklistGroup, ChecklistItem } from '@/lib/panel/checklists';
import { CHECKLISTS } from '@/lib/panel/checklists';

// Statusy dla elementów checklisty
type ItemStatus = 'pending' | 'detected' | 'confirmed' | 'negated';

// Kontekst - uproszczony wybór aktywa/interwału/horyzontu
type Timeframe = 'H1' | 'H4' | 'D1';
type Horizon = 'Dziś (do końca dnia)' | '1–2 dni' | 'Tydzień';

// Decision Drawer - typy
type Thesis = 'Wyżej' | 'Niżej' | 'Bez większej zmiany' | '';

const TIMEFRAMES: Timeframe[] = ['H1', 'H4', 'D1'];
const HORIZONS: Horizon[] = ['Dziś (do końca dnia)', '1–2 dni', 'Tydzień'];

// Historia - typ zgodny z API
type HistoryItem = {
  id: string;
  asset: string | null;
  timeframe: string | null;
  horizon: string | null;
  createdAt: string;
  checkedCount: number;
  thesis?: string | null;
  plan_b?: string | null;
  risk?: string | null;
  invalidation_kind?: string | null;
  invalidation_level?: string | null;
  checks?: Record<string, boolean> | null;
};

function useItemStatuses() {
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});

  useEffect(() => {
    const initial: Record<string, ItemStatus> = {};
    for (const group of CHECKLISTS) {
      for (const item of group.items) {
        initial[item.id] = 
          ['macro-brief'].includes(item.id) 
            ? 'detected' 
            : 'pending';
      }
    }
    setStatuses(initial);
  }, []);

  const updateStatus = (itemId: string, newStatus: ItemStatus) => {
    setStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
  };

  const confirmItem = (itemId: string) => {
    if (statuses[itemId] === 'detected') {
      updateStatus(itemId, 'confirmed');
    }
  };

  const negateItem = (itemId: string) => {
    if (statuses[itemId] === 'detected') {
      updateStatus(itemId, 'negated');
    }
  };

  const replaceStatuses = (normalizedStatuses: Record<string, ItemStatus>) => {
    setStatuses(normalizedStatuses);
  };

  const patchStatuses = (patch: Record<string, ItemStatus>, allIds: string[]) => {
    setStatuses((prev) => {
      const next = { ...prev };
      for (const id of allIds) {
        if (patch[id] !== undefined && prev[id] === 'pending') {
          next[id] = patch[id];
        }
      }
      return next;
    });
  };

  return { statuses, setStatuses, updateStatus, confirmItem, negateItem, replaceStatuses, patchStatuses };
}

function groupItemIds(groups: ChecklistGroup[]): string[] {
  const ids: string[] = [];
  for (const g of groups) {
    for (const it of g.items) ids.push(it.id);
  }
  return ids;
}

function mapGroupToSection(groupId: string): string {
  switch (groupId) {
    case 'context':
      return 'A) Kontekst rynku (makro / sentyment)';
    case 'technical':
      return 'B) Struktura ceny (technika)';
    case 'risk':
      return 'C) Warunki gry (zmienność / egzekucja / ryzyko)';
    default:
      return groupId;
  }
}

// Helper: sprawdź czy item jest ręczny (nigdy nie będzie automatyczny)
function isManualItem(itemId: string): boolean {
  return ['levels', 'retests', 'confluence', 'seasonality', 'spread-check'].includes(itemId);
}

// Helper: sprawdź czy item może być automatyczny (ma engineReport)
function isAutomaticItem(itemId: string): boolean {
  return ['calendar', 'events-impacts', 'sentiment', 'volatility'].includes(itemId);
}

// Helper: mikro-tekst dla pending items (bez prefiksu "Ręcznie:")
function getPendingHint(itemId: string): string | null {
  switch (itemId) {
    case 'levels':
    case 'retests':
    case 'confluence':
      return 'wymaga oceny na wykresie';
    case 'spread-check':
      return 'wymaga danych brokera/spreadu';
    case 'macro-brief':
      return 'Sprawdź 2–3 wątki makro dla aktywa.';
    case 'events-impacts':
      return 'Oceń, czy nadchodzące eventy mogą poruszyć aktywo.';
    case 'sentiment':
      return 'Wypełni się, gdy brief/news dadzą wyraźny sentyment.';
    case 'volatility':
      return 'Wypełni się, gdy ATR wybije powyżej progu vs mediana.';
    case 'seasonality':
      return 'wymaga oceny kontekstu';
    default:
      return null;
  }
}

function getStatusEmoji(status: ItemStatus): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'detected':
      return '🟡';
    case 'confirmed':
      return '🟢';
    case 'negated':
      return '🔴';
    default:
      return '⏳';
  }
}

// Helper: normalizacja checks do statuses - ignoruje klucze spoza allIds
function normalizeChecksToStatuses(
  checks: Record<string, boolean> | null | undefined,
  allIds: string[]
): Record<string, ItemStatus> {
  const normalized: Record<string, ItemStatus> = {};
  // Dla każdego id w allIds: jeśli checks[id] === true -> 'confirmed', else -> 'pending'
  for (const id of allIds) {
    normalized[id] = checks?.[id] === true ? 'confirmed' : 'pending';
  }
  return normalized;
}

// Helper: formatowanie daty do YYYY-MM-DD HH:mm (local time)
function formatDateTime(input: string): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) {
    return input;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Helper: znajdź item po id i zwróć jego text
function getItemTextById(itemId: string): string {
  for (const group of CHECKLISTS) {
    const item = group.items.find((it) => it.id === itemId);
    if (item) {
      return item.text;
    }
  }
  return itemId; // fallback do id jeśli nie znaleziono
}

// Helper: normalizuj wartość tekstową - traktuj "nie ma"/"brak"/"n/a" jako puste
function normalizeTextValue(s: string): string {
  const trimmed = s.trim();
  const emptyPattern = /^(nie ma|brak|n\/a|na|-|—|\.)$/i;
  return emptyPattern.test(trimmed) ? '' : trimmed;
}

// Komponent Decision Drawer
function DecisionDrawer({
  thesis,
  onThesisChange,
  invalidation,
  onInvalidationChange,
  planB,
  onPlanBChange,
  risk,
  onRiskChange,
  onSave,
  saveStatus,
  saveErrorDetails,
  statuses,
  reasonsById,
  allIds,
  context,
  onContextChange,
}: {
  thesis: Thesis;
  onThesisChange: (t: Thesis) => void;
  invalidation: string;
  onInvalidationChange: (v: string) => void;
  planB: string;
  onPlanBChange: (v: string) => void;
  risk: string;
  onRiskChange: (v: string) => void;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'db-error' | 'unauthorized';
  saveErrorDetails?: { status?: number; message?: string } | null;
  statuses: Record<string, ItemStatus>;
  reasonsById: Record<string, string>;
  allIds: string[];
  context: { asset: string; timeframe: Timeframe; horizon: Horizon };
  onContextChange: (ctx: { asset: string; timeframe: Timeframe; horizon: Horizon }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Oblicz wykrycia i potwierdzenia
  const detectedAndConfirmed = useMemo(() => {
    const detected: Array<{ id: string; reason?: string }> = [];
    const confirmed: string[] = [];
    
    for (const id of allIds) {
      const status = statuses[id] || 'pending';
      if (status === 'detected') {
        detected.push({ id, reason: reasonsById[id] });
      } else if (status === 'confirmed') {
        confirmed.push(id);
      }
    }
    
    return { detected, confirmed };
  }, [statuses, reasonsById, allIds]);
  
  // Top 3 pending
  const topPending = useMemo(() => {
    const pending: Array<{ id: string; hint?: string }> = [];
    for (const id of allIds) {
      if (statuses[id] === 'pending') {
        const hint = getPendingHint(id);
        pending.push({ id, hint: hint || undefined });
      }
    }
    return pending.slice(0, 3);
  }, [statuses, allIds]);

  return (
    <>
      {/* Przyciski otwierające drawer i zapis */}
      <div className="mb-4 flex gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            📝 Otwórz decyzję
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className={`rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50 ${isOpen ? 'flex-1' : ''}`}
        >
          {saveStatus === 'saving' ? 'Zapisywanie...' : '💾 Zapisz'}
        </button>
      </div>

      {/* Drawer */}
      {isOpen && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Decyzja</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Sekcja Kontekst */}
            <div className="pb-4 border-b border-white/10">
              <label className="block text-xs text-white/70 mb-3">Kontekst</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Aktywo</label>
                  <select
                    value={context.asset}
                    onChange={(e) => onContextChange({ ...context, asset: e.target.value })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white/90 outline-none focus:ring-1 focus:ring-white/30"
                  >
                    <option value="">— aktywo —</option>
                    <option value="US100">US100</option>
                    <option value="US500">US500</option>
                    <option value="DE40">DE40</option>
                    <option value="XAUUSD">XAUUSD</option>
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Interwał</label>
                  <select
                    value={context.timeframe}
                    onChange={(e) => onContextChange({ ...context, timeframe: e.target.value as Timeframe })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white/90 outline-none focus:ring-1 focus:ring-white/30"
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Horyzont</label>
                  <select
                    value={context.horizon}
                    onChange={(e) => onContextChange({ ...context, horizon: e.target.value as Horizon })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white/90 outline-none focus:ring-1 focus:ring-white/30"
                  >
                    {HORIZONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Status danych */}
              <div className="mt-3 text-xs text-white/50">
                {!context.asset || context.asset.trim() === '' || context.asset === '— aktywo —'
                  ? 'Wybierz aktywo, aby uruchomić wykrycia.'
                  : 'Wykrycia aktualizują się automatycznie po zmianie kontekstu.'}
              </div>
            </div>

            {/* Teza */}
            <div>
              <label className="block text-xs text-white/70 mb-2">Teza</label>
              <div className="flex flex-wrap gap-2">
                {(['Wyżej', 'Niżej', 'Bez większej zmiany'] as Thesis[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onThesisChange(thesis === t ? '' : t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      thesis === t
                        ? 'bg-white text-slate-900 border-white'
                        : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Unieważnienie */}
            <div>
              <label className="block text-xs text-white/70 mb-2">
                Unieważnienie
              </label>
              <input
                type="text"
                value={invalidation}
                onChange={(e) => onInvalidationChange(e.target.value)}
                placeholder="Kiedy teza przestaje obowiązywać?"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>

            {/* Plan B */}
            <div>
              <label className="block text-xs text-white/70 mb-2">Plan B</label>
              <input
                type="text"
                value={planB}
                onChange={(e) => onPlanBChange(e.target.value)}
                placeholder="Co robię, jeśli rynek idzie inaczej?"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>

            {/* Ryzyko */}
            <div>
              <label className="block text-xs text-white/70 mb-2">Ryzyko na dziś</label>
              <select
                value={risk}
                onChange={(e) => onRiskChange(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 outline-none focus:ring-1 focus:ring-white/30"
              >
                <option value="">— wybierz —</option>
                <option value="Małe">Małe</option>
                <option value="Średnie">Średnie</option>
                <option value="Duże">Duże</option>
              </select>
            </div>

            {/* Podgląd "Włączone do decyzji" */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-white/90 mb-2">Włączone do decyzji</h4>
              <div className="space-y-2 text-xs">
                {/* Wykrycia i potwierdzenia */}
                {(detectedAndConfirmed.detected.length > 0 || detectedAndConfirmed.confirmed.length > 0) && (
                  <div>
                    <div className="text-white/70 mb-1">Wykrycia i potwierdzenia:</div>
                    <ul className="list-none space-y-1 ml-2">
                      {detectedAndConfirmed.detected.map((item) => (
                        <li key={item.id} className="text-white/80">
                          🟡 <span className="font-medium">{getItemTextById(item.id)}</span>
                          {item.reason && <span className="text-white/60 ml-1">— {item.reason}</span>}
                        </li>
                      ))}
                      {detectedAndConfirmed.confirmed.map((id) => (
                        <li key={id} className="text-white/80">
                          🟢 <span className="font-medium">{getItemTextById(id)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Top 3 pending */}
                {topPending.length > 0 && (
                  <div>
                    <div className="text-white/70 mb-1">Co jeszcze trzeba sprawdzić (top 3):</div>
                    <ul className="list-none space-y-1 ml-2">
                      {topPending.map((item) => (
                        <li key={item.id} className="text-white/60">
                          ⏳ <span>{getItemTextById(item.id)}</span>
                          {item.hint && <span className="ml-1 text-white/50">— {item.hint}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detectedAndConfirmed.detected.length === 0 && detectedAndConfirmed.confirmed.length === 0 && topPending.length === 0 && (
                  <div className="text-white/50">Brak wykryć — wszystkie elementy są w stanie oczekiwania.</div>
                )}
              </div>
            </div>

            {/* Status zapisu */}
            {saveStatus === 'saving' && (
              <div className="mt-4 text-xs text-white/70">Zapisywanie…</div>
            )}
            {saveStatus === 'saved' && (
              <div className="mt-4 text-xs text-green-400">✓ Zapisano</div>
            )}
            {saveStatus === 'unauthorized' && (
              <div className="mt-4 text-xs text-amber-400">Zaloguj się, aby zapisać historię.</div>
            )}
            {saveStatus === 'db-error' && (
              <div className="mt-4 text-xs text-amber-400">Brak bazy — historia niedostępna.</div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 space-y-1">
                <div className="text-xs text-red-400">Błąd zapisu</div>
                {saveErrorDetails && (
                  <div className="text-xs text-white/50">
                    {saveErrorDetails.status && `HTTP ${saveErrorDetails.status}`}
                    {saveErrorDetails.message && (saveErrorDetails.status ? ` — ${saveErrorDetails.message}` : saveErrorDetails.message)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Wrapper dla DecisionDrawer z auto-reset saveStatus
function DecisionDrawerWrapper({
  thesis,
  onThesisChange,
  invalidation,
  onInvalidationChange,
  planB,
  onPlanBChange,
  risk,
  onRiskChange,
  onSave,
  saveStatus,
  saveErrorDetails,
  onSaveStatusChange,
  statuses,
  reasonsById,
  allIds,
  context,
  onContextChange,
}: {
  thesis: Thesis;
  onThesisChange: (t: Thesis) => void;
  invalidation: string;
  onInvalidationChange: (v: string) => void;
  planB: string;
  onPlanBChange: (v: string) => void;
  risk: string;
  onRiskChange: (v: string) => void;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'db-error' | 'unauthorized';
  saveErrorDetails?: { status?: number; message?: string } | null;
  onSaveStatusChange: (status: 'idle' | 'saving' | 'saved' | 'error' | 'db-error' | 'unauthorized') => void;
  statuses: Record<string, ItemStatus>;
  reasonsById: Record<string, string>;
  allIds: string[];
  context: { asset: string; timeframe: Timeframe; horizon: Horizon };
  onContextChange: (ctx: { asset: string; timeframe: Timeframe; horizon: Horizon }) => void;
}) {
  // Auto-reset saveStatus po 3-4 sekundach
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        onSaveStatusChange('idle');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, onSaveStatusChange]);

  return (
    <DecisionDrawer
      thesis={thesis}
      onThesisChange={onThesisChange}
      invalidation={invalidation}
      onInvalidationChange={onInvalidationChange}
      planB={planB}
      onPlanBChange={onPlanBChange}
      risk={risk}
      onRiskChange={onRiskChange}
      onSave={onSave}
      saveStatus={saveStatus}
      saveErrorDetails={saveErrorDetails}
      statuses={statuses}
      reasonsById={reasonsById}
      allIds={allIds}
      context={context}
      onContextChange={onContextChange}
    />
  );
}

// AUDYT DANYCH DOSTĘPNYCH DLA EDU ENGINE (detected):
// ────────────────────────────────────────────────────────────────────────────────
// DOSTĘPNE DANE W KOMPONENCIE:
// 1. context: { asset, timeframe, horizon } - wybór użytkownika
// 2. CHECKLISTS - statyczne definicje checklist z lib/panel/checklists.ts
// 3. statuses - mapowanie item.id -> 'pending' | 'detected' | 'confirmed' | 'negated'
// 4. Historia: GET /api/panel/checklists/history (tylko zapisywanie/wczytywanie)
//
// DOSTĘPNE API ENDPOINTS W REPO (NIE UŻYWANE W CHECKLIST CLIENT):
// - GET /api/quotes/sparkline?symbols=US100&range=7d&interval=1h
//   Zwraca: { data: [{ symbol: string, series: Array<[timestamp: number, price: number]> }] }
//   Można obliczyć: RSI, MACD, ATR, SMA50/200, trend, H/L dzienne/tygodniowe, zmienność
//
// - GET /api/quotes/ticker?symbols=OANDA:NAS100_USD
//   Zwraca: { results: { [symbol]: { price, prevClose, changePct, lastTs } } }
//   Dane: aktualna cena, zmiana %, poprzednie zamknięcie
//
// - GET /api/news/summarize?bucket=24h
//   Zwraca: { items: [{ title, summary, instruments: string[], timestamp_iso }] }
//   Można wyciągnąć: sentyment (tekstowy, trzeba parsować), newsy powiązane z instrumentem
//
// - GET /api/ai/calendar?days=7&limit=50
//   Zwraca: { items: [{ date, time, title, importance: 'low'|'medium'|'high', region }] }
//   Dane: kalendarz makroekonomiczny, ważność wydarzeń, region
//
// - GET /api/brief/latest?window=24h
//   Zwraca: { brief: { sentiment: number, metrics: { rsi, macd, volume, dist200 }, ... } }
//   Dane: sentyment liczbowy, RSI, MACD, wolumen (jeśli dostępne)
//
// KOMPONENTY Z OBLICZENIAMI (dostępne w repo, ale nie używane w ChecklistClient):
// - TechnicalSnapshotPanel: oblicza RSI, MACD, ATR, SMA50/200, priceVsSma50Pct, priceVsSma200Pct
//   Endpoint: /api/quotes/sparkline + funkcje pomocnicze w tym samym komponencie
//
// - SentimentChart: oblicza sentyment z news (classifySentimentText)
//
// BRAKI (dane niedostępne bez backendu):
// - Wolumen (tylko z Finnhub API, wymaga klucza)
// - Spread (brak danych)
// - Orderbook data (brak)
// - Real-time tick data (brak)
// ────────────────────────────────────────────────────────────────────────────────

export default function ChecklistClient() {
  const allIds = useMemo(() => groupItemIds(CHECKLISTS), []);
  const { statuses, setStatuses, updateStatus, confirmItem, negateItem, replaceStatuses, patchStatuses } = useItemStatuses();
  
  // EDU Engine: powody wykrycia
  const [reasonsById, setReasonsById] = useState<Record<string, string>>({});
  
  // EDU Engine: registry pochodzenia detected
  const [detectedByEngine, setDetectedByEngine] = useState<Record<string, boolean>>({});
  const detectedByEngineRef = useRef<Record<string, boolean>>({});
  
  // Decision Binding: registry pochodzenia detected z decyzji
  const [detectedByDecision, setDetectedByDecision] = useState<Record<string, boolean>>({});
  
  // Decision Binding: registry pochodzenia confirmed z decyzji (auto-confirmed)
  const [confirmedByDecision, setConfirmedByDecision] = useState<Record<string, boolean>>({});
  
  // EDU Engine: stan ładowania i request ID
  const [eduLoading, setEduLoading] = useState(false);
  const eduRunIdRef = useRef(0);
  
  // EDU Engine: raport statusu reguł
  const [engineReport, setEngineReport] = useState<Record<string, { status: 'ok' | 'no' | 'err'; note: string }>>({});
  const [lastVerification, setLastVerification] = useState<Date | null>(null);
  
  // Synchronizuj ref z state
  useEffect(() => {
    detectedByEngineRef.current = detectedByEngine;
  }, [detectedByEngine]);

  // Mapa id -> tag (do obliczania riskExecPending)
  const idToTag = useMemo(() => {
    const map: Record<string, 'makro' | 'technika' | 'ryzyko' | 'sentyment' | 'zmiennosc'> = {};
    for (const group of CHECKLISTS) {
      for (const item of group.items) {
        if (item.tag) {
          map[item.id] = item.tag;
        }
      }
    }
    return map;
  }, []);

  // Kontekst
  const [context, setContext] = useState<{
    asset: string;
    timeframe: Timeframe;
    horizon: Horizon;
  }>({
    asset: '',
    timeframe: 'H4',
    horizon: 'Dziś (do końca dnia)',
  });

  // EDU Engine: funkcje pomocnicze
  function simpleMovingAverage(values: number[], period: number): number | null {
    if (!Array.isArray(values) || values.length < period) return null;
    const sum = values.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  function average(arr: number[]) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function atrFromClosesWilder(closes: number[], period: number): number | null {
    if (!Array.isArray(closes) || closes.length < period + 1) return null;
    const trs: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      trs.push(Math.abs(closes[i] - closes[i - 1]));
    }
    let atr = average(trs.slice(0, period));
    for (let i = period; i < trs.length; i++) {
      atr = (atr * (period - 1) + trs[i]) / period;
    }
    return atr;
  }

  // EDU Engine: helpery mapujące
  function getVolatilityInterval(timeframe: Timeframe): '1h' | '4h' | '1d' {
    switch (timeframe) {
      case 'H1':
        return '1h';
      case 'H4':
        return '4h';
      case 'D1':
        return '1d';
      default:
        return '1h';
    }
  }

  function getRangeForHorizon(horizon: Horizon): '7d' | '30d' | '90d' {
    const h = horizon.toLowerCase();
    if (h.includes('dziś')) {
      return '7d';
    }
    if (h.includes('1–2') || h.includes('1-2')) {
      return '30d';
    }
    if (h.includes('3–7') || h.includes('3-7') || h.includes('tydzień')) {
      return '90d';
    }
    return '30d';
  }

  // EDU Engine: funkcja aplikująca wynik reguły
  const applyRuleResult = (id: string, isMatch: boolean, reason?: string) => {
    // Użyj ref do sprawdzenia aktualnej wartości detectedByEngine
    const isEngineDetected = detectedByEngineRef.current[id] === true;
    
    setStatuses((prevStatuses) => {
      const nextStatuses = { ...prevStatuses };
      const currentStatus = prevStatuses[id] || 'pending';
      
      if (isMatch) {
        // Reguła spełniona
        if (currentStatus === 'pending') {
          nextStatuses[id] = 'detected';
        }
        // Jeśli już detected i engine -> tylko reason się zmieni (aktualizujemy poniżej)
        // confirmed/negated nie ruszamy
      } else {
        // Reguła nie spełniona
        if (currentStatus === 'detected' && isEngineDetected) {
          nextStatuses[id] = 'pending';
        }
        // confirmed/negated nie ruszamy
        // detected bez engine nie ruszamy
      }
      
      return nextStatuses;
    });
    
    // Aktualizuj reasonsById
    setReasonsById((prev) => {
      const next = { ...prev };
      if (isMatch && reason) {
        next[id] = reason;
      } else if (!isMatch) {
        delete next[id];
      }
      return next;
    });
    
    // Aktualizuj detectedByEngine
    setDetectedByEngine((prev) => {
      const next = { ...prev };
      if (isMatch) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  // EDU Engine: główna funkcja
  const runEduEngine = async (ctx: { asset: string; timeframe: Timeframe; horizon: Horizon }) => {
    if (eduLoading) return; // Guard przed równoległymi requestami
    // Sprawdź czy asset jest wybrane (nie puste i nie placeholder)
    if (!ctx.asset || ctx.asset.trim() === '' || ctx.asset === '— aktywo —') {
      setEngineReport({
        _no_asset: {
          status: 'err',
          note: 'Wybierz aktywo, aby uruchomić wykrycia',
        },
      });
      setLastVerification(null);
      return;
    }
    
    // Przed nowym run: resetuj detected (z engine) do pending
    setStatuses((prev) => {
      const next = { ...prev };
      for (const id of allIds) {
        if (prev[id] === 'detected' && detectedByEngineRef.current[id] === true) {
          next[id] = 'pending';
        }
      }
      return next;
    });
    setReasonsById({});
    setDetectedByEngine({});
    
    setEduLoading(true);
    eduRunIdRef.current += 1;
    const localRunId = eduRunIdRef.current;
    
    try {
      // Reguła #1: calendar
      let calendarMatch = false;
      let calendarReason: string | undefined = undefined;
      let calendarError = false;
      try {
        const calendarRes = await fetch('/api/ai/calendar?days=2&limit=50', { cache: 'no-store' });
        if (calendarRes.ok && localRunId === eduRunIdRef.current) {
          const calendarData = await calendarRes.json().catch(() => ({}));
          const items = Array.isArray(calendarData?.items) ? calendarData.items : [];
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          
          const highImpactTodayOrTomorrow = items.filter((item: any) => {
            const date = item.date;
            const importance = item.importance;
            return importance === 'high' && (date === today || date === tomorrow);
          });
          
          if (highImpactTodayOrTomorrow.length >= 1) {
            calendarMatch = true;
            const first = highImpactTodayOrTomorrow[0];
            const title = first.title || 'Wydarzenie';
            const region = first.region || '';
            const date = first.date || '';
            const time = first.time || '';
            calendarReason = `High-impact: ${title}${region ? ` (${region})` : ''} ${date} ${time}`.trim();
          }
        } else {
          calendarError = true;
        }
      } catch (e) {
        calendarError = true;
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('calendar', calendarMatch, calendarReason);
        setEngineReport((prev) => ({
          ...prev,
          calendar: {
            status: calendarError ? 'err' : calendarMatch ? 'ok' : 'no',
            note: calendarError ? 'Błąd pobierania kalendarza' : calendarMatch ? calendarReason || 'High-impact dziś/jutro' : 'Brak high-impact (48h)',
          },
        }));
      }
      
      // Reguła #2: trend-htf
      let trendMatch = false;
      let trendReason: string | undefined = undefined;
      try {
        // Fallback: próbuj różne range (365d -> 180d -> 90d -> 30d)
        const ranges: Array<'365d' | '180d' | '90d' | '30d'> = ['365d', '180d', '90d', '30d'];
        let series: Array<[number, number]> = [];
        
        for (const range of ranges) {
          if (localRunId !== eduRunIdRef.current) break;
          
          try {
            const sparklineRes = await fetch(`/api/quotes/sparkline?symbols=${ctx.asset}&range=${range}&interval=1d`, { cache: 'no-store' });
            if (sparklineRes.ok && localRunId === eduRunIdRef.current) {
              const sparklineData = await sparklineRes.json().catch(() => ({}));
              const data = Array.isArray(sparklineData?.data) ? sparklineData.data : [];
              const match = data.find((x: any) => x.symbol?.toUpperCase() === ctx.asset.toUpperCase());
              const candidateSeries: Array<[number, number]> = match?.series || [];
              
              if (candidateSeries.length >= 50) {
                series = candidateSeries;
                break; // Użyj pierwszego zakresu, który dał >=50 punktów
              }
            }
          } catch (e) {
            // Kontynuuj do następnego range
            continue;
          }
        }
        
        if (localRunId === eduRunIdRef.current && series.length >= 50) {
          const closes = series.map(p => p[1]);
          const lastPrice = closes[closes.length - 1];
          
          if (series.length >= 200) {
            // Pełne obliczenia: SMA50 i SMA200
            const sma50 = simpleMovingAverage(closes, 50);
            const sma200 = simpleMovingAverage(closes, 200);
            
            if (sma50 !== null && sma200 !== null && lastPrice !== undefined) {
              if (lastPrice > sma50 && lastPrice > sma200) {
                trendMatch = true;
                trendReason = 'Cena > SMA50 i SMA200 (trend wzrostowy)';
              } else if (lastPrice < sma50 && lastPrice < sma200) {
                trendMatch = true;
                trendReason = 'Cena < SMA50 i SMA200 (trend spadkowy)';
              }
            }
          } else {
            // Tylko SMA50 (>=50 i <200 punktów)
            const sma50 = simpleMovingAverage(closes, 50);
            
            if (sma50 !== null && lastPrice !== undefined) {
              if (lastPrice > sma50) {
                trendMatch = true;
                trendReason = 'Cena > SMA50 (brak danych dla SMA200)';
              } else if (lastPrice < sma50) {
                trendMatch = true;
                trendReason = 'Cena < SMA50 (brak danych dla SMA200)';
              }
            }
          }
        }
      } catch (e) {
        // Silnik milczy przy błędach
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('trend-htf', trendMatch, trendReason);
        setEngineReport((prev) => ({
          ...prev,
          'trend-htf': {
            status: trendMatch ? 'ok' : 'no',
            note: trendMatch ? trendReason || 'Jednoznaczny trend' : 'Brak jednoznacznego trendu (SMA)',
          },
        }));
      }
      
      // Reguła #3: volatility
      let volatilityMatch = false;
      let volatilityReason: string | undefined = undefined;
      try {
        const interval = getVolatilityInterval(ctx.timeframe);
        const range = getRangeForHorizon(ctx.horizon);
        const volatilityRes = await fetch(`/api/quotes/sparkline?symbols=${ctx.asset}&range=${range}&interval=${interval}`, { cache: 'no-store' });
        if (volatilityRes.ok && localRunId === eduRunIdRef.current) {
          const volatilityData = await volatilityRes.json().catch(() => ({}));
          const data = Array.isArray(volatilityData?.data) ? volatilityData.data : [];
          const match = data.find((x: any) => x.symbol?.toUpperCase() === ctx.asset.toUpperCase());
          const series: Array<[number, number]> = match?.series || [];
          
          if (series.length >= 15) { // minimum dla ATR(14) + 1 wartość
            const closes = series.map(p => p[1]);
            const atrValues: number[] = [];
            
            // Oblicz ATR dla każdego punktu (rolling window)
            for (let i = 14; i < closes.length; i++) {
              const window = closes.slice(i - 14, i + 1);
              const atr = atrFromClosesWilder(window, 14);
              if (atr !== null) {
                atrValues.push(atr);
              }
            }
            
            if (atrValues.length > 0) {
              const lastATR = atrValues[atrValues.length - 1];
              const medianWindowSize = Math.min(100, atrValues.length);
              const medianWindow = atrValues.slice(-medianWindowSize);
              medianWindow.sort((a, b) => a - b);
              const medianATR = medianWindow[Math.floor(medianWindow.length / 2)];
              
              if (lastATR > 1.5 * medianATR) {
                volatilityMatch = true;
                const ratio = lastATR / medianATR;
                volatilityReason = `ATR ${ratio.toFixed(2)}x mediany (${interval}, ${range})`;
              }
            }
          }
        }
      } catch (e) {
        // Silnik milczy przy błędach
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('volatility', volatilityMatch, volatilityReason);
        setEngineReport((prev) => ({
          ...prev,
          volatility: {
            status: volatilityMatch ? 'ok' : 'no',
            note: volatilityMatch ? volatilityReason || 'ATR powyżej progu' : 'ATR w normie (np. 1.12x mediany)',
          },
        }));
      }

      // Reguła #4: events-impacts (high-impact w 24h)
      let eventsImpactsMatch = false;
      let eventsImpactsReason: string | undefined = undefined;
      let eventsImpactsError = false;
      try {
        const eventsRes = await fetch('/api/ai/calendar?days=2&limit=50', { cache: 'no-store' });
        if (eventsRes.ok && localRunId === eduRunIdRef.current) {
          const eventsData = await eventsRes.json().catch(() => ({}));
          const items = Array.isArray(eventsData?.items) ? eventsData.items : [];
          const now = Date.now();
          const next24h = now + 24 * 60 * 60 * 1000;
          
          const highImpactIn24h = items.filter((item: any) => {
            const date = item.date;
            const time = item.time || '00:00';
            const importance = item.importance;
            if (importance !== 'high') return false;
            
            try {
              const eventDate = new Date(`${date}T${time}:00`);
              const eventTs = eventDate.getTime();
              return eventTs >= now && eventTs <= next24h;
            } catch {
              return false;
            }
          });
          
          if (highImpactIn24h.length >= 1) {
            eventsImpactsMatch = true;
            const first = highImpactIn24h[0];
            const title = first.title || 'Wydarzenie';
            const region = first.region || '';
            const date = first.date || '';
            const time = first.time || '';
            eventsImpactsReason = `Ryzyko eventu w 24h: ${title}`;
          }
        } else {
          eventsImpactsError = true;
        }
      } catch (e) {
        eventsImpactsError = true;
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('events-impacts', eventsImpactsMatch, eventsImpactsReason);
        setEngineReport((prev) => ({
          ...prev,
          'events-impacts': {
            status: eventsImpactsError ? 'err' : eventsImpactsMatch ? 'ok' : 'no',
            note: eventsImpactsError ? 'Błąd pobierania wydarzeń' : eventsImpactsMatch ? eventsImpactsReason || 'High-impact w 24h' : 'Brak eventów high w 24h',
          },
        }));
      }

      // Reguła #5: sentiment
      let sentimentMatch = false;
      let sentimentReason: string | undefined = undefined;
      let sentimentError = false;
      try {
        // Określ window na podstawie horyzontu
        let window: '24h' | '48h' | '72h' = '24h';
        const h = ctx.horizon.toLowerCase();
        if (h.includes('dziś')) {
          window = '24h';
        } else if (h.includes('1–2') || h.includes('1-2')) {
          window = '48h';
        } else if (h.includes('tydzień')) {
          window = '72h';
        }
        
        // Próbuj najpierw /api/brief/latest
        const briefRes = await fetch(`/api/brief/latest?window=${window}`, { cache: 'no-store' });
        if (briefRes.ok && localRunId === eduRunIdRef.current) {
          const briefData = await briefRes.json().catch(() => ({}));
          const brief = briefData?.brief;
          
          if (brief && typeof brief.sentiment === 'number') {
            const sentiment = brief.sentiment;
            if (Math.abs(sentiment) >= 0.3) {
              sentimentMatch = true;
              const sign = sentiment > 0 ? '+' : '';
              sentimentReason = `Sentyment ${sentiment > 0 ? 'dodatni' : 'ujemny'}: ${sign}${sentiment.toFixed(2)} (brief ${window})`;
            }
          }
        }
        
        // Fallback: spróbuj /api/news/summarize
        if (!sentimentMatch && localRunId === eduRunIdRef.current) {
          try {
            const newsRes = await fetch(`/api/news/summarize?bucket=${window}`, { cache: 'no-store' });
            if (newsRes.ok) {
              const newsData = await newsRes.json().catch(() => ({}));
              const items = Array.isArray(newsData?.items) ? newsData.items : [];
              
              // Szukaj newsów powiązanych z aktywem
              const assetUpper = ctx.asset.toUpperCase();
              const relevantNews = items.filter((item: any) => {
                const instruments = Array.isArray(item.instruments) ? item.instruments : [];
                return instruments.some((inst: string) => inst.toUpperCase().includes(assetUpper));
              });
              
              if (relevantNews.length > 0) {
                // Użyj klasyfikacji sentymentu z tytułów (uproszczone)
                let sentimentSum = 0;
                let count = 0;
                for (const news of relevantNews.slice(0, 5)) {
                  const title = news.title || '';
                  // Heurystyka: pozytywne słowa +1, negatywne -1, neutralne 0
                  const pos = /(rally|gain|beats|strong|improves|wzrost|rosną|lepszy|mocny|zyskuje|rekord)/i.test(title);
                  const neg = /(drop|falls|miss|weak|selloff|risk|war|crisis|spadek|spadają|gorzej|słaby|traci|wojna|kryzys)/i.test(title);
                  if (pos && !neg) sentimentSum += 1;
                  else if (neg && !pos) sentimentSum -= 1;
                  count++;
                }
                
                if (count > 0) {
                  const avgSentiment = sentimentSum / count;
                  if (Math.abs(avgSentiment) >= 0.3) {
                    sentimentMatch = true;
                    const sign = avgSentiment > 0 ? '+' : '';
                    sentimentReason = `Sentyment z news: ${sign}${avgSentiment.toFixed(2)} (${window})`;
                  }
                }
              }
            }
          } catch (e) {
            // Fallback nie udał się
          }
        }
        
        if (!briefRes.ok && localRunId === eduRunIdRef.current) {
          sentimentError = true;
        }
      } catch (e) {
        sentimentError = true;
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('sentiment', sentimentMatch, sentimentReason);
        setEngineReport((prev) => ({
          ...prev,
          sentiment: {
            status: sentimentError ? 'err' : sentimentMatch ? 'ok' : 'no',
            note: sentimentError ? 'Błąd pobierania brief/news' : sentimentMatch ? sentimentReason || 'Wyraźny sentyment' : 'Brak wyraźnego sentymentu',
          },
        }));
        setLastVerification(new Date());
      }

      // Reguła #6: recent-extremes (blisko 7d high/low)
      let recentExtremesMatch = false;
      let recentExtremesReason: string | undefined = undefined;
      try {
        const interval = getVolatilityInterval(ctx.timeframe);
        const range = getRangeForHorizon(ctx.horizon);
        // Użyj 7d dla recent-extremes niezależnie od horyzontu
        const extremesRange = '7d';
        const extremesRes = await fetch(`/api/quotes/sparkline?symbols=${ctx.asset}&range=${extremesRange}&interval=${interval}`, { cache: 'no-store' });
        if (extremesRes.ok && localRunId === eduRunIdRef.current) {
          const extremesData = await extremesRes.json().catch(() => ({}));
          const data = Array.isArray(extremesData?.data) ? extremesData.data : [];
          const match = data.find((x: any) => x.symbol?.toUpperCase() === ctx.asset.toUpperCase());
          const series: Array<[number, number]> = match?.series || [];
          
          if (series.length >= 7) {
            const prices = series.map(p => p[1]);
            const lastPrice = prices[prices.length - 1];
            const max7d = Math.max(...prices);
            const min7d = Math.min(...prices);
            const range7d = max7d - min7d;
            
            // Sprawdź czy blisko max (w promieniu 0.5% od max)
            const distFromMax = (max7d - lastPrice) / max7d;
            const distFromMin = (lastPrice - min7d) / min7d;
            
            if (distFromMax <= 0.005 && range7d > 0) {
              recentExtremesMatch = true;
              recentExtremesReason = `Blisko 7d high (<=0.5%)`;
            } else if (distFromMin <= 0.005 && range7d > 0) {
              recentExtremesMatch = true;
              recentExtremesReason = `Blisko 7d low (<=0.5%)`;
            }
          }
        }
      } catch (e) {
        // Silnik milczy przy błędach
      }
      
      if (localRunId === eduRunIdRef.current) {
        applyRuleResult('recent-extremes', recentExtremesMatch, recentExtremesReason);
        setEngineReport((prev) => ({
          ...prev,
          'recent-extremes': {
            status: recentExtremesMatch ? 'ok' : 'no',
            note: recentExtremesMatch ? recentExtremesReason || 'Blisko 7d ekstremum' : 'Cena nie jest blisko 7d high/low',
          },
        }));
      }
    } finally {
      if (localRunId === eduRunIdRef.current) {
        setEduLoading(false);
      }
    }
  };

  // Decision Binding: funkcja aplikująca bindingi z pól decyzji
  const applyDecisionBinding = () => {
    // Użyj callback aby uzyskać aktualne statusy
    setStatuses((prevStatuses) => {
      const statusUpdates: Record<string, ItemStatus> = {};
      const reasonUpdates: Record<string, string> = {};
      const decisionDetectedUpdates: Record<string, boolean> = {};
      const decisionConfirmedUpdates: Record<string, boolean> = {};
      
      // A) invalidation -> 'invalidation' (auto-confirmed)
      const normalizedInvalidation = normalizeTextValue(invalidation);
      if (normalizedInvalidation.length > 0) {
        const currentStatus = prevStatuses['invalidation'] || 'pending';
        // Nie nadpisuj jeśli user ręcznie ustawił negated
        if (currentStatus !== 'negated') {
          // Nie nadpisuj jeśli user ręcznie potwierdził (nie pochodzi z bindingu)
          if (currentStatus === 'pending' || (currentStatus === 'detected' && detectedByDecision['invalidation'] === true) || (currentStatus === 'confirmed' && confirmedByDecision['invalidation'] === true)) {
            // Ustaw confirmed (nie detected) dla auto-confirmed
            statusUpdates['invalidation'] = 'confirmed';
            reasonUpdates['invalidation'] = 'Uzupełniono w decyzji: unieważnienie';
            decisionConfirmedUpdates['invalidation'] = true;
            // Usuń z detectedByDecision jeśli było
            if (detectedByDecision['invalidation']) {
              decisionDetectedUpdates['invalidation'] = false;
            }
          }
        }
      } else {
        // Jeśli invalidation jest puste i było confirmed z bindingu -> reset
        if (prevStatuses['invalidation'] === 'confirmed' && confirmedByDecision['invalidation'] === true) {
          statusUpdates['invalidation'] = 'pending';
          decisionConfirmedUpdates['invalidation'] = false;
        } else if (prevStatuses['invalidation'] === 'detected' && detectedByDecision['invalidation'] === true) {
          // Jeśli było detected z decision -> reset
          statusUpdates['invalidation'] = 'pending';
          decisionDetectedUpdates['invalidation'] = false;
        }
      }
      
      // B) planB -> 'plan-b' (auto-confirmed)
      const normalizedPlanB = normalizeTextValue(planB);
      if (normalizedPlanB.length > 0) {
        const currentStatus = prevStatuses['plan-b'] || 'pending';
        // Nie nadpisuj jeśli user ręcznie ustawił negated
        if (currentStatus !== 'negated') {
          // Nie nadpisuj jeśli user ręcznie potwierdził (nie pochodzi z bindingu)
          if (currentStatus === 'pending' || (currentStatus === 'detected' && detectedByDecision['plan-b'] === true) || (currentStatus === 'confirmed' && confirmedByDecision['plan-b'] === true)) {
            // Ustaw confirmed (nie detected) dla auto-confirmed
            statusUpdates['plan-b'] = 'confirmed';
            reasonUpdates['plan-b'] = 'Uzupełniono w decyzji: Plan B';
            decisionConfirmedUpdates['plan-b'] = true;
            // Usuń z detectedByDecision jeśli było
            if (detectedByDecision['plan-b']) {
              decisionDetectedUpdates['plan-b'] = false;
            }
          }
        }
      } else {
        // Jeśli planB jest puste i było confirmed z bindingu -> reset
        if (prevStatuses['plan-b'] === 'confirmed' && confirmedByDecision['plan-b'] === true) {
          statusUpdates['plan-b'] = 'pending';
          decisionConfirmedUpdates['plan-b'] = false;
        } else if (prevStatuses['plan-b'] === 'detected' && detectedByDecision['plan-b'] === true) {
          // Jeśli było detected z decision -> reset
          statusUpdates['plan-b'] = 'pending';
          decisionDetectedUpdates['plan-b'] = false;
        }
      }
      
      // C) risk -> 'max-loss' i 'size'
      if (risk && ['Małe', 'Średnie', 'Duże'].includes(risk)) {
        // max-loss
        const currentStatusMaxLoss = prevStatuses['max-loss'] || 'pending';
        if (currentStatusMaxLoss === 'pending') {
          if (!detectedByEngineRef.current['max-loss']) {
            statusUpdates['max-loss'] = 'detected';
            reasonUpdates['max-loss'] = 'Ustalono poziom ryzyka na dziś';
            decisionDetectedUpdates['max-loss'] = true;
          }
        } else if (currentStatusMaxLoss === 'detected' && detectedByDecision['max-loss'] === true) {
          reasonUpdates['max-loss'] = 'Ustalono poziom ryzyka na dziś';
        }
        
        // size
        const currentStatusSize = prevStatuses['size'] || 'pending';
        if (currentStatusSize === 'pending') {
          if (!detectedByEngineRef.current['size']) {
            statusUpdates['size'] = 'detected';
            reasonUpdates['size'] = 'Rozmiar pozycji powinien wynikać z ryzyka i zmienności';
            decisionDetectedUpdates['size'] = true;
          }
        } else if (currentStatusSize === 'detected' && detectedByDecision['size'] === true) {
          reasonUpdates['size'] = 'Rozmiar pozycji powinien wynikać z ryzyka i zmienności';
        }
      } else {
        // Jeśli risk jest puste i było detected z decision -> reset
        if (prevStatuses['max-loss'] === 'detected' && detectedByDecision['max-loss'] === true) {
          statusUpdates['max-loss'] = 'pending';
          decisionDetectedUpdates['max-loss'] = false;
        }
        if (prevStatuses['size'] === 'detected' && detectedByDecision['size'] === true) {
          statusUpdates['size'] = 'pending';
          decisionDetectedUpdates['size'] = false;
        }
      }
      
      // D) thesis - nie ustawiamy automatu (tylko pokazujemy w podsumowaniu)
      
      // Zastosuj aktualizacje statusów
      const next = { ...prevStatuses };
      for (const id of allIds) {
        if (statusUpdates[id] !== undefined) {
          const currentStatus = prevStatuses[id] || 'pending';
          // Nie nadpisuj negated
          if (currentStatus !== 'negated') {
            // Nie nadpisuj confirmed jeśli nie pochodzi z bindingu (user ręcznie potwierdził)
            if (currentStatus === 'confirmed' && !confirmedByDecision[id]) {
              // Skip - user ręcznie potwierdził
            } else {
              next[id] = statusUpdates[id];
            }
          }
        }
      }
      
      // Aktualizuj reasonsById
      setReasonsById((prev) => {
        const next = { ...prev };
        for (const id in reasonUpdates) {
          if (allIds.includes(id)) {
            next[id] = reasonUpdates[id];
          }
        }
        // Usuń reasons dla id które zostały zresetowane
        for (const id in decisionDetectedUpdates) {
          if (decisionDetectedUpdates[id] === false && allIds.includes(id)) {
            delete next[id];
          }
        }
        for (const id in decisionConfirmedUpdates) {
          if (decisionConfirmedUpdates[id] === false && allIds.includes(id)) {
            delete next[id];
          }
        }
        return next;
      });
      
      // Aktualizuj detectedByDecision
      setDetectedByDecision((prev) => {
        const next = { ...prev };
        for (const id in decisionDetectedUpdates) {
          if (decisionDetectedUpdates[id]) {
            next[id] = true;
          } else {
            delete next[id];
          }
        }
        return next;
      });
      
      // Aktualizuj confirmedByDecision
      setConfirmedByDecision((prev) => {
        const next = { ...prev };
        for (const id in decisionConfirmedUpdates) {
          if (decisionConfirmedUpdates[id]) {
            next[id] = true;
          } else {
            delete next[id];
          }
        }
        return next;
      });
      
      return next;
    });
  };

  // Decision Drawer state
  const [thesis, setThesis] = useState<Thesis>('');
  const [invalidation, setInvalidation] = useState('');
  const [planB, setPlanB] = useState('');
  const [risk, setRisk] = useState('');

  // Filtr i wyszukiwanie
  type TagFilter = 'wszystko' | 'makro' | 'technika' | 'ryzyko' | 'sentyment' | 'zmiennosc';
  const [filter, setFilter] = useState<TagFilter>('wszystko');
  const [query, setQuery] = useState('');

  // Historia - stan z API
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'db-error' | 'unauthorized'>('idle');
  const [saveErrorDetails, setSaveErrorDetails] = useState<{ status?: number; message?: string } | null>(null);
  
  // Modal potwierdzenia przy wczytywaniu historii
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingHistoryItem, setPendingHistoryItem] = useState<HistoryItem | null>(null);
  
  // Modal potwierdzenia przy usuwaniu
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<HistoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pobieranie historii z API
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch('/api/panel/checklists/history', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          setHistoryError('Zaloguj się, aby zobaczyć historię.');
          setHistory([]);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json().catch(() => ({}))) as { items?: Array<{
        id: string;
        user_id: string;
        created_at: string;
        asset: string | null;
        timeframe: string | null;
        horizon: string | null;
        thesis: string | null;
        reasons: string[] | null;
        invalidation_kind: string | null;
        invalidation_level: string | null;
        red_flags: string | null;
        plan_b: string | null;
        risk: string | null;
        checks: Record<string, boolean> | null;
      }> };
      
      const items = Array.isArray(data?.items) ? data.items : [];
      const mapped: HistoryItem[] = items.map((item) => {
        const checks = item.checks || {};
        // Licz tylko zaznaczenia dla kluczy które są w allIds (ignoruj nadmiarowe)
        const checkedCount = allIds.filter((id) => checks[id] === true).length;
        
        // Format daty używając helpera
        const createdAt = formatDateTime(item.created_at);

        return {
          id: item.id,
          asset: item.asset,
          timeframe: item.timeframe,
          horizon: item.horizon,
          createdAt,
          checkedCount,
          thesis: item.thesis,
          plan_b: item.plan_b,
          risk: item.risk,
          invalidation_kind: item.invalidation_kind,
          invalidation_level: item.invalidation_level,
          checks,
        };
      });
      setHistory(mapped);
    } catch (e) {
      setHistoryError(String(e instanceof Error ? e.message : e) || 'Błąd ładowania historii');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Pobierz historię przy mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // EDU Engine: uruchom po mount i po zmianie context
  useEffect(() => {
    runEduEngine(context);
  }, [context.asset, context.timeframe, context.horizon]);

  // Decision Binding: uruchom po zmianie pól decyzji
  useEffect(() => {
    applyDecisionBinding();
  }, [thesis, invalidation, planB, risk]);

  // Zapisz do historii
  const saveToHistory = async () => {
    // Sprawdź czy asset jest wybrane (nie puste i nie placeholder)
    if (!context.asset || context.asset.trim() === '' || context.asset === '— aktywo —') {
      setSaveStatus('error');
      setSaveErrorDetails({ message: 'Wybierz aktywo, aby zapisać decyzję.' });
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveErrorDetails(null);
      }, 4000);
      return;
    }
    
    setSaveStatus('saving');
    setSaveErrorDetails(null);
    try {
      // Generuj checks tylko dla istniejących allIds (nie zapisuj false, nie zapisuj kluczy spoza allIds)
      const checks: Record<string, boolean> = {};
      for (const id of allIds) {
        if (statuses[id] === 'confirmed') {
          checks[id] = true;
        }
      }

      // Sanitizacja null/empty - nie wysyłaj pustych stringów jako null, tylko pomiń jeśli puste
      // (wysyłamy tylko pola, które mają wartość, żeby nie zaśmiecać DB)
      const body: {
        selection: { asset: string; timeframe: Timeframe; horizon: Horizon };
        thesis?: string;
        planB?: string;
        risk?: string;
        checks: Record<string, boolean>;
      } = {
        selection: {
          asset: context.asset,
          timeframe: context.timeframe,
          horizon: context.horizon,
        },
        checks,
      };

      // Dodaj tylko pola, które mają wartość (nie pusty string)
      if (thesis) {
        body.thesis = thesis;
      }
      if (planB) {
        body.planB = planB;
      }
      if (risk) {
        body.risk = risk;
      }

      const res = await fetch('/api/panel/checklists/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setSaveStatus('unauthorized');
          setSaveErrorDetails({ status: 401 });
          setTimeout(() => {
            setSaveStatus('idle');
            setSaveErrorDetails(null);
          }, 5000);
          return;
        }
        if (res.status === 503) {
          setSaveStatus('db-error');
          setSaveErrorDetails(null);
          setTimeout(() => {
            setSaveStatus('idle');
            setSaveErrorDetails(null);
          }, 4000);
          return;
        }
        // Inne błędy HTTP
        const errorBody = await res.json().catch(() => ({}));
        setSaveStatus('error');
        setSaveErrorDetails({
          status: res.status,
          message: errorBody?.error || errorBody?.message || `HTTP ${res.status}`,
        });
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveErrorDetails(null);
        }, 5000);
        return;
      }

      const result = await res.json().catch(() => ({}));
      if (result.ok === true) {
        setSaveStatus('saved');
        setSaveErrorDetails(null);
        // Odśwież historię i przewiń do niej
        await fetchHistory();
        // Przewiń do sekcji historii po krótkim opóźnieniu
        setTimeout(() => {
          const historySection = document.getElementById('history-section');
          if (historySection) {
            historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Podświetl najnowszy wpis przez ~2s
            const firstHistoryItem = historySection.querySelector('li');
            if (firstHistoryItem) {
              firstHistoryItem.classList.add('ring-2', 'ring-white/30');
              setTimeout(() => {
                firstHistoryItem.classList.remove('ring-2', 'ring-white/30');
              }, 2000);
            }
          }
        }, 100);
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveErrorDetails(null);
        }, 3000);
      } else {
        setSaveStatus('error');
        setSaveErrorDetails({
          message: result?.error || 'Zapis nie powiódł się',
        });
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveErrorDetails(null);
        }, 5000);
      }
    } catch (e) {
      setSaveStatus('error');
      setSaveErrorDetails({
        message: e instanceof Error ? e.message : 'Nieznany błąd',
      });
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveErrorDetails(null);
      }, 5000);
    }
  };

  // Obliczanie statystyk - liczymy tylko po allIds (ignorujemy nadmiarowe klucze w statuses)
  const stats = useMemo(() => {
    const total = allIds.length;
    const confirmed = allIds.filter((id) => statuses[id] === 'confirmed').length;
    const detected = allIds.filter((id) => statuses[id] === 'detected').length;
    const negated = allIds.filter((id) => statuses[id] === 'negated').length;
    
    // Ryzyko/egzekucja do sprawdzenia: elementy z tagiem 'ryzyko' lub 'zmiennosc' gdzie status !== 'confirmed'
    const riskExecPending = allIds.filter((id) => {
      const tag = idToTag[id];
      const isRiskOrVolatility = tag === 'ryzyko' || tag === 'zmiennosc';
      const isNotConfirmed = statuses[id] !== 'confirmed';
      return isRiskOrVolatility && isNotConfirmed;
    }).length;

    return {
      total,
      confirmed,
      detected,
      negated,
      riskExecPending,
    };
  }, [statuses, allIds, idToTag]);

  // Wykrywanie niezapisanych zmian
  const hasUnsavedChanges = useMemo(() => {
    // Sprawdź statusy - czy są jakiekolwiek zmiany (confirmed/detected/negated)
    const hasStatusChanges = allIds.some(
      (id) => statuses[id] === 'confirmed' || statuses[id] === 'detected' || statuses[id] === 'negated'
    );
    
    // Sprawdź pola Decision Drawer - czy są wypełnione
    const hasDecisionChanges = !!(thesis || planB || risk || invalidation);
    
    // Zmiany są niezapisane jeśli (są zmiany ORAZ saveStatus nie jest 'saved')
    return (hasStatusChanges || hasDecisionChanges) && saveStatus !== 'saved';
  }, [statuses, allIds, thesis, planB, risk, invalidation, saveStatus]);

  // Filtrowanie grup i elementów
  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tagFilter = filter === 'wszystko' ? null : filter;

    return CHECKLISTS.filter((g) => ['context', 'technical', 'risk'].includes(g.id))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const tagOk = !tagFilter || item.tag === tagFilter;
          const qOk =
            q.length === 0 ||
            item.text.toLowerCase().includes(q) ||
            (item.note?.toLowerCase().includes(q) ?? false);
          return tagOk && qOk;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, query]);

  // Funkcja wczytująca historię
  const loadHistoryItem = (item: HistoryItem) => {
    // Kontekst
    setContext({
      asset: item.asset || '',
      timeframe: (item.timeframe as Timeframe) || 'H4',
      horizon: (item.horizon as Horizon) || 'Dziś (do końca dnia)',
    });
    
    // Teza
    if (item.thesis) {
      setThesis(item.thesis as Thesis);
    } else {
      setThesis('');
    }
    
    // Plan B
    setPlanB(item.plan_b || '');
    
    // Ryzyko
    setRisk(item.risk || '');
    
    // Unieważnienie - zbuduj string z kind + level
    if (item.invalidation_kind && item.invalidation_level) {
      setInvalidation(`${item.invalidation_kind} ${item.invalidation_level}`);
    } else if (item.invalidation_kind) {
      setInvalidation(item.invalidation_kind);
    } else {
      setInvalidation('');
    }
    
    // Zaznaczenia - normalizuj i zastąp cały stan (ignoruje klucze spoza allIds)
    const normalizedStatuses = normalizeChecksToStatuses(item.checks, allIds);
    replaceStatuses(normalizedStatuses);
    
    // Reset saveStatus po wczytaniu (to jest stan "załadowany", nie "zapisany")
    setSaveStatus('idle');
    
    // Zastosuj Decision Binding po wczytaniu historii
    // Użyj setTimeout aby upewnić się, że state się zaktualizował
    setTimeout(() => {
      applyDecisionBinding();
    }, 0);
  };

  // Obsługa kliknięcia "Wczytaj"
  const handleLoadClick = (item: HistoryItem) => {
    if (hasUnsavedChanges) {
      // Otwórz modal potwierdzenia
      setPendingHistoryItem(item);
      setIsConfirmOpen(true);
    } else {
      // Bez zmian - od razu wczytaj
      loadHistoryItem(item);
    }
  };

  // Zapisz i wczytaj
  const handleSaveAndLoad = async () => {
    if (!pendingHistoryItem) return;
    
    // Zapisz najpierw
    setSaveStatus('saving');
    try {
      const checks: Record<string, boolean> = {};
      for (const id of allIds) {
        if (statuses[id] === 'confirmed') {
          checks[id] = true;
        }
      }

      const body: {
        selection: { asset: string; timeframe: Timeframe; horizon: Horizon };
        thesis?: string;
        planB?: string;
        risk?: string;
        checks: Record<string, boolean>;
      } = {
        selection: {
          asset: context.asset,
          timeframe: context.timeframe,
          horizon: context.horizon,
        },
        checks,
      };

      if (thesis) {
        body.thesis = thesis;
      }
      if (planB) {
        body.planB = planB;
      }
      if (risk) {
        body.risk = risk;
      }

      const res = await fetch('/api/panel/checklists/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 503) {
          setSaveStatus('db-error');
          setIsConfirmOpen(false);
          setPendingHistoryItem(null);
          setTimeout(() => setSaveStatus('idle'), 4000);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      setSaveStatus('saved');
      
      // Po skutecznym zapisie, wczytaj historię
      loadHistoryItem(pendingHistoryItem);
      
      // Odśwież listę historii
      await fetchHistory();
      
      // Zamknij modal
      setIsConfirmOpen(false);
      setPendingHistoryItem(null);
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Anuluj wczytywanie
  const handleCancelLoad = () => {
    setIsConfirmOpen(false);
    setPendingHistoryItem(null);
  };

  // Nadpisz i wczytaj
  const handleOverwriteAndLoad = () => {
    if (!pendingHistoryItem) return;
    loadHistoryItem(pendingHistoryItem);
    setIsConfirmOpen(false);
    setPendingHistoryItem(null);
  };

  // Usuwanie z historii
  const handleDeleteHistoryItem = async () => {
    if (!pendingDeleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/panel/checklists/history?id=${pendingDeleteItem.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const result = await res.json().catch(() => ({}));
      if (result.ok === true) {
        setIsDeleteConfirmOpen(false);
        setPendingDeleteItem(null);
        await fetchHistory();
      } else {
        throw new Error('Delete failed');
      }
    } catch (e) {
      // Error handling - można pokazać toast/alert
      console.error('Delete error:', e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setPendingDeleteItem(null);
  };

  return (
    <div className="mt-6">
      {/* Instrukcja: Jak korzystać z Checklisty (EDU) */}
      <details className="mb-6 rounded-lg border border-white/10 bg-white/5 p-3">
        <summary className="cursor-pointer text-sm text-white/80 hover:text-white transition-colors list-none">
          <span className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>Jak korzystać z Checklisty (EDU)</span>
          </span>
        </summary>
        <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/80 space-y-4">
          <p className="text-white font-medium">Jak korzystać z Checklisty (EDU)</p>
          
          <p>
            Checklista (EDU) nie daje sygnałów transakcyjnych.
            Pomaga uporządkować decyzję, pokazując które warunki rynkowe są wykryte przez system, a które wymagają Twojego potwierdzenia.
          </p>

          <div>
            <p className="text-white font-medium mb-1">1. Wybierz kontekst</p>
            <p>W panelu "Decyzja" wybierz aktywo, interwał czasowy i horyzont decyzji.<br />
            Każda zmiana kontekstu powoduje ponowną analizę warunków przez system.</p>
          </div>

          <div>
            <p className="text-white font-medium mb-1">2. Zobacz, co system wykrył</p>
            <p>Statusy elementów:</p>
            <ul className="list-none space-y-1 ml-4 mt-1">
              <li>⏳ Oczekiwane – warunek nie wystąpił</li>
              <li>🟡 Wykryte – system wykrył warunek rynkowy</li>
              <li>🟢 Potwierdzone – potwierdziłeś wystąpienie warunku</li>
              <li>🔴 Zanegowane – warunek jest sprzeczny z Twoją tezą</li>
            </ul>
            <p className="mt-2">Przy statusie „Wykryte” system pokazuje powód wykrycia.</p>
          </div>

          <div>
            <p className="text-white font-medium mb-1">3. Potwierdzaj tylko fakty</p>
            <p>Zaznaczaj elementy tylko wtedy, gdy faktycznie widzisz je na rynku.<br />
            Nie potwierdzaj warunków „na zapas".</p>
          </div>

          <div>
            <p className="text-white font-medium mb-1">4. Uzupełnij decyzję</p>
            <p>W panelu decyzji określ:</p>
            <ul className="list-none space-y-1 ml-4 mt-1">
              <li>– tezę</li>
              <li>– warunek unieważnienia</li>
              <li>– plan B</li>
              <li>– poziom ryzyka</li>
            </ul>
            <p className="mt-2">System nie podejmuje decyzji za Ciebie.</p>
          </div>

          <div>
            <p className="text-white font-medium mb-1">5. Sprawdź stan realizacji</p>
            <p>Panel „Stan realizacji" pokazuje podsumowanie faktów,<br />
            nie rekomendację transakcyjną.</p>
          </div>

          <div>
            <p className="text-white font-medium mb-1">6. Zapisz lub wczytaj historię</p>
            <p>Możesz zapisać checklistę lub wrócić do wcześniejszych decyzji.<br />
            System ostrzeże Cię przed nadpisaniem niezapisanych zmian.</p>
          </div>

          <p className="pt-2 border-t border-white/10 text-white/70 italic">
            To narzędzie edukacyjne (EDU), nie doradztwo inwestycyjne.
          </p>
        </div>
      </details>

      {/* Decision Drawer */}
      <DecisionDrawerWrapper
        thesis={thesis}
        onThesisChange={setThesis}
        invalidation={invalidation}
        onInvalidationChange={setInvalidation}
        planB={planB}
        onPlanBChange={setPlanB}
        risk={risk}
        onRiskChange={setRisk}
        onSave={saveToHistory}
        saveStatus={saveStatus}
        saveErrorDetails={saveErrorDetails}
        onSaveStatusChange={setSaveStatus}
        statuses={statuses}
        reasonsById={reasonsById}
        allIds={allIds}
        context={context}
        onContextChange={setContext}
      />

      {/* Panel EDU Engine */}
      {context.asset && (
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          <h3 className="text-xs font-semibold text-white/90 mb-2">EDU Engine</h3>
          <div className="text-xs text-white/60 mb-3">
            Ostatnia weryfikacja: {lastVerification ? formatDateTime(lastVerification.toISOString()) : '—'}
          </div>
          <div className="space-y-1.5">
            {Object.entries(engineReport).map(([id, report]) => (
              <div key={id} className="flex items-start gap-2 text-xs">
                <span className="text-white/70 min-w-[100px]">
                  {id === 'calendar' ? 'Calendar:' : id === 'events-impacts' ? 'Events impact:' : id === 'sentiment' ? 'Sentiment:' : id === 'volatility' ? 'Volatility:' : id}
                </span>
                <span className={`${report.status === 'ok' ? 'text-green-400' : report.status === 'err' ? 'text-amber-400' : 'text-white/60'}`}>
                  {report.status === 'ok' ? 'OK' : report.status === 'err' ? 'Błąd' : 'Brak'}
                </span>
                <span className="text-white/55">/ {report.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtr i wyszukiwanie */}
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/70 mb-1">Tag</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TagFilter)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 outline-none focus:ring-1 focus:ring-white/30"
          >
            <option value="wszystko">Wszystko</option>
            <option value="makro">makro</option>
            <option value="sentyment">sentyment</option>
            <option value="technika">technika</option>
            <option value="ryzyko">ryzyko</option>
            <option value="zmiennosc">zmienność</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/70 mb-1">Szukaj</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj w checklistach…"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        <button
          onClick={() => {
            setFilter('wszystko');
            setQuery('');
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
        >
          Wyczyść
        </button>
        <button
          onClick={() => runEduEngine(context)}
          disabled={eduLoading || !context.asset}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {eduLoading ? 'Sprawdzanie...' : 'Odśwież wykrycia'}
        </button>
      </div>

      {/* Główna zawartość - layout 2 kolumny (desktop) lub 1 kolumna (mobile) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Lista checklisty */}
        <div className="space-y-6">
          {visibleGroups.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Brak elementów spełniających kryteria filtra.
            </div>
          ) : (
            visibleGroups.map((group) => {
              // Oblicz progres dla sekcji
              const totalInSection = group.items.length;
              const confirmedInSection = group.items.filter((item) => statuses[item.id] === 'confirmed').length;
              const detectedInSection = group.items.filter((item) => statuses[item.id] === 'detected').length;
              
              return (
                <section key={group.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {mapGroupToSection(group.id)}
                  </h2>
                  <div className="text-xs text-white/60 mb-4">
                    {confirmedInSection}/{totalInSection} potwierdzone
                    {detectedInSection > 0 && ` • Z wykryciami: ${detectedInSection}`}
                  </div>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const status = statuses[item.id] || 'pending';
                      const isDetected = status === 'detected';
                      const isConfirmed = status === 'confirmed';
                      const statusEmoji = getStatusEmoji(status);
                      const reason = reasonsById[item.id];
                      const pendingHint = status === 'pending' ? getPendingHint(item.id) : null;
                      const isManual = isManualItem(item.id);
                      const isAutomatic = isAutomaticItem(item.id);
                      const engineReportForItem = engineReport[item.id];

                      // Funkcja do obsługi negowania (ustawia reason na "Odrzucone przez użytkownika")
                      const handleNegate = () => {
                        negateItem(item.id);
                        setReasonsById((prev) => {
                          const next = { ...prev };
                          next[item.id] = 'Odrzucone przez użytkownika';
                          return next;
                        });
                      };

                      return (
                        <li
                          key={item.id}
                          className="flex flex-col gap-1 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg flex-shrink-0" title={status}>
                              {statusEmoji}
                            </span>
                            {isDetected && (
                              <input
                                type="checkbox"
                                checked={isConfirmed}
                                onChange={() => confirmItem(item.id)}
                                className="h-4 w-4 rounded border-white/20 bg-transparent text-white focus:ring-white/30 cursor-pointer flex-shrink-0"
                              />
                            )}
                            {!isDetected && <div className="w-4 flex-shrink-0" />}
                            <span className="text-sm text-white/90 flex-1">{item.text}</span>
                            {/* Szybkie akcje dla detected */}
                            {isDetected && (
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => confirmItem(item.id)}
                                  className="px-2 py-1 text-xs rounded border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                                  title="Potwierdź"
                                >
                                  Potwierdź
                                </button>
                                <button
                                  onClick={handleNegate}
                                  className="px-2 py-1 text-xs rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  title="Odrzuć"
                                >
                                  Odrzuć
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Reason dla detected i negated */}
                          {reason && (status === 'detected' || status === 'negated') && (
                            <div className="text-xs text-white/55 pl-7">
                              {reason}
                            </div>
                          )}
                          {/* Engine report note dla pending itemów z engineReport (automatyczne i inne) */}
                          {status === 'pending' && engineReportForItem && (
                            <div className="text-xs text-white/45 pl-7">
                              Silnik: {engineReportForItem.note}
                            </div>
                          )}
                          {/* Engine report note dla automatycznych itemów w stanie detected (tylko jeśli nie ma reason) */}
                          {isAutomatic && engineReportForItem && status === 'detected' && !reason && (
                            <div className="text-xs text-white/45 pl-7">
                              Silnik: {engineReportForItem.note}
                            </div>
                          )}
                          {/* Ręczne itemy - pokaż "Ręcznie:" dla pending */}
                          {isManual && status === 'pending' && pendingHint && (
                            <div className="text-xs text-white/45 pl-7">
                              Ręcznie: {pendingHint}
                            </div>
                          )}
                          {/* Inne pending hints (nie ręczne, nie automatyczne) */}
                          {!isManual && !isAutomatic && pendingHint && (
                            <div className="text-xs text-white/45 pl-7">
                              {pendingHint}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        {/* Panel "Stan realizacji" */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Stan realizacji</h3>
            <div className="space-y-3 text-sm">
              {thesis && (
                <div>
                  <span className="text-white/70">Teza: </span>
                  <span className="text-white font-semibold">{thesis}</span>
                </div>
              )}
              <div>
                <span className="text-white/70">Spełnione: </span>
                <span className="text-white font-semibold">
                  {stats.confirmed} / {stats.total}
                </span>
              </div>
              <div>
                <span className="text-white/70">Wykryte do potwierdzenia: </span>
                <span className="text-white font-semibold">{stats.detected}</span>
              </div>
              <div>
                <span className="text-white/70">Zanegowane (czerwone flagi): </span>
                <span className="text-white font-semibold">{stats.negated}</span>
              </div>
              <div>
                <span className="text-white/70">Ryzyko/egzekucja do sprawdzenia: </span>
                <span className="text-white font-semibold">{stats.riskExecPending}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historia zapisanych checklist */}
      <div id="history-section" className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Zapisane checklisty (konto)</h3>
        {historyLoading && (
          <div className="text-sm text-white/70">Ładowanie...</div>
        )}
        {historyError && (
          <div className="text-sm text-red-400">{historyError}</div>
        )}
        {!historyLoading && !historyError && history.length === 0 && (
          <div className="text-sm text-white/70">Brak zapisanych pozycji.</div>
        )}
        {!historyLoading && !historyError && history.length > 0 && (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 text-sm text-white/85">
                  <span className="font-medium">{item.asset || '—'}</span>
                  <span className="mx-2 text-white/50">·</span>
                  <span>{item.timeframe || '—'}</span>
                  <span className="mx-2 text-white/50">·</span>
                  <span>{item.horizon || '—'}</span>
                  <span className="mx-2 text-white/50">·</span>
                  <span className="text-white/60">{item.createdAt}</span>
                  <span className="mx-2 text-white/50">·</span>
                  <span className="text-white/60">{item.checkedCount} zaznaczeń</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoadClick(item)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10 transition-colors"
                  >
                    Wczytaj
                  </button>
                  <button
                    onClick={() => {
                      setPendingDeleteItem(item);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal potwierdzenia przy wczytywaniu z niezapisanymi zmianami */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-xl border border-white/10 bg-slate-900 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-3">Niezapisane zmiany</h3>
            <p className="text-sm text-white/80 mb-6">
              Masz niezapisane zmiany na bieżącej checkliście. Wczytanie historii je nadpisze.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLoad}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleOverwriteAndLoad}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors"
              >
                Nadpisz i wczytaj
              </button>
              <button
                onClick={handleSaveAndLoad}
                disabled={saveStatus === 'saving'}
                className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {saveStatus === 'saving' ? 'Zapisywanie...' : 'Zapisz i wczytaj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia przy usuwaniu */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-xl border border-white/10 bg-slate-900 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-3">Usunąć ten zapis?</h3>
            <p className="text-sm text-white/80 mb-6">
              Ta operacja jest nieodwracalna. Zostanie usunięty zapis z {pendingDeleteItem?.asset || '—'} z dnia {pendingDeleteItem?.createdAt || '—'}.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Nie
              </button>
              <button
                onClick={handleDeleteHistoryItem}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Usuwanie...' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
