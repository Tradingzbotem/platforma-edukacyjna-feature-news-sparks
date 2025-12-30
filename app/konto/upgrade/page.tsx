import DevAuthButtons from '@/app/dev-auth/ui/DevAuthButtons';
import AccessGate from '@/components/AccessGate';
import Link from 'next/link';

export default function Page() {
  return (
    <AccessGate
      required="auth"
      fallbackAuth={
        <div className="mx-auto max-w-md p-6">
          <h1 className="text-2xl font-bold">Zaloguj się, aby kontynuować</h1>
          <p className="mt-2 text-sm opacity-80">
            Aby wykupić pakiet, najpierw zaloguj się na swoje konto.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
              href={`/logowanie?next=${encodeURIComponent('/konto/upgrade')}`}
            >
              Przejdź do logowania
            </Link>
            <Link href="/rejestracja" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              Nie masz konta? Zarejestruj się
            </Link>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold">Upgrade do PRO (mock)</h1>
        <p className="mt-2 text-sm opacity-80">
          Na produkcji podłączysz tu realną płatność. Na razie kliknij „Zaloguj jako PRO”.
        </p>
        <div className="mt-6">
          <DevAuthButtons />
        </div>
      </div>
    </AccessGate>
  );
}
