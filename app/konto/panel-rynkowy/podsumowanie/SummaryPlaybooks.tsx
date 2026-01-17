'use client';

import Link from 'next/link';
import type { Playbook } from '@/lib/panel/playbooks';

type Props = {
  playbooks: Playbook[];
};

export default function SummaryPlaybooks({ playbooks }: Props) {
  if (playbooks.length === 0) {
    return (
      <div className="text-white/70 text-sm">
        <p>Brak dostępnych playbooków.</p>
      </div>
    );
  }

  // Pokaż 2-3 najważniejsze playbooki z konkretnymi scenariuszami
  const featuredPlaybooks = playbooks.slice(0, 3);

  return (
    <div className="space-y-4">
      {featuredPlaybooks.map((playbook) => (
        <div key={playbook.slug} className="rounded-lg border border-white/10 bg-white/5 p-4">
          {/* Header */}
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">{playbook.title}</h3>
              <p className="text-xs text-white/70">{playbook.summaryOneLine}</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${
              playbook.importance === 'high'
                ? 'text-red-300 border-red-400/30 bg-red-500/10'
                : playbook.importance === 'medium'
                ? 'text-amber-300 border-amber-400/30 bg-amber-500/10'
                : 'text-white/70 border-white/20 bg-white/5'
            }`}>
              {playbook.importance === 'high' ? 'Wysoka' : playbook.importance === 'medium' ? 'Średnia' : 'Niska'}
            </span>
          </div>

          {/* Typowe reakcje - scenariusze */}
          {playbook.scenarios && playbook.scenarios.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-white/90 mb-2">Co zwykle działa:</div>
              <div className="space-y-2">
                {playbook.scenarios.slice(0, 2).map((scenario, idx) => (
                  <div key={idx} className="rounded border border-white/10 bg-slate-950/40 p-2.5">
                    <div className="text-xs font-medium text-white/90 mb-1">{scenario.title}</div>
                    <ul className="space-y-1">
                      {scenario.details.slice(0, 2).map((detail, i) => (
                        <li key={i} className="text-xs text-white/70 flex items-start gap-1.5">
                          <span className="text-white/40 mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {scenario.caveats && scenario.caveats.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-[10px] font-medium text-amber-300/90 mb-1">Uważaj:</div>
                        <p className="text-[10px] text-amber-300/80">{scenario.caveats[0]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pułapki */}
          {playbook.pitfalls && playbook.pitfalls.length > 0 && (
            <div className="mb-3 rounded border border-amber-400/20 bg-amber-500/5 p-2.5">
              <div className="text-xs font-semibold text-amber-300 mb-1.5">Na co uważać:</div>
              <ul className="space-y-1">
                {playbook.pitfalls.slice(0, 3).map((pitfall, idx) => (
                  <li key={idx} className="text-xs text-amber-200/80 flex items-start gap-1.5">
                    <span className="text-amber-400/60 mt-0.5">⚠</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Powiązane aktywa */}
          {playbook.related && playbook.related.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {playbook.related.slice(0, 4).map((asset, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70"
                >
                  {asset}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Link do wszystkich playbooków */}
      {playbooks.length > featuredPlaybooks.length && (
        <div className="pt-2">
          <Link
            href="/konto/panel-rynkowy/playbooki-eventowe"
            className="text-xs text-white/60 hover:text-white/90 transition-colors inline-flex items-center gap-1"
          >
            Zobacz wszystkie playbooki ({playbooks.length}) →
          </Link>
        </div>
      )}
    </div>
  );
}
