// app/api/brief/generate/route.ts
import OpenAI from "openai";
import { addBrief, type Brief as StoreBrief } from "../_store";

export const runtime = "nodejs";

type Lang = "pl" | "en";
type RangeKey = "24h" | "48h" | "72h";

type Body = {
  lang?: Lang;
  range?: RangeKey;
  prompt?: string;
  type?: 'GEN' | 'DAILY';
  title?: string;
};

type Brief = {
  id: string;
  ts_iso: string;
  title: string;
  bullets: string[];
  content?: string;
  sentiment: "Pozytywny" | "Neutralny" | "Negatywny";
  metrics: {
    rsi?: number;
    adx?: number;
    macd?: number;
    volume?: "Niskie" | "Średnie" | "Wysokie";
    dist200?: string;
  };
  opinion?: string;
};

function defaultPromptPL(): string {
  return (
    "Napisz po polsku zwięzły briefing rynkowy. Wypisz najważniejsze wydarzenia z ostatnich dni\n" +
    "i ich możliwe konsekwencje dla rynków w USA. Uwzględnij, jeśli dotyczy, wątek shutdownu\n" +
    "administracji publicznej w USA. Styl: edukacyjny, bez rekomendacji inwestycyjnych.\n" +
    "Struktura:\n" +
    "- Nagłówek: \"Szybki briefing — GEN\"\n" +
    "- Sekcja \"CO TERAZ GRA NAJGŁOŚNIEJ\": 6–8 punktów (•), każdy 1–2 zdania.\n" +
    "- Krótka \"OPINIA AI (SKRÓT)\" – 1 zdanie o możliwej krótkoterminowej reakcji rynku.\n" +
    "- Jeśli możesz, podaj metryki techniczne: RSI(14), ADX (proxy), MACD, Volume, Dist do 200MA."
  );
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function parseModelOutputToBrief(raw: string): Brief {
  const ts_iso = new Date().toISOString();
  const titleDate = new Date().toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Attempt JSON first
  try {
    const j = JSON.parse(raw);
    const bullets: string[] = Array.isArray(j?.bullets)
      ? j.bullets.map((s: unknown) => String(s)).filter(Boolean)
      : [];
    const content: string | undefined = j?.content ? String(j.content) : undefined;
    const sentimentRaw = String(j?.sentiment ?? "Neutralny");
    const sentiment: Brief["sentiment"] =
      sentimentRaw.includes("Pozy") ? "Pozytywny" : sentimentRaw.includes("Negaty") ? "Negatywny" : "Neutralny";
    const metrics = j?.metrics || {};
    const opinion = j?.opinion ? String(j.opinion) : undefined;
    if (bullets.length) {
      return {
        id: randomId(),
        ts_iso,
        title: `Szybki briefing — GEN (${titleDate})`,
        bullets,
        content,
        sentiment,
        metrics: {
          rsi: Number(metrics?.rsi) || undefined,
          adx: Number(metrics?.adx) || undefined,
          macd: Number(metrics?.macd) || undefined,
          volume: metrics?.volume as Brief["metrics"]["volume"],
          dist200: metrics?.dist200 ? String(metrics.dist200) : undefined,
        },
        opinion,
      };
    }
  } catch {}

  // Fallback: extract bullets by lines starting with - or •
  const bullets: string[] = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => /^[-•]/.test(l))
    .map(l => l.replace(/^[-•]\s?/, ""))
    .filter(Boolean);

  // if model returned paragraphs instead of bullets, keep full text for client rendering
  const content = raw.trim();

  let opinion: string | undefined = undefined;
  const opinionLine = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .find(l => /OPINIA AI|opinia/i.test(l));
  if (opinionLine) opinion = opinionLine.replace(/^(OPINIA AI.*?:)\s*/i, "").trim();

  return {
    id: randomId(),
    ts_iso,
    title: `Szybki briefing — GEN (${titleDate})`,
    bullets: bullets.slice(0, 8),
    content,
    sentiment: "Neutralny",
    metrics: {},
    opinion,
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { ok: false, error: "Brak OPENAI_API_KEY. Ustaw w .env.local i zrestartuj serwer." },
        { status: 500 }
      );
    }

    const raw = (await req.json().catch(() => ({}))) as Body;
    const lang: Lang = raw.lang === "en" ? "en" : "pl";
    const _range: RangeKey = raw.range ?? "24h";
    const userPrompt = (raw.prompt || (lang === "pl" ? defaultPromptPL() : defaultPromptPL())).trim();
    const briefType = (raw.type === 'DAILY' ? 'DAILY' : 'GEN') as 'GEN' | 'DAILY';
    const overrideTitle = typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : undefined;

    const openai = new OpenAI({ apiKey, organization: process.env.OPENAI_ORG_ID, project: process.env.OPENAI_PROJECT });

    // Use Chat Completions to match existing usage in the repo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Jesteś asystentem generującym krótki briefing rynkowy w języku polskim. Zwróć jasną listę punktów i krótką opinię.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 600,
    });

    const content = completion.choices?.[0]?.message?.content || "";
    const brief = parseModelOutputToBrief(content);
    const decorated: StoreBrief = { ...brief, type: briefType, title: overrideTitle || brief.title };
    // Persist to store
    try { await addBrief(decorated); } catch {}
    return Response.json({ ok: true, brief: decorated }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    const status = /rate limit|429/i.test(message) ? 429 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}


