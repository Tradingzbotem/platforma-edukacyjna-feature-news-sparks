import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { resolveTierFromCookiesAndSession, hasFullPanelAccess } from "@/lib/panel/access";
import { getSession } from "@/lib/session";
import PanelRynkowyLayoutChrome from "./PanelRynkowyLayoutChrome";

export const dynamic = "force-dynamic";

export default async function PanelRynkowyLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSession();
  const tier = resolveTierFromCookiesAndSession(cookieStore, session);
  const paid = hasFullPanelAccess(tier);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <Suspense
        fallback={<div className="mb-6 h-24 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" aria-hidden />}
      >
        <PanelRynkowyLayoutChrome paid={paid} />
      </Suspense>

      {children}
    </div>
  );
}
