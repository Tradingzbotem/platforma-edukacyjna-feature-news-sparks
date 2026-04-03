'use client';

import React, { useEffect, useState } from 'react';
import { type UserPick } from '../hooks/usePickStore';

type LocalMap = Record<string, UserPick>;

type PickResult = {
  challenge_key: string | null;
  outcome: 'up' | 'down' | 'flat' | null;
  xp_awarded: number | null;
  settled_at: string | null;
};

const LS_KEY = 'fxedu:challenge:picks:v1';

function readPicks(): LocalMap {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function parseChallengeKey(key: string): { ticker: string; horizon: string; deadlineMs: number } | null {
  const parts = key.split('|');
  if (parts.length !== 3) return null;
  const [ticker, horizon, deadlineStr] = parts;
  const deadlineMs = parseInt(deadlineStr, 10);
  if (isNaN(deadlineMs)) return null;
  return { ticker, horizon, deadlineMs };
}

function formatDate(ms: number): string {
  // Only format on client to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return '';
  }
  
  const date = new Date(ms);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const pickDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (pickDate.getTime() === today.getTime()) {
    return `Dzisiaj ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (pickDate.getTime() === yesterday.getTime()) {
    return `Wczoraj ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function YourPicks() {
  // Start with empty state to avoid hydration mismatch
  const [picks, setPicks] = useState<LocalMap>({});
  const [results, setResults] = useState<Record<string, PickResult>>({});
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch results from API
  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/challenge/picks', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const resultsMap: Record<string, PickResult> = {};
          for (const row of data) {
            if (row.challenge_key) {
              resultsMap[row.challenge_key] = {
                challenge_key: row.challenge_key,
                outcome: row.outcome,
                xp_awarded: row.xp_awarded,
                settled_at: row.settled_at,
              };
            }
          }
          setResults(resultsMap);
        }
      } catch (err) {
        console.warn('Failed to fetch pick results', err);
      }
    }

    if (mounted) {
      fetchResults();
      // Refresh results every 30 seconds
      const interval = setInterval(fetchResults, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  useEffect(() => {
    // Mark as mounted and load initial data (only once)
    setMounted(true);
    setPicks(readPicks());

    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setPicks(readPicks());
      }
    };

    // Poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(() => {
      const current = readPicks();
      setPicks((prev) => {
        const prevStr = JSON.stringify(prev);
        const currentStr = JSON.stringify(current);
        if (prevStr !== currentStr) {
          return current;
        }
        return prev;
      });
    }, 500);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once on mount

  // Calculate keys before conditional rendering
  const allKeys = Object.keys(picks)
    .sort((a, b) => (picks[b]?.ts ?? 0) - (picks[a]?.ts ?? 0));
  
  const displayKeys = isExpanded ? allKeys : allKeys.slice(0, 5);
  const hasMore = allKeys.length > 5;

  // Don't render content until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-center font-semibold text-white">Twoje typy</h3>
        <p className="text-center text-xs text-white/60 py-4">
          Ładowanie...
        </p>
      </div>
    );
  }

  if (allKeys.length === 0)
    return (
      <p className="text-center text-xs text-white/60 mt-6">
        Brak zapisanych typów na dzisiaj.
      </p>
    );

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-center font-semibold text-white flex-1">
          Twoje typy ({allKeys.length})
        </h3>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-xs text-white/70 hover:text-white underline underline-offset-2"
          >
            {isExpanded ? 'Zwiń' : `Pokaż wszystkie (${allKeys.length})`}
          </button>
        )}
      </div>
      <ul className="divide-y divide-white/10 text-sm leading-6">
        {displayKeys.map((k) => {
          const p = picks[k];
          const parsed = parseChallengeKey(k);
          const result = results[k];
          const isCorrect = result?.outcome && result.outcome === p.dir;
          const isSettled = result?.settled_at !== null;
          
          // Sprawdź czy challenge się już zakończył (deadline minął)
          const now = Date.now();
          const isDeadlinePassed = parsed ? now >= parsed.deadlineMs : false;
          const shouldShowResult = isSettled || isDeadlinePassed;
          
          return (
            <li key={k} className="flex flex-col gap-1 py-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  {parsed ? (
                    <>
                      <div className="text-white font-medium">
                        {parsed.ticker} • {parsed.horizon}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {formatDate(p.ts)}
                      </div>
                    </>
                  ) : (
                    <span className="text-white truncate">{k}</span>
                  )}
                </div>
                <div className="ml-3 flex flex-col items-end gap-1">
                  <span className={`font-semibold whitespace-nowrap ${
                    p.dir === 'up' ? 'text-emerald-300' :
                    p.dir === 'down' ? 'text-rose-300' :
                    'text-yellow-300'
                  }`}>
                  {dirLabel(p.dir)} ({p.confidence}%)
                </span>
                  {shouldShowResult && (
                    <div className="flex flex-col items-end gap-0.5">
                      {result?.outcome ? (
                        <>
                          <span className={`text-xs font-medium ${
                            isCorrect ? 'text-emerald-300' : 
                            result.outcome === 'flat' || p.dir === 'flat' ? 'text-yellow-300' :
                            'text-rose-300'
                          }`}>
                            Wynik: {dirLabel(result.outcome)}
                            {isCorrect && ' ✓'}
                          </span>
                          {result.xp_awarded !== null && result.xp_awarded > 0 && (
                            <span className="text-xs text-emerald-300 font-semibold">
                              +{result.xp_awarded} XP
                            </span>
                          )}
                        </>
                      ) : isDeadlinePassed ? (
                        <span className="text-xs text-white/50 italic">
                          Oczekiwanie na wynik...
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function dirLabel(d: 'up' | 'down' | 'flat') {
  if (d === 'up') return '↑ Wzrost';
  if (d === 'down') return '↓ Spadek';
  return '↔ Bez zmian';
}
