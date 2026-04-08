import Link from 'next/link';

import BackButton from '@/components/BackButton';
import { CertificatePdfDownloadButton } from '@/components/admin/CertificatePdfDownloadButton';
import { CertificateDeleteButton } from '@/components/admin/CertificateDeleteButton';
import { assignCertificationUserAction, revokeCertificationAction } from '@/app/admin/certifications/actions';
import { CERTIFICATION_TRACK_LABELS } from '@/lib/certifications/constants';
import { buildCertificatePdfFilename } from '@/lib/certifications/pdf/filename';
import { getCertificateById } from '@/lib/certifications/service';
import { findUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    err?: string;
    revoked?: string;
    assigned?: string;
  }>;
};

export default async function AdminCertificationDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const err = (sp.err ?? '').trim();

  const row = await getCertificateById(id);

  if (!row) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8 text-white">
        <BackButton fallbackHref="/admin/certifications" />
        <h1 className="text-xl font-semibold">Nie znaleziono</h1>
        <p className="text-white/70">Brak rekordu o podanym ID (lub baza niedostępna).</p>
        <Link href="/admin/certifications" className="text-sky-300 hover:underline">
          Wróć do listy
        </Link>
      </main>
    );
  }

  const verifyUrl = `/certificates/verify/${encodeURIComponent(row.verificationToken)}`;
  const assigneeAccount = row.userId ? await findUserById(row.userId) : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 text-white">
      <BackButton fallbackHref="/admin/certifications" />

      {sp.revoked === '1' ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Certyfikat oznaczono jako REVOKED.
        </p>
      ) : null}
      {sp.assigned === '1' ? (
        <p className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Certyfikat przypisano do konta użytkownika.
        </p>
      ) : null}
      {err === 'revoke_failed' ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          Nie udało się cofnąć ważności (sprawdź ID / bazę).
        </p>
      ) : null}
      {err === 'email_invalid' ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Podaj poprawny adres e-mail albo pozostaw formularz przypisania pusty.
        </p>
      ) : null}
      {err === 'user_not_found' ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          Nie znaleziono użytkownika o podanym adresie e-mail — przypisanie nie zostało zapisane.
        </p>
      ) : null}
      {err === 'assign_email_required' ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Aby przypisać certyfikat, wpisz e-mail istniejącego użytkownika.
        </p>
      ) : null}
      {err === 'assign_failed' ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          Nie udało się przypisać (certyfikat może być już przypisany lub wystąpił błąd bazy).
        </p>
      ) : null}
      {err === 'db' ? (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          Baza użytkowników niedostępna — nie można zweryfikować adresu e-mail.
        </p>
      ) : null}

      <div>
        <h1 className="text-2xl font-semibold">{row.fullName}</h1>
        <p className="text-sm text-white/70">{CERTIFICATION_TRACK_LABELS[row.track]}</p>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-white/50">Przypisanie do konta</dt>
          <dd className="space-y-1">
            {row.userId ? (
              <>
                {assigneeAccount ? (
                  <>
                    <p className="font-medium text-emerald-200/95">Przypisany</p>
                    <p className="text-white/90">
                      <span className="text-white/55">E-mail: </span>
                      {assigneeAccount.email}
                    </p>
                    <p className="font-mono text-xs text-white/55 break-all">userId: {row.userId}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-200/90">Powiązany rekord (konto niewidoczne)</p>
                    <p className="text-sm text-white/70">
                      W bazie jest userId, ale nie znaleziono użytkownika w tabeli <span className="font-mono">users</span> (np.
                      usunięte konto).
                    </p>
                    <p className="font-mono text-xs text-white/55 break-all">userId: {row.userId}</p>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-white/80">Nieprzypisany</p>
                <p className="text-sm text-white/60">Certyfikat nie jest powiązany z kontem — użytkownik nie zobaczy go w /konto/certyfikat.</p>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-white/50">Status</dt>
          <dd>{row.status}</dd>
        </div>
        <div>
          <dt className="text-white/50">Poziom</dt>
          <dd>{row.level}</dd>
        </div>
        <div>
          <dt className="text-white/50">Wynik</dt>
          <dd>{row.scorePercent}%</dd>
        </div>
        <div>
          <dt className="text-white/50">Publiczne ID</dt>
          <dd className="break-all font-mono text-xs">{row.certificateId}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-white/50">Weryfikacja (URL)</dt>
          <dd>
            <Link href={verifyUrl} className="break-all text-sky-300 hover:underline">
              {verifyUrl}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-white/50">Wystawiono</dt>
          <dd>{row.issuedAt ? new Date(row.issuedAt).toLocaleString('pl-PL') : '—'}</dd>
        </div>
        {row.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-white/50">Notatki</dt>
            <dd className="whitespace-pre-wrap text-white/90">{row.notes}</dd>
          </div>
        ) : null}
      </dl>

      {!row.userId ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-white">Przypisz do użytkownika przez e-mail</h2>
          <p className="mt-1 text-xs text-white/55">
            Wpisz adres istniejącego konta. Bez AJAX — tylko zapis po wysłaniu formularza.
          </p>
          <form action={assignCertificationUserAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="certificateRecordId" value={row.id} />
            <label className="block min-w-0 flex-1 space-y-1 text-sm">
              <span className="text-white/70">E-mail użytkownika</span>
              <input
                name="assigneeEmail"
                type="email"
                required
                autoComplete="off"
                placeholder="uzytkownik@example.com"
                className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
              />
            </label>
            <button
              type="submit"
              className="shrink-0 rounded-md border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium hover:bg-sky-500/30"
            >
              Przypisz
            </button>
          </form>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
        {row.status === 'ISSUED' ? (
          <CertificatePdfDownloadButton
            recordId={row.id}
            filename={buildCertificatePdfFilename(row.certificateId)}
          />
        ) : (
          <p className="max-w-xl rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/65">
            Plik PDF jest dostępny tylko dla certyfikatów ze statusem <span className="text-white/90">ISSUED</span>.
            Aktualny status: <span className="font-mono text-white/90">{row.status}</span> — nie można pobrać dokumentu
            premium w tym stanie.
          </p>
        )}
        {row.status !== 'REVOKED' ? (
          <form action={revokeCertificationAction}>
            <input type="hidden" name="id" value={row.id} />
            <button
              type="submit"
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-100 hover:bg-red-500/20"
            >
              Unieważnij (REVOKED)
            </button>
          </form>
        ) : null}
        <CertificateDeleteButton recordId={row.id} fullNameHint={row.fullName} redirectToList />
      </div>
    </main>
  );
}
