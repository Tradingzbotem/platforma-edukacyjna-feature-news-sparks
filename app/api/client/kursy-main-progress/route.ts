import { NextResponse } from "next/server";

import type { ClientKursyMainProgressPayload } from "@/lib/client/kursyMainProgressTypes";
import { KURSY_MAIN_SLUGS, getKursyMainModulesProgress } from "@/lib/kursyProgress";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type { ClientKursyMainProgressPayload } from "@/lib/client/kursyMainProgressTypes";

/**
 * Agregowany postęp głównych modułów /kursy (podstawy, forex, cfd, zaawansowane) — do panelu klienta.
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const map = await getKursyMainModulesProgress(session.userId);

  let completedLessons = 0;
  let totalLessons = 0;
  for (const slug of KURSY_MAIN_SLUGS) {
    const m = map.get(slug);
    if (!m) continue;
    completedLessons += m.doneLessons;
    totalLessons += m.totalLessons;
  }

  let nextLearnHref = "/kursy";
  for (const slug of KURSY_MAIN_SLUGS) {
    const m = map.get(slug);
    if (m && m.state !== "completed") {
      nextLearnHref = m.actionHref;
      break;
    }
  }

  const allMainCoursesComplete = totalLessons > 0 && completedLessons >= totalLessons;

  const payload: ClientKursyMainProgressPayload = {
    completedLessons,
    totalLessons,
    nextLearnHref,
    allMainCoursesComplete,
  };

  return NextResponse.json(payload);
}
