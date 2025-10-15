'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const KEY = 'course:podstawy:done';
const SLUG = 'lekcja-2';

export default function Page() {
  const [done, setDone] = useState(false);

  // znacznik ukończenia (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw).includes(SLUG));
    } catch {}
  }, []);

  const toggle = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const next = done ? arr.filter((s) => s !== SLUG) : Array.from(new Set([...arr, SLUG]));
      localStorage.setItem(KEY, JSON.stringify(next));
      setDone(!done);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Nagłówek */}
        <header className="mb-6">
          <p className="text-xs text-white/60">Moduł: Podstawy • Lekcja 2</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1">Pipsy, punkty i loty — prosto i na przykładach</h1>
          <p className="text-white/70 mt-2">
            Zrozumiesz czym są pipsy i punkty, jak czytać wielkość pozycji (loty) oraz jak policzyć przybliżony zysk/stratę
            bez skomplikowanych wzorów.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={toggle}
              className={`px-4 py-2 rounded-lg font-semibold ${
                done ? 'bg-green-400 text-slate-900 hover:opacity-90' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={done ? 'Oznacz jako nieukończoną' : 'Oznacz jako ukończoną'}
            >
              {done ? '✓ Ukończono' : 'Oznacz jako ukończoną'}
            </button>
            <Link href="/kursy/podstawy" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
              ← Spis lekcji
            </Link>
          </div>
        </header>

        {/* Definicje (prosto) */}
        <section className="prose prose-invert prose-slate max-w-none">
          <h2>1) Krótkie definicje</h2>
          <ul>
            <li>
              <strong>Pip</strong> — standardowy, „książkowy” krok ceny.
              <br />
              • Na parach typu <code>EURUSD</code> to <code>0.0001</code>.
              <br />• Na parach z jenem (<code>USDJPY</code>) to <code>0.01</code>.
            </li>
            <li>
              <strong>Punkt</strong> — najmniejsza jednostka pokazywana przez brokera (np. <code>0.00001</code>). Na{' '}
              <code>EURUSD</code> 10 punktów = 1 pip.
            </li>
            <li>
              <strong>Lot</strong> — „rozmiar” transakcji. Zwykle:
              <br />• <code>1.00</code> lot = <code>100&nbsp;000</code> jednostek waluty bazowej,
              <br />• <code>0.10</code> = mini lot, <code>0.01</code> = mikro lot.
            </li>
          </ul>
        </section>

        {/* Proste reguły */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">2) Dwie proste reguły do zapamiętania</h2>
          <div className="grid gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="font-semibold mb-1">Reguła A — pary z USD jako walutą kwotowaną (np. EURUSD, GBPUSD)</p>
              <p className="text-white/80">
                Gdy <em>wallet konta = USD</em>: przybliżenie jest bardzo proste —{' '}
                <strong>1 pip dla 1.00 lot ≈ 10 USD</strong>. Dla <code>0.10</code> lot ≈ <strong>1 USD</strong>/pip, dla{' '}
                <code>0.01</code> lot ≈ <strong>0.10 USD</strong>/pip.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="font-semibold mb-1">Reguła B — pary z JPY (np. USDJPY)</p>
              <p className="text-white/80">
                <strong>1 pip</strong> to tutaj <code>0.01</code>. Gdy <em>konto w USD</em>:{' '}
                <strong>1 pip dla 1.00 lot ≈ 1000 / cena</strong> (w USD).
                <br />
                Przykład: przy kursie <code>145.00</code> wychodzi około <strong>6.90 USD</strong> za pip dla 1 lota.
              </p>
            </div>
          </div>
        </section>

        {/* Przykłady krok po kroku */}
        <section className="prose prose-invert prose-slate max-w-none mt-10">
          <h2>3) Przykłady „krok po kroku”</h2>

          <h3>Przykład 1 — EURUSD, konto w USD</h3>
          <p>
            Kurs rośnie z <code>1.0750</code> do <code>1.0762</code>. To <strong>12 pipsów</strong>.
          </p>
          <ul>
            <li>
              <strong>Rozmiar pozycji:</strong> <code>0.20</code> lot.
            </li>
            <li>
              <strong>Wartość 1 pipsa:</strong> ~<strong>2 USD</strong> (bo 1.00 lot ≈ 10 USD/pip → 0.20 lot ≈ 2 USD/pip).
            </li>
            <li>
              <strong>Efekt ruchu:</strong> 12 pips × 2 USD = <strong>~24 USD</strong>.
            </li>
          </ul>

          <h3>Przykład 2 — USDJPY, konto w USD</h3>
          <p>
            Kurs: <code>145.00</code>. 1 pip = <code>0.01</code>. Dla <code>1.00</code> lot:
          </p>
          <ul>
            <li>
              <strong>Wartość 1 pipsa:</strong> <code>1000 / 145 ≈ 6.90 USD</code>.
            </li>
            <li>
              Dla <code>0.30</code> lot: ~<strong>2.07 USD</strong>/pip.
            </li>
            <li>
              Ruch o <strong>15 pipsów</strong> przy <code>0.30</code> lot to ok. 15 × 2.07 = <strong>~31 USD</strong>.
            </li>
          </ul>

          <h3>Przykład 3 — dobór wielkości pozycji do SL</h3>
          <p>
            Konto <strong>10&nbsp;000 USD</strong>, ryzyko <strong>1%</strong>, czyli akceptujesz stratę{' '}
            <strong>~100 USD</strong> na transakcję. Stop-Loss = <strong>20 pipsów</strong> na <code>EURUSD</code>.
          </p>
          <ul>
            <li>
              <strong>Wartość 1 pipsa dla 1.00 lot:</strong> ≈ 10 USD.
            </li>
            <li>
              <strong>Strata przy 1.00 lot i 20 pipsach:</strong> 20 × 10 = 200 USD (za dużo).
            </li>
            <li>
              <strong>Jakie loty?</strong> chcemy, aby 20 pipsów = ~100 USD. Czyli ~<code>0.50</code> lot (bo połowa z
              200 USD).
            </li>
          </ul>
        </section>

        {/* Mini-ściąga */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">4) Mini-ściąga (bez wzorów z matematyki)</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 text-white/80">
            <div>
              <p className="font-semibold text-white">Szybkie przybliżenia</p>
              <ul className="list-disc pl-5">
                <li>
                  <code>EURUSD/GBPUSD/AUDUSD</code> (konto USD): 1 pip / 1 lot ≈ <strong>10 USD</strong>.
                </li>
                <li>
                  <code>USDJPY</code> (konto USD): 1 pip / 1 lot ≈ <strong>1000 / cena</strong> USD.
                </li>
                <li>
                  <strong>Skalowanie po lotach:</strong> ×0.1 lot → ×0.1 wartości pipsa; ×0.01 lot → ×0.01 wartości.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Dobór pozycji do SL</p>
              <p>
                Najpierw ustal akceptowane ryzyko kwotowe (np. 1% konta). Jeśli SL jest większy — bierz <em>mniejszą</em>{' '}
                pozycję; jeśli SL mniejszy — możesz wziąć <em>większą</em>, ale ryzyko kwotowe zostaje stałe.
              </p>
            </div>

            <div className="text-xs text-white/60">
              Uwaga: gdy waluta konta jest inna niż waluta kwotowana pary, broker pokaże wynik w walucie kwotowanej i
              przeliczy go na walutę konta po bieżącym kursie. Do szybkiej oceny zwykle wystarczy powyższe przybliżenie.
            </div>
          </div>
        </section>

        {/* Ćwiczenia */}
        <section className="prose prose-invert prose-slate max-w-none mt-10">
          <h2>Ćwiczenia</h2>
          <ol>
            <li>
              Masz konto <strong>6&nbsp;000 USD</strong>, ryzyko <strong>1%</strong>, SL = <strong>18 pipsów</strong> na{' '}
              <code>EURUSD</code>. Ile lotów otworzysz? (podpowiedź: 1 pip/1 lot ≈ 10 USD)
            </li>
            <li>
              <code>USDJPY = 145.80</code>, konto USD. Oszacuj wartość 1 pipsa dla <strong>1.00</strong> lota i dla{' '}
              <strong>0.25</strong> lota. Co się stanie, gdy kurs wzrośnie do <strong>150.00</strong>?
            </li>
            <li>
              Spread na <code>EURUSD</code> = <strong>0.9 pipsa</strong>. Ile to kosztuje na wejściu dla{' '}
              <strong>0.30</strong> lota? Jak to wpływa na R:R przy SL = <strong>12 pipsów</strong>?
            </li>
          </ol>

          <h3>Checklist po lekcji</h3>
          <ul>
            <li>Wiem, czym są pip, punkt i lot.</li>
            <li>Umiem w głowie oszacować wartość pipsa dla EURUSD i USDJPY.</li>
            <li>Potrafię dobrać wielkość pozycji do SL i stałego ryzyka kwotowego.</li>
          </ul>
        </section>

        {/* Stopka nawigacji */}
        <footer className="mt-10 flex items-center justify-between">
          <Link href="/kursy/podstawy/lekcja-1" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            ← Poprzednia
          </Link>
          <Link
            href="/kursy/podstawy/lekcja-3"
            className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90"
          >
            Następna →
          </Link>
        </footer>
      </article>
    </main>
  );
}
