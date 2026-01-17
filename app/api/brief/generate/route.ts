// app/api/brief/generate/route.ts
import OpenAI from "openai";
import { addBrief, type Brief as StoreBrief } from "../_store";

export const runtime = "nodejs";

async function synthesizeFromSpark(req: Request, briefType: 'GEN' | 'DAILY'): Promise<StoreBrief | null> {
  try {
    const url = new URL(req.url);
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${url.protocol}//${url.host}`);

    const r = await fetch(`${base}/api/quotes/sparkline?symbols=US100&range=7d&interval=1h`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    const series: Array<[number, number]> = Array.isArray(j?.data) && j.data[0]?.series ? j.data[0].series : [];
    if (!series.length) return null;
    const closes = series.slice().sort((a, b) => a[0] - b[0]).map(p => p[1]);

    // Helpers
    const sma = (arr: number[], period: number, idx: number) => {
      const start = Math.max(0, idx - period + 1);
      const slice = arr.slice(start, idx + 1);
      if (slice.length < period) return undefined;
      const sum = slice.reduce((a, b) => a + b, 0);
      return sum / slice.length;
    };

    // RSI(14)
    const rsiPeriod = 14;
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - rsiPeriod; i < closes.length; i++) {
      if (i <= 0) continue;
      const chg = closes[i] - closes[i - 1];
      if (chg >= 0) gains += chg;
      else losses += -chg;
    }
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod || 1e-9;
    const rs = avgGain / avgLoss;
    const rsiRaw = 100 - 100 / (1 + rs);
    const rsi = Math.max(1, Math.min(99, Math.round(rsiRaw)));

    // MACD(12,26)
    const ema = (period: number) => {
      const k = 2 / (period + 1);
      let value = closes[0];
      for (let i = 1; i < closes.length; i++) value = closes[i] * k + value * (1 - k);
      return value;
    };
    const ema12 = ema(12);
    const ema26 = ema(26);
    const macd = ema12 - ema26;

    // ADX proxy
    const adx = Math.min(40, Math.max(5, Math.abs(macd) * 3 + Math.abs((rsi - 50) / 2)));

    // Dist to MA200 (or MA100 fallback)
    const last = closes[closes.length - 1];
    const maPeriod = closes.length >= 200 ? 200 : Math.min(100, closes.length);
    const ma = sma(closes, maPeriod, closes.length - 1) || last;
    const dist200 = ma ? `${(((last - ma) / ma) * 100).toFixed(1)}%` : undefined;

    const nowIso = new Date().toISOString();
    const fallback: StoreBrief = {
      id: `${Date.now().toString(36)}-synth`,
      ts_iso: nowIso,
      title: `Szybki briefing — GEN (${new Date().toLocaleString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })})`,
      bullets: [
        "Syntetyczny wpis (fallback) na bazie ruchu US100.",
        "Dane edukacyjne – bez porad inwestycyjnych.",
      ],
      content:
        "Fallback wygenerowany automatycznie, gdy generator AI był niedostępny. Zawiera podstawowe metryki do celów edukacyjnych.",
      sentiment: "Neutralny",
      metrics: {
        rsi: Number.isFinite(rsi) ? Number(rsi) : undefined,
        adx: Number.isFinite(adx) ? Number(adx.toFixed(0)) : undefined,
        macd: Number.isFinite(macd) ? Number(macd.toFixed(2)) : undefined,
        volume: "Średnie",
        dist200,
      },
      opinion: rsi > 55 ? "Przewaga wzrostu" : rsi < 45 ? "Przewaga spadku" : "Konsolidacja",
      type: briefType,
    };
    try { await addBrief(fallback); } catch {}
    return fallback;
  } catch {
    return null;
  }
}

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
      // Graceful fallback without OpenAI
      const raw = (await req.json().catch(() => ({}))) as Body;
      const briefType = (raw.type === 'DAILY' ? 'DAILY' : 'GEN') as 'GEN' | 'DAILY';
      const fallback = await synthesizeFromSpark(req, briefType);
      if (fallback) return Response.json({ ok: true, brief: fallback }, { status: 200 });
      return Response.json({ ok: false, error: "Brak OPENAI_API_KEY i nie udało się zbudować fallbacku." }, { status: 500 });
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
    // On OpenAI failure try graceful fallback
    try {
      const raw = (await req.json().catch(() => ({}))) as Body;
      const briefType = (raw.type === 'DAILY' ? 'DAILY' : 'GEN') as 'GEN' | 'DAILY';
      const fallback = await synthesizeFromSpark(req, briefType);
      if (fallback) return Response.json({ ok: true, brief: fallback }, { status: 200 });
    } catch {}
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    const status = /rate limit|429/i.test(message) ? 429 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}


