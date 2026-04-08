import Link from 'next/link';
import { redirect } from 'next/navigation';

import CertificateProductActions from '@/app/konto/certyfikat/CertificateProductActions';
import StartExamButton from '@/app/konto/certyfikat/egzamin/StartExamButton';
import { CertificateFxedulabMarketing } from '@/components/certificates/CertificateFxedulabMarketing';
import { getIsAdmin } from '@/lib/admin';
import { CERT_EXAM_SELECTABLE_TRACKS } from '@/lib/certification-exam/constants';
import type { CertificationExamAttemptDto } from '@/lib/certification-exam/types';
import { getInProgressExamAttemptForUser } from '@/lib/certification-exam/service';
import { CERTIFICATION_TRACK_LABELS_PL } from '@/lib/certifications/constants';
import { certificationLevelHeroLabel } from '@/lib/certifications/displayLabels';
import { buildCertificateVerifyAbsoluteUrl } from '@/lib/certifications/pdf/siteBaseUrl';
import type { CertificationRecordDto, CertificationTrack } from '@/lib/certifications/types';
import { PUBLIC_CERT_FXEDULAB_PATH } from '@/lib/certifications/publicCertInfoPath';
import { getIssuedCertificateForUser, getIssuedCertificatesForUser } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function formatIssuedDatePl(iso: string | null): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(t);
}

function issuedByTrackFromList(
  certs: CertificationRecordDto[],
): Partial<Record<CertificationTrack, CertificationRecordDto>> {
  const m: Partial<Record<CertificationTrack, CertificationRecordDto>> = {};
  for (const c of certs) {
    const cur = m[c.track];
    if (!cur) {
      m[c.track] = c;
      continue;
    }
    const a = cur.issuedAt ? Date.parse(cur.issuedAt) : 0;
    const b = c.issuedAt ? Date.parse(c.issuedAt) : 0;
    if (b >= a) m[c.track] = c;
  }
  return m;
}

function valueCopyForTrack(track: CertificationTrack): string {
  switch (track) {
    case 'TECHNICAL_ANALYSIS':
      return 'Potwierdza znajomość interpretacji wykresu, struktury rynku i narzędzi analizy technicznej w standardzie edukacyjnym FXEDULAB.';
    case 'RISK_MANAGEMENT':
      return 'Potwierdza świadome podejście do ryzyka, wielkości pozycji i dyscypliny operacyjnej zgodnie z programem FXEDULAB.';
    default:
      return 'Potwierdza znajomość mechaniki rynku FX, kontekstu makro i podstawowych zasad działania instrumentów w standardzie FXEDULAB.';
  }
}

const examEntryHref = '/konto/certyfikat/egzamin';
const trackRowBtn =
  'inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/15 px-4 text-xs font-semibold uppercase tracking-wide text-amber-100 transition hover:border-amber-400/50 hover:bg-amber-500/20';
const trackRowBtnSecondary =
  'inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 text-xs font-semibold text-white/88 transition hover:border-white/25';

function CertificateHolderView({
  cert,
  issuedByTrack,
  inProgressAttempt,
  isAdmin,
}: {
  cert: CertificationRecordDto;
  issuedByTrack: Partial<Record<CertificationTrack, CertificationRecordDto>>;
  inProgressAttempt: CertificationExamAttemptDto | null;
  isAdmin: boolean;
}) {
  const verifyPath = `/certificates/verify/${encodeURIComponent(cert.verificationToken)}`;
  const verifyAbsoluteUrl = buildCertificateVerifyAbsoluteUrl(cert.verificationToken);
  const trackLabel = CERTIFICATION_TRACK_LABELS_PL[cert.track];
  const levelHero = certificationLevelHeroLabel(cert.level);
  const issued = formatIssuedDatePl(cert.issuedAt);
  const activeHref = inProgressAttempt
    ? `/konto/certyfikat/egzamin/${encodeURIComponent(inProgressAttempt.id)}`
    : null;
  const activeTrackLabelPl = inProgressAttempt
    ? CERTIFICATION_TRACK_LABELS_PL[inProgressAttempt.track]
    : null;

  return (
    <div className="space-y-12 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/client" className="text-sm text-white/55 transition hover:text-white">
          ← Powrót do panelu
        </Link>
      </div>

      {/* Hero — achievement */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0a0c10] via-slate-950 to-black px-6 py-14 shadow-[0_0_80px_-20px_rgba(245,158,11,0.35)] sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl"
        />
        <div className="relative space-y-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-400/90">
            Certyfikat FXEDULAB
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            {cert.fullName}
          </h1>
          <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 font-semibold text-amber-100">
              {levelHero}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-white/85">
              {trackLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-white/85">
              Wynik {cert.scorePercent}%
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-white/70">
              {issued}
            </span>
          </div>
          <div className="mx-auto max-w-lg border-t border-amber-500/15 pt-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">ID certyfikatu</p>
            <p className="mt-2 break-all font-mono text-sm text-amber-100/90 sm:text-base">{cert.certificateId}</p>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Status</h2>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-6 py-5">
          <p className="font-medium text-emerald-100">Certyfikat aktywny</p>
          <p className="mt-1 text-sm text-emerald-100/75">
            Zweryfikowany w systemie FXEDULAB. Możesz udostępnić link weryfikacji — potwierdza autentyczność bez ujawniania
            danych poza stroną weryfikacji.
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Akcje</h2>
        <CertificateProductActions verifyAbsoluteUrl={verifyAbsoluteUrl} verifyPath={verifyPath} />
      </section>

      {/* Other exam tracks */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pozostałe części egzaminu</h2>
        <p className="text-sm leading-relaxed text-white/55">
          Program certyfikacji FXEDULAB składa się z kilku ścieżek — każda ma osobny egzamin i osobny certyfikat. Poniżej
          zobaczysz, co już masz zaliczone i od czego możesz zacząć następną część.
        </p>
        {inProgressAttempt && activeHref && activeTrackLabelPl ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100/90">
            Masz aktywną sesję egzaminu: <strong className="text-white">{activeTrackLabelPl}</strong>. Dokończ ją lub
            kontynuuj, zanim rozpoczniesz inną ścieżkę (tylko jedna sesja naraz).
            <Link href={activeHref} className="mt-2 block text-xs font-semibold text-amber-200 underline-offset-4 hover:underline">
              Przejdź do aktywnego egzaminu →
            </Link>
          </div>
        ) : null}
        <ul className="space-y-3">
          {CERT_EXAM_SELECTABLE_TRACKS.map((t) => {
            const label = CERTIFICATION_TRACK_LABELS_PL[t];
            const issuedFor = issuedByTrack[t];
            const isThisActive = inProgressAttempt?.track === t;

            if (issuedFor) {
              return (
                <li
                  key={t}
                  className="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white/92">{label}</p>
                    <p className="mt-0.5 text-xs text-white/45">Certyfikat wydany</p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                    <Link
                      href={`/konto/certyfikat/moj/${encodeURIComponent(issuedFor.id)}`}
                      className={trackRowBtnSecondary}
                    >
                      Zobacz certyfikat
                    </Link>
                    {isAdmin ? (
                      <StartExamButton
                        track={t}
                        label="Ponów egzamin"
                        buttonClassName={trackRowBtn}
                        rootClassName="inline-flex min-w-0 flex-col gap-2"
                      />
                    ) : null}
                  </div>
                </li>
              );
            }

            if (isThisActive && activeHref) {
              return (
                <li
                  key={t}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white/92">{label}</p>
                    <p className="mt-0.5 text-xs text-white/45">Egzamin w toku</p>
                  </div>
                  <Link href={activeHref} className={trackRowBtn}>
                    Kontynuuj egzamin
                  </Link>
                </li>
              );
            }

            if (inProgressAttempt && !isThisActive) {
              return (
                <li
                  key={t}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white/55">{label}</p>
                    <p className="mt-0.5 text-xs text-white/35">
                      Dostępne po zakończeniu aktywnej sesji ({activeTrackLabelPl}).
                    </p>
                  </div>
                  <span className="text-xs font-medium text-white/30">—</span>
                </li>
              );
            }

            return (
              <li
                key={t}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white/92">{label}</p>
                  <p className="mt-0.5 text-xs text-white/45">Do zaliczenia — osobny egzamin</p>
                </div>
                <Link href={examEntryHref} className={trackRowBtn}>
                  Rozpocznij
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Value */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Co oznacza ten certyfikat</h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-white/80">
          <p className="text-sm leading-relaxed">{valueCopyForTrack(cert.track)}</p>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li className="flex gap-3">
              <span className="text-amber-500/90">●</span>
              <span>
                <strong className="text-white/90">Zakres:</strong> {trackLabel} — kompetencje opisane w programie
                certyfikacji FXEDULAB.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500/90">●</span>
              <span>
                <strong className="text-white/90">Poziom:</strong> {levelHero} (na podstawie wyniku egzaminu).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500/90">●</span>
              <span>
                <strong className="text-white/90">Standard:</strong> jeden weryfikowalny rekord, publiczne ID i kod QR na
                dokumencie PDF.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default async function CertyfikatProductPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect('/logowanie?next=/konto/certyfikat');
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    redirect(PUBLIC_CERT_FXEDULAB_PATH);
  }

  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-sm text-amber-100/90">
        Baza danych jest niedostępna w tym środowisku — stan certyfikatu nie może być wczytany.
      </div>
    );
  }

  const [cert, allIssued, inProgressAttempt] = await Promise.all([
    getIssuedCertificateForUser(session.userId),
    getIssuedCertificatesForUser(session.userId),
    getInProgressExamAttemptForUser(session.userId),
  ]);

  if (cert) {
    const isAdmin = await getIsAdmin();
    return (
      <CertificateHolderView
        cert={cert}
        issuedByTrack={issuedByTrackFromList(allIssued)}
        inProgressAttempt={inProgressAttempt}
        isAdmin={isAdmin}
      />
    );
  }

  const examHref = inProgressAttempt
    ? `/konto/certyfikat/egzamin/${encodeURIComponent(inProgressAttempt.id)}`
    : '/konto/certyfikat/egzamin';
  const examCtaLabel = inProgressAttempt ? 'Przejdź do egzaminu' : 'Rozpocznij egzamin';

  return (
    <CertificateFxedulabMarketing
      topBack={{ href: '/client', label: '← Powrót do panelu' }}
      examCta={{ href: examHref, label: examCtaLabel }}
      step1Line="Moduł na koncie po spełnieniu warunków dostępu do certyfikacji — możesz przejść do egzaminu."
    />
  );
}
