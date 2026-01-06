'use client';

import CoachModes from './CoachModes';
import CoachIntake, { type IntakeState } from './CoachIntake';
import CoachStickyPanel from './CoachStickyPanel';
import CoachNotes from './CoachNotes';
import type { ContextSource } from '@/lib/panel/coachContext';
import type { Tier } from '@/lib/panel/access';
import { useMemo } from 'react';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

export default function CoachWorkspace({
  tier,
  intake,
  onChangeIntake,
  onComposeFromIntake,
  onInsertFromMode,
  contextSource,
  onChangeContextSource,
  children,
  messages,
}: {
  tier: Tier;
  intake: IntakeState;
  onChangeIntake: (next: IntakeState) => void;
  onComposeFromIntake: (prompt: string) => void;
  onInsertFromMode: (text: string) => void;
  contextSource: ContextSource;
  onChangeContextSource: (next: ContextSource) => void;
  children: React.ReactNode; // chat area (input+messages)
  messages: ChatMsg[];
}) {
  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === 'assistant' && m.content.trim()) return m.content;
    }
    return '';
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left column */}
      <div className="lg:col-span-3">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white/90">Coach AI (EDU) — workspace</h2>
          <p className="mt-1 text-xs text-white/70">
            Scenariusze warunkowe, checklisty, interpretacja danych. Bez rekomendacji i bez sygnałów.
          </p>
        </section>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <CoachModes onInsertPrompt={onInsertFromMode} />
        </div>
      </div>

      {/* Center column (chat) */}
      <div className="lg:col-span-6">
        <CoachIntake value={intake} onChange={onChangeIntake} onComposeQuestion={onComposeFromIntake} />
        <div className="mt-4">{children}</div>
      </div>

      {/* Right sticky column */}
      <div className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
        <div className="space-y-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <CoachStickyPanel
            intake={intake}
            onQuickInsert={onInsertFromMode}
            contextSource={contextSource}
            onChangeContextSource={onChangeContextSource}
            tier={tier}
          />
          <CoachNotes context={intake} lastAssistantText={lastAssistantText} />
        </div>
      </div>
    </div>
  );
}


