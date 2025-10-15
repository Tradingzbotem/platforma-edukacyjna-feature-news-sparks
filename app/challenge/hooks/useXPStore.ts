'use client';

import { useEffect, useState, useCallback } from 'react';

/** XP lokalny, zapisywany w localStorage */
const LS_KEY = 'fxedu:challenge:xp:v1';

export type Level = {
  name: string;
  threshold: number; // XP required to reach
};

const LEVELS: Level[] = [
  { name: 'Trader-nowicjusz', threshold: 0 },
  { name: 'Trader-praktykant', threshold: 50 },
  { name: 'Trader-analityk', threshold: 200 },
  { name: 'Trader-mentor', threshold: 500 },
  { name: 'Trader-mistrz', threshold: 1000 },
];

function readXP(): number {
  try {
    const val = localStorage.getItem(LS_KEY);
    return val ? parseInt(val) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeXP(xp: number) {
  try {
    localStorage.setItem(LS_KEY, String(xp));
  } catch {}
}

/** Hook zarządzający punktacją */
export function useXPStore() {
  const [xp, setXP] = useState(0);

  useEffect(() => {
    setXP(readXP());
  }, []);

  const addXP = useCallback((delta: number) => {
    setXP((prev) => {
      const next = Math.max(0, prev + delta);
      writeXP(next);
      return next;
    });
  }, []);

  const resetXP = useCallback(() => {
    setXP(0);
    writeXP(0);
  }, []);

  const currentLevel = LEVELS.reduce((acc, lvl) => (xp >= lvl.threshold ? lvl : acc), LEVELS[0]);
  const nextLevel = LEVELS.find((l) => l.threshold > xp);
  const progress =
    nextLevel && nextLevel.threshold > currentLevel.threshold
      ? ((xp - currentLevel.threshold) /
          (nextLevel.threshold - currentLevel.threshold)) *
        100
      : 100;

  return { xp, addXP, resetXP, currentLevel, nextLevel, progress };
}
