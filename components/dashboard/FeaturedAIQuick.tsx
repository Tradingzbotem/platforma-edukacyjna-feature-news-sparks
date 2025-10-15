'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

/**
 * Featured AI card with gradient border, soft glow, and quick pre-prompts.
 * CTA opens the existing AI panel by toggling localStorage flag used by existing clients.
 */
export default function FeaturedAIQuick() {
  const openAI = useCallback((prefill?: string) => {
    try {
      // Support both implementations present in the repo
      // app/components/AiChat.tsx uses LS_OPEN = 'ai:chat:open'
      // app/AiChatClient.tsx does not persist open state, but we can emit a custom event
      localStorage.setItem('ai:chat:open', '1');
      if (prefill && prefill.length > 1) {
        const existing = localStorage.getItem('ai:chat:v1');
        const msgs = existing ? JSON.parse(existing) : [];
        const injected = Array.isArray(msgs)
          ? [...msgs, { role: 'user', content: prefill }]
          : [{ role: 'user', content: prefill }];
        localStorage.setItem('ai:chat:v1', JSON.stringify(injected));
      }
      // Broadcast a best-effort event so any mounted AI widget can react
      window.dispatchEvent(new CustomEvent('fxedu:ai:open', { detail: { prefill } }));
    } catch {}
  }, []);

  return (
    <section
      aria-label="Szybkie info od AI"
      className="relative rounded-2xl p-5 sm:p-6 bg-white/5 border border-white/10 shadow-[0_0_45px_-15px_rgba(99,102,241,0.5)]"
      style={{
        // gradient outline using double border trick
        boxShadow:
          '0 0 45px -15px rgba(99,102,241,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)'
      }}
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background:
          'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.35), rgba(34,211,238,0.35))',
        mask: 'linear-gradient(#000, transparent 30%)',
        WebkitMask: 'linear-gradient(#000, transparent 30%)',
        mixBlendMode: 'overlay'
      }} />

      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Szybkie info od AI</h3>
              <p className="text-white/60 text-sm">Briefy, sentyment i szybkie odpowiedzi – bez porad inwestycyjnych.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAI()}
            className="shrink-0 rounded-xl bg-white text-slate-900 px-4 py-2.5 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Otwórz panel AI"
          >
            Otwórz AI
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Szybkie prompty">
          <button
            type="button"
            onClick={() => openAI('Podsumuj kluczowe newsy z ostatnich 24h i ich wpływ.')} 
            className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-left"
          >
            News 24/48/72h
          </button>
          <button
            type="button"
            onClick={() => openAI('Oceń sentyment rynku i wypisz 2-3 scenariusze na jutro.')} 
            className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-left"
          >
            Sentyment i scenariusze
          </button>
          <button
            type="button"
            onClick={() => openAI('Pokaż moje postępy w kursach i quizach oraz zaproponuj następne kroki.')} 
            className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-left col-span-2 sm:col-span-1"
          >
            Pokaż moje postępy
          </button>
        </div>

        <div className="mt-3 text-[11px] text-white/50">
          Materiał edukacyjny — nie jest rekomendacją inwestycyjną.
        </div>

        <div className="mt-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white"
            aria-label="Przejdź do sekcji newsów"
          >
            Zobacz ostatnie briefy AI
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}


