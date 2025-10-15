'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

/* ──────────────────────────────────────────────────────────────
   KONFIG: tryb serwisowy / tylko-do-odczytu
   ────────────────────────────────────────────────────────────── */
const READ_ONLY = true; // ← przełącznik
const BANNER_TEXT =
  'Forum jest tymczasowo w trybie tylko-do-odczytu. Trwają prace modernizacyjne — wracamy niedługo.';

/* ──────────────────────────────────────────────────────────────
   Wrapper page → Suspense dla useSearchParams (Next 15)
   ────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl p-6 md:p-8">
          <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-6 text-white/70">
            Ładowanie forum…
          </div>
        </main>
      }
    >
      <ForumClient />
    </Suspense>
  );
}

/* ──────────────────────────────────────────────────────────────
   Typy i utils
   ────────────────────────────────────────────────────────────── */
type ID = string;
type Category =
  | 'Ogólne' | 'Strategie' | 'Psychologia' | 'Makro' | 'Analiza techniczna'
  | 'Dzienniki' | 'Forex' | 'CFD' | 'Krypto' | 'Zarządzanie ryzykiem' | 'Backtesty' | 'Offtopic';
type AllCats = 'Wszystkie' | Category;
type SortKey = 'aktywne' | 'najnowsze' | 'popularne';

type Author = { id: ID; name: string };
type Post = { id: ID; author: Author; body: string; createdAt: number; likes: number };
type Thread = {
  id: ID; category: Category; title: string; author: Author;
  createdAt: number; views: number; posts: Post[]; pinned?: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const relTime = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 6e4);
  if (m < 1) return 'przed chwilą';
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h temu`;
  const d = Math.floor(h / 24);
  return `${d} d temu`;
};
const initials = (name: string) => name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

/* ──────────────────────────────────────────────────────────────
   Dane startowe (symulacja)
   ────────────────────────────────────────────────────────────── */
const YOU: Author = { id: 'you', name: 'Ty' };

/** ręczny zestaw highlightów (kilka znanych z Twojej wersji) */
const baseThreads: Thread[] = [
  {
    id: uid(), category: 'Ogólne', title: 'Jak zacząć naukę bez chaosu?',
    author: { id: uid(), name: 'Ala' }, createdAt: Date.now() - 1000 * 60 * 60 * 5, views: 324,
    posts: [
      { id: uid(), author: { id: uid(), name: 'Ala' }, body: 'Macie sprawdzony plan nauki? Ile czasu dziennie i jak łączyć z praktyką na demo?', createdAt: Date.now() - 1000 * 60 * 60 * 5, likes: 8 },
      { id: uid(), author: { id: uid(), name: 'Bartek' }, body: 'U mnie działa 45–60 min/dzień: podstawy → ryzyko → price action. Co tydzień test.', createdAt: Date.now() - 1000 * 60 * 60 * 4, likes: 11 },
    ],
  },
  {
    id: uid(), category: 'Strategie', title: 'DAX: wybicia range (M5) – Wasze doświadczenia',
    author: { id: uid(), name: 'Celina' }, createdAt: Date.now() - 1000 * 60 * 60 * 30, views: 1640, pinned: true,
    posts: [
      { id: uid(), author: { id: uid(), name: 'Celina' }, body: 'Wejścia 8:00–9:00 CET. Filtr ATR + SL za range. Uważaj na spread.', createdAt: Date.now() - 1000 * 60 * 60 * 30, likes: 15 },
      { id: uid(), author: { id: uid(), name: 'Darek' }, body: 'Czekam na retest i świecę impulsu. Fake breakouts częste.', createdAt: Date.now() - 1000 * 60 * 60 * 28, likes: 9 },
    ],
  },
  {
    id: uid(), category: 'Psychologia', title: 'Jak wracać po serii strat?',
    author: { id: uid(), name: 'Filip' }, createdAt: Date.now() - 1000 * 60 * 60 * 12, views: 205,
    posts: [{ id: uid(), author: { id: uid(), name: 'Filip' }, body: '3 straty z rzędu i zaczynam kombinować. Macie reset/rytuały?', createdAt: Date.now() - 1000 * 60 * 60 * 12, likes: 13 }],
  },
  {
    id: uid(), category: 'Makro', title: 'Stopy w USA – scenariusze na Q4',
    author: { id: uid(), name: 'MakroMateusz' }, createdAt: Date.now() - 1000 * 60 * 60 * 24, views: 480,
    posts: [{ id: uid(), author: { id: uid(), name: 'MakroMateusz' }, body: 'Zestawienie CPI, PCE i projekcji Fed. Jakie scenariusze dla USD?', createdAt: Date.now() - 1000 * 60 * 60 * 24, likes: 21 }],
  },
  {
    id: uid(), category: 'Analiza techniczna', title: 'US500 – strefa podaży 5600–5650? Co dalej po NFP',
    author: { id: uid(), name: 'Indeksarz' }, createdAt: Date.now() - 1000 * 60 * 50, views: 3200,
    posts: [{ id: uid(), author: { id: uid(), name: 'Indeksarz' }, body: 'Strefy D1/H4, na M15 szukam FAK/SFP. Kto gra podobnie?', createdAt: Date.now() - 1000 * 60 * 50, likes: 33 }],
  },
  {
    id: uid(), category: 'Forex', title: 'EURUSD – wartość pipsa przy różnych walutach konta',
    author: { id: uid(), name: 'Kasia' }, createdAt: Date.now() - 1000 * 60 * 90, views: 220,
    posts: [{ id: uid(), author: { id: uid(), name: 'Kasia' }, body: 'Macie regułę pamięciową dla 0.1 lot na różnych walutach konta?', createdAt: Date.now() - 1000 * 60 * 88, likes: 5 }],
  },
  {
    id: uid(), category: 'Backtesty', title: 'OOS vs Walk-Forward – jak dzielić dane?',
    author: { id: uid(), name: 'Tester' }, createdAt: Date.now() - 1000 * 60 * 60 * 60, views: 130,
    posts: [{ id: uid(), author: { id: uid(), name: 'Tester' }, body: 'Jakie macie praktyki przy WF/OOS?', createdAt: Date.now() - 1000 * 60 * 60 * 60, likes: 12 }],
  },
];

/** generator: dorzuca sporo dodatkowych wątków w różnych kategoriach */
const seedThreads: Thread[] = (() => {
  const extra = makeExtraSeeds(); // ~30+ wątków
  // przypinamy nasze „highlighty” na wierzchu
  return [...baseThreads, ...extra];
})();

/* ──────────────────────────────────────────────────────────────
   Małe komponenty UI
   ────────────────────────────────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6 ${className}`}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><div className="mb-1 text-sm text-slate-300">{label}</div>{children}</label>);
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30 ${className || ''}`} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30 ${className || ''}`} />;
}
function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 grid place-items-center text-xs">
      {initials(name)}
    </div>
  );
}
function MaintenanceBanner() {
  if (!READ_ONLY) return null;
  return (
    <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 px-4 py-3 text-sm">
      🔧 {BANNER_TEXT}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Wiersz listy wątków
   ────────────────────────────────────────────────────────────── */
function ThreadRow({ t, onOpen }: { t: Thread; onOpen: (t: Thread) => void }) {
  const replies = t.posts.length - 1;
  const likes = t.posts.reduce((a, p) => a + p.likes, 0);
  const last = t.posts[t.posts.length - 1]?.createdAt ?? t.createdAt;
  const isHot = t.views >= 1000 || likes >= 20;
  const isNew = Date.now() - t.createdAt < 1000 * 60 * 60 * 24;

  return (
    <button onClick={() => onOpen(t)} className="w-full text-left rounded-xl p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition">
      <div className="flex items-start gap-4">
        <Avatar name={t.author.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {t.pinned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-300/20 text-yellow-200 border border-yellow-300/30">Przypięty</span>}
            {isHot && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/30">Hot</span>}
            {isNew && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">Nowy</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">{t.category}</span>
            {READ_ONLY && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">tylko odczyt</span>}
          </div>
          <div className="mt-1 font-semibold truncate">{t.title}</div>
          <div className="mt-1 text-xs text-white/60">{t.author.name} • założony {relTime(t.createdAt)} • ostatnia aktywność {relTime(last)}</div>
        </div>
        <div className="shrink-0 text-right text-sm text-white/80">
          <div>👁 {t.views.toLocaleString('pl-PL')}</div>
          <div>💬 {replies < 0 ? 0 : replies}</div>
          <div>❤️ {likes}</div>
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Główna logika forum (Client Component)
   ────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'forumThreadsV1';

function ForumClient() {
  const router = useRouter();
  const search = useSearchParams();

  // 1) Ładowanie z localStorage (jeśli jest), inaczej z seeda
  const [threads, setThreads] = useState<Thread[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as Thread[];
      } catch {}
    }
    return seedThreads;
  });

  const [view, setView] = useState<'list' | 'thread' | 'new'>('list');
  const [active, setActive] = useState<Thread | null>(null);

  // filtry/sort
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<AllCats>('Wszystkie');
  const [sort, setSort] = useState<SortKey>('aktywne');

  // persist (zostaje, ale i tak nic nie zmieniamy w READ_ONLY)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(threads)); } catch {}
  }, [threads]);

  // deep-link ?t=<id>
  const tid = search.get('t');
  useEffect(() => {
    if (!tid) { if (view === 'thread') setView('list'); return; }
    const found = threads.find(t => t.id === tid);
    if (!found) return;
    if (active?.id === tid && view === 'thread') return;
    setThreads(prev => prev.map(x => x.id === tid ? { ...x, views: x.views + 1 } : x));
    setActive({ ...found, views: found.views + 1 });
    setView('thread');
  }, [tid, threads, view, active?.id]);

  const stats = useMemo(() => {
    const totalPosts = threads.reduce((acc, t) => acc + t.posts.length, 0);
    const today = threads.filter(t => (Date.now() - t.createdAt) < 24 * 3600 * 1000).length;
    return { threads: threads.length, posts: totalPosts, today };
  }, [threads]);

  const categoryList = useMemo(() => {
    const counts = new Map<Category, number>();
    threads.forEach(t => counts.set(t.category, (counts.get(t.category) || 0) + 1));
    const all: Array<{ key: AllCats; label: string; count: number }> = [
      { key: 'Wszystkie', label: 'Wszystkie', count: threads.length },
      ...Array.from(counts.entries()).map(([k, v]) => ({ key: k, label: k, count: v })),
    ];
    return all;
  }, [threads]);

  const filtered = useMemo(() => {
    let arr = threads.slice();
    if (cat !== 'Wszystkie') arr = arr.filter(t => t.category === cat);
    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter(t => t.title.toLowerCase().includes(qq));
    }
    if (sort === 'aktywne') {
      arr.sort((a, b) => {
        const la = a.posts[a.posts.length - 1]?.createdAt ?? a.createdAt;
        const lb = b.posts[b.posts.length - 1]?.createdAt ?? b.createdAt;
        return lb - la;
      });
    } else if (sort === 'najnowsze') {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      const sum = (t: Thread) => t.posts.reduce((acc, p) => acc + p.likes, 0);
      arr.sort((a, b) => sum(b) - sum(a));
    }
    arr.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
    return arr;
  }, [threads, q, cat, sort]);

  const recentReplies = useMemo(() => {
    const items: Array<{ thread: Thread; post: Post }> = [];
    threads.forEach(t => { t.posts.slice(1).forEach(p => items.push({ thread: t, post: p })); });
    items.sort((a, b) => b.post.createdAt - a.post.createdAt);
    return items.slice(0, 8);
  }, [threads]);

  // Akcje (w READ_ONLY tylko „udają”)
  function openThread(t: Thread) { router.replace(`?t=${t.id}`, { scroll: false }); }
  function backToList() { router.replace('/forum', { scroll: false }); }
  function addReply(threadId: ID, body: string) {
    if (READ_ONLY) return; // wyłączone
    setThreads(prev =>
      prev.map(t => t.id === threadId
        ? { ...t, posts: [...t.posts, { id: uid(), author: YOU, body, createdAt: Date.now(), likes: 0 }] }
        : t
      )
    );
    setActive(prev => prev ? { ...prev, posts: [...prev.posts, { id: uid(), author: YOU, body, createdAt: Date.now(), likes: 0 }] } : prev);
  }
  function likePost(threadId: ID, postId: ID) {
    if (READ_ONLY) return; // wyłączone
    setThreads(prev =>
      prev.map(t => t.id === threadId
        ? { ...t, posts: t.posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p) }
        : t
      )
    );
    setActive(prev => prev ? { ...prev, posts: prev.posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p) } : prev);
  }
  function createThread(title: string, category: Category, body: string) {
    if (READ_ONLY) return; // wyłączone
    const th: Thread = {
      id: uid(), category, title, author: YOU, createdAt: Date.now(), views: 1,
      posts: [{ id: uid(), author: YOU, body, createdAt: Date.now(), likes: 0 }],
    };
    setThreads(prev => [th, ...prev]);
    router.replace(`?t=${th.id}`, { scroll: false });
  }

  /* ───────────────────────────── Widok wątku ───────────────────────────── */
  if (view === 'thread' && active) {
    const t = active;
    const copyLink = () => { try { navigator.clipboard.writeText(window.location.href); } catch {} };

    return (
      <main className="mx-auto max-w-6xl p-6 md:p-8">
        <nav className="mb-4 flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
          <button onClick={backToList} className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Wątki</button>
          <button onClick={copyLink} className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">🔗 Kopiuj link</button>
        </nav>

        <MaintenanceBanner />

        <div className="mt-4 flex items-start gap-4">
          <Avatar name={t.author.name} />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
            <div className="mt-1 text-sm text-white/70">{t.category} • {t.author.name} • założony {relTime(t.createdAt)} • 👁 {t.views.toLocaleString('pl-PL')}</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {t.posts.map(p => (
            <Card key={p.id}>
              <div className="flex items-start gap-4">
                <Avatar name={p.author.name} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/70"><span className="font-semibold text-white">{p.author.name}</span> • {relTime(p.createdAt)}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm">{p.body}</div>
                </div>
                <button
                  onClick={() => likePost(t.id, p.id)}
                  disabled={READ_ONLY}
                  title={READ_ONLY ? 'Polubienia wyłączone (prace serwisowe)' : 'Polub post'}
                  className="shrink-0 text-sm rounded-xl px-3 py-1.5 bg-white/10 border border-white/10 disabled:opacity-40"
                >
                  ❤️ {p.likes}
                </button>
              </div>
            </Card>
          ))}
        </div>

        {READ_ONLY ? (
          <Card className="mt-4">
            <div className="text-sm text-white/70">
              ✋ Forum jest obecnie w trybie tylko-do-odczytu. Dodawanie odpowiedzi będzie dostępne po zakończeniu prac.
            </div>
          </Card>
        ) : (
          <Card className="mt-4">
            <ReplyForm onSubmit={(body) => addReply(t.id, body)} />
          </Card>
        )}
      </main>
    );
  }

  /* ───────────────────────────── Widok: nowy wątek ────────────────────── */
  if (view === 'new') {
    if (READ_ONLY) {
      // w trybie serwisowym zamiast formularza wracamy do listy
      setView('list');
    } else {
      return (
        <main className="mx-auto max-w-5xl p-6 md:p-8">
          <nav className="mb-4">
            <button onClick={() => setView('list')} className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Wróć do listy</button>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold">Nowy wątek</h1>
          <MaintenanceBanner />
          <Card><NewThreadForm onCreate={createThread} /></Card>
        </main>
      );
    }
  }

  /* ───────────────────────────── Widok listy ──────────────────────────── */
  return (
    <main className="mx-auto max-w-7xl p-6 md:p-8">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-bold">Forum dyskusyjne</h1>
        <div className="ml-auto grid grid-cols-3 gap-2 text-xs">
          <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">Wątki: <b>{stats.threads}</b></div>
          <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">Posty: <b>{stats.posts}</b></div>
          <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">Dziś: <b>{stats.today}</b></div>
        </div>
      </div>

      <MaintenanceBanner />

      <p className="mt-2 text-slate-300">Pytania, wyniki testów, strategie, mindset – dla początkujących i zaawansowanych.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr_280px]">
        {/* Lewa kolumna: kategorie */}
        <div className="space-y-2">
          <Card>
            <div className="text-sm font-semibold mb-2">Kategorie</div>
            <div className="grid gap-1">
              {categoryList.map(c => (
                <button
                  key={c.label}
                  onClick={() => setCat(c.key)}
                  className={`w-full flex items-center justify-between text-sm px-3 py-1.5 rounded-lg border ${
                    cat === c.key ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className={cat === c.key ? 'text-slate-900/80' : 'text-white/60'}>{c.count}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Środek: lista + toolbar */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1">
              <TextInput placeholder="Szukaj: np. DAX, psychologia, ATR…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
              value={sort} onChange={(e) => setSort(e.currentTarget.value as SortKey)}
            >
              <option value="aktywne">Ostatnia aktywność</option>
              <option value="najnowsze">Najnowsze</option>
              <option value="popularne">Najbardziej lubiane</option>
            </select>
            <button
              onClick={() => setView('new')}
              disabled={READ_ONLY}
              title={READ_ONLY ? 'Nowe wątki wyłączone (prace serwisowe)' : 'Utwórz nowy wątek'}
              className="px-3 py-2 rounded-xl bg-white text-slate-900 text-sm font-semibold disabled:opacity-40"
            >
              + Nowy wątek
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {filtered.map((t) => <ThreadRow key={t.id} t={t} onOpen={openThread} />)}
            {filtered.length === 0 && <Card>Brak wyników dla wybranych filtrów.</Card>}
          </div>
        </div>

        {/* Prawa kolumna: ostatnie odpowiedzi */}
        <div className="space-y-2">
          <Card>
            <div className="text-sm font-semibold mb-2">Ostatnie odpowiedzi</div>
            <div className="grid gap-2">
              {recentReplies.map(({ thread, post }) => (
                <button
                  key={post.id}
                  onClick={() => openThread(thread)}
                  className="w-full text-left rounded-lg px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  <div className="text-xs text-white/60">{post.author.name} • {relTime(post.createdAt)}</div>
                  <div className="text-sm mt-1 line-clamp-2">{post.body}</div>
                  <div className="text-[11px] mt-1 text-white/50">w: <span className="underline">{thread.title}</span></div>
                </button>
              ))}
              {recentReplies.length === 0 && <div className="text-sm text-white/60">Brak odpowiedzi.</div>}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
   Formularze
   ────────────────────────────────────────────────────────────── */
function NewThreadForm({ onCreate }: { onCreate: (title: string, category: Category, body: string) => void; }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Ogólne');
  const [body, setBody] = useState('');
  const can = title.trim().length >= 6 && body.trim().length >= 10;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (can) onCreate(title.trim(), category, body.trim()); }} className="grid gap-4">
      <Field label="Tytuł wątku">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Krótko i na temat…" />
      </Field>
      <Field label="Kategoria">
        <select className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
          value={category} onChange={(e) => setCategory(e.currentTarget.value as Category)}>
          <option>Ogólne</option><option>Strategie</option><option>Psychologia</option>
          <option>Makro</option><option>Analiza techniczna</option><option>Dzienniki</option>
          <option>Forex</option><option>CFD</option><option>Krypto</option>
          <option>Zarządzanie ryzykiem</option><option>Backtesty</option><option>Offtopic</option>
        </select>
      </Field>
      <Field label="Treść pierwszego posta">
        <TextArea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Opisz temat, podaj kontekst / dane / wykres (tekstowo)…" />
      </Field>
      <div className="flex items-center gap-3">
        <button disabled={!can} className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold disabled:opacity-40">Opublikuj wątek</button>
        <span className="text-xs text-white/60">Min. 6 znaków w tytule i 10 w treści.</span>
      </div>
    </form>
  );
}

function ReplyForm({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [body, setBody] = useState('');
  const can = body.trim().length >= 2;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!can) return; onSubmit(body.trim()); setBody(''); }} className="grid gap-3">
      <Field label="Twoja odpowiedź">
        <TextArea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Dodaj rzeczową odpowiedź…" />
      </Field>
      <div className="flex items-center gap-3">
        <button disabled={!can} className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold disabled:opacity-40">Wyślij</button>
        <span className="text-xs text-white/60">Bądź uprzejmy i konkretny 🙂</span>
      </div>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────
   Generator dodatkowych wątków (wiele kategorii)
   ────────────────────────────────────────────────────────────── */
function makeExtraSeeds(): Thread[] {
  const cats: Category[] = [
    'Ogólne','Strategie','Psychologia','Makro','Analiza techniczna',
    'Dzienniki','Forex','CFD','Krypto','Zarządzanie ryzykiem','Backtesty','Offtopic'
  ];
  const titles: Record<Category, string[]> = {
    Ogólne: ['Jakie źródła do nauki?','Co dziś się nauczyłeś?', 'Wasze setupy tygodnia'],
    Strategie: ['Breakout vs. mean reversion','Scalping na DAX – zarządzanie pozycją','ATR jako filtr jakości setupu'],
    Psychologia: ['Jak trzymać plan przy serii strat','Dziennik emocji – działa?','Praca z FOMO'],
    Makro: ['NFP – jak się przygotowujecie','CPI vs. PCE – różnice w praktyce','Decyzja EBC – scenariusze'],
    'Analiza techniczna': ['SFP/FAK – przykłady','Najlepsze interwały do trendu','200 SMA – jak używacie?'],
    Dzienniki: ['Dziennik: 30 dni konsekwencji','Tydzień bez overtradingu – raport','Zmiany po backtestach'],
    Forex: ['EURUSD – H4 trend','USDJPY – co z carry','GBPUSD – poziomy na tydzień'],
    CFD: ['NAS100 – długoterminowo','WTI – strefy popytu/podaży','Złoto – korekty na H1'],
    Krypto: ['BTC – halving a zmienność','ETH – poziomy SR','Altcoiny – jak selekcjonujecie?'],
    'Zarządzanie ryzykiem': ['Kelly – kiedy ma sens','Stały % ryzyka vs stały SL','R-multiple w praktyce'],
    Backtesty: ['Walk-forward krok po kroku','Jak zarządzać próbkami','Bias survivorship w danych'],
    Offtopic: ['Sprzęt/monitory do tradingu','Ergonomia i zdrowie','Książki nie-tradingowe polecane']
  };
  const names = ['Ania','Bartek','Celina','Darek','Ewa','Filip','Gosia','Hubert','Igor','Julia','Kamil','Lena'];
  const bodySamples = [
    'Jakie macie doświadczenia? Chętnie zobaczę przykłady.',
    'U mnie to działa, ale ciekaw jestem innych podejść.',
    'Dzielę się krótkim podsumowaniem – może komuś się przyda.',
  ];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random()*arr.length)];
  const now = Date.now();

  const out: Thread[] = [];
  cats.forEach(cat => {
    titles[cat].forEach((title, i) => {
      const createdAt = now - (i + Math.floor(Math.random()*48) + 8) * 60 * 60 * 1000;
      const author = { id: uid(), name: pick(names) };
      const views = 100 + Math.floor(Math.random()*3500);
      const p1: Post = { id: uid(), author, body: pick(bodySamples), createdAt, likes: Math.floor(Math.random()*20) };
      const p2: Post = { id: uid(), author: { id: uid(), name: pick(names) }, body: pick(bodySamples), createdAt: createdAt + 2*60*60*1000, likes: Math.floor(Math.random()*15) };
      out.push({
        id: uid(), category: cat, title, author, createdAt, views,
        posts: Math.random() > 0.4 ? [p1, p2] : [p1],
      });
    });
  });
  return out;
}
