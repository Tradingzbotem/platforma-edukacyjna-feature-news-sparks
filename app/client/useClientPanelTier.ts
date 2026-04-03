"use client";

import { useEffect, useState } from "react";
import type { DbSubscriptionPlan, PanelUserTier } from "@/lib/client/panelTier";

export type ClientPanelApiPayload = {
  tier: PanelUserTier;
  plan: DbSubscriptionPlan | null;
  source: "account" | "query_override";
  tierQuerySuffix: string;
  qaTierQueryAllowed: boolean;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & ClientPanelApiPayload);

/**
 * Pobiera tier z GET /api/client/me/panel (sesja + users.plan).
 * Jeśli w URL jest `?tier=` i środowisko na to pozwala, API zwraca override (QA).
 */
export function useClientPanelTier(tierFromUrl: string | null): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    const q = tierFromUrl?.trim();
    const url =
      q && (q === "free" || q === "founders" || q === "elite")
        ? `/api/client/me/panel?tier=${encodeURIComponent(q)}`
        : "/api/client/me/panel";

    fetch(url, { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) {
          throw new Error("Sesja wygasła — zaloguj się ponownie.");
        }
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `HTTP ${r.status}`);
        }
        return r.json() as Promise<ClientPanelApiPayload>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ready", ...data });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Nie udało się odczytać dostępu.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [tierFromUrl]);

  return state;
}
