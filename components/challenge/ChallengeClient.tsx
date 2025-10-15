'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type ChallengeItem = {
  id: string;
  title: string;
  instrument: string;
  window: string;
  note?: string;
  /** ISO, np. "2025-10-13T16:30:00+02:00" – po tym czasie wyzwanie zamknięte */
  deadline?: string;
};

type Choice = 'up' | 'flat' | 'down';

type BetRecord = {
  id: string;
  choice: Choice;
  ts: string;
  day?: string;
};

type BetsState = Record<string, BetRecord>;

// ------- storage keys -------
const LS_BETS     = 'fxedu:challenge:v1';
const LS_XP       = 'fxedu:challenge:xp:v1';
const LS_RESULTS  = 'fxedu:challenge:results:v1';
const LS_AWARDED  = 'fxedu:challenge:awarded:v1';

// ------- helpers: storage -------
function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) as T; }
  catch { return fallback; }
}
function saveJSON(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function loadBets(): BetsState { return loadJSON<BetsState>(LS_BETS, {}); }
function saveBets(next: BetsState) { saveJSON(LS_BETS, next); }
function loadXP(): number { const n = Number(localStorage.getItem(LS_XP)); return Number.isFinite(n) && n >= 0 ? n : 0; }
function saveXP(xp: number) { localStorage.setItem(LS_XP, String(Math.max(0, Math.floor(xp)))); }
type ResultMap = Record<string, { outcome: Choice; ts: string }>;
function loadResults(): ResultMap { return loadJSON<ResultMap>(LS_RESULTS, {}); }
function saveResults(m: ResultMap) { saveJSON(LS_RESULTS, m); }
type AwardedMap = Record<string, boolean>;
function loadAwarded(): AwardedMap { return loadJSON<AwardedMap>(LS_AWARDED, {}); }
function saveAwarded(m: AwardedMap) { saveJSON(LS_AWARDED, m); }

// ------- helpers: ui / time -------
function prettyWhen(tsISO?: string) { if (!tsISO) return ''; try { return new Date(tsISO).toLocaleString(); } catch { return tsISO || ''; } }
function todayKey(): string { const d = new Date(); const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
const betLabel = (c: Choice) => (c === 'up' ? '⬆️ Wzrost' : c === 'flat' ? '➡️ Neutralnie' : '⬇️ Spadek');

// ------- levels -------
type LevelInfo = { name: string; min: number; max?: number };
const LEVELS: LevelInfo[] = [
  { name: 'Nowicjusz',         min: 0,   max: 49  },
  { name: 'Trader-praktykant', min: 50,  max: 149 },
  { name: 'Strateg',           min: 150, max: 299 },
  { name: 'Analityk',          min: 300, max: 599 },
  { name: 'Ekspert rynku',     min: 600, max: undefined },
];
function levelForXP(xp: number) {
  const lvl = LEVELS.find(l => xp >= l.min && (l.max === undefined || xp <= l.max)) ?? LEVELS[0];
  const next = LEVELS.find(l => l.min > lvl.min);
  const toNext = next ? Math.max(0, next.min - xp) : 0;
  const rangeMin = lvl.min;
  const rangeMax = next ? next.min : xp + 1;
  const progress = Math.max(0, Math.min(100, Math.round(((xp - rangeMin) / (rangeMax - rangeMin)) * 100)));
  return { lvl, next, toNext, progress };
}

// ------- mapowanie instrument -> symbol Finnhub (spójne z tickerem/backendem) -------
function mapSymbolLoose(x?: string): string | undefined {
  if (!x) return undefined;
  const v = x.toLowerCase();
  if (v.includes('us100') || v.includes('nas100')) return 'OANDA:NAS100_USD';
  if (v.includes('us500') || v.includes('spx') || v.includes('s&p')) return 'OANDA:US500_USD';
  if (v.includes('xau') || v.includes('gold') || v.includes('złoto')) return 'OANDA:XAU_USD';
  if (v.includes('wti') || v.includes('xtiusd') || v.includes('ropa')) return 'OANDA:WTICO_USD';
  if (v.includes('brent') || v.includes('bco')) return 'OANDA:BCO_USD';
  if (v.includes('eurusd') || v.includes('eur/usd')) return 'OANDA:EUR_USD';
  if (v.includes('usdjpy') || v.includes('usd/jpy')) return 'OANDA:USD_JPY';
  return undefined;
}

// ------- dostęp do danych z TickerFinnhub (localStorage) -------
type TickerQuote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };
type TickerState = Record<string, TickerQuote>;

// to samo co w TickerFinnhub
const DEFAULT_SYMBOLS = [
  'OANDA:NAS100_USD',
  'OANDA:XAU_USD',
  'OANDA:WTICO_USD',
  'OANDA:BCO_USD',
  'OANDA:EUR_USD',
  'OANDA:USD_JPY',
  'OANDA:US500_USD',
];

function tickerStorageKey(list = DEFAULT_SYMBOLS) {
  return `ticker:finnhub:v1:${list.join(',')}`;
}

function readTickerState(): TickerState {
  try {
    const key = tickerStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? (parsed as TickerState) : {};
  } catch { return {}; }
}

function decideFromPct(pct: number | undefined, threshold: number): Choice | 'unknown' {
  if (typeof pct !== 'number' || Number.isNaN(pct)) return 'unknown';
  if (pct >= threshold) return 'up';
  if (pct <= -threshold) return 'down';
  return 'flat';
}

function isWeekend(d = new Date()) {
  const wd = d.getDay(); // 0=Nd, 6=Sob
  return wd === 0 || wd === 6;
}

function parseDeadline(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.valueOf()) ? null : d;
}
function isAfterDeadline(deadlineISO?: string): boolean {
  const d = parseDeadline(deadlineISO);
  return d ? Date.now() >= d.getTime() : false;
}
function formatCountdown(deadlineISO?: string): string {
  const d = parseDeadline(deadlineISO);
  if (!d) return '';
  const ms = d.getTime() - Date.now();
  if (ms <= 0) return 'Zamknięte';
  const s = Math.floor(ms / 1000);
  const dd = Math.floor(s / 86400);
  const hh = Math.floor((s % 86400) / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const dPart = dd > 0 ? `${dd}d ` : '';
  return `${dPart}${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

export default function ChallengeClient({
  items,
  className = '',
  onBet,
}: {
  items: ChallengeItem[];
  className?: string;
  onBet?: (rec: BetRecord) => void;
}) {
  const [bets, setBets] = useState<BetsState>({});
  const [xp, setXP] = useState<number>(0);
  const [results, setResults] = useState<ResultMap>({});
  const [awarded, setAwarded] = useState<AwardedMap>({});
  const [judgeMode, setJudgeMode] = useState<boolean>(false);
  const [autoBusy, setAutoBusy] = useState<Record<string, boolean>>({});
  const [threshold, setThreshold] = useState<number>(1); // % progu
  const [nowTick, setNowTick] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // init
  useEffect(() => {
    setBets(loadBets());
    setXP(loadXP());
    setResults(loadResults());
    setAwarded(loadAwarded());
  }, []);

  // Migracja formatu po "demo" (ChallengeDemoBox) — jednorazowe czyszczenie starej struktury
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_BETS);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // demo trzymało klucze: submittedDate, last7, lastTs — nie są mapą zakładów
      const looksLikeDemo = parsed && typeof parsed === 'object' && (
        Object.prototype.hasOwnProperty.call(parsed, 'submittedDate') ||
        Object.prototype.hasOwnProperty.call(parsed, 'last7') ||
        Object.prototype.hasOwnProperty.call(parsed, 'lastTs')
      );
      if (looksLikeDemo) {
        localStorage.removeItem(LS_BETS);
        setBets({});
      }
    } catch {
      // ignore
    }
  }, []);

  // Jednorazowy cleanup w weekend: usuń dzisiejsze rozstrzygnięcia i cofnij +10 XP za trafności z dziś
  const weekendFixRun = useRef(false);
  useEffect(() => {
    if (!isWeekend() || weekendFixRun.current) return;
    // mamy już załadowane: results, awarded, xp
    weekendFixRun.current = true;

    const day = todayKey();

    // policz ile trafień z dzisiejszym kluczem ma awarded=true
    const awardedTodayCount = Object.keys(awarded).filter(k => k.endsWith(`:${day}`) && awarded[k]).length;
    if (awardedTodayCount > 0) {
      // cofnij XP za trafności (udział zostaje)
      awardXP(-10 * awardedTodayCount);
    }

    // wyczyść dzisiejsze rozstrzygnięcia
    const nextResults: ResultMap = { ...results };
    Object.keys(nextResults).forEach(k => { if (k.endsWith(`:${day}`)) delete nextResults[k]; });
    setResults(nextResults);
    saveResults(nextResults);

    // wyczyść dzisiejsze „awarded”
    const nextAwarded: AwardedMap = { ...awarded };
    Object.keys(nextAwarded).forEach(k => { if (k.endsWith(`:${day}`)) delete nextAwarded[k]; });
    setAwarded(nextAwarded);
    saveAwarded(nextAwarded);
  }, [results, awarded]);

  const totalPlaced = useMemo(() => Object.keys(bets).length, [bets]);
  const { lvl, next, toNext, progress } = useMemo(() => levelForXP(xp), [xp]);

  const awardXP = (delta: number) => {
    setXP(prev => {
      const nextXP = Math.max(0, prev + delta);
      saveXP(nextXP);
      return nextXP;
    });
  };

  const placeBet = (id: string, choice: Choice) => {
    const itemForBet = items.find(x => x.id === id);
    if (isAfterDeadline(itemForBet?.deadline)) {
      alert('To wyzwanie jest już po terminie.');
      return;
    }
    const nowISO = new Date().toISOString();
    const day = todayKey();
    setBets(prev => {
      const existed = prev[id];
      const alreadyAwardedToday = existed?.day === day;
      const rec: BetRecord = { id, choice, ts: nowISO, day };
      const nextBets = { ...prev, [id]: rec };
      saveBets(nextBets);
      if (!alreadyAwardedToday) awardXP(5);
      return nextBets;
    });
    onBet?.({ id, choice, ts: nowISO, day });
  };

  const resolveOutcome = (id: string, outcome: Choice) => {
    if (isWeekend()) return; // weekend: nie rozstrzygamy
    const itemForRes = items.find(x => x.id === id);
    if (isAfterDeadline(itemForRes?.deadline)) return; // po terminie nie rozstrzygamy
    const day = todayKey();
    const key = `${id}:${day}`;
    const nowISO = new Date().toISOString();

    setResults(prev => {
      const next = { ...prev, [key]: { outcome, ts: nowISO } };
      saveResults(next);
      return next;
    });

    setAwarded(prev => {
      if (prev[key]) return prev;
      const userBet = bets[id];
      if (userBet?.day === day && userBet.choice === outcome) {
        awardXP(10);
      }
      const next = { ...prev, [key]: true };
      saveAwarded(next);
      return next;
    });
  };

  // --- AUTO: backend (Finnhub /quote) ---
  async function autoResolve(id: string, instrument: string, thresholdPct = 1) {
    if (isWeekend()) {
      alert('Rynek jest zamknięty (weekend). Auto-rozstrzyganie będzie dostępne w dni robocze.');
      return;
    }
    const it = items.find(x => x.id === id);
    if (isAfterDeadline(it?.deadline)) {
      alert('Po terminie – auto-rozstrzyganie niedostępne.');
      return;
    }
    setAutoBusy(p => ({ ...p, [id]: true }));
    try {
      const symbol = mapSymbolLoose(instrument) || mapSymbolLoose(id) || undefined;

      const payload = {
        items: [{ id, symbol, thresholdPct }],
        instrumentHint: instrument,
        thresholdPct,
      };

      const res = await fetch('/api/challenge/auto-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({} as any));
      const row = Array.isArray(json?.results) ? json.results[0] : null;
      const decision = row?.decision as ('up'|'down'|'flat'|'unknown'|undefined);

      if (decision && decision !== 'unknown') {
        resolveOutcome(id, decision);
      } else {
        alert(row?.reason ? `Nie udało się rozstrzygnąć: ${row.reason}` : 'Nie udało się rozstrzygnąć (brak danych).');
      }
    } catch {
      alert('Błąd auto-rozstrzygania. Spróbuj ponownie.');
    } finally {
      setAutoBusy(p => ({ ...p, [id]: false }));
    }
  }

  // --- AUTO: LOKALNIE z tickera (bez API) ---
  function autoResolveLocal(id: string, instrument: string, thresholdPct = 1) {
    const it = items.find(x => x.id === id);
    if (isAfterDeadline(it?.deadline)) {
      alert('Po terminie – auto-rozstrzyganie niedostępne.');
      return;
    }
    if (isWeekend()) {
      alert('Rynek jest zamknięty (weekend). Auto-rozstrzyganie będzie dostępne w dni robocze.');
      return;
    }
    try {
      const symbol = mapSymbolLoose(instrument) || mapSymbolLoose(id);
      if (!symbol) {
        alert('Brak mapowania symbolu dla tego instrumentu.');
        return;
      }
      const state = readTickerState();
      const q = state[symbol];
      const decision = decideFromPct(q?.changePct, thresholdPct);
      if (decision === 'unknown') {
        alert('Brak danych w tickerze (odśwież stronę lub poczekaj na notowania).');
        return;
      }
      resolveOutcome(id, decision as Choice);
    } catch {
      alert('Nie udało się odczytać danych z tickera.');
    }
  }

  const resetAll = () => { setBets({}); saveBets({}); };
  const resetProgress = () => { setXP(0); saveXP(0); };
  const resetResults = () => { setResults({}); saveResults({}); setAwarded({}); saveAwarded({}); };

  const buttonBase =
    'w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/30';

  const history = useMemo(() => Object.values(bets).sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 5), [bets]);

  const day = todayKey();
  const scoreboard = useMemo(() => {
    return items.map(it => {
      const rKey = `${it.id}:${day}`;
      const bet = bets[it.id];
      const res = results[rKey];
      const gotAward = !!awarded[rKey];
      const placedToday = bet?.day === day;
      const hit = placedToday && res && bet?.choice === res.outcome;
      return {
        id: it.id, title: it.title, instrument: it.instrument,
        placedToday, betChoice: bet?.choice as Choice | undefined,
        result: res?.outcome as Choice | undefined, resolvedAt: res?.ts, awarded: gotAward, hit: !!hit,
      };
    });
  }, [items, bets, results, awarded, day]);

  const todayPlacedCount = useMemo(() => scoreboard.filter(r => r.placedToday).length, [scoreboard]);
  const todayHits = useMemo(() => scoreboard.filter(r => r.hit).length, [scoreboard]);
  const todayXpFromParticipation = todayPlacedCount * 5;
  const todayXpFromAccuracy = todayHits * 10;
  const todayXpTotal = todayXpFromParticipation + todayXpFromAccuracy;

  return (
    <div className={className}>
      {/* Pasek statusu */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm">
            <div className="font-semibold">Poziom: {lvl.name}</div>
            <div className="mt-2 h-2 w-full rounded bg-white/10 overflow-hidden">
              <div className="h-2 bg-white" style={{ width: `${progress}%` }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} />
            </div>
            <div className="mt-1 text-xs text-white/70">
              XP: <span className="font-semibold">{xp}</span>
              {next ? <> • do kolejnego poziomu: <span className="font-semibold">{toNext}</span> XP</> : <> • maksymalny poziom</>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="text-sm mr-2"><span className="text-white/70">Obstawione: </span><span className="font-semibold">{totalPlaced}</span></div>
          <label className="text-xs text-white/70 flex items-center gap-2 mr-2">
            Próg:
            <select
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="bg-white/10 border border-white/15 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value={0.5}>0.5%</option>
              <option value={1}>1%</option>
              <option value={2}>2%</option>
            </select>
          </label>
          <button type="button" onClick={() => setJudgeMode(v => !v)} className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-white/30 ${judgeMode ? 'bg-white text-slate-900 border-black/10' : 'bg-white/10 hover:bg-white/20 border-white/15'}`} title="Włącz/wyłącz tryb sędziego">
            {judgeMode ? 'Sędzia: WŁ.' : 'Sędzia: WYŁ.'}
          </button>
          <button type="button" onClick={resetAll} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30" title="Wyczyść wszystkie zakłady">Reset zakładów</button>
          <button type="button" onClick={resetProgress} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30" title="Wyzeruj XP i poziom">Reset punktów</button>
          <button type="button" onClick={resetResults} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30" title="Usuń dzisiejsze rozstrzygnięcia (lokalnie)">Reset wyników</button>
        </div>
      </div>

      {/* Lista wyzwań */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((c) => {
          const current = bets[c.id]?.choice;
          const rKey = `${c.id}:${day}`;
          const resolved = results[rKey];
          const wasAwarded = !!awarded[rKey];
          const busy = !!autoBusy[c.id];
          const weekend = isMounted ? isWeekend() : false;
          const closed = isMounted ? isAfterDeadline(c.deadline) : false;
          const countdown = isMounted ? formatCountdown(c.deadline) : '';

          return (
            <article key={c.id} className="rounded-2xl p-5 bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 min-w-0">
              <div className="text-xs text-white/60">{c.window}</div>
              <h3 className="mt-1 text-lg font-semibold">{c.title}</h3>
              {weekend && (
                <div className="mt-2 text-[10px] text-white/60">Rynek zamknięty • auto-rozstrzyganie dostępne w dni robocze</div>
              )}
              <div className="mt-1 text-white/70 text-sm">Instrument: <span className="font-medium">{c.instrument}</span></div>
              {c.note ? <p className="mt-3 text-sm text-white/70">{c.note}</p> : null}

              {/* Licznik i stan terminu */}
              {c.deadline && (
                <div className="mt-3 text-xs">
                  {closed ? (
                    <span className="text-white/50">Zamknięte — po terminie</span>
                  ) : (
                    <span className="text-white/70">Do zamknięcia: <span className="font-semibold" suppressHydrationWarning>{countdown}</span></span>
                  )}
                </div>
              )}

              {/* Przyciski obstawienia */}
              <div className="mt-5 grid grid-cols-3 gap-3 place-items-center">
                <button
                  className={`${buttonBase} ${current === 'up'
                    ? 'bg-emerald-500/25 border-emerald-400/40'
                    : 'bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-500/25'}`}
                  onClick={() => placeBet(c.id, 'up')}
                  aria-pressed={current === 'up'}
                  aria-label="Wzrost"
                  title="Wzrost"
                  disabled={closed}
                >
                  ⬆️
                </button>
                <button
                  className={`${buttonBase} ${current === 'flat'
                    ? 'bg-white/15 border-white/25'
                    : 'bg-white/10 border-white/15 hover:bg-white/15'}`}
                  onClick={() => placeBet(c.id, 'flat')}
                  aria-pressed={current === 'flat'}
                  aria-label="Neutralnie"
                  title="Neutralnie"
                  disabled={closed}
                >
                  ➡️
                </button>
                <button
                  className={`${buttonBase} ${current === 'down'
                    ? 'bg-rose-500/25 border-rose-400/40'
                    : 'bg-rose-500/20 border-rose-400/30 hover:bg-rose-500/25'}`}
                  onClick={() => placeBet(c.id, 'down')}
                  aria-pressed={current === 'down'}
                  aria-label="Spadek"
                  title="Spadek"
                  disabled={closed}
                >
                  ⬇️
                </button>
              </div>

              {/* Stan + wynik */}
              <div className="mt-4 text-xs text-white/70 space-y-1">
                <div>
                  {current ? <>Twój wybór: <span className="font-semibold">{current === 'up' ? 'Wzrost' : current === 'flat' ? 'Neutralnie' : 'Spadek'}</span> <span className="text-white/50" suppressHydrationWarning>({prettyWhen(bets[c.id]?.ts)})</span></> : 'Wybierz scenariusz, aby zapisać swój typ.'}
                </div>
                {resolved ? (
                  <div>
                    Wynik: <span className="font-semibold">{betLabel(resolved.outcome)}</span> <span className="text-white/50" suppressHydrationWarning>({prettyWhen(resolved.ts)})</span>
                    {current ? (<span className="ml-2">{current === resolved.outcome ? (<span className="text-emerald-300 font-semibold">+10 XP</span>) : (<span className="text-white/50">0 XP</span>)}{wasAwarded ? <span className="text-white/40"> (przyznano)</span> : null}</span>) : null}
                  </div>
                ) : (
                  <div className="text-white/50">Wynik nie został jeszcze rozstrzygnięty.</div>
                )}
              </div>

              {/* Panel sędziego + AUTO */}
              {judgeMode && (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button disabled={closed || weekend} className="text-xs px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-60" onClick={() => resolveOutcome(c.id, 'up')} title={closed ? 'Po terminie — rozstrzyganie zamknięte' : (weekend ? 'Weekend — wróć w dni robocze' : 'Ustal wynik')}>Ustal: ⬆️</button>
                    <button disabled={closed || weekend} className="text-xs px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60" onClick={() => resolveOutcome(c.id, 'flat')} title={closed ? 'Po terminie — rozstrzyganie zamknięte' : (weekend ? 'Weekend — wróć w dni robocze' : 'Ustal wynik')}>Ustal: ➡️</button>
                    <button disabled={closed || weekend} className="text-xs px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-400/40 disabled:opacity-60" onClick={() => resolveOutcome(c.id, 'down')} title={closed ? 'Po terminie — rozstrzyganie zamknięte' : (weekend ? 'Weekend — wróć w dni robocze' : 'Ustal wynik')}>Ustal: ⬇️</button>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy || closed || weekend}
                      onClick={() => autoResolve(c.id, c.instrument, threshold)}
                      className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
                      title={closed ? 'Po terminie — rozstrzyganie zamknięte' : (weekend ? 'Weekend — wróć w dni robocze' : 'Pobierz dane z Finnhub i rozstrzygnij wg progu')}
                    >
                      {busy ? 'Auto (API)…' : 'Auto rozstrzygnij — Finnhub'}
                    </button>
                    <button
                      type="button"
                      disabled={closed || weekend}
                      onClick={() => autoResolveLocal(c.id, c.instrument, threshold)}
                      className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
                      title={closed ? 'Po terminie — rozstrzyganie zamknięte' : (weekend ? 'Weekend — wróć w dni robocze' : 'Użyj ostatniej zmiany % z paska ticker')}
                    >
                      Auto rozstrzygnij — z tickera
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      {/* Mini-historia */}
      {history.length > 0 && (
        <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-5">
          <h3 className="text-lg font-semibold mb-3">Ostatnie decyzje</h3>
          <ul className="divide-y divide-white/10 text-sm">
            {history.map((h) => (
              <li key={h.id + h.ts} className="py-2 flex items-center justify-between">
                <div><span className="font-semibold">{h.id.toUpperCase()}</span> — {betLabel(h.choice)}</div>
                <div className="text-white/50 text-xs">{prettyWhen(h.ts)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TABLICA WYNIKÓW DNIA */}
      <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Wyniki dnia ({day})</h3>
          <div className="text-sm text-white/70">
            Dziś: udział +{todayXpFromParticipation} XP, trafność +{todayXpFromAccuracy} XP → <span className="font-semibold text-white">{todayXpTotal} XP</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="[&>th]:py-2 [&>th]:px-2 text-left">
                <th>Wyzwanie</th><th>Instrument</th><th>Twój typ</th><th>Wynik</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {scoreboard.map(row => (
                <tr key={row.id} className="[&>td]:py-2 [&>td]:px-2">
                  <td className="font-medium">{row.title}</td>
                  <td className="text-white/70">{row.instrument}</td>
                  <td className="text-white/70">{row.placedToday && row.betChoice ? betLabel(row.betChoice) : <span className="text-white/40">—</span>}</td>
                  <td className="text-white/70">{row.result ? betLabel(row.result) : <span className="text-white/40">—</span>}</td>
                  <td>
                    {row.result ? (
                      row.placedToday ? (row.hit ? <span className="text-emerald-300 font-semibold">trafione (+10)</span> : <span className="text-rose-300 font-semibold">pudło (0)</span>)
                      : <span className="text-white/50">brak udziału</span>
                    ) : <span className="text-white/50">oczekuje</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-white/50">Punktacja i wyniki są zapisywane lokalnie (demo). Po podpięciu backendu będzie można publikować dzienny ranking globalny.</p>
      </div>
    </div>
  );
}
