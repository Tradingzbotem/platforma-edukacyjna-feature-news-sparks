'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, BookOpen, Info, LineChart, Newspaper } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-client';
import { t } from '@/lib/i18n';

const TickerFinnhubNoSSR = dynamic(() => import('@/components/TickerFinnhub'), { ssr: false });

function stripLocalePrefix(pathname: string): string {
	const m = pathname.match(/^\/(en|pl)(?=\/|$)/);
	if (!m) return pathname;
	const rest = pathname.slice(m[0].length);
	return rest || '/';
}

function isEduSection(path: string): boolean {
	return (
		path.startsWith('/edukacja') ||
		path.startsWith('/kursy') ||
		path.startsWith('/quizy') ||
		path.startsWith('/challenge') ||
		path.startsWith('/symulator')
	);
}

function isMarketSection(path: string): boolean {
	return (
		path.startsWith('/ebooki') ||
		path.startsWith('/news') ||
		path.startsWith('/rynek')
	);
}

const navEase = 'transition-all duration-200 ease-out';
const navFocus = 'focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-0';

/** Edukacja + zwykłe linki: płaski domyślny stan, wyraźniejszy hover */
const navTriggerBase = `group inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${navFocus} ${navEase} origin-center`;
const navTriggerInactive = `${navTriggerBase} text-white/60 hover:text-white hover:bg-white/[0.07] hover:scale-[1.03] hover:shadow-[0_0_14px_rgba(255,255,255,0.07)] hover:brightness-110`;

/** Aktywna sekcja: pełna jasność tekstu, linia pod spodem, delikatny glow (bez kolorów akcentu) */
const navTriggerActive = `${navTriggerBase} text-white bg-white/[0.05] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.45),0_0_18px_rgba(255,255,255,0.06)]`;

const navLinkBase = navTriggerBase;
const navLinkInactive = navTriggerInactive;
const navLinkActive = navTriggerActive;

/** Rynek: zawsze lekko „wysunięty” (tło, obramowanie, glow); mocniejszy hover niż reszta */
const navMarketBase = `group inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${navFocus} ${navEase} origin-center bg-white/5 border border-white/12 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_22px_rgba(0,0,0,0.35)]`;
const navMarketInactive = `${navMarketBase} text-white/65 hover:text-white hover:bg-white/[0.12] hover:border-white/22 hover:scale-[1.04] hover:shadow-[0_0_26px_rgba(255,255,255,0.11),0_4px_22px_rgba(0,0,0,0.28)] hover:brightness-110`;
const navMarketActive = `${navMarketBase} text-white bg-white/[0.11] border-white/24 shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.42),0_0_22px_rgba(255,255,255,0.1),0_4px_22px_rgba(0,0,0,0.3)]`;

const navMenuItem =
	'block px-3 py-2 rounded-md text-white/75 transition-all duration-200 ease-out origin-left hover:text-white hover:bg-white/[0.08] hover:scale-[1.02] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20';

const mobileRow =
	'w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-200 ease-out origin-center';
const mobileEduInactive = `${mobileRow} border-white/10 bg-white/5 text-white/75 hover:text-white hover:bg-white/[0.08] hover:border-white/16 hover:scale-[1.02] hover:shadow-[0_0_14px_rgba(255,255,255,0.06)] hover:brightness-110`;
const mobileEduActive = `${mobileRow} border-white/18 bg-white/[0.07] text-white shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.42),0_0_16px_rgba(255,255,255,0.06)]`;
const mobileMarketInactive = `${mobileRow} border-white/12 bg-white/5 text-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:text-white hover:bg-white/[0.12] hover:border-white/22 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.28)] hover:brightness-110`;
const mobileMarketActive = `${mobileRow} border-white/22 bg-white/[0.1] text-white shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.4),0_0_22px_rgba(255,255,255,0.09),0_4px_20px_rgba(0,0,0,0.32)]`;

const mobileLinkRow =
	'flex w-full items-center gap-2 rounded-xl px-4 py-3 border transition-all duration-200 ease-out origin-left';
const mobileLinkInactive = `${mobileLinkRow} border-white/10 bg-white/5 text-white/75 hover:text-white hover:bg-white/[0.08] hover:border-white/16 hover:scale-[1.02] hover:shadow-[0_0_14px_rgba(255,255,255,0.06)] hover:brightness-110`;
const mobileLinkActive = `${mobileLinkRow} border-white/18 bg-white/[0.07] text-white shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.42),0_0_16px_rgba(255,255,255,0.06)]`;

function navIconClass(active: boolean): string {
	const base = 'h-4 w-4 shrink-0 transition-colors duration-200 ease-out';
	return active ? `${base} text-white` : `${base} text-white/60 group-hover:text-white`;
}

export default function SiteHeader({ showTicker = false, initialIsLoggedIn = null, initialIsAdmin = false }: { showTicker?: boolean; initialIsLoggedIn?: boolean | null; initialIsAdmin?: boolean }) {
	const lang = useLang('pl');
	const dictLang: import('@/lib/i18n').Lang = lang === 'en' ? 'en' : 'pl';
	const pathname = usePathname();
	const path = stripLocalePrefix(pathname);
	const eduActive = isEduSection(path);
	const marketActive = isMarketSection(path);
	const brokersActive = path.startsWith('/rankingi/brokerzy');
	const redakcjaActive = path.startsWith('/redakcja');
	const aboutActive = path.startsWith('/o-nas');

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
		<>
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
				<ul className="hidden md:flex items-center gap-6 text-sm">
					{/* Dropdown: Edukacja */}
					<li ref={studyRef} className="relative">
						<button
							type="button"
							onClick={() => setStudyOpen((v) => !v)}
							className={eduActive ? navTriggerActive : navTriggerInactive}
							aria-haspopup="menu"
							aria-expanded={studyOpen}
						>
							<BookOpen className={navIconClass(eduActive)} aria-hidden />
							{t(dictLang, 'learn_nav')}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform duration-200 ${studyOpen ? 'rotate-180' : ''}`}>
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{studyOpen && (
							<div
								role="menu"
								aria-label={t(dictLang, 'learn_nav')}
								className="absolute left-0 mt-2 min-w-[11rem] w-max max-w-[16rem] rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/60 p-1 z-50 animate-fade-in-scale"
							>
								<Link
									href="/edukacja"
									className={navMenuItem}
									role="menuitem"
									title={t(dictLang, 'edu_preview_nav_hint')}
									aria-label={`${t(dictLang, 'edu_preview_nav')}. ${t(dictLang, 'edu_preview_nav_hint')}`}
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'edu_preview_nav')}
								</Link>
								<Link
									href="/kursy"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'courses')}
								</Link>
								<Link
									href="/quizy"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'quizzes')}
								</Link>
								<Link
									href="/challenge"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'challenge')}
								</Link>
								<Link
									href="/symulator"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'calculator')}
								</Link>
								<Link
									href="/ebooki#plany"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setStudyOpen(false)}
								>
									{t(dictLang, 'investor_nav')}
								</Link>
							</div>
						)}
					</li>
					{/* Dropdown: Rynek */}
					<li ref={marketRef} className="relative">
						<button
							type="button"
							onClick={() => setMarketOpen((v) => !v)}
							className={marketActive ? navMarketActive : navMarketInactive}
							aria-haspopup="menu"
							aria-expanded={marketOpen}
						>
							<LineChart className={navIconClass(marketActive)} aria-hidden />
							{t(dictLang, 'market_nav')}
							<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform duration-200 ${marketOpen ? 'rotate-180' : ''}`}>
								<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
							</svg>
						</button>
						{marketOpen && (
							<div
								role="menu"
								aria-label={t(dictLang, 'market_nav')}
								className="absolute left-0 mt-2 w-48 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/60 p-1 z-50 animate-fade-in-scale"
							>
								<Link
									href="/news"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'news')}
								</Link>
								<Link
									href="/rynek/panel-rynkowy"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'market_panel_nav')}
								</Link>
								<Link
									href="/rynek/wykresy"
									className={navMenuItem}
									role="menuitem"
									onClick={() => setMarketOpen(false)}
								>
									{t(dictLang, 'charts_nav')}
								</Link>
							</div>
						)}
					</li>
					<li>
						<Link
							href="/rankingi/brokerzy"
							className={brokersActive ? navLinkActive : navLinkInactive}
							aria-current={brokersActive ? 'page' : undefined}
						>
							<BarChart3 className={navIconClass(brokersActive)} aria-hidden />
							{t(dictLang, 'broker_rankings')}
						</Link>
					</li>
					<li>
						<Link
							href="/redakcja"
							className={redakcjaActive ? navLinkActive : navLinkInactive}
							aria-current={redakcjaActive ? 'page' : undefined}
						>
							<Newspaper className={navIconClass(redakcjaActive)} aria-hidden />
							Redakcja
						</Link>
					</li>
					<li>
						<Link
							href="/o-nas"
							className={aboutActive ? navLinkActive : navLinkInactive}
							aria-current={aboutActive ? 'page' : undefined}
						>
							<Info className={navIconClass(aboutActive)} aria-hidden />
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

		{/* MOBILE MENU - Renderowane poza header aby uniknąć stacking context */}
		{mobileOpen && (
			<div
				className="md:hidden fixed inset-0 z-[60]"
				role="dialog"
				aria-modal="true"
				aria-label="Menu"
				onMouseDown={(e) => {
					if (e.target === e.currentTarget) setMobileOpen(false);
				}}
			>
				<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
				<div className="absolute right-0 top-0 h-full w-[min(28rem,92vw)] bg-slate-950 border-l border-white/10 shadow-2xl shadow-black/60 flex flex-col">
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
							<Link
								href="/"
								onClick={() => setMobileOpen(false)}
								className="block rounded-xl px-4 py-3 bg-white/5 hover:bg-white/[0.09] border border-white/10 text-white/90 hover:text-white transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-[0_0_14px_rgba(255,255,255,0.06)]"
							>
								{t(dictLang, 'home')}
							</Link>

							{/* Edukacja */}
							<button
								type="button"
								onClick={() => setMobileStudyOpen(v => !v)}
								className={eduActive ? mobileEduActive : mobileEduInactive}
								aria-expanded={mobileStudyOpen}
							>
								<span className="inline-flex items-center gap-2">
									<BookOpen className={`h-4 w-4 shrink-0 ${eduActive ? 'text-white' : 'text-white/60'}`} aria-hidden />
									{t(dictLang, 'learn_nav')}
								</span>
								<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out ${mobileStudyOpen ? 'rotate-180' : ''}`}>
									<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
								</svg>
							</button>
							{mobileStudyOpen && (
								<div className="ml-2 pl-2 border-l border-white/10 space-y-1">
									<Link
										href="/edukacja"
										onClick={() => setMobileOpen(false)}
										className={navMenuItem}
										title={t(dictLang, 'edu_preview_nav_hint')}
										aria-label={`${t(dictLang, 'edu_preview_nav')}. ${t(dictLang, 'edu_preview_nav_hint')}`}
									>
										{t(dictLang, 'edu_preview_nav')}
									</Link>
									<Link href="/kursy" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'courses')}
									</Link>
									<Link href="/quizy" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'quizzes')}
									</Link>
									<Link href="/challenge" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'challenge')}
									</Link>
									<Link href="/symulator" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'calculator')}
									</Link>
									<Link href="/ebooki#plany" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'investor_nav')}
									</Link>
								</div>
							)}

							{/* Rynek */}
							<button
								type="button"
								onClick={() => setMobileMarketOpen(v => !v)}
								className={marketActive ? mobileMarketActive : mobileMarketInactive}
								aria-expanded={mobileMarketOpen}
							>
								<span className="inline-flex items-center gap-2">
									<LineChart className={`h-4 w-4 shrink-0 ${marketActive ? 'text-white' : 'text-white/60'}`} aria-hidden />
									{t(dictLang, 'market_nav')}
								</span>
								<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out ${mobileMarketOpen ? 'rotate-180' : ''}`}>
									<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
								</svg>
							</button>
							{mobileMarketOpen && (
								<div className="ml-2 pl-2 border-l border-white/10 space-y-1">
									<Link href="/news" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'news')}
									</Link>
									<Link href="/rynek/panel-rynkowy" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'market_panel_nav')}
									</Link>
									<Link href="/rynek/wykresy" onClick={() => setMobileOpen(false)} className={navMenuItem}>
										{t(dictLang, 'charts_nav')}
									</Link>
								</div>
							)}

							<Link
								href="/rankingi/brokerzy"
								onClick={() => setMobileOpen(false)}
								className={brokersActive ? mobileLinkActive : mobileLinkInactive}
							>
								<BarChart3 className={`h-4 w-4 shrink-0 ${brokersActive ? 'text-white' : 'text-white/60'}`} aria-hidden />
								{t(dictLang, 'broker_rankings')}
							</Link>
							<Link
								href="/redakcja"
								onClick={() => setMobileOpen(false)}
								className={redakcjaActive ? mobileLinkActive : mobileLinkInactive}
							>
								<Newspaper className={`h-4 w-4 shrink-0 ${redakcjaActive ? 'text-white' : 'text-white/60'}`} aria-hidden />
								Redakcja
							</Link>
							<Link
								href="/o-nas"
								onClick={() => setMobileOpen(false)}
								className={aboutActive ? mobileLinkActive : mobileLinkInactive}
							>
								<Info className={`h-4 w-4 shrink-0 ${aboutActive ? 'text-white' : 'text-white/60'}`} aria-hidden />
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
		</>
	);
}


