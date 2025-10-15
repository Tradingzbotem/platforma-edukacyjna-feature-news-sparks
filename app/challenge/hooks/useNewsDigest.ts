'use client';

import { useEffect, useMemo, useState } from 'react';

/** Zgodny z /api/news/summarize */
export type NewsItem = {
  title: string;
  summary: string;
  instruments: string[];
  timestamp_iso: string;
  source?: string;
  link?: string;
  detail?: string;
};

export type Digest = Array<{ title: string; source?: string; link?: string }>;

type Opts = {
  /** aliasy instrumentu do filtrowania, np. ['DE40','DAX'] */
  aliases: string[];
  /** max ile nagłówków zwrócić */
  limit?: number;
};

/**
 * Pobiera /api/news/summarize i wycina 1-3 nagłówków pasujących do aliasów instrumentu.
 * Zero cache + bezpieczne przerwanie przy unmount.
 */
export function useNewsDigest({ aliases, limit = 3 }: Opts) {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const aliasSet = useMemo(
    () => new Set(aliases.map((a) => a.trim().toLowerCase())),
    [aliases]
  );

  useEffect(() => {
    let alive = true;
    const ac = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);
        // no-store, by zawsze brać świeże streszczenia
        const res = await fetch('/api/news/summarize', {
          cache: 'no-store',
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const data = (Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? (payload.items as NewsItem[])
            : []) as NewsItem[];

        // Filtr: item pasuje, gdy choć jeden instrument z item.instruments
        // znajduje się w aliasach (case-insensitive).
        const rows: Digest = [];
        for (const it of data) {
          const inst = (it.instruments || []).map((x) => x.toLowerCase());
          let match = inst.some((x) => aliasSet.has(x));
          // Fallback: gdy brak instrumentów z LLM, dopasuj po słowach kluczowych w tytule/summary
          if (!match) {
            const hay = `${it.title || ''} ${it.summary || ''}`.toLowerCase();
            match = Array.from(aliasSet).some((a) => a && hay.includes(a));
          }
          if (match) {
            rows.push({
              title: it.title ?? it.summary ?? '',
              source: it.source,
              link: it.link,
            });
            if (rows.length >= limit) break;
          }
        }

        if (alive) {
          setDigest(rows);
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Fetch error');
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [aliasSet, limit]);

  return { digest, loading, error };
}
