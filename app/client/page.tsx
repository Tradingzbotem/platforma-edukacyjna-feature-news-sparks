// app/client/page.tsx
'use client';

import Link from "next/link";

export default function ClientPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Client Office</h1>
        <p className="text-sm text-gray-600">Witaj!</p>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Kursy */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-medium">Twoje kursy</h2>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center justify-between">
                <span>Podstawy</span>
                <Link href="/kursy/podstawy" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Otwórz</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Forex</span>
                <Link href="/kursy/forex" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Otwórz</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>CFD</span>
                <Link href="/kursy/cfd" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Otwórz</Link>
              </li>
            </ul>
          </div>

          {/* Egzaminy / Quizy */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-medium">Egzaminy i quizy</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Przewodnik</span>
                <Link href="/kursy/egzaminy/przewodnik" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Start</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>KNF</span>
                <Link href="/kursy/egzaminy/knf" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Start</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>CySEC</span>
                <Link href="/kursy/egzaminy/cysec" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Start</Link>
              </li>
            </ul>
          </div>

          {/* Pliki i wsparcie */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-medium">Pliki i wsparcie</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Moje pliki</span>
                <Link href="/moje-pliki" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Otwórz</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Support</span>
                <Link href="/support" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Napisz</Link>
              </li>
              <li className="flex items-center justify-between">
                <span>Płatności</span>
                <Link href="/konto/platnosci" className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Podgląd</Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
