// app/dev-auth/ui/DevAuthButtons.tsx
// Proste przyciski dev-login — komponent serwerowy (bez hooków).

export default function DevAuthButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=free"
      >
        Zaloguj FREE
      </a>
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=pro"
      >
        Zaloguj PRO
      </a>
      <a className="rounded-lg border p-3 text-center hover:bg-gray-50" href="/api/auth/logout">
        Wyloguj
      </a>
    </div>
  );
}
