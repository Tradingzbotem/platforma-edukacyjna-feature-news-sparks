import React from 'react';
import Markdown from '@/components/redakcja/Markdown';
import { parseNewsEventFactsMarkdown, type ParsedNewsEventFacts } from '@/lib/redakcja/parseNewsEventFactsMarkdown';

function sentimentStyles(s: string): string {
	const x = s.toLowerCase();
	if (x === 'positive' || x === 'pozytywny') {
		return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200';
	}
	if (x === 'negative' || x === 'negatywny') {
		return 'border-rose-500/30 bg-rose-950/40 text-rose-200';
	}
	return 'border-zinc-600 bg-zinc-900/80 text-zinc-300';
}

type Props = {
	factsMarkdown: string;
};

export default function NewsEventFactsCard({ factsMarkdown }: Props) {
	const parsed: ParsedNewsEventFacts | null = parseNewsEventFactsMarkdown(factsMarkdown);
	if (!parsed) {
		return <Markdown content={factsMarkdown} />;
	}

	const linkOk = parsed.link && /^https?:\/\//i.test(parsed.link);

	return (
		<aside
			className="my-10 rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-5 shadow-sm ring-1 ring-white/5"
			aria-label="Dane wydarzenia"
		>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Dane wydarzenia</p>
					<h2 className="mt-1 text-lg font-semibold leading-snug text-zinc-100">{parsed.title}</h2>
					{parsed.source ? (
						<p className="mt-1 text-sm text-zinc-400">Źródło: {parsed.source}</p>
					) : null}
					{parsed.category ? (
						<span className="mt-2 inline-block rounded-md border border-indigo-500/25 bg-indigo-950/40 px-2 py-0.5 text-xs font-medium text-indigo-200">
							{parsed.category}
						</span>
					) : null}
				</div>
				{linkOk ? (
					<a
						href={parsed.link}
						target="_blank"
						rel="noopener noreferrer"
						className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-indigo-500/50 hover:bg-zinc-800"
					>
						Czytaj źródło
					</a>
				) : null}
			</div>

			{(parsed.sentiment || parsed.impact || parsed.timeEdge) && (
				<div className="mb-4 flex flex-wrap gap-2">
					{parsed.sentiment ? (
						<div
							className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${sentimentStyles(parsed.sentiment)}`}
						>
							<span className="text-zinc-500">Sentyment</span>{' '}
							<span className="capitalize">{parsed.sentiment}</span>
						</div>
					) : null}
					{parsed.impact ? (
						<div className="rounded-lg border border-amber-500/25 bg-amber-950/30 px-2.5 py-1.5 text-xs font-medium text-amber-100">
							<span className="text-amber-200/70">Impact</span> {parsed.impact}
						</div>
					) : null}
					{parsed.timeEdge ? (
						<div className="rounded-lg border border-sky-500/25 bg-sky-950/30 px-2.5 py-1.5 text-xs font-medium text-sky-100">
							<span className="text-sky-200/70">TimeEdge</span> {parsed.timeEdge}
						</div>
					) : null}
				</div>
			)}

			{parsed.instruments.length > 0 ? (
				<div className="mb-4">
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Instrumenty</p>
					<div className="flex flex-wrap gap-1.5">
						{parsed.instruments.map((sym) => (
							<span
								key={sym}
								className="rounded-full border border-zinc-600 bg-zinc-800/90 px-2.5 py-0.5 text-xs font-medium text-zinc-200"
							>
								{sym}
							</span>
						))}
					</div>
				</div>
			) : null}

			{parsed.impacts.length > 0 ? (
				<div className="mb-4">
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Szczegóły wpływu</p>
					<ul className="space-y-2">
						{parsed.impacts.map((row, i) => (
							<li
								key={`${row.symbol}-${i}`}
								className="rounded-lg border border-zinc-700/80 bg-zinc-950/50 px-3 py-2 text-sm"
							>
								<span className="font-semibold text-zinc-100">{row.symbol}</span>
								{row.direction ? (
									<span className="text-zinc-500"> ({row.direction})</span>
								) : null}
								<span className="text-zinc-400"> — </span>
								<span className="text-zinc-300">{row.effect}</span>
							</li>
						))}
					</ul>
				</div>
			) : null}

			{parsed.observations.length > 0 ? (
				<div>
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Obserwacja</p>
					<ul className="list-disc space-y-1.5 pl-5 text-sm text-zinc-300 marker:text-zinc-500">
						{parsed.observations.map((o, i) => (
							<li key={i}>{o}</li>
						))}
					</ul>
				</div>
			) : null}
		</aside>
	);
}
