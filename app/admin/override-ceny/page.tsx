'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';

function Section({
  title,
  items,
  overrideInputs,
  setOverrideInputs,
  overrideUpdatedAt,
  setOverrideUpdatedAt,
  overrideSaveStatus,
  setOverrideSaveStatus,
}: {
  title: string;
  items: string[];
  overrideInputs: Record<string, string>;
  setOverrideInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  overrideUpdatedAt: Record<string, string | null>;
  setOverrideUpdatedAt: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  overrideSaveStatus: Record<string, 'ok' | 'err' | undefined>;
  setOverrideSaveStatus: React.Dispatch<
    React.SetStateAction<Record<string, 'ok' | 'err' | undefined>>
  >;
}) {
  const fmt = (ts: string | null | undefined) => (ts ? new Date(ts).toLocaleString() : '—');
  if (!items.length) return null;
  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm text-white/70 border-b border-white/10">
        <div className="col-span-3">Aktywo</div>
        <div className="col-span-3">Cena</div>
        <div className="col-span-3">Ostatnia aktualizacja</div>
        <div className="col-span-3">Akcja</div>
      </div>
      {items.map((a) => (
        <div key={a} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
          <div className="col-span-3 font-semibold">{a}</div>
          <div className="col-span-3">
            <input
              type="number"
              step="0.0001"
              inputMode="decimal"
              className="w-full rounded-md bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              value={overrideInputs[a] ?? ''}
              onChange={(e) =>
                setOverrideInputs((prev) => ({
                  ...prev,
                  [a]: e.target.value,
                }))
              }
              placeholder="—"
            />
          </div>
          <div className="col-span-3 text-sm text-white/70 self-center">{fmt(overrideUpdatedAt[a])}</div>
          <div className="col-span-3">
            <button
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              onClick={async () => {
                try {
                  const price = Number(overrideInputs[a]);
                  if (!isFinite(price) || price <= 0) {
                    alert('Podaj poprawną cenę (> 0)');
                    return;
                  }
                  const r = await fetch(`/api/panel/price-override/${encodeURIComponent(a)}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ price }),
                  });
                  if (!r.ok) throw new Error(`HTTP ${r.status}`);
                  try {
                    const g = await fetch(`/api/panel/price-override/${encodeURIComponent(a)}`, { cache: 'no-store' });
                    const j = await g.json().catch(() => ({}));
                    if (typeof j?.price === 'number') {
                      setOverrideInputs((prev) => ({ ...prev, [a]: String(j.price) }));
                    }
                    setOverrideUpdatedAt((prev) => ({ ...prev, [a]: j?.updatedAt ?? null }));
                  } catch {}
                  setOverrideSaveStatus((prev) => ({ ...prev, [a]: 'ok' }));
                  window.setTimeout(() => setOverrideSaveStatus((prev) => ({ ...prev, [a]: undefined })), 3000);
                } catch {
                  setOverrideSaveStatus((prev) => ({ ...prev, [a]: 'err' }));
                  window.setTimeout(() => setOverrideSaveStatus((prev) => ({ ...prev, [a]: undefined })), 3000);
                }
              }}
            >
              Zapisz
            </button>
            {overrideSaveStatus[a] === 'ok' && <span className="ml-2 text-emerald-300 text-sm">Zapisano</span>}
            {overrideSaveStatus[a] === 'err' && <span className="ml-2 text-rose-300 text-sm">Błąd zapisu</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminOverridePricesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<string[]>([]);
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [overrideSaveStatus, setOverrideSaveStatus] = useState<Record<string, 'ok' | 'err' | undefined>>({});
  const [overrideUpdatedAt, setOverrideUpdatedAt] = useState<Record<string, string | null>>({});
  const [importEntries, setImportEntries] = useState<Array<{ asset: string; price: number }>>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importBusy, setImportBusy] = useState(false);
  const [importSummary, setImportSummary] = useState<{ ok: number; err: number } | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [xagPrice, setXagPrice] = useState<string>('');
  const [xagSaveStatus, setXagSaveStatus] = useState<'ok' | 'err' | null>(null);
  const [xagUpdatedAt, setXagUpdatedAt] = useState<string | null>(null);
  const [btcPrice, setBtcPrice] = useState<string>('');
  const [btcSaveStatus, setBtcSaveStatus] = useState<'ok' | 'err' | null>(null);
  const [btcUpdatedAt, setBtcUpdatedAt] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<string>('');
  const [ethSaveStatus, setEthSaveStatus] = useState<'ok' | 'err' | null>(null);
  const [ethUpdatedAt, setEthUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ra = await fetch('/api/panel/tech-maps/assets', { cache: 'no-store' });
        if (!ra.ok) throw new Error(`HTTP ${ra.status}`);
        const dataA = await ra.json();
        const list = Array.isArray(dataA?.assets) ? (dataA.assets as string[]) : [];
        if (!mounted) return;
        setAssets(list);
        // Prefill overrides per asset
        try {
          const results = await Promise.allSettled(
            list.map(async (a) => {
              const r = await fetch(`/api/panel/price-override/${encodeURIComponent(a)}`, { cache: 'no-store' });
              if (!r.ok) throw new Error(String(r.status));
              const j = await r.json();
              const price = typeof j?.price === 'number' ? String(j.price) : '';
              const updatedAt = j?.updatedAt ?? null;
              return { asset: a, price, updatedAt };
            }),
          );
          const nextInputs: Record<string, string> = {};
          const nextUpdatedAt: Record<string, string | null> = {};
          for (const it of results) {
            if (it.status !== 'fulfilled') continue;
            nextInputs[it.value.asset] = it.value.price ?? '';
            nextUpdatedAt[it.value.asset] = it.value.updatedAt ?? null;
          }
          if (mounted) {
            setOverrideInputs(nextInputs);
            setOverrideUpdatedAt(nextUpdatedAt);
          }
        } catch {}
        // load XAGUSD
        try {
          const r = await fetch('/api/panel/price-override/XAGUSD', { cache: 'no-store' });
          const j = await r.json().catch(() => ({}));
          const price = typeof j?.price === 'number' ? j.price : null;
          if (mounted) {
            if (price != null) setXagPrice(String(price));
            setXagUpdatedAt(j?.updatedAt ?? null);
          }
        } catch {}
        // load BTCUSD
        try {
          const r = await fetch('/api/panel/price-override/BTCUSD', { cache: 'no-store' });
          const j = await r.json().catch(() => ({}));
          const price = typeof j?.price === 'number' ? j.price : null;
          if (mounted) {
            if (price != null) setBtcPrice(String(price));
            setBtcUpdatedAt(j?.updatedAt ?? null);
          }
        } catch {}
        // load ETHUSD
        try {
          const r = await fetch('/api/panel/price-override/ETHUSD', { cache: 'no-store' });
          const j = await r.json().catch(() => ({}));
          const price = typeof j?.price === 'number' ? j.price : null;
          if (mounted) {
            if (price != null) setEthPrice(String(price));
            setEthUpdatedAt(j?.updatedAt ?? null);
          }
        } catch {}
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Nie udało się pobrać danych override');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <main className="min-h-screen bg-slate-950 text-white p-6">Ładowanie…</main>;
  if (error) return <main className="min-h-screen bg-slate-950 text-white p-6">Błąd: {error}</main>;

  const parseImportText = (text: string) => {
    const lines = text.split(/\r?\n/);
    const nextErrors: string[] = [];
    const map = new Map<string, number>();
    lines.forEach((raw, idx) => {
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) return;
      const tokens = line.split(/[\t,;= ]+/).filter(Boolean);
      if (tokens.length < 2) {
        nextErrors.push(`Linia ${idx + 1}: brak ceny`);
        return;
      }
      const asset = tokens[0].trim().toUpperCase();
      const priceRaw = tokens[1].trim().replace(',', '.');
      const price = Number(priceRaw);
      if (!asset) {
        nextErrors.push(`Linia ${idx + 1}: brak symbolu`);
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        nextErrors.push(`Linia ${idx + 1}: niepoprawna cena "${tokens[1]}"`);
        return;
      }
      map.set(asset, price);
    });
    setImportEntries(Array.from(map.entries()).map(([asset, price]) => ({ asset, price })));
    setImportErrors(nextErrors);
    setImportSummary(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>
        <h1 className="text-2xl font-bold mb-6">Override ceny</h1>

        <h2 className="text-xl font-bold mt-2 mb-4">Import z pliku TXT</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".txt,text/plain"
                className="block text-sm text-white/70 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImportFileName(file?.name ?? null);
                  setImportEntries([]);
                  setImportErrors([]);
                  setImportSummary(null);
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => parseImportText(String(reader.result ?? ''));
                  reader.readAsText(file);
                }}
              />
              {importFileName && <span className="text-xs text-white/60">Wybrano: {importFileName}</span>}
            </div>
            <p className="text-xs text-white/60">
              Format: jedna linia na aktywo, np. <span className="text-white/80">EURUSD 1.0742</span> lub{' '}
              <span className="text-white/80">XAUUSD=2051.7</span>. Linie zaczynające się od # lub // są pomijane.
            </p>
            {importErrors.length > 0 && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {importErrors.slice(0, 6).map((e, i) => (
                  <div key={`${e}-${i}`}>{e}</div>
                ))}
                {importErrors.length > 6 && <div>…i {importErrors.length - 6} więcej</div>}
              </div>
            )}
            {importEntries.length > 0 && (
              <div className="rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-xs text-white/70">
                <div className="mb-2 text-white/80">Podgląd ({importEntries.length} pozycji):</div>
                <div className="grid grid-cols-2 gap-2">
                  {importEntries.slice(0, 10).map((it) => (
                    <div key={it.asset} className="flex items-center justify-between">
                      <span className="font-semibold">{it.asset}</span>
                      <span>{it.price}</span>
                    </div>
                  ))}
                </div>
                {importEntries.length > 10 && <div className="mt-2">…i {importEntries.length - 10} więcej</div>}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                disabled={importBusy || importEntries.length === 0}
                onClick={async () => {
                  setImportBusy(true);
                  setImportSummary(null);
                  const results = await Promise.allSettled(
                    importEntries.map(async (it) => {
                      const r = await fetch(`/api/panel/price-override/${encodeURIComponent(it.asset)}`, {
                        method: 'PUT',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ price: it.price }),
                      });
                      if (!r.ok) throw new Error(`HTTP ${r.status}`);
                      return it;
                    }),
                  );
                  let ok = 0;
                  let err = 0;
                  const nowIso = new Date().toISOString();
                  results.forEach((res) => {
                    if (res.status === 'fulfilled') {
                      ok += 1;
                      const asset = res.value.asset;
                      setOverrideInputs((prev) => ({ ...prev, [asset]: String(res.value.price) }));
                      setOverrideUpdatedAt((prev) => ({ ...prev, [asset]: nowIso }));
                    } else {
                      err += 1;
                    }
                  });
                  setImportSummary({ ok, err });
                  setImportBusy(false);
                }}
              >
                {importBusy ? 'Aktualizuję…' : 'Zastosuj import'}
              </button>
              {importSummary && (
                <span className="text-sm text-white/70">
                  Zaktualizowano: {importSummary.ok}, błędy: {importSummary.err}
                </span>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-2 mb-4">Srebro (XAGUSD)</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Cena XAGUSD (spot)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="rounded-md bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                value={xagPrice}
                onChange={(e) => setXagPrice(e.target.value)}
                placeholder="np. 75.10"
              />
            </div>
            <button
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              onClick={async () => {
                try {
                  const price = Number(xagPrice);
                  if (!isFinite(price) || price <= 0) {
                    alert('Podaj poprawną cenę (> 0)');
                    return;
                  }
                  const r = await fetch('/api/panel/price-override/XAGUSD', {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ price }),
                  });
                  if (!r.ok) throw new Error(`HTTP ${r.status}`);
                  try {
                    const g = await fetch('/api/panel/price-override/XAGUSD', { cache: 'no-store' });
                    const j = await g.json().catch(() => ({}));
                    if (typeof j?.price === 'number') setXagPrice(String(j.price));
                    setXagUpdatedAt(j?.updatedAt ?? null);
                  } catch {}
                  setXagSaveStatus('ok');
                  window.setTimeout(() => setXagSaveStatus(null), 3000);
                } catch {
                  setXagSaveStatus('err');
                  window.setTimeout(() => setXagSaveStatus(null), 3000);
                }
              }}
            >
              Zapisz
            </button>
            {xagSaveStatus === 'ok' && <span className="text-emerald-300 text-sm">Zapisano</span>}
            {xagSaveStatus === 'err' && <span className="text-rose-300 text-sm">Błąd zapisu</span>}
          </div>
          <p className="mt-2 text-xs text-white/60">
            Ta cena ma pierwszeństwo przy generowaniu map technicznych dla XAGUSD. Aktualizacja widoczna po odświeżeniu
            zakładki „Mapy techniczne”.
          </p>
          <p className="mt-1 text-xs text-white/50">
            Ostatnia aktualizacja: {xagUpdatedAt ? new Date(xagUpdatedAt).toLocaleString() : '—'}
          </p>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4">Kryptowaluty (wykresy)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BTCUSD */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-white/60 mb-1">Cena BTCUSD</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-md bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                  value={btcPrice}
                  onChange={(e) => setBtcPrice(e.target.value)}
                  placeholder="np. 45000.00"
                />
              </div>
              <button
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                onClick={async () => {
                  try {
                    const price = Number(btcPrice);
                    if (!isFinite(price) || price <= 0) {
                      alert('Podaj poprawną cenę (> 0)');
                      return;
                    }
                    const r = await fetch('/api/panel/price-override/BTCUSD', {
                      method: 'PUT',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ price }),
                    });
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    try {
                      const g = await fetch('/api/panel/price-override/BTCUSD', { cache: 'no-store' });
                      const j = await g.json().catch(() => ({}));
                      if (typeof j?.price === 'number') setBtcPrice(String(j.price));
                      setBtcUpdatedAt(j?.updatedAt ?? null);
                    } catch {}
                    setBtcSaveStatus('ok');
                    window.setTimeout(() => setBtcSaveStatus(null), 3000);
                  } catch {
                    setBtcSaveStatus('err');
                    window.setTimeout(() => setBtcSaveStatus(null), 3000);
                  }
                }}
              >
                Zapisz
              </button>
            </div>
            {btcSaveStatus === 'ok' && <span className="text-emerald-300 text-sm mt-2 block">Zapisano</span>}
            {btcSaveStatus === 'err' && <span className="text-rose-300 text-sm mt-2 block">Błąd zapisu</span>}
            <p className="mt-2 text-xs text-white/60">
              Ta cena ma pierwszeństwo w panelu „Technika na szybko (EDU)” pod wykresem BTCUSD.
            </p>
            <p className="mt-1 text-xs text-white/50">
              Ostatnia aktualizacja: {btcUpdatedAt ? new Date(btcUpdatedAt).toLocaleString() : '—'}
            </p>
          </div>

          {/* ETHUSD */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-white/60 mb-1">Cena ETHUSD</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-md bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                  value={ethPrice}
                  onChange={(e) => setEthPrice(e.target.value)}
                  placeholder="np. 2500.00"
                />
              </div>
              <button
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                onClick={async () => {
                  try {
                    const price = Number(ethPrice);
                    if (!isFinite(price) || price <= 0) {
                      alert('Podaj poprawną cenę (> 0)');
                      return;
                    }
                    const r = await fetch('/api/panel/price-override/ETHUSD', {
                      method: 'PUT',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ price }),
                    });
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    try {
                      const g = await fetch('/api/panel/price-override/ETHUSD', { cache: 'no-store' });
                      const j = await g.json().catch(() => ({}));
                      if (typeof j?.price === 'number') setEthPrice(String(j.price));
                      setEthUpdatedAt(j?.updatedAt ?? null);
                    } catch {}
                    setEthSaveStatus('ok');
                    window.setTimeout(() => setEthSaveStatus(null), 3000);
                  } catch {
                    setEthSaveStatus('err');
                    window.setTimeout(() => setEthSaveStatus(null), 3000);
                  }
                }}
              >
                Zapisz
              </button>
            </div>
            {ethSaveStatus === 'ok' && <span className="text-emerald-300 text-sm mt-2 block">Zapisano</span>}
            {ethSaveStatus === 'err' && <span className="text-rose-300 text-sm mt-2 block">Błąd zapisu</span>}
            <p className="mt-2 text-xs text-white/60">
              Ta cena ma pierwszeństwo w panelu „Technika na szybko (EDU)” pod wykresem ETHUSD.
            </p>
            <p className="mt-1 text-xs text-white/50">
              Ostatnia aktualizacja: {ethUpdatedAt ? new Date(ethUpdatedAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4">Wszystkie aktywa z map</h2>
        {(() => {
          const indices = new Set(['US100', 'US500', 'DE40', 'US30']);
          const commodities = new Set(['XAUUSD', 'XAGUSD', 'WTI', 'BRENT']);
          const isFxLike = (s: string) => /^[A-Z]{6}$/.test(s);
          const categorize = (s: string): 'Towary' | 'Indeksy' | 'Waluty' | 'Akcje' => {
            if (commodities.has(s)) return 'Towary';
            if (indices.has(s)) return 'Indeksy';
            if (isFxLike(s)) return 'Waluty';
            return 'Akcje';
          };
          const grouped: Record<'Towary' | 'Akcje' | 'Indeksy' | 'Waluty', string[]> = {
            Towary: [],
            Akcje: [],
            Indeksy: [],
            Waluty: [],
          };
          for (const a of assets) grouped[categorize(a)].push(a);
          for (const k of Object.keys(grouped) as (keyof typeof grouped)[]) grouped[k] = grouped[k].sort();

          return (
            <>
              <Section
                title="Towary"
                items={grouped.Towary}
                overrideInputs={overrideInputs}
                setOverrideInputs={setOverrideInputs}
                overrideUpdatedAt={overrideUpdatedAt}
                setOverrideUpdatedAt={setOverrideUpdatedAt}
                overrideSaveStatus={overrideSaveStatus}
                setOverrideSaveStatus={setOverrideSaveStatus}
              />
              <Section
                title="Akcje"
                items={grouped.Akcje}
                overrideInputs={overrideInputs}
                setOverrideInputs={setOverrideInputs}
                overrideUpdatedAt={overrideUpdatedAt}
                setOverrideUpdatedAt={setOverrideUpdatedAt}
                overrideSaveStatus={overrideSaveStatus}
                setOverrideSaveStatus={setOverrideSaveStatus}
              />
              <Section
                title="Indeksy"
                items={grouped.Indeksy}
                overrideInputs={overrideInputs}
                setOverrideInputs={setOverrideInputs}
                overrideUpdatedAt={overrideUpdatedAt}
                setOverrideUpdatedAt={setOverrideUpdatedAt}
                overrideSaveStatus={overrideSaveStatus}
                setOverrideSaveStatus={setOverrideSaveStatus}
              />
              <Section
                title="Waluty"
                items={grouped.Waluty}
                overrideInputs={overrideInputs}
                setOverrideInputs={setOverrideInputs}
                overrideUpdatedAt={overrideUpdatedAt}
                setOverrideUpdatedAt={setOverrideUpdatedAt}
                overrideSaveStatus={overrideSaveStatus}
                setOverrideSaveStatus={setOverrideSaveStatus}
              />
              {assets.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-white/70 text-sm">
                  Brak aktywów do skonfigurowania.
                </div>
              )}
            </>
          );
        })()}
      </div>
    </main>
  );
}


