// app/certyfikat/[exam]/page.tsx
'use client';

import { useSearchParams, useParams } from 'next/navigation';

export default function Page() {
  const params = useParams<{ exam: string }>();
  const q = useSearchParams();
  const score = q.get('score');
  const total = q.get('total');
  const at = q.get('at');

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8 print:p-0">
      <div className="rounded-2xl border border-white/20 bg-white text-slate-900 p-10 print:rounded-none print:border-0">
        <h1 className="text-3xl font-bold text-center">Zaświadczenie ukończenia testu</h1>
        <p className="mt-6 text-lg text-center">
          Potwierdzamy ukończenie egzaminu:
          <br/><strong>{params.exam.toString().toUpperCase()}</strong>
        </p>
        <p className="mt-4 text-center">
          Wynik: <strong>{score}/{total}</strong> • Data: {at ? new Date(at).toLocaleString() : '—'}
        </p>
        <p className="mt-10 text-center text-sm">
          Dokument wygenerowany automatycznie. Aby zapisać jako PDF, wybierz „Drukuj” → „Zapisz jako PDF”.
        </p>
      </div>

      <div className="mt-4 flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-slate-200 px-4 py-2 text-slate-900 font-semibold hover:bg-slate-300"
        >
          Drukuj / Zapisz jako PDF
        </button>
      </div>
    </main>
  );
}
