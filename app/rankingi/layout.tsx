'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const active = (href: string) =>
    path?.startsWith(href) ? "bg-white text-slate-900 font-semibold" : "bg-white/10 hover:bg-white/20";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <Link href="/" className="text-sm underline">← Strona główna</Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Rankingi</h1>
          <p className="text-white/70">Wybierz zestawienie poniżej.</p>
          <div className="mt-4 inline-flex rounded-xl border border-white/10 overflow-hidden">
            <Link href="/rankingi/brokerzy" className={`px-4 py-2 text-sm ${active("/rankingi/brokerzy")}`}>Brokerzy</Link>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
