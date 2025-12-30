'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { slug: string; title: string; time: string; desc: string };

const LESSONS: Lesson[] = [
  { slug: "lekcja-1", title: "Wprowadzenie: czym jest rynek Forex?", time: "6 min", desc: "Najważniejsze pojęcia, uczestnicy i mechanika działania." },
  { slug: "lekcja-2", title: "Pipsy, punkty i loty", time: "7 min", desc: "Jak liczyć ruch ceny i wielkość pozycji." },
  { slug: "lekcja-3", title: "Rodzaje zleceń", time: "8 min", desc: "Market, limit, stop, stop-limit – kiedy których używać." },
  { slug: "lekcja-4", title: "Dźwignia i ryzyko", time: "9 min", desc: "Ekspozycja, depozyt zabezpieczający i zarządzanie ryzykiem." },
  { slug: "lekcja-5", title: "Czytanie świec", time: "10 min", desc: "Ceny OHLC, interwały i podstawowe formacje." },
];

const KEY = "course:podstawy:done"; // localStorage

export default function Page() {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  const doneCount = LESSONS.filter(l => done.includes(l.slug)).length;
  const percent = Math.round((doneCount / LESSONS.length) * 100);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold">Podstawy — spis lekcji</h1>
        <p className="text-white/70 mt-2">
          Startowy moduł dla początkujących. Zacznij od lekcji 1 i idź po kolei.
        </p>

        {/* PROGRESS */}
        <div className="mt-6 rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Postęp: {doneCount}/{LESSONS.length} lekcji</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* LESSON CARDS */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {LESSONS.map((l, idx) => {
            const finished = done.includes(l.slug);
            return (
              <article
                key={l.slug}
                className="rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60"><span>Lekcja</span> <span>{idx + 1}</span></div>
                  <div className={`text-xs ${finished ? "text-green-300" : "text-white/60"}`}>
                    {finished ? "✓ Ukończono" : "• Nieukończona"}
                  </div>
                </div>
                <h3 className="mt-1 text-lg font-semibold">{l.title}</h3>
                <p className="text-sm text-white/70 mt-2">{l.desc}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                  <span>⏱ {l.time}</span>
                  <Link
                    href={`/kursy/podstawy/${l.slug}`}
                    className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
                  >
                    Otwórz
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/kursy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            ← Wróć do kursów
          </Link>
        </div>
      </div>
    </main>
  );
}
