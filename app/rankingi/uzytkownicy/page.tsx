'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import BackButton from "@/components/BackButton";

type Entry = { name: string; points: number; streak: number; quizzes: number; courses: number; };
const ALL: Entry[] = [
  { name: "Ala",    points: 1320, streak: 7, quizzes: 14, courses: 22 },
  { name: "Bartek", points: 1095, streak: 3, quizzes:  9, courses: 18 },
  { name: "Celina", points:  980, streak: 5, quizzes: 12, courses: 17 },
  { name: "Darek",  points:  905, streak: 2, quizzes:  8, courses: 15 },
  { name: "Ewa",    points:  880, streak: 8, quizzes: 11, courses: 20 },
];

type Range = "week" | "month" | "all";

export default function UsersRankingPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("week");

  const data = useMemo(() => {
    const mul = range === "week" ? 0.35 : range === "month" ? 0.7 : 1;
    return ALL.map(e => ({ ...e, points: Math.round(e.points * mul) }));
  }, [range]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...data].sort((a, b) => b.points - a.points);
    return q ? base.filter(e => e.name.toLowerCase().includes(q)) : base;
  }, [data, query]);

  return (
    <>
      <div className="mb-4">
        <BackButton fallbackHref="/rankingi" label="← Wróć do rankingów" />
      </div>
      <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
            <button onClick={() => setRange("week")}  className={`px-3 py-1.5 text-sm ${range==="week"?"bg-white text-slate-900 font-semibold":"bg-white/10 hover:bg-white/20"}`}>Tydzień</button>
            <button onClick={() => setRange("month")} className={`px-3 py-1.5 text-sm ${range==="month"?"bg-white text-slate-900 font-semibold":"bg-white/10 hover:bg-white/20"}`}>Miesiąc</button>
            <button onClick={() => setRange("all")}   className={`px-3 py-1.5 text-sm ${range==="all"?"bg-white text-slate-900 font-semibold":"bg-white/10 hover:bg-white/20"}`}>Całość</button>
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Szukaj użytkownika…"
            className="ml-auto w-64 max-w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-[#0b1220] border border-white/10 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left text-white/70">
              <th className="py-2 pl-4 pr-3">Miejsce</th>
              <th className="py-2 pr-3">Użytkownik</th>
              <th className="py-2 pr-3">Punkty</th>
              <th className="py-2 pr-3">Passa</th>
              <th className="py-2 pr-4 text-right">Quizy / Lekcje</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e, i) => (
              <tr key={e.name} className="border-t border-white/10 hover:bg-white/[0.04]">
                <td className="py-2 pl-4 pr-3 font-semibold">#{i+1}</td>
                <td className="py-2 pr-3">{e.name}</td>
                <td className="py-2 pr-3">{e.points}</td>
                <td className="py-2 pr-3">🔥 {e.streak} dni</td>
                <td className="py-2 pr-4 text-right">{e.quizzes} / {e.courses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/quizy" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Rozwiąż quizy</Link>
        <Link href="/kursy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Ucz się dalej</Link>
      </div>
    </>
  );
}
