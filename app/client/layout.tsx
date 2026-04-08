// app/client/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import KontoHeader from "@/app/konto/KontoHeader";
import { FEATURE_CERTIFICATION_ACCESS, hasFeature } from "@/lib/features";
import { getSession } from "@/lib/session";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  // Użyj iron-session, aby wiarygodnie potwierdzić logowanie
  let userId: string | undefined;
  try {
    const s = await getSession();
    userId = s.userId;
  } catch {
    userId = undefined;
  }

  if (!userId) {
    redirect("/logowanie?next=/client");
  }

  const certificationAccess = await hasFeature(userId, FEATURE_CERTIFICATION_ACCESS);

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
        <KontoHeader certificationAccess={certificationAccess} />
      </div>
      {children}
    </>
  );
}
