export type DigestItem = { title: string };

const POS = [
  'surge', 'rally', 'beat', 'beats', 'above', 'grow', 'growth', 'improve', 'bull', 'bullish',
  'record', 'all-time', 'upgrade', 'raise', 'strong', 'accelerate', 'positive'
];
const NEG = [
  'drop', 'slump', 'miss', 'below', 'fall', 'falls', 'worse', 'weak', 'bear', 'bearish',
  'downgrade', 'cut', 'reduce', 'slow', 'negative', 'recall', 'probe', 'investigation'
];
const BOOST_STRONG = ['record', 'all-time', 'surge', 'plunge', 'cut', 'raise', 'upgrade', 'downgrade'];

/** Zwraca sugerowaną pewność w zakresie 50–90 (integer). Neutral = ~65–70. */
export function suggestConfidenceFromNews(digest: DigestItem[]): number {
  if (!digest || digest.length === 0) return 70; // fallback

  let score = 0;
  for (const it of digest) {
    const t = (it.title || '').toLowerCase();
    for (const w of POS) if (t.includes(w)) score += 1;
    for (const w of NEG) if (t.includes(w)) score -= 1;
    for (const w of BOOST_STRONG) {
      if (t.includes(w)) score += t.includes('downgrade') || t.includes('cut') ? -0.5 : 0.5;
    }
  }

  // mapowanie: score ∈ [-6, +6] → confidence ∈ [50, 90]
  const minS = -6, maxS = 6;
  const clamped = Math.max(minS, Math.min(maxS, score));
  const norm = (clamped - minS) / (maxS - minS); // 0..1
  const conf = 50 + Math.round(norm * 40);       // 50..90

  // lekka „bezpieczna” neutralizacja, jeśli wyniki są sprzeczne
  if (Math.abs(score) <= 1) return Math.max(60, Math.min(75, conf));
  return conf;
}


