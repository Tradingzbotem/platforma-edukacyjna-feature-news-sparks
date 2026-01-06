'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNewsDigest } from '../hooks/useNewsDigest';
import { usePickStore, type UserPick } from '../hooks/usePickStore';
import { useXPStore } from '../hooks/useXPStore';
import { suggestConfidenceFromNews } from '../lib/confidence';

export type ChallengeStatus = 'open' | 'settling' | 'closed';

export type NewsDigestItem = {
  title: string;
  source?: string;
  link?: string;
};

export type ChallengeCardProps = {
  title: string;
  ticker: string;
  horizon: string;
  deadlineMs: number;
  nextRefreshByMs?: number;
  newsDigest?: NewsDigestItem[];
  autoNewsFor?: string[];
  status?: ChallengeStatus;
  /** JEŚLI chcesz nadpisać unikalny klucz wyboru (domyślnie liczony z ticker+horizon+deadline) */
  challengeKeyOverride?: string;
  userId: string;
  onPick?: (dir: 'up' | 'down' | 'flat', confidence: number) => void;
};

export default function ChallengeCard({
  title,
  ticker,
  horizon,
  deadlineMs,
  nextRefreshByMs,
  newsDigest,
  autoNewsFor,
  status: initialStatus = 'open',
  challengeKeyOverride,
  userId,
  onPick,
}: ChallengeCardProps) {
  const [confidence, setConfidence] = useState<number>(70);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState<ChallengeStatus>(initialStatus);

  /* ─── unikalny klucz wyboru (stabilny per runda) ─── */
  const challengeKey = useMemo(
    () => challengeKeyOverride ?? `${ticker}|${horizon}|${deadlineMs}`,
    [challengeKeyOverride, ticker, horizon, deadlineMs]
  );

  /* ─── storage wyboru ─── */
  const { pick, setPick } = usePickStore(challengeKey);

  /* ─── XP store ─── */
  const { addXP } = useXPStore();

  // znacznik 'czy wynik wysłany' (na LS), żeby nie duplikować POST
  const resultFlagKey = `fxedu:challenge:resultPosted:${challengeKey}`;
  function isResultPosted() {
    try { return localStorage.getItem(resultFlagKey) === '1'; } catch { return false; }
  }
  function markResultPosted() {
    try { localStorage.setItem(resultFlagKey, '1'); } catch {}
  }

  /* ─── TIMER ─── */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ─── CZAS ─── */
  const msLeft = Math.max(0, deadlineMs - now);
  const timeLeft = useMemo(() => formatTimeLeft(msLeft), [msLeft]);

  const refreshLeft = useMemo(() => {
    if (!nextRefreshByMs) return null;
    const left = Math.max(0, nextRefreshByMs - now);
    return formatTimeLeft(left);
  }, [nextRefreshByMs, now]);

  /* ─── STATUS wg czasu ─── */
  useEffect(() => {
    if (now >= deadlineMs && now < (nextRefreshByMs ?? 0)) {
      setStatus('settling');
    } else if (nextRefreshByMs && now >= nextRefreshByMs) {
      setStatus('closed');
    } else if (now < deadlineMs) {
      setStatus('open');
    }
  }, [now, deadlineMs, nextRefreshByMs]);

  /* ─── SCORING: po przejściu na closed, jeśli był pick, i nie wysłano jeszcze ─── */
  useEffect(() => {
    if (status === 'closed' && pick && !isResultPosted()) {
      // 1) Ustal wynik (na razie symulacja – do czasu, aż podepniemy realne ceny)
      const outcome = simulateOutcome(ticker);

      // 2) Policz "realny" XP wg uzgodnionych zasad:
      //    baza: trafienie +10, remis +3; bonus +1 (≥70%) lub +2 (≥90%) tylko przy trafieniu
      let xpAwarded = 0;
      if (outcome === pick.dir) {
        xpAwarded = 10 + (pick.confidence >= 90 ? 2 : pick.confidence >= 70 ? 1 : 0);
      } else if (outcome === 'flat' || pick.dir === 'flat') {
        xpAwarded = 3;
      } else {
        xpAwarded = 0;
      }

      // 3) Lokalnie dodaj XP (pasek)
      addXP(xpAwarded);

      // 4) Zapisz wynik do Neon
      fetch('/api/challenge/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anon',
          challengeKey,
          outcome,
          xpAwarded,
        }),
      })
        .then(() => markResultPosted())
        .catch((err) => console.warn('Result save failed', err));
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── AUTO NEWS ─── */
  const { digest, loading } = useNewsDigest({
    aliases: autoNewsFor ?? [],
    limit: 3,
  });

  const effectiveDigest: NewsDigestItem[] | undefined =
    (newsDigest && newsDigest.length > 0 ? newsDigest : undefined) ??
    (digest && digest.length > 0 ? digest : undefined);

  const disabled = status !== 'open' || msLeft <= 0 || !!pick;

  // ustaw aut. sugestię pewności na bazie skrótu News (po załadowaniu)
  useEffect(() => {
    if (!effectiveDigest || effectiveDigest.length === 0) return;
    if (pick) return; // nie nadpisuj, jeśli użytkownik już wybrał
    const s = suggestConfidenceFromNews(
      effectiveDigest.map((d) => ({ title: d.title }))
    );
    setSuggested(s);
    setConfidence(s);
  }, [effectiveDigest, pick]);

  /* ─── handler zapisu wyboru ─── */
  function handlePick(dir: 'up' | 'down' | 'flat') {
    const payload: UserPick = { dir, confidence, ts: Date.now() };
    setPick(payload);
    // zapis do backendu Neon
    fetch('/api/challenge/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId || 'anon',
        ticker,
        direction: dir,
        confidence,
        xp: 0, // XP przyznajemy później po rozliczeniu
        challengeKey, // <<<<<< KLUCZ RUNDY
      }),
    }).catch((err) => console.warn('Neon save failed', err));
    onPick?.(dir, confidence);
  }

  return (
    <div className="group h-full rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md motion-reduce:transition-none">
      <div className="flex h-full min-h-[340px] flex-col p-4 sm:min-h-[320px]">
        {/* HEADER */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600">
              Instrument: <span className="font-medium">{ticker}</span> • Horyzont: {horizon}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* COUNTDOWNS + Twój typ */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {status === 'open' && (
            <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-1">
              Do zamknięcia: <span className="font-semibold" suppressHydrationWarning>{timeLeft}</span>
            </span>
          )}
          {status === 'settling' && (
            <span className="rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-1">
              Rozliczanie… {refreshLeft ? (<span suppressHydrationWarning>(≤ {refreshLeft})</span>) : ''}
            </span>
          )}
          {status === 'closed' && (
            <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-1">
              Zakończone – nowa runda wkrótce
            </span>
          )}

          {pick && (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-slate-900">
              Twój typ: <b>{dirLabel(pick.dir)}</b> <span className="opacity-80">({pick.confidence}%)</span>
            </span>
          )}
        </div>

        {/* NEWS DIGEST */}
        <div className="mb-3 min-h-[84px] max-h-[110px] overflow-hidden sm:min-h-[72px] sm:max-h-[96px]">
          {loading && !effectiveDigest && (
            <div className="animate-pulse rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
              Ładuję skrót z News…
            </div>
          )}

          {!loading && effectiveDigest && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {effectiveDigest.slice(0, 3).map((n, i) => (
                <li key={i} className="marker:text-slate-400">
                  {n.link ? (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      title={n.source || 'Źródło'}
                    >
                      {n.title}
                    </a>
                  ) : (
                    n.title
                  )}
                  {n.source && <span className="ml-2 text-xs opacity-60">({n.source})</span>}
                </li>
              ))}
            </ul>
          )}

          {!loading && !effectiveDigest && (
            <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-600">
              Brak skrótu z News — pojawi się automatycznie, gdy system zbierze nagłówki.
            </div>
          )}
        </div>

        {/* SPACER */}
        <div className="mt-auto" />

        {/* CONTROLS */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick('up')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 md:py-2"
                title="Wybierz: wzrost"
              >
                ↑ Wzrost
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick('flat')}
                className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 disabled:opacity-50 md:py-2"
                title="Wybierz: bez zmian (↔)"
              >
                ↔ Bez zmian
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePick('down')}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 md:py-2"
                title="Wybierz: spadek"
              >
                ↓ Spadek
              </button>
            </div>

            <div className="grid w-full gap-1 md:w-64">
              <label className="text-xs text-slate-600">
                Pewność prognozy: <span className="font-medium">{confidence}%</span>
                {suggested !== null && (
                  <span className="ml-1 text-[11px] opacity-70">(Sugestia AI: {suggested}%)</span>
                )}
              </label>
              <input
                type="range"
                min={50}
                max={90}
                step={1}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                disabled={disabled}
                className="accent-blue-400"
                aria-label="Pewność prognozy"
                title="50–90% (Sugestia AI to start – możesz zmienić)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── helpers ───────────────── */

function StatusBadge({ status }: { status: ChallengeStatus }) {
  const map: Record<ChallengeStatus, { label: string; cls: string }> = {
    open: { label: 'otwarte', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    settling: { label: 'rozliczanie', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    closed: { label: 'zakończone', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function formatTimeLeft(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function dirLabel(d: 'up' | 'down' | 'flat') {
  if (d === 'up') return '↑ Wzrost';
  if (d === 'down') return '↓ Spadek';
  return '↔ Bez zmian';
}

function simulateOutcome(ticker: string): 'up' | 'down' | 'flat' {
  const arr: Array<'up' | 'down' | 'flat'> = ['up', 'down', 'flat'];
  return arr[Math.floor(Math.random() * arr.length)];
}
