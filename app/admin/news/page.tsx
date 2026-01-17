'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BackButton from '@/components/BackButton';
import { ExternalLink, Trash2, CheckCircle, XCircle, RefreshCw, RotateCw, X } from 'lucide-react';

type NewsItem = {
  id: string;
  url: string;
  title: string;
  source: string;
  publishedAt: string;
  createdAt: string;
  isEnriched: boolean;
  category: string | null;
  sentiment: string | null;
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [source, setSource] = useState('');
  const [enriched, setEnriched] = useState<'any' | '1' | '0'>('any');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);
  const limit = 50;

  const prevFiltersRef = useRef<{ q: string; source: string; enriched: 'any' | '1' | '0' }>({
    q,
    source,
    enriched,
  });

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));
    if (q.trim()) params.set('q', q.trim());
    if (source.trim()) params.set('source', source.trim());
    if (enriched !== 'any') params.set('enriched', enriched);

    const r = await fetch(`/api/admin/news?${params.toString()}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || 'Failed to load news');
    setItems(data.items);
    setTotal(data.total);
    setLastLoadedAt(new Date().toISOString());
    setSelected({});
  }, [enriched, limit, page, q, source]);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged = prev.q !== q || prev.source !== source || prev.enriched !== enriched;
    prevFiltersRef.current = { q, source, enriched };

    if (filtersChanged && page !== 0) {
      setPage(0);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        await load();
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać wiadomości');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [enriched, load, page, q, source]);

  async function deleteItem(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć tę wiadomość?')) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/admin/news?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
    } catch (e: any) {
      setError(e?.message || 'Nie udało się usunąć wiadomości');
    } finally {
      setBusy(null);
    }
  }

  async function refreshList() {
    setBusyAction('refreshList');
    try {
      await load();
    } catch (e: any) {
      setError(e?.message || 'Nie udało się odświeżyć listy');
    } finally {
      setBusyAction(null);
      setLoading(false);
    }
  }

  async function runRefreshJob() {
    setBusyAction('refreshJob');
    setError(null);
    try {
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Refresh failed');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Nie udało się uruchomić odświeżania');
    } finally {
      setBusyAction(null);
      setLoading(false);
    }
  }

  function toggleSelected(id: string, next?: boolean) {
    setSelected((prev) => ({
      ...prev,
      [id]: typeof next === 'boolean' ? next : !prev[id],
    }));
  }

  function isAllSelectedOnPage() {
    if (!items.length) return false;
    return items.every((it) => !!selected[it.id]);
  }

  function toggleSelectAllOnPage() {
    const next = !isAllSelectedOnPage();
    setSelected((prev) => {
      const copy = { ...prev };
      for (const it of items) copy[it.id] = next;
      return copy;
    });
  }

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([id]) => id);

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!confirm(`Usunąć zaznaczone wiadomości (${selectedIds.length})?`)) return;
    setBusyAction('deleteMany');
    setError(null);
    try {
      const r = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteMany', ids: selectedIds }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || 'Bulk delete failed');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Nie udało się usunąć zaznaczonych');
    } finally {
      setBusyAction(null);
      setLoading(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Zarządzanie newsami</h1>
            <p className="mt-2 text-sm text-white/60">
              Wszystkie wiadomości: {total} | Strona {page + 1} z {totalPages}
            </p>
            {lastLoadedAt && (
              <p className="mt-1 text-xs text-white/40">Ostatnie odświeżenie widoku: {new Date(lastLoadedAt).toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshList}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
              title="Odśwież listę z bazy"
            >
              <RefreshCw className={`h-4 w-4 ${busyAction === 'refreshList' ? 'animate-spin' : ''}`} />
              Odśwież listę
            </button>
            <button
              onClick={runRefreshJob}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              title="Zaciągnij nowe newsy (RSS) + wzbogacenie AI + wygeneruj brief"
            >
              <RotateCw className={`h-4 w-4 ${busyAction === 'refreshJob' ? 'animate-spin' : ''}`} />
              Odśwież dane
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            Błąd: {error}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 w-full">
              <label className="block">
                <div className="text-xs text-white/60 mb-1">Szukaj (tytuł lub źródło)</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="np. Goldman, CPI, Reuters…"
                  className="w-full rounded-md bg-slate-950/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/60 mb-1">Źródło (dokładna nazwa)</div>
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="np. CNBC Markets"
                  className="w-full rounded-md bg-slate-950/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                />
              </label>
              <label className="block">
                <div className="text-xs text-white/60 mb-1">Status</div>
                <select
                  value={enriched}
                  onChange={(e) => setEnriched(e.target.value as any)}
                  className="w-full rounded-md bg-slate-950/40 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                >
                  <option value="any">Wszystkie</option>
                  <option value="1">Wzbogacone</option>
                  <option value="0">Surowe</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQ('');
                  setSource('');
                  setEnriched('any');
                }}
                disabled={busyAction !== null || (!q && !source && enriched === 'any')}
                className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reset filtrów
              </button>

              <button
                onClick={deleteSelected}
                disabled={busyAction !== null || selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                title="Usuń zaznaczone pozycje"
              >
                <Trash2 className="h-4 w-4" />
                Usuń zaznaczone ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-white/70 border-b border-white/10">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={isAllSelectedOnPage()}
                onChange={toggleSelectAllOnPage}
                className="h-4 w-4 accent-indigo-500"
                aria-label="Zaznacz wszystko na stronie"
              />
            </div>
            <div className="col-span-3">Tytuł</div>
            <div className="col-span-2">Źródło</div>
            <div className="col-span-2">Data publikacji</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Akcje</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={!!selected[item.id]}
                  onChange={() => toggleSelected(item.id)}
                  className="h-4 w-4 accent-indigo-500"
                  aria-label={`Zaznacz ${item.title}`}
                />
              </div>
              <div className="col-span-3">
                <div className="font-medium line-clamp-2">{item.title}</div>
                <div className="text-xs text-white/50 mt-1">
                  {item.category && <span className="mr-2">Kategoria: {item.category}</span>}
                  {item.sentiment && <span>Sentiment: {item.sentiment}</span>}
                </div>
              </div>
              <div className="col-span-2 text-sm text-white/70">{item.source}</div>
              <div className="col-span-2 text-sm text-white/70">
                {new Date(item.publishedAt).toLocaleDateString()}
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {item.isEnriched ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Wzbogacona</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-500">Surowe</span>
                    </>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Otwórz
                </a>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={busy === item.id}
                  className="inline-flex items-center rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-6 text-white/70 text-sm">Brak wiadomości</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>
            <span className="text-sm text-white/70">
              Strona {page + 1} z {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
