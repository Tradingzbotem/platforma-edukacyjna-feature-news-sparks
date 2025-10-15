import DevAuthButtons from '@/app/dev-auth/ui/DevAuthButtons';

export default function Page() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Upgrade do PRO (mock)</h1>
      <p className="mt-2 text-sm opacity-80">
        Na produkcji podłączysz tu realną płatność. Na razie kliknij „Zaloguj jako PRO”.
      </p>
      <div className="mt-6">
        <DevAuthButtons />
      </div>
    </div>
  );
}
