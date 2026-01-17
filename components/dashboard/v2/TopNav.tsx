'use client';

import Link from 'next/link';

export default function TopNav() {
  return (
    <div className="w-full bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/10">FX</span>
            <span className="hidden sm:inline">EduLab</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-white/80">
            <Link href="/client" className="hover:text-white">Dashboard</Link>
            <Link href="/kursy" className="hover:text-white">Nauka</Link>
            <Link href="/news" className="hover:text-white">Rynek</Link>
            <Link href="/symulator" className="hover:text-white">Narzędzia</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            <input
              placeholder="Wyszukaj kursy, instrumenty…"
              className="h-8 w-56 rounded-md bg-white/10 border border-white/15 px-3 text-sm placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Link href="/client" className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Profil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


