import Link from 'next/link';

import { CERTIFICATION_TRACK_LABELS } from '@/lib/certifications/constants';
import { verifyCertificateByToken } from '@/lib/certifications/verify';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ token: string }> };

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { token } = await params;
  const result = await verifyCertificateByToken(token);

  if (result.state === 'not_found') {
    return (
      <main className="mx-auto max-w-lg space-y-4 px-4 py-16 text-white">
        <h1 className="text-2xl font-semibold">Weryfikacja certyfikatu</h1>
        <p className="rounded border border-white/10 bg-white/5 px-4 py-3 text-white/90">Nie znaleziono ważnego certyfikatu dla tego linku.</p>
        <Link href="/" className="text-sky-300 hover:underline">
          Strona główna
        </Link>
      </main>
    );
  }

  const c = result.certificate;
  const ok = result.state === 'valid';

  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 py-16 text-white">
      <h1 className="text-2xl font-semibold">Weryfikacja certyfikatu</h1>

      <div
        className={
          ok
            ? 'rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-3'
            : 'rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3'
        }
      >
        <p className="font-medium">{ok ? 'Certyfikat ważny' : 'Certyfikat unieważniony'}</p>
        <p className="mt-1 text-sm text-white/80">
          {ok
            ? 'Rekord istnieje w systemie FXEDULAB i ma status ISSUED.'
            : 'Rekord istnieje, ale został oznaczony jako REVOKED.'}
        </p>
      </div>

      <dl className="space-y-2 rounded border border-white/10 bg-white/[0.03] p-4 text-sm">
        <div>
          <dt className="text-white/50">Imię i nazwisko</dt>
          <dd>{c.fullName}</dd>
        </div>
        <div>
          <dt className="text-white/50">Ścieżka</dt>
          <dd>{CERTIFICATION_TRACK_LABELS[c.track]}</dd>
        </div>
        <div>
          <dt className="text-white/50">Publiczne ID</dt>
          <dd className="break-all font-mono text-xs">{c.certificateId}</dd>
        </div>
        <div>
          <dt className="text-white/50">Poziom / wynik</dt>
          <dd>
            {c.level} · {c.scorePercent}%
          </dd>
        </div>
        <div>
          <dt className="text-white/50">Data wystawienia</dt>
          <dd>{c.issuedAt ? new Date(c.issuedAt).toLocaleString('pl-PL') : '—'}</dd>
        </div>
      </dl>

      <Link href="/" className="text-sky-300 hover:underline">
        Strona główna
      </Link>
    </main>
  );
}
