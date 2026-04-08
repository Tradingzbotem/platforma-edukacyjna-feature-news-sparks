'use client';

import { useCallback, useRef, useState } from 'react';

const FETCH_TIMEOUT_MS = 120_000;

type Props = {
  recordId: string;
  filename: string;
};

export function CertificatePdfDownloadButton({ recordId, filename }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef(false);

  const download = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    setError(null);

    const url = `/api/admin/certifications/${encodeURIComponent(recordId)}/pdf`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      window.clearTimeout(timer);

      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('application/pdf')) {
        setError('Serwer nie zwrócił pliku PDF (sprawdź uprawnienia lub logi).');
        return;
      }

      const blob = await res.blob();
      if (!blob.size) {
        setError('Otrzymano pusty plik PDF.');
        return;
      }

      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      window.clearTimeout(timer);
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError('Przekroczono czas oczekiwania na PDF (120 s).');
      } else {
        setError('Nie udało się pobrać PDF.');
      }
    } finally {
      lockRef.current = false;
      setBusy(false);
    }
  }, [filename, recordId]);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void download()}
        disabled={busy}
        className="inline-flex w-fit rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Generowanie PDF…' : 'Pobierz PDF'}
      </button>
      {error ? <p className="max-w-xl text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
