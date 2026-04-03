/**
 * FXEDULAB /client — tier widoczny w hubie i centrum decyzji.
 *
 * Źródło prawdy konta: kolumna `users.plan` (free | starter | pro | elite).
 * Mapowanie na UI produktu:
 *   free    → brak NFT / brak centrum decyzji
 *   starter → founders (dostęp do centrum decyzji) — ustawiane z admina jako „Founders”
 *   pro     → founders (ten sam widok co starter; legacy)
 *   elite   → elite
 *
 * Nadpisanie `?tier=` działa tylko gdy `allowsClientPanelTierQueryOverride()` === true
 * (development albo CLIENT_PANEL_ALLOW_TIER_QUERY=1 w produkcji).
 */

export type PanelUserTier = "free" | "founders" | "elite";

export type DbSubscriptionPlan = "free" | "starter" | "pro" | "elite";

export function parsePanelTierParam(raw: string | null): PanelUserTier | null {
  if (raw === null || raw === "") return null;
  const v = raw.toLowerCase();
  if (v === "free" || v === "founders" || v === "elite") return v;
  return null;
}

export function normalizeDbPlan(raw: string | null | undefined): DbSubscriptionPlan {
  if (raw === "elite" || raw === "pro" || raw === "starter" || raw === "free") {
    return raw;
  }
  return "free";
}

/** Tier panelu FXEDULAB z planu konta w bazie. */
export function panelUserTierFromDbPlan(plan: string | null | undefined): PanelUserTier {
  const p = normalizeDbPlan(plan);
  if (p === "elite") return "elite";
  if (p === "starter" || p === "pro") return "founders";
  return "free";
}

/**
 * Zapis z admina (Free / Founders / Elite) → wartość w `users.plan`.
 * Founders zapisujemy jako `starter` (kanoniczny plan „NFT / founders”).
 */
export function panelTierToDbPlan(tier: PanelUserTier): DbSubscriptionPlan {
  if (tier === "elite") return "elite";
  if (tier === "founders") return "starter";
  return "free";
}

export function allowsClientPanelTierQueryOverride(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.CLIENT_PANEL_ALLOW_TIER_QUERY === "1";
}
