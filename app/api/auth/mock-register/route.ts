import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Rejestracja demo:
 * - Odbiera POST z <form> (FormData)
 * - Ustawia ciasteczka auth i plan
 * - Przekierowuje na /konto
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? ''); // nieużywane w mocku
  const accept = form.get('accept'); // checkbox -> "1" gdy zaznaczony

  // Bardzo podstawowa walidacja – w razie błędu wracamy do formularza
  if (!name || !email || !accept) {
    const url = new URL('/rejestracja', req.url);
    url.searchParams.set('error', 'missing');
    return NextResponse.redirect(url, { status: 302 });
  }

  // Ustawiamy sesję w ciasteczkach (tryb demo)
  const res = NextResponse.redirect(new URL('/konto', req.url), { status: 302 });

  const month = 60 * 60 * 24 * 30;
  const cookieOpts = { path: '/', maxAge: month, sameSite: 'lax' as const };

  // W mocku mogą być nie-HttpOnly, żebyś mógł łatwo podejrzeć w devtoolsach
  res.cookies.set('auth', '1', { ...cookieOpts });
  res.cookies.set('plan', 'free', { ...cookieOpts });
  res.cookies.set('name', encodeURIComponent(name), { ...cookieOpts });
  res.cookies.set('email', encodeURIComponent(email), { ...cookieOpts });

  return res;
}

/** Blokujemy przypadkowe wejście GET /api/auth/mock-register z paska adresu */
export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}
