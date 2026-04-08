import Link from 'next/link';

import BackButton from '@/components/BackButton';
import { listAdminExamAttemptRows } from '@/lib/certification-exam/adminExamAttempts';

import AdminExamAttemptsTableClient from './AdminExamAttemptsTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminCertificationExamsPage() {
  const items = await listAdminExamAttemptRows();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton fallbackHref="/admin/certifications" />
        <Link
          href="/admin/certifications"
          className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
        >
          Lista certyfikatów
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Egzamin certyfikacyjny — podejścia</h1>
        <p className="mt-1 text-sm text-white/70">
          Kto jest w trakcie egzaminu, kto zaliczył lub nie zaliczył. Pokazywane są ostatnie rekordy podejść (do 400).
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-white">Brak podejść</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
            Żaden użytkownik nie rozpoczął jeszcze egzaminu albo baza nie jest dostępna.
          </p>
        </div>
      ) : (
        <AdminExamAttemptsTableClient items={items} />
      )}
    </main>
  );
}
