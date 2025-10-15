// app/api/challenge/events/ai/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ───────────── Helpers dat ─────────────
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function toISODate(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}
function nextWeekRange(from = new Date()) {
  const base = startOfDay(from);
  // znajdź następny poniedziałek
  const dow = base.getDay(); // 0=nd, 1=pn...
  const deltaToMon = ((1 + 7 - dow) % 7) || 7;
  const mon = addDays(base, deltaToMon);
  const fri = addDays(mon, 4);
  return { mon, fri };
}

// ───────────── OpenAI setup ─────────────
const apiKey = process.env.OPENAI_API_KEY || "";
const project = process.env.OPENAI_PROJECT;
const openai = new OpenAI({ apiKey, project });

const SYSTEM_PROMPT = `
Jesteś asystentem planującym EDU-wyzwania rynkowe (FX/CFD) na nadchodzący tydzień.
Zwróć WYŁĄCZNIE JSON (response_format=json_object), w języku polskim.

Zasady:
- Podawaj realne, cykliczne wydarzenia makro/rynkowe, które zwykle pojawiają się w danym tygodniu (np. EIA zapasy ropy środa ~16:30 CET/CEST, Initial Jobless Claims USA czwartek ~14:30 CET/CEST, PMI/ISM na początku miesiąca, payrolls NFP w pierwszy piątek miesiąca, itp.).
- Jeśli konkretny tydzień nie ma "dużych" pozycji (np. FOMC/NFP/CPI), skup się na solidnych, powtarzalnych pozycjach (EIA, Jobless Claims) i sensownych kotwicach (otwarcie po weekendzie dla US100, złoto jako „bezpieczna przystań” w 48–72h, itp.).
- Nie twórz fikcyjnych, jednorazowych wydarzeń (np. "nadzwyczajne posiedzenie"). Jeśli brak pewności co do daty, ustaw "confidence":"low" i dopisz krótkie "reason".
- Dla każdego wydarzenia określ: tytuł, instrument(y), sugerowane okno (np. "Środa 16:30", "Pon–Wt 48h") oraz krótką notkę edukacyjną (bez rekomendacji).
- Maksymalnie 6 pozycji.

Zwróć obiekt:
{
  "events": [
    {
      "id": "string_unikalny",
      "date": "YYYY-MM-DD",
      "title": "string",
      "instrument": "string",
      "window": "string",
      "note": "string",
      "category": "macro|equities|fx|energy|commodities|rates",
      "confidence": "high|medium|low",
      "reason": "krótki komentarz źródła/pewności (opcjonalnie)"
    }, ...
  ]
}
`.trim();

export async function GET(req: NextRequest) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Brak OPENAI_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const { mon, fri } = nextWeekRange(now);

  // Użytkownik: kontekst tygodnia i format
  const user = {
    lang: "pl",
    timezone: tz,
    week: { from: toISODate(mon), to: toISODate(fri) },
    hints: [
      "Uwzględnij powtarzalne kotwice (EIA środa ~16:30 CET/CEST, US Jobless Claims czwartek ~14:30).",
      "Jeśli to początek miesiąca: PMI/ISM; pierwszy piątek: NFP. Inaczej pomiń.",
      "Dodaj 1–2 'kotwice' edukacyjne (np. otwarcie po weekendzie dla US100, XAUUSD 48–72h).",
      "Bez rekomendacji, tylko edukacyjnie.",
    ],
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(user) },
      ],
      max_tokens: 700,
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = {}; }

    const rawEvents: any[] = Array.isArray(parsed?.events) ? parsed.events : [];

    // Normalizacja do naszego formatu (ChallengeItem z dodatkowymi polami)
    const items = rawEvents.map((e, i) => {
      const id =
        String(e?.id || `${(e?.category || "evt")}_${(e?.date || toISODate(mon))}_${i}`)
          .replace(/[^a-zA-Z0-9_\-]/g, "_");
      return {
        id,
        date: String(e?.date || toISODate(mon)),
        title: String(e?.title || "Wydarzenie"),
        instrument: String(e?.instrument || "—"),
        window: String(e?.window || e?.date || "W tym tygodniu"),
        note: e?.note ? String(e.note) : undefined,
        category: String(e?.category || "macro"),
        confidence: String(e?.confidence || "medium"),
        reason: e?.reason ? String(e.reason) : undefined,
        source: "ai:openai",
      };
    });

    const limited = items.slice(0, 6);

    const payload = {
      generatedAt: now.toISOString(),
      range: { from: toISODate(mon), to: toISODate(fri) },
      count: limited.length,
      events: limited,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=60",
        "Vary": "Accept-Language",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "AI error" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
