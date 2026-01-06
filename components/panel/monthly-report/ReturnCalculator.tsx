'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EduMoveExample } from '@/lib/panel/monthlyReports';

type Mode = 'STOCK_1x' | 'CFD_LEVERAGE';
type Direction = 'LONG' | 'SHORT';

type Props = {
	moves: EduMoveExample[];
	onPickMove?: (m: EduMoveExample) => void;
	initial?: Partial<{
		capitalPln: number;
		instrument: string;
		movePct: number;
		mode: Mode;
		leverage: number;
		direction: Direction;
		includeCosts: boolean;
		commissionPct: number;
		spreadPct: number;
	}>;
};

function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n));
}

export default function ReturnCalculator({ moves, initial }: Props) {
	const [capitalPln, setCapitalPln] = useState<number>(initial?.capitalPln ?? 10000);
	const [instrument, setInstrument] = useState<string>(initial?.instrument ?? (moves[0]?.instrument ?? 'US100'));
	const [movePct, setMovePct] = useState<number>(initial?.movePct ?? (moves[0]?.movePct ?? 2));
	const [mode, setMode] = useState<Mode>(initial?.mode ?? 'CFD_LEVERAGE');
	const [leverage, setLeverage] = useState<number>(initial?.leverage ?? (moves.find((m) => m.instrument === instrument)?.leverageDefault ?? 20));
	const [direction, setDirection] = useState<Direction>(initial?.direction ?? 'LONG');
	const [includeCosts, setIncludeCosts] = useState<boolean>(initial?.includeCosts ?? false);
	const [commissionPct, setCommissionPct] = useState<number>(initial?.commissionPct ?? 0);
	const [spreadPct, setSpreadPct] = useState<number>(initial?.spreadPct ?? 0);
	const [customMove, setCustomMove] = useState<boolean>(false);

	useEffect(() => {
		// If user selects an instrument from presets and not in custom mode, auto-fill move and default leverage
		if (!customMove) {
			const m = moves.find((x) => x.instrument === instrument);
			if (m) {
				setMovePct(m.movePct);
				if (m.leverageDefault && mode === 'CFD_LEVERAGE') setLeverage(m.leverageDefault);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [instrument]);

	const directionSign = direction === 'LONG' ? 1 : -1;
	const grossResult = useMemo(() => {
		const pct = movePct / 100;
		if (mode === 'STOCK_1x') {
			return capitalPln * pct * directionSign;
		}
		return capitalPln * pct * leverage * directionSign;
	}, [capitalPln, movePct, mode, leverage, directionSign]);

	const costsPln = useMemo(() => {
		if (!includeCosts) return 0;
		const costPct = (commissionPct + spreadPct) / 100;
		// Uproszczenie EDU: koszty liczone od kapitału
		return capitalPln * costPct;
	}, [includeCosts, commissionPct, spreadPct, capitalPln]);

	const netResult = grossResult - costsPln * Math.sign(grossResult || 1);
	const netReturnPct = (netResult / capitalPln) * 100;
	const altLossGross = useMemo(() => {
		// symulacja straty przy takim samym ruchu w drugą stronę
		const pct = -Math.abs(movePct) / 100;
		if (mode === 'STOCK_1x') {
			return capitalPln * pct * directionSign;
		}
		return capitalPln * pct * leverage * directionSign;
	}, [capitalPln, movePct, mode, leverage, directionSign]);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
			<div className="text-lg font-semibold">Kalkulator (EDU)</div>
			<p className="mt-1 text-sm text-white/70">
				Uproszczona symulacja edukacyjna. Pokażemy także wariant straty przy ruchu w przeciwnym kierunku.
			</p>

			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<div className="space-y-3">
					<label className="block">
						<span className="text-sm text-white/80">Kapitał początkowy (PLN)</span>
						<input
							type="number"
							min={0}
							value={capitalPln}
							onChange={(e) => setCapitalPln(clamp(Number(e.target.value || 0), 0, 10_000_000))}
							className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
						/>
					</label>

					<label className="block">
						<span className="text-sm text-white/80">Instrument</span>
						<select
							value={instrument}
							onChange={(e) => {
								setInstrument(e.target.value);
								setCustomMove(false);
							}}
							className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
						>
							{moves.map((m) => (
								<option key={m.instrument} value={m.instrument}>
									{m.label} — {m.movePct}% (EDU)
								</option>
							))}
							<option value="__custom">Własny…</option>
						</select>
						{instrument === '__custom' && (
							<div className="mt-2">
								<input
									placeholder="Nazwa instrumentu (np. XYZ)"
									className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
									onChange={() => setCustomMove(true)}
								/>
							</div>
						)}
					</label>

					<label className="block">
						<span className="text-sm text-white/80">Ruch ceny (%)</span>
						<input
							type="number"
							step="0.1"
							value={movePct}
							onChange={(e) => {
								setMovePct(Number(e.target.value || 0));
								setCustomMove(true);
							}}
							className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
						/>
					</label>
				</div>

				<div className="space-y-3">
					<fieldset className="block">
						<legend className="text-sm text-white/80">Tryb</legend>
						<div className="mt-1 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
							<button
								type="button"
								onClick={() => setMode('STOCK_1x')}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${mode === 'STOCK_1x' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`}
							>
								Akcje 1:1
							</button>
							<button
								type="button"
								onClick={() => setMode('CFD_LEVERAGE')}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${mode === 'CFD_LEVERAGE' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`}
							>
								CFD / dźwignia
							</button>
						</div>
					</fieldset>

					{mode === 'CFD_LEVERAGE' && (
						<label className="block">
							<span className="text-sm text-white/80">Dźwignia</span>
							<input
								type="number"
								min={1}
								max={30}
								value={leverage}
								onChange={(e) => setLeverage(clamp(Number(e.target.value || 1), 1, 30))}
								className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
							/>
							<div className="mt-1 text-xs text-white/60">Zakres 1–30 (EDU). Uwaga na margin i stop-out.</div>
						</label>
					)}

					<label className="block">
						<span className="text-sm text-white/80">Kierunek</span>
						<div className="mt-1 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
							<button
								type="button"
								onClick={() => setDirection('LONG')}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${direction === 'LONG' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`}
							>
								Long
							</button>
							<button
								type="button"
								onClick={() => setDirection('SHORT')}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${direction === 'SHORT' ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`}
							>
								Short
							</button>
						</div>
					</label>

					<fieldset className="block">
						<legend className="text-sm text-white/80">Koszty</legend>
						<label className="mt-1 inline-flex items-center gap-2 text-sm text-white/80 select-none">
							<input
								type="checkbox"
								checked={includeCosts}
								onChange={(e) => setIncludeCosts(e.target.checked)}
								className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
							/>
							Uwzględnij koszty (EDU)
						</label>
						{includeCosts && (
							<div className="mt-2 grid gap-3 md:grid-cols-2">
								<label className="block">
									<span className="text-sm text-white/80">Prowizja %</span>
									<input
										type="number"
										min={0}
										max={5}
										step="0.05"
										value={commissionPct}
										onChange={(e) => setCommissionPct(clamp(Number(e.target.value || 0), 0, 5))}
										className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
									/>
								</label>
								<label className="block">
									<span className="text-sm text-white/80">Spread/Slippage %</span>
									<input
										type="number"
										min={0}
										max={5}
										step="0.05"
										value={spreadPct}
										onChange={(e) => setSpreadPct(clamp(Number(e.target.value || 0), 0, 5))}
										className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
									/>
								</label>
							</div>
						)}
					</fieldset>
				</div>
			</div>

			{/* results */}
			<div className="mt-5 grid gap-4 md:grid-cols-3">
				<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
					<div className="text-sm text-white/70">Zysk/Strata (PLN)</div>
					<div className={`mt-1 text-2xl font-extrabold ${netResult >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
						{netResult >= 0 ? '+' : ''}
						{netResult.toFixed(0)} PLN
					</div>
				</div>
				<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
					<div className="text-sm text-white/70">Zwrot % z kapitału</div>
					<div className={`mt-1 text-2xl font-extrabold ${netReturnPct >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
						{netReturnPct >= 0 ? '+' : ''}
						{netReturnPct.toFixed(1)}%
					</div>
				</div>
				<div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
					<div className="text-sm text-white/70">Wersja</div>
					<div className="mt-1 text-2xl font-extrabold text-white/90">{includeCosts ? 'Netto (EDU)' : 'Brutto (EDU)'}</div>
				</div>
			</div>

			{/* explanation and examples */}
			<div className="mt-5 grid gap-4 md:grid-cols-2">
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<div className="text-sm font-semibold text-white/80">Wyjaśnienie</div>
					<ul className="mt-2 list-disc pl-5 text-sm text-white/80 space-y-1">
						<li>Akcje 1:1: zysk = kapitał × (ruch%).</li>
						<li>CFD: zysk = kapitał × (ruch%) × dźwignia. EDU — uproszczenie.</li>
						<li>Symulacja straty: przy ruchu −{Math.abs(movePct)}% wynik byłby {altLossGross.toFixed(0)} PLN (brutto).</li>
					</ul>
				</div>
				<div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
					<div className="text-sm font-semibold text-amber-200">Ostrzeżenie (EDU)</div>
					<p className="mt-1 text-sm text-amber-100/90">
						Dźwignia działa w obie strony. Ten kalkulator to uproszczona symulacja edukacyjna. Nie uwzględnia w pełni marży,
						finansowania overnight, zmiany wymogu depozytu, stop-out, poślizgu, spreadów i przerw w płynności.
					</p>
				</div>
			</div>

			<div className="mt-6">
				<div className="text-sm font-semibold text-white/80">Przykłady edukacyjne</div>
				<div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{moves.map((m) => (
						<button
							key={m.instrument + m.label}
							type="button"
							onClick={() => {
								setInstrument(m.instrument);
								setMovePct(m.movePct);
								if (m.leverageDefault) setLeverage(m.leverageDefault);
								setCustomMove(false);
							}}
							className="text-left rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-white/30"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="text-sm font-semibold">{m.label}</div>
								<span
									className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
										m.movePct >= 0
											? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
											: 'border-rose-300/30 bg-rose-400/10 text-rose-200'
									}`}
								>
									{m.movePct >= 0 ? '+' : ''}
									{m.movePct}%
								</span>
							</div>
							<div className="mt-1 text-xs text-white/70">
								{m.assetType} {m.leverageDefault ? `| dźwignia ${m.leverageDefault}x` : '| bez dźwigni'}
							</div>
							{m.notes && <div className="mt-1 text-xs text-white/60">{m.notes}</div>}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}


