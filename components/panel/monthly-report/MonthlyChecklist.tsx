'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EduMonthlyChecklist } from '@/lib/panel/monthlyReports';

type Props = {
	ym: string;
	checklist: EduMonthlyChecklist;
};

type CheckedState = Record<string, boolean>;

function keyFor(ym: string) {
	return `monthly-checklist:${ym}`;
}

export default function MonthlyChecklist({ ym, checklist }: Props) {
	const [state, setState] = useState<CheckedState>({});

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(keyFor(ym));
			setState(raw ? (JSON.parse(raw) as CheckedState) : {});
		} catch {
			setState({});
		}
	}, [ym]);

	useEffect(() => {
		try {
			window.localStorage.setItem(keyFor(ym), JSON.stringify(state));
		} catch {
			// ignore
		}
	}, [state, ym]);

	const blocks = useMemo(
		() => [
			{ title: 'Przed ważnymi danymi', items: checklist.preData, id: 'pre' },
			{ title: 'W dniu publikacji', items: checklist.onRelease, id: 'day' },
			{ title: 'Po publikacji (debrief)', items: checklist.postDebrief, id: 'post' },
		],
		[checklist]
	);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
			<div className="text-lg font-semibold">Checklisty miesiąca</div>
			<div className="mt-1 text-sm text-white/70">Zaznaczenia zapisywane lokalnie dla {ym}.</div>
			<div className="mt-4 grid gap-4 md:grid-cols-3">
				{blocks.map((b) => (
					<div key={b.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
						<div className="text-sm font-semibold">{b.title}</div>
						<ul className="mt-2 space-y-2">
							{b.items.map((it, idx) => {
								const id = `${b.id}:${idx}`;
								const checked = Boolean(state[id]);
								return (
									<li key={id} className="flex items-start gap-2">
										<input
											id={id}
											type="checkbox"
											checked={checked}
											onChange={(e) => setState((s) => ({ ...s, [id]: e.target.checked }))}
											className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
										/>
										<label htmlFor={id} className="text-sm text-white/85">
											{it}
										</label>
									</li>
								);
							})}
						</ul>
						<button
							type="button"
							onClick={() => {
								const next: CheckedState = { ...state };
								for (let i = 0; i < b.items.length; i++) {
									delete next[`${b.id}:${i}`];
								}
								setState(next);
							}}
							className="mt-3 text-[12px] rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white/80 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
						>
							Wyczyść blok
						</button>
					</div>
				))}
			</div>
			<div className="mt-4">
				<button
					type="button"
					onClick={() => setState({})}
					className="text-sm rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white/85 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
				>
					Resetuj wszystkie zaznaczenia
				</button>
			</div>
		</div>
	);
}


