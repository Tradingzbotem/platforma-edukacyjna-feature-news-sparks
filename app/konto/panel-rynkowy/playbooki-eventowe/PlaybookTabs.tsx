// app/konto/panel-rynkowy/playbooki-eventowe/PlaybookTabs.tsx
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Playbook } from '@/lib/panel/playbooks';

type TabKey = 'tldr' | 'pre' | 'live' | 'scenarios' | 'pitfalls' | 'map' | 'risk' | 'quiz' | 'glossary';

const TAB_LABELS: Record<TabKey, string> = {
  tldr: 'TL;DR',
  pre: 'Przed publikacją',
  live: 'W trakcie',
  scenarios: 'Scenariusze',
  pitfalls: 'Pułapki',
  map: 'Mapa rynków',
  risk: 'Ryzyko',
  quiz: 'Quiz',
  glossary: 'Słownik',
};

type Props = {
  item: Playbook;
  active: TabKey;
  onChange: (key: TabKey) => void;
  renderQuiz: (itemsOverride?: Playbook['quiz']) => JSX.Element;
  overrides?: Partial<{
    sixtySeconds: string[];
    preRelease: { t24h: string[]; t2h: string[]; t15m: string[] };
    during: string[];
    scenarios: Array<{ id: string; title: string; details: string[]; caveats: string[] }>;
    pitfalls: string[];
    marketMap: { firstReactors: string[]; confirmations: string[]; crossChecks: string[] };
    risks: string[];
    quiz: Playbook['quiz'];
    glossary: Array<{ term: string; definition: string }>;
  }>;
};

export default function PlaybookTabs({ item, active, onChange, renderQuiz, overrides }: Props) {
  const tablistId = useId();
  const keys = useMemo<TabKey[]>(
    () => ['tldr', 'pre', 'live', 'scenarios', 'pitfalls', 'map', 'risk', 'quiz', 'glossary'],
    []
  );
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  // Safe helpers to guard AI JSON structure
  function arr<T = any>(maybe: any, fallback: T[]): T[] {
    return Array.isArray(maybe) ? (maybe as T[]) : fallback;
  }
  function obj<T extends object>(maybe: any, fallback: T): T {
    return maybe && typeof maybe === 'object' ? (maybe as T) : fallback;
  }

  useEffect(() => {
    const idx = keys.indexOf(active);
    const el = tabsRef.current[idx];
    if (el) el.focus({ preventScroll: true });
  }, [active, keys]);

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = keys.indexOf(active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(keys[(idx + 1) % keys.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(keys[(idx - 1 + keys.length) % keys.length]);
    }
  }

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Sekcje playbooka"
        id={tablistId}
        className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2"
        onKeyDown={onKeyDown}
      >
        {keys.map((k, i) => (
          <button
            key={k}
            ref={(el) => (tabsRef.current[i] = el)}
            role="tab"
            aria-selected={active === k}
            aria-controls={`${tablistId}-${k}`}
            id={`${tablistId}-tab-${k}`}
            className={`rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 ${
              active === k
                ? 'bg-white text-slate-900 font-semibold'
                : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
            }`}
            onClick={() => onChange(k)}
          >
            {TAB_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {active === 'tldr' && (
          <section role="tabpanel" id={`${tablistId}-tldr`} aria-labelledby={`${tablistId}-tab-tldr`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">TL;DR (60 sekund)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80">
              {arr<string>(overrides?.sixtySeconds, item.sixtySeconds).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}

        {active === 'pre' && (
          <section role="tabpanel" id={`${tablistId}-pre`} aria-labelledby={`${tablistId}-tab-pre`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Przed publikacją</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-semibold text-white/80">T-24h</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.preRelease?.t24h, item.preRelease.t24h).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80">T-2h</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.preRelease?.t2h, item.preRelease.t2h).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80">T-15m</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.preRelease?.t15m, item.preRelease.t15m).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        {active === 'live' && (
          <section role="tabpanel" id={`${tablistId}-live`} aria-labelledby={`${tablistId}-tab-live`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">W trakcie publikacji</h3>
            <ol className="mt-2 list-decimal pl-6 space-y-1 text-white/80">
              {arr<string>(overrides?.during, item.during).map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </section>
        )}

        {active === 'scenarios' && (
          <section role="tabpanel" id={`${tablistId}-scenarios`} aria-labelledby={`${tablistId}-tab-scenarios`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Scenariusze (EDU)</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {arr<any>(overrides?.scenarios, item.scenarios).map((sc) => (
                <div key={sc.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <div className="text-white font-semibold">{sc.title}</div>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80">
                    {sc.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                  {sc.caveats.length > 0 && (
                    <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
                      <div className="text-amber-200 text-sm font-semibold">Uwaga: kiedy może nie zadziałać</div>
                      <ul className="mt-1 list-disc pl-5 space-y-1 text-amber-200/90 text-sm">
                        {sc.caveats.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {active === 'pitfalls' && (
          <section role="tabpanel" id={`${tablistId}-pitfalls`} aria-labelledby={`${tablistId}-tab-pitfalls`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Pułapki interpretacji</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80">
              {arr<string>(overrides?.pitfalls, item.pitfalls).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </section>
        )}

        {active === 'map' && (
          <section role="tabpanel" id={`${tablistId}-map`} aria-labelledby={`${tablistId}-tab-map`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Mapa rynków</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-semibold text-white/80">Pierwsi reagują</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.marketMap?.firstReactors, item.marketMap.firstReactors).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80">Potwierdzenia</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.marketMap?.confirmations, item.marketMap.confirmations).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80">Weryfikacje krzyżowe</div>
                <ul className="mt-1 list-disc pl-5 space-y-1 text-white/80">
                  {arr<string>(overrides?.marketMap?.crossChecks, item.marketMap.crossChecks).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        {active === 'risk' && (
          <section role="tabpanel" id={`${tablistId}-risk`} aria-labelledby={`${tablistId}-tab-risk`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Ryzyko (EDU)</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80">
              {arr<string>(overrides?.risks, item.risks).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>
        )}

        {active === 'quiz' && (
          <section role="tabpanel" id={`${tablistId}-quiz`} aria-labelledby={`${tablistId}-tab-quiz`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Quiz (EDU)</h3>
            <div className="mt-2">{renderQuiz(arr<any>(overrides?.quiz, undefined as any))}</div>
          </section>
        )}

        {active === 'glossary' && (
          <section role="tabpanel" id={`${tablistId}-glossary`} aria-labelledby={`${tablistId}-tab-glossary`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold tracking-tight">Słownik</h3>
            <dl className="mt-3 space-y-3">
              {arr<any>(overrides?.glossary, item.glossary).map((g, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                  <dt className="font-semibold text-white">{g.term}</dt>
                  <dd className="text-white/80 text-sm mt-1">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}


