import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  allowsClientPanelTierQueryOverride,
  normalizeDbPlan,
  panelUserTierFromDbPlan,
  parsePanelTierParam,
} from "@/lib/client/panelTier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Zwraca tier FXEDULAB dla zalogowanego użytkownika.
 * Opcjonalnie `?tier=free|founders|elite` — tylko gdy dozwolone (dev lub CLIENT_PANEL_ALLOW_TIER_QUERY=1).
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const allowQ = allowsClientPanelTierQueryOverride();
  const qTier = parsePanelTierParam(req.nextUrl.searchParams.get("tier"));
  if (qTier && allowQ) {
    return NextResponse.json({
      tier: qTier,
      plan: null,
      source: "query_override" as const,
      tierQuerySuffix: `?tier=${encodeURIComponent(qTier)}`,
      qaTierQueryAllowed: allowQ,
    });
  }

  const user = await findUserById(session.userId).catch(() => null);
  const plan = normalizeDbPlan(user?.plan);
  const tier = panelUserTierFromDbPlan(plan);

  return NextResponse.json({
    tier,
    plan,
    source: "account" as const,
    tierQuerySuffix: "",
    qaTierQueryAllowed: allowQ,
  });
}
