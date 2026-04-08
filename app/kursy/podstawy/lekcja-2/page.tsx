'use client';

import { useEffect, useState } from 'react';
import LessonVisitTracker from '@/components/LessonVisitTracker';
import {
  PodstawyCallout,
  PodstawyChecklist,
  PodstawyExercise,
  PodstawySection,
} from '@/components/podstawy/content';
import PodstawyLessonShell, {
  PodstawyLessonHeaderActions,
} from '@/components/podstawy/PodstawyLessonShell';
import { useLessonProgressSession } from '@/app/contexts/LessonProgressSessionContext';
import { readPodstawyDoneSlugSet, writePodstawyDoneSlugArray } from '@/lib/lessonProgressStorage';
import { pushPodstawyLessonProgress } from '@/lib/podstawyLessonProgressSync';

const SLUG = 'lekcja-2';

export default function Page() {
  const { userId, sessionReady } = useLessonProgressSession();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!sessionReady) return;
    try {
      setDone(readPodstawyDoneSlugSet(localStorage, userId).has(SLUG));
    } catch {}
  }, [userId, sessionReady]);

  const toggle = () => {
    if (!sessionReady) return;
    try {
      const arr = Array.from(readPodstawyDoneSlugSet(localStorage, userId));
      const next = done ? arr.filter((s) => s !== SLUG) : Array.from(new Set([...arr, SLUG]));
      writePodstawyDoneSlugArray(localStorage, userId, next);
      setDone(!done);
      pushPodstawyLessonProgress(SLUG, !done, userId);
    } catch {}
  };

  return (
    <PodstawyLessonShell
      lessonNumber={2}
      title="Pipsy, punkty i loty — prosto i na przykładach"
      lead="Zrozumiesz czym są pipsy i punkty, jak czytać wielkość pozycji (loty) oraz jak policzyć przybliżony zysk/stratę bez skomplikowanych wzorów."
      prevHref="/kursy/podstawy/lekcja-1"
      nextHref="/kursy/podstawy/lekcja-3"
      tracker={<LessonVisitTracker course="podstawy" lessonId={SLUG} />}
      actions={<PodstawyLessonHeaderActions done={done} onToggle={toggle} />}
    >
      <PodstawySection title="1) Krótkie definicje">
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
      </PodstawySection>

      <PodstawySection title="2) Dwie proste reguły do zapamiętania" prose={false}>
        <div className="grid gap-4">
          <PodstawyCallout title="Reguła A — pary z USD jako walutą kwotowaną (np. EURUSD, GBPUSD)">
            <p>
              Gdy <em>wallet konta = USD</em>: przybliżenie jest bardzo proste —{' '}
              <strong>1 pip dla 1.00 lot ≈ 10 USD</strong>. Dla <code>0.10</code> lot ≈ <strong>1 USD</strong>/pip, dla{' '}
              <code>0.01</code> lot ≈ <strong>0.10 USD</strong>/pip.
            </p>
          </PodstawyCallout>
          <PodstawyCallout title="Reguła B — pary z JPY (np. USDJPY)">
            <p>
              <strong>1 pip</strong> to tutaj <code>0.01</code>. Gdy <em>konto w USD</em>:{' '}
              <strong>1 pip dla 1.00 lot ≈ 1000 / cena</strong> (w USD).
              <br />
              Przykład: przy kursie <code>145.00</code> wychodzi około <strong>6.90 USD</strong> za pip dla 1 lota.
            </p>
          </PodstawyCallout>
        </div>
      </PodstawySection>

      <PodstawySection title="3) Przykłady „krok po kroku”">
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
      </PodstawySection>

      <PodstawySection title="4) Mini-ściąga (bez wzorów z matematyki)" prose={false}>
        <PodstawyCallout variant="accent" eyebrow="Mini-ściąga">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-white">Szybkie przybliżenia</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
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
              <p className="mt-1">
                Najpierw ustal akceptowane ryzyko kwotowe (np. 1% konta). Jeśli SL jest większy — bierz <em>mniejszą</em>{' '}
                pozycję; jeśli SL mniejszy — możesz wziąć <em>większą</em>, ale ryzyko kwotowe zostaje stałe.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Uwaga: gdy waluta konta jest inna niż waluta kwotowana pary, broker pokaże wynik w walucie kwotowanej i
              przeliczy go na walutę konta po bieżącym kursie. Do szybkiej oceny zwykle wystarczy powyższe przybliżenie.
            </p>
          </div>
        </PodstawyCallout>
      </PodstawySection>

      <PodstawyExercise>
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
      </PodstawyExercise>

      <PodstawyChecklist>
        <ul>
          <li>Wiem, czym są pip, punkt i lot.</li>
          <li>Umiem w głowie oszacować wartość pipsa dla EURUSD i USDJPY.</li>
          <li>Potrafię dobrać wielkość pozycji do SL i stałego ryzyka kwotowego.</li>
        </ul>
      </PodstawyChecklist>
    </PodstawyLessonShell>
  );
}
