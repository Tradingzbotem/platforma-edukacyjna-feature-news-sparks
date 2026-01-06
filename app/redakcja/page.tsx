import React from "react";
import ArticlesFeedClient from "@/components/redakcja/ArticlesFeedClient";

export const dynamic = "force-static";

export default async function RedakcjaPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<header className="relative mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Redakcja FX-EDU</h1>
				<p className="mt-2 text-zinc-400 max-w-2xl">
					Codzienne artykuły o rynkach: USA, Europa, Forex, Surowce, Spółki. Edukacyjnie — bez porad inwestycyjnych.
				</p>
			</header>

			<div className="grid grid-cols-12 gap-6">
				<main className="col-span-12 lg:col-span-8">
					<ArticlesFeedClient />
				</main>

				<aside className="hidden lg:block lg:col-span-4">
					<div className="sticky top-24 space-y-4">
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
							<div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Reklama / Partner</div>
							<div className="h-40 rounded bg-zinc-900/60 border border-zinc-800" />
						</div>
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
							<div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Miejsce na promocję pakietów</div>
							<div className="h-40 rounded bg-zinc-900/60 border border-zinc-800" />
						</div>
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
							<div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Newsletter / Powiadomienia</div>
							<div className="h-40 rounded bg-zinc-900/60 border border-zinc-800" />
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}


