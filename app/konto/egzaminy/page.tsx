// app/konto/egzaminy/page.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Saved = { at: string; score: number; total: number; answers: number[] };

export default function Page() {
  const [rows, setRows] = useState<{ key: string; slug: string; data: Saved }[]>([]);
  const [server, setServer] = useState<{ slug: string; score: number; total: number; at: string }[] | null>(null);

  useEffect(() => {
    try {
      const items: { key: string; slug: string; data: Saved }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (k.startsWith('exam:') && k.endsWith(':latest')) {
          const slug = k.split(':')[1];
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const data = JSON.parse(raw) as Saved;
          items.push({ key: k, slug, data });
        }
      }
      items.sort((a, b) => (a.data.at < b.data.at ? 1 : -1));
      setRows(items);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/progress/summary', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.ok && json?.summary?.recentQuizResults) {
          setServer(json.summary.recentQuizResults as any);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Wyniki egzaminów</h1>

      {(server?.length ?? 0) === 0 && rows.length === 0 ? (
        <p className="text-slate-300">Brak zapisanych wyników — zrób test demo lub PRO.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left">
            <thead className="text-slate-300">
              <tr className="bg-white/5">
                <th className="px-4 py-2">Egzamin</th>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Wynik</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(server ?? []).map((r, idx) => (
                <tr key={`srv-${idx}`} className="border-t border-white/10">
                  <td className="px-4 py-2 uppercase">{r.slug}</td>
                  <td className="px-4 py-2">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.score}/{r.total}</td>
                  <td className="px-4 py-2"></td>
                </tr>
              ))}
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-white/10">
                  <td className="px-4 py-2 uppercase">{r.slug}</td>
                  <td className="px-4 py-2">{new Date(r.data.at).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.data.score}/{r.data.total}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <Link className="underline" href={`/kursy/egzaminy/${r.slug}/egzamin`}>Powtórz</Link>
                      <Link
                        className="underline"
                        href={`/certyfikat/${r.slug}?score=${r.data.score}&total=${r.data.total}&at=${encodeURIComponent(r.data.at)}`}
                      >
                        Certyfikat
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/konto" className="underline text-sm">← Panel konta</Link>
    </main>
  );
}
