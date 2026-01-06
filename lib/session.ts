// lib/session.ts
import 'server-only';

import { getIronSession, type SessionOptions } from 'iron-session';
import crypto from 'crypto';
import { cookies as nextCookies } from 'next/headers';
import { findUserById, isDatabaseConfigured } from '@/lib/db';

export type SessionData = {
  userId?: string;
  email?: string;
  plan?: 'free' | 'starter' | 'pro' | 'elite';
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
  const session = await getIronSession<SessionData>(store, sessionOptions);
  // Sync plan with DB on every request so admin changes take effect immediately
  try {
    if (session.userId && isDatabaseConfigured()) {
      const dbUser = await findUserById(session.userId).catch(() => null);
      if (!dbUser) {
        // User removed → clear session
        session.userId = undefined;
        session.email = undefined;
        session.plan = undefined;
        await session.save();
      } else {
        const dbPlan =
          dbUser.plan === 'elite' || dbUser.plan === 'pro' || dbUser.plan === 'starter' || dbUser.plan === 'free'
            ? dbUser.plan
            : 'free';
        if (session.plan !== dbPlan) {
          session.plan = dbPlan;
          await session.save();
        }
      }
    }
  } catch {
    // Best-effort sync; ignore failures
  }
  return session;
}

