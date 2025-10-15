'use client';

import { useXPStore } from '../hooks/useXPStore';

function ChallengeXPBar() {
  const { xp, progress, currentLevel, nextLevel } = useXPStore();

  return (
    <div className="mt-10 w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm shadow-inner">
      <div className="flex justify-between mb-1">
        <span className="font-semibold text-white">{currentLevel.name}</span>
        <span className="text-muted-foreground">
          XP: {xp}
          {nextLevel && (
            <span className="opacity-70"> / {nextLevel.threshold}</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ChallengeXPBar;


