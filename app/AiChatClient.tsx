// app/AiChatClient.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string };

function asPlainText(data: any): string {
  const candidate =
    data?.answer ??
    data?.reply ??
    data?.message ??
    data?.content ??
    (typeof data === 'string' ? data : null);

  if (typeof candidate === 'string') return candidate;

  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return 'Nie udało się odczytać odpowiedzi.';
  }
}

function formatToBlocks(text: string): string[] {
  if (!text) return [];
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean);

  if (blocks.length > 1) return blocks;

  const sentences = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length > 1 && sentences.length <= 6) return sentences;

  return [text];
}

export default function AiChatClient() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Cześć! Jestem asystentem edukacyjnym (FX/CFD). Zadaj krótkie pytanie – odpowiem zwięźle i bez rekomendacji inwestycyjnych.',
    },
  ]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);

    setMessages(prev => [...prev, { role: 'user', content: question.trim() }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const json = await res.json().catch(() => ({}));
      const text = res.ok
        ? asPlainText(json)
        : `Nie udało się uzyskać odpowiedzi (${json?.error ?? `Błąd ${res.status}`}).`;

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Błąd połączenia. Spróbuj ponownie.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    send(q);
  }

  const quickPrompts = useMemo(
    () => [
      'Wyjaśnij mi dźwignię 1:30 na przykładzie',
      'Ile to pipsów: 1.0750 → 1.0762 na EURUSD?',
      'Jak wyliczyć wartość 1 pipsa na 0.1 lota?',
      'Czym różni się zlecenie LIMIT od STOP?',
      'Na czym polega rollover (swap)?',
    ],
    []
  );

  return (
    <>
      {/* Pływający przycisk */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-3 bg-white text-slate-900 font-semibold shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-expanded={open}
        aria-controls="edu-ai-panel"
      >
        {open ? 'Zamknij AI' : 'Asystent AI'}
      </button>

      {/* Panel */}
      <div
        id="edu-ai-panel"
        className={`fixed bottom-24 right-6 z-50 w-[min(420px,calc(100vw-2rem))] transition-all ${
          open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Asystent edukacyjny"
      >
        {/* OUTER: flex-col + ograniczenia wysokości */}
        <div className="flex flex-col rounded-2xl bg-[#0f172a] text-white border border-white/10 shadow-2xl h-[min(92dvh,700px)] sm:h-[min(80vh,640px)] max-h-[92dvh]">
          {/* Pasek tytułowy */}
          <header className="sticky top-0 z-10 shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur">
            <div>
              <div className="text-sm font-semibold">Asystent edukacyjny (AI)</div>
              <div className="text-[11px] text-white/60">
                Edukacja FX/CFD • brak porad inwestycyjnych
              </div>
            </div>
            <button
              type="button"
              className="text-white/70 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Zamknij"
            >
              ✕
            </button>
          </header>

          {/* BODY (scrollowalne) – wiadomości + szybkie propozycje */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Historia czatu */}
            <div className="px-3 py-3 space-y-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} msg={m} />
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="relative inline-block h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-white/70 animate-ping" />
                        <span className="relative block h-2 w-2 rounded-full bg-white/80" />
                      </span>
                      Piszę…
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Szybkie propozycje (również w obszarze scrolla) */}
            <div className="px-3 pb-3">
              <div className="text-[11px] text-white/50 mb-1">Szybkie propozycje:</div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="text-xs rounded-full px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER (formularz) */}
          <footer className="sticky bottom-0 z-10 shrink-0 border-t border-white/10 px-3 py-3 bg-[#0f172a]/90 backdrop-blur">
            <form onSubmit={onSubmit}>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Zadaj pytanie (np. pips, Kelly, MiFID)…"
                  rows={1}
                  className="min-h-[42px] max-h-28 flex-1 resize-y rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!busy) onSubmit(e as any);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="shrink-0 rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
                >
                  Wyślij
                </button>
              </div>
              <p className="mt-1 text-[10px] text-white/50">
                Odpowiedzi mają charakter edukacyjny i mogą zawierać błędy. Nie są rekomendacją inwestycyjną.
              </p>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user';
  const blocks = formatToBlocks(msg.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-white text-slate-900'
            : 'bg-white/10 text-white border border-white/10',
        ].join(' ')}
      >
        {blocks.map((b, i) => (
          <p key={i} className={i ? 'mt-1.5' : ''}>
            {b}
          </p>
        ))}
      </div>
    </div>
  );
}
