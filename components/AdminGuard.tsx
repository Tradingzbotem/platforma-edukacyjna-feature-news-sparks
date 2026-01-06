// components/AdminGuard.tsx
import "server-only";
import type { ReactNode } from "react";
import { getIsAdmin } from "@/lib/admin";

export default async function AdminGuard({ children }: { children: ReactNode }) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
}


