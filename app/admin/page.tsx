'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function AdminPage() {
  const tiles = useMemo(
    () => [
      {
        title: 'Użytkownicy',
        href: '/admin/uzytkownicy',
        desc: 'Zarządzanie planami, przegląd kont i usuwanie użytkowników.',
      },
      {
        title: 'Override ceny',
        href: '/admin/override-ceny',
        desc: 'Aktualizacja cen wykorzystywanych w mapach technicznych.',
      },
      {
        title: 'Wiadomości z kontaktu',
        href: '/admin/kontakt',
        desc: 'Przegląd zgłoszeń, oznaczanie jako przeczytane/nowe.',
      },
      {
        title: 'Redakcja',
        href: '/admin/redakcja',
        desc: 'Tworzenie i edycja artykułów oraz treści redakcyjnych.',
      },
      {
        title: 'Media',
        href: '/admin/redakcja/media',
        desc: 'Przesyłanie, zarządzanie i wstawianie zasobów medialnych.',
      },
      {
        title: 'Statystyki',
        href: '/admin/statystyki',
        desc: 'Przegląd platformy: użytkownicy, kursy, quizy, treści i aktywność.',
      },
      {
        title: 'News',
        href: '/admin/news',
        desc: 'Zarządzanie wiadomościami: przegląd, usuwanie, status wzbogacenia.',
      },
      {
        title: 'Challenge',
        href: '/admin/challenge',
        desc: 'Przegląd wyborów użytkowników, ranking i statystyki Challenge.',
      },
      {
        title: 'Kalendarz makro — 30 dni (EDU)',
        href: '/admin/kalendarz',
        desc: 'Zarządzanie kalendarzem makro: odświeżanie danych dla klientów jednym kliknięciem.',
      },
    ],
    [],
  );
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Panel admina</h1>
            <Link
              href="/redakcja"
              className="inline-flex items-center rounded-md bg-white text-slate-900 px-3 py-1.5 text-sm font-semibold hover:opacity-90"
            >
              Zobacz publicznie
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Wybierz sekcję. Kafelki poniżej zawierają krótkie opisy funkcji — kolejne narzędzia będziemy dodawać tu w
            przyszłości.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((t) =>
            t.href ? (
              <Link
                key={t.title}
                href={t.href}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="text-lg font-semibold mb-1">{t.title}</div>
                <div className="text-sm text-white/70">{t.desc}</div>
              </Link>
            ) : (
              <div
                key={t.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 opacity-70 cursor-not-allowed"
                title={t.desc}
              >
                <div className="text-lg font-semibold mb-1">{t.title}</div>
                <div className="text-sm text-white/70">{t.desc}</div>
              </div>
            ),
          )}
        </div>

        {/* End main content */}
      </div>
    </main>
  );
}


