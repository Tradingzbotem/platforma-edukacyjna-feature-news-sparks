// app/dev-auth/page.tsx
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;


type Plan = "free" | "pro";
type Role = "guest" | "user" | "pro";

// ————— Server Actions —————
async function setLogin(plan: Plan) {
  "use server";
  const c = await cookies();
  // proste dev-cookies
  c.set("auth", "1", { path: "/", sameSite: "lax" });
  c.set("plan", plan, { path: "/", sameSite: "lax" });
  revalidatePath("/dev-auth");
}

export async function loginFree() {
  "use server";
  await setLogin("free");
}

export async function loginPro() {
  "use server";
  await setLogin("pro");
}

export async function doLogout() {
  "use server";
  const c = await cookies();
  const expired = new Date(0);
  c.set("auth", "", { path: "/", expires: expired, sameSite: "lax" });
  c.set("plan", "", { path: "/", expires: expired, sameSite: "lax" });
  revalidatePath("/dev-auth");
}

// ————— Page —————
export default async function DevAuthPage() {
  const c = await cookies();

  const authed = c.get("auth")?.value === "1";

  // parsujemy cookie bez rzutowań
  const planCookie = c.get("plan")?.value;
  const plan: Plan | "guest" =
    planCookie === "pro" ? "pro" : planCookie === "free" ? "free" : "guest";

  const role: Role = !authed ? "guest" : plan === "pro" ? "pro" : "user";

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-2xl border shadow-sm p-6 bg-white/5">
        <h1 className="text-3xl font-bold">Panel dostępu (dev)</h1>
        <p className="mt-2 text-sm opacity-80">
          Rola: <b>{role}</b> · cookies: <code>auth</code>={String(authed)}{" "}
          <code>plan</code>={plan}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <form action={loginFree}>
            <button
              type="submit"
              className="w-full rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
            >
              Zaloguj FREE
            </button>
          </form>

        <form action={loginPro}>
            <button
              type="submit"
              className="w-full rounded-lg border p-3 text-center hover:bg-gray-50 bg-white text-slate-900"
            >
              Zaloguj PRO
            </button>
          </form>

          <form action={doLogout}>
            <button
              type="submit"
              className="w-full rounded-lg border p-3 text-center hover:bg-gray-50"
            >
              Wyloguj
            </button>
          </form>
        </div>

        <div className="mt-6 text-sm opacity-70 space-y-1">
          <p>
            Po zalogowaniu przejdź do <code>/kursy</code> lub <code>/quizy</code> i
            sprawdź dostęp.
          </p>
          <p>Ten panel jest tylko do developmentu (mock cookies).</p>
        </div>
      </div>
    </div>
  );
}
