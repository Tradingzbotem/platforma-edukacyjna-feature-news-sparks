// app/components/AccessGuard.tsx
import "server-only";
import type { ReactNode } from "react";
import { getRoleFromCookies, canAccess, type RequiredAccess } from "@/lib/access";

export default async function AccessGuard({
  required = "public",
  children,
}: {
  required?: RequiredAccess;
  children: ReactNode;
}) {
  const role = await getRoleFromCookies();
  if (!canAccess(required, role)) return null; // TODO: replace with redirect/notFound per route UX
  return <>{children}</>;
}
