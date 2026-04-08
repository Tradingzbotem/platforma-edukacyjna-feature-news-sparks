export default function WykresyChartsFallback() {
	return (
		<main id="content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-20 animate-pulse">
			<div className="h-6 w-24 rounded-full bg-white/10 mb-4" />
			<div className="h-10 w-64 max-w-full rounded-lg bg-white/10 mb-3" />
			<div className="h-4 max-w-xl rounded bg-white/5 mb-10" />
			<div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 mb-10">
				<div className="h-9 max-w-sm rounded-full bg-white/10 mb-5" />
				<div className="flex gap-2 mb-5">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-8 w-20 shrink-0 rounded-full bg-white/10" />
					))}
				</div>
				<div className="h-40 rounded-xl bg-white/[0.06]" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<div className="lg:col-span-8 h-[420px] md:h-[640px] rounded-3xl bg-white/[0.05] border border-white/10" />
				<div className="lg:col-span-4 min-h-72 rounded-3xl bg-white/[0.05] border border-white/10" />
			</div>
		</main>
	);
}
