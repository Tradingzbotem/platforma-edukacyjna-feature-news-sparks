// app/konto/panel-rynkowy/mapy-techniczne/TechMapsClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TechMapItem } from '@/lib/panel/techMaps';
import AiHealthBadge from './AiHealthBadge';

type Props = {
	items: TechMapItem[];
};

export default function TechMapsClient({ items }: Props) {
	// Live quotes to rebase key levels względem bieżącej ceny
	type Quote = { price?: number; prevClose?: number; changePct?: number; lastTs?: number };
	const [quotes, setQuotes] = useState<Record<string, Quote>>({});
	const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN || process.env.NEXT_PUBLIC_FINNHUB_KEY;
		const [overrideUpdatedAt, setOverrideUpdatedAt] = useState<Record<string, string>>({});

	function mapToFinnhubSymbol(asset: string): { symbol: string; decimals: number } | null {
		const v = String(asset || '').toUpperCase();
		// Indices (CFD via OANDA)
		if (v === 'US100' || v.includes('NAS100')) return { symbol: 'OANDA:NAS100_USD', decimals: 0 };
		if (v === 'US500' || v.includes('SPX') || v.includes('S&P')) return { symbol: 'OANDA:US500_USD', decimals: 0 };
		if (v === 'US30' || v.includes('DOW')) return { symbol: 'OANDA:US30_USD', decimals: 0 };
		if (v === 'DE40' || v.includes('DAX')) return { symbol: 'OANDA:DE30_EUR', decimals: 0 };
		// FX (CFD/cash via OANDA)
		if (v === 'EURUSD') return { symbol: 'OANDA:EUR_USD', decimals: 5 };
		if (v === 'GBPUSD') return { symbol: 'OANDA:GBP_USD', decimals: 5 };
		if (v === 'USDJPY') return { symbol: 'OANDA:USD_JPY', decimals: 3 };
		if (v === 'EURPLN') return { symbol: 'OANDA:EUR_PLN', decimals: 4 };
		if (v === 'USDPLN') return { symbol: 'OANDA:USD_PLN', decimals: 4 };
		// Commodities
		if (v === 'XAUUSD' || v === 'XAU') return { symbol: 'OANDA:XAU_USD', decimals: 2 };
		// Silver: TVC feed (TradingView Composite) zapewnia spójne notowania spot
		if (v === 'XAGUSD' || v === 'XAG') return { symbol: 'TVC:SILVER', decimals: 2 };
		if (v === 'WTI') return { symbol: 'OANDA:WTICO_USD', decimals: 2 };
		if (v === 'BRENT') return { symbol: 'OANDA:BCO_USD', decimals: 2 };
		// Stocks (Finnhub native)
		const STOCKS = new Set(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'NFLX']);
		if (STOCKS.has(v)) return { symbol: v, decimals: 2 };
		return null;
	}

	function fmt(n: number | undefined, digits: number) {
		if (n == null || !isFinite(n)) return '—';
		if (digits <= 0) return String(Math.round(n));
		return n.toFixed(digits);
	}

	// Wyciągnij pierwszą liczbę z ciągu (obsługa "150 USD - wsparcie", "17,020", "4 285", itp.)
	function extractNumberFromText(text: string | number): { value: number | null; start: number; end: number } {
		if (typeof text === 'number') return { value: Number.isFinite(text) ? text : null, start: 0, end: 0 };
		const s = String(text || '');
		// dopasuj pierwszą liczbę z opcjonalnymi separatorami tysięcy i częścią dziesiętną
		const m = s.match(/-?\d{1,3}(?:[ \u00A0,]\d{3})*(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?/);
		if (!m) return { value: null, start: -1, end: -1 };
		const raw = m[0];
		// usuń separatory tysięcy i zamień przecinek dziesiętny na kropkę
		const normal = raw.replace(/[ \u00A0,](?=\d{3}\b)/g, '').replace(',', '.');
		const val = Number(normal);
		return Number.isFinite(val) ? { value: val, start: m.index ?? 0, end: (m.index ?? 0) + raw.length } : { value: null, start: -1, end: -1 };
	}

	function roundToStep(value: number, step: number): number {
		if (!Number.isFinite(value) || step <= 0) return value;
		return Math.round(value / step) * step;
	}

	function pickStepForPrice(price: number, decimals: number): number {
		if (!Number.isFinite(price)) return Math.max(1, Math.pow(10, -decimals));
		if (decimals > 0) return Math.pow(10, -decimals);
		if (price >= 20000) return 50;
		if (price >= 5000) return 20;
		if (price >= 1000) return 10;
		return 1;
	}

	function normalizeLevelsForPrice(levels: Array<string | number>, currentPrice?: number, decimals: number = 0): string[] {
		// Zbierz tylko liczby do obliczenia mediany
		const numericPool: number[] = [];
		for (const lv of levels) {
			const { value } = extractNumberFromText(lv);
			if (value != null && isFinite(value)) numericPool.push(value);
		}
		if (numericPool.length === 0) {
			// nic do przeskalowania — zwróć oryginalne etykiety
			return levels.map((lv) => String(lv));
		}
		if (currentPrice == null || !isFinite(currentPrice)) {
			// brak ceny — sformatuj same liczby, pozostałe zostaw jak były
			return levels.map((lv) => {
				const s = String(lv);
				const ex = extractNumberFromText(s);
				if (ex.value == null) return s;
				const formatted = decimals <= 0 ? String(Math.round(ex.value)) : ex.value.toFixed(decimals);
				// Zwróć wyłącznie znormalizowaną liczbę (bez oryginalnych sufiksów), aby uniknąć artefaktów typu „.00” lub „000”.
				return formatted;
			});
		}
		// policz medianę z dostępnych liczb
		const sorted = [...numericPool].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
		if (!isFinite(median) || median <= 0) {
			return levels.map((lv) => String(lv));
		}
		const ratio = currentPrice / median;
		const needsRebase = ratio >= 1.15 || ratio <= 0.87; // ciaśniejsze progi, by częściej dopasowywać
		const step = pickStepForPrice(currentPrice, decimals);
		return levels.map((lv) => {
			const s = String(lv);
			const ex = extractNumberFromText(s);
			if (ex.value == null) return s;
			const val = needsRebase ? roundToStep(ex.value * ratio, step) : ex.value;
			const formatted = decimals <= 0 ? String(Math.round(val)) : val.toFixed(decimals);
			// Zwróć tylko liczbę po rebasingu (bez oryginalnych sufiksów), aby uniknąć „przyklejonych” końcówek.
			return formatted;
		});
	}

	// Kategorie (szybkie filtry)
	const C_FX = ['EURUSD', 'GBPUSD', 'USDJPY', 'EURPLN', 'USDPLN'];
	const C_INDEKSY = ['US100', 'US500', 'DE40', 'US30'];
	const C_TOWARY = ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT'];
	const C_AKCJE = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'];
	const CATEGORY_ASSETS: Record<string, string[]> = {
		Wszystko: [...C_FX, ...C_INDEKSY, ...C_TOWARY, ...C_AKCJE],
		FX: C_FX,
		Indeksy: C_INDEKSY,
		Towary: C_TOWARY,
		Akcje: C_AKCJE,
	};
	const [category, setCategory] = useState<keyof typeof CATEGORY_ASSETS>('Wszystko');

	// Uzupełnij brakujące TF przez zsyntetyzowane mapy (EDU) z najbliższego TF
	function ensureAllTimeframes(src: TechMapItem[]): TechMapItem[] {
		const TF_ORDER: TechMapItem['timeframe'][] = ['M30', 'H1', 'H4', 'D1', 'W1', 'MN'];
		const byAsset: Record<string, TechMapItem[]> = {};
		src.forEach((m) => {
			if (!byAsset[m.asset]) byAsset[m.asset] = [];
			byAsset[m.asset].push(m);
		});
		const out: TechMapItem[] = [...src];
		Object.entries(byAsset).forEach(([asset, list]) => {
			const have = new Set(list.map((m) => m.timeframe));
			TF_ORDER.forEach((tf) => {
				if (!have.has(tf)) {
					const nearest =
						list.find((m) => m.timeframe === 'H4') ||
						list.find((m) => m.timeframe === 'H1') ||
						list.find((m) => m.timeframe === 'D1') ||
						list[0];
					if (nearest) {
						out.push({
							...nearest,
							id: `${nearest.asset}-${tf.toLowerCase()}`,
							timeframe: tf,
							scenarioNotes: [
								...(nearest.scenarioNotes || []),
								`EDU: mapa zsyntetyzowana dla TF ${tf} na podstawie istniejącego opisu (kontekst).`,
							],
						});
					}
				}
			});
		});
		return out;
	}

	const fullItems = useMemo(() => ensureAllTimeframes(items), [items]);

	const uniqueAssets = useMemo(() => {
		const allowed = new Set(CATEGORY_ASSETS[category]);
		const set = new Set<string>();
		fullItems.forEach((m) => {
			if (category === 'Wszystko' || allowed.has(m.asset)) set.add(m.asset);
		});
		return Array.from(set).sort();
	}, [fullItems, category]);

	const [query, setQuery] = useState<string>('');
	const [timeframe, setTimeframe] = useState<TechMapItem['timeframe'] | ''>('');
	const [open, setOpen] = useState<boolean>(false);
	const [horizon, setHorizon] = useState<'' | '1d' | '1w' | '1m'>('');
	const [overridePrices, setOverridePrices] = useState<Record<string, number>>({});

	// Auto-wybór pierwszego dostępnego aktywa, aby od razu pokazać mapy
	const didAutoSelectRef = useRef(false);
	useEffect(() => {
		// Wykonaj tylko raz po załadowaniu modułu, aby użytkownik mógł czyścić pole
		if (!didAutoSelectRef.current && !query && uniqueAssets.length > 0) {
			setQuery(uniqueAssets[0]);
			didAutoSelectRef.current = true;
		}
	}, [uniqueAssets, query]);

	const appliedAsset = useMemo(() => {
		const q = query.trim().toUpperCase();
		if (!q) return '';
		const match = uniqueAssets.find((a) => a.toUpperCase() === q);
		return match ? match.toUpperCase() : q;
	}, [query, uniqueAssets]);

	const TF_ORDER: TechMapItem['timeframe'][] = ['M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

	const availableTf = useMemo(() => {
		if (!appliedAsset) return [] as TechMapItem['timeframe'][];
		const set = new Set<TechMapItem['timeframe']>();
		fullItems.forEach((m) => {
			if (m.asset.toUpperCase() === appliedAsset) set.add(m.timeframe);
		});
		return TF_ORDER.filter((t) => set.has(t));
	}, [appliedAsset, fullItems]);

	// Reset TF if not available for chosen asset
	useEffect(() => {
		if (timeframe && !availableTf.includes(timeframe)) {
			setTimeframe('');
		}
	}, [availableTf, timeframe]);

	// Zestaw map po zastosowaniu filtrów
	const filtered = useMemo(() => {
		if (!appliedAsset) return [] as TechMapItem[];
		return fullItems.filter((m) => {
			if (m.asset.toUpperCase() !== appliedAsset) return false;
			if (timeframe && m.timeframe !== timeframe) return false;
			if (horizon) {
				const vf = (m as any).validFor as '1d' | '1w' | '1m' | undefined;
				if (vf && vf !== horizon) return false;
			}
			return true;
		});
	}, [appliedAsset, timeframe, horizon, fullItems]);
	// Wczytaj snap quote z topbar ticker (localStorage), aby mieć spójne ceny w całej aplikacji
	useEffect(() => {
		let alive = true;
		function readTopbarSnapshot() {
			if (typeof window === 'undefined') return;
			try {
				const ls = window.localStorage;
				const merged: Record<string, Quote> = {};
				for (let i = 0; i < ls.length; i++) {
					const k = ls.key(i);
					if (!k || !k.startsWith('ticker:finnhub:v1:')) continue;
					const raw = ls.getItem(k);
					if (!raw) continue;
					try {
						const parsed = JSON.parse(raw) as Record<string, Quote> | null;
						if (!parsed || typeof parsed !== 'object') continue;
						for (const sym of Object.keys(parsed)) {
							const cur = merged[sym];
							const nxt = parsed[sym];
							if (!nxt || typeof nxt !== 'object') continue;
							const curTs = typeof cur?.lastTs === 'number' ? cur.lastTs : 0;
							const nxtTs = typeof nxt?.lastTs === 'number' ? nxt.lastTs : 0;
							if (!cur || nxtTs >= curTs) merged[sym] = nxt;
						}
					} catch {}
				}
				if (!alive) return;
				if (Object.keys(merged).length === 0) return;
				// Potrzebujemy tylko symboli z aktualnie filtrowanych map
				const needed = new Set(
					filtered
						.map((m) => m.asset)
						.map((a) => mapToFinnhubSymbol(a)?.symbol)
						.filter(Boolean) as string[],
				);
				if (needed.size === 0) return;
				const next: Record<string, Quote> = {};
				for (const sym of needed) {
					const q = merged[sym];
					if (q && typeof q === 'object') next[sym] = q;
				}
				if (Object.keys(next).length) {
					setQuotes((prev) => ({ ...prev, ...next }));
				}
			} catch {}
		}
		readTopbarSnapshot();
		const id = typeof window !== 'undefined' ? window.setInterval(readTopbarSnapshot, 1000) : 0;
		return () => {
			alive = false;
			if (id) window.clearInterval(id);
		};
	}, [filtered]);

	// Pobierz ewentualne admin override cen dla widocznych aktywów (publiczne GET)
	// Automatycznie odświeża gdy ceny się zmieniają (polling co 10s)
	useEffect(() => {
		let alive = true;
		async function fetchOverrides() {
			try {
				const uniqAssets = Array.from(new Set(filtered.map((m) => m.asset)));
				if (!uniqAssets.length) return;
				const results = await Promise.allSettled(
					uniqAssets.map(async (a) => {
						const r = await fetch(`/api/panel/price-override/${encodeURIComponent(a)}`, { cache: 'no-store' });
						if (!r.ok) throw new Error(String(r.status));
						const j = await r.json();
						const price = typeof j?.price === 'number' ? j.price : null;
						const updatedAt = typeof j?.updatedAt === 'string' && j.updatedAt ? j.updatedAt : null;
						return { asset: a, price, updatedAt };
					}),
				);
				if (!alive) return;
				const nextPrices: Record<string, number> = {};
				const nextUpdated: Record<string, string> = {};
				for (const it of results) {
					if (it.status !== 'fulfilled') continue;
					const assetKey = it.value.asset.toUpperCase();
					if (it.value.price != null && isFinite(it.value.price) && it.value.price > 0) {
						nextPrices[assetKey] = it.value.price;
					}
					if (it.value.updatedAt) {
						nextUpdated[assetKey] = it.value.updatedAt;
					}
				}
				
				if (Object.keys(nextPrices).length) {
					setOverridePrices((prev) => {
						// Sprawdź czy ceny się zmieniły - jeśli tak, odśwież
						const changed = Object.keys(nextPrices).some(
							(key) => prev[key] !== nextPrices[key]
						);
						return changed ? { ...prev, ...nextPrices } : prev;
					});
				}
				if (Object.keys(nextUpdated).length) {
					setOverrideUpdatedAt((prev) => ({ ...prev, ...nextUpdated }));
				}
			} catch {}
		}
		
		fetchOverrides();
		
		// Polling co 10 sekund, żeby wykryć zmiany override z admina
		const pollInterval = setInterval(fetchOverrides, 10000);
		
		// refresh overrides on window focus to reflect recent admin saves
		function onFocus() {
			fetchOverrides();
		}
		if (typeof window !== 'undefined') {
			window.addEventListener('focus', onFocus);
		}
		
		return () => {
			alive = false;
			clearInterval(pollInterval);
			if (typeof window !== 'undefined') {
				window.removeEventListener('focus', onFocus);
			}
		};
	}, [filtered]);

	// Serwerowy snapshot (niezależny od public token) — uzupełnia quotes
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const r = await fetch('/api/edu/scenarios/snapshot?ttlMin=60', { cache: 'no-store' });
				if (!r.ok) return;
				const j = await r.json();
				const arr = Array.isArray(j?.data)
					? (j.data as Array<{ asset: string; symbol?: string; price?: number; prevClose?: number; changePct?: number }>)
					: [];
				const next: Record<string, Quote> = {};
				for (const row of arr) {
					const sym = typeof row?.symbol === 'string' ? row.symbol : undefined;
					if (!sym) continue;
					const price = typeof row?.price === 'number' ? row.price : undefined;
					const prevClose = typeof row?.prevClose === 'number' ? row.prevClose : undefined;
					const changePct = typeof row?.changePct === 'number' ? row.changePct : undefined;
					next[sym] = { price, prevClose, changePct, lastTs: Date.now() };
				}
				if (!alive || Object.keys(next).length === 0) return;
				setQuotes((prev) => ({ ...prev, ...next }));
			} catch {}
		})();
		return () => {
			alive = false;
		};
	}, []);

	// Bezpośredni REST Finnhub (jeśli jest public token) dla widocznych symboli
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				if (!token) return;
				const uniq = Array.from(
					new Set(
						filtered
							.map((m) => m.asset)
							.map((a) => mapToFinnhubSymbol(a)?.symbol)
							.filter(Boolean) as string[],
					),
				);
				if (!uniq.length) return;
				const results = await Promise.allSettled(
					uniq.map(async (sym) => {
						const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${token}`;
						const r = await fetch(url, { cache: 'no-store' });
						if (!r.ok) throw new Error(String(r.status));
						const j = await r.json();
						const price = typeof j.c === 'number' ? j.c : undefined;
						const prevClose = typeof j.pc === 'number' ? j.pc : undefined;
						const changePct =
							price != null && prevClose != null && prevClose !== 0
								? ((price - prevClose) / prevClose) * 100
								: typeof j.dp === 'number'
								? j.dp
								: undefined;
						return { sym, price, prevClose, changePct };
					}),
				);
				const next: Record<string, Quote> = {};
				for (const it of results) {
					if (it.status !== 'fulfilled') continue;
					const { sym, price, prevClose, changePct } = it.value as any;
					next[sym] = { price, prevClose, changePct, lastTs: Date.now() };
				}
				if (Object.keys(next).length) {
					if (!alive) return;
					setQuotes((prev) => ({ ...prev, ...next }));
				}
			} catch {}
		})();
		return () => {
			alive = false;
		};
	}, [filtered, token]);



	const suggestions = useMemo(() => {
		const q = query.trim().toUpperCase();
		if (!q) return uniqueAssets;
		return uniqueAssets.filter((a) => a.toUpperCase().includes(q));
	}, [query, uniqueAssets]);

	const moduleLastUpdated = useMemo(() => {
		const ts = fullItems.reduce<number>((acc, m) => {
			const t = Date.parse(m.updatedAt);
			return Number.isFinite(t) ? Math.max(acc, t) : acc;
		}, 0);
		return ts ? new Date(ts) : null;
	}, [fullItems]);

	return (
		<div className="mt-6">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
				<div className="flex flex-wrap items-center gap-2">
					{(Object.keys(CATEGORY_ASSETS) as Array<keyof typeof CATEGORY_ASSETS>).map((k) => (
						<button
							key={k}
							type="button"
							onClick={() => {
								setCategory(k);
								setQuery('');
								setTimeframe('');
							}}
							className={`rounded-full px-3 py-1 text-xs font-medium border ${
								category === k
									? 'bg-white text-slate-900 border-white'
									: 'bg-transparent text-white/80 border-white/20 hover:border-white/40'
							}`}
						>
							{k}
						</button>
					))}
				</div>
				<div className="flex flex-col md:flex-row md:items-end gap-3">
					<div className="flex-1 relative">
						<label htmlFor="asset" className="text-xs font-semibold tracking-widest text-white/60">
							WYSZUKAJ AKTYWO
						</label>
						<input
							id="asset"
							placeholder="np. US100, EURUSD, XAUUSD…"
							className="mt-1 w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								// keep TF unless asset actually changes to another set
							}}
							onFocus={() => setOpen(true)}
							onBlur={() => setTimeout(() => setOpen(false), 150)}
						/>
						{open && (
							<div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
								{suggestions.map((a) => (
									<button
										type="button"
										key={a}
										className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 focus:bg-white/5 focus:outline-none"
										onMouseDown={(e) => {
											e.preventDefault();
											setQuery(a);
											setOpen(false);
										}}
									>
										{a}
									</button>
								))}
							</div>
						)}
					</div>

					{appliedAsset ? (
						<>
							<div className="md:w-56">
								<label htmlFor="tf-select" className="text-xs font-semibold tracking-widest text-white/60">
									INTERWAŁ
								</label>
								<select
									id="tf-select"
									className="mt-1 w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
									value={timeframe}
									onChange={(e) => setTimeframe(e.target.value as TechMapItem['timeframe'] | '')}
								>
									<option value="">Wszystkie</option>
									{availableTf.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>
							<div className="md:w-56">
								<label htmlFor="hz-select" className="text-xs font-semibold tracking-widest text-white/60">
									HORYZONT
								</label>
								<select
									id="hz-select"
									className="mt-1 w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
									value={horizon}
									onChange={(e) => setHorizon(e.target.value as any)}
								>
									<option value="">Wszystkie</option>
									<option value="1d">Dzisiaj (1d)</option>
									<option value="1w">Do końca tygodnia (1w)</option>
									<option value="1m">Do końca miesiąca (1m)</option>
								</select>
							</div>
						</>
					) : null}
				</div>

				<div className="mt-3 text-xs text-white/60 flex items-center gap-3">
					<span>AI monitoruje trendy i odświeża treści cyklicznie, aby mapy pozostawały możliwie aktualne. EDU — bez sygnałów.</span>
					{moduleLastUpdated ? (
						<span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
							Ostatnia aktualizacja: {moduleLastUpdated.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}
						</span>
					) : null}
					<AiHealthBadge />
				</div>
			</div>

			{!appliedAsset ? (
				<div className="mt-6 text-sm text-white/70">
					Wybierz aktywo powyżej, a następnie interwał, aby wyświetlić mapy techniczne.
				</div>
			) : filtered.length === 0 ? (
				<div className="mt-6 text-sm text-white/70">
					Brak zdefiniowanych map dla <span className="font-semibold text-white">{appliedAsset}</span>.
				</div>
			) : (
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					{filtered.map((m) => (
						<article key={m.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm text-white/70">
									<div className="font-semibold text-white/80">
										{m.asset} · {m.timeframe}
									</div>
									<div className="mt-0.5">
										Aktualizacja:{' '}
										{(() => {
											const ov = overrideUpdatedAt[m.asset.toUpperCase()];
											const base = ov ? new Date(ov) : new Date(m.updatedAt);
											return base.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
										})()}
										{(m as any).validFor ? (
											<>
												{' '}
												· Ważne do:{' '}
												{(() => {
													const vf = (m as any).validFor as '1d' | '1w' | '1m';
													const ov = overrideUpdatedAt[m.asset.toUpperCase()];
													const d = ov ? new Date(ov) : new Date(m.updatedAt);
													if (vf === '1d') d.setDate(d.getDate() + 1);
													if (vf === '1w') d.setDate(d.getDate() + 7);
													if (vf === '1m') d.setMonth(d.getMonth() + 1);
													return d.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
												})()}
											</>
										) : null}
									</div>
								</div>
								{(() => {
									const mapp = mapToFinnhubSymbol(m.asset);
									if (!mapp) return null;
									const q = quotes[mapp.symbol];
									const pct = q && typeof q.changePct === 'number' ? q.changePct : undefined;
									const cls =
										pct == null
											? 'text-white/70'
											: pct >= 0
											? 'text-emerald-300'
											: 'text-red-300';
									return (
										<div className="text-right">
											<div className="text-xs text-white/70">
												<span className="inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5">
													{fmt(
														(() => {
															const ov = overridePrices[m.asset.toUpperCase()];
															if (typeof ov === 'number' && ov > 0) return ov;
															return q && typeof q.price === 'number' && q.price > 0 ? q.price : undefined;
														})(),
														mapp.decimals,
													)}
												</span>
											</div>
											<div className={`text-[11px] ${cls}`}>{pct == null ? '—' : `${pct.toFixed(2)}%`}</div>
										</div>
									);
								})()}
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Trend</div>
								<p className="mt-1">{m.trend}</p>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Kluczowe poziomy</div>
								<ul className="mt-1 list-disc pl-5 space-y-0.5">
									{(() => {
										const mapp = mapToFinnhubSymbol(m.asset);
										const q = mapp ? quotes[mapp.symbol] : undefined;
										const ov = overridePrices[m.asset.toUpperCase()];
										const priceForRebase =
											typeof ov === 'number' && ov > 0
												? ov
												: q && typeof q.price === 'number' && q.price > 0
												? q.price
												: undefined;
										const display = normalizeLevelsForPrice(m.keyLevels, priceForRebase, mapp?.decimals ?? 0);
										return display.map((lv, i) => <li key={i}>{lv}</li>);
									})()}
								</ul>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Wskaźniki (EDU)</div>
								<ul className="mt-1 list-disc pl-5 space-y-0.5">
									{m.indicators.map((it, i) => (
										<li key={i}>{it}</li>
									))}
								</ul>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Zmienność</div>
								<p className="mt-1">{m.volatility}</p>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Notatki scenariuszowe (EDU)</div>
								<ul className="mt-1 list-disc pl-5 space-y-0.5">
									{m.scenarioNotes.map((nt, i) => (
										<li key={i}>{nt}</li>
									))}
								</ul>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}


