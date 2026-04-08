'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CERTIFICATION_TRACK_LABELS } from '@/lib/certifications/constants';
import type {
  CertificationRecordDto,
  CertificationRecordStatus,
  CertificationTrack,
} from '@/lib/certifications/types';

const ALL = '' as const;

const STATUS_OPTIONS: { value: typeof ALL | CertificationRecordStatus; label: string }[] = [
  { value: ALL, label: 'Wszystkie statusy' },
  { value: 'ISSUED', label: 'Wydany' },
  { value: 'REVOKED', label: 'Unieważniony' },
  { value: 'DRAFT', label: 'Szkic' },
];

const TRACK_OPTIONS: { value: typeof ALL | CertificationTrack; label: string }[] = [
  { value: ALL, label: 'Wszystkie ścieżki' },
  { value: 'FOREX_FUNDAMENTALS', label: CERTIFICATION_TRACK_LABELS.FOREX_FUNDAMENTALS },
  { value: 'TECHNICAL_ANALYSIS', label: CERTIFICATION_TRACK_LABELS.TECHNICAL_ANALYSIS },
  { value: 'RISK_MANAGEMENT', label: CERTIFICATION_TRACK_LABELS.RISK_MANAGEMENT },
];

function statusBadgeClass(status: CertificationRecordStatus): string {
  switch (status) {
    case 'ISSUED':
      return 'border-emerald-500/45 bg-emerald-500/12 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.28)]';
    case 'REVOKED':
      return 'border-red-500/45 bg-red-500/12 text-red-200 shadow-[0_0_14px_rgba(239,68,68,0.28)]';
    case 'DRAFT':
      return 'border-white/25 bg-white/[0.08] text-white/65 shadow-[0_0_12px_rgba(255,255,255,0.06)]';
    default:
      return 'border-white/20 bg-white/5 text-white/70';
  }
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

function formatCertificateIdPreview(certificateId: string): string {
  const s = certificateId.trim();
  if (s.length <= 12) return s;
  return `${s.slice(0, 12)}...`;
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

type Props = {
  items: CertificationRecordDto[];
};

export default function AdminCertificationsTableClient({ items }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<typeof ALL | CertificationRecordStatus>(ALL);
  const [trackFilter, setTrackFilter] = useState<typeof ALL | CertificationTrack>(ALL);
  const [search, setSearch] = useState('');

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let next = items.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (trackFilter && c.track !== trackFilter) return false;
      if (q) {
        const nameMatch = c.fullName.toLowerCase().includes(q);
        const idMatch = c.certificateId.toLowerCase().includes(q);
        if (!nameMatch && !idMatch) return false;
      }
      return true;
    });

    next = [...next].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return tb - ta;
    });

    return next;
  }, [items, statusFilter, trackFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-white/60">
          Status
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
          Szukaj (imię i nazwisko lub ID certyfikatu)
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="np. Jan Kowalski lub FXEDU…"
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
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.05] text-xs uppercase tracking-wide text-white/55">
                  <th className="px-5 py-4 pr-6 font-medium">Full Name</th>
                  <th className="px-5 py-4 pr-6 font-medium">Track</th>
                  <th className="px-5 py-4 pr-6 font-medium">Score</th>
                  <th className="px-5 py-4 pr-6 font-medium">Status</th>
                  <th className="px-5 py-4 pr-6 font-medium">Issued At</th>
                  <th className="px-5 py-4 pr-6 font-medium">Certificate ID</th>
                  <th scope="col" className="w-12 px-4 py-4 text-center font-medium">
                    <span className="sr-only">Wiersz prowadzi do szczegółów</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((c, rowIndex) => (
                  <tr
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/certifications/${c.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/admin/certifications/${c.id}`);
                      }
                    }}
                    className={[
                      'cursor-pointer border-b border-white/[0.07] transition-[background-color,box-shadow] duration-150',
                      rowIndex % 2 === 1 ? 'bg-white/[0.035]' : 'bg-transparent',
                      'hover:bg-sky-500/[0.09] hover:shadow-[inset_0_0_28px_rgba(56,189,248,0.07),0_0_16px_rgba(56,189,248,0.06)]',
                    ].join(' ')}
                  >
                    <td className="px-5 py-4 pr-6 font-medium text-white">{c.fullName}</td>
                    <td className="px-5 py-4 pr-6">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${trackBadgeClass(c.track)}`}
                      >
                        {CERTIFICATION_TRACK_LABELS[c.track]}
                      </span>
                    </td>
                    <td className="px-5 py-4 pr-6 tabular-nums text-white/90">{c.scorePercent}%</td>
                    <td className="px-5 py-4 pr-6">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 pr-6 whitespace-nowrap text-white/70">
                      {c.issuedAt ? new Date(c.issuedAt).toLocaleString('pl-PL') : '—'}
                    </td>
                    <td className="px-5 py-4 pr-6 font-mono text-xs text-white/75">
                      <span title={c.certificateId} className="cursor-help border-b border-dotted border-white/25">
                        {formatCertificateIdPreview(c.certificateId)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-white/40">
                      <span className="pointer-events-none text-base leading-none text-sky-400/70" aria-hidden="true">
                        →
                      </span>
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
