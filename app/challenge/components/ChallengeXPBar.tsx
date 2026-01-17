'use client';

import { useXPStore } from '../hooks/useXPStore';

function ChallengeXPBar() {
  const { xp, progress, currentLevel, nextLevel } = useXPStore();

  return (
    <div className="mt-10 w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
      <div className="flex justify-between mb-1 text-white">
        <span className="font-semibold">{currentLevel.name}</span>
        <span className="text-white/70">
          XP: {xp}
          {nextLevel && (
            <span className="opacity-70"> / {nextLevel.threshold}</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ChallengeXPBar;


