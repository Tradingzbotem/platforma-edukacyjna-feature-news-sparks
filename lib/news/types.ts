// lib/news/types.ts
// Canonical types for News Command Center

export type NewsCategory = 'FX' | 'Indeksy' | 'Surowce' | 'Makro' | 'Spółki' | 'Geo' | 'Inne';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type BriefWindow = '24h' | '48h' | '72h';

export type InstrumentImpact = {
  symbol: string;                 // np. EURUSD
  direction: 'up' | 'down' | 'volatile' | 'neutral';
  effect: string;                 // krótki opis po polsku
};

export type NewsItemRaw = {
  id: string;                 // hash(url+title+publishedAt)
  title: string;
  url: string;
  source: string;
  publishedAt: string;        // ISO
  createdAt: string;          // ISO
};

export type NewsItemEnriched = NewsItemRaw & {
  summaryShort?: string;
  category?: NewsCategory;
  instruments?: string[];
  sentiment?: Sentiment;
  impact?: number;            // 1–5
  timeEdge?: number;          // 0–10
  whyItMatters?: string;
  watch?: string[];
  impacts?: InstrumentImpact[]; // opis wpływu per instrument (PL)
  enrichedAt?: string;        // ISO
};

export type InstrumentScore = {
  symbol: string;
  score: number; // sum of timeEdge in window
};

export type Brief = {
  id: string;
  window: BriefWindow;
  generatedAt: string; // ISO
  bullets: {
    what: string[];
    why: string[];
    watch: string[];
  };
  extended?: string;
  disclaimer: string;
};

export type NewsListQuery = {
  hours?: 24 | 48 | 72;
  q?: string;
  categories?: NewsCategory[];
  minImpact?: number;
  sentiment?: Sentiment | 'any';
  watchlist?: string[]; // optional filtering by instruments
  includeDemo?: boolean; // gdy true – nie filtruje EDU-SEED
};

export type NewsListResponse = {
  items: NewsItemEnriched[];
  updatedAt: string; // ISO of last updated news
  newToday: number;
};


