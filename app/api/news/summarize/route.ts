// app/api/news/summarize/route.ts
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

// ---- Feedy do zebrania nagłówków (możesz dodać kolejne)
const FEEDS = [
  { source: "Reuters Markets", url: "https://www.reuters.com/markets/rss" },
  { source: "CNBC Markets",   url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" },
  { source: "FXStreet News",   url: "https://www.fxstreet.com/rss/news" },
  { source: "Investing.com FX",url: "https://www.investing.com/rss/news_25.rss" },
];

// ---- LRU cache (15 min)
type CacheVal = { payload: { items: NewsItem[]; cachedAt: string }, until: number };
const CACHE = new Map<string, CacheVal>();
const TTL_MS = 5 * 60 * 1000; // keep summaries fresh (5 min)

const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

function hoursAgo(h: number) {
  return Date.now() - h * 3600 * 1000;
}

// Minimalny fetch + parser RSS z timeoutem 8s
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

  // typowy kształt: rss.channel.item[]
  const items = obj?.rss?.channel?.item || [];
  return Array.isArray(items) ? items : [items].filter(Boolean);
}

function normalizeTitle(s: string) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function clampToWindow(ts: number, windowStart: number) {
  // Zachowaj prawdziwy czas z RSS; jedynie przytnij przyszłość do "teraz".
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
        if (when < since) continue;                  // tylko świeże
        all.push({ title, when, link, source: f.source });
      }
    } catch {
      // ignoruj pojedyncze feedy, jedziemy dalej
    }
  }));

  // deduplikacja po tytule
  const seen = new Set<string>();
  const unique = all
    .sort((a,b) => b.when - a.when)
    .filter(it => {
      const key = normalizeTitle(it.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // ogranicz do sensownej liczby
  const limit = hours > 24 ? 25 : 40;
  return unique.slice(0, limit);
}

function systemPrompt(lang: Lang) {
  return lang === "pl"
    ? `Piszesz PO POLSKU i generujesz TREŚCI DO KAFELKÓW z rynku FX/CFD.
Zwróć wyłącznie JSON {"items":[{title,summary,instruments}]}, BEZ żadnego dodatkowego tekstu.
- "title": przetłumacz NA POLSKI, zwięzły i informacyjny (maks 12 słów), bez clickbaitu.
- "summary": KRÓTKI ARTYKUŁ po polsku (3–6 zdań, ok. 80–160 słów). Neutralny, czysto informacyjny, bez rekomendacji inwestycyjnych ani porad tradingowych. Uwzględnij najważniejsze fakty, liczby i kontekst rynkowy (jeśli wynika z nagłówka).
- "instruments": lista powiązanych tickerów/symboli WIELKIMI LITERAMI (np. ["EURUSD","US100","WTI","XAUUSD","DXY"]). Jeśli brak – pusta tablica.
Nie wymyślaj dat ani godzin — znaczniki czasu dodamy sami.`
    : `You are an assistant that SUMMARIZES FX/CFD market headlines.
Return JSON only: {"items":[{title,summary,instruments}]} — NO extra text.
- "summary": 1–2 concise sentences in English, no investment advice.
- "instruments": relevant tickers/symbols in UPPERCASE (e.g., ["EURUSD","US100","WTI","XAUUSD","DXY"]). Empty array if none.
Do NOT invent dates — we will add timestamps ourselves.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { hours?: number; lang?: Lang };
    const hours = Math.max(6, Math.min(72, body?.hours ?? 24));
    const lang: Lang = body?.lang === "en" ? "en" : "pl";

    // cache key
    const key = `${lang}:${hours}`;
    const hit = CACHE.get(key);
    if (hit && hit.until > Date.now()) {
      return new Response(JSON.stringify(hit.payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          // pozwól CDN/przeglądarce na krótkie cache'owanie, ale respektuj in-memory TTL
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
          'Vary': 'Accept-Language',
        },
      });
    }

    // 1) Pobierz świeże nagłówki z RSS
    const headlines = await loadHeadlines(hours);
    const windowStart = hoursAgo(hours);

    if (headlines.length === 0) {
      // brak źródeł -> zwróć pustą ramkę
      const payload = { items: [] as NewsItem[], cachedAt: new Date().toISOString() };
      CACHE.set(key, { payload, until: Date.now() + TTL_MS });
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=120, stale-while-revalidate=60',
          'Vary': 'Accept-Language',
        },
      });
    }

    // 2) Poproś LLM o streszczenie (bez dat)
    let summaries: Array<{ title: string; summary: string; instruments: string[] }> = [];
    if (apiKey) {
      const openai = new OpenAI({ apiKey });
      const user = {
        language: lang,
        inputs: headlines.map(h => ({ title: h.title })),
      };

      // Timeout 8s dla OpenAI
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt(lang) },
          { role: "user", content: JSON.stringify(user) },
        ],
        // @ts-expect-error: openai SDK does not type signal yet
        signal: ac.signal,
      }).catch(() => null as any);
      clearTimeout(to);

      try {
        const content = completion?.choices?.[0]?.message?.content ?? "";
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed?.items)) {
          summaries = parsed.items.map((x: any) => ({
            title: String(x?.title ?? ""),
            summary: String(x?.summary ?? ""),
            instruments: Array.isArray(x?.instruments)
              ? x.instruments.map((s: any) => String(s).toUpperCase().replace(/\s+/g, ""))
              : [],
          }));
        }
      } catch {
        summaries = [];
      }
    }

    // fallback bez klucza / błędny json -> summary = title
    if (summaries.length !== headlines.length) {
      summaries = headlines.map(h => ({
        title: h.title,
        summary: h.title,
        instruments: [],
      }));
    }

    // 3) Złóż finalne elementy z PRAWDZIWĄ datą z RSS
    const items: NewsItem[] = headlines.map((h, i) => {
      const ts = clampToWindow(h.when, windowStart);
      return {
        title: summaries[i]?.title || h.title,
        summary: summaries[i]?.summary || h.title,
        instruments: Array.isArray(summaries[i]?.instruments) ? summaries[i].instruments : [],
        timestamp_iso: new Date(ts).toISOString(),
        source: h.source,
        link: h.link,
      };
    });

    const payload = { items, cachedAt: new Date().toISOString() };
    CACHE.set(key, { payload, until: Date.now() + TTL_MS });
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        'Vary': 'Accept-Language',
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "News summary error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bucket = (url.searchParams.get('bucket') || '24h').toLowerCase();
    const langParam = (url.searchParams.get('lang') || 'pl').toLowerCase();
    const force = ['1', 'true', 'yes'].includes((url.searchParams.get('force') || '').toLowerCase());
    const hours = bucket === '72h' ? 72 : bucket === '48h' ? 48 : 24;
    const lang: Lang = langParam === 'en' ? 'en' : 'pl';

    // reuse POST logic by constructing the same response
    const body = { hours, lang };

    // cache key
    const key = `${lang}:${hours}`;
    const hit = CACHE.get(key);
    if (!force && hit && hit.until > Date.now()) {
      return new Response(JSON.stringify(hit.payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
          'Vary': 'Accept-Language',
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
        },
      });
    }

    let summaries: Array<{ title: string; summary: string; instruments: string[] }> = [];
    if (apiKey) {
      const openai = new OpenAI({ apiKey });
      const user = { language: lang, inputs: headlines.map(h => ({ title: h.title })) };
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 8000);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt(lang) },
          { role: "user", content: JSON.stringify(user) },
        ],
        // @ts-expect-error: openai SDK does not type signal yet
        signal: ac.signal,
      }).catch(() => null as any);
      clearTimeout(to);
      try {
        const content = completion?.choices?.[0]?.message?.content ?? "";
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed?.items)) {
          summaries = parsed.items.map((x: any) => ({
            title: String(x?.title ?? ""),
            summary: String(x?.summary ?? ""),
            instruments: Array.isArray(x?.instruments)
              ? x.instruments.map((s: any) => String(s).toUpperCase().replace(/\s+/g, ""))
              : [],
          }));
        }
      } catch {
        summaries = [];
      }
    }

    if (summaries.length !== headlines.length) {
      summaries = headlines.map(h => ({ title: h.title, summary: h.title, instruments: [] }));
    }

    const items: NewsItem[] = headlines.map((h, i) => {
      const ts = clampToWindow(h.when, windowStart);
      return {
        title: summaries[i]?.title || h.title,
        summary: summaries[i]?.summary || h.title,
        instruments: Array.isArray(summaries[i]?.instruments) ? summaries[i].instruments : [],
        timestamp_iso: new Date(ts).toISOString(),
        source: h.source,
        link: h.link,
      };
    });

    const payload = { items, cachedAt: new Date().toISOString() };
    CACHE.set(key, { payload, until: Date.now() + TTL_MS });
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // For forced requests, instruct browsers not to cache this response; otherwise keep short cache
        'Cache-Control': force ? 'no-store' : 'public, max-age=300, stale-while-revalidate=60',
        'Vary': 'Accept-Language',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "News summary error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
