'use client';

import { useEffect, useState } from "react";

const COURSE_KEYS = ['podstawy','forex','cfd','zaawansowane'] as const;
const QUIZ_KEYS   = ['podstawy','forex','cfd','zaawansowane'] as const;

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [toast, setToast] = useState<{ msg: string; open: boolean }>({ msg: '', open: false });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    try {
      const n = localStorage.getItem('user:name');
      if (n) setName(n);
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem('user:name', name.trim() || 'Użytkownik');
      setToast({ msg: 'Zapisano zmiany.', open: true });
      setTimeout(() => setToast({ msg: '', open: false }), 2000);
    } catch {}
  };

  const resetProgress = () => {
    setConfirmOpen(true);
  };

  return (
    <section className="relative rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Ustawienia profilu</h2>

      <label className="block">
        <div className="mb-1 text-sm text-slate-600">Wyświetlana nazwa</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Twoje imię/nick"
          className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-900 placeholder:text-slate-400"
        />
      </label>

      <div className="flex gap-3">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
          Zapisz
        </button>
        <button onClick={resetProgress} className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
          Wyczyść cały postęp
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Dane przechowywane są lokalnie w przeglądarce (localStorage). Po wdrożeniu logowania można łatwo
        przenieść te mechanizmy na backend (użytkownik = konto, postęp = baza).
      </p>

      {/* Toast */}
      {toast.open && (
        <div className="pointer-events-none absolute right-4 bottom-4">
          <div className="pointer-events-auto rounded-lg bg-slate-900 text-white text-sm px-3 py-2 shadow-lg ring-1 ring-black/10">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Modal potwierdzenia */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Potwierdź wyczyszczenie</h3>
            <p className="mt-1 text-sm text-slate-600">
              Na pewno wyczyścić postęp kursów i wyniki quizów? Tego nie można cofnąć.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  try {
                    COURSE_KEYS.forEach(k => localStorage.removeItem(`course:${k}:done`));
                    QUIZ_KEYS.forEach(k => localStorage.removeItem(`quiz:${k}:best`));
                    setToast({ msg: 'Wyczyszczono postęp.', open: true });
                    setTimeout(() => setToast({ msg: '', open: false }), 2000);
                  } catch {}
                  setConfirmOpen(false);
                }}
                className="px-3 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
              >
                Wyczyść
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
