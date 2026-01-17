import React from "react";
import Link from "next/link";
import ArticlesFeedClientV2 from "./components/ArticlesFeedClientV2";
import InfoTicker from "./components/InfoTicker";

export const dynamic = "force-static";

export default async function RedakcjaPage() {
	const showPartnerBanner = false;
	const showInfoTicker = false;
	const tickerMessages = [
		"FX-EDU: nowe analizy i komentarze rynkowe codziennie rano",
		"Pamiętaj: treści mają charakter edukacyjny – to nie jest porada inwestycyjna",
		"Dodaliśmy przegląd breadth dla S&P 500 — sprawdź sekcję najnowszych publikacji",
	];
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<header className="relative mb-8">
				<div className="mb-6 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
						<span className="tracking-wide">REDAKCJA</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
						Redakcja FX-EDU
					</h1>
					<div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 shadow-sm mx-auto max-w-4xl">
						<div className="text-lg md:text-xl text-white/80 leading-relaxed space-y-4 text-center">
							<p>Bieżące wydarzenia ze świata rynków finansowych — z kontekstem, bez szumu informacyjnego.</p>
							<p>
								Publikujemy komentarze i analizy dotyczące tego, co aktualnie dzieje się na rynkach: makroekonomii, giełd, Forexu, surowców i spółek. Skupiamy się na informacjach, które realnie wpływają na zmienność i warunki rynkowe.
							</p>
							<p className="text-base text-white/70">
								Nie przewidujemy rynku ani nie wskazujemy decyzji — pomagamy zrozumieć kontekst wydarzeń.
							</p>
						</div>
					</div>
					<div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 mx-auto max-w-4xl">
						<p className="text-sm text-amber-200 text-center">
							Treści mają charakter informacyjno-edukacyjny i nie stanowią porady inwestycyjnej. Inwestowanie na rynkach finansowych, w tym Forex i CFD, wiąże się z ryzykiem utraty kapitału.
						</p>
					</div>
				</div>
			</header>

			{showInfoTicker && (
				<div className="mb-6">
					<InfoTicker messages={tickerMessages} speed={28} />
				</div>
			)}

			<div className="grid grid-cols-12 gap-6">
				<main className="col-span-12 lg:col-span-8">
					<h2 className="mb-3 text-sm font-semibold text-zinc-200">Najnowsze publikacje</h2>
					<ArticlesFeedClientV2 />
				</main>

				<aside className="hidden lg:block lg:col-span-4">
					<div className="sticky top-24 space-y-4">
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
							<div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Reklama / Partner</div>
							{showPartnerBanner ? (
								<a href="https://abfpay.com/" target="_blank" rel="noopener noreferrer" aria-label="ABF Pay — przejdź do strony partnera">
									<img
										src="/abfpay-banner.svg"
										alt="ABF Pay — payments without borders"
										className="w-full h-auto rounded-md"
										loading="lazy"
									/>
								</a>
							) : (
								<div className="h-40 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-center">
									<span className="text-xs text-zinc-400">Miejsce na Twoją reklamę</span>
								</div>
							)}
						</div>
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-0 overflow-hidden">
							<Link href="/ebooki#plany" aria-label="Przejdź do planów — zakup pakietu" className="block cursor-pointer">
								<img
									src="/plans-banner.svg"
									alt="Baner planów: Starter, Pro, Elite"
									className="w-full h-auto block"
									width={285}
									height={160}
									loading="lazy"
								/>
							</Link>
						</div>
						<div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-0 overflow-hidden">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 285 160"
								role="img"
								aria-label="Baner: Darmowe szkolenie 19.02.2026 Warszawa"
								className="w-full h-auto block"
							>
								<defs>
									<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
										<stop offset="0" stopColor="#070A12" />
										<stop offset="1" stopColor="#0B1433" />
									</linearGradient>

									<linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
										<stop offset="0" stopColor="#E8C16A" />
										<stop offset="1" stopColor="#B8892B" />
									</linearGradient>

									<linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
										<stop offset="0" stopColor="rgba(255,255,255,0.06)" />
										<stop offset="1" stopColor="rgba(255,255,255,0.02)" />
									</linearGradient>

									<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
										<feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.45" />
									</filter>

									<pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
										<path d="M22 0H0V22" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
									</pattern>
								</defs>

								<rect x="0" y="0" width="285" height="160" rx="16" fill="url(#bg)" />
								<rect x="0" y="0" width="285" height="160" rx="16" fill="url(#grid)" />

								<rect x="8" y="8" width="269" height="144" rx="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" />

								<g transform="translate(18,18)" filter="url(#shadow)">
									<rect x="0" y="0" width="54" height="54" rx="14" fill="url(#glass)" stroke="rgba(255,255,255,0.10)" />
									<rect x="14" y="16" width="26" height="24" rx="5" fill="none" stroke="rgba(232,193,106,0.90)" strokeWidth="2" />
									<path d="M14 22H40" stroke="rgba(232,193,106,0.90)" strokeWidth="2" strokeLinecap="round" />
									<path d="M20 14V19M34 14V19" stroke="rgba(232,193,106,0.90)" strokeWidth="2" strokeLinecap="round" />
									<circle cx="22" cy="30" r="1.7" fill="rgba(232,193,106,0.90)" />
									<circle cx="28" cy="30" r="1.7" fill="rgba(232,193,106,0.90)" />
									<circle cx="34" cy="30" r="1.7" fill="rgba(232,193,106,0.90)" />
									<circle cx="22" cy="36" r="1.7" fill="rgba(232,193,106,0.90)" />
									<circle cx="28" cy="36" r="1.7" fill="rgba(232,193,106,0.90)" />
								</g>

								<g transform="translate(84,18)">
									<rect x="0" y="0" width="92" height="20" rx="10" fill="rgba(232,193,106,0.16)" stroke="rgba(232,193,106,0.35)" />
									<text
										x="46"
										y="14"
										textAnchor="middle"
										fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
										fontSize="10"
										fontWeight="900"
										fill="#E8C16A"
									>
										DARMOWE SZKOLENIE
									</text>
								</g>

								<text
									x="84"
									y="58"
									fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
									fontSize="18"
									fontWeight="900"
									fill="#E5E7EB"
								>
									19.02.2026
								</text>

								<g transform="translate(84,66)">
									<path
										d="M10 4c-3.2 0-5.8 2.5-5.8 5.7 0 4.1 5.8 10.7 5.8 10.7s5.8-6.6 5.8-10.7C15.8 6.5 13.2 4 10 4z"
										fill="none"
										stroke="rgba(255,255,255,0.55)"
										strokeWidth="1.6"
									/>
									<circle cx="10" cy="9.7" r="1.7" fill="rgba(255,255,255,0.55)" />
									<text
										x="22"
										y="14"
										fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
										fontSize="12"
										fontWeight="800"
										fill="#AAB2C5"
									>
										Warszawa
									</text>
								</g>

								<text
									x="18"
									y="108"
									fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
									fontSize="11.2"
									fontWeight="800"
									fill="#E5E7EB"
								>
									Najważniejsze wydarzenia i wpływ na giełdę
								</text>
								<text
									x="18"
									y="126"
									fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
									fontSize="10.2"
									fontWeight="650"
									fill="#AAB2C5"
								>
									Ostatnie miesiące • makro • sentyment • zmienność
								</text>


							</svg>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}


