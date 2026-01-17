// app/api/news/articles/route.ts
import OpenAI from "openai";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";

type Lang = "pl" | "en";
type NewsItem = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source: string;
  link: string;
};

// Feeds for seeding
const FEEDS = [
  { source: "Reuters Markets", url: "https://www.reuters.com/markets/rss" },
  { source: "CNBC Markets",   url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" },
  { source: "FXStreet News",   url: "https://www.fxstreet.com/rss/news" },
  { source: "Investing.com FX",url: "https://www.investing.com/rss/news_25.rss" },
];

// Cache: keep for a few hours (we target daily morning articles, but allow manual refresh)
type CacheVal = { payload: { items: NewsItem[]; cachedAt: string }, until: number };
const CACHE = new Map<string, CacheVal>();
const TTL_MS = 6 * 60 * 60 * 1000; // 6h

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

function hoursAgo(h: number) {
  return Date.now() - h * 3600 * 1000;
}

// Strict JSON schema for model responses (improves reliability)
const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "news_items",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "summary", "instruments"],
            properties: {
              title: { type: "string", minLength: 1 },
              summary: { type: "string", minLength: 1 },
              instruments: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
      required: ["items"],
    },
    strict: true as const,
  },
} as const;

async function fetchRss(url: string) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (FXEduLab/NewsBot)" },
    cache: "no-store",
    signal: ac.signal,
  }).catch(() => {
    return new Response("", { status: 408 });
  });
  clearTimeout(t);
  if (!res || !('ok' in res) || !res.ok) return [];
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const obj = parser.parse(xml);
  const items = obj?.rss?.channel?.item || [];
  return Array.isArray(items) ? items : [items].filter(Boolean);
}

function normalizeTitle(s: string) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function clampToWindow(ts: number, windowStart: number) {
  if (ts > Date.now()) return Date.now();
  return ts;
}

async function loadHeadlines(hours: number) {
  const since = hoursAgo(hours);
  const all: Array<{ title: string; when: number; link: string; source: string }> = [];

  await Promise.all(FEEDS.map(async f => {
    try {
      const raw = await fetchRss(f.url);
      for (const it of raw) {
        const title = String(it?.title || "").trim();
        const link  = String(it?.link  || "").trim();
        const whenStr = String(it?.pubDate || it?.pubdate || "");
        const when = new Date(whenStr).getTime();
        if (!title || !when || isNaN(when)) continue;
        if (when < since) continue;
        all.push({ title, when, link, source: f.source });
      }
    } catch {
      // ignore failed feed
    }
  }));

  const seen = new Set<string>();
  const unique = all
    .sort((a,b) => b.when - a.when)
    .filter(it => {
      const key = normalizeTitle(it.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // keep a curated count
  const limit = hours > 24 ? 18 : 24;
  return unique.slice(0, limit);
}

function systemPromptArticles(lang: Lang) {
  if (lang === "pl") {
    return `Piszesz PO POLSKU artykuły do kafelków (Forex/CFD) dla marki FX•EDU.
Zwróć TYLKO JSON {"items":[{title,summary,instruments}]} bez dodatkowego tekstu.
- "title": krótki, informacyjny, po polsku (maks 12 słów), bez clickbaitu.
- "summary": krótki ARTYKUŁ po polsku: 3–6 zdań (80–160 słów). Styl: rzeczowy, edukacyjny, bez przesady i bez rekomendacji inwestycyjnych. Tylko fakty i zwięzły kontekst rynkowy.
- "instruments": lista tickerów/symboli WIELKIMI LITERAMI (np. ["EURUSD","US100","WTI","XAUUSD","DXY"]). Pusta tablica, gdy brak.
Nie wymyślaj dat ani godzin.
Ważne: ZWRÓĆ DOKŁADNIE TAKĄ SAMĄ LICZBĘ elementów jak wejść („inputs”) i W TEJ SAMEJ KOLEJNOŚCI — jeden element na jeden nagłówek. NIE pomijaj żadnego nagłówka. Jeśli nie wiesz, przepisz tytuł po polsku i daj pustą listę instrumentów.`;
  }
  return `You write brief article-style items for market tiles.
Return ONLY JSON {"items":[{title,summary,instruments}]}, no extra text.
- "summary": 3–6 sentences in English, neutral tone, factual, no advice.
- "instruments": tickers/symbols in UPPERCASE. Empty array if none.
Do not invent dates or times.
Important: RETURN EXACTLY THE SAME NUMBER OF ITEMS as the inputs and IN THE SAME ORDER — one item per headline. If unsure, echo the title and empty instruments.`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bucket = (url.searchParams.get('bucket') || '24h').toLowerCase();
    const langParam = (url.searchParams.get('lang') || 'pl').toLowerCase();
    const force = ['1', 'true', 'yes'].includes((url.searchParams.get('force') || '').toLowerCase());
    const debug = ['1', 'true', 'yes'].includes((url.searchParams.get('debug') || '').toLowerCase());
    const hours = bucket === '72h' ? 72 : bucket === '48h' ? 48 : 24;
    const lang: Lang = langParam === 'en' ? 'en' : 'pl';

    const key = `articles:${lang}:${hours}`;
    const hit = CACHE.get(key);
    if (!force && hit && hit.until > Date.now()) {
      return new Response(JSON.stringify(hit.payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
          'Vary': 'Accept-Language',
          'X-LLM-Used': 'cache',
        },
      });
    }

    const headlines = await loadHeadlines(hours);
    const windowStart = hoursAgo(hours);
    if (headlines.length === 0) {
      const payload = { items: [] as NewsItem[], cachedAt: new Date().toISOString() };
      CACHE.set(key, { payload, until: Date.now() + TTL_MS });
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=120, stale-while-revalidate=60',
          'Vary': 'Accept-Language',
          'X-LLM-Used': '0',
        },
      });
    }

    let itemsJson: Array<{ title: string; summary: string; instruments: string[] } | null> = new Array(headlines.length).fill(null);
    let usedLLM = false;
    let modelUsed = "";
    let llmError = "";
    let returnedCount = 0;
    if (apiKey) {
      // Chunked generation improves robustness for strict JSON
      const tryModels = ["gpt-4o-mini", "gpt-4.1-mini"];
      const CHUNK = 8;
      for (let start = 0; start < headlines.length; start += CHUNK) {
        const end = Math.min(start + CHUNK, headlines.length);
        const slice = headlines.slice(start, end);

        let success = false;
        for (const model of tryModels) {
          try {
            const openai = new OpenAI({ apiKey });
            const ac = new AbortController();
            const to = setTimeout(() => ac.abort(), 20000);
            const completion = await openai.chat.completions.create({
              model,
              temperature: 0.2,
              response_format: RESPONSE_FORMAT as any,
              messages: [
                { role: "system", content: systemPromptArticles(lang) },
                { role: "user", content: JSON.stringify({ inputs: slice.map(h => ({ title: h.title })) }) },
              ],
              // @ts-expect-error: openai SDK does not type signal yet
              signal: ac.signal,
            }).catch((e: any) => {
              llmError = String(e?.message || "completion create failed");
              return null as any;
            });
            clearTimeout(to);

            const content = completion?.choices?.[0]?.message?.content ?? "";
            const parsed = content ? JSON.parse(content) : null;
            if (parsed && Array.isArray(parsed?.items) && parsed.items.length === slice.length) {
              for (let j = 0; j < slice.length; j++) {
                const x = parsed.items[j];
                itemsJson[start + j] = {
                  title: String(x?.title ?? ""),
                  summary: String(x?.summary ?? ""),
                  instruments: Array.isArray(x?.instruments)
                    ? x.instruments.map((s: any) => String(s).toUpperCase().replace(/\s+/g, ""))
                    : [],
                };
              }
              usedLLM = true;
              modelUsed = model; // last successful model
              returnedCount += slice.length;
              success = true;
              break;
            } else {
              llmError = "empty-or-invalid-json";
            }
          } catch (e: any) {
            llmError = String(e?.message || "unknown-error");
          }
        }
        // If chunk failed on all models, leave nulls for rewrite later
        if (!success) continue;
      }
    }

    // Ultra-robust fallback: per-item generation for the missing ones
    if (apiKey) {
      const missing: number[] = [];
      for (let i = 0; i < itemsJson.length; i++) {
        if (!itemsJson[i]) missing.push(i);
      }
      if (missing.length) {
        const tryModels = ["gpt-4o-mini", "gpt-4.1-mini"];
        const CONC = 3;
        let ptr = 0;
        await Promise.all(
          Array.from({ length: Math.min(CONC, missing.length) }, async () => {
            while (ptr < missing.length) {
              const mi = missing[ptr++];
              const title = headlines[mi].title;
              let done = false;
              for (const model of tryModels) {
                try {
                  const openai = new OpenAI({ apiKey });
                  const ac = new AbortController();
                  const to = setTimeout(() => ac.abort(), 20000);
                  const completion = await openai.chat.completions.create({
                    model,
                    temperature: 0.2,
                    response_format: {
                      type: "json_schema",
                      json_schema: {
                        name: "one_news_item",
                        schema: {
                          type: "object",
                          additionalProperties: false,
                          required: ["title", "summary", "instruments"],
                          properties: {
                            title: { type: "string", minLength: 1 },
                            summary: { type: "string", minLength: 1 },
                            instruments: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                        },
                        strict: true,
                      },
                    } as any,
                    messages: [
                      {
                        role: "system",
                        content:
                          `Piszesz PO POLSKU artykuł do kafelka (Forex/CFD) dla FX•EDU.\n` +
                          `Zwróć TYLKO JSON {"title","summary","instruments"} — bez innych pól.\n` +
                          `- "title": zwięzły PL (≤12 słów)\n` +
                          `- "summary": 3–6 zdań (80–160 słów), neutralnie, edukacyjnie, bez rekomendacji\n` +
                          `- "instruments": tickery wielkimi literami lub []`,
                      },
                      { role: "user", content: JSON.stringify({ title }) },
                    ],
                    // @ts-expect-error OpenAI SDK typings don't accept AbortSignal here (runtime supports it)
                    signal: ac.signal,
                  }).catch(() => null as any);
                  clearTimeout(to);

                  const content = completion?.choices?.[0]?.message?.content ?? "";
                  if (!content) continue;
                  const parsed = JSON.parse(content);
                  const obj = parsed && typeof parsed === "object" ? parsed : null;
                  if (!obj) continue;
                  itemsJson[mi] = {
                    title: String(obj?.title ?? title),
                    summary: String(obj?.summary ?? title),
                    instruments: Array.isArray(obj?.instruments)
                      ? obj.instruments.map((s: any) => String(s).toUpperCase().replace(/\s+/g, ""))
                      : [],
                  };
                  usedLLM = true;
                  modelUsed = model;
                  returnedCount += 1;
                  done = true;
                  break;
                } catch {
                  // try next model
                }
              }
              if (!done) {
                itemsJson[mi] = null; // zostanie nadpisane rewrite'em poniżej
              }
            }
          })
        );
      }
    }

    // Fallback/merge: use whatever the model returned per index; fill gaps from headlines
    const normalized: Array<{ title: string; summary: string; instruments: string[] }> = [];
    const total = headlines.length;
    for (let i = 0; i < total; i++) {
      const fromLLM = itemsJson[i];
      if (fromLLM && typeof fromLLM.title === "string" && fromLLM.title.length) {
        normalized.push({
          title: fromLLM.title,
          summary: typeof fromLLM.summary === "string" && fromLLM.summary.length ? fromLLM.summary : headlines[i].title,
          instruments: Array.isArray(fromLLM.instruments) ? fromLLM.instruments : [],
        });
      } else {
        normalized.push({
          title: headlines[i].title,
          summary: headlines[i].title,
          instruments: [],
        });
      }
    }

    // Ensure Polish article quality: detect weak entries and rewrite to PL 3–6 sentence articles
    if (apiKey && lang === "pl") {
      // Heuristic: needs rewrite when summary equals title or too short (< 12 words)
      const needIdx: number[] = [];
      const inputs: Array<{ title: string }> = [];
      for (let i = 0; i < normalized.length; i++) {
        const sum = String(normalized[i].summary || "").trim();
        const words = sum.split(/\s+/).filter(Boolean);
        if (!sum || sum === headlines[i].title || words.length < 12) {
          needIdx.push(i);
          inputs.push({ title: headlines[i].title });
        }
      }

      if (needIdx.length) {
        const tryModels = ["gpt-4o-mini", "gpt-4.1-mini"];
        for (const model of tryModels) {
          try {
            const openai = new OpenAI({ apiKey });
            const ac = new AbortController();
            const to = setTimeout(() => ac.abort(), 20000);
            const completion = await openai.chat.completions.create({
              model,
              temperature: 0.2,
              response_format: RESPONSE_FORMAT as any,
              messages: [
                {
                  role: "system",
                  content:
                    `Piszesz PO POLSKU artykuły do kafelków (Forex/CFD) dla marki FX•EDU.\n` +
                    `Zwróć TYLKO JSON {"items":[{title,summary,instruments}]}. BEZ innego tekstu.\n` +
                    `- "title": zwięzły, po polsku (≤12 słów), informacyjny.\n` +
                    `- "summary": 3–6 zdań (80–160 słów), neutralnie, tylko fakty i kontekst. Bez rekomendacji.\n` +
                    `- "instruments": tickery wielkimi literami; pusta tablica, gdy brak.\n` +
                    `Zachowaj KOLEJNOŚĆ i DOKŁADNĄ LICZBĘ pozycji jak w wejściu.`,
                },
                { role: "user", content: JSON.stringify({ inputs }) },
              ],
              // @ts-expect-error signal not typed
              signal: ac.signal,
            }).catch(() => null as any);
            clearTimeout(to);

            const content = completion?.choices?.[0]?.message?.content ?? "";
            if (content) {
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed?.items) && parsed.items.length === needIdx.length) {
                parsed.items.forEach((x: any, j: number) => {
                  const idx = needIdx[j];
                  if (!normalized[idx]) return;
                  normalized[idx] = {
                    title: String(x?.title || normalized[idx].title || headlines[idx].title),
                    summary: String(x?.summary || normalized[idx].summary || headlines[idx].title),
                    instruments: Array.isArray(x?.instruments)
                      ? x.instruments.map((s: any) => String(s).toUpperCase().replace(/\s+/g, ""))
                      : normalized[idx].instruments,
                  };
                });
                usedLLM = true;
                modelUsed = model;
                break;
              }
            }
          } catch {
            // try next model
          }
        }
      }
    }

    const items: NewsItem[] = headlines.map((h, i) => {
      const ts = clampToWindow(h.when, windowStart);
      return {
        title: normalized[i]?.title || h.title,
        summary: normalized[i]?.summary || h.title,
        instruments: Array.isArray(normalized[i]?.instruments) ? normalized[i].instruments : [],
        timestamp_iso: new Date(ts).toISOString(),
        source: 'FX•EDU',
        link: h.link,
      };
    });

    const payload = debug
      ? { items, cachedAt: new Date().toISOString(), meta: { usedLLM, modelUsed, error: llmError, requested: headlines.length, returned: returnedCount } }
      : { items, cachedAt: new Date().toISOString() };
    CACHE.set(key, { payload, until: Date.now() + TTL_MS });
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': force ? 'no-store' : 'public, max-age=300, stale-while-revalidate=60',
        'Vary': 'Accept-Language',
        'X-LLM-Used': usedLLM ? '1' : '0',
        'X-LLM-Returned': String(returnedCount || 0),
        'X-LLM-Requested': String(headlines.length),
        ...(debug ? { 'X-LLM-Model': modelUsed || 'none', 'X-LLM-Error': llmError || '' } : {}),
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Articles generator error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}


