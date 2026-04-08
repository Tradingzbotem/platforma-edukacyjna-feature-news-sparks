import Link from 'next/link';

import BackButton from '@/components/BackButton';
import { CERTIFICATION_TRACK_LABELS } from '@/lib/certifications/constants';
import { createCertificationAction } from '@/app/admin/certifications/actions';

export const dynamic = 'force-dynamic';

type SearchParams = { searchParams?: Promise<{ err?: string }> };

function errorBanner(err: string) {
  if (err === 'invalid') {
    return (
      <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
        Uzupełnij poprawnie imię i nazwisko, ścieżkę oraz wynik 0–100.
      </p>
    );
  }
  if (err === 'email_invalid') {
    return (
      <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
        Podaj poprawny adres e-mail w polu przypisania albo zostaw je puste.
      </p>
    );
  }
  if (err === 'user_not_found') {
    return (
      <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
        Nie znaleziono użytkownika o podanym adresie e-mail. Sprawdź pisownię albo zostaw pole puste, aby wystawić certyfikat
        bez przypisania do konta.
      </p>
    );
  }
  if (err === 'db') {
    return (
      <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
        Baza niedostępna, migracja nie została uruchomiona albo nie można zweryfikować użytkownika.
      </p>
    );
  }
  return null;
}

export default async function AdminCertificationsNewPage({ searchParams }: SearchParams) {
  const sp = (await searchParams) ?? {};
  const err = (sp.err ?? '').trim();

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-8 text-white">
      <BackButton fallbackHref="/admin/certifications" />

      <div>
        <h1 className="text-2xl font-semibold">Nowy certyfikat</h1>
        <p className="mt-1 text-sm text-white/70">Szkielet formularza — bez integracji z płatnościami ani kursem.</p>
      </div>

      {errorBanner(err)}

      <form action={createCertificationAction} className="space-y-4 rounded-lg border border-white/10 p-4">
        <label className="block space-y-1 text-sm">
          <span className="text-white/80">Imię i nazwisko</span>
          <input
            name="fullName"
            required
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-white/80">Ścieżka</span>
          <select
            name="track"
            required
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
            defaultValue="FOREX_FUNDAMENTALS"
          >
            <option value="FOREX_FUNDAMENTALS">{CERTIFICATION_TRACK_LABELS.FOREX_FUNDAMENTALS}</option>
            <option value="TECHNICAL_ANALYSIS">{CERTIFICATION_TRACK_LABELS.TECHNICAL_ANALYSIS}</option>
            <option value="RISK_MANAGEMENT">{CERTIFICATION_TRACK_LABELS.RISK_MANAGEMENT}</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-white/80">Wynik (%)</span>
          <input
            name="scorePercent"
            type="number"
            min={0}
            max={100}
            required
            defaultValue={80}
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-white/80">Przypisz do użytkownika (e-mail, opcjonalnie)</span>
          <input
            name="assigneeEmail"
            type="email"
            autoComplete="off"
            placeholder="np. uzytkownik@example.com"
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
          />
          <span className="block text-xs text-white/55">
            Jeśli podasz e-mail, musi istnieć konto o tym adresie — inaczej zapis zostanie zablokowany. Puste pole = certyfikat
            bez powiązania z kontem.
          </span>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-white/80">Notatki (opcjonalnie)</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-white outline-none focus:border-sky-500/50"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium hover:bg-sky-500/30"
          >
            Wystaw (ISSUED)
          </button>
          <Link
            href="/admin/certifications"
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </main>
  );
}
