import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveTierFromCookiesAndSession } from "@/lib/panel/access";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function tierLabel(tier: string) {
  return tier.toUpperCase();
}

function isEliteTier(tier: string) {
  return (tier ?? "").toLowerCase() === "elite";
}

export default async function PanelRynkowyLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSession();
  const tier = resolveTierFromCookiesAndSession(cookieStore, session);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-neutral-400">
            <Link href="/client" className="hover:text-neutral-200">Moje konto</Link>
            <span className="px-2">→</span>
            <span className="text-neutral-200">Panel rynkowy (EDU)</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel rynkowy (EDU)</h1>
            {isEliteTier(tier) ? (
              <span
                aria-label="Aktywny plan ELITE"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-3 py-1 text-xs text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M7.5 10.5 4 7l4.5 1.5L12 4l3.5 4.5L20 7l-3.5 3.5 1 6.5H6.5l1-6.5z" />
                </svg>
                ELITE
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
                Plan: {tierLabel(tier)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/kontakt?topic=zakup-pakietu"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
          >
            Wybierz/ulepsz pakiet
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}

