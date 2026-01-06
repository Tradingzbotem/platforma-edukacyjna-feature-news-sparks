'use client';

import Link from 'next/link';

export default function ContinueLearningCard() {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Kontynuuj naukę</h3>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
        <div className="sm:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 inline-flex items-center gap-3">
            <span className="inline-flex h-6 px-2 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200">
              FOREX
            </span>
            <div className="hidden sm:block h-6 w-28 relative overflow-hidden rounded-md">
              <div className="absolute inset-0 bg-sky-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Wróć do ostatnio przerabianych treści lub zacznij nowy moduł.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/kursy" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
              Kontynuuj naukę
            </Link>
            <Link href="/kursy" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200">
              Wszystkie kursy
            </Link>
            <Link href="/quizy" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200">
              Quizy
            </Link>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Tip: zacznij od „Podstawy”, a potem sprawdź się w 10‑pytaniowym quizie.
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="relative aspect-[4/3] w-full">
            <svg viewBox="0 0 240 180" className="absolute inset-0 w-full h-full" role="img" aria-label="Ilustracja kontynuacji nauki">
              <defs>
                <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#dbeafe" />
                  <stop offset="1" stopColor="#bfdbfe" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="240" height="180" rx="16" fill="url(#g1)"></rect>
              <g transform="translate(30,30)">
                <rect x="0" y="0" width="180" height="120" rx="10" fill="white" stroke="#d1d5db"></rect>
                <rect x="16" y="20" width="120" height="10" rx="5" fill="#93c5fd"></rect>
                <rect x="16" y="40" width="100" height="8" rx="4" fill="#bfdbfe"></rect>
                <rect x="16" y="56" width="140" height="8" rx="4" fill="#e5e7eb"></rect>
                <rect x="16" y="72" width="90" height="8" rx="4" fill="#e5e7eb"></rect>
                <g transform="translate(150,18)">
                  <circle cx="20" cy="20" r="20" fill="#eff6ff" stroke="#60a5fa"></circle>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="75 100" transform="rotate(-90 20 20)"></circle>
                  <text x="20" y="24" textAnchor="middle" fontSize="10" fill="#1e40af">78%</text>
                </g>
              </g>
              <g transform="translate(20,140)">
                <rect x="0" y="0" width="140" height="28" rx="8" fill="#1d4ed8"></rect>
                <text x="70" y="19" textAnchor="middle" fontSize="12" fill="white">Wznów lekcję</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}


