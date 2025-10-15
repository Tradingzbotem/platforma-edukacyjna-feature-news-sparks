import Link from "next/link";
import type { ReactNode } from "react";

/** Nested layout dla /konto (SERVER component) */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm underline">← Strona główna</Link>
              <h1 className="text-3xl sm:text-4xl font-bold mt-1">Moje konto</h1>
              <p className="text-white/70">Twoje kursy, quizy i ustawienia.</p>
            </div>
            <nav className="inline-flex rounded-xl border border-white/10 overflow-hidden">
              <Link
                href="/konto"
                className="px-4 py-2 text-sm bg-white text-slate-900 font-semibold"
              >
                Panel
              </Link>
              <Link
                href="/konto/ustawienia"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20"
              >
                Ustawienia
              </Link>
              <Link
                href="/challenge"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20"
              >
                Challenge
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
