// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Cel przekierowania, np. /konto (domyślnie)
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/konto';

  // Obsługa application/json i form-urlencoded
  const ct = req.headers.get('content-type') || '';
  let parsed: z.infer<typeof LoginSchema>;
  try {
    if (ct.includes('application/json')) {
      const raw = await req.json().catch(() => ({}));
      parsed = LoginSchema.parse({
        email: String((raw as any)?.email ?? (raw as any)?.login ?? ''),
        password: String((raw as any)?.password ?? ''),
      });
    } else if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      parsed = LoginSchema.parse({
        email: String(form.get('email') ?? form.get('login') ?? ''),
        password: String(form.get('password') ?? ''),
      });
    } else {
      // próba JSON, a jeśli się nie uda → błąd
      const raw = await req.json().catch(() => ({}));
      parsed = LoginSchema.parse({
        email: String((raw as any)?.email ?? (raw as any)?.login ?? ''),
        password: String((raw as any)?.password ?? ''),
      });
    }
  } catch (err: any) {
    const issues = err?.issues ? z.ZodError.create(err.issues).flatten() : undefined;
    return NextResponse.json(
      { ok: false, error: 'INVALID_CREDENTIALS', issues },
      { status: 400 }
    );
  }

  const session = await getSession();
  session.userId = `u_${Buffer.from(parsed.email).toString('hex').slice(0, 12)}`;
  session.email = parsed.email;
  session.plan = 'free';
  await session.save();

  return NextResponse.json({ ok: true, redirect: next }, { status: 200 });
}

export function GET() {
  // Blokujemy przypadkowe wejście GET /api/auth/login
  return new NextResponse('Method Not Allowed', { status: 405 });
}
