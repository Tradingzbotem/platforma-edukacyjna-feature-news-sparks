import Link from 'next/link';

import BackButton from '@/components/BackButton';
import AdminCertificationsTableClient from './AdminCertificationsTableClient';
import { listCertificates } from '@/lib/certifications/service';

export const dynamic = 'force-dynamic';

export default async function AdminCertificationsPage() {
  const items = await listCertificates();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton fallbackHref="/admin" />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/certifications/egzaminy"
            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Podejścia do egzaminu
          </Link>
          <Link
            href="/admin/certifications/new"
            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Nowy certyfikat
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Certyfikaty</h1>
        <p className="mt-1 text-sm text-white/70">
          Lista rekordów w bazie.{' '}
          <Link href="/admin/certifications/egzaminy" className="text-sky-300/90 underline-offset-2 hover:underline">
            Podejścia do egzaminu
          </Link>
          {' — kto zaliczył lub jest w toku. Weryfikacja publiczna: '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">/certificates/verify/[token]</code>
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-white">Brak certyfikatów</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
            Nie utworzono jeszcze żadnych certyfikatów. Zacznij od wystawienia pierwszego.
          </p>
          <Link
            href="/admin/certifications/new"
            className="mt-6 inline-flex rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Nowy certyfikat
          </Link>
        </div>
      ) : (
        <AdminCertificationsTableClient items={items} />
      )}
    </main>
  );
}
