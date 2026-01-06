import Link from "next/link";
import type { ReactNode } from "react";
import SlowDataNotice from "@/components/SlowDataNotice";

/** Nested layout dla /konto (SERVER component) */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

        <SlowDataNotice />

        {children}
      </div>
    </main>
  );
}
