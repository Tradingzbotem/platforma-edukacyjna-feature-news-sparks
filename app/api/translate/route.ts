// app/api/translate/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";

// ————— Typy i lista wspieranych kodów
type Lang =
  | "pl" | "en" | "de" | "fr" | "es" | "it" | "pt" | "nl"
  | "sv" | "no" | "da" | "fi" | "cs" | "sk" | "ro" | "hu"
  | "uk" | "ru" | "tr" | "ar" | "zh" | "ja" | "ko" | "el" | "bg";

const SUPPORTED: Record<Lang, string> = {
  pl: "Polish",
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  cs: "Czech",
  sk: "Slovak",
  ro: "Romanian",
  hu: "Hungarian",
  uk: "Ukrainian",
  ru: "Russian",
  tr: "Turkish",
  ar: "Arabic",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  el: "Greek",
  bg: "Bulgarian",
};

// ————— Prosty hash do cache
function hash(s: string) {
  let h = 0, i = 0;
  while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h.toString(36);
}

// ————— LRU cache w pamięci (na czas życia procesu)
type CacheItem = { translated: string; until: number };
const LRU = new Map<string, CacheItem>();
const MAX = 10_000;                    // max wpisów (zwiększone)
const TTL = 1000 * 60 * 60 * 24 * 7;   // 7 dni

function cacheKey(lang: Lang, text: string) {
  return `${lang}:${hash(text)}`;
}
function cacheGet(lang: Lang, text: string): string | null {
  const k = cacheKey(lang, text);
  const v = LRU.get(k);
  if (!v) return null;
  if (Date.now() > v.until) {
    LRU.delete(k);
    return null;
  }
  // odśwież LRU (move-to-end)
  LRU.delete(k);
  LRU.set(k, v);
  return v.translated;
}
function cacheSet(lang: Lang, text: string, translated: string) {
  const k = cacheKey(lang, text);
  LRU.set(k, { translated, until: Date.now() + TTL });
  if (LRU.size > MAX) {
    const first = LRU.keys().next().value as string | undefined;
    if (first) LRU.delete(first);
  }
}

// ————— Klient OpenAI
const apiKey =
  process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// ————— Tłumaczenie jednej porcji
async function translateChunk(inputs: string[], lang: Lang): Promise<string[]> {
  if (!openai || inputs.length === 0) return inputs;

  const system = `You are a professional translator for a trading education website (Forex/CFD).
Translate EACH input string to ${SUPPORTED[lang]}.
Keep trading tickers/symbols (EUR/USD, NAS100, WTI), numbers, units and proper names intact.
Do NOT add explanations. Return ONLY valid JSON object:
{"translations":["...","..."]} with the SAME length and order as inputs.`;

  const user = JSON.stringify({ inputs, target: lang });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed?.translations) && parsed.translations.length === inputs.length) {
      return parsed.translations as string[];
    }
  } catch {
    // ignore
  }

  // Fallback: spróbuj rozbić po liniach 1:1
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === inputs.length) return lines;
  return inputs; // ostatni ratunek: echo
}

// ————— Pomocnicze: chunkowanie + limiter współbieżności
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function POST(req: Request) {
  try {
    if (!openai) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { texts?: unknown; target?: unknown };

    if (!Array.isArray(body.texts) || body.texts.some(t => typeof t !== "string")) {
      return Response.json({ error: "Invalid 'texts' – expected string[]" }, { status: 400 });
    }

    const lang = (typeof body.target === "string" ? body.target : "en") as Lang;
    if (!(lang in SUPPORTED)) {
      return Response.json({ error: `Unsupported language '${body.target}'` }, { status: 400 });
    }

    const texts = body.texts as string[];

    // Szybka ścieżka: gdy target = 'pl' zwróć oryginały (nasz język bazowy)
    if (lang === "pl") {
      return Response.json({ translations: texts }, { status: 200 });
    }

    // 1) deduplikacja + cache (po *znormalizowanym* tekście)
    const originals: string[] = [];
    const mapIndex: number[] = [];
    const seen = new Map<string, number>();

    texts.forEach((t, i) => {
      const norm = t.replace(/\s+/g, " ").trim();
      if (seen.has(norm)) {
        mapIndex[i] = seen.get(norm)!;
      } else {
        const idx = originals.length;
        originals.push(norm);
        seen.set(norm, idx);
        mapIndex[i] = idx;
      }
    });

    const out = new Array<string>(originals.length).fill("");
    const missingIdx: number[] = [];
    const missing: string[] = [];

    originals.forEach((o, i) => {
      const hit = cacheGet(lang, o);
      if (hit) out[i] = hit;
      else {
        missingIdx.push(i);
        missing.push(o);
      }
    });

    // 2) jeśli są braki – tłumacz w porcjach, równolegle
    if (missing.length) {
      const CHUNK = 150; // bezpieczny rozmiar partii
      const CONC = 3;    // 3 równoległe wywołania

      const parts = chunk(missing, CHUNK);
      let ptr = 0;

      await Promise.all(
        Array.from({ length: Math.min(CONC, parts.length) }, async () => {
          while (ptr < parts.length) {
            const me = ptr++;
            const piece = parts[me];
            const tr = await translateChunk(piece, lang);
            tr.forEach((t, j) => {
              const global = missingIdx[me * CHUNK + j];
              const text = typeof t === "string" && t.length ? t : originals[global];
              out[global] = text;
              cacheSet(lang, originals[global], text);
            });
          }
        })
      );
    }

    // 3) złóż wynik w oryginalnej kolejności
    const translations = texts.map((_, i) => out[mapIndex[i]] || originals[mapIndex[i]]);

    return Response.json({ translations }, { status: 200 });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Translation server error." },
      { status: 500 }
    );
  }
}
