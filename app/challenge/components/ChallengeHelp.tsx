'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ChallengeHelp() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="mx-auto mt-4 max-w-5xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="challenge-help-dialog"
      >
        <span aria-hidden>ℹ️</span>
        Jak liczymy punktację i wyniki
      </button>

      {/* Native <dialog> for accessibility + graceful fallback */}
      <dialog
        id="challenge-help-dialog"
        ref={dialogRef}
        className="rounded-2xl border border-white/10 bg-slate-900 p-0 text-white backdrop:bg-black/60"
        onClose={() => setOpen(false)}
      >
        <div className="w-[min(92vw,720px)]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-base font-semibold text-white">Zasady punktacji i rozliczeń</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 transition-colors"
              aria-label="Zamknij"
            >
              ✕
            </button>
          </header>

          <div className="px-5 py-4">
            <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
              <li>
                <span className="font-medium text-white">Horyzont</span> – określa, kiedy wyzwanie jest
                rozliczane (np. EOD, 48h, 5 sesji). Po upływie czasu karta przechodzi w status
                <span className="text-yellow-300"> „rozliczanie”</span>, a maks. po <b>30 sekundach</b> w
                <span className="text-white/60"> „zakończone”</span>.
              </li>
              <li>
                <span className="font-medium text-white">Punktacja bazowa</span>:
                <ul className="mt-1 space-y-1 pl-5">
                  <li>trafny ↑/↓: <b>+10 XP</b></li>
                  <li>remis (↔ lub ruch ≤ ±0,30%): <b>+3 XP</b></li>
                  <li>pudło: <b>0 XP</b></li>
                </ul>
              </li>
              <li>
                <span className="font-medium text-white">Bonus za pewność</span> (tylko przy trafieniu):
                <ul className="mt-1 space-y-1 pl-5">
                  <li>≥ 70%: <b>+1 XP</b></li>
                  <li>≥ 90%: <b>+2 XP</b></li>
                </ul>
              </li>
              <li>
                <span className="font-medium text-white">Źródła decyzji</span> – sugeruj się
                skrótem z modułu <b>News</b> (nagłówki, makro, geopolityka, czynniki specyficzne),
                zmianą 24h/5D, mini-sparklinem i kontekstem (CPI/NFP, banki centralne, rentowności).
              </li>
              <li>
                <span className="font-medium text-white">Odświeżanie slotów</span> – każda karta dostaje nową
                edycję w ciągu <b>≤ 30 s</b> od rozliczenia.
              </li>
              <li>
                <span className="font-medium text-white">Ranking globalny</span> – sumuje wyłącznie
                <b> zrealizowane XP</b> (po rozliczeniu). Dane trzymamy w <b>Neon (Postgres)</b>.
              </li>
              <li className="text-white/60">
                Uwaga: moduł edukacyjny – <b>to nie jest porada inwestycyjna</b>.
              </li>
            </ul>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
            >
              Zamknij
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
