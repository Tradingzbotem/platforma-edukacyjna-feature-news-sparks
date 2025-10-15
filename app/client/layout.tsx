// app/client/layout.tsx
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  // Użyj iron-session, aby wiarygodnie potwierdzić logowanie
  let isLoggedIn = false;
  try {
    const s = await getSession();
    isLoggedIn = Boolean(s.userId);
  } catch {
    // brak SESSION_PASSWORD itp. -> traktuj jako niezalogowany
    isLoggedIn = false;
  }

  if (!isLoggedIn) {
    redirect("/logowanie?next=/client");
  }

  return <>{children}</>;
}
