'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { isTierAtLeast, type Tier } from '@/lib/panel/access';
import type { ContextSource } from '@/lib/panel/coachContext';

type ChatMsg = {
  role: 'user' | 'assistant';
  content: string;
};

type AccessBlock =
  | { kind: 'tier'; required: 'elite' | 'pro' | 'starter'; message: string }
  | { kind: 'auth'; message: string }
  | null;

const QUICK_PROMPTS: { label: string; text: string }[] = [
  {
    label: 'Scenariusz A/B/C',
    text: 'Zbuduj edukacyjny scenariusz A/B/C dla US100 na H4: IF / invalidation / confirmations / risk notes. Bez sygnałów.',
  },
  {
    label: 'Interpretacja CPI',
    text: 'Jak interpretować odczyt CPI vs konsensus? Podaj typowe mechanizmy i kiedy reakcja bywa odwracana. EDU.',
  },
  {
    label: 'Checklist przed decyzją',
    text: 'Zrób checklistę (makro/technika/ryzyko) przed ważnym eventem (np. NFP). EDU, bez rekomendacji.',
  },
  {
    label: 'Ryzyko i zmienność',
    text: 'Jak dostosować plan ryzyka do podwyższonej zmienności (ATR/VIX)? EDU, bez porad inwestycyjnych.',
  },
];

function labelForContext(src: ContextSource) {
  switch (src) {
    case 'calendar7d':
      return 'Kalendarz 7 dni';
    case 'scenariosABC':
      return 'Scenariusze A/B/C';
    case 'checklists':
      return 'Checklisty';
    case 'eventPlaybooks':
      return 'Playbooki eventowe';
    case 'techMaps':
      return 'Mapy techniczne';
    default:
      return 'Brak';
  }
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

  const canSend = useMemo(() => input.trim().length >= 3 && !loading && !accessBlock, [input, loading, accessBlock]);

  // Tier-aware: fetch current plan from API
  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await fetch('/api/panel/me', { cache: 'no-store' });
        const data = (await res.json()) as { tier?: Tier };
        if (!cancelled) {
          const t = (data?.tier ?? 'free') as Tier;
          setTier(t);
        }
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

  // Minimal required tier per context
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
        return 'free'; // 'none'
    }
  }

  // Ensure selected context is allowed for current tier
  useEffect(() => {
    const required = requiredTierForContext(contextSource);
    if (!isTierAtLeast(tier, required)) {
      setContextSource('none');
    }
  }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  function optionLabel(src: ContextSource): string {
    switch (src) {
      case 'calendar7d':
        return isTierAtLeast(tier, 'starter') ? 'Kalendarz 7 dni' : 'Kalendarz 7 dni (STARTER) 🔒';
      case 'scenariosABC':
        return isTierAtLeast(tier, 'starter') ? 'Scenariusze A/B/C' : 'Scenariusze A/B/C (STARTER) 🔒';
      case 'checklists':
        return isTierAtLeast(tier, 'starter') ? 'Checklisty' : 'Checklisty (STARTER) 🔒';
      case 'eventPlaybooks':
        return isTierAtLeast(tier, 'pro') ? 'Playbooki eventowe' : 'Playbooki eventowe (PRO) 🔒';
      case 'techMaps':
        return isTierAtLeast(tier, 'pro') ? 'Mapy techniczne' : 'Mapy techniczne (PRO) 🔒';
      default:
        return 'Brak';
    }
  }

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

      // 403: tier gating (parse structured response if available)
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
          {
            role: 'assistant',
            content: 'Dostęp zablokowany z powodu planu. Skorzystaj z przycisku „Ulepsz plan” powyżej.',
          },
        ]);
        return;
      }

      // 401: auth gating (if used in the future)
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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 py-4 border-b border-white/10">
        <div>
          <div className="text-sm text-white/70">Coach AI (EDU)</div>
          <div className="text-xs text-white/60 mt-1">
            Bez „sygnałów”, bez rekomendacji. Scenariusze warunkowe, checklisty, interpretacja danych.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-white/60">Kontekst:</div>
          <select
            value={contextSource}
            onChange={(e) => setContextSource(e.target.value as ContextSource)}
            disabled={loading || Boolean(accessBlock)}
            className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="none">Brak</option>
            <option value="calendar7d" disabled={!isTierAtLeast(tier, 'starter')}>
              {optionLabel('calendar7d')}
            </option>
            <option value="scenariosABC" disabled={!isTierAtLeast(tier, 'starter')}>
              {optionLabel('scenariosABC')}
            </option>
            <option value="checklists" disabled={!isTierAtLeast(tier, 'starter')}>
              {optionLabel('checklists')}
            </option>
            <option value="eventPlaybooks" disabled={!isTierAtLeast(tier, 'pro')}>
              {optionLabel('eventPlaybooks')}
            </option>
            <option value="techMaps" disabled={!isTierAtLeast(tier, 'pro')}>
              {optionLabel('techMaps')}
            </option>
          </select>
          <div className="text-[11px] text-white/50 hidden md:block">
            Aktualnie: <span className="text-white/75">{labelForContext(contextSource)}</span>
          </div>
          <div className="text-xs text-white/60 hidden md:block">Plan: {tier.toUpperCase()}</div>
        </div>
      </div>

      {/* access banner */}
      {accessBlock && (
        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
            <div className="text-sm font-semibold text-amber-200">
              {accessBlock.kind === 'tier' ? 'Dostęp ograniczony planem' : 'Wymagane logowanie'}
            </div>
            <div className="mt-1 text-sm text-amber-100/90">{accessBlock.message}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {accessBlock.kind === 'tier' && (
                <Link
                  href="/konto/upgrade"
                  className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Ulepsz plan
                </Link>
              )}
              <button
                type="button"
                onClick={() => setAccessBlock(null)}
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* quick prompts */}
      <div className="px-5 pt-4">
        <div className="text-xs text-white/60 mb-2">Szybkie starty</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => send(p.text)}
              disabled={loading || Boolean(accessBlock)}
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* messages */}
      <div className="px-5 py-4">
        <div className="space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'border-white/10 bg-slate-900/60'
                  : 'border-emerald-400/15 bg-emerald-500/5'
              }`}
            >
              <div className="text-xs mb-2 text-white/60">{m.role === 'user' ? 'Ty' : 'Coach AI'}</div>
              <div className="whitespace-pre-wrap text-white/85">{m.content}</div>
            </div>
          ))}
        </div>

        {/* input */}
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Np. „US100 H4 — jak ułożyć plan na tydzień pod CPI/NFP?”"
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canSend) send(input);
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
          Wskazówka: ustaw „Kontekst” na moduł, z którego chcesz korzystać. Odpowiedź zawsze EDU: bez rekomendacji i
          bez sygnałów.
        </div>
      </div>
    </div>
  );
}


