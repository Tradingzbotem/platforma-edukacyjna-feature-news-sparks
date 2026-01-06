'use client';

import Link from 'next/link';
import { Calculator, LineChart, HelpCircle, BookOpen } from 'lucide-react';

const TOOLS = [
  { href: '/symulator', label: 'Kalkulator pozycji', icon: Calculator },
  { href: '/zasoby/faq', label: 'FAQ i cheat‑sheety', icon: HelpCircle },
  { href: '/konto/panel-rynkowy/scenariusze-abc', label: 'Edge & RR', icon: LineChart },
  { href: '/kursy', label: 'Materiały', icon: BookOpen },
];

export default function ToolsGrid() {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-slate-900">Narzędzia</h3>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col items-center gap-2 hover:shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                <Icon className="h-5 w-5 text-slate-700" aria-hidden />
              </span>
              <span className="text-center text-sm text-slate-900">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


