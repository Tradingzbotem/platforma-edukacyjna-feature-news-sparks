'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/* ─────────────────────────────────────────────────────────────
   Typy zgodne z /api/news/summarize (uprościmy do minimum)
   ───────────────────────────────────────────────────────────── */
type NewsItem = {
  title: string;
  summary: string;
  detail?: string;
  instruments: string[];
  timestamp_iso: string;
  source?: string;
  link?: string;
};

type Mode = 'brief' | 'sentiment' | 'explain' | 'quiz' | 'intraday' | undefined;
type Range = '24h' | '48h' | '72h' | undefined;

/* ─────────────────────────────────────────────────────────────
   Pomocnicze: praca z query params
   ───────────────────────────────────────────────────────────── */
function useModeRange(): {
  mode: Mode;
  range: Range;
  set: (patch: Partial<{ mode: Mode; range: Range }>) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const mode = (sp.get('mode') as Mode) ?? undefined;
  const range = (sp.get('range') as Range) ?? '24h';

  function set(patch: Partial<{ mode: Mode; range: Range }>) {
    const params = new URLSearchParams(sp.toString());
    if (patch.mode !== undefined) {
      if (patch.mode) params.set('mode', patch.mode);
      else params.delete('mode');
    }
    if (patch.range !== undefined) {
      if (patch.range) params.set('range', patch.range);
      else params.delete('range');
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return { mode, range, set };
}

/* ─────────────────────────────────────────────────────────────
   Prawa kolumna: proste pobranie newsów
   ───────────────────────────────────────────────────────────── */
function useNews(range: Range) {
  const [data, setData] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Jeśli API wspiera ?range, zostawiamy parametr; w przeciwnym razie backend go zignoruje.
        const res = await fetch(`/api/news/summarize${range ? `?range=${range}` : ''}`, {
          signal: ac.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items: NewsItem[] = Array.isArray(json) ? json : json?.items ?? [];
        setData(items.slice(0, 40)); // limit dla czytelności
      } catch (e: any) {
        console.error('[AI Hub] news fetch error', e);
        setError('Nie udało się pobrać newsów. Pokazuję tryb offline.');
        // Tryb offline (delikatny mock, aby UI nie było puste)
        setData([
          {
            title: 'Tryb offline: przykładowy news',
            summary:
              'To przykładowy element używany, gdy API news jest niedostępne. W kolejnym kroku podepniemy realny kontekst.',
            instruments: ['US100'],
            timestamp_iso: new Date().toISOString(),
            source: 'internal',
            link: '#',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => ac.abort();
  }, [range]);

  return { data, error, loading };
}

/* ─────────────────────────────────────────────────────────────
   UI elementy pomocnicze
   ───────────────────────────────────────────────────────────── */
const Pill: React.FC<React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    aria-pressed={!!active}
    className={`px-3 py-1.5 rounded-full border text-sm transition focus:outline-none focus:ring-2 focus:ring-white/30
      ${active ? 'border-white/30 bg-white/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
    `}
  >
    {children}
  </button>
);

const Card: React.FC<React.PropsWithChildren<{ title?: string; right?: React.ReactNode }>> = ({
  title,
  right,
  children,
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-[0_0_50px_-25px_rgba(0,0,0,0.6)]">
    {(title || right) && (
      <div className="mb-3 flex items-center justify-between">
        {title ? <h3 className="text-base sm:text-lg font-semibold">{title}</h3> : <div />}
        {right}
      </div>
    )}
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Strona /ai (klient)
   ───────────────────────────────────────────────────────────── */
export default function AiClient() {
  const { mode, range, set } = useModeRange();
  const { data: news, error, loading } = useNews(range);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  type ChatMsg = { role: 'user' | 'assistant'; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Cześć! To panel rozmowy AI. Zaznacz newsy po prawej i kliknij „Użyj w czacie”, albo zadaj pytanie. (Edukacyjnie — bez rekomendacji inwestycyjnych.)',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Zmiana zakresu resetuje wybór, bo lista newsów się zmienia
    setSelected(new Set());
  }, [range]);

  function toggleSelect(index: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function buildContextFromSelection(): string {
    const items = (news ?? []).filter((_, i) => selected.has(i));
    if (!items.length) return '';
    const bullets = items.slice(0, 10).map((n) => `- ${n.title}${n.summary ? ` — ${n.summary}` : ''}`);
    const header = mode === 'brief'
      ? `Przygotuj zwięzły brief (${range ?? '24h'}) na podstawie wybranych newsów.`
      : mode === 'sentiment'
      ? `Oceń sentyment i potencjalne ryzyka (${range ?? '24h'}) dla poniższych newsów.`
      : mode === 'intraday'
      ? `Zaproponuj scenariusz intraday (${range ?? '24h'}) w oparciu o wybrane newsy.`
      : mode === 'quiz'
      ? `Ułóż krótki quiz (3-5 pytań) na podstawie poniższych newsów.`
      : mode === 'explain'
      ? `Wyjaśnij ogólne pojęcia pojawiające się w tych newsach (zwięźle).`
      : `Zreferuj kluczowe informacje z poniższego kontekstu (${range ?? '24h'}).`;
    return `${header}\n\nKontekst:\n${bullets.join('\n')}`;
  }

  async function sendChat(question: string) {
    if (!question.trim() || chatBusy) return;
    setChatBusy(true);
    setChatMessages(prev => [...prev, { role: 'user', content: question.trim() }]);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const answer = typeof data?.answer === 'string' && data.answer.trim()
          ? data.answer.trim()
          : 'Przepraszam, nie mam gotowej odpowiedzi.';
        setChatMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      } else {
        const msg = data?.error ? String(data.error) : `Błąd serwera (HTTP ${res.status}).`;
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Nie udało się pobrać odpowiedzi: ${msg}` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Błąd połączenia. Spróbuj ponownie.' }]);
    } finally {
      setChatBusy(false);
    }
  }

  function submitCurrentInput() {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput('');
    void sendChat(q);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCurrentInput();
  }

  const modeLabel = useMemo(() => {
    switch (mode) {
      case 'brief':
        return 'Brief 24/48/72h';
      case 'sentiment':
        return 'Sentyment & ryzyko';
      case 'explain':
        return 'Wyjaśnij pojęcie';
      case 'quiz':
        return 'Quiz z newsów';
      case 'intraday':
        return 'Scenariusz intraday';
      default:
        return 'Wybierz tryb rozmowy';
    }
  }, [mode]);

  return (
    <div className="relative">
      {/* subtle radial gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(59,130,246,0.08),rgba(2,6,23,0))]" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex items-center gap-3 text-sm text-white/60">
        <Link href="/" className="hover:text-white/90">&larr; Strona główna</Link>
        <span>/</span>
        <span>AI</span>
        <div className="ml-auto text-xs sm:text-sm">
          <span className="rounded-md border border-white/10 px-2 py-1">Materiał edukacyjny — to nie jest rekomendacja inwestycyjna.</span>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-4">AI Hub</h1>
      <p className="text-white/60 mb-6">
        Wybierz tryb po lewej, zaznacz newsy po prawej — i rozmawiaj w środku. To wersja szkieletowa (Krok 1).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Lewa kolumna */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 self-start">
          <Card title="Tryby rozmowy">
            <div className="flex flex-wrap gap-2">
              <Pill active={mode === 'brief'} onClick={() => set({ mode: 'brief' })}>Brief 24/48/72h</Pill>
              <Pill active={mode === 'sentiment'} onClick={() => set({ mode: 'sentiment' })}>Sentyment & ryzyko</Pill>
              <Pill active={mode === 'explain'} onClick={() => set({ mode: 'explain' })}>Wyjaśnij pojęcie</Pill>
              <Pill active={mode === 'quiz'} onClick={() => set({ mode: 'quiz' })}>Quiz z newsów</Pill>
              <Pill active={mode === 'intraday'} onClick={() => set({ mode: 'intraday' })}>Scenariusz intraday</Pill>
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/60 mb-2">Zakres czasowy:</div>
              <div className="flex gap-2">
                <Pill active={range === '24h'} onClick={() => set({ range: '24h' })}>24h</Pill>
                <Pill active={range === '48h'} onClick={() => set({ range: '48h' })}>48h</Pill>
                <Pill active={range === '72h'} onClick={() => set({ range: '72h' })}>72h</Pill>
              </div>
            </div>
          </Card>

          <Card title="Nawigacja">
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/konto" className="underline underline-offset-2 hover:text-white/90">← Wróć do konta</Link>
              <Link href="/news" className="underline underline-offset-2 hover:text-white/90">Przejdź do News</Link>
            </div>
          </Card>
        </aside>

        {/* Środek */}
        <main className="lg:col-span-6">
          <Card title={modeLabel}>
            <div className="h-[520px] sm:h-[620px] rounded-xl border border-white/10 bg-black/20 flex flex-col">
              {/* Historia czatu */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={[
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      m.role === 'user' ? 'bg-white text-slate-900' : 'bg-white/10 text-white border border-white/10',
                    ].join(' ')}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2 text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span className="relative inline-block h-2 w-2">
                          <span className="absolute inset-0 rounded-full bg-white/70 animate-ping" />
                          <span className="relative block h-2 w-2 rounded-full bg-white/80" />
                        </span>
                        Piszę…
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel wejściowy */}
              <div className="border-t border-white/10 p-3">
                <div className="text-[11px] text-white/50 mb-2">
                  Edukacja — brak rekomendacji inwestycyjnych. URL params: <code className="px-1 py-0.5 rounded bg-white/5 border border-white/10">mode={mode ?? '-'}</code>{' '}<code className="px-1 py-0.5 rounded bg-white/5 border border-white/10">range={range ?? '-'}</code>
                </div>
                <form onSubmit={onSubmit} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={chatBusy ? 'AI pisze…' : 'Zadaj pytanie lub wklej kontekst z newsów…'}
                    rows={1}
                    className="min-h-[42px] max-h-28 flex-1 resize-y rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!chatBusy) submitCurrentInput();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={chatBusy || !chatInput.trim()}
                    className="shrink-0 rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
                  >
                    Wyślij
                  </button>
                </form>
              </div>
            </div>
          </Card>
        </main>

        {/* Prawa kolumna */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 self-start">
          <Card
            title="Kontekst z News"
            right={
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 hidden sm:inline">{range ?? '24h'}</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                  {selected.size}/{(news ?? []).length || 0}
                </span>
              </div>
            }
          >
            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-white/10 p-2">
                    <div className="h-3 w-5/6 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-full bg-white/10 rounded mb-1" />
                    <div className="h-2 w-4/5 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            )}
            {error && <div className="text-sm text-rose-300">{error}</div>}

            <div className="mt-2 max-h-[560px] overflow-auto pr-1 space-y-2">
              {(news ?? []).map((n, i) => (
                <label key={i} className="flex items-start gap-2 rounded-lg border border-white/10 p-2 hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.has(i)}
                    onChange={() => toggleSelect(i)}
                  />
                  <div className="text-sm">
                    <div className="font-medium leading-snug">{n.title}</div>
                    <div className="text-white/60 text-xs line-clamp-2">{n.summary}</div>
                    <div className="text-white/40 text-[11px] mt-1">
                      {n.source ? `${n.source} • ` : ''}{new Date(n.timestamp_iso).toLocaleString()}
                    </div>
                  </div>
                </label>
              ))}
              {!loading && !error && (news ?? []).length === 0 && (
                <div className="text-sm text-white/60">Brak newsów dla zakresu {range ?? '24h'}.</div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  const prompt = buildContextFromSelection();
                  if (!prompt) return;
                  setChatInput(prompt);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                disabled={selected.size === 0}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${selected.size === 0 ? 'border-white/15 bg-white/5 text-white/50 cursor-not-allowed' : 'border-white/20 bg-white/10 hover:bg-white/15'}`}
                title={selected.size === 0 ? 'Zaznacz newsy, by użyć w czacie' : 'Wklej kontekst do pola czatu'}
              >
                Użyj w czacie
              </button>
              <button
                onClick={clearSelection}
                disabled={selected.size === 0}
                className={`rounded-lg border px-3 py-2 text-sm ${selected.size === 0 ? 'border-white/15 bg-white/5 text-white/50 cursor-not-allowed' : 'border-white/20 bg-white/10 hover:bg-white/15'}`}
                title={selected.size === 0 ? 'Brak zaznaczonych pozycji' : 'Wyczyść zaznaczenie'}
              >
                Wyczyść
              </button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
    </div>
  );
}


