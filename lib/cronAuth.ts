// lib/cronAuth.ts
// Auth for schedulers (GitHub Actions cron jobs)
export function requireCronSecret(req: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null; // permissive fallback if env not set

  const header = req.headers.get('x-cron-secret');
  if (header !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}