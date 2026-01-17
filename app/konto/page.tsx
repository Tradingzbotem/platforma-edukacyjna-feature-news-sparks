// app/konto/page.tsx
// Legacy redirect - główny dashboard został przeniesiony do /client
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getSession();
  
  // Jeśli nie zalogowany → przekieruj na logowanie z powrotem na /client
  if (!session.userId) {
    redirect("/logowanie?next=/client");
  }

  // Przekieruj na główny dashboard klienta
  redirect("/client");
}
