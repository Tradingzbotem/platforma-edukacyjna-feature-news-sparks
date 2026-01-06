// app/api/ai/chat/route.ts
import OpenAI from "openai";
import { z } from "zod";
import { CALENDAR_7D, type CalendarEvent } from "@/lib/panel/calendar7d";

export const runtime = "nodejs";

// System prompt: szerzej o finansach/rynkach, bez rekomendacji, z użyciem kontekstu.
const SYSTEM_PROMPT = `
Jesteś asystentem edukacyjnym platformy o rynkach finansowych: Forex, indeksy, surowce, akcje, krypto, instrumenty pochodne, makroekonomia, pojęcia i metody tradingu, quizy oraz materiały edukacyjne (KNF/ESMA/MiFID).

Zasady:
- Odpowiadaj po polsku, zwięźle i konkretnie (3–10 krótkich zdań lub zwięzłe punkty).
- Zero rekomendacji inwestycyjnych ani porad co do konkretnych transakcji; treści wyłącznie edukacyjne.
- Dopuszczalne: proste wzory/wyliczenia, przykłady liczbowe i syntetyczne podsumowania.

Kontekst:
- Jeśli w pytaniu znajduje się sekcja „Kontekst: …”, streść i wykorzystaj ją w odpowiedzi (bez halucynacji).
- Gdy kontekst jest niejednoznaczny, sformułuj rozsądne założenia i zaznacz je.

Styl:
- Klarownie, rzeczowo, bez „lania wody”; używaj list, gdy to pomaga.
- Jeżeli pytanie całkowicie odbiega od tematyki finansów/rynków, uprzejmie przekieruj rozmowę do tematów rynkowych zamiast odmawiać odpowiedzi.
- Nie wspominaj o dacie granicznej swojej wiedzy. Jeśli użytkownik pyta o bieżące wydarzenia, oprzyj się na dostarczonym „Kontekście” (nagłówkach/skrótach). Gdy brak takiego kontekstu, uprzejmie zaznacz, że nie masz bezpośredniego dostępu do internetu i zaproponuj zakładkę Aktualności.
 Formatowanie:
 - Bez nagłówków Markdown (żadne ###, ##, #) i bez tabel. Unikaj kodowych bloków.
 - Stosuj krótkie akapity i wypunktowania z myślnikami „- ”, bez linków i bez stylizacji markdown (**pogrubień**).
`;

// Akceptujemy dwa formaty body, by dopasować się do różnych klientów:
// 1) { question: string }
// 2) { message: string } lub { messages: [{role, content}] }
const BodySchema = z.object({
  question: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string().min(1),
    })
  ).optional(),
});

type NewsItem = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source: string;
  link: string;
};

function isFreshNewsQuery(text: string): boolean {
  const t = text.toLowerCase();
  const cues = [
    "najświeższe", "świeże", "świeże", "aktualne", "na żywo", "na zywo",
    "dzisiaj", "dziś", "dzis", "teraz", "w tej chwili", "ostatnie",
    "breaking", "news", "wiadomości", "nagłówki", "naglowki", "geopolityka",
    "wojna", "ukraina", "izrael", "rosja", "usa", "iran", "wen", "wenecuela", "venezuela",
    "co nowego", "co się dzieje", "co sie dzieje", "dzisiejsze",
    "z ostatnich", "z ostatniej godziny", "z ostatnich 24h"
  ];
  return cues.some(k => t.includes(k));
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function formatNewsContext(items: NewsItem[], maxItems = 6): string {
  const chosen = items.slice(0, maxItems);
  const lines = chosen.map(it => {
    const time = new Date(it.timestamp_iso).toISOString().slice(11, 16); // HH:MM
    const tickers = (it.instruments || []).slice(0, 6).join(", ");
    const summary = truncate(it.summary || it.title, 180);
    return `- [${time}] ${it.source}: ${it.title}${tickers ? ` (tickery: ${tickers})` : ""}\n  ${summary}`;
  });
  return [
    "Kontekst: Poniżej masz zebrane najświeższe nagłówki i skróty (ostatnie 24h).",
    ...lines,
    "Wykorzystaj wyłącznie powyższe informacje, nie dodawaj niepotwierdzonych faktów ani porad inwestycyjnych. Nie podawaj linków."
  ].join("\n");
}

function withinNextNDays(ev: CalendarEvent, days: number): boolean {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + days * 24 * 3600 * 1000);
  const ts = new Date(`${ev.date}T${(ev.time || "00:00")}:00Z`).getTime();
  return ts >= start.getTime() && ts <= end.getTime();
}

function formatCalendarContext(days = 3, limit = 8): string {
  const upcoming = CALENDAR_7D
    .filter(ev => withinNextNDays(ev as any, days))
    .sort((a, b) => {
      const ta = new Date(`${a.date}T${(a.time || "00:00")}:00Z`).getTime();
      const tb = new Date(`${b.date}T${(b.time || "00:00")}:00Z`).getTime();
      return ta - tb;
    });
  if (!upcoming.length) {
    return "Kalendarz: Brak zaplanowanych pozycji w najbliższych dniach w źródle EDU.";
  }
  // Prefer high, then medium, then low
  const priority = (i: CalendarEvent["importance"]) =>
    i === "high" ? 0 : i === "medium" ? 1 : 2;
  const picked = upcoming
    .slice()
    .sort((a, b) => priority(a.importance) - priority(b.importance))
    .slice(0, limit);

  const lines = picked.map(ev => {
    const dd = ev.date.slice(5); // MM-DD
    const tt = ev.time;
    return `- ${dd} ${tt} ${ev.region}: ${ev.event} (${ev.importance}) — ${truncate(ev.why, 140)}`;
  });
  return [
    `Kalendarz (najbliższe ${days} dni, EDU):`,
    ...lines,
    "To materiał edukacyjny; żadnych rekomendacji, jedynie tło makro."
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question, message, messages } = parsed.data;

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "Brak klucza API. Ustaw OPENAI_API_KEY w .env.local i zrestartuj serwer.",
        },
        { status: 500 }
      );
    }

    // Znormalizuj do listy wiadomości:
    const normalized =
      (messages && messages.length
        ? messages
        : [
            {
              role: "user" as const,
              content: (question ?? message ?? "").trim(),
            },
          ]
      ).filter(m => m.content.trim().length > 0);

    if (!normalized.length) {
      return Response.json(
        { error: "Brak treści pytania." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Opcjonalnie dołącz świeże nagłówki jako kontekst, gdy użytkownik o nie prosi
    let injectedContext: { role: "user"; content: string } | null = null;
    try {
      const userTextJoined = normalized
        .filter(m => m.role === "user")
        .map(m => m.content)
        .join(" ");
      if (isFreshNewsQuery(userTextJoined)) {
        const origin = new URL(req.url).origin;
        const res = await fetch(`${origin}/api/news/articles?bucket=24h&lang=pl`, {
          cache: "no-store",
        }).catch(() => null as any);
        const data = await res?.json().catch(() => null) as { items?: NewsItem[] } | null;
        const newsCtx = (data && Array.isArray(data.items) && data.items.length > 0)
          ? formatNewsContext(data.items)
          : "Kontekst: Brak świeżych nagłówków z RSS w tej chwili.";
        const calendarCtx = formatCalendarContext(3, 8);
        const directive = [
          "Zadanie: Przygotuj spójne, zwięzłe podsumowanie dla użytkownika:",
          "1) Kalendarz (najbliższe dni): kluczowe publikacje i ich znaczenie.",
          "2) Geopolityka: streszczij główne wątki z nagłówków (np. Ukraina, Bliski Wschód, Wenezuela), bez linków.",
          "3) Rynek: syntetyczny kontekst (USD, rentowności, surowce), tylko edukacyjnie, bez rekomendacji.",
          "Nie podawaj linków. Jeśli czegoś nie ma w kontekście, nie dopowiadaj."
        ].join("\n");
        injectedContext = {
          role: "user",
          content: [calendarCtx, newsCtx, directive].join("\n\n"),
        };
      }
    } catch {
      // brak kontekstu nie powinien blokować odpowiedzi
      injectedContext = null;
    }

    const messagesForModel =
      injectedContext
        ? [{ role: "system", content: SYSTEM_PROMPT } as const, injectedContext, ...normalized]
        : [{ role: "system", content: SYSTEM_PROMPT } as const, ...normalized];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForModel,
      temperature: 0.3,
      max_tokens: 400,
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Przepraszam, nie mam gotowej odpowiedzi.";

    return Response.json({ answer }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Błąd po stronie serwera AI." },
      { status: 500 }
    );
  }
}

// (opcjonalnie) prosta diagnostyka GET
export async function GET() {
  return Response.json({ ok: true, endpoint: "/api/ai/chat" });
}
