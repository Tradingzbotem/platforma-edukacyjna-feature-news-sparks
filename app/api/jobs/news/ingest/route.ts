// app/api/jobs/news/ingest/route.ts
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { upsertRawNews } from '@/lib/news/store';
import { requireCronSecret } from '@/lib/cronAuth';

export const runtime = 'nodejs';

const FEEDS = [
  { source: 'Reuters Markets', url: 'https://www.reuters.com/markets/rss' },
  { source: 'CNBC Markets', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' },
  { source: 'FXStreet News', url: 'https://www.fxstreet.com/rss/news' },
  { source: 'Investing.com FX', url: 'https://www.investing.com/rss/news_25.rss' },
];

async function fetchRss(url: string) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (FXEduLab/NewsBot)' },
    cache: 'no-store',
    signal: ac.signal,
  }).catch(() => null);
  clearTimeout(t);
  if (!res || !('ok' in res) || !res.ok) return [];
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const obj = parser.parse(xml);
  const items = obj?.rss?.channel?.item || [];
  return Array.isArray(items) ? items : [items].filter(Boolean);
}

export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const all: Array<{ title: string; when: number; link: string; source: string }> = [];
  await Promise.all(
    FEEDS.map(async (f) => {
      try {
        const raw = await fetchRss(f.url);
        for (const it of raw) {
          const title = String(it?.title || '').trim();
          const link = String(it?.link || '').trim();
          const whenStr = String(it?.pubDate || it?.pubdate || '');
          const when = new Date(whenStr).getTime();
          if (!title || !when || isNaN(when)) continue;
          all.push({ title, when, link, source: f.source });
        }
      } catch {}
    })
  );

  // Dedup by lowercased title + link
  const seen = new Set<string>();
  const unique = all
    .sort((a, b) => b.when - a.when)
    .filter((it) => {
      const key = `${it.title.toLowerCase().replace(/\s+/g, ' ').trim()}::${it.link}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const added = await upsertRawNews(
    unique.map((h) => ({
      title: h.title,
      url: h.link,
      source: h.source,
      publishedAt: new Date(h.when).toISOString(),
    }))
  );

  return NextResponse.json({ ok: true, added, scanned: all.length, feeds: FEEDS.length });
}


