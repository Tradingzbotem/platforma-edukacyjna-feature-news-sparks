// lib/session.ts
import 'server-only';

import { getIronSession, type SessionOptions } from 'iron-session';
import crypto from 'crypto';
import { cookies as nextCookies } from 'next/headers';

export type SessionData = {
  userId?: string;
  email?: string;
  plan?: 'free' | 'pro';
};

const sessionOptions: SessionOptions = {
  cookieName: 'fxedulab_session',
  password: process.env.SESSION_PASSWORD ?? '',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};

function ensurePassword() {
  const raw =
    Array.isArray(sessionOptions.password)
      ? sessionOptions.password[0]
      : String(sessionOptions.password ?? '');

  if (!raw || raw.length < 32) {
    // Dev fallback: generate stable per-project secret to avoid 500 in local dev
    if (process.env.NODE_ENV !== 'production') {
      const devSecret = crypto
        .createHash('sha256')
        .update(`fxedu-dev:${process.cwd()}`)
        .digest('hex');
      // mutate in-place so iron-session picks it up
      (sessionOptions as SessionOptions).password = devSecret;
      return;
    }
    throw new Error(
      'Brak SESSION_PASSWORD lub ma < 32 znaki. Dodaj do .env.local oraz na Vercel → Project → Settings → Environment Variables.'
    );
  }
}

export async function getSession() {
  ensurePassword();
  const store = await nextCookies(); // ⬅️ dodany await (Next 15.x)
  return getIronSession<SessionData>(store, sessionOptions);
}

