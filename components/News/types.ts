'use client';

export type RangeKey = '24h' | '48h' | '72h';

export type BriefMetric = {
  rsi?: number;
  adx?: number;
  macd?: number;
  volume?: 'Niskie'|'Średnie'|'Wysokie';
  dist200?: string; // np. '-3%'
};

export type BriefItem = {
  id: string;
  ts_iso: string;
  title: string;
  bullets: string[];
  content?: string;
  opinion?: string;
  sentiment: 'Pozytywny'|'Neutralny'|'Negatywny';
  metrics?: BriefMetric;
  type?: 'GEN'|'DAILY';
};

export type SummarizeResponse = {
  ok: boolean;
  // dostosuj minimalnie do tego, co zwraca /api/news/summarize
  sentiment?: { points?: Array<{ t: number; v: number }>; label?: string };
  buckets?: {
    now?: any[];  // 0–24h
    prev24?: any[]; // 24–48h
    prev48?: any[]; // 48–72h
  };
};


