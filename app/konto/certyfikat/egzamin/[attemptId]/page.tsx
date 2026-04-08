import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import ExamCertificateCta from '@/app/konto/certyfikat/egzamin/ExamCertificateCta';
import ExamRunClient from '@/app/konto/certyfikat/egzamin/ExamRunClient';
import { getIsAdmin } from '@/lib/admin';
import { CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT } from '@/lib/certification-exam/constants';
import {
  getAdminPreviewQuestionsForAttempt,
  getExamAttemptForUser,
  getPublicQuestionsForAttempt,
} from '@/lib/certification-exam/service';
import type { ExamQuestionAdminPreview, ExamQuestionPublic } from '@/lib/certification-exam/types';
import { CERTIFICATION_TRACK_LABELS, CERTIFICATION_TRACK_LABELS_PL } from '@/lib/certifications/constants';
import { PUBLIC_CERT_FXEDULAB_PATH } from '@/lib/certifications/publicCertInfoPath';
import { getIssuedCertificateForUserAndTrack } from '@/lib/certifications/service';
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from '@/lib/features';
import { getPrisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ attemptId: string }> };

function ClosedAttemptSummary({ attemptId }: { attemptId: string }) {
  return (
    <p className="text-sm text-white/55">
      To podejście jest już zakończone. Identyfikator sesji:{' '}
      <span className="font-mono text-white/75">{attemptId}</span>.
    </p>
  );
}

export default async function CertificationExamAttemptPage({ params }: PageProps) {
  const session = await getSession();
  if (!session.userId) {
    const { attemptId } = await params;
    redirect(`/logowanie?next=/konto/certyfikat/egzamin/${encodeURIComponent(attemptId)}`);
  }

  if (!(await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS))) {
    redirect(`${PUBLIC_CERT_FXEDULAB_PATH}#jak-dziala-egzamin`);
  }

  if (!getPrisma()) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-sm text-amber-100/90">
        Baza danych jest niedostępna — stan egzaminu nie może być wczytany.
      </div>
    );
  }

  const { attemptId } = await params;
  const attempt = await getExamAttemptForUser(attemptId, session.userId);
  if (!attempt) {
    notFound();
  }

  const trackLabel = CERTIFICATION_TRACK_LABELS_PL[attempt.track];
  const trackLabelEn = CERTIFICATION_TRACK_LABELS[attempt.track];
  const isAdmin = await getIsAdmin();
  const questions =
    attempt.status === 'IN_PROGRESS'
      ? isAdmin
        ? getAdminPreviewQuestionsForAttempt(attempt)
        : getPublicQuestionsForAttempt(attempt)
      : null;
  const inProgress = attempt.status === 'IN_PROGRESS' && questions && questions.length > 0;
  const certForTrack = inProgress ? null : await getIssuedCertificateForUserAndTrack(session.userId, attempt.track);
  const certificateCtaSnapshot =
    !inProgress && attempt.status !== 'NOT_STARTED'
      ? {
          isTerminal: true,
          passed: attempt.passed,
          existingRecordId: certForTrack?.id ?? null,
        }
      : null;

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/konto/certyfikat/egzamin" className="text-sm text-white/55 transition hover:text-white">
          ← Strona egzaminu
        </Link>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/50">
          Sesja egzaminacyjna
        </span>
      </div>

      <header className="border-b border-white/15 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-amber-400/95">FXEDULAB</p>
            <h1 className="mt-2 font-sans text-2xl font-bold uppercase tracking-[0.12em] text-white sm:text-3xl">
              Egzamin certyfikacyjny
            </h1>
            <p className="mt-3 text-sm text-white/65">
              Ścieżka: <span className="font-medium text-white/90">{trackLabel}</span>
              <span className="text-white/40"> · {trackLabelEn}</span>
            </p>
          </div>
          {inProgress ? (
            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
              <span className="rounded border border-red-500/35 bg-red-950/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-200/90 shadow-[0_0_20px_rgba(248,113,113,0.12)]">
                Tryb egzaminacyjny aktywny
              </span>
              <span className="rounded border border-amber-500/40 bg-amber-500/[0.12] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/95 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
                IN PROGRESS
              </span>
            </div>
          ) : null}
        </div>
      </header>

      {inProgress ? (
        isAdmin ? (
          <ExamRunClient
            attemptId={attempt.id}
            adminExamPreview={true}
            initialAttempt={attempt}
            questions={questions as ExamQuestionAdminPreview[]}
            trackLabel={trackLabel}
          />
        ) : (
          <ExamRunClient
            attemptId={attempt.id}
            adminExamPreview={false}
            initialAttempt={attempt}
            questions={questions as ExamQuestionPublic[]}
            trackLabel={trackLabel}
          />
        )
      ) : (
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8">
          <ClosedAttemptSummary attemptId={attempt.id} />
          {attempt.status === 'PASSED' || attempt.status === 'FAILED' ? (
            <div className="rounded-xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/75">
              <p>
                Wynik zapisany: <strong className="text-white">{attempt.scorePercent ?? '—'}%</strong>. Próg
                placeholderowy: {CERT_EXAM_V1_PLACEHOLDER_PASS_PERCENT}%. Zaliczenie:{' '}
                <strong className="text-white">{attempt.passed === true ? 'tak' : attempt.passed === false ? 'nie' : '—'}</strong>
                .
              </p>
            </div>
          ) : null}
          {certificateCtaSnapshot ? (
            <ExamCertificateCta attemptId={attempt.id} initialSnapshot={certificateCtaSnapshot} />
          ) : null}
          <Link
            href="/konto/certyfikat/egzamin"
            className="inline-flex text-sm font-semibold text-amber-200/90 underline-offset-4 hover:underline"
          >
            Wróć do strony egzaminu
          </Link>
        </section>
      )}
    </div>
  );
}
