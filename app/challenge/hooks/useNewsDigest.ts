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
        
        // Próbuj najpierw /api/news/summarize
        let data: NewsItem[] = [];
        try {
          const res = await fetch('/api/news/summarize?bucket=24h', {
            cache: 'no-store',
            signal: ac.signal,
          });
          if (res.ok) {
            const payload = await res.json();
            data = (Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.items)
                ? (payload.items as NewsItem[])
                : []) as NewsItem[];
          }
        } catch {}

        // Fallback: jeśli brak danych lub za mało, spróbuj /api/news/list
        if (data.length === 0) {
          try {
            const watchlistParam = Array.from(aliasSet).join(',');
            const res2 = await fetch(`/api/news/list?hours=24&watchlist=${encodeURIComponent(watchlistParam)}&limit=20`, {
              cache: 'no-store',
              signal: ac.signal,
            });
            if (res2.ok) {
              const payload2 = await res2.json();
              const items2 = Array.isArray(payload2?.items) ? payload2.items : [];
              // Mapuj strukturę z /api/news/list do NewsItem
              data = items2.map((it: any) => ({
                title: it.title || '',
                summary: it.summaryShort || it.title || '',
                instruments: Array.isArray(it.instruments) ? it.instruments.map((s: any) => String(s).toUpperCase()) : [],
                timestamp_iso: it.publishedAt || it.createdAt || new Date().toISOString(),
                source: it.source || 'Unknown',
                link: it.url || '',
              }));
            }
          } catch {}
        }

        // Filtr: item pasuje, gdy choć jeden instrument z item.instruments
        // znajduje się w aliasach (case-insensitive).
        const rows: Digest = [];
        for (const it of data) {
          const inst = (it.instruments || []).map((x) => String(x).toLowerCase().trim());
          let match = inst.some((x) => aliasSet.has(x));
          
          // Fallback: gdy brak instrumentów z LLM, dopasuj po słowach kluczowych w tytule/summary
          if (!match && aliasSet.size > 0) {
            const hay = `${it.title || ''} ${it.summary || ''}`.toLowerCase();
            // Sprawdź czy którykolwiek alias występuje w tekście
            match = Array.from(aliasSet).some((a) => {
              if (!a) return false;
              // Dla tickerów jak "EURUSD" sprawdź też "EUR/USD", "EUR USD"
              const normalizedAlias = a.replace(/[\/\s]/g, '');
              const normalizedHay = hay.replace(/[\/\s]/g, '');
              return hay.includes(a) || normalizedHay.includes(normalizedAlias);
            });
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
          setDigest(rows.length > 0 ? rows : null);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? 'Fetch error');
          setDigest(null);
        }
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
