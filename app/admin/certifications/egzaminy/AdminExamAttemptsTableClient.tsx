'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminExamAttemptRow, CertificationExamAttemptStatus } from '@/lib/certification-exam/types';
import { CERTIFICATION_TRACK_LABELS } from '@/lib/certifications/constants';
import type { CertificationTrack } from '@/lib/certifications/types';

const ALL = '' as const;

const STATUS_OPTIONS: { value: typeof ALL | CertificationExamAttemptStatus; label: string }[] = [
  { value: ALL, label: 'Wszystkie etapy' },
  { value: 'IN_PROGRESS', label: 'W toku' },
  { value: 'PASSED', label: 'Zaliczony' },
  { value: 'FAILED', label: 'Niezaliczony' },
  { value: 'NOT_STARTED', label: 'Nie rozpoczęty' },
  { value: 'SUBMITTED', label: 'Przesłany' },
  { value: 'EXPIRED', label: 'Wygasły' },
];

const TRACK_OPTIONS: { value: typeof ALL | CertificationTrack; label: string }[] = [
  { value: ALL, label: 'Wszystkie ścieżki' },
  { value: 'FOREX_FUNDAMENTALS', label: CERTIFICATION_TRACK_LABELS.FOREX_FUNDAMENTALS },
  { value: 'TECHNICAL_ANALYSIS', label: CERTIFICATION_TRACK_LABELS.TECHNICAL_ANALYSIS },
  { value: 'RISK_MANAGEMENT', label: CERTIFICATION_TRACK_LABELS.RISK_MANAGEMENT },
];

function statusBadgeClass(status: CertificationExamAttemptStatus): string {
  switch (status) {
    case 'PASSED':
      return 'border-emerald-500/45 bg-emerald-500/12 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.28)]';
    case 'FAILED':
      return 'border-red-500/45 bg-red-500/12 text-red-200 shadow-[0_0_14px_rgba(239,68,68,0.28)]';
    case 'IN_PROGRESS':
      return 'border-sky-500/40 bg-sky-500/12 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.22)]';
    case 'EXPIRED':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-100';
    case 'NOT_STARTED':
    case 'SUBMITTED':
    default:
      return 'border-white/25 bg-white/[0.08] text-white/65 shadow-[0_0_12px_rgba(255,255,255,0.06)]';
  }
}

function statusLabel(status: CertificationExamAttemptStatus): string {
  const found = STATUS_OPTIONS.find((o) => o.value === status);
  return found?.label ?? status;
}

function trackBadgeClass(track: CertificationTrack): string {
  switch (track) {
    case 'FOREX_FUNDAMENTALS':
      return 'border-white/25 bg-white/[0.06] text-white/80 shadow-[0_0_8px_rgba(255,255,255,0.04)]';
    case 'TECHNICAL_ANALYSIS':
      return 'border-sky-500/40 bg-sky-500/12 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.22)]';
    case 'RISK_MANAGEMENT':
      return 'border-amber-400/35 bg-violet-500/15 text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.22)] ring-1 ring-amber-400/15';
    default:
      return 'border-white/20 bg-white/5 text-white/70';
  }
}

function filteredCountLabel(n: number): string {
  if (n === 1) return '1 wynik';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${n} wyniki`;
  }
  return `${n} wyników`;
}

function formatShortId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 10)}…`;
}

type Props = {
  items: AdminExamAttemptRow[];
};

export default function AdminExamAttemptsTableClient({ items }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<typeof ALL | CertificationExamAttemptStatus>(ALL);
  const [trackFilter, setTrackFilter] = useState<typeof ALL | CertificationTrack>(ALL);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteAttempt(row: AdminExamAttemptRow) {
    const label = row.userEmail ?? row.userName ?? formatShortId(row.id);
    if (
      !window.confirm(
        `Usunąć to podejście do egzaminu?\n\n${label}\nŚcieżka: ${CERTIFICATION_TRACK_LABELS[row.track]}\n\nTej operacji nie można cofnąć.`,
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/admin/certifications/exam-attempts/${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        window.alert(
          data.error === 'not_found'
            ? 'Nie znaleziono tego podejścia (mogło zostać już usunięte).'
            : data.error === 'database_unavailable'
              ? 'Baza danych jest niedostępna.'
              : 'Nie udało się usunąć podejścia.',
        );
        return;
      }
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let next = items.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (trackFilter && row.track !== trackFilter) return false;
      if (q) {
        const email = (row.userEmail ?? '').toLowerCase();
        const name = (row.userName ?? '').toLowerCase();
        const uid = row.userId.toLowerCase();
        const aid = row.id.toLowerCase();
        if (!email.includes(q) && !name.includes(q) && !uid.includes(q) && !aid.includes(q)) return false;
      }
      return true;
    });

    next = [...next].sort((a, b) => {
      const ta = new Date(a.updatedAt).getTime();
      const tb = new Date(b.updatedAt).getTime();
      return tb - ta;
    });

    return next;
  }, [items, statusFilter, trackFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-white/60">
          Etap / wynik
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-md border border-white/15 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value} className="bg-zinc-900">
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-white/60">
          Ścieżka
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as typeof trackFilter)}
            className="rounded-md border border-white/15 bg-white/5 px-2 py-2 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30"
          >
            {TRACK_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value} className="bg-zinc-900">
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-[1.2] flex-col gap-1 text-xs text-white/60">
          Szukaj (e-mail, imię, id użytkownika lub podejścia)
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="np. jan@ lub cuid…"
            className="rounded-md border border-white/15 bg-white/5 px-2 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30"
          />
        </label>
      </div>

      {filteredSorted.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/[0.02] py-10 text-center text-sm text-white/60">
          Brak wyników dla wybranych filtrów.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-white/65">{filteredCountLabel(filteredSorted.length)}</p>
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.05] text-xs uppercase tracking-wide text-white/55">
                  <th className="px-5 py-4 pr-6 font-medium">Użytkownik</th>
                  <th className="px-5 py-4 pr-6 font-medium">Ścieżka</th>
                  <th className="px-5 py-4 pr-6 font-medium">Etap</th>
                  <th className="px-5 py-4 pr-6 font-medium">Wynik</th>
                  <th className="px-5 py-4 pr-6 font-medium">Rozpoczęto</th>
                  <th className="px-5 py-4 pr-6 font-medium">Zakończono</th>
                  <th className="px-5 py-4 pr-6 font-medium">Ostatnia aktywność</th>
                  <th className="px-5 py-4 pr-6 font-medium">ID podejścia</th>
                  <th scope="col" className="w-28 px-4 py-4 text-right font-medium">
                    <span className="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={[
                      'border-b border-white/[0.07]',
                      rowIndex % 2 === 1 ? 'bg-white/[0.035]' : 'bg-transparent',
                    ].join(' ')}
                  >
                    <td className="px-5 py-4 pr-6">
                      <div className="font-medium text-white">{row.userName?.trim() || '—'}</div>
                      <div className="mt-0.5 text-xs text-white/55">{row.userEmail ?? row.userId}</div>
                    </td>
                    <td className="px-5 py-4 pr-6">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${trackBadgeClass(row.track)}`}
                      >
                        {CERTIFICATION_TRACK_LABELS[row.track]}
                      </span>
                    </td>
                    <td className="px-5 py-4 pr-6">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 pr-6 tabular-nums text-white/90">
                      {row.scorePercent != null ? `${row.scorePercent}%` : '—'}
                      {row.passed === true ? (
                        <span className="ml-2 text-xs text-emerald-300/90">zaliczono</span>
                      ) : null}
                      {row.passed === false ? (
                        <span className="ml-2 text-xs text-red-300/80">brak zaliczenia</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 pr-6 whitespace-nowrap text-white/70">
                      {row.startedAt ? new Date(row.startedAt).toLocaleString('pl-PL') : '—'}
                    </td>
                    <td className="px-5 py-4 pr-6 whitespace-nowrap text-white/70">
                      {row.submittedAt ? new Date(row.submittedAt).toLocaleString('pl-PL') : '—'}
                    </td>
                    <td className="px-5 py-4 pr-6 whitespace-nowrap text-white/70">
                      {new Date(row.updatedAt).toLocaleString('pl-PL')}
                    </td>
                    <td className="px-5 py-4 pr-6 font-mono text-xs text-white/75">
                      <span title={row.id} className="cursor-help border-b border-dotted border-white/25">
                        {formatShortId(row.id)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => void handleDeleteAttempt(row)}
                        className="rounded-md border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Usuń podejście ${row.id}`}
                      >
                        {deletingId === row.id ? 'Usuwanie…' : 'Usuń'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
