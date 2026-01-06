'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ContextSource } from '@/lib/panel/coachContext';
import { isTierAtLeast, type Tier } from '@/lib/panel/access';
import CoachWorkspace from '@/components/panel/coach-ai/CoachWorkspace';
import type { IntakeState } from '@/components/panel/coach-ai/CoachIntake';

type ChatMsg = {
  role: 'user' | 'assistant';
  content: string;
};

type AccessBlock =
  | { kind: 'tier'; required: 'elite' | 'pro' | 'starter'; message: string }
  | { kind: 'auth'; message: string }
  | null;

function formatBlocks(text: string): { kind: 'heading' | 'list' | 'callout' | 'text'; content: string }[] {
  const lines = text.split('\n');
  const blocks: { kind: 'heading' | 'list' | 'callout' | 'text'; content: string }[] = [];
  let buffer: string[] = [];
  let currentKind: 'list' | 'text' | 'callout' | 'heading' | null = null;

  function flush() {
    if (!buffer.length || !currentKind) return;
    blocks.push({ kind: currentKind, content: buffer.join('\n') });
    buffer = [];
    currentKind = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^(#{1,3}|\d+\.)\s+/.test(line)) {
      flush();
      currentKind = 'heading';
      buffer.push(line.replace(/^#{1,3}\s+/, ''));
      flush();
      continue;
    }
    if (/^(-|\*|•)\s+/.test(line)) {
      if (currentKind !== 'list') flush();
      currentKind = 'list';
      buffer.push(line.replace(/^(-|\*|•)\s+/, '• '));
      continue;
    }
    if (/^(Uwaga|Note|EDU):/i.test(line)) {
      flush();
      currentKind = 'callout';
      buffer.push(line);
      flush();
      continue;
    }
    if (!currentKind) currentKind = 'text';
    buffer.push(line);
  }
  flush();
  return blocks.length ? blocks : [{ kind: 'text', content: text }];
}

function extractTldr(text: string): string {
  const tldr = text.split('\n').find((l) => /TL;?DR/i.test(l));
  if (tldr) return tldr.replace(/TL;?DR[:\-\s]*/i, '').trim();
  const firstPara = text.split(/\n\s*\n/)[0]?.trim() ?? '';
  return firstPara.slice(0, 320);
}

export default function CoachAiClient() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Jestem Coach AI (EDU). Pomogę Ci ułożyć scenariusze, checklisty i interpretację danych, ale nie podaję „sygnałów” ani rekomendacji inwestycyjnych. Możesz też wybrać kontekst z modułów Panelu.',
    },
  ]);
  const [contextSource, setContextSource] = useState<ContextSource>('none');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessBlock, setAccessBlock] = useState<AccessBlock>(null);
  const [tier, setTier] = useState<Tier>('free');
  const [meLoading, setMeLoading] = useState<boolean>(true);

  const [intake, setIntake] = useState<IntakeState>({
    instrument: 'US100',
    horizon: 'H4',
    direction: 'Wzrost',
    when: '',
    whatHappened: '',
  });

  const canSend = useMemo(() => input.trim().length >= 3 && !loading && !accessBlock, [input, loading, accessBlock]);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await fetch('/api/panel/me', { cache: 'no-store' });
        const data = (await res.json()) as { tier?: Tier };
        if (!cancelled) setTier(((data?.tier ?? 'free') as Tier) || 'free');
      } catch {
        if (!cancelled) setTier('free');
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }
    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  function requiredTierForContext(src: ContextSource): Tier {
    switch (src) {
      case 'calendar7d':
      case 'scenariosABC':
      case 'checklists':
        return 'starter';
      case 'eventPlaybooks':
      case 'techMaps':
        return 'pro';
      default:
        return 'free';
    }
  }

  useEffect(() => {
    const required = requiredTierForContext(contextSource);
    if (!isTierAtLeast(tier, required)) {
      setContextSource('none');
    }
  }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading || accessBlock) return;

    const next: ChatMsg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, contextSource }),
      });

      if (res.status === 403) {
        let payload: any = {};
        try {
          payload = await res.json();
        } catch {}
        const required = (payload?.required || 'elite') as 'elite' | 'pro' | 'starter';
        const message =
          required === 'elite'
            ? 'Coach AI jest dostępny wyłącznie w planie ELITE.'
            : required === 'pro'
            ? 'Coach AI jest dostępny w planie PRO/ELITE.'
            : 'Coach AI jest dostępny w planie STARTER/PRO/ELITE.';
        setAccessBlock({ kind: 'tier', required, message });
        setMessages([
          ...next,
          { role: 'assistant', content: 'Dostęp zablokowany z powodu planu. Skorzystaj z przycisku „Ulepsz plan” powyżej.' },
        ]);
        return;
      }

      if (res.status === 401) {
        setAccessBlock({ kind: 'auth', message: 'Wymagane logowanie, aby korzystać z Coach AI (EDU).' });
        setMessages([
          ...next,
          { role: 'assistant', content: 'Wymagane logowanie. Skorzystaj z przycisku „Zaloguj” powyżej.' },
        ]);
        return;
      }

      const data = (await res.json()) as { reply?: string; error?: string; code?: string };
      if (!res.ok) {
        throw new Error(data?.error || 'Request failed');
      }
      setMessages([...next, { role: 'assistant', content: data.reply || 'Brak odpowiedzi.' }]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'Wystąpił błąd techniczny po stronie asystenta. Jeśli to środowisko dev — sprawdź OPENAI_API_KEY oraz logi /api/ai/coach.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function insertPromptToInput(text: string) {
    setInput(text);
    const el = document.getElementById('coach-input') as HTMLInputElement | null;
    if (el) {
      el.focus();
      // move caret to end
      const v = el.value;
      el.value = '';
      el.value = v;
    }
  }

  async function copyTldr(text: string) {
    const t = extractTldr(text);
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      // ignore
    }
  }

  function saveAsNote(text: string) {
    try {
      const storageKey = 'coach:notes';
      const raw = window.localStorage.getItem(storageKey);
      const notes = raw ? (JSON.parse(raw) as any[]) : [];
      const ctx = `${intake.instrument} ${intake.horizon} — ${intake.direction}${intake.when ? ` — ${intake.when}` : ''}`;
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        context: ctx,
        text: text.slice(0, 4000),
      };
      const next = [item, ...notes].slice(0, 200);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const chatArea = (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {accessBlock && (
        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
            <div className="text-sm font-semibold text-amber-200">
              {accessBlock.kind === 'tier' ? 'Dostęp ograniczony planem' : 'Wymagane logowanie'}
            </div>
            <div className="mt-1 text-sm text-amber-100/90">{accessBlock.message}</div>
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <div className="space-y-3">
          {messages.map((m, idx) => {
            const blocks = m.role === 'assistant' ? formatBlocks(m.content) : null;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-4 text-sm leading-relaxed ${
                  m.role === 'user' ? 'border-white/10 bg-slate-900/60' : 'border-emerald-400/15 bg-emerald-500/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs mb-2 text-white/60">{m.role === 'user' ? 'Ty' : 'Coach AI'}</div>
                  {m.role === 'assistant' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyTldr(m.content)}
                        className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                        aria-label="Kopiuj TL;DR"
                      >
                        Kopiuj TL;DR
                      </button>
                      <button
                        type="button"
                        onClick={() => saveAsNote(m.content)}
                        className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                        aria-label="Zapisz jako notatkę"
                      >
                        Zapisz jako notatkę
                      </button>
                    </div>
                  )}
                </div>

                {blocks ? (
                  <div className="space-y-3">
                    {blocks.map((b, i) => {
                      if (b.kind === 'heading') {
                        return (
                          <div key={i} className="text-[13px] font-semibold text-white/90">
                            {b.content.replace(/^\d+\.\s*/, '')}
                          </div>
                        );
                      }
                      if (b.kind === 'list') {
                        return (
                          <ul key={i} className="list-disc pl-5 text-white/85">
                            {b.content.split('\n').map((li, j) => (
                              <li key={j}>{li.replace(/^•\s*/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (b.kind === 'callout') {
                        return (
                          <div key={i} className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3 text-white/90">
                            {b.content}
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="text-white/85 whitespace-pre-wrap">
                          {b.content}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-white/85">{m.content}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            id="coach-input"
            aria-label="Wiadomość do Coach AI"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Np. „US100 H4 — jak ułożyć plan na tydzień pod CPI/NFP?”"
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canSend) void send(input);
              }
            }}
            disabled={loading || Boolean(accessBlock)}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!canSend}
            className="rounded-xl bg-white text-slate-900 px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? '...' : 'Wyślij'}
          </button>
        </div>

        <div className="mt-3 text-xs text-white/55">
          EDU: bez rekomendacji i bez „sygnałów”. Skupiamy się na procesie i interpretacji.
        </div>
      </div>
    </div>
  );

  return (
    <CoachWorkspace
      tier={tier}
      intake={intake}
      onChangeIntake={setIntake}
      onComposeFromIntake={insertPromptToInput}
      onInsertFromMode={insertPromptToInput}
      contextSource={contextSource}
      onChangeContextSource={setContextSource}
      messages={messages}
    >
      {chatArea}
    </CoachWorkspace>
  );
}

