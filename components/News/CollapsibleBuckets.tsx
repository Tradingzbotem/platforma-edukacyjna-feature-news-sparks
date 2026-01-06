// components/News/CollapsibleBuckets.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Item = {
  title: string;
  summary: string;
  instruments?: string[];
  timestamp_iso: string;
  source?: string;
  link?: string;
};

type Spark = {
  symbol: string;
  points: Array<{ t: number; c: number }>;
  first: number;
  last: number;
};

async function fetchItems(range: '24h' | '48h' | '72h'): Promise<Item[]> {
  const res = await fetch(`/api/news/articles?bucket=${encodeURIComponent(range)}&lang=pl`, { method: 'GET', cache: 'no-store' });
  const j = await res.json();
  const items: Item[] = Array.isArray(j?.items) ? j.items : [];
  return items;
}

async function fetchSparklineGET(symbols: string[], range = '7d', interval = '1h'): Promise<Record<string, Spark>> {
  // Enforce GET (avoid 405)
  if (!symbols.length) return {};
  const url = `/api/quotes/sparkline?symbols=${encodeURIComponent(symbols.join(','))}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return {};
    const j = await res.json();
    const out: Record<string, Spark> = {};
    (j?.data || []).forEach((it: Spark) => (out[it.symbol.toUpperCase()] = it));
    return out;
  } catch {
    return {};
  }
}

function Section({
  title,
  data,
  collapsedByDefault,
}: {
  title: string;
  data: Item[];
  collapsedByDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedByDefault);
  const [limit, setLimit] = useState(10);

  useEffect(() => setLimit(10), [data]);

  return (
    <section className="mt-6">
      <button
        className="w-full flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`sect-${title}`}
      >
        <span className="text-base font-semibold">{title}</span>
        <span className="text-sm text-white/60">{open ? 'Zwiń' : 'Rozwiń'}</span>
      </button>
      {open && (
        <div id={`sect-${title}`} className="mt-3">
          {data.length === 0 ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">Brak wpisów.</div>
          ) : (
            <ul className="grid gap-3">
              {data.slice(0, limit).map((it, i) => (
                <li key={`${it.timestamp_iso}-${i}`} className="rounded-xl bg-[#0b1220] border border-white/10 p-4">
                  <div className="text-[11px] text-white/60 flex items-center gap-2">
                    {it.source && <span className="uppercase rounded bg-white/10 px-2 py-0.5">{it.source}</span>}
                    <span>•</span>
                    <time dateTime={it.timestamp_iso}>
                      {new Date(it.timestamp_iso).toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </time>
                    <span className="ml-auto text-xs rounded px-2 py-0.5 bg-white/5 border border-white/10">
                      {(() => {
                        const t = `${it.title}. ${it.summary}`.toLowerCase();
                        const pos = /(rally|gain|beats|strong|improves|surge|record|wzrost|rosną|lepszy|mocny|umocnienie|zyskuje|rekord|pozytywn)/.test(t);
                        const neg = /(drop|falls|miss|weak|selloff|risk|war|crisis|downgrade|spadek|spadają|gorzej|słaby|osłabienie|traci|ryzyko|wojna|kryzys|obniżka|negatyw)/.test(t);
                        if (pos && !neg) return 'Pozytywny';
                        if (neg && !pos) return 'Negatywny';
                        return 'Neutralny';
                      })()}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold">
                    {it.link ? (
                      <a href={it.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {it.title}
                      </a>
                    ) : (
                      it.title
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/80">{it.summary}</p>
                </li>
              ))}
            </ul>
          )}
          {data.length > limit && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setLimit(l => l + 10)}
                className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20"
              >
                Pokaż więcej
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function CollapsibleBuckets({ range }: { range: '24h' | '48h' | '72h' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setErr(null);
    (async () => {
      try {
        const arr = await fetchItems(range);
        if (!alive) return;
        setItems(arr);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || 'Błąd pobierania listy.');
        setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range]);

  const now = Date.now();
  const b24 = useMemo(() => items.filter(i => now - new Date(i.timestamp_iso).getTime() <= 24 * 3600 * 1000), [items]);
  const b48 = useMemo(() => items.filter(i => {
    const dt = now - new Date(i.timestamp_iso).getTime();
    return dt > 24 * 3600 * 1000 && dt <= 48 * 3600 * 1000;
  }), [items]);
  const b72 = useMemo(() => items.filter(i => {
    const dt = now - new Date(i.timestamp_iso).getTime();
    return dt > 48 * 3600 * 1000 && dt <= 72 * 3600 * 1000;
  }), [items]);

  return (
    <div className="mt-6">
      {err && (
        <div className="mb-3 rounded-lg bg-rose-500/10 border border-rose-400/20 p-2 text-rose-200 text-xs">
          Nie udało się pobrać świeżych danych. Pokazuję ostatni zapis z pamięci, jeśli jest.
        </div>
      )}
      <Section title="0–24h" data={b24} />
      <Section title="24–48h" data={b48} collapsedByDefault />
      <Section title="48–72h" data={b72} collapsedByDefault />
    </div>
  );
}


