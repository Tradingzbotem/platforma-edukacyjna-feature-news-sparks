import React from "react";
import ArticlesFeedClient from "@/components/redakcja/ArticlesFeedClient";

export const dynamic = "force-static";

export default async function RedakcjaPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<header className="relative mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Redakcja FX-EDU</h1>
				<div className="mt-3 space-y-3 text-zinc-300">
					<p>
						FXEDU to platforma edukacyjna o rynkach Forex i CFD — dla osób,
						które chcą lepiej rozumieć mechanizmy rynku i podejmować bardziej
						świadome decyzje. Znajdziesz tu ścieżki nauki od podstaw po poziom
						zaawansowany, praktyczne materiały, quizy, checklisty oraz narzędzia,
						które prowadzą przez analizę krok po kroku.
					</p>
					<p>
						Treści powstają w oparciu o doświadczenie praktyków rynku. Zamiast
						zalewać newsami, porządkujemy informacje i nadajemy im kontekst —
						odpowiadamy na: „co się wydarzyło”, „dlaczego to ma znaczenie” oraz
						„jakie scenariusze warto rozważyć”.
					</p>
					<div>
						<p className="text-sm font-semibold text-zinc-200 mb-2">W tej sekcji znajdziesz:</p>
						<ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
							<li>codzienne komentarze i przeglądy rynkowe (USA, Europa, Forex, surowce, spółki),</li>
							<li>wyjaśnienia kontekstu i wnioski — zamiast przypadkowych newsów,</li>
							<li>propozycje scenariuszy oraz wskazówki, jak je monitorować,</li>
							<li>materiały edukacyjne o wyborze brokera i infrastrukturze do nauki/handlu.</li>
						</ul>
					</div>
					<p className="text-sm text-zinc-400">
						Wybór brokera i narzędzi omawiamy edukacyjnie i porównawczo — przez
						kryteria, które realnie wpływają na komfort i bezpieczeństwo (m.in.
						regulacje, koszty, jakość platform, egzekucja zleceń, obsługa, narzędzia).
						Celem jest dopasowanie rozwiązań do Twojego stylu (np. day trading, swing, skalping),
						a nie marketingowych haseł.
					</p>
					<p className="text-xs text-zinc-500">
						 Wszystkie materiały mają charakter edukacyjny i nie stanowią porady inwestycyjnej.
						Handel instrumentami lewarowanymi (Forex/CFD) wiąże się z ryzykiem utraty kapitału.
					</p>
				</div>
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


