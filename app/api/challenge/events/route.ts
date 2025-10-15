// app/api/challenge/events/route.ts
import { NextRequest } from "next/server";

// Helpery czasu
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function nextWeekday(from: Date, weekday: number) {
  // weekday: 0=nd,1=pn,...,6=sb
  const d = new Date(from);
  const delta = (weekday + 7 - d.getDay()) % 7 || 7; // zawsze przyszły tydzień, nie "dziś"
  return addDays(d, delta);
}
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function GET(_req: NextRequest) {
  const now = new Date();
  const today = startOfDay(now);

  // Zakres: poniedziałek → piątek następnego tygodnia
  const monday = nextWeekday(today, 1);
  const tuesday = nextWeekday(today, 2);
  const wednesday = nextWeekday(today, 3);
  const thursday = nextWeekday(today, 4);
  const friday = nextWeekday(today, 5);

  // Minimalne, ale prawdziwe i cykliczne "kotwice" tygodnia:
  // - Pon: otwarcie po weekendzie (często gapy/sentyment po piątku)
  // - Śr: EIA Crude Oil Inventories (USA, co tydzień) — zwykle 16:30 CET/CEST
  // - Czw: Initial Jobless Claims (USA, co tydzień) — zwykle 14:30 CET/CEST
  // Resztę dołożymy po podpięciu API kalendarza makro (następny krok).

  const events = [
    {
      id: `us100_${toISODate(monday)}`,
      date: toISODate(monday),
      title: "US100 — otwarcie po weekendzie",
      instrument: "US100",
      window: "Poniedziałek (dzień)",
      note:
        "Scenariusz po piątkowym ruchu: odbicie kontynuacyjne czy dalsza realizacja spadków? Ocena do końca sesji USA.",
      category: "equities",
      source: "system:weekly-anchor",
    },
    {
      id: `eia_${toISODate(wednesday)}`,
      date: toISODate(wednesday),
      title: "USA — EIA Crude Oil Inventories",
      instrument: "XTIUSD (WTI)",
      window: "Środa ~16:30",
      note:
        "Cotygodniowy raport zapasów ropy. Typowa zmienność na WTI wokół publikacji; oceniamy kierunek do końca dnia.",
      category: "energy",
      source: "system:weekly-anchor",
    },
    {
      id: `claims_${toISODate(thursday)}`,
      date: toISODate(thursday),
      title: "USA — Initial Jobless Claims",
      instrument: "US100 / USD",
      window: "Czwartek ~14:30",
      note:
        "Cotygodniowe wnioski o zasiłek dla bezrobotnych. Szybka miara rynku pracy; możliwa reakcja indeksów / USD.",
      category: "macro",
      source: "system:weekly-anchor",
    },
    {
      id: `xau_week_${toISODate(monday)}`,
      date: toISODate(monday),
      title: "XAUUSD — ryzyko/bezpieczna przystań (tydzień)",
      instrument: "Złoto (XAUUSD)",
      window: "Pon–Pt (48–72h)",
      note:
        "Czy w otoczeniu nagłówków geopolitycznych złoto pokaże ruch kierunkowy w pierwsze 2–3 dni tygodnia?",
      category: "commodities",
      source: "system:weekly-anchor",
    },
  ];

  const payload = {
    generatedAt: now.toISOString(),
    range: {
      from: toISODate(monday),
      to: toISODate(friday),
    },
    count: events.length,
    events,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=60",
      "Vary": "Accept-Language",
    },
  });
}
