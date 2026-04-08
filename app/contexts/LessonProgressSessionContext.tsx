"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type LessonProgressSessionValue = {
  /** `null` = gość lub brak userId w sesji */
  userId: string | null;
  /** Po pierwszym odczycie `/api/auth/session` — zanim to true, komponenty nie powinny pisać do localStorage. */
  sessionReady: boolean;
};

const LessonProgressSessionContext = createContext<LessonProgressSessionValue>({
  userId: null,
  sessionReady: false,
});

export function LessonProgressSessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setUserId(typeof d?.userId === "string" ? d.userId : null);
        setSessionReady(true);
      })
      .catch(() => {
        if (!cancelled) setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ userId, sessionReady }), [userId, sessionReady]);

  return (
    <LessonProgressSessionContext.Provider value={value}>{children}</LessonProgressSessionContext.Provider>
  );
}

export function useLessonProgressSession() {
  return useContext(LessonProgressSessionContext);
}
