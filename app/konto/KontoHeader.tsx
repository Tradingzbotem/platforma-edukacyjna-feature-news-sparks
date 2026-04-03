'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KontoHeader() {
  const pathname = usePathname();
  const isChecklistyPage = pathname?.includes("/konto/panel-rynkowy/checklisty");

  if (isChecklistyPage) {
    return null;
  }

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm underline text-white/70 hover:text-white">← Strona główna</Link>
        </div>
        <nav className="inline-flex rounded-full border border-white/10 bg-white/10 p-1">
          <Link
            href="/client"
            className="px-4 py-2 text-sm rounded-full bg-white text-slate-900 font-semibold shadow-sm border border-white/20"
          >
            Panel
          </Link>
          <Link
            href="/konto/ustawienia"
            className="px-4 py-2 text-sm rounded-full text-white/70 hover:text-white"
          >
            Ustawienia
          </Link>
          <Link
            href="/challenge"
            className="px-4 py-2 text-sm rounded-full text-white/70 hover:text-white"
          >
            Challenge
          </Link>
        </nav>
      </div>
    </header>
  );
}
