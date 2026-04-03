// app/konto/plan/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { resolveTierFromCookiesAndSession, hasFullPanelAccess, type Tier } from "@/lib/panel/access";
import { getFoundersAccess } from "@/lib/founders-token/access";

export const dynamic = 'force-dynamic';

type FoundersAccessSummary = Awaited<ReturnType<typeof getFoundersAccess>>;

function foundersStatusDescription(s: FoundersAccessSummary): { label: string; detail: string } {
  if (!s.hasRecord) {
    return {
      label: "Brak rekordu",
      detail: "Nie masz jeszcze przypisanego członkostwa Founders w bazie FXEduLab.",
    };
  }
  if (s.accessActive) {
    if (s.status === "pending" && s.allowAccessWithoutNft) {
      return {
        label: "Aktywny (wyjątek)",
        detail:
          "Masz aktywny dostęp Founders na podstawie wyjątku (np. trial lub promocja). Transfer i NFT są obsługiwane zgodnie z zasadami projektu.",
      };
    }
    return {
      label: "Aktywny",
      detail:
        "Masz aktywne członkostwo Founders w systemie. Dostęp i powiązanie z NFT są zarządzane przez FXEduLab — bez łączenia portfela w aplikacji.",
    };
  }
  if (s.status === "pending") {
    return {
      label: "Oczekujący",
      detail: "Rekord Founders oczekuje — pełny dostęp aplikacyjny nie jest jeszcze aktywny (chyba że nada to wyjątek).",
    };
  }
  if (s.status === "revoked") {
    return { label: "Cofnięty", detail: "Członkostwo Founders zostało cofnięte. W razie wątpliwości skontaktuj się z zespołem." };
  }
  return { label: "Nieaktywny", detail: "Członkostwo Founders nie jest obecnie aktywne." };
}

function PlanBadge({ tier }: { tier: Tier }) {
  const paid = hasFullPanelAccess(tier);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs">
      <span className="opacity-70">Dostęp</span>
      <strong>{paid ? 'Pełny' : 'Ograniczony'}</strong>
    </span>
  );
}

export default async function Page() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/logowanie?next=/konto/plan");
  }
  const c = await cookies();
  const tier = resolveTierFromCookiesAndSession(c, session);
  const paid = hasFullPanelAccess(tier);
  const foundersSummary = await getFoundersAccess(session.userId);
  const foundersUi = foundersStatusDescription(foundersSummary);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href="/client" className="text-sm text-white/70 hover:text-white">
            ← Powrót do panelu
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Mój dostęp</h1>
              <p className="mt-1 text-white/70">
                Jedna oferta: pełny panel EDU po Founders NFT. Poniżej moduły dostępne przy aktywnym dostępie.
              </p>
            </div>
            <PlanBadge tier={tier} />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Status</div>
            <div className="mt-1 text-sm text-white/80">
              {paid ? (
                <>Masz pełny dostęp do wszystkich modułów panelu rynkowego (EDU).</>
              ) : (
                <>
                  Nie masz jeszcze pełnego dostępu. Odblokujesz go przez{" "}
                  <Link href="/cennik" className="underline">
                    Founders NFT
                  </Link>{" "}
                  — jednorazowy zakup.
                </>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">Moduły panelu</div>
              <Link
                href="/konto/panel-rynkowy"
                className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:opacity-90"
              >
                Otwórz Panel (EDU)
              </Link>
            </div>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
              {paid ? (
                <>
                  <li>
                    <Link href="/konto/panel-rynkowy/kalendarz-7-dni" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Kalendarz 7 dni
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/scenariusze-abc" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Scenariusze A/B/C
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/checklisty" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Checklisty
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/mapy-techniczne" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Mapy techniczne (EDU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/playbooki-eventowe" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Playbooki eventowe
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/coach-ai" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Coach AI (EDU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/konto/panel-rynkowy/raport-miesieczny" className="underline underline-offset-4 decoration-white/30 hover:decoration-white">
                      Raport miesięczny (EDU)
                    </Link>
                  </li>
                </>
              ) : (
                <li className="text-white/70 sm:col-span-2">
                  Brak pełnego dostępu — zobacz{" "}
                  <Link href="/marketplace" className="underline">
                    marketplace NFT
                  </Link>{" "}
                  lub{" "}
                  <Link href="/cennik" className="underline">
                    cennik
                  </Link>
                  .
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">Founders</div>
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  foundersSummary.accessActive
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                    : foundersSummary.hasRecord
                      ? "border-white/15 bg-white/5 text-white/70"
                      : "border-white/10 bg-white/[0.04] text-white/50"
                }`}
              >
                {foundersUi.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/80">{foundersUi.detail}</p>
            <p className="mt-2 text-xs text-white/50">
              Członkostwo Founders jest nadawane i utrzymywane przez FXEduLab. Transfer oraz dostęp są obsługiwane zgodnie z
              zasadami projektu — bez automatycznego odczytu blockchaina w tej aplikacji.
            </p>
            <Link
              href="/konto/founders-token"
              className="mt-3 inline-block text-sm font-medium text-emerald-200/95 underline underline-offset-4 hover:text-white"
            >
              Szczegóły Founders →
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Zakup dostępu</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/marketplace"
                className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Founders NFT — marketplace
              </Link>
              <Link href="/cennik" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                Cennik
              </Link>
              <Link href="/kontakt?topic=zakup-pakietu" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                Kontakt
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid md:grid-cols-3">
              <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                <div className="text-sm font-semibold text-white/90">Egzaminy i certyfikaty</div>
                <div className="mt-1 text-xs text-white/70">
                  Kursy i quizy na koncie; pełny panel EDU po Founders NFT.
                </div>
              </div>
              <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                <div className="text-sm font-semibold text-white/90">Panel rynkowy</div>
                <div className="mt-1 text-xs text-white/70">
                  Wszystkie moduły (kalendarz, scenariusze, mapy, playbooki, raport) w jednym dostępie.
                </div>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold text-white/90">Coach AI</div>
                <div className="mt-1 text-xs text-white/70">
                  Wchodzi w skład pełnego dostępu (wersja edukacyjna).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
