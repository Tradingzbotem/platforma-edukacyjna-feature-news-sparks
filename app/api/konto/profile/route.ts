import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ensureUsersTable,
  findUserById,
  isDatabaseConfigured,
  updateUserProfileSettings,
} from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function normalizeAvatarUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const s = u.toString();
    if (s.length > 2000) return null;
    return s;
  } catch {
    return null;
  }
}

function planFromRow(plan: string | null | undefined): 'free' | 'starter' | 'pro' | 'elite' {
  if (plan === 'elite' || plan === 'pro' || plan === 'starter' || plan === 'free') return plan;
  return 'free';
}

/** Gdy brak kolumn imię/nazwisko — podpowiedź z legacy `name` (rejestracja). */
function inferFirstLastFromName(full: string | null | undefined): { first: string | null; last: string | null } {
  const t = full?.trim();
  if (!t) return { first: null, last: null };
  const i = t.indexOf(' ');
  if (i <= 0) return { first: t, last: null };
  const rest = t.slice(i + 1).trim();
  return { first: t.slice(0, i), last: rest || null };
}

const patchSchema = z.object({
  first_name: z.string().max(120),
  last_name: z.string().max(120),
  name: z.string().max(200),
  phone: z.string().max(80),
  avatar_url: z.string().max(2000),
  notify_edu: z.boolean(),
  notify_market: z.boolean(),
});

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }
  try {
    await ensureUsersTable();
  } catch {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
  }

  const notifyEdu = user.notify_edu == null ? true : Boolean(user.notify_edu);
  const notifyMarket = user.notify_market == null ? true : Boolean(user.notify_market);

  let firstName = user.first_name?.trim() || null;
  let lastName = user.last_name?.trim() || null;
  if (!firstName && !lastName) {
    const inf = inferFirstLastFromName(user.name);
    firstName = inf.first;
    lastName = inf.last;
  }

  return NextResponse.json({
    ok: true,
    profile: {
      first_name: firstName,
      last_name: lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url ?? null,
      notify_edu: notifyEdu,
      notify_market: notifyMarket,
      plan: planFromRow(user.plan),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'validation_error' }, { status: 400 });
  }

  const avatarNorm = normalizeAvatarUrl(parsed.data.avatar_url);
  if (parsed.data.avatar_url.trim() && avatarNorm === null) {
    return NextResponse.json({ ok: false, error: 'invalid_avatar_url' }, { status: 400 });
  }

  const nameTrim = parsed.data.name.trim();
  const phoneTrim = parsed.data.phone.trim();

  try {
    await ensureUsersTable();
  } catch {
    return NextResponse.json({ ok: false, error: 'database_unavailable' }, { status: 503 });
  }

  const existing = await findUserById(session.userId);
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
  }

  await updateUserProfileSettings(session.userId, {
    first_name: firstTrim || null,
    last_name: lastTrim || null,
    name: nameTrim || null,
    phone: phoneTrim || null,
    avatar_url: avatarNorm,
    notify_edu: parsed.data.notify_edu,
    notify_market: parsed.data.notify_market,
  });

  return NextResponse.json({ ok: true });
}
