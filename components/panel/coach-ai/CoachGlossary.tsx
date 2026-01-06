'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type GlossaryItem = {
  id: string;
  term: string;
  def: string;
  cat: 'kalendarz' | 'techniczna';
};

const DATA: GlossaryItem[] = [
  // Kalendarz ekonomiczny
  { id: 'cpi', term: 'CPI', def: 'Indeks cen towarów i usług konsumpcyjnych – miara inflacji headline.', cat: 'kalendarz' },
  { id: 'corepce', term: 'Core PCE', def: 'Inflacja bazowa wg PCE – preferowana przez Fed miara presji cenowej.', cat: 'kalendarz' },
  { id: 'nfp', term: 'NFP', def: 'Zmiana zatrudnienia poza rolnictwem – kluczowy raport rynku pracy USA.', cat: 'kalendarz' },
  { id: 'fomc', term: 'FOMC Decision', def: 'Decyzja Komitetu Otwartego Rynku (stopy, komunikat, projekcje).', cat: 'kalendarz' },
  { id: 'minutes', term: 'FOMC Minutes', def: 'Protokół z posiedzenia FOMC – wskazówki dot. tonu i debat.', cat: 'kalendarz' },
  { id: 'ism', term: 'ISM', def: 'Badania koniunktury przemysłu/usług – new orders, employment, prices.', cat: 'kalendarz' },
  { id: 'retail', term: 'Retail Sales', def: 'Sprzedaż detaliczna – kondycja konsumenta, wpływ na PKB.', cat: 'kalendarz' },
  { id: 'gdp', term: 'GDP', def: 'Produkt krajowy brutto – wzrost gospodarczy (wstępny, zrewidowany).', cat: 'kalendarz' },
  // Analiza techniczna
  { id: 'atr', term: 'ATR', def: 'Average True Range – miara zmienności; pomaga ocenić tło ryzyka.', cat: 'techniczna' },
  { id: 'rsi', term: 'RSI', def: 'Relative Strength Index – oscylator impetu (wyprzedanie/wykupienie).', cat: 'techniczna' },
  { id: 'support', term: 'Wsparcie/Opór', def: 'Strefy, gdzie popyt/podaż historycznie zatrzymywały cenę.', cat: 'techniczna' },
  { id: 'trend', term: 'Trend', def: 'Kierunek dominujących ruchów cen (wyższe szczyty/dołki lub odwrotnie).', cat: 'techniczna' },
  { id: 'breakout', term: 'Wybicie', def: 'Ruch ponad opór/poniżej wsparcia z potwierdzeniem wolumenem.', cat: 'techniczna' },
  { id: 'pullback', term: 'Pullback', def: 'Korekcyjny powrót do przełamanej strefy/średniej w trendzie.', cat: 'techniczna' },
  { id: 'div', term: 'Divergencja', def: 'Rozjazd między ceną a wskaźnikiem/szerokością – sygnał ostrożności (EDU).', cat: 'techniczna' },
  { id: 'vol', term: 'Wolumen', def: 'Ilość obrotu – potwierdza siłę ruchu i wybicia (EDU).', cat: 'techniczna' },
];

export default function CoachGlossary({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'kalendarz' | 'techniczna'>('kalendarz');
  const [q, setQ] = useState('');
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const items = useMemo(() => {
    return DATA.filter((i) => i.cat === tab && (q.trim() ? matches(i, q) : true));
  }, [tab, q]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Słownik pojęć (EDU)"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white/90">Słownik pojęć (EDU)</div>
            <div className="text-[11px] text-white/60 mt-0.5">Kalendarz ekonomiczny i analiza techniczna</div>
          </div>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Zamknij słownik"
          >
            Zamknij
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-white/10 p-1 bg-white/5">
            <button
              type="button"
              onClick={() => setTab('kalendarz')}
              className={`px-3 py-1.5 text-xs rounded-md ${tab === 'kalendarz' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:bg-white/10'}`}
              aria-pressed={tab === 'kalendarz'}
            >
              Kalendarz
            </button>
            <button
              type="button"
              onClick={() => setTab('techniczna')}
              className={`px-3 py-1.5 text-xs rounded-md ${tab === 'techniczna' ? 'bg-white text-slate-900 font-semibold' : 'text-white/80 hover:bg-white/10'}`}
              aria-pressed={tab === 'techniczna'}
            >
              Techniczna
            </button>
          </div>
          <div className="flex-1" />
          <div className="w-[220px]">
            <label htmlFor="glossary-search" className="sr-only">Szukaj pojęcia</label>
            <input
              id="glossary-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Szukaj…"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((i) => (
            <div key={i.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white/90">{i.term}</div>
              <div className="mt-1 text-xs text-white/75">{i.def}</div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-white/60">Brak wyników.</div>
          )}
        </div>
        <div className="mt-3 text-[11px] text-white/55">
          EDU: definicje w celach edukacyjnych — brak rekomendacji i „sygnałów”.
        </div>
      </div>
    </div>
  );
}

function matches(i: GlossaryItem, q: string) {
  const s = `${i.term} ${i.def}`.toLowerCase();
  return s.includes(q.toLowerCase());
}


