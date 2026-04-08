"use client";

import { useEffect, useState } from "react";

import type { ClientKursyMainProgressPayload } from "@/lib/client/kursyMainProgressTypes";

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: ClientKursyMainProgressPayload }
  | { status: "error" };

/**
 * Postęp głównych modułów kursów (GET /api/client/kursy-main-progress).
 */
export function useKursyMainProgress(enabled: boolean): State {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetch("/api/client/kursy-main-progress", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) throw new Error("unauthorized");
        if (!r.ok) throw new Error(`http_${r.status}`);
        return r.json() as Promise<ClientKursyMainProgressPayload>;
      })
      .then((data) => {
        if (cancelled) return;
        if (
          typeof data?.completedLessons !== "number" ||
          typeof data?.totalLessons !== "number" ||
          typeof data?.nextLearnHref !== "string" ||
          typeof data?.allMainCoursesComplete !== "boolean"
        ) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return { status: "idle" };
  /** Pierwszy render po włączeniu — zanim useEffect ustawi loading. */
  if (state.status === "idle") return { status: "loading" };
  return state;
}
