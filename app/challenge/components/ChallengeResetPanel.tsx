'use client';

import React, { useState } from 'react';
import { useXPStore } from '../hooks/useXPStore';

function ChallengeResetPanel() {
  const { resetXP } = useXPStore();
  const [confirming, setConfirming] = useState<'none' | 'picks' | 'xp'>('none');
  const [msg, setMsg] = useState<string>('');

  function clearPicks() {
    try {
      localStorage.removeItem('fxedu:challenge:picks:v1');
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('fxedu:challenge:resultPosted:'))
          localStorage.removeItem(k);
      });
      setMsg('Typy i flagi wyników wyczyszczone ✅');
    } catch {
      setMsg('Błąd podczas czyszczenia');
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <h3 className="mb-3 text-center font-semibold text-slate-900">
        Zarządzanie danymi Challenge
      </h3>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {confirming !== 'picks' ? (
          <button
            onClick={() => setConfirming('picks')}
            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100"
          >
            Wyczyść typy
          </button>
        ) : (
          <button
            onClick={() => {
              clearPicks();
              setConfirming('none');
            }}
            className="rounded-md border border-rose-300 bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
          >
            Potwierdź czyszczenie typów
          </button>
        )}

        {confirming !== 'xp' ? (
          <button
            onClick={() => setConfirming('xp')}
            className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-yellow-700 hover:bg-yellow-100"
          >
            Resetuj XP
          </button>
        ) : (
          <button
            onClick={() => {
              resetXP();
              setConfirming('none');
              setMsg('XP zresetowany ✅');
            }}
            className="rounded-md border border-yellow-300 bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600"
          >
            Potwierdź reset XP
          </button>
        )}
      </div>

      {msg && <p className="mt-3 text-center text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

export default ChallengeResetPanel;
