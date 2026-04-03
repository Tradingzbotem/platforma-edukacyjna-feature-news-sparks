'use client';

import { useState } from 'react';

export default function FoundersTokenTransferForm() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/founders-token/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: email.trim().toLowerCase(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: data?.error || `Błąd (${res.status})` });
        return;
      }
      setMessage({ type: 'ok', text: 'Token został przeniesiony. Za chwilę strona się odświeży.' });
      setEmail('');
      setNote('');
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage({ type: 'err', text: 'Sieć niedostępna. Spróbuj ponownie.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1">Email odbiorcy (konto na platformie)</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
          placeholder="odbiorca@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1">Notatka (opcjonalnie)</label>
        <input
          type="text"
          maxLength={500}
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
          placeholder="np. darowizna wewnątrz platformy"
        />
      </div>
      {message ? (
        <p className={`text-sm ${message.type === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>{message.text}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Przenoszenie…' : 'Przenieś Founders Pass'}
      </button>
    </form>
  );
}
