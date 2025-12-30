import type { CookieGetter, Tier } from '@/lib/panel/access';
import { resolveTierFromCookiesAndSession, isTierAtLeast } from '@/lib/panel/access';

export function requireTier(
  c: CookieGetter,
  session: { plan?: 'free' | 'pro' } | undefined,
  required: Tier
): { tier: Tier; unlocked: boolean } {
  const tier = resolveTierFromCookiesAndSession(c, session);
  return { tier, unlocked: isTierAtLeast(tier, required) };
}


