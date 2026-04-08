'use client';

import { useState } from 'react';

import StartExamButton from '@/app/konto/certyfikat/egzamin/StartExamButton';
import { CERT_EXAM_SELECTABLE_TRACKS, CERT_EXAM_V1_TIME_LIMIT_MINUTES } from '@/lib/certification-exam/constants';
import { CERTIFICATION_TRACK_LABELS, CERTIFICATION_TRACK_LABELS_PL } from '@/lib/certifications/constants';
import type { CertificationTrack } from '@/lib/certifications/types';

const pillIdle =
  'rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-white/18 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]';
const pillActive =
  'rounded-xl border border-amber-500/45 bg-amber-500/10 px-4 py-3.5 text-left ring-1 ring-amber-500/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]';

type Props = {
  dbOk: boolean;
};

export default function ExamEntryClient({ dbOk }: Props) {
  const [track, setTrack] = useState<CertificationTrack>(CERT_EXAM_SELECTABLE_TRACKS[0]);
  const trackLabelPl = CERTIFICATION_TRACK_LABELS_PL[track];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-2xl border border-white/12 bg-white/[0.025] px-5 py-7 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Ścieżka certyfikacji</p>
        <p className="mt-2 text-sm leading-relaxed text-white/62">
          Wybierz track zgodny z programem, który chcesz potwierdzić egzaminem. Pytania i zapis wyniku są przypisane do
          wybranej ścieżki.
        </p>
        <div
          className="mt-6 grid gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Ścieżka egzaminu certyfikacyjnego"
        >
          {CERT_EXAM_SELECTABLE_TRACKS.map((t) => {
            const selected = t === track;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTrack(t)}
                className={selected ? pillActive : pillIdle}
              >
                <span className="block text-sm font-semibold text-white/92">{CERTIFICATION_TRACK_LABELS[t]}</span>
                <span className="mt-1 block text-[11px] leading-snug text-white/45">{CERTIFICATION_TRACK_LABELS_PL[t]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-b from-amber-500/[0.12] via-white/[0.04] to-white/[0.02] px-6 py-8 shadow-[0_0_56px_-18px_rgba(245,158,11,0.35)] sm:px-10 sm:py-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Na starcie</p>
          <ul className="mt-5 space-y-3 text-sm text-white/78">
            <li>
              <span className="text-white/48">Ścieżka: </span>
              {trackLabelPl}
            </li>
            <li>
              <span className="text-white/48">Limit czasu: </span>ok. {CERT_EXAM_V1_TIME_LIMIT_MINUTES} min (informacja na
              tym etapie)
            </li>
            <li>
              <span className="text-white/48">Forma: </span>pytania zamknięte (jednokrotny wybór odpowiedzi)
            </li>
          </ul>

          <div className="mt-8 border-t border-amber-500/20 pt-8">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <p className="text-sm leading-relaxed text-white/68">
                Rozpoczęcie egzaminu uruchamia sesję przypisaną do Twojego konta.
              </p>
              <div className="mt-7 flex w-full flex-col items-center">
                <StartExamButton
                  track={track}
                  disabled={!dbOk}
                  disabledReason="Baza danych jest niedostępna — egzamin nie może zostać uruchomiony w tym środowisku."
                />
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/48">Po rozpoczęciu nie możesz edytować odpowiedzi.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
