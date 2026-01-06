// lib/panel/access.ts — helpery dostępu do modułów Panelu (EDU)

export type Tier = 'free' | 'starter' | 'pro' | 'elite';

export type CookieGetter = {
  get(name: string): { value: string } | undefined;
};

// Minimalne zależności: przyjmujemy obiekt cookies z metodą get(name) -> { value } | undefined
// oraz session z polem plan: 'free' | 'pro' | 'starter' | 'elite' | undefined
export function resolveTierFromCookiesAndSession(
  c: CookieGetter,
  session?: { plan?: 'free' | 'starter' | 'pro' | 'elite' }
): Tier {
  try {
    // Source of truth for logged-in users is the session (synced with DB in getSession)
    const sessPlan = session?.plan;
    if (sessPlan === 'elite' || sessPlan === 'pro' || sessPlan === 'starter' || sessPlan === 'free') {
      return sessPlan;
    }

    // Fallbacks for guests / dev-mocks
    const cookieTier = (c.get('tier')?.value || '') as Tier | '';
    if (cookieTier === 'starter' || cookieTier === 'pro' || cookieTier === 'elite' || cookieTier === 'free') {
      return cookieTier;
    }
    const cookiePlan = (c.get('plan')?.value || '') as 'free' | 'starter' | 'pro' | 'elite' | '';
    if (cookiePlan === 'elite' || cookiePlan === 'pro' || cookiePlan === 'starter' || cookiePlan === 'free') {
      return cookiePlan;
    }
    return 'free';
  } catch {
    return 'free';
  }
}

const ORDER: Record<Tier, number> = { free: 0, starter: 1, pro: 2, elite: 3 };

export function isTierAtLeast(current: Tier, required: Tier): boolean {
  return ORDER[current] >= ORDER[required];
}

