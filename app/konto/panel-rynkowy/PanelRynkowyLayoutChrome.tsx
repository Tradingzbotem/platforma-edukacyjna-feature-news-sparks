"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PANEL_FROM_DECISION_CENTER, PANEL_FROM_QUERY_KEY, decisionCenterHubHref } from "@/lib/panel/decisionCenterNav";

function searchParamsToRecord(sp: ReturnType<typeof useSearchParams>): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  sp.forEach((value, key) => {
    const cur = out[key];
    if (cur === undefined) {
      out[key] = value;
    } else if (Array.isArray(cur)) {
      cur.push(value);
    } else {
      out[key] = [cur, value];
    }
  });
  return out;
}

export default function PanelRynkowyLayoutChrome({ paid }: { paid: boolean }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const spRecord = searchParamsToRecord(searchParams);
  const fromDecisionCenter = searchParams.get(PANEL_FROM_QUERY_KEY) === PANEL_FROM_DECISION_CENTER;
  const isPanelRoot = pathname === "/konto/panel-rynkowy";

  if (fromDecisionCenter && !isPanelRoot) {
    const dcHref = decisionCenterHubHref(spRecord);
    return (
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <Link
          href={dcHref}
          className="inline-flex items-center text-sm font-semibold text-cyan-100/95 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/35 rounded"
        >
          ← Wróć do centrum decyzji
        </Link>
        <p className="text-[11px] leading-relaxed text-white/45 sm:max-w-md sm:text-right">
          Ten moduł otworzyłeś z centrum decyzji. Pełny panel Founders (Coach AI, raporty itd.) jest osobną ścieżką po odblokowaniu NFT.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-1">
        <div className="text-sm text-neutral-400">
          <Link href="/client" className="hover:text-neutral-200">
            Moje konto
          </Link>
          <span className="px-2">→</span>
          <span className="text-neutral-200">Panel rynkowy (EDU)</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel rynkowy (EDU)</h1>
          {paid ? (
            <span
              aria-label="Pełny dostęp do panelu"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-3 py-1 text-xs text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M7.5 10.5 4 7l4.5 1.5L12 4l3.5 4.5L20 7l-3.5 3.5 1 6.5H6.5l1-6.5z" />
              </svg>
              Pełny dostęp
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
              Brak pełnego panelu
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!paid && (
          <Link
            href="/cennik"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
          >
            Founders NFT — cennik
          </Link>
        )}
      </div>
    </div>
  );
}
