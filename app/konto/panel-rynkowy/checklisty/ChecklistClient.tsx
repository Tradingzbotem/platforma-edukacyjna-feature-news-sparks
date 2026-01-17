'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChecklistGroup, ChecklistItem } from '@/lib/panel/checklists';
import { CHECKLISTS } from '@/lib/panel/checklists';

type TagFilter = 'wszystko' | 'makro' | 'technika' | 'ryzyko' | 'sentyment' | 'zmiennosc';

type CheckedState = Record<string, boolean>;

/* ───────────────────────────── Planner: typy i dane ───────────────────────────── */
type CategoryKey = 'Indeksy' | 'Towary' | 'FX' | 'Akcje';
type Timeframe = 'H1' | 'H4' | 'D1';
type Horizon = 'Dziś (do końca dnia)' | '1–2 dni' | 'Tydzień';
type Direction = 'Wyżej' | 'Niżej' | 'Bez większej zmiany' | '';

type PlannerSelection = {
  category: CategoryKey | '';
  asset: string | '';
  timeframe: Timeframe;
  horizon: Horizon;
};

type PlannerState = {
  selection: PlannerSelection;
  thesis: Direction;
  reasons: string[]; // max 3
  invalidationKind: 'Przebicie poziomu' | 'Powrót poniżej/powyżej' | 'Dane makro zmieniają obraz' | 'Inne' | '';
  invalidationLevel: string;
  redFlags: string; // multiline
  planB: string; // multiline
  risk: 'Mało' | 'Średnio' | 'Wysoko' | '';
};

const CATEGORIES: Record<CategoryKey, string[]> = {
  Indeksy: ['US100', 'US500', 'DE40'],
  Towary: ['XAUUSD', 'WTI', 'Brent'],
  FX: ['EURUSD', 'GBPUSD', 'USDJPY', 'EURPLN'],
  Akcje: ['NVDA', 'AAPL', 'TSLA', 'MSFT'],
};
const TIMEFRAMES: Timeframe[] = ['H1', 'H4', 'D1'];
const HORIZONS: Horizon[] = ['Dziś (do końca dnia)', '1–2 dni', 'Tydzień'];

function plannerKey(s: PlannerSelection) {
  if (!s.asset) return 'planner:last';
  return `planner:${s.asset}:${s.timeframe}:${s.horizon}`;
}

function usePlanner() {
  const [planner, setPlanner] = useState<PlannerState>({
    selection: { category: '', asset: '', timeframe: 'H4', horizon: 'Dziś (do końca dnia)' },
    thesis: '',
    reasons: ['', '', ''],
    invalidationKind: '',
    invalidationLevel: '',
    redFlags: '',
    planB: '',
    risk: '',
  });

  // Wczytaj ostatni wybór
  useEffect(() => {
    try {
      const raw = localStorage.getItem('planner:last');
      if (raw) {
        const parsed = JSON.parse(raw) as PlannerState;
        if (parsed && typeof parsed === 'object') setPlanner(parsed);
      }
    } catch {}
  }, []);

  // Zapisuj last snapshot przy zmianie wyboru
  useEffect(() => {
    try {
      localStorage.setItem('planner:last', JSON.stringify(planner));
    } catch {}
  }, [planner.selection.category, planner.selection.asset, planner.selection.timeframe, planner.selection.horizon]);

  const save = () => {
    if (!planner.selection.asset) return;
    try {
      localStorage.setItem(plannerKey(planner.selection), JSON.stringify(planner));
    } catch {}
  };

  const load = () => {
    if (!planner.selection.asset) return false;
    try {
      const raw = localStorage.getItem(plannerKey(planner.selection));
      if (!raw) return false;
      const parsed = JSON.parse(raw) as PlannerState;
      if (parsed && typeof parsed === 'object') {
        setPlanner(parsed);
        return true;
      }
    } catch {}
    return false;
  };

  const reset = () => {
    setPlanner((p) => ({
      ...p,
      thesis: '',
      reasons: ['', '', ''],
      invalidationKind: '',
      invalidationLevel: '',
      redFlags: '',
      planB: '',
      risk: '',
    }));
  };

  return { planner, setPlanner, save, load, reset };
}

function usePersistentChecks(storageKey: string, initial: CheckedState) {
  const [state, setState] = useState<CheckedState>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setState(parsed as CheckedState);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [storageKey, state]);

  function toggle(id: string) {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function reset(ids: string[]) {
    const next: CheckedState = {};
    ids.forEach((id) => {
      next[id] = false;
    });
    setState(next);
  }

  function replace(next: CheckedState) {
    setState(next || {});
  }

  return { state, toggle, reset, replace };
}

function groupItemIds(groups: ChecklistGroup[]): string[] {
  const ids: string[] = [];
  for (const g of groups) {
    for (const it of g.items) ids.push(it.id);
  }
  return ids;
}

export default function ChecklistClient() {
  const allIds = useMemo(() => groupItemIds(CHECKLISTS), []);
  const { state, toggle, reset, replace } = usePersistentChecks('panel_checklists_v1', {});
  const idToItem = useMemo(() => {
    const map: Record<string, ChecklistItem> = {};
    for (const g of CHECKLISTS) for (const it of g.items) map[it.id] = it;
    return map;
  }, []);
  const { planner, setPlanner, save, load, reset: resetPlanner } = usePlanner();
  const [serverSaveStatus, setServerSaveStatus] = useState<null | 'saving' | 'ok' | 'err' | 'unauth' | 'db'>(null);
  const [localSaveStatus, setLocalSaveStatus] = useState<null | 'ok'>(null);

  // ───────────────────────────── Historia z konta ─────────────────────────────
  type ServerHistoryItem = {
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
  };
  const [history, setHistory] = useState<ServerHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  async function refreshHistory() {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const res = await fetch('/api/panel/checklists/history', { cache: 'no-store' });
      if (!res.ok) {
        const code = res.status;
        throw new Error(code === 401 ? 'Unauthorized' : code === 503 ? 'Brak połączenia z bazą' : `HTTP ${code}`);
      }
      const data = (await res.json().catch(() => ({}))) as { items?: ServerHistoryItem[] };
      setHistory(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setHistoryError(String(e?.message || e) || 'Błąd ładowania');
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refreshHistory();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function inferCategoryForAsset(asset: string | ''): PlannerSelection['category'] {
    if (!asset) return '';
    const entries = Object.entries(CATEGORIES) as [CategoryKey, string[]][];
    for (const [cat, assets] of entries) {
      if (assets.includes(asset)) return cat;
    }
    return '';
  }

  function applyFromHistory(item: ServerHistoryItem) {
    const asset = String(item.asset || '');
    const timeframe = (['H1', 'H4', 'D1'] as Timeframe[]).includes(item.timeframe as Timeframe)
      ? (item.timeframe as Timeframe)
      : 'H4';
    const horizon = (['Dziś (do końca dnia)', '1–2 dni', 'Tydzień'] as Horizon[]).includes(item.horizon as Horizon)
      ? (item.horizon as Horizon)
      : 'Dziś (do końca dnia)';
    const category = inferCategoryForAsset(asset);

    setPlanner((p) => ({
      ...p,
      selection: { category, asset, timeframe, horizon },
      thesis: (item.thesis as PlannerState['thesis']) || '',
      reasons: [
        ...(Array.isArray(item.reasons) ? item.reasons.slice(0, 3) : []),
        '', '', '',
      ].slice(0, 3),
      invalidationKind: (item.invalidation_kind as PlannerState['invalidationKind']) || '',
      invalidationLevel: item.invalidation_level || '',
      redFlags: item.red_flags || '',
      planB: item.plan_b || '',
      risk: (item.risk as PlannerState['risk']) || '',
    }));
    replace(item.checks || {});
  }

  async function saveToServer() {
    if (!planner.selection.asset) return;
    setServerSaveStatus('saving');
    try {
      const res = await fetch('/api/panel/checklists/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection: planner.selection,
          thesis: planner.thesis,
          reasons: planner.reasons.filter(Boolean),
          invalidationKind: planner.invalidationKind,
          invalidationLevel: planner.invalidationLevel,
          redFlags: planner.redFlags,
          planB: planner.planB,
          risk: planner.risk,
          checks: state,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setServerSaveStatus('unauth');
        } else if (res.status === 503) {
          setServerSaveStatus('db');
        } else {
          setServerSaveStatus('err');
        }
        setTimeout(() => setServerSaveStatus(null), 2500);
        return;
      }
      setServerSaveStatus('ok');
      try { await refreshHistory(); } catch {}
      setTimeout(() => setServerSaveStatus(null), 2000);
    } catch {
      setServerSaveStatus('err');
      setTimeout(() => setServerSaveStatus(null), 2500);
    }
  }

  const [filter, setFilter] = useState<TagFilter>('wszystko');
  const [query, setQuery] = useState('');

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    function match(item: ChecklistItem) {
      const tagOk = filter === 'wszystko' ? true : item.tag === filter;
      const qOk =
        q.length === 0
          ? true
          : item.text.toLowerCase().includes(q) ||
            (item.note ? item.note.toLowerCase().includes(q) : false);
      return tagOk && qOk;
    }
    return CHECKLISTS.map((g) => ({
      ...g,
      items: g.items.filter(match),
    }));
  }, [filter, query]);

  const nothingVisible = visibleGroups.every((g) => g.items.length === 0);

  return (
    <div className="mt-6">
      {/* ─────────────── Plan pod aktywo (worksheet) ─────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="text-xs text-white/70">Kategoria</label>
            <select
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              value={planner.selection.category}
              onChange={(e) =>
                setPlanner((p) => ({ ...p, selection: { ...p.selection, category: e.target.value as CategoryKey, asset: '' } }))
              }
            >
              <option value="">— wybierz —</option>
              {(Object.keys(CATEGORIES) as CategoryKey[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/70">Aktywo</label>
            <select
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              value={planner.selection.asset}
              onChange={(e) => setPlanner((p) => ({ ...p, selection: { ...p.selection, asset: e.target.value } }))}
              disabled={!planner.selection.category}
            >
              <option value="">— wybierz —</option>
              {planner.selection.category &&
                CATEGORIES[planner.selection.category].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/70">Interwał</label>
            <select
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              value={planner.selection.timeframe}
              onChange={(e) => setPlanner((p) => ({ ...p, selection: { ...p.selection, timeframe: e.target.value as Timeframe } }))}
            >
              {TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/70">Horyzont</label>
            <select
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              value={planner.selection.horizon}
              onChange={(e) => setPlanner((p) => ({ ...p, selection: { ...p.selection, horizon: e.target.value as Horizon } }))}
            >
              {HORIZONS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              className="w-full rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
              disabled={!planner.selection.asset}
              onClick={() => load()}
            >
              Załaduj plan
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Twoja teza (prosto)</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['Wyżej', 'Niżej', 'Bez większej zmiany'] as Direction[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setPlanner((p) => ({ ...p, thesis: p.thesis === d ? '' as Direction : d }))}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold border ${planner.thesis === d ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs text-white/70">3 najważniejsze powody (krótkie zdania)</label>
              {planner.reasons.map((r, idx) => (
                <input
                  key={idx}
                  value={r}
                  onChange={(e) => {
                    const next = [...planner.reasons];
                    next[idx] = e.target.value;
                    setPlanner((p) => ({ ...p, reasons: next }));
                  }}
                  placeholder={`Powód ${idx + 1}`}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
                />
              ))}
              <div className="text-[11px] text-white/60">Podpowiedzi z zaznaczonych punktów:</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.keys(state)
                  .filter((id) => state[id])
                  .slice(0, 6)
                  .map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        const txt = idToItem[id]?.text || '';
                        const firstEmpty = planner.reasons.findIndex((x) => !x);
                        if (firstEmpty !== -1) {
                          const next = [...planner.reasons];
                          next[firstEmpty] = txt;
                          setPlanner((p) => ({ ...p, reasons: next }));
                        }
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
                    >
                      {idToItem[id]?.text || id}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Warunek unieważnienia + Plan B</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['Przebicie poziomu', 'Powrót poniżej/powyżej', 'Dane makro zmieniają obraz', 'Inne'] as PlannerState['invalidationKind'][]).map((k) => (
                <button
                  key={k}
                  onClick={() => setPlanner((p) => ({ ...p, invalidationKind: p.invalidationKind === k ? '' : k }))}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold border ${planner.invalidationKind === k ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/70">Poziom / doprecyzowanie</label>
              <input
                value={planner.invalidationLevel}
                onChange={(e) => setPlanner((p) => ({ ...p, invalidationLevel: e.target.value }))}
                placeholder="np. powrót poniżej 18 000, przebicie strefy X"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/70">Czerwone flagi (2–4 krótkie linijki)</label>
              <textarea
                value={planner.redFlags}
                onChange={(e) => setPlanner((p) => ({ ...p, redFlags: e.target.value }))}
                rows={3}
                placeholder="np. dane CPI dziś, bardzo szeroki spread, brak reakcji przy poziomie"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/70">Plan B (co robię, jeśli rynek idzie inaczej)</label>
              <textarea
                value={planner.planB}
                onChange={(e) => setPlanner((p) => ({ ...p, planB: e.target.value }))}
                rows={2}
                placeholder="np. redukcja, zamknięcie po powrocie pod poziom, pauza 15 min"
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/70">Ryzyko na dziś</label>
              <select
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                value={planner.risk}
                onChange={(e) => setPlanner((p) => ({ ...p, risk: e.target.value as PlannerState['risk'] }))}
              >
                <option value="">— wybierz —</option>
                <option value="Mało">Mało</option>
                <option value="Średnio">Średnio</option>
                <option value="Wysoko">Wysoko</option>
              </select>
              <div className="mt-1 text-[11px] text-white/60">EDU: dopasuj rozmiar do zmienności i trzymaj limit dzienny.</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  save();
                  setLocalSaveStatus('ok');
                  setTimeout(() => setLocalSaveStatus(null), 2000);
                  // Spróbuj również zapisać na koncie (jeśli zalogowany i DB jest dostępna)
                  saveToServer();
                }}
                disabled={!planner.selection.asset}
                className="rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
              >
                {localSaveStatus === 'ok' ? 'Zapisano ✅' : 'Zapisz plan'}
              </button>
              <button onClick={resetPlanner} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Wyczyść</button>
              <button onClick={saveToServer} disabled={!planner.selection.asset || serverSaveStatus === 'saving'} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                {serverSaveStatus === 'saving'
                  ? 'Zapisywanie…'
                  : serverSaveStatus === 'ok'
                  ? 'Zapisano ✅'
                  : serverSaveStatus === 'unauth'
                  ? 'Zaloguj, aby zapisać'
                  : serverSaveStatus === 'db'
                  ? 'Baza niedostępna'
                  : serverSaveStatus === 'err'
                  ? 'Błąd zapisu'
                  : 'Zapisz na koncie (beta)'}
              </button>
            </div>
          </div>
        </div>

        {/* Podsumowanie */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Twoje podsumowanie</div>
          <div className="mt-2 text-sm text-white/80">
            <div><span className="text-white/60">Aktywo:</span> {planner.selection.asset || '—'} <span className="text-white/60">• Interwał:</span> {planner.selection.timeframe} <span className="text-white/60">• Horyzont:</span> {planner.selection.horizon}</div>
            <div className="mt-1"><span className="text-white/60">Teza:</span> {planner.thesis || '—'}</div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/80">Co wspiera</div>
              <ul className="mt-1 list-disc pl-5 text-xs text-white/70 space-y-1">
                {planner.reasons.filter(Boolean).slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                {planner.reasons.filter(Boolean).length === 0 && (
                  <li>Dodaj 1–3 powody.</li>
                )}
                {/* Sugestie z zaznaczeń */}
                {Object.keys(state).filter((id) => state[id]).slice(0, 3).map((id) => (
                  <li key={`s-${id}`}>{idToItem[id]?.text}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/80">Czerwone flagi (kiedy odpuścić)</div>
              <ul className="mt-1 list-disc pl-5 text-xs text-white/70 space-y-1">
                {planner.redFlags.trim().length > 0
                  ? planner.redFlags.split('\n').map((l, i) => l.trim() && <li key={i}>{l.trim()}</li>)
                  : <li>Wypisz 2–4 rzeczy, po których odpuszczasz.</li>}
                {planner.invalidationKind && (
                  <li>Unieważnienie: {planner.invalidationKind}{planner.invalidationLevel ? ` — ${planner.invalidationLevel}` : ''}</li>
                )}
                {!planner.invalidationKind && <li>Dodaj jasny warunek unieważnienia.</li>}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/80">Plan B / ryzyko</div>
              <ul className="mt-1 list-disc pl-5 text-xs text-white/70 space-y-1">
                {planner.planB.trim().length > 0 ? planner.planB.split('\n').map((l, i) => l.trim() && <li key={i}>{l.trim()}</li>) : <li>Dodaj krótki Plan B.</li>}
                {planner.risk && <li>Poziom ryzyka dziś: {planner.risk}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── Filtr + checklisty (odhaczanie) ─────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] items-end">
          <div>
            <label htmlFor="tag" className="text-xs text-white/70">Filtr tagu</label>
            <select
              id="tag"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
              value={filter}
              onChange={(e) => setFilter(e.target.value as TagFilter)}
            >
              <option value="wszystko">Wszystko</option>
              <option value="makro">Makro</option>
              <option value="technika">Technika</option>
              <option value="ryzyko">Ryzyko</option>
              <option value="sentyment">Sentyment</option>
              <option value="zmiennosc">Zmienność</option>
            </select>
          </div>

          <div>
            <label htmlFor="q" className="text-xs text-white/70">Szukaj</label>
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="fraza w opisie..."
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>

          <div className="sm:justify-self-end">
            <button
              onClick={() => reset(allIds)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 font-semibold px-4 py-2 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Wyzeruj zaznaczenia
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleGroups.map((g) => (
          <section key={g.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
            <header className="flex items-center justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{g.title}</div>
                {g.subtitle && <div className="text-sm text-white/70 mt-0.5">{g.subtitle}</div>}
              </div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
                EDU
              </span>
            </header>

            <ul className="mt-4 space-y-2">
              {g.items.map((it) => {
                const checked = Boolean(state[it.id]);
                return (
                  <li key={it.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                        checked={checked}
                        onChange={() => toggle(it.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white/90">{it.text}</div>
                        <div className="mt-0.5 flex items-center gap-2">
                          {it.tag && (
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                              {it.tag}
                            </span>
                          )}
                          {it.note && <span className="text-[11px] text-white/60">{it.note}</span>}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {nothingVisible && (
        <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-sm text-white/70">
          Brak elementów spełniających kryteria filtra.
        </div>
      )}

      {/* ─────────────── Zapisane checklisty (konto) ─────────────── */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Zapisane checklisty (konto)</div>
          <button
            type="button"
            onClick={() => { refreshHistory(); }}
            className="text-[11px] text-white/70 underline underline-offset-2 hover:text-white"
          >
            Odśwież
          </button>
        </div>

        {historyLoading && (
          <div className="mt-3 text-sm text-white/70">Ładowanie…</div>
        )}
        {historyError && (
          <div className="mt-3 text-sm text-red-300">Błąd: {historyError}</div>
        )}
        {!historyLoading && !historyError && history.length === 0 && (
          <div className="mt-3 text-sm text-white/70">Brak zapisanych pozycji.</div>
        )}
        {!historyLoading && !historyError && history.length > 0 && (
          <ul className="mt-3 space-y-2">
            {history.map((it) => {
              const created = new Date(it.created_at);
              const createdStr = isNaN(created.getTime())
                ? it.created_at
                : created.toLocaleString();
              const checkedCount = Object.values(it.checks || {}).filter(Boolean).length;
              return (
                <li key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/85">
                      <span className="font-semibold">{it.asset || '—'}</span>
                      <span className="mx-2 text-white/50">•</span>
                      <span>{it.timeframe || '—'}</span>
                      <span className="mx-2 text-white/50">•</span>
                      <span>{it.horizon || '—'}</span>
                      <span className="mx-2 text-white/50">•</span>
                      <span className="text-white/70">{createdStr}</span>
                      <span className="mx-2 text-white/50">•</span>
                      <span className="text-white/70">{checkedCount} zaznaczeń</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyFromHistory(it)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10"
                      >
                        Wczytaj
                      </button>
                    </div>
                  </div>
                  {(it.thesis || it.plan_b || it.red_flags) && (
                    <div className="mt-2 text-xs text-white/70">
                      {it.thesis && <div><span className="text-white/60">Teza:</span> {it.thesis}</div>}
                      {it.plan_b && <div><span className="text-white/60">Plan B:</span> {it.plan_b}</div>}
                      {it.red_flags && <div><span className="text-white/60">Czerwone flagi:</span> {it.red_flags}</div>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}



