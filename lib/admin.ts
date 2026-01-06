import 'server-only';
import { getSession } from '@/lib/session';

export function isAdminEmail(email?: string | null): boolean {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!adminEmail) return false;
  const e = (email || '').trim().toLowerCase();
  return !!e && e === adminEmail;
}

export async function getIsAdmin(): Promise<boolean> {
  try {
    const s = await getSession();
    return isAdminEmail(s.email ?? null);
  } catch {
    return false;
  }
}


