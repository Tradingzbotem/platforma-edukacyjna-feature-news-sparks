'use client';

import React from "react";

export default function InfoTicker({
	messages,
	speedSec = 40,
	className = "",
}: {
	messages: string[];
	speedSec?: number; // seconds for one full scroll
	className?: string;
}) {
	const items = messages.map((msg, i) => (
		<div key={i} className="flex items-center gap-2 px-3 py-2 border-r border-white/10">
			<span className="text-xs uppercase text-white/60">info dnia</span>
			<span className="text-sm text-white/90">{msg}</span>
		</div>
	));

	return (
		<div className={`w-full bg-black/20 rounded-lg border border-white/10 ${className || ""}`}>
			<div className="mx-auto max-w-7xl overflow-hidden relative">
				<div
					className="inline-flex will-change-transform"
					style={{ animation: `tickerScroll ${speedSec}s linear infinite` }}
				>
					{items}
					{items}
				</div>
				<div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
			</div>

			<style jsx>{`
				@keyframes tickerScroll {
					0% { transform: translateX(0%); }
					100% { transform: translateX(-50%); }
				}
			`}</style>
		</div>
	);
}



