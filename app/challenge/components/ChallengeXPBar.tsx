'use client';

import { useXPStore } from '../hooks/useXPStore';

function ChallengeXPBar() {
  const { xp, progress, currentLevel, nextLevel } = useXPStore();

  return (
    <div className="mt-10 w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div className="flex justify-between mb-1 text-slate-900">
        <span className="font-semibold">{currentLevel.name}</span>
        <span className="text-slate-600">
          XP: {xp}
          {nextLevel && (
            <span className="opacity-70"> / {nextLevel.threshold}</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ChallengeXPBar;


