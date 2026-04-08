import 'server-only';

/**
 * Bazowy URL publiczny (verify / QR). Izolacja w module certyfikatów.
 */
export function getPublicSiteBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const vercel = (process.env.VERCEL_URL || '').trim();
  if (vercel) {
    return vercel.startsWith('http') ? vercel.replace(/\/$/, '') : `https://${vercel.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

export function buildCertificateVerifyAbsoluteUrl(verificationToken: string): string {
  const base = getPublicSiteBaseUrl();
  const path = `/certificates/verify/${encodeURIComponent(verificationToken)}`;
  return `${base}${path}`;
}
