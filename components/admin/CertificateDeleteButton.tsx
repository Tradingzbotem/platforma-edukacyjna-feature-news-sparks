'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  recordId: string;
  fullNameHint?: string;
  /** Po sukcesie przejdź na listę (np. ze strony szczegółów). */
  redirectToList?: boolean;
  className?: string;
};

export function CertificateDeleteButton({
  recordId,
  fullNameHint,
  redirectToList = false,
  className,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    const msg = fullNameHint
      ? `Na pewno trwale usunąć certyfikat dla „${fullNameHint}”? Tej operacji nie cofniesz.`
      : 'Na pewno trwale usunąć ten certyfikat? Tej operacji nie cofniesz.';
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/certifications/${encodeURIComponent(recordId)}`, {
        method: 'DELETE',
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        window.alert(
          data?.error === 'not_found' ? 'Rekord nie został znaleziony.' : 'Nie udało się usunąć certyfikatu.',
        );
        return;
      }
      if (redirectToList) {
        router.push('/admin/certifications');
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className={
        className ??
        'rounded-md border border-red-600/50 bg-red-600/15 px-3 py-1.5 text-sm text-red-100 hover:bg-red-600/25 disabled:opacity-50'
      }
    >
      {busy ? 'Usuwanie…' : 'Usuń na stałe'}
    </button>
  );
}
