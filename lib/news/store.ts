// lib/news/store.ts
// Storage utilities for News Command Center with DB + file fallback.
import { sql } from '@vercel/postgres';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { isDatabaseConfigured } from '@/lib/db';
import type {
  Brief,
  BriefWindow,
  NewsItemEnriched,
  NewsItemRaw,
  NewsListQuery,
  NewsListResponse,
} from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const BRIEFS_FILE = path.join(DATA_DIR, 'briefs.json');

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(NEWS_FILE)) writeFileSync(NEWS_FILE, JSON.stringify({ items: [] as NewsItemEnriched[] }, null, 2), 'utf8');
  if (!existsSync(BRIEFS_FILE)) writeFileSync(BRIEFS_FILE, JSON.stringify({ items: [] as Brief[] }, null, 2), 'utf8');
}

function isDemoEnabled(): boolean {
  return (process.env.NEWS_DEMO_SEED || '').toLowerCase() === '1';
}
// ─────────────────────────────────────────────────────────────────────────────
// Local demo seed (file fallback only)
function makeSeedItems(): NewsItemEnriched[] {
  const now = Date.now();
  const h = (x: number) => new Date(now - x * 3600 * 1000).toISOString();
  const base: Array<Partial<NewsItemEnriched> & { title: string; url: string; source: string }> = [
    { title: 'Zaskakująco niska inflacja CPI', url: 'https://example.com/cpi', source: 'EDU-SEED', category: 'Makro', instruments: ['US100','XAUUSD','DXY'], sentiment: 'positive', impact: 4, timeEdge: 6, summaryShort: 'Odczyt CPI poniżej oczekiwań, spada presja na stopy.' },
    { title: 'Wzrost zapasów ropy w USA', url: 'https://example.com/oil', source: 'EDU-SEED', category: 'Surowce', instruments: ['UKOIL','WTI'], sentiment: 'negative', impact: 3, timeEdge: 5, summaryShort: 'Zapasy rosną, presja na ceny ropy.' },
    { title: 'Silniejsze od prognoz NFP', url: 'https://example.com/nfp', source: 'EDU-SEED', category: 'Makro', instruments: ['DXY','EURUSD','US10Y'], sentiment: 'positive', impact: 4, timeEdge: 6, summaryShort: 'Rynek pracy zaskakuje w górę; dolar umacnia się.' },
    { title: 'Złoto jako bezpieczna przystań po wzroście ryzyka', url: 'https://example.com/gold', source: 'EDU-SEED', category: 'Surowce', instruments: ['XAUUSD'], sentiment: 'positive', impact: 3, timeEdge: 5, summaryShort: 'Popyt na aktywa bezpieczne po skoku awersji do ryzyka.' },
    { title: 'Wyniki dużej spółki technologicznej powyżej oczekiwań', url: 'https://example.com/earn', source: 'EDU-SEED', category: 'Spółki', instruments: ['US100'], sentiment: 'positive', impact: 3, timeEdge: 4, summaryShort: 'Lepsze przychody i marże; sektor tech zyskuje.' },
  ];
  const out: NewsItemEnriched[] = [];
  let i = 0;
  // Rozsiej wydarzenia po ostatnich 72 godzinach + trochę starszych do 7 dni
  for (const t of base) {
    out.push({
      id: hashKey(t.url, t.title, h(3 + i * 2)),
      url: t.url,
      title: t.title,
      source: t.source,
      publishedAt: h(3 + i * 2),
      createdAt: h(3 + i * 2),
      summaryShort: t.summaryShort || '',
      category: (t as any).category || 'Inne',
      instruments: (t as any).instruments || [],
      sentiment: (t as any).sentiment || 'neutral',
      impact: Number((t as any).impact || 1),
      timeEdge: Number((t as any).timeEdge || 0),
      whyItMatters: 'Zdarzenie o istotnym znaczeniu dla krótkoterminowych nastrojów.',
      watch: ['Śledź potwierdzenia w kolejnych nagłówkach', 'Zwróć uwagę na zmienność po publikacji'],
      enrichedAt: h(3 + i * 2),
    });
    i++;
  }
  // Dodatkowe kopie z różnymi godzinami, aby wypełnić feed
  for (let k = 0; k < 12; k++) {
    const b = base[k % base.length];
    const shift = 6 + k * 3;
    out.push({
      id: hashKey(b.url + `/${k}`, b.title, h(shift)),
      url: b.url,
      title: `${b.title} — aktualizacja ${k + 1}`,
      source: b.source,
      publishedAt: h(shift),
      createdAt: h(shift),
      summaryShort: (b as any).summaryShort || '',
      category: (b as any).category || 'Inne',
      instruments: (b as any).instruments || [],
      sentiment: (b as any).sentiment || 'neutral',
      impact: Number((b as any).impact || 1),
      timeEdge: Math.max(0, Number((b as any).timeEdge || 0) - 2),
      whyItMatters: 'Aktualizacja tematu; rynek kalibruje oczekiwania.',
      watch: ['Sprawdź rewizje i komunikację instytucji', 'Obserwuj instrumenty z ekspozycją na temat'],
      enrichedAt: h(shift),
    });
  }
  return out.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function seedLocalDemoData(opts?: { force?: boolean; minFreshHours?: number }): void {
  ensureDataDir();
  const force = Boolean(opts?.force);
  const minFreshHours = Number.isFinite(opts?.minFreshHours) ? Number(opts?.minFreshHours) : undefined;
  try {
    const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
    const itemsArr = Array.isArray(current.items) ? current.items : [];
    if (force || itemsArr.length === 0) {
      const items = makeSeedItems();
      writeFileSync(NEWS_FILE, JSON.stringify({ items }, null, 2), 'utf8');
      return;
    }
    if (minFreshHours && itemsArr.length) {
      const latestMs = Math.max(
        ...itemsArr.map(i => {
          const t = new Date(i.publishedAt || i.createdAt || 0).getTime();
          return Number.isFinite(t) ? t : 0;
        })
      );
      const ageHours = latestMs ? (Date.now() - latestMs) / 3600000 : Infinity;
      if (!latestMs || ageHours > minFreshHours) {
        const items = makeSeedItems();
        writeFileSync(NEWS_FILE, JSON.stringify({ items }, null, 2), 'utf8');
      }
    }
  } catch {
    const items = makeSeedItems();
    writeFileSync(NEWS_FILE, JSON.stringify({ items }, null, 2), 'utf8');
  }
  // Brief seeds na podstawie newsów zostaną zbudowane on-the-fly w getLatestBrief
}

// Seed demo do DB lub pliku, zwraca liczbę wpisów
export async function seedDemo(): Promise<number> {
  const items = makeSeedItems();
  if (isDatabaseConfigured()) {
    await ensureTables();
    for (const it of items) {
      const enriched = {
        summaryShort: it.summaryShort ?? '',
        category: it.category ?? 'Inne',
        instruments: Array.isArray(it.instruments) ? it.instruments : [],
        sentiment: it.sentiment ?? 'neutral',
        impact: Number(it.impact ?? 1),
        timeEdge: Number(it.timeEdge ?? 0),
        whyItMatters: it.whyItMatters ?? '',
        watch: it.watch ?? [],
        enrichedAt: it.enrichedAt ?? new Date().toISOString(),
      };
      await sql`
        INSERT INTO news_items (id, url, title, source, published_at, created_at, enriched)
        VALUES (${it.id}, ${it.url}, ${it.title}, ${it.source}, ${it.publishedAt}, ${it.createdAt}, ${JSON.stringify(enriched)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET enriched = EXCLUDED.enriched
      `;
    }
    return items.length;
  }
  seedLocalDemoData();
  return items.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk random seed (enriched) — for demos/dev, generates many items
const CAT_TO_INS: Record<string, string[]> = {
  FX: ['EURUSD','USDJPY','GBPUSD','USDCAD','AUDUSD','NZDUSD','USDCHF','EURJPY'],
  Indeksy: ['US100','SPX','DAX','FTSE','DJI','CAC','NDX'],
  Surowce: ['XAUUSD','XAGUSD','UKOIL','WTI','NG','HG','PLAT'],
  Makro: ['US10Y','DXY','EURUSD','US100'],
  'Spółki': ['AAPL','MSFT','NVDA','AMZN','META','TSLA','GOOGL'],
  Geo: ['UKOIL','EURUSD','US100','DAX'],
  Inne: ['US100','XAUUSD','EURUSD'],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(min + Math.random() * (max - min + 1)); }

function generateRandomItems(count = 200, days = 7): NewsItemEnriched[] {
  const cats = ['FX','Indeksy','Surowce','Makro','Spółki','Geo','Inne'] as const;
  const sentiments = ['positive','neutral','negative'] as const;
  const now = Date.now();
  const items: NewsItemEnriched[] = [];
  for (let i = 0; i < count; i++) {
    const category = pick(cats) as any;
    const sentiment = pick(sentiments) as any;
    const impact = randInt(1, 5);
    const timeEdge = randInt(0, 10);
    const ts = new Date(now - randInt(0, days * 24) * 3600 * 1000).toISOString();
    const insPool = CAT_TO_INS[category] || CAT_TO_INS.Inne;
    const nIns = randInt(1, Math.min(4, insPool.length));
    const instruments = Array.from(new Set(Array.from({ length: nIns }, () => pick(insPool))));
    const title = `EDU Seed • ${category} • wydarzenie #${i + 1}`;
    const url = `https://seed.local/${category.toLowerCase()}/${i}`;
    const id = hashKey(url, title, ts);
    items.push({
      id,
      url,
      title,
      source: 'EDU-SEED',
      publishedAt: ts,
      createdAt: ts,
      summaryShort: `${category} – syntetyczne zdarzenie demo z wpływem ${impact}/5.`,
      category,
      instruments,
      sentiment,
      impact,
      timeEdge,
      whyItMatters: 'Pozycja edukacyjna do celów testowych UI.',
      watch: ['To jest treść demonstracyjna', 'Użyj do walidacji UI i filtrów'],
      enrichedAt: new Date().toISOString(),
    });
  }
  return items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function seedBulk(params?: { count?: number; days?: number }): Promise<number> {
  const count = Math.max(1, Math.min(5000, Number(params?.count ?? 400)));
  const days = Math.max(1, Math.min(30, Number(params?.days ?? 10)));
  const items = generateRandomItems(count, days);
  if (isDatabaseConfigured()) {
    await ensureTables();
    for (const it of items) {
      const enriched = {
        summaryShort: it.summaryShort ?? '',
        category: it.category ?? 'Inne',
        instruments: Array.isArray(it.instruments) ? it.instruments : [],
        sentiment: it.sentiment ?? 'neutral',
        impact: Number(it.impact ?? 1),
        timeEdge: Number(it.timeEdge ?? 0),
        whyItMatters: it.whyItMatters ?? '',
        watch: it.watch ?? [],
        enrichedAt: it.enrichedAt ?? new Date().toISOString(),
      };
      await sql`
        INSERT INTO news_items (id, url, title, source, published_at, created_at, enriched)
        VALUES (${it.id}, ${it.url}, ${it.title}, ${it.source}, ${it.publishedAt}, ${it.createdAt}, ${JSON.stringify(enriched)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET enriched = EXCLUDED.enriched
      `;
    }
    return items.length;
  }
  ensureDataDir();
  try {
    const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
    const seen = new Set(current.items.map(i => i.id));
    for (const it of items) {
      if (seen.has(it.id)) continue;
      current.items.push(it);
    }
    current.items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    current.items = current.items.slice(0, 6000);
    writeFileSync(NEWS_FILE, JSON.stringify(current, null, 2), 'utf8');
    return items.length;
  } catch {
    writeFileSync(NEWS_FILE, JSON.stringify({ items }, null, 2), 'utf8');
    return items.length;
  }
}

// Usuń rekordy demo (EDU-SEED) z DB lub pliku
export async function purgeSeedItems(): Promise<number> {
  if (isDatabaseConfigured()) {
    await ensureTables();
    const result = await sql`DELETE FROM news_items WHERE source = 'EDU-SEED'`;
    // @vercel/postgres delete does not return rowCount type strongly; coerce to number if available
    // @ts-expect-error @vercel/postgres result typing doesn't include rowCount consistently
    return Number(result?.rowCount ?? 0);
  }
  ensureDataDir();
  try {
    const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
    const before = current.items.length;
    current.items = (current.items || []).filter(i => i.source !== 'EDU-SEED');
    writeFileSync(NEWS_FILE, JSON.stringify(current, null, 2), 'utf8');
    return before - current.items.length;
  } catch {
    return 0;
  }
}

export function hashKey(url: string, title: string, publishedAt: string): string {
  return createHash('sha1').update(`${url}::${title}::${publishedAt}`).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// DB helpers
let tablesEnsured = false;
async function ensureTables() {
  if (!isDatabaseConfigured()) return;
  if (tablesEnsured) return;
  // Prevent race conditions between parallel lambdas
  try {
    await sql`SELECT pg_advisory_lock(432101);`;
  } catch {}
  await sql`
    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      enriched JSONB
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS briefs (
      id TEXT PRIMARY KEY,
      time_window TEXT NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      content JSONB NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(published_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_briefs_window ON briefs(time_window, generated_at DESC);`;
  tablesEnsured = true;
  try {
    await sql`SELECT pg_advisory_unlock(432101);`;
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
export async function upsertRawNews(raw: Omit<NewsItemRaw, 'id' | 'createdAt'>[]): Promise<number> {
  const now = new Date().toISOString();
  const items: NewsItemRaw[] = raw.map(r => ({
    ...r,
    id: hashKey(r.url, r.title, r.publishedAt),
    createdAt: now,
  }));

  if (isDatabaseConfigured()) {
    await ensureTables();
    for (const it of items) {
      await sql`
        INSERT INTO news_items (id, url, title, source, published_at, created_at)
        VALUES (${it.id}, ${it.url}, ${it.title}, ${it.source}, ${it.publishedAt}, ${it.createdAt})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    return items.length;
  }

  ensureDataDir();
  // Jeśli pusto — zasil danymi demo tylko gdy eksplicytnie włączone
  if (isDemoEnabled()) seedLocalDemoData();
  const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
  const seen = new Set(current.items.map(i => i.id));
  let added = 0;
  for (const it of items) {
    if (seen.has(it.id)) continue;
    current.items.push({ ...it });
    added++;
  }
  // Keep last ~2000 entries
  current.items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  current.items = current.items.slice(0, 2000);
  writeFileSync(NEWS_FILE, JSON.stringify(current, null, 2), 'utf8');
  return added;
}

export async function listUnenriched(limit = 50): Promise<NewsItemEnriched[]> {
  if (isDatabaseConfigured()) {
    await ensureTables();
    const { rows } = await sql<{ id: string; url: string; title: string; source: string; published_at: Date; created_at: Date; enriched: any }>`
      SELECT id, url, title, source, published_at, created_at, enriched
      FROM news_items
      WHERE enriched IS NULL
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return rows.map(r => ({
      id: r.id,
      url: r.url,
      title: r.title,
      source: r.source,
      publishedAt: new Date(r.published_at).toISOString(),
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
  ensureDataDir();
  const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
  return current.items.filter(i => !i.enrichedAt).slice(0, limit);
}

export async function saveEnriched(items: NewsItemEnriched[]): Promise<void> {
  if (isDatabaseConfigured()) {
    await ensureTables();
    for (const it of items) {
      const enriched = {
        summaryShort: it.summaryShort ?? '',
        category: it.category ?? 'Inne',
        instruments: Array.isArray(it.instruments) ? it.instruments : [],
        sentiment: it.sentiment ?? 'neutral',
        impact: Number(it.impact ?? 1),
        timeEdge: Number(it.timeEdge ?? 0),
        whyItMatters: it.whyItMatters ?? '',
        watch: it.watch ?? [],
        impacts: Array.isArray((it as any).impacts) ? (it as any).impacts : [],
        enrichedAt: it.enrichedAt ?? new Date().toISOString(),
      };
      await sql`
        UPDATE news_items
        SET enriched = ${JSON.stringify(enriched)}::jsonb
        WHERE id = ${it.id}
      `;
    }
    return;
  }
  ensureDataDir();
  const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
  const byId = new Map(current.items.map(i => [i.id, i] as const));
  for (const it of items) {
    const prev = byId.get(it.id);
    if (!prev) continue;
    Object.assign(prev, it, { enrichedAt: it.enrichedAt ?? new Date().toISOString() });
  }
  writeFileSync(NEWS_FILE, JSON.stringify(current, null, 2), 'utf8');
}

export async function listNews(query: NewsListQuery = {}): Promise<NewsListResponse> {
  const hours = query.hours ?? 72;
  const since = Date.now() - hours * 3600 * 1000;

  let items: NewsItemEnriched[] = [];
  if (isDatabaseConfigured()) {
    await ensureTables();
    const { rows } = await sql<{ id: string; url: string; title: string; source: string; published_at: Date; created_at: Date; enriched: any }>`
      SELECT id, url, title, source, published_at, created_at, enriched
      FROM news_items
      WHERE published_at >= to_timestamp(${Math.floor(since / 1000)}) AND enriched IS NOT NULL
      ORDER BY published_at DESC
      LIMIT 1000
    `;
    items = rows.map(r => {
      const e = (r.enriched || {}) as any;
      return {
        id: r.id,
        url: r.url,
        title: r.title,
        source: r.source,
        publishedAt: new Date(r.published_at).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
        summaryShort: e.summaryShort || '',
        category: e.category || 'Inne',
        instruments: Array.isArray(e.instruments) ? e.instruments : [],
        sentiment: e.sentiment || 'neutral',
        impact: Number(e.impact || 1),
        timeEdge: Number(e.timeEdge || 0),
        whyItMatters: e.whyItMatters || '',
        watch: Array.isArray(e.watch) ? e.watch : [],
        impacts: Array.isArray(e.impacts) ? e.impacts : undefined,
        enrichedAt: e.enrichedAt || new Date().toISOString(),
      };
    });
    // Jeżeli DB jest pusta (środowisko dev), spróbujmy wczytać dane demo z pliku
    if (items.length === 0) {
      ensureDataDir();
      seedLocalDemoData({ minFreshHours: hours });
      try {
        const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
        items = (current.items || []).filter(i => new Date(i.publishedAt).getTime() >= since && !!i.enrichedAt);
      } catch {}
    }
  } else {
    ensureDataDir();
    if (isDemoEnabled()) seedLocalDemoData({ minFreshHours: hours });
    const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
    items = (current.items || []).filter(i => new Date(i.publishedAt).getTime() >= since && !!i.enrichedAt);
  }

  // Dev fallback: jeśli w oknie brak danych, odśwież seed demo (zawsze świeże daty)
  if (items.length === 0 && process.env.NODE_ENV !== 'production') {
    seedLocalDemoData({ force: true });
    try {
      const current = JSON.parse(readFileSync(NEWS_FILE, 'utf8')) as { items: NewsItemEnriched[] };
      items = (current.items || []).filter(i => new Date(i.publishedAt).getTime() >= since && !!i.enrichedAt);
    } catch {}
  }

  // Filters
  const q = (query.q || '').toLowerCase().trim();
  const cats = query.categories && query.categories.length ? new Set(query.categories) : null;
  const minImpact = query.minImpact ?? 1;
  const sentiment = query.sentiment && query.sentiment !== 'any' ? query.sentiment : null;
  const wl = Array.isArray(query.watchlist) && query.watchlist.length ? new Set(query.watchlist.map(s => s.toUpperCase())) : null;

  items = items.filter((i) => {
    if (!query.includeDemo && i.source === 'EDU-SEED') return false;
    if (i.impact && i.impact < minImpact) return false;
    if (sentiment && i.sentiment !== sentiment) return false;
    if (cats && !cats.has(i.category || 'Inne')) return false;
    if (wl && (!i.instruments || !i.instruments.some(s => wl.has(s)))) return false;
    if (q && !(i.title.toLowerCase().includes(q) || (i.summaryShort || '').toLowerCase().includes(q))) return false;
    return true;
  });

  const updatedAt = items.length ? items.map(i => i.enrichedAt || i.createdAt || i.publishedAt).sort().slice(-1)[0] : new Date().toISOString();
  const todayStr = new Date().toISOString().slice(0, 10);
  const newToday = items.filter(i => (i.publishedAt || '').startsWith(todayStr)).length;

  return { items, updatedAt, newToday };
}

export async function upsertBrief(brief: Brief): Promise<void> {
  if (isDatabaseConfigured()) {
    await ensureTables();
    await sql`
      INSERT INTO briefs (id, time_window, generated_at, content)
      VALUES (${brief.id}, ${brief.window}, ${brief.generatedAt}, ${JSON.stringify(brief)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET time_window = EXCLUDED.time_window, generated_at = EXCLUDED.generated_at, content = EXCLUDED.content
    `;
    return;
  }
  ensureDataDir();
  const current = JSON.parse(readFileSync(BRIEFS_FILE, 'utf8')) as { items: Brief[] };
  const byId = new Map(current.items.map(b => [b.id, b] as const));
  byId.set(brief.id, brief);
  const next = Array.from(byId.values()).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  writeFileSync(BRIEFS_FILE, JSON.stringify({ items: next }, null, 2), 'utf8');
}

export async function getLatestBrief(window: BriefWindow): Promise<Brief | null> {
  if (isDatabaseConfigured()) {
    await ensureTables();
    const { rows } = await sql<{ content: any }>`
      SELECT content FROM briefs WHERE time_window = ${window} ORDER BY generated_at DESC LIMIT 1
    `;
    return rows[0]?.content ?? null;
  }
  ensureDataDir();
  // Jeśli zapisane — zwróć
  try {
    const current = JSON.parse(readFileSync(BRIEFS_FILE, 'utf8')) as { items: Brief[] };
    const found = (current.items || []).filter(b => b.window === window).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
    if (found) return found;
  } catch {}
  // Zbuduj szybki briefing z lokalnych danych (heurystycznie)
  const hours = window === '24h' ? 24 : window === '48h' ? 48 : 72;
  const { items } = await listNews({ hours, includeDemo: process.env.NODE_ENV !== 'production' });
  const what = items.slice(0, 5).map(i => i.title);
  const byCat = new Map<string, number>();
  items.forEach(i => byCat.set(i.category || 'Inne', (byCat.get(i.category || 'Inne') || 0) + 1));
  const topCats = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
  const why = [`Dominujące tematy: ${topCats.join(', ')}.`, `Najsilniejszy wpływ w ostatnim oknie miały zdarzenia o charakterze ${topCats[0] ?? 'Makro'}.`];
  const byInstr = new Map<string, number>();
  items.forEach(i => (i.instruments || []).forEach(s => byInstr.set(s, (byInstr.get(s) || 0) + (i.timeEdge || 0))));
  const watch = Array.from(byInstr.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => `Obserwuj ${s} (suma wpływu ${Math.round(byInstr.get(s) || 0)})`);
  const brief: Brief = {
    id: `brief-local-${window}-${Date.now()}`,
    window,
    generatedAt: new Date().toISOString(),
    bullets: { what, why, watch },
    extended: '',
    disclaimer: 'Materiał edukacyjny. Informacje nie stanowią rekomendacji inwestycyjnych.',
  };
  // zapisz dla kolejnych odczytów
  try {
    await upsertBrief(brief);
  } catch {
    try {
      const current = JSON.parse(readFileSync(BRIEFS_FILE, 'utf8')) as { items: Brief[] };
      const next = [brief, ...(current.items || [])].slice(0, 10);
      writeFileSync(BRIEFS_FILE, JSON.stringify({ items: next }, null, 2), 'utf8');
    } catch {
      writeFileSync(BRIEFS_FILE, JSON.stringify({ items: [brief] }, null, 2), 'utf8');
    }
  }
  return brief;
}


