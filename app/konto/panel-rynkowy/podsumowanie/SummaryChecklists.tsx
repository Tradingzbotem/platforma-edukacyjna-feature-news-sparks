'use client';

import { useEffect, useState } from 'react';
import type { ChecklistGroup } from '@/lib/panel/checklists';

type Props = {
  checklists: ChecklistGroup[];
};

// Hook do odczytu stanu checklist z localStorage
function usePersistentChecks(key: string, defaultValue: Record<string, boolean>) {
  const [state, setState] = useState<Record<string, boolean>>(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch {
      // ignore
    }
  }, [key]);

  return state;
}

export default function SummaryChecklists({ checklists }: Props) {
  const checks = usePersistentChecks('panel_checklists_v1', {});

  // Oblicz statystyki
  const stats = checklists.reduce(
    (acc, group) => {
      const groupItems = group.items || [];
      const checked = groupItems.filter((item) => checks[item.id]).length;
      acc.total += groupItems.length;
      acc.checked += checked;
      return acc;
    },
    { total: 0, checked: 0 }
  );

  const progress = stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0;

  // Pokaż najważniejsze pozycje z każdej grupy
  const importantItems = checklists.flatMap((group) =>
    (group.items || []).slice(0, 2).map((item) => ({
      ...item,
      groupTitle: group.title,
      checked: checks[item.id] || false,
    }))
  );

  return (
    <div className="space-y-3">
      {/* Statystyki */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Postęp</span>
          <span className="text-xs text-white/70">{stats.checked}/{stats.total}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/50 mt-1.5">{progress}% ukończone</p>
      </div>

      {/* Najważniejsze pozycje */}
      <div className="space-y-1.5">
        {importantItems.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={item.checked}
              readOnly
              className="mt-0.5 h-3 w-3 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className={item.checked ? 'text-white/50 line-through' : 'text-white/80'}>
                {item.text}
              </span>
            </div>
          </div>
        ))}
      </div>

      {stats.checked === 0 && (
        <p className="text-xs text-white/50 italic">
          Zacznij odchaczać pozycje w module.
        </p>
      )}
    </div>
  );
}
