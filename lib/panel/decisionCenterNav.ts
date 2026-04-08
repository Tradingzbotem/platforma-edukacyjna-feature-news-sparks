/** Query marker: user opened this EDU module from /client/decision-center (not from Founders panel). */
export const PANEL_FROM_QUERY_KEY = "from";
export const PANEL_FROM_DECISION_CENTER = "decision-center";

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export function isFromDecisionCenter(sp: Record<string, string | string[] | undefined>): boolean {
  return firstString(sp[PANEL_FROM_QUERY_KEY]) === PANEL_FROM_DECISION_CENTER;
}

/** Return URL to decision center, preserving QA `?tier=`. */
export function decisionCenterHubHref(sp: Record<string, string | string[] | undefined>): string {
  const tier = firstString(sp.tier);
  if (tier === "free" || tier === "founders" || tier === "elite") {
    return `/client/decision-center?tier=${encodeURIComponent(tier)}`;
  }
  return "/client/decision-center";
}

export type ResolvedPanelModuleNav = {
  midHref: string;
  midLabel: string;
  backHref: string;
  backLabel: string;
  /** When true, layout already shows „back” — hide duplicate row on the page. */
  hideSecondaryBackRow: boolean;
};

export function resolvePanelModuleNav(sp: Record<string, string | string[] | undefined>): ResolvedPanelModuleNav {
  if (isFromDecisionCenter(sp)) {
    const h = decisionCenterHubHref(sp);
    return {
      midHref: h,
      midLabel: "Centrum decyzji",
      backHref: h,
      backLabel: "← Wróć do centrum decyzji",
      hideSecondaryBackRow: true,
    };
  }
  return {
    midHref: "/konto/panel-rynkowy",
    midLabel: "Panel (EDU)",
    backHref: "/konto/panel-rynkowy",
    backLabel: "← Wróć do Panelu (EDU)",
    hideSecondaryBackRow: false,
  };
}

export function buildPanelModuleDeepLink(opts: {
  path: string;
  asset: string;
  timeframe: string;
  tierQuerySuffix: string;
}): string {
  const params = new URLSearchParams();
  params.set("asset", opts.asset);
  params.set("timeframe", opts.timeframe);
  params.set(PANEL_FROM_QUERY_KEY, PANEL_FROM_DECISION_CENTER);
  const tierPart = opts.tierQuerySuffix.replace(/^\?/, "");
  if (tierPart) {
    new URLSearchParams(tierPart).forEach((v, k) => {
      params.set(k, v);
    });
  }
  const q = params.toString();
  return q ? `${opts.path}?${q}` : opts.path;
}
