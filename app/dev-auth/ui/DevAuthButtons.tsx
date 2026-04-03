// app/dev-auth/ui/DevAuthButtons.tsx
// Proste przyciski dev-login — komponent serwerowy (bez hooków).

export default function DevAuthButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=free"
      >
        FREE (EDU)
      </a>
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=starter"
      >
        Pełny panel — tier starter (dev)
      </a>
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=pro"
      >
        Pełny panel — tier pro (dev)
      </a>
      <a
        className="rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
        href="/api/auth/mock-login?plan=elite"
      >
        Pełny panel — tier elite (dev)
      </a>
      <a className="rounded-lg border p-3 text-center hover:bg-gray-50" href="/api/auth/logout">
        Wyloguj
      </a>
    </div>
  );
}
