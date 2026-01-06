'use client';

import { useEffect, useMemo, useState } from 'react';
import type { IntakeState } from './CoachIntake';

export type CoachNote = {
  id: string;
  createdAt: number;
  context: string;
  text: string;
};

const STORAGE_KEY = 'coach:notes';

export default function CoachNotes({
  context,
  lastAssistantText,
}: {
  context: IntakeState;
  lastAssistantText?: string;
}) {
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const ctxLabel = useMemo(
    () =>
      `${context.instrument} ${context.horizon} — ${context.direction}${
        context.when ? ` — ${context.when}` : ''
      }`,
    [context.instrument, context.horizon, context.direction, context.when]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CoachNote[]) : [];
      setNotes(parsed);
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  function addNoteFromAssistant() {
    const text = (lastAssistantText || '').trim();
    if (!text) return;
    const item: CoachNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      context: ctxLabel,
      text: text.slice(0, 4000),
    };
    setNotes((prev) => [item, ...prev].slice(0, 200));
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4" aria-label="Notatki (localStorage)">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/90">Notatki</div>
        <button
          type="button"
          onClick={addNoteFromAssistant}
          className="rounded-lg bg-white text-slate-900 px-3 py-1.5 text-xs font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Zapisz ostatnią odpowiedź jako notatkę"
        >
          Zapisz ostatnią odpowiedź
        </button>
      </div>
      {notes.length === 0 ? (
        <div className="mt-3 text-xs text-white/60">
          Brak notatek. Zapisz ostatnią odpowiedź – notatka będzie widoczna tutaj.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-white/60">{new Date(n.createdAt).toLocaleString()}</div>
                <button
                  type="button"
                  onClick={() => removeNote(n.id)}
                  className="text-[11px] text-white/60 underline underline-offset-2"
                  aria-label="Usuń notatkę"
                >
                  Usuń
                </button>
              </div>
              <div className="mt-1 text-[11px] text-white/70">{n.context}</div>
              <div className="mt-2 text-xs text-white/85 whitespace-pre-wrap">{n.text}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


