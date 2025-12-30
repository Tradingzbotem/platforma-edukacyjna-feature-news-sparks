// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista wspieranych języków
const SUPPORTED = ['pl', 'en'];
const DEFAULT_LANG = 'pl';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Jeśli cookie "lang" już istnieje → zostaw
  if (req.cookies.has('lang')) {
    return res;
  }

  // Spróbuj wykryć język z nagłówka Accept-Language
  const acceptLang = req.headers.get('accept-language') || '';
  const found = SUPPORTED.find((code) =>
    acceptLang.toLowerCase().includes(code)
  );

  const lang = found || DEFAULT_LANG;

  // Ustaw cookie (rok ważności) — bezpieczniejsze opcje w produkcji
  res.cookies.set('lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 rok
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Ułatw CDN/pośrednikom rozróżnianie odpowiedzi wg języka
  res.headers.set('Vary', 'Accept-Language');

  return res;
}
