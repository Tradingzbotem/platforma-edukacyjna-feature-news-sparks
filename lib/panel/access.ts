// lib/panel/access.ts — helpery dostępu do modułów Panelu (EDU)

export type Tier = 'free' | 'starter' | 'pro' | 'elite';

export type CookieGetter = {
  get(name: string): { value: string } | undefined;
};

// Minimalne zależności: przyjmujemy obiekt cookies z metodą get(name) -> { value } | undefined
// oraz session z polem plan: 'free' | 'pro' | undefined
export function resolveTierFromCookiesAndSession(
  c: CookieGetter,
  session?: { plan?: 'free' | 'pro' }
): Tier {
  try {
    const cookieTier = (c.get('tier')?.value || '') as Tier | '';
    if (cookieTier === 'starter' || cookieTier === 'pro' || cookieTier === 'elite' || cookieTier === 'free') {
      return cookieTier;
    }
    const sessPlan = session?.plan;
    const cookiePlan = (c.get('plan')?.value || '') as 'free' | 'pro' | '';
    const anyPro = sessPlan === 'pro' || cookiePlan === 'pro';
    return anyPro ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}

const ORDER: Record<Tier, number> = { free: 0, starter: 1, pro: 2, elite: 3 };

export function isTierAtLeast(current: Tier, required: Tier): boolean {
  return ORDER[current] >= ORDER[required];
}

