'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CALENDAR_7D } from '@/lib/panel/calendar7d';

type Brief = { ts_iso: string; title?: string; summary?: string };

export default function TodayBriefCard() {
  const [items, setItems] = useState<Brief[] | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch('/api/brief/list?bucket=24h&limit=6', { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        let arr: Brief[] = Array.isArray(j?.items) ? j.items : [];
        // Fallback: jeśli brak danych z API, pokaż 4 wydarzenia z kalendarza edukacyjnego
        if (!arr || arr.length === 0) {
          const now = new Date();
          const today = now.toISOString().slice(0, 10);
          // wybierz dzisiejsze lub najbliższe wydarzenia
          const byDate = CALENDAR_7D
            .filter(e => e.date >= today)
            .slice(0, 4);
          const pick = byDate.length > 0 ? byDate : CALENDAR_7D.slice(0, 4);
          arr = pick.map(e => ({
            ts_iso: `${e.date}T${(e.time || '00:00')}:00.000Z`,
            title: `[${e.region}] ${e.event} — ${e.time}`,
            summary: e.why
          }));
        }
        if (!alive) return;
        setItems(arr);
      } catch {
        if (!alive) return;
        // awaryjnie: pokaż 4 z kalendarza
        const pick = CALENDAR_7D.slice(0, 4).map(e => ({
          ts_iso: `${e.date}T${(e.time || '00:00')}:00.000Z`,
          title: `[${e.region}] ${e.event} — ${e.time}`,
          summary: e.why
        }));
        setItems(pick);
      }
    }
    void load();
    // slight refresh every 5 min
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function genAiNote() {
      try {
        const now = new Date();
        const month = now.toLocaleString('pl-PL', { month: 'long' });
        const year = now.getFullYear();
        const q =
          `Podsumuj w 1–2 zdaniach najważniejsze akcenty rynkowe typowe dla miesiąca "${month} ${year}". ` +
          `Uwzględnij sezonowość lub kluczowe wydarzenia makro (jeśli są typowe), bez rekomendacji inwestycyjnych. ` +
          `Styl: bardzo zwięźle, neutralnie, edukacyjnie.`;
        const r = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q })
        });
        if (!alive) return;
        if (!r.ok) return; // cichy fallback, gdy brak klucza API itp.
        const j = (await r.json()) as { answer?: string };
        const text = (j?.answer || '').trim();
        if (text) setAiNote(text);
      } catch {
        /* silent */
      }
    }
    void genAiNote();
    return () => { alive = false; };
  }, []);

  // autoplay między maks. 4 punktami (co 6s)
  useEffect(() => {
    const points = Math.min(4, (items ?? []).length);
    if (points <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % points);
    }, 6000);
    return () => clearInterval(id);
  }, [items]);

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-slate-900">Dzisiejszy brief</h3>
      <div className="mt-3 space-y-2">
        {aiNote ? (
          <div className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 shrink-0" aria-hidden />
            <span>{aiNote}</span>
          </div>
        ) : null}

        {/* 1 z 4 wydarzeń dnia (carousel) */}
        {items && items.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-2 text-sm text-slate-800 min-h-[40px]">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
              <span className="font-medium">
                {(items ?? [])[idx % Math.max(1, Math.min(4, items.length))]?.title ||
                  (items ?? [])[idx % Math.max(1, Math.min(4, items.length))]?.summary ||
                  '—'}
              </span>
            </div>
            {/* sterowanie */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(4, items.length) }).map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Punkt ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 w-4 rounded-full ${i === (idx % Math.min(4, items.length)) ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + Math.min(4, items.length)) % Math.min(4, items.length))}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Poprzedni"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % Math.min(4, items.length))}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Następny"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        ) : (
          items && <div className="text-sm text-slate-500">Brak zebranych punktów na dziś.</div>
        )}
      </div>
      <div className="mt-3">
        <Link href="/news" className="text-sm underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500">
          Więcej o briefie →
        </Link>
      </div>
    </section>
  );
}


