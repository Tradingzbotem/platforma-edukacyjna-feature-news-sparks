// app/konto/panel-rynkowy/mapy-techniczne/TechMapsClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TechMapItem } from '@/lib/panel/techMaps';
import AiHealthBadge from './AiHealthBadge';

type Props = {
	items: TechMapItem[];
};

export default function TechMapsClient({ items }: Props) {
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
										{new Date(m.updatedAt).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}
										{(m as any).validFor ? (
											<>
												{' '}
												· Ważne do:{' '}
												{(() => {
													const vf = (m as any).validFor as '1d' | '1w' | '1m';
													const d = new Date(m.updatedAt);
													if (vf === '1d') d.setDate(d.getDate() + 1);
													if (vf === '1w') d.setDate(d.getDate() + 7);
													if (vf === '1m') d.setMonth(d.getMonth() + 1);
													return d.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
												})()}
											</>
										) : null}
									</div>
								</div>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Trend</div>
								<p className="mt-1">{m.trend}</p>
							</div>

							<div className="mt-3 text-sm text-white/80">
								<div className="font-semibold">Kluczowe poziomy</div>
								<ul className="mt-1 list-disc pl-5 space-y-0.5">
									{m.keyLevels.map((lv, i) => (
										<li key={i}>{lv}</li>
									))}
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


