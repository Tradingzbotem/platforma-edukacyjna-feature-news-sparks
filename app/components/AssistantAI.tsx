'use client';

import React, { useEffect, useRef, useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function AssistantAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Cześć! Jestem asystentem edukacyjnym tego serwisu (Forex/CFD). Odpowiadam tylko na pytania dotyczące treści strony: kursów, quizów, kalkulatora, pojęć (pips, lot, R:R, Kelly, MiFID itp.).',
    },
  ]);

  const boxRef = useRef<HTMLDivElement | null>(null);

  // zamknij ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function ask() {
    const q = input.trim();
    if (!q) return;
    setLoading(true);

    // pokaż pytanie użytkownika
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');

    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }), // <— WAŻNE: klucz „question”
      });

      if (!r.ok) {
        // sensowny komunikat błędu zamiast „mnóstwa znaków”
        const txt = await r.text().catch(() => '');
        const msg =
          txt && txt.startsWith('{')
            ? (JSON.parse(txt).error as string)
            : `Błąd serwera (${r.status}).`;
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `Nie udało się pobrać odpowiedzi: ${msg}` },
        ]);
      } else {
        const data = (await r.json()) as { answer: string };
        setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Błąd sieci. Spróbuj ponownie.' },
      ]);
    } finally {
      setLoading(false);
      // scroll do dołu
      requestAnimationFrame(() => {
        boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  return (
    <>
      {/* FAB – przycisk w prawym dolnym rogu */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold shadow-md px-5 py-3 hover:bg-slate-50"
      >
        Zapytaj AI
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col text-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-900">Asystent edukacyjny (AI)</div>
              <button className="text-slate-600 hover:text-slate-900" onClick={() => setOpen(false)}>
                Wyczyść
              </button>
            </div>

            <div ref={boxRef} className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'text-right'
                      : 'text-left text-slate-900'
                  }
                >
                  <div
                    className={
                      'inline-block rounded-xl px-3 py-2 ' +
                      (m.role === 'user'
                        ? 'bg-white text-slate-900 border border-slate-200'
                        : 'bg-slate-100 border border-slate-200')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-3">
              <div className="text-xs text-slate-500 px-1 pb-2">
                Odpowiadam tylko w zakresie treści tego serwisu (kursy, quizy, kalkulator, pojęcia rynkowe).
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loading) void ask();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Zadaj pytanie (np. pips, Kelly, MiFID)…"
                  className="flex-1 rounded-lg bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  disabled={loading}
                  className="rounded-lg bg-blue-600 text-white font-semibold px-4 py-2 disabled:opacity-50 hover:bg-blue-700"
                >
                  Wyślij
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
