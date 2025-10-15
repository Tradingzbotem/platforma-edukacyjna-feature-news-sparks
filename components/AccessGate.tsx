// components/AccessGate.tsx — SSR gate enforcing required access using session plan
import "server-only";
import { ReactNode } from 'react';
import { getRoleFromCookies, canAccess } from '@/lib/access';

export default async function AccessGate({
  required = 'public',
  children,
  fallbackAuth = null,
  fallbackPro = null,
}: {
  required?: 'public' | 'auth' | 'pro';
  children: ReactNode;
  fallbackAuth?: ReactNode;
  fallbackPro?: ReactNode;
}) {
  const role = await getRoleFromCookies();
  if (canAccess(required, role)) return <>{children}</>;
  if (required === 'auth') return <>{fallbackAuth}</>;
  if (required === 'pro') return <>{fallbackPro}</>;
  return null;
}
