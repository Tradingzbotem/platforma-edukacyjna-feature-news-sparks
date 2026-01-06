'use client';

import { useMemo, useState } from 'react';
import type { EduQuizQuestion } from '@/lib/panel/monthlyReports';

type Props = {
	ym: string;
	questions: EduQuizQuestion[];
	links?: {
		playbooksHref?: string;
	};
};

export default function MonthlyQuiz({ ym, questions, links }: Props) {
	const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
	const [submitted, setSubmitted] = useState(false);

	const score = useMemo(() => {
		return answers.reduce((acc, a, i) => (a === questions[i].correctIndex ? acc + 1 : acc), 0);
	}, [answers, questions]);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Quiz miesiąca — {ym}</div>
				{submitted && (
					<div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
						Wynik: {score}/{questions.length}
					</div>
				)}
			</div>
			<p className="mt-1 text-sm text-white/70">10–15 pytań MCQ z wyjaśnieniem. EDU — bez rekomendacji.</p>

			<ol className="mt-4 space-y-4">
				{questions.map((q, i) => {
					const chosen = answers[i];
					const isCorrect = submitted && chosen === q.correctIndex;
					const isWrong = submitted && chosen !== -1 && chosen !== q.correctIndex;
					return (
						<li key={i} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
							<div className="text-sm font-semibold text-white/90">
								{i + 1}. {q.question}
							</div>
							<ul className="mt-2 space-y-2">
								{q.options.map((opt, j) => {
									const selected = chosen === j;
									const correct = submitted && j === q.correctIndex;
									const wrong = submitted && selected && j !== q.correctIndex;
									return (
										<li key={j}>
											<button
												type="button"
												onClick={() => {
													if (submitted) return;
													setAnswers((a) => {
														const next = [...a];
														next[i] = j;
														return next;
													});
												}}
												className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition
													${selected ? 'border-white/20 bg-white/10' : 'border-white/10 bg-slate-950/40 hover:bg-slate-950/60'}
													${correct ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : ''}
													${wrong ? 'border-rose-300/30 bg-rose-400/10 text-rose-200' : ''}`}
											>
												{opt}
											</button>
										</li>
									);
								})}
							</ul>

							{submitted && (
								<div className={`mt-3 rounded-lg border p-3 text-sm ${isCorrect ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100/90' : 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100/90'}`}>
									<div className="font-semibold">{isCorrect ? 'Dobrze!' : 'Wyjaśnienie'}</div>
									<div className="mt-1">{q.explanation}</div>
								</div>
							)}
						</li>
					);
				})}
			</ol>

			<div className="mt-4 flex items-center gap-3">
				<button
					type="button"
					onClick={() => setSubmitted(true)}
					disabled={submitted || answers.some((a) => a === -1)}
					className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
				>
					Zakończ i pokaż wynik
				</button>
				<button
					type="button"
					onClick={() => {
						setSubmitted(false);
						setAnswers(Array(questions.length).fill(-1));
					}}
					className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
				>
					Resetuj
				</button>
			</div>

			{submitted && (
				<div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white/80">
					<div className="font-semibold">Co warto powtórzyć?</div>
					<ul className="mt-1 list-disc pl-5 space-y-1">
						<li>Przejrzyj sekcje: Przegląd, „Co się wydarzyło”, „Dlaczego to poruszyło rynek”.</li>
						<li>Wróć do Scenariuszy A/B/C i Checklist.</li>
						{links?.playbooksHref && <li>Zajrzyj do Playbooków: <a className="underline hover:no-underline" href={links.playbooksHref}>Eventy i schematy reakcji</a>.</li>}
					</ul>
				</div>
			)}
		</div>
	);
}


