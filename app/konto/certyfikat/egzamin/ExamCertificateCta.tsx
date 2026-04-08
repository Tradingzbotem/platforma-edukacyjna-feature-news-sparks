'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Snapshot = {
  isTerminal: boolean;
  passed: boolean | null;
  existingRecordId: string | null;
};

type Props = {
  attemptId: string;
  /** Z serwera (strona po odświeżeniu); po zakończeniu egzaminu w kliencie zwykle null dla istniejącego certyfikatu. */
  initialSnapshot?: Snapshot | null;
};

const btnPrimary =
  'inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-6 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(245,158,11,0.35)] transition hover:shadow-[0_0_36px_rgba(245,158,11,0.5)] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none';

const btnSecondary =
  'inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white/90 hover:border-white/25';

export default function ExamCertificateCta({ attemptId, initialSnapshot }: Props) {
  const router = useRouter();
  const [snap, setSnap] = useState<Snapshot | null>(initialSnapshot ?? null);
  const [loading, setLoading] = useState(!initialSnapshot);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/konto/certyfikat/exam/${encodeURIComponent(attemptId)}/certificate`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        ok?: boolean;
        isTerminal?: boolean;
        passed?: boolean | null;
        existingRecordId?: string | null;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError('Nie udało się wczytać statusu certyfikatu.');
        return;
      }
      setSnap({
        isTerminal: Boolean(data.isTerminal),
        passed: data.passed ?? null,
        existingRecordId: data.existingRecordId ?? null,
      });
    } catch {
      setError('Błąd sieci przy wczytywaniu statusu certyfikatu.');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/konto/certyfikat/exam/${encodeURIComponent(attemptId)}/certificate`, {
        method: 'POST',
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        ok?: boolean;
        redirectPath?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.redirectPath) {
        if (data.error === 'not_passed') {
          setError('Certyfikat można wygenerować tylko po zaliczeniu egzaminu.');
        } else if (data.error === 'not_terminal') {
          setError('Poczekaj na zakończenie sesji egzaminacyjnej.');
        } else {
          setError('Nie udało się wygenerować certyfikatu. Spróbuj ponownie.');
        }
        return;
      }
      router.push(data.redirectPath);
    } catch {
      setError('Błąd sieci przy generowaniu certyfikatu.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading && !snap) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/50">
        Wczytywanie statusu certyfikatu…
      </div>
    );
  }

  if (!snap) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/60">
        {error ?? 'Nie udało się wczytać statusu certyfikatu.'}
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="mt-3 block text-xs text-amber-200/90 underline-offset-4 hover:underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!snap.isTerminal) {
    return null;
  }

  const existingId = snap.existingRecordId;
  const passed = snap.passed === true;
  const mojPath = existingId ? `/konto/certyfikat/moj/${encodeURIComponent(existingId)}` : null;
  const pdfHref = existingId ? `/api/konto/certyfikat/pdf?recordId=${encodeURIComponent(existingId)}` : null;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/25 px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Certyfikat FXEDULAB</p>

      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}

      {existingId && mojPath && pdfHref ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={mojPath} className={btnPrimary}>
            Zobacz certyfikat
          </Link>
          <a href={pdfHref} className={btnSecondary}>
            Pobierz certyfikat (PDF)
          </a>
        </div>
      ) : passed ? (
        <div className="space-y-3">
          <p className="text-sm text-white/70">
            Możesz wygenerować certyfikat i zapisać go na koncie. Wystawienie jest jednorazowe dla tej ścieżki.
          </p>
          <button type="button" onClick={() => void onGenerate()} disabled={generating} className={btnPrimary}>
            {generating ? 'Generowanie…' : 'Wygeneruj certyfikat'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-white/60">Certyfikat jest dostępny po zaliczeniu egzaminu.</p>
      )}

      <button
        type="button"
        onClick={() => void load()}
        className="text-xs text-white/40 underline-offset-4 hover:text-white/55 hover:underline"
      >
        Odśwież status
      </button>
    </div>
  );
}
