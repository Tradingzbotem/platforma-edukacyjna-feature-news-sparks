import type { ReactNode } from "react";
import AdminGuard from "@/components/AdminGuard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}


