import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveTierFromCookiesAndSession } from "@/lib/panel/access";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function tierLabel(tier: string) {
  return tier.toUpperCase();
}

export default async function PanelRynkowyLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSession();
  const tier = resolveTierFromCookiesAndSession(cookieStore, session);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-neutral-400">
            <Link href="/konto" className="hover:text-neutral-200">Moje konto</Link>
            <span className="px-2">→</span>
            <span className="text-neutral-200">Panel rynkowy (EDU)</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Panel rynkowy (EDU)</h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-200">
              Plan: {tierLabel(tier)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/konto/upgrade"
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

