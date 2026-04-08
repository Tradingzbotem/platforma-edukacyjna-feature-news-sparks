import { randomBytes } from 'crypto';

/**
 * Jednorazowy, URL-safe token weryfikacji (ścieżka `/certificates/verify/[token]`).
 */
export function generateVerificationToken(): string {
  return randomBytes(24).toString('base64url');
}

export function normalizeVerificationToken(raw: string): string {
  return raw.trim();
}
