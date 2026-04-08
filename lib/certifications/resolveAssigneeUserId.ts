import 'server-only';

import { z } from 'zod';

import { findUserByEmail, isDatabaseConfigured } from '@/lib/db';

const emailSchema = z.string().email();

export type ResolveCertificationAssigneeEmailResult =
  | { ok: true; userId: null }
  | { ok: true; userId: string }
  | { ok: false; error: 'email_invalid' | 'user_not_found' | 'db_unavailable' };

/**
 * Opcjonalne przypisanie certyfikatu do konta użytkownika po emailu (admin).
 * Pusty lub sam biały znak → brak przypisania (userId null).
 */
export async function resolveCertificationUserIdByEmail(
  raw: string,
): Promise<ResolveCertificationAssigneeEmailResult> {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, userId: null };
  }

  const normalized = trimmed.toLowerCase();
  const parsed = emailSchema.safeParse(normalized);
  if (!parsed.success) {
    return { ok: false, error: 'email_invalid' };
  }

  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'db_unavailable' };
  }

  const user = await findUserByEmail(parsed.data);
  if (!user) {
    return { ok: false, error: 'user_not_found' };
  }

  return { ok: true, userId: user.id };
}
