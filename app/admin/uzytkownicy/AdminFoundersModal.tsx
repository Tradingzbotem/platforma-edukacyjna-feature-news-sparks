'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type FoundersTokenAdmin = {
  id: string;
  code: string;
  title: string;
  status: string;
  accessActive: boolean;
  transferable: boolean;
  transferLocked: boolean;
  allowAccessWithoutNft: boolean;
  nftLabel: string;
  adminNotes: string | null;
  grantedByAdminId: string | null;
  grantedAt: string | null;
};

type Props = {
  userId: string;
  email: string;
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export default function AdminFoundersModal({ userId, email, open, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'revoked' | 'inactive'>('active');
  const [adminNotes, setAdminNotes] = useState('');
  const [allowAccessWithoutNft, setAllowAccessWithoutNft] = useState(false);
  const [transferLocked, setTransferLocked] = useState(false);
  const [transferable, setTransferable] = useState(true);
  const [nftLabel, setNftLabel] = useState('Founders');
  const [error, setError] = useState<string | null>(null);
  /** Zapisany kod z API — gdy pole „kod” jest puste przy zapisie, używamy tej wartości (nie zmieniamy slotu przypadkiem). */
  const [resolvedCodeFallback, setResolvedCodeFallback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/founders-token/by-user?userId=${encodeURIComponent(userId)}`, {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const t = data?.token as FoundersTokenAdmin | null;
      if (t) {
        setCode(t.code);
        setResolvedCodeFallback(t.code);
        setStatus(t.status as typeof status);
        setAdminNotes(t.adminNotes ?? '');
        setAllowAccessWithoutNft(t.allowAccessWithoutNft);
        setTransferLocked(t.transferLocked);
        setTransferable(t.transferable);
        setNftLabel(t.nftLabel || 'Founders');
      } else {
        setCode('');
        setResolvedCodeFallback(null);
        setStatus('active');
        setAdminNotes('');
        setAllowAccessWithoutNft(false);
        setTransferLocked(false);
        setTransferable(true);
        setNftLabel('Founders');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nie udało się wczytać Founders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  if (!open) return null;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        assignToUserId: userId,
        status,
        adminNotes: adminNotes.trim() || null,
        allowAccessWithoutNft,
        transferLocked,
        transferable,
        nftLabel: nftLabel.trim() || 'Founders',
      };
      const c = code.trim() || resolvedCodeFallback?.trim() || '';
      if (c) body.code = c;

      const r = await fetch('/api/admin/founders-token/assign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.error || `HTTP ${r.status}`);
      }
      onSaved('Zapisano Founders w bazie.');
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Zapis nie powiódł się');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-white/15 bg-slate-900 text-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">Founders (baza)</h2>
            <p className="mt-0.5 text-xs text-white/50 break-all">{email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto px-4 py-4 space-y-4 text-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Wczytywanie…
            </div>
          ) : (
            <>
              <p className="text-xs text-white/45">
                Półmanualne członkostwo — bez portfela. Domyślny kod (gdy pole puste przy zapisie):{' '}
                <span className="font-mono text-white/60">fxe-founders-{'{userId}'}</span>.
              </p>

              <label className="block space-y-1">
                <span className="text-xs text-white/50">Kod slotu (opcjonalnie)</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-md bg-slate-800 border border-white/10 px-2 py-2 font-mono text-xs"
                  placeholder="Pozostaw puste — wygenerujemy domyślny"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-white/50">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full rounded-md bg-slate-800 border border-white/10 px-2 py-2"
                >
                  <option value="active">Aktywny</option>
                  <option value="pending">Oczekujący</option>
                  <option value="revoked">Cofnięty</option>
                  <option value="inactive">Nieaktywny</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-white/50">Etykieta NFT (biznesowa)</span>
                <input
                  value={nftLabel}
                  onChange={(e) => setNftLabel(e.target.value)}
                  className="w-full rounded-md bg-slate-800 border border-white/10 px-2 py-2"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-white/50">Notatka (tylko admin)</span>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md bg-slate-800 border border-white/10 px-2 py-2 text-xs"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-white/85">
                <input
                  type="checkbox"
                  checked={allowAccessWithoutNft}
                  onChange={(e) => setAllowAccessWithoutNft(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800"
                />
                Dostęp bez NFT (trial / promocja / wyjątek)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-white/85">
                <input
                  type="checkbox"
                  checked={transferLocked}
                  onChange={(e) => setTransferLocked(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800"
                />
                Blokada transferu przez użytkownika
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-white/85">
                <input
                  type="checkbox"
                  checked={transferable}
                  onChange={(e) => setTransferable(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800"
                />
                Token z możliwością transferu (gdy nie zablokowany)
              </label>
            </>
          )}

          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Anuluj
          </button>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
