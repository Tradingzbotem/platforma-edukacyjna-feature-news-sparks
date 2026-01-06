// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista wspieranych języków
const SUPPORTED = ['pl', 'en'];
const DEFAULT_LANG = 'pl';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ────────────────────── PUBLIC/ASSET WHITELIST ──────────────────────
  const isAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname); // pliki w /public (svg, png, css, js, map, itp.)

  const isAuthPage =
    pathname.startsWith('/logowanie') || pathname.startsWith('/rejestracja') || pathname.startsWith('/dev-auth');

  // Home zostawiamy publiczny, zgodnie z typowym UX
  const isHome = pathname === '/';

  // Jedyna sekcja dostępna bez logowania wg wymagań
  const isPublicRankings = pathname.startsWith('/rankingi/brokerzy');
  // Panel rynkowy dostępny publicznie do podglądu oferty (lista modułów i podstrony)
  const isPublicMarketPanel = pathname.startsWith('/konto/panel-rynkowy');
  // Stara zakładka z opisem pakietów (ebooki) dostępna publicznie
  const isPublicEbooki = pathname.startsWith('/ebooki');
  // Strona kontaktowa dostępna publicznie
  const isPublicContact = pathname.startsWith('/kontakt');
  // Strona "O nas" dostępna publicznie
  const isPublicAbout = pathname.startsWith('/o-nas');
  // Strona cennika dostępna publicznie
  const isPublicPricing = pathname.startsWith('/cennik');
  // Strony prawne i FAQ dostępne publicznie
  const isPublicTerms = pathname.startsWith('/prawne/warunki-korzystania');
  const isPublicPrivacy = pathname.startsWith('/prawne/polityka-prywatnosci');
  const isPublicCookies = pathname.startsWith('/prawne/cookies');
  // Cała sekcja prawna publiczna
  const isPublicLegalSection = pathname.startsWith('/prawne');
  const isPublicFAQ = pathname.startsWith('/faq') || pathname.startsWith('/zasoby/faq');

  const isWhitelisted =
    isAsset ||
    isAuthPage ||
    isHome ||
    isPublicRankings ||
    isPublicMarketPanel ||
    isPublicEbooki ||
    isPublicContact ||
    isPublicAbout ||
    isPublicPricing ||
    isPublicTerms ||
    isPublicPrivacy ||
    isPublicCookies ||
    isPublicLegalSection ||
    isPublicFAQ;

  // Uznajemy użytkownika za zalogowanego, jeśli istnieje sesja iron-session
  // lub (w trybie dev) legacy cookie 'auth' === '1'
  const hasIronSession = !!req.cookies.get('fxedulab_session')?.value;
  const hasLegacyAuth = req.cookies.get('auth')?.value === '1';
  const isAuthenticated = hasIronSession || hasLegacyAuth;

  // Jeśli nie whitelisted i nie zalogowany → redirect do logowania z "next"
  if (!isWhitelisted && !isAuthenticated) {
    const loginUrl = new URL('/logowanie', req.url);
    const nextParam = pathname + (search || '');
    loginUrl.searchParams.set('next', nextParam);
    const redirectRes = NextResponse.redirect(loginUrl);

    // ustaw cookie języka także przy redirect
    if (!req.cookies.has('lang')) {
      const acceptLang = req.headers.get('accept-language') || '';
      const found = SUPPORTED.find((code) => acceptLang.toLowerCase().includes(code));
      const lang = found || DEFAULT_LANG;
      redirectRes.cookies.set('lang', lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      redirectRes.headers.set('Vary', 'Accept-Language');
    }

    return redirectRes;
  }

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
