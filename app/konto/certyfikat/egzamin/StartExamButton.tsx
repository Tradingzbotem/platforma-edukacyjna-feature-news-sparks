'use client';

import { useCallback, useState } from 'react';

import type { CertificationTrack } from '@/lib/certifications/types';
import { CERTIFICATION_TRACK_LABELS_PL } from '@/lib/certifications/constants';

const btnPrimary =
  'inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/15 px-8 text-sm font-semibold text-amber-50 transition hover:border-amber-400/70 hover:bg-amber-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-45';

const btnSecondary =
  'inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/18 bg-white/[0.06] px-6 text-sm font-semibold text-white/88 transition hover:border-white/28 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

type Props = {
  track: CertificationTrack;
  disabled?: boolean;
  disabledReason?: string;
  /** Nadpisuje domyślny tekst przycisku (np. „Ponów egzamin”). */
  label?: string;
  /** Nadpisuje klasy przycisku (np. styl wiersza na liście certyfikatów). */
  buttonClassName?: string;
  /** Klasy kontenera (komunikaty błędów, przycisk konfliktu). */
  rootClassName?: string;
};

type StartJson = {
  ok?: boolean;
  error?: string;
  attempt?: { id?: string };
  activeAttempt?: { id?: string; track?: CertificationTrack };
};

function messageForError(code: string | undefined): string {
  switch (code) {
    case 'unauthorized':
      return 'Sesja wygasła. Zaloguj się ponownie.';
    case 'not_found':
      return 'Brak dostępu do modułu egzaminu.';
    case 'database_unavailable':
      return 'Baza danych jest niedostępna. Spróbuj ponownie później.';
    case 'invalid_json':
    case 'invalid_track':
      return 'Nieprawidłowa ścieżka egzaminu. Odśwież stronę i wybierz ponownie.';
    case 'create_failed':
    case 'server_error':
      return 'Serwer nie mógł uruchomić egzaminu. Spróbuj ponownie.';
    default:
      return 'Nie udało się rozpocząć egzaminu. Spróbuj ponownie.';
  }
}

export default function StartExamButton({
  track,
  disabled,
  disabledReason,
  label,
  buttonClassName,
  rootClassName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictAttemptId, setConflictAttemptId] = useState<string | null>(null);

  const goToAttempt = useCallback((attemptId: string) => {
    const path = `/konto/certyfikat/egzamin/${encodeURIComponent(attemptId)}`;
    window.location.assign(path);
  }, []);

  async function onStart() {
    setError(null);
    setConflictAttemptId(null);
    setLoading(true);
    try {
      const res = await fetch('/api/konto/certyfikat/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ track }),
      });

      let data: StartJson = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text) as StartJson;
      } catch {
        setError('Niepoprawna odpowiedź serwera. Spróbuj ponownie.');
        return;
      }

      if (res.status === 409 && data.error === 'other_track_active' && data.activeAttempt?.id) {
        setConflictAttemptId(data.activeAttempt.id);
        const other =
          data.activeAttempt.track != null
            ? CERTIFICATION_TRACK_LABELS_PL[data.activeAttempt.track]
            : 'inna ścieżka';
        setError(
          `Masz już aktywną sesję egzaminu na ścieżce: ${other}. Dokończ ją albo przejdź do niej — nie można równolegle uruchomić innej ścieżki.`,
        );
        return;
      }

      if (!res.ok || !data.ok || !data.attempt?.id) {
        setError(messageForError(data.error));
        return;
      }

      goToAttempt(data.attempt.id);
    } catch {
      setError('Błąd sieci. Sprawdź połączenie i spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/55">{disabledReason ?? 'Egzamin jest chwilowo niedostępny.'}</p>
      </div>
    );
  }

  const primaryClass = buttonClassName ?? btnPrimary;
  const rootCls = rootClassName ?? 'space-y-3';

  return (
    <div className={rootCls}>
      <button
        type="button"
        className={primaryClass}
        onClick={onStart}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Uruchamianie…' : (label ?? 'Rozpocznij egzamin')}
      </button>
      {error ? <p className="text-sm leading-relaxed text-red-300/90">{error}</p> : null}
      {conflictAttemptId ? (
        <button type="button" className={btnSecondary} onClick={() => goToAttempt(conflictAttemptId)}>
          Przejdź do aktywnej sesji
        </button>
      ) : null}
    </div>
  );
}
