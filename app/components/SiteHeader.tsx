'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-client';
import { t } from '@/lib/i18n';

const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });

export default function SiteHeader({ showTicker = false, initialIsLoggedIn = null }: { showTicker?: boolean; initialIsLoggedIn?: boolean | null }) {
	const lang = useLang('pl');
	const dictLang: import('@/lib/i18n').Lang = lang === 'en' ? 'en' : 'pl';
	const pathname = usePathname();

	const studyRef = useRef<HTMLLIElement | null>(null);
	const [studyOpen, setStudyOpen] = useState(false);
	const marketRef = useRef<HTMLLIElement | null>(null);
	const [marketOpen, setMarketOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(initialIsLoggedIn);

	// Szybkie heurystyczne sprawdzenie cookies po stronie klienta,
	// żeby uniknąć krótkiego „mrugnięcia” stanu wylogowanego.
	useEffect(() => {
		if (typeof document === 'undefined') return;
		const hasLegacyAuth = /(?:^|; )auth=1(?:;|$)/.test(document.cookie);
		// Uwaga: cookie sesyjne jest httpOnly, więc nie będzie widoczne w document.cookie.
		// Dlatego traktujemy tylko legacy 'auth=1' jako szybki sygnał.
		if (hasLegacyAuth && isLoggedIn == null) {
			setIsLoggedIn(true);
		}
	}, [isLoggedIn]);

	useEffect(() => {
		const onDocMouseDown = (e: MouseEvent) => {
			if (studyRef.current && !studyRef.current.contains(e.target as Node)) {
				setStudyOpen(false);
			}
			if (marketRef.current && !marketRef.current.contains(e.target as Node)) {
				setMarketOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setStudyOpen(false);
				setMarketOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocMouseDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown);
			document.removeEventListener('keydown', onKey);
		};
	}, []);

	// wykryj sesję (client-side) -> /api/auth/session
	useEffect(() => {
		let isActive = true;
		// Jeśli mamy już wiarygodny SSR-owy stan, wciąż dociągamy dla spójności,
		// ale nie nadpisujemy true na false w przypadku błędu sieci.
		(async () => {
			try {
				const res = await fetch('/api/auth/session', {
					cache: 'no-store',
					credentials: 'include',
				});
				if (!res.ok) {
					if (isActive) setIsLoggedIn((prev) => prev ?? false);
					return;
				}
				const data = await res.json().catch(() => ({}));
				if (isActive) setIsLoggedIn(Boolean((data as any)?.isLoggedIn));
			} catch {
				if (isActive) setIsLoggedIn((prev) => prev ?? false);
			}
		})();
		return () => {
			isActive = false;
		};
	}, []);

	return (
		<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-white/10">
			<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* LEWO: logo */}
				<Link href="/" className="flex items-center gap-3" aria-label={t(dictLang, 'home')}>
					<div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
						<span className="font-bold">FX</span>
					</div>
					<span className="font-semibold tracking-wide">
						Edu<span className="text-white/60">Lab</span>
					</span>
				</Link>

				{/* ŚRODEK: menu */}
				<ul className="hidden md:flex items-center gap-6 text-sm text-white/80">
					{/* Dropdown: Nauka */}
					<li ref={studyRef} className="relative">
						<button
							type="button"
							onClick={() => setStudyOpen((v) => !v)}
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1 inline-flex items-center gap-1"
							aria-haspopup="menu"
							aria-expanded={studyOpen}
						>
							{t(dictLang, 'learn_nav')}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4">
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{studyOpen && (
							<div
								role="menu"
								aria-label={t(dictLang, 'learn_nav')}
								className="absolute left-0 mt-2 w-44 rounded-lg bg-slate-900 border border-white/20 shadow-2xl shadow-black/50 p-1 z-50"
							>
								<Link
									href="/kursy"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'courses')}
								</Link>
								<Link
									href="/quizy"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'quizzes')}
								</Link>
								<Link
									href="/challenge"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'challenge')}
								</Link>
							</div>
						)}
					</li>
					{/* Dropdown: Panel rynkowy */}
					<li ref={marketRef} className="relative">
						<button
							type="button"
							onClick={() => setMarketOpen((v) => !v)}
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1 inline-flex items-center gap-1"
							aria-haspopup="menu"
							aria-expanded={marketOpen}
						>
							{t(dictLang, 'market_panel_nav')}
							<span
								className="inline-flex items-center rounded-md bg-yellow-500/20 text-yellow-300 text-[10px] leading-4 font-semibold px-1.5 py-0.5 ring-1 ring-inset ring-yellow-400/30"
								aria-label="VIP"
								title="VIP"
							>
								VIP
							</span>
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4">
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{marketOpen && (
							<div
								role="menu"
								aria-label="Panel rynkowy"
								className="absolute left-0 mt-2 w-48 rounded-lg bg-slate-900 border border-white/20 shadow-2xl shadow-black/50 p-1 z-50"
							>
								<Link
									href="/ebooki#plany"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									<span className="inline-flex items-center gap-1.5">
										{t(dictLang, 'market_panel_nav')}
										<span
											className="inline-flex items-center rounded-md bg-yellow-500/20 text-yellow-300 text-[10px] leading-4 font-semibold px-1.5 py-0.5 ring-1 ring-inset ring-yellow-400/30"
											aria-label="VIP"
											title="VIP"
										>
											VIP
										</span>
									</span>
								</Link>
								<Link
									href="/news"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'news')}
								</Link>
								<Link
									href="/symulator"
									className="block px-3 py-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'calculator')}
								</Link>
							</div>
						)}
					</li>
					<li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1">{t(dictLang, 'broker_rankings')}</Link></li>
					<li>
						<Link
							href="/redakcja"
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1"
						>
							Redakcja
						</Link>
					</li>
					<li>
						<Link
							href="/o-nas"
							className={`rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-white/50 ${pathname === '/o-nas' ? 'text-white underline underline-offset-4 decoration-white/70' : 'hover:text-white'}`}
							aria-current={pathname === '/o-nas' ? 'page' : undefined}
						>
							{t(dictLang, 'about_nav')}
						</Link>
					</li>
				</ul>

				{/* PRAWO: auth */}
				<div className="flex items-center gap-3">
					{isLoggedIn === null ? null : isLoggedIn ? (
						<>
							<Link
								href="/konto"
								className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15"
								aria-label={t(dictLang, 'account')}
							>
								<span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
								<span>{t(dictLang, 'account')}</span>
							</Link>
							<form action="/api/auth/logout" method="post">
								<button
									className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50"
								>
									{t(dictLang, 'logout')}
								</button>
							</form>
						</>
					) : (
						<>
							<Link href="/logowanie" className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50">
								{t(dictLang, 'login')}
							</Link>
							<Link href="/rejestracja" className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-white/50">
								{t(dictLang, 'join_free')}
							</Link>
						</>
					)}
					<LanguageSwitcher />
				</div>
			</nav>

			{showTicker && (
				<TickerFinnhubNoSSR
					className="border-t border-white/10"
					speedSec={42}
					symbols={[
						'OANDA:NAS100_USD',
						'OANDA:XAU_USD',
						'OANDA:WTICO_USD',
						'OANDA:BCO_USD',
						'OANDA:EUR_USD',
						'OANDA:USD_JPY',
					]}
				/>
			)}
		</header>
	);
}


