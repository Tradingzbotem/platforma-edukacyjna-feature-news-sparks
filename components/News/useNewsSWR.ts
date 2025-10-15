// components/News/useNewsSWR.ts
'use client';

import useSWR, { SWRResponse } from 'swr';

function lsKey(key: string) {
  return `fxedu_news_cache::${key}`;
}

async function fetcher(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export function useNewsSWR<T = unknown>(key: string, initialData?: T): SWRResponse<T, Error> {
  const swr = useSWR<T, Error>(key, fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
    keepPreviousData: true,
  });

  // Persist to localStorage on success
  if (typeof window !== 'undefined') {
    if (swr.data) {
      try {
        localStorage.setItem(lsKey(key), JSON.stringify(swr.data));
      } catch {}
    } else if (swr.error) {
      // Load fallback from LS if present
      try {
        const raw = localStorage.getItem(lsKey(key));
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (swr as any).data = parsed;
        }
      } catch {}
    }
  }

  return swr;
}


