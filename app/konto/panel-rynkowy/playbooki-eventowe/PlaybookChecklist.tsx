// app/konto/panel-rynkowy/playbooki-eventowe/PlaybookChecklist.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Playbook } from '@/lib/panel/playbooks';

type Props = {
  item: Playbook;
};

function storageKey(slug: string) {
  return `pb-checklist:${slug}`;
}

export default function PlaybookChecklist({ item }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const total = item.checklist.length;
  const completed = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(item.slug));
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {}
  }, [item.slug]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(item.slug), JSON.stringify(checked));
    } catch {}
  }, [item.slug, checked]);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside className="sticky top-4 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Checklista</div>
          <div className="text-xs text-white/70">{completed}/{total}</div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <ul className="mt-3 space-y-2">
          {item.checklist.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <input
                id={`chk-${c.id}`}
                type="checkbox"
                checked={!!checked[c.id]}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900/60 text-white focus:ring-white/30"
              />
              <label htmlFor={`chk-${c.id}`} className="text-sm text-white/80 leading-tight cursor-pointer">{c.label}</label>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Szybkie pytania do Asystenta AI</div>
        <div className="mt-2 grid gap-2">
          {item.quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(q);
                  // simple UX: basic notification
                  alert('Skopiowano pytanie do schowka.');
                } catch {}
              }}
              className="text-left rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Powiązane</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {item.related.map((t) => (
            <span key={t} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">{t}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}


