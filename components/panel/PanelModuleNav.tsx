import Link from "next/link";
import { resolvePanelModuleNav } from "@/lib/panel/decisionCenterNav";

type SearchParamsLike = Record<string, string | string[] | undefined>;

export function PanelModuleNav({
  searchParams,
  moduleTitle,
}: {
  searchParams: SearchParamsLike;
  moduleTitle: string;
}) {
  const nav = resolvePanelModuleNav(searchParams);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        <Link href="/" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
          ← Strona główna
        </Link>
        <span className="text-white/30">/</span>
        <Link href={nav.midHref} className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded">
          {nav.midLabel}
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/70">{moduleTitle}</span>
      </div>

      {!nav.hideSecondaryBackRow ? (
        <div className="mt-3">
          <Link
            href={nav.backHref}
            className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
          >
            {nav.backLabel}
          </Link>
        </div>
      ) : null}
    </>
  );
}
