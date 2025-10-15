'use client';

import { useEffect, useState } from "react";

const COURSE_KEYS = ['podstawy','forex','cfd','zaawansowane'] as const;
const QUIZ_KEYS   = ['podstawy','forex','cfd','zaawansowane'] as const;

export default function SettingsPage() {
  const [name, setName] = useState('');

  useEffect(() => {
    try {
      const n = localStorage.getItem('user:name');
      if (n) setName(n);
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem('user:name', name.trim() || 'Użytkownik');
      alert('Zapisano.');
    } catch {}
  };

  const resetProgress = () => {
    if (!confirm('Na pewno wyczyścić postęp kursów i wyniki quizów?')) return;
    try {
      COURSE_KEYS.forEach(k => localStorage.removeItem(`course:${k}:done`));
      QUIZ_KEYS.forEach(k => localStorage.removeItem(`quiz:${k}:best`));
      alert('Wyczyszczono.');
    } catch {}
  };

  return (
    <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 space-y-6">
      <h2 className="text-xl font-semibold">Ustawienia profilu</h2>

      <label className="block">
        <div className="mb-1 text-sm text-slate-300">Wyświetlana nazwa</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Twoje imię/nick"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
        />
      </label>

      <div className="flex gap-3">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">
          Zapisz
        </button>
        <button onClick={resetProgress} className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500/30">
          Wyczyść cały postęp
        </button>
      </div>

      <p className="text-xs text-white/60">
        Dane przechowywane są lokalnie w przeglądarce (localStorage). Po wdrożeniu logowania można łatwo
        przenieść te mechanizmy na backend (użytkownik = konto, postęp = baza).
      </p>
    </section>
  );
}
