'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type KontoExamLockContextValue = {
  examLocked: boolean;
  setExamLocked: (locked: boolean) => void;
};

const KontoExamLockContext = createContext<KontoExamLockContextValue | null>(null);

export function KontoExamLockProvider({ children }: { children: ReactNode }) {
  const [examLocked, setExamLocked] = useState(false);
  const value = useMemo(() => ({ examLocked, setExamLocked }), [examLocked]);
  return <KontoExamLockContext.Provider value={value}>{children}</KontoExamLockContext.Provider>;
}

export function useKontoExamLock(): KontoExamLockContextValue {
  const ctx = useContext(KontoExamLockContext);
  if (!ctx) {
    throw new Error('useKontoExamLock must be used within KontoExamLockProvider');
  }
  return ctx;
}

/** Dla komponentów poza providerem (np. testy) — bezpieczny odczyt bez rzucania. */
export function useKontoExamLockOptional(): KontoExamLockContextValue | null {
  return useContext(KontoExamLockContext);
}
