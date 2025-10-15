'use client';

import { useCallback, useEffect, useState } from 'react';

export type PickDir = 'up' | 'down' | 'flat';
export type UserPick = {
  dir: PickDir;
  confidence: number; // 50..90
  ts: number; // ms
};

/** Klucz LS (wersjonowany) */
const LS_KEY = 'fxedu:challenge:picks:v1';

function readAll(): Record<string, UserPick> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UserPick>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, UserPick>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    // ignorujemy błędy quota itp. (demo)
  }
}

/** Hook do obsługi pojedynczego wpisu wg klucza */
export function usePickStore(key: string) {
  const [pick, setPickState] = useState<UserPick | null>(null);

  useEffect(() => {
    const all = readAll();
    setPickState(all[key] ?? null);
  }, [key]);

  const setPick = useCallback((val: UserPick) => {
    const all = readAll();
    all[key] = val;
    writeAll(all);
    setPickState(val);
  }, [key]);

  const clearPick = useCallback(() => {
    const all = readAll();
    delete all[key];
    writeAll(all);
    setPickState(null);
  }, [key]);

  return { pick, setPick, clearPick };
}
