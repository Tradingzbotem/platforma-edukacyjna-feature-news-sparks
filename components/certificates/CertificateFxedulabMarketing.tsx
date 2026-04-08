import Link from 'next/link';
import type { ReactNode } from 'react';

export type PublicCertPageAudience = 'guest' | 'logged_in_no_module' | 'logged_in_with_module';

export type CertificateFxedulabMarketingProps = {
  topBack: { href: string; label: string };
  /** Gdy ustawione — przycisk egzaminu (użytkownik z włączonym modułem). Gdy null — blok z informacją o dostępie. */
  examCta: { href: string; label: string } | null;
  /** Opcjonalnie: opis kroku 1 ścieżki (np. krótszy tekst gdy moduł jest już aktywny na koncie). */
  step1Line?: string;
  /**
   * Tylko gdy `examCta === null` (publiczna strona): kto ogląda — steruje przyciskami w sekcji „Jak zdobyć certyfikat”.
   */
  publicAudience?: PublicCertPageAudience;
};

const STEP1_DEFAULT =
  'Administrator może włączyć moduł certyfikacji na Twoim koncie (np. w ramach planu lub indywidualnie).';

export function CertificateFxedulabMarketing({
  topBack,
  examCta,
  step1Line = STEP1_DEFAULT,
  publicAudience = 'guest',
}: CertificateFxedulabMarketingProps) {
  return (
    <div className="space-y-16 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={topBack.href} className="text-sm text-white/55 transition hover:text-white">
          {topBack.label}
        </Link>
      </div>

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-400/90">Produkt premium</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Certyfikat FXEDULAB
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          Oficjalny status kompetencji w standardzie FXEDULAB: potwierdzenie wiedzy, weryfikowalny dokument i identyfikator,
          którym możesz się podzielić — tak jak w świecie certyfikacji zawodowej i fintech.
        </p>
      </header>

      <section className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white/45">Po co certyfikat</h2>
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-white/60">
          Platforma daje materiały i narzędzia. Certyfikat to osobny krok: udokumentowany, możliwy do sprawdzenia przez
          osoby trzecie sygnał, że Twoja wiedza została zweryfikowana w ustalonym programie — przydatny w CV, przy współpracy
          lub w społeczności, bez udostępniania całego konta.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Potwierdzenie umiejętności',
              body: 'Jasny sygnał, że przeszedłeś wymagania programu — nie tylko „ukończyłem materiał”, lecz zweryfikowany poziom.',
            },
            {
              title: 'Weryfikowalny dokument',
              body: 'PDF gotowy do archiwum, CV lub prezentacji. Każdy może sprawdzić autentyczność przez publiczną stronę weryfikacji.',
            },
            {
              title: 'Unikalne ID i QR',
              body: 'Publiczny identyfikator i kod QR na certyfikacie — szybki dostęp do strony potwierdzającej ważność.',
            },
            {
              title: 'Prezentacja innym',
              body: 'Możesz pokazać status partnerom, pracodawcy lub społeczności — bez udostępniania całego konta w platformie.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent px-5 py-6"
            >
              <h3 className="text-base font-semibold text-amber-100/95">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="jak-dziala-egzamin" className="mx-auto max-w-5xl scroll-mt-28 space-y-8">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/45">Jak działa egzamin i ścieżka</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-white/50">
            Kolejność kroków w module — od dostępu do dokumentu, który możesz pokazać innym.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '1',
              title: 'Dostęp do modułu certyfikatu',
              line: step1Line,
            },
            {
              step: '2',
              title: 'Podejście do egzaminu',
              line: 'Start sesji, pytania i wysłanie odpowiedzi w ramach aktywnej ścieżki.',
            },
            {
              step: '3',
              title: 'Weryfikacja wyniku',
              line: 'System zapisuje wynik i status zgodnie z zasadami ścieżki.',
            },
            {
              step: '4',
              title: 'Wydanie certyfikatu FXEDULAB',
              line: 'Rekord z ID, PDF do pobrania i publiczna strona weryfikacji.',
            },
          ].map((item) => (
            <li
              key={item.step}
              className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5 sm:flex-col sm:gap-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/10 text-xs font-bold text-amber-200/95"
                aria-hidden
              >
                {item.step}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug text-white/92">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{item.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-2xl rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] px-8 py-10 text-center">
        <h2 className="text-xl font-semibold text-white">Jak zdobyć certyfikat</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Certyfikat uzyskasz po zdaniu egzaminu certyfikacyjnego na aktywnej ścieżce. Sam egzamin — start, pytania i wynik —
          odbywa się w module na koncie, po{' '}
          <strong className="text-white/85">włączeniu dostępu do certyfikacji</strong> przez administratora.
        </p>
        {examCta ? (
          <p className="mt-9 flex justify-center">
            <Link
              href={examCta.href}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-amber-500/45 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-8 text-sm font-semibold text-amber-50 transition hover:border-amber-400/70 hover:from-amber-500/30"
            >
              {examCta.label}
            </Link>
          </p>
        ) : (
          <div className="mt-8 space-y-4 text-left text-sm text-white/70">
            {publicAudience === 'logged_in_with_module' ? (
              <p>
                Masz już dostęp do modułu certyfikacji na koncie — możesz przejść bezpośrednio do egzaminu i podglądu certyfikatu.
              </p>
            ) : publicAudience === 'logged_in_no_module' ? (
              <p>
                Jesteś zalogowany, ale moduł certyfikatu nie jest jeszcze włączony na Twoim koncie. Napisz do nas lub sprawdź{' '}
                <Link href="/cennik" className="font-medium text-amber-200/95 underline-offset-2 hover:underline">
                  cennik
                </Link>
                — dostęp przyznaje administrator zgodnie z zasadami produktu.
              </p>
            ) : (
              <p>
                Aby włączyć moduł na koncie,{' '}
                <strong className="text-white/80">zaloguj się</strong> (przycisk poniżej), a jeśli nadal go nie widzisz —
                skontaktuj się z nami lub sprawdź{' '}
                <Link href="/cennik" className="font-medium text-amber-200/95 underline-offset-2 hover:underline">
                  cennik
                </Link>
                . Dostęp przyznaje administrator zgodnie z zasadami produktu.
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              {publicAudience === 'guest' ? (
                <Link
                  href="/logowanie?next=/konto/certyfikat"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.1]"
                >
                  Zaloguj się
                </Link>
              ) : null}
              {publicAudience === 'logged_in_no_module' ? (
                <Link
                  href="/kontakt"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-500/45 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-6 text-sm font-semibold text-amber-50 transition hover:border-amber-400/70"
                >
                  Skontaktuj się z nami
                </Link>
              ) : null}
              {publicAudience === 'logged_in_with_module' ? (
                <Link
                  href="/konto/certyfikat"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-500/45 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-6 text-sm font-semibold text-amber-50 transition hover:border-amber-400/70"
                >
                  Przejdź do modułu certyfikatu
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl space-y-6 pb-2">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white/45">
          Standard certyfikacji
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Weryfikowalność',
              body: 'Każdy certyfikat można potwierdzić publicznym linkiem — bez logowania do konta.',
            },
            {
              title: 'Jednoznaczny wynik i poziom',
              body: 'Wynik z egzaminu przekłada się na poziom i zapis w systemie — jeden spójny rekord.',
            },
            {
              title: 'Dokument do pokazania',
              body: 'PDF z ID i QR: CV, portfolio, rozmowa lub social — Ty decydujesz, komu go pokazać.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-6 text-center md:text-left"
            >
              <h3 className="text-sm font-semibold text-amber-100/95">{card.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/60">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Opcjonalna otoczka pod stronę publiczną (root layout ma już header/footer). */
export function CertificateFxedulabPublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div id="content" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
