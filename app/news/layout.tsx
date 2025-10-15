import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function NewsLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/logowanie?next=/news");
  }
  return <>{children}</>;
}


