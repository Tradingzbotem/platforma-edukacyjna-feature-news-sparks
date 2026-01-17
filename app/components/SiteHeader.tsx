'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-client';
import { t } from '@/lib/i18n';

const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });

export default function SiteHeader({ showTicker = false, initialIsLoggedIn = null, initialIsAdmin = false }: { showTicker?: boolean; initialIsLoggedIn?: boolean | null; initialIsAdmin?: boolean }) {
	const lang = useLang('pl');
	const dictLang: import('@/lib/i18n').Lang = lang === 'en' ? 'en' : 'pl';
	const pathname = usePathname();

	const studyRef = useRef<HTMLLIElement | null>(null);
	const [studyOpen, setStudyOpen] = useState(false);
	const marketRef = useRef<HTMLLIElement | null>(null);
	const [marketOpen, setMarketOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileStudyOpen, setMobileStudyOpen] = useState(false);
	const [mobileMarketOpen, setMobileMarketOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(initialIsLoggedIn);
	const [isAdmin] = useState<boolean>(initialIsAdmin);

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
				setMobileOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocMouseDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown);
			document.removeEventListener('keydown', onKey);
		};
	}, []);

	// Na mobile: zamknij panel po zmianie ścieżki
	useEffect(() => {
		setMobileOpen(false);
		setMobileStudyOpen(false);
		setMobileMarketOpen(false);
	}, [pathname]);

	// Na mobile: blokuj scroll tła gdy panel jest otwarty
	useEffect(() => {
		if (!mobileOpen) return;
		const prevBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevBodyOverflow;
		};
	}, [mobileOpen]);

	// wykryj sesję (client-side) -> /api/auth/session
	// Odświeżaj przy mount i przy zmianie pathname (np. po logowaniu)
	const checkSessionRef = useRef<boolean>(true);
	const checkSession = async () => {
		if (!checkSessionRef.current) return;
		try {
			const res = await fetch('/api/auth/session', {
				cache: 'no-store',
				credentials: 'include',
			});
			if (!checkSessionRef.current) return;
			if (!res.ok) {
				setIsLoggedIn((prev) => prev ?? false);
				return;
			}
			const data = await res.json().catch(() => ({}));
			if (checkSessionRef.current) {
				setIsLoggedIn(Boolean((data as any)?.isLoggedIn));
			}
		} catch {
			if (checkSessionRef.current) {
				setIsLoggedIn((prev) => prev ?? false);
			}
		}
	};

	useEffect(() => {
		checkSessionRef.current = true;
		// Jeśli mamy już wiarygodny SSR-owy stan, wciąż dociągamy dla spójności,
		// ale nie nadpisujemy true na false w przypadku błędu sieci.
		checkSession();
		return () => {
			checkSessionRef.current = false;
		};
	}, []);

	// Odświeżaj sesję przy zmianie pathname (np. po logowaniu/wylogowaniu)
	useEffect(() => {
		checkSessionRef.current = true;
		checkSession();
		return () => {
			checkSessionRef.current = false;
		};
	}, [pathname]);

	return (
		<header className="sticky top-0 z-40 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80 bg-slate-900/70 border-b border-white/10 shadow-lg shadow-black/20">
			<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
				{/* LEWO: logo */}
				<Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 min-w-0" aria-label={t(dictLang, 'home')}>
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-white/20 transition-all duration-200">
						<span className="font-bold text-white">FX</span>
					</div>
					<span className="font-semibold tracking-wide text-white group-hover:text-white transition-colors truncate">
						Edu<span className="text-white/60 group-hover:text-white/70 transition-colors">Lab</span>
					</span>
				</Link>

				{/* ŚRODEK: menu */}
				<ul className="hidden md:flex items-center gap-6 text-sm text-white/80">
					{/* Dropdown: Nauka */}
					<li ref={studyRef} className="relative">
						<button
							type="button"
							onClick={() => setStudyOpen((v) => !v)}
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-md px-2 py-1 inline-flex items-center gap-1 transition-all duration-200 hover:bg-white/5"
							aria-haspopup="menu"
							aria-expanded={studyOpen}
						>
							{t(dictLang, 'learn_nav')}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 transition-transform duration-200 ${studyOpen ? 'rotate-180' : ''}`}>
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{studyOpen && (
							<div
								role="menu"
								aria-label={t(dictLang, 'learn_nav')}
								className="absolute left-0 mt-2 w-44 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/60 p-1 z-50 animate-fade-in-scale"
							>
								<Link
									href="/kursy"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'courses')}
								</Link>
								<Link
									href="/quizy"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'quizzes')}
								</Link>
								<Link
									href="/challenge"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
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
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-md px-2 py-1 inline-flex items-center gap-1 transition-all duration-200 hover:bg-white/5"
							aria-haspopup="menu"
							aria-expanded={marketOpen}
						>
							{t(dictLang, 'market_panel_nav')}
							<span
								className="inline-flex items-center rounded-md bg-gradient-to-r from-yellow-500/25 to-yellow-500/15 text-yellow-300 text-[10px] leading-4 font-semibold px-1.5 py-0.5 ring-1 ring-inset ring-yellow-400/40 shadow-sm"
								aria-label="VIP"
								title="VIP"
							>
								VIP
							</span>
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 transition-transform duration-200 ${marketOpen ? 'rotate-180' : ''}`}>
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{marketOpen && (
							<div
								role="menu"
								aria-label="Panel rynkowy"
								className="absolute left-0 mt-2 w-48 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/60 p-1 z-50 animate-fade-in-scale"
							>
								<Link
									href="/ebooki#plany"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									<span className="inline-flex items-center gap-1.5">
										{t(dictLang, 'market_panel_nav')}
										<span
											className="inline-flex items-center rounded-md bg-gradient-to-r from-yellow-500/25 to-yellow-500/15 text-yellow-300 text-[10px] leading-4 font-semibold px-1.5 py-0.5 ring-1 ring-inset ring-yellow-400/40"
											aria-label="VIP"
											title="VIP"
										>
											VIP
										</span>
									</span>
								</Link>
								<Link
									href="/news"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'news')}
								</Link>
								<Link
									href="/symulator"
									className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors duration-150"
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'calculator')}
								</Link>
							</div>
						)}
					</li>
					<li><Link href="/rankingi/brokerzy" className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-md px-2 py-1 transition-all duration-200 hover:bg-white/5">{t(dictLang, 'broker_rankings')}</Link></li>
					<li>
						<Link
							href="/redakcja"
							className="hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-md px-2 py-1 transition-all duration-200 hover:bg-white/5"
						>
							Redakcja
						</Link>
					</li>
					<li>
						<Link
							href="/o-nas"
							className={`rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 ${pathname === '/o-nas' ? 'text-white underline underline-offset-4 decoration-emerald-400/70 bg-white/5' : 'hover:text-white hover:bg-white/5'}`}
							aria-current={pathname === '/o-nas' ? 'page' : undefined}
						>
							{t(dictLang, 'about_nav')}
						</Link>
					</li>
				</ul>

				{/* PRAWO: auth */}
				<div className="flex items-center gap-3 shrink-0">
					<button
						type="button"
						className="md:hidden inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 w-10 h-10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
						aria-label="Menu"
						aria-haspopup="dialog"
						aria-expanded={mobileOpen}
						onClick={() => setMobileOpen(true)}
					>
						<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					{isLoggedIn === null ? null : isLoggedIn ? (
						<>
							<Link
								href="/client"
								className="hidden md:inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15 hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
								aria-label={t(dictLang, 'account')}
							>
								<span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
								<span>{t(dictLang, 'account')}</span>
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="hidden md:inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/15 px-3 py-1.5 text-sm hover:bg-white/15 hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
									aria-label="Admin"
								>
									<span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
									<span>Admin</span>
								</Link>
							)}
							<form action="/api/auth/logout" method="post">
								<button
									className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-sm hover:shadow-md"
								>
									{t(dictLang, 'logout')}
								</button>
							</form>
						</>
					) : (
						<>
							<Link href="/logowanie" className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-sm hover:shadow-md">
								{t(dictLang, 'login')}
							</Link>
							<Link href="/rejestracja" className="hidden md:inline-flex px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-md hover:shadow-lg">
								{t(dictLang, 'join_free')}
							</Link>
						</>
					)}
					<LanguageSwitcher className="hidden sm:block" />
				</div>
			</nav>

			{/* MOBILE MENU */}
			{mobileOpen && (
				<div
					className="md:hidden fixed inset-0 z-50"
					role="dialog"
					aria-modal="true"
					aria-label="Menu"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) setMobileOpen(false);
					}}
				>
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
					<div className="absolute right-0 top-0 h-full w-[min(22rem,85vw)] bg-slate-950 border-l border-white/10 shadow-2xl shadow-black/60 flex flex-col">
						<div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center">
									<span className="font-bold text-white">FX</span>
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-white truncate">EduLab</div>
									<div className="text-xs text-white/60 truncate">{t(dictLang, 'home')}</div>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 w-10 h-10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
								aria-label="Zamknij"
							>
								<span aria-hidden className="text-lg leading-none">✕</span>
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-4">
							<div className="space-y-2">
								<Link href="/" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
									{t(dictLang, 'home')}
								</Link>

								{/* Nauka */}
								<button
									type="button"
									onClick={() => setMobileStudyOpen(v => !v)}
									className="w-full flex items-center justify-between rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white"
									aria-expanded={mobileStudyOpen}
								>
									<span>{t(dictLang, 'learn_nav')}</span>
									<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 transition-transform ${mobileStudyOpen ? 'rotate-180' : ''}`}>
										<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
									</svg>
								</button>
								{mobileStudyOpen && (
									<div className="ml-2 pl-2 border-l border-white/10 space-y-1">
										<Link href="/kursy" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'courses')}
										</Link>
										<Link href="/quizy" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'quizzes')}
										</Link>
										<Link href="/challenge" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'challenge')}
										</Link>
									</div>
								)}

								{/* Panel rynkowy */}
								<button
									type="button"
									onClick={() => setMobileMarketOpen(v => !v)}
									className="w-full flex items-center justify-between rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white"
									aria-expanded={mobileMarketOpen}
								>
									<span className="inline-flex items-center gap-2">
										{t(dictLang, 'market_panel_nav')}
										<span className="inline-flex items-center rounded-md bg-gradient-to-r from-yellow-500/25 to-yellow-500/15 text-yellow-300 text-[10px] leading-4 font-semibold px-1.5 py-0.5 ring-1 ring-inset ring-yellow-400/40">
											VIP
										</span>
									</span>
									<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 transition-transform ${mobileMarketOpen ? 'rotate-180' : ''}`}>
										<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
									</svg>
								</button>
								{mobileMarketOpen && (
									<div className="ml-2 pl-2 border-l border-white/10 space-y-1">
										<Link href="/ebooki#plany" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'market_panel_nav')} <span className="text-yellow-300">VIP</span>
										</Link>
										<Link href="/news" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'news')}
										</Link>
										<Link href="/symulator" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-white/85 hover:text-white hover:bg-white/5">
											{t(dictLang, 'calculator')}
										</Link>
									</div>
								)}

								<Link href="/rankingi/brokerzy" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90">
									{t(dictLang, 'broker_rankings')}
								</Link>
								<Link href="/redakcja" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90">
									Redakcja
								</Link>
								<Link href="/o-nas" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90">
									{t(dictLang, 'about_nav')}
								</Link>
							</div>

							<div className="mt-6 pt-4 border-t border-white/10">
								{isLoggedIn === null ? null : isLoggedIn ? (
									<div className="space-y-2">
										<Link
											href="/client"
											onClick={() => setMobileOpen(false)}
											className="block rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white"
										>
											{t(dictLang, 'account')}
										</Link>
										{isAdmin && (
											<Link
												href="/admin"
												onClick={() => setMobileOpen(false)}
												className="block rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white"
											>
												Admin
											</Link>
										)}
										<form action="/api/auth/logout" method="post">
											<button
												type="submit"
												className="w-full rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-left focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
											>
												{t(dictLang, 'logout')}
											</button>
										</form>
									</div>
								) : (
									<div className="space-y-2">
										<Link
											href="/logowanie"
											onClick={() => setMobileOpen(false)}
											className="block rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white"
										>
											{t(dictLang, 'login')}
										</Link>
										<Link
											href="/rejestracja"
											onClick={() => setMobileOpen(false)}
											className="block rounded-xl px-4 py-3 bg-white text-slate-900 font-semibold hover:opacity-90 border border-white/10"
										>
											{t(dictLang, 'join_free')}
										</Link>
									</div>
								)}
								<div className="mt-4">
									<LanguageSwitcher className="w-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

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


