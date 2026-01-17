'use client';

import { useEffect, useMemo, useState } from 'react';
import { CALENDAR_7D } from '@/lib/panel/calendar7d';

type Props = {
  assetKey: 'US100' | 'GOLD' | 'OIL' | 'EURUSD' | 'SP500' | 'DAX40' | 'BTCUSD' | 'ETHUSD' | 'USDJPY' | 'GBPUSD';
};

type Tab = 'today' | 'tomorrow' | 'week';

export default function MacroEventsPanel({ assetKey }: Props) {
  const [tab, setTab] = useState<Tab>('today');
  const [events, setEvents] = useState<{
    date: string;
    time?: string;
    region?: string;
    title: string;
    importance?: 'low' | 'medium' | 'high';
  }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/ai/calendar?days=7&limit=50', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        const arr: any[] = Array.isArray(json?.items) ? json.items : [];
        if (arr.length) {
          setEvents(
            arr.map((e) => ({
              date: String(e?.date || ''),
              time: e?.time ? String(e.time) : undefined,
              region: e?.region ? String(e.region) : undefined,
              title: String(e?.title || e?.event || ''),
              importance: (e?.importance as any) ?? undefined,
            })),
          );
          return;
        }
      } catch {
        // ignore, will use fallback below
      }
      // Fallback: statyczny kalendarz EDU (stabilny)
      if (!mounted) return;
      setEvents(
        CALENDAR_7D.map((e) => ({
          date: e.date,
          time: e.time,
          region: e.region,
          title: e.event,
          importance: e.importance,
        })),
      );
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const tomorrowIso = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    if (tab === 'today') {
      return filterAndSort(events.filter((e) => e.date === todayIso));
    }
    if (tab === 'tomorrow') {
      return filterAndSort(events.filter((e) => e.date === tomorrowIso));
    }
    // week: dziś + kolejne 6 dni
    const in7d = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    return filterAndSort(events.filter((e) => e.date >= todayIso && e.date <= in7d));
  }, [events, tab]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <h2 className="text-sm font-semibold">Makro i wydarzenia (EDU)</h2>
      <div className="mt-3 inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
        <button
          type="button"
          onClick={() => setTab('today')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md ${tab === 'today' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
        >
          Dzisiaj
        </button>
        <button
          type="button"
          onClick={() => setTab('tomorrow')}
          className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${tab === 'tomorrow' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
        >
          Jutro
        </button>
        <button
          type="button"
          onClick={() => setTab('week')}
          className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${tab === 'week' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
        >
          Tydzień
        </button>
      </div>

      <ul className="mt-3 divide-y divide-white/10">
        {items.map((ev, idx) => (
          <li key={idx} className="py-2 flex flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: ev.importance === 'high' ? '#f87171' : ev.importance === 'medium' ? '#f59e0b' : '#10b981' }}
              aria-label={importanceLabel(ev.importance)}
              title={importanceLabel(ev.importance)}
            />
            <div className="min-w-[92px] sm:min-w-[110px] text-white/80 whitespace-nowrap">{formatDate(ev.date)} · {ev.time || '—'}</div>
            <span className="inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/70 ring-1 ring-inset ring-white/10 whitespace-nowrap">
              {ev.region || '—'}
            </span>
            <div className="sm:ml-2 text-white/90 flex-1 min-w-0">
              <div>{ev.title}</div>
              <div className="mt-0.5 text-[11px] text-white/60">{importanceLabel(ev.importance)}</div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-white/60">
        Godziny w czasie lokalnym przeglądarki. Dane: GPT/Finnhub + EDU fallback.
      </p>
    </section>
  );
}

function importanceLabel(x?: 'low' | 'medium' | 'high') {
  if (x === 'high') return 'Wysoka';
  if (x === 'medium') return 'Średnia';
  return 'Niska';
}

function filterAndSort<T extends { time?: string }>(arr: T[]): T[] {
  const withTime = arr.slice();
  withTime.sort((a, b) => {
    const ta = (a.time || '24:00').slice(0, 5);
    const tb = (b.time || '24:00').slice(0, 5);
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });
  return withTime;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' }).replace('.', '');
  } catch {
    return iso;
  }
}


