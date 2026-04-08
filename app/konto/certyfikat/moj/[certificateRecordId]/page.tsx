import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { CERTIFICATION_TRACK_LABELS_PL } from '@/lib/certifications/constants';
import { certificationLevelHeroLabel } from '@/lib/certifications/displayLabels';
import { PUBLIC_CERT_FXEDULAB_PATH } from '@/lib/certifications/publicCertInfoPath';
import { getCertificateById } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ certificateRecordId: string }> };

function formatIssuedDatePl(iso: string | null): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(t);
}

export default async function MojCertyfikatPage({ params }: PageProps) {
  const session = await getSession();
  if (!session.userId) {
    const { certificateRecordId } = await params;
    redirect(`/logowanie?next=/konto/certyfikat/moj/${encodeURIComponent(certificateRecordId)}`);
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    redirect(PUBLIC_CERT_FXEDULAB_PATH);
  }

  if (!getPrisma()) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-sm text-amber-100/90">
        Baza danych jest niedostępna — certyfikat nie może być wczytany.
      </div>
    );
  }

  const { certificateRecordId } = await params;
  const cert = await getCertificateById(certificateRecordId);
  if (!cert || cert.userId !== session.userId || cert.status !== 'ISSUED') {
    notFound();
  }

  const trackLabel = CERTIFICATION_TRACK_LABELS_PL[cert.track];
  const levelHero = certificationLevelHeroLabel(cert.level);
  const issued = formatIssuedDatePl(cert.issuedAt);
  const verifyPath = `/certificates/verify/${encodeURIComponent(cert.verificationToken)}`;
  const pdfHref = `/api/konto/certyfikat/pdf?recordId=${encodeURIComponent(cert.id)}`;

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/konto/certyfikat" className="text-sm text-white/55 transition hover:text-white">
          ← Certyfikat FXEDULAB
        </Link>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/50">
          Twój certyfikat
        </span>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-amber-400/95">FXEDULAB</p>
        <h1 className="mt-3 font-sans text-2xl font-bold uppercase tracking-[0.12em] text-white sm:text-3xl">
          Podgląd certyfikatu
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Ścieżka: <span className="font-medium text-white/90">{trackLabel}</span>
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-4">
            <dt className="text-white/45">Imię i nazwisko na certyfikacie</dt>
            <dd className="font-medium text-white">{cert.fullName}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-4">
            <dt className="text-white/45">Poziom</dt>
            <dd className="font-medium text-amber-100/90">{levelHero}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-4">
            <dt className="text-white/45">Wynik</dt>
            <dd className="font-mono text-white/90">{cert.scorePercent}%</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-4">
            <dt className="text-white/45">Data wydania</dt>
            <dd className="text-white/85">{issued}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-4">
            <dt className="text-white/45">Status</dt>
            <dd className="font-medium text-emerald-200/90">Aktywny</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-1">
            <dt className="text-white/45">ID certyfikatu</dt>
            <dd className="break-all font-mono text-xs text-white/75 sm:text-sm">{cert.certificateId}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={pdfHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-6 text-sm font-semibold text-amber-100 hover:border-amber-400/70"
          >
            Pobierz PDF
          </a>
          <a
            href={verifyPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white/90 hover:border-white/25"
          >
            Strona weryfikacji
          </a>
        </div>
      </section>
    </div>
  );
}
