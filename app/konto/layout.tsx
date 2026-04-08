import type { ReactNode } from "react";
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from "@/lib/features";
import { getSession } from "@/lib/session";
import { KontoExamLockProvider } from "./KontoExamLockContext";
import KontoHeader from "./KontoHeader";

/** Nested layout dla /konto (SERVER component) */
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const certificationAccess = session.userId
    ? await hasFeature(session.userId, FEATURE_CERTIFICATION_ACCESS)
    : false;

  return (
    <KontoExamLockProvider>
      <main className="min-h-screen bg-transparent text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <KontoHeader certificationAccess={certificationAccess} />

          {children}
        </div>
      </main>
    </KontoExamLockProvider>
  );
}
