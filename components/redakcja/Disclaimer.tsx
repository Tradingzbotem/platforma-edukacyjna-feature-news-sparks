import React from "react";

export default function Disclaimer() {
	return (
		<div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
			<div className="flex items-center justify-between">
				<p className="font-semibold tracking-wide text-zinc-200">
					FX•EDU — materiał edukacyjny
				</p>
				<span className="text-xs text-zinc-500">Edukacja, nie porada</span>
			</div>
			<p className="mt-2 leading-6">
				Ten materiał ma charakter wyłącznie edukacyjny i informacyjny. Nie stanowi
				rekomendacji inwestycyjnej, porady finansowej ani oferty. Decyzje
				inwestycyjne podejmujesz na własną odpowiedzialność.
			</p>
		</div>
	);
}


