// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureUsersTable, findUserByEmail, insertUser, hashPassword, isDatabaseConfigured } from '@/lib/db';
import { getSession } from '@/lib/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Min. 8 znaków'),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Podaj numer w formacie E.164, np. +48500111222'),
  name: z.string().min(2).max(60).optional(),
  plan: z.enum(['free', 'pro']).optional(),
});

async function parsePayload(req: NextRequest) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    return schema.parse(body);
  }
  // FormData (np. <form method="POST">)
  const form = await req.formData();
  const data = {
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
    phone: String(form.get('phone') ?? ''),
    name: String(form.get('name') ?? '') || undefined,
    plan: (String(form.get('plan') ?? 'free').toLowerCase() as 'free' | 'pro') || 'free',
  };
  return schema.parse(data);
}

export async function POST(req: NextRequest) {
  try {
    // Jeśli DB nie jest skonfigurowana, nie rejestruj – zgłoś 503
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 503 });
    }
    const data = await parsePayload(req);
    await ensureUsersTable();

    const exists = await findUserByEmail(data.email);
    if (exists) {
      // form → redirect z błędem; JSON → 409
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 409 });
      }
      const url = new URL('/rejestracja', req.url);
      url.searchParams.set('error', 'email_taken');
      return NextResponse.redirect(url, { status: 302 });
    }

    const id = crypto.randomUUID();
    const password_hash = await hashPassword(data.password);
    await insertUser({ id, email: data.email, password_hash, name: data.name ?? null, phone: data.phone, plan: data.plan ?? 'free' });

    // start sesji
    const session = await getSession();
    session.userId = id;
    session.email = data.email;
    session.plan = data.plan ?? 'free';
    await session.save();

    // form → redirect do /client; JSON → {ok:true}
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return NextResponse.json({ ok: true, userId: id, email: data.email });
    }
    return NextResponse.redirect(new URL('/client', req.url), { status: 302 });
  } catch (err: any) {
    const message = err?.message || 'invalid_payload';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}
