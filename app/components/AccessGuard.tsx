// app/components/AccessGuard.tsx
import "server-only";
import type { ReactNode } from "react";
import { getRoleFromCookies, canAccess, type RequiredAccess } from "@/lib/access";
import { redirect } from "next/navigation";

export default async function AccessGuard({
  required = "public",
  children,
}: {
  required?: RequiredAccess;
  children: ReactNode;
}) {
  const role = await getRoleFromCookies();
  if (!canAccess(required, role)) {
    if (required === "auth" || required === "pro") {
      redirect("/logowanie");
    }
    return null;
  }
  return <>{children}</>;
}
