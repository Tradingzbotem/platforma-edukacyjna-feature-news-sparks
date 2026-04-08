'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
	Activity,
	BarChart3,
	BarChartHorizontalBig,
	Gauge,
	Globe2,
	Landmark,
	LayoutGrid,
	Percent,
	ShieldAlert,
	TrendingUp,
} from 'lucide-react';

const FINNHUB_SYMBOLS = {
	US100: 'OANDA:NAS100_USD',
	DE40: 'OANDA:DE30_EUR',
	XAUUSD: 'OANDA:XAU_USD',
	WTI: 'OANDA:WTICO_USD',
	EURUSD: 'OANDA:EUR_USD',
} as const;

type AssetKey = keyof typeof FINNHUB_SYMBOLS;

type Quote = { price?: number; changePct?: number };

const ASSETS: Array<{
	key: AssetKey;
	label: string;
	blurb: string;
	watch: string[];
}> = [
	{
		key: 'US100',
		label: 'US100',
		blurb: 'Technologiczny nurt USA — wrażliwy na stopy, zyski i nastroje ryzyka. Często „prowadzi” sesję dla innych klas aktywów.',
		watch: ['Rentowności i komunikaty Fed', 'Publikacje inflacyjne z USA', 'Szerokość ruchu w obrębie indeksu'],
	},
	{
		key: 'DE40',
		label: 'DE40',
		blurb: 'Niemiecki blue chip — most między Europą a globalnym cyklem. Silnie zależny od nastroju wobec wzrostu i warunków finansowania.',
		watch: ['Nastroje wobec recesji w strefie euro', 'Spready obligacji i polityka ECB', 'Impulsy z USA na otwarciu'],
	},
	{
		key: 'XAUUSD',
		label: 'XAUUSD',
		blurb: 'Złoto w parze z USD — często reaguje na realne stopy, dolara i epizody „ucieczki do jakości”.',
		watch: ['Dolar indeksowy (szerszy kontekst FX)', 'Oczekiwania co do ścieżki stóp', 'Skoki zmienności na rynkach'],
	},
	{
		key: 'WTI',
		label: 'WTI',
		blurb: 'Ropa amerykańska — łączy popyt cykliczny, zapasy i geopolitykę. Spread do innych gatunków bywa podpowiedzią o lokalnych zaburzeniach.',
		watch: ['Dane zapasów i produkcji', 'Napięcia w regionach eksportu', 'Sentyment do ryzyka na indeksach'],
	},
	{
		key: 'EURUSD',
		label: 'EURUSD',
		blurb: 'Para bazowa FX — suma względnych oczekiwań stóp, wzrostu i ryzyka politycznego po obu stronach Atlantyku.',
		watch: ['Różnica ścieżek Fed vs ECB', 'Dane makro z USA i strefy euro', 'Okresy skrajnej zmienności (event risk)'],
	},
];

const KEY_EVENT_ANCHOR_ID = 'kluczowe-wydarzenie';

/** Kontekst wydarzenia (edukacyjny; okresowo aktualizować redakcyjnie). */
const HERO_KEY_EVENT = {
	headline: 'Konflikt USA–Iran eskaluje',
	/** Jedno zdanie pod pasek pod hero */
	summary:
		'Napięcie w Zatoce Perskiej podbija niepewność co do ropy i dolara — uczestnicy rynku szybciej wyceniają scenariusze „gorsze od bazy”.',
	happening: [
		'Ostrzejsza retoryka i incydenty w regionie Zatoki Perskiej.',
		'Wzrost niepewności co do przepływu ropy i szlaków morskich.',
		'Rynek szybciej wycenia scenariusze gorsze od dotychczasowej bazy.',
	],
	marketSees: [
		'Krótkoterminowa premia ryzyka na surowcu energetycznym.',
		'Częstsze wzmocnienie dolara przy napięciu geopolitycznym.',
		'Indeksy akcji bywają w pierwszej fazie pod presją; złoto bywa nierówne.',
	],
	watchFor: [
		'Komunikaty władz USA, Iranu i sojuszników.',
		'Notowania ropy (WTI/Brent) oraz doniesienia o ruchu tankowców.',
		'Zmienność (np. VIX) i zachowanie obligacji.',
	],
	/** Jedna linia = aktyw + kierunek (poglądowo). */
	potentialLines: ['WTI ↑', 'USD ↑', 'US100 ↓', 'XAUUSD ↑ / mieszany', 'EURUSD ↓'],
};

/** Krótkie schematy: wydarzenie → kontekst → ruch (materiał poglądowy). */
const MARKET_REACTIONS = [
	{
		icon: BarChartHorizontalBig,
		event: 'Inflacja CPI (USA)',
		before: ['Mediana prognoz jest znana przed publikacją.', 'Duża część scenariusza siedzi już w cenach.', 'Sesja czeka na liczby.'],
		whatHappened: 'Odczyt odbiegł od konsensusu i zmienił obraz inflacji.',
		reaction: 'US100: +1,8% w trakcie sesji',
	},
	{
		icon: Landmark,
		event: 'Komentarz Fed',
		before: ['Stopa jest znana z komunikatu.', 'Rynek słucha konferencji.', 'Ton bywa ważniejszy niż sama tabela.'],
		whatHappened: 'Przewodniczący sugeruje dłużej wysokie stopy.',
		reaction: 'EURUSD: wyraźny spadek w godzinach po konferencji',
	},
	{
		icon: Percent,
		event: 'Wyższe rentowności obligacji',
		before: ['Rentowności obligacji w ciasnym zakresie.', 'Indeks niesie nastrój z poprzednich sesji.', 'Brak oczekiwania na szok z rynku długu.'],
		whatHappened: 'Nagły skok yieldów po aukcji lub zaskakujących danych.',
		reaction: 'US100: ok. −0,9% tego dnia',
	},
	{
		icon: Globe2,
		event: 'Napięcia geopolityczne',
		before: ['Cena ropy w stabilnym odcinku.', 'Brak świeżego ryzyka na szlakach.', 'Rynek ma wpisany status quo.'],
		whatHappened: 'Nagłówki o eskalacji w rejonie produkcji lub transportu.',
		reaction: 'WTI: +2,1% w kilka godzin',
	},
	{
		icon: Gauge,
		event: 'Inflacja (strefa euro)',
		before: ['EUR ustawiony przed odczytem na konsensus.', 'Dolar ma własny tor z USA.', 'Złoto w parze z USD.'],
		whatHappened: 'Dane + mocniejszy dolar w tym samym oknie.',
		reaction: 'XAUUSD: −1,2% po umocnieniu USD',
	},
];

const DRIVERS = [
	{
		icon: Activity,
		title: 'Inflacja i stopy',
		text: 'Odczyty CPI/PCE i konferencje banków centralnych ustawiają dyskont i nastroje. Rynek często reaguje na to, co zmienia się w oczekiwanej ścieżce stóp — nie tylko na sam nagłówek.',
	},
	{
		icon: TrendingUp,
		title: 'Siła USD',
		text: 'Dolar waży na surowcach denominowanych w USD i na parach FX. Wzrost dolara często zbiega się z droższym finansowaniem i innym zachowaniem aktywów ryzyka.',
	},
	{
		icon: Globe2,
		title: 'Geopolityka',
		text: 'Konflikty, sankcje i niepewność polityczna podbijają premie ryzyka. Efekty bywają niesymetryczne: część klas aktywów wyraźnie się wyróżnia, inne tylko chwilowo.',
	},
	{
		icon: BarChart3,
		title: 'Ropa i surowce',
		text: 'Energia przenika do kosztów i inflacji. Oprócz geopolityki ważne są zapasy, popyt sezonowy i oczekiwania wzrostu globalnego.',
	},
	{
		icon: LayoutGrid,
		title: 'Sentyment na indeksach',
		text: 'Trendy na głównych indeksach pokazują, czy rynek „kupuje” ryzyko. Korelacje z obligacjami i FX zmieniają się wraz z fazą cyklu.',
	},
];

function fmtPrice(key: AssetKey, price: number): string {
	const decimals = key === 'XAUUSD' ? 2 : key === 'EURUSD' ? 5 : 2;
	return price.toLocaleString('pl-PL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(p: number): string {
	const sign = p > 0 ? '+' : '';
	return `${sign}${p.toFixed(2)}%`;
}

/** Pełny brief: ta sama trasa co podgląd; widok zależy od flagi `brief_decision` na serwerze. */
const BRIEF_FULL_HREF = '/rynek/brief-decyzyjny-mockup';

export type PublicRynekPanelPageProps = {
	hasBriefDecisionAccess?: boolean;
};

export default function PublicRynekPanelPage({ hasBriefDecisionAccess = false }: PublicRynekPanelPageProps) {
	const [quotes, setQuotes] = useState<Partial<Record<AssetKey, Quote>>>({});
	const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

	const symbolList = useMemo(() => Object.values(FINNHUB_SYMBOLS).join(','), []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setQuoteStatus('loading');
			try {
				const res = await fetch(`/api/quotes/ticker?symbols=${encodeURIComponent(symbolList)}`, {
					cache: 'no-store',
				});
				if (!res.ok) throw new Error('quote');
				const json = (await res.json()) as { results?: Record<string, { price?: number; changePct?: number }> };
				const r = json.results || {};
				if (cancelled) return;
				const next: Partial<Record<AssetKey, Quote>> = {};
				ASSETS.forEach(({ key }) => {
					const sym = FINNHUB_SYMBOLS[key];
					const q = r[sym];
					if (q && (q.price != null || q.changePct != null)) {
						next[key] = { price: q.price, changePct: q.changePct };
					}
				});
				setQuotes(next);
				setQuoteStatus('ready');
			} catch {
				if (!cancelled) setQuoteStatus('error');
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [symbolList]);

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			{/* HERO */}
			<section className="relative border-b border-white/10 overflow-hidden">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_55%)]" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.06),_transparent_50%)]" />
				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
					<div className="mb-6">
						<Link
							href="/"
							className="inline-flex items-center text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 rounded transition-colors"
						>
							← Wróć do strony głównej
						</Link>
					</div>
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-5">
						<span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
						<span className="tracking-wide uppercase">Przegląd rynku · EDU</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5 max-w-4xl">
						Panel rynkowy
					</h1>
					<p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl">
						Najważniejsze aktywa, bieżący kontekst i scenariusze, które warto obserwować.
					</p>
					<p className="mt-5 text-sm text-white/50 max-w-2xl flex items-start gap-2">
						<ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-white/40" aria-hidden />
						<span>
							Materiał edukacyjny. Nie stanowi rekomendacji inwestycyjnych ani sygnałów transakcyjnych.
						</span>
					</p>
				</div>
			</section>

			{/* Kompaktowy alert — kotwica do pełnej interpretacji niżej */}
			<section className="border-b border-white/10 bg-slate-900/50">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
					<div className="flex flex-col gap-4 rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-4 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<div className="min-w-0 flex-1">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/85 mb-1">
								Kluczowe wydarzenie
							</p>
							<p className="text-base sm:text-lg font-bold text-white leading-snug">{HERO_KEY_EVENT.headline}</p>
							<p className="mt-1.5 text-sm text-white/70 leading-snug">{HERO_KEY_EVENT.summary}</p>
						</div>
						<a
							href={`#${KEY_EVENT_ANCHOR_ID}`}
							className="inline-flex shrink-0 items-center justify-center rounded-lg border border-amber-400/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-colors"
						>
							Zobacz interpretację
						</a>
					</div>
				</div>
			</section>

			{/* AKTYWA */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16 border-b border-white/10">
				<div className="max-w-3xl mb-10">
					<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Aktywa w skrócie</h2>
					<p className="text-white/70 leading-relaxed">
						Pięć często obserwowanych instrumentów — z krótkim kontekstem i checklistą obserwacji (bez interpretacji „co zrobić”).
					</p>
					{quoteStatus === 'error' && (
						<p className="mt-3 text-sm text-white/45">Notowania tymczasowo niedostępne — poniżej treść kontekstu pozostaje aktualna merytorycznie.</p>
					)}
				</div>
				<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
					{ASSETS.map(({ key, label, blurb, watch }) => {
						const q = quotes[key];
						const hasNum = q?.price != null || q?.changePct != null;
						return (
							<article
								key={key}
								className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20 flex flex-col gap-4"
							>
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-xl font-bold tracking-tight">{label}</h3>
									<div className="text-right text-sm tabular-nums">
										{quoteStatus === 'loading' && !hasNum ? (
											<span className="text-white/40">…</span>
										) : hasNum ? (
											<>
												{q?.price != null && (
													<div className="text-white font-semibold">{fmtPrice(key, q.price)}</div>
												)}
												{q?.changePct != null && (
													<div
														className={
															q.changePct > 0
																? 'text-emerald-400/90'
																: q.changePct < 0
																	? 'text-rose-400/90'
																	: 'text-white/60'
														}
													>
														{fmtPct(q.changePct)} <span className="text-white/40 font-normal">dziś</span>
													</div>
												)}
											</>
										) : (
											<span className="text-white/45">Cena / zmiana — n/d</span>
										)}
									</div>
								</div>
								<p className="text-sm text-white/75 leading-relaxed flex-1">{blurb}</p>
								<div className="pt-2 border-t border-white/10">
									<p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Na co patrzeć</p>
									<ul className="text-sm text-white/70 space-y-1.5 list-disc list-inside marker:text-white/35">
										{watch.map((w) => (
											<li key={w}>{w}</li>
										))}
									</ul>
								</div>
							</article>
						);
					})}
				</div>
			</section>

			{/* Pełna interpretacja kluczowego wydarzenia */}
			<section
				id={KEY_EVENT_ANCHOR_ID}
				className="scroll-mt-24 border-b border-white/10 bg-slate-950"
				aria-labelledby="key-event-heading"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
					<div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-950 to-red-950/20 p-5 sm:p-7 lg:p-8 shadow-xl shadow-black/35 ring-1 ring-red-500/20">
						<p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/80 mb-1">
							Kluczowe wydarzenie
						</p>
						<h2
							id="key-event-heading"
							className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mb-6 pb-4 border-b border-amber-500/25"
						>
							{HERO_KEY_EVENT.headline}
						</h2>
						<div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
							<div className="space-y-5 text-sm sm:text-[15px] leading-snug min-w-0">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wider text-amber-100/70 mb-2">Co się dzieje</p>
									<ul className="space-y-1.5 text-white/85">
										{HERO_KEY_EVENT.happening.map((t) => (
											<li key={t} className="flex gap-2">
												<span className="text-amber-400/75 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))}
									</ul>
								</div>
								<div className="pt-4 border-t border-white/10">
									<p className="text-xs font-semibold uppercase tracking-wider text-amber-100/70 mb-2">Co rynek widzi</p>
									<ul className="space-y-1.5 text-white/85">
										{HERO_KEY_EVENT.marketSees.map((t) => (
											<li key={t} className="flex gap-2">
												<span className="text-amber-400/75 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))}
									</ul>
								</div>
								<div className="pt-4 border-t border-white/10">
									<p className="text-xs font-semibold uppercase tracking-wider text-amber-100/70 mb-2">Na co patrzeć</p>
									<ul className="space-y-1.5 text-white/85">
										{HERO_KEY_EVENT.watchFor.map((t) => (
											<li key={t} className="flex gap-2">
												<span className="text-amber-400/75 shrink-0">·</span>
												<span>{t}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
							<div className="rounded-xl border border-amber-500/25 bg-black/30 p-4 sm:p-5">
								<p className="text-xs font-semibold uppercase tracking-wider text-red-200/80 mb-3">Potencjalna reakcja</p>
								<ul className="space-y-2 font-mono text-[13px] sm:text-sm text-white/90 leading-relaxed">
									{HERO_KEY_EVENT.potentialLines.map((line) => (
										<li key={line}>{line}</li>
									))}
								</ul>
								<p className="mt-4 text-[11px] text-white/45 leading-snug">
									Poglądowy układ kierunków — nie prognoza notowań.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Teaser: Brief decyzyjny (mockup premium) */}
			<section className="border-b border-white/10 bg-slate-950" aria-labelledby="brief-teaser-heading">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
					<div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-slate-900/70 to-slate-950 p-5 sm:p-6 shadow-lg shadow-black/30 ring-1 ring-violet-400/15">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
							<div className="min-w-0 flex-1">
								<p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200/80 mb-2">
									Moduł premium · podgląd
								</p>
								<h2
									id="brief-teaser-heading"
									className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2"
								>
									Brief decyzyjny
								</h2>
								<p className="text-sm text-white/70 leading-snug max-w-xl mb-4">
									Skrócone ujęcie głównego tematu, aktywów pod wpływem i scenariusza bazowego.
								</p>
								<ul className="text-sm text-white/78 space-y-1.5 leading-snug">
									<li className="flex gap-2">
										<span className="text-violet-400/70 shrink-0">·</span>
										<span>Temat główny dnia</span>
									</li>
									<li className="flex gap-2">
										<span className="text-violet-400/70 shrink-0">·</span>
										<span>Aktywa pod wpływem</span>
									</li>
									<li className="flex gap-2">
										<span className="text-violet-400/70 shrink-0">·</span>
										<span>Scenariusz bazowy</span>
									</li>
								</ul>
							</div>
							<div className="flex shrink-0 flex-col gap-2.5 sm:min-w-[11rem]">
								{hasBriefDecisionAccess ? (
									<Link
										href={BRIEF_FULL_HREF}
										className="inline-flex items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-colors text-center"
									>
										Otwórz pełny brief
									</Link>
								) : (
									<>
										<Link
											href={BRIEF_FULL_HREF}
											className="inline-flex items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-colors text-center"
										>
											Zobacz podgląd
										</Link>
										<Link
											href="/ebooki#plany"
											className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.14] focus:outline-none focus:ring-2 focus:ring-white/25 transition-colors text-center"
										>
											Odblokuj pełną wersję
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* OSTATNIE REAKCJE — przykłady zależności, nie sygnały */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16 border-b border-white/10">
				<div className="max-w-3xl mb-10">
					<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Ostatnie reakcje rynku</h2>
					<p className="text-white/65 text-sm leading-snug">
						Krótkie schematy: co było w grze → co się zmieniło → jaki był ruch. Poglądowo, bez porad inwestycyjnych.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{MARKET_REACTIONS.map(({ icon: Icon, event, before, whatHappened, reaction }) => (
						<article
							key={event}
							className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 flex flex-col gap-4"
						>
							<div className="inline-flex w-fit items-center rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
								Schemat reakcji rynku
							</div>
							<div className="flex items-start gap-3">
								<div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10">
									<Icon className="h-5 w-5 text-white/80" aria-hidden />
								</div>
								<h3 className="text-lg font-bold leading-tight pt-1.5">{event}</h3>
							</div>
							<div className="rounded-xl border border-white/[0.08] bg-slate-950/50 p-3.5 space-y-3">
								<div>
									<p className="text-xs font-semibold text-white/80 mb-1.5">🧠 Przed</p>
									<ul className="text-[13px] text-white/72 leading-snug space-y-1 pl-0.5 list-none">
										{before.map((line) => (
											<li key={line} className="flex gap-2">
												<span className="text-white/35 shrink-0">·</span>
												<span>{line}</span>
											</li>
										))}
									</ul>
								</div>
								<div className="pt-2.5 border-t border-white/10">
									<p className="text-xs font-semibold text-white/80 mb-1">⚡ Co się stało</p>
									<p className="text-[13px] text-white/78 leading-snug">{whatHappened}</p>
								</div>
								<div className="pt-2.5 border-t border-white/10">
									<p className="text-xs font-semibold text-white/80 mb-1">📈 Reakcja</p>
									<p className="text-[13px] font-medium text-white/90 leading-snug tabular-nums">{reaction}</p>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			{/* CO DZIŚ */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16 border-b border-white/10">
				<div className="max-w-3xl mb-10">
					<h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Co dziś napędza rynek</h2>
					<p className="text-white/70 leading-relaxed">
						Kilka stałych „silników” narracji — warto je śledzić równolegle, bo rzadko działają w izolacji.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{DRIVERS.map(({ icon: Icon, title, text }) => (
						<article
							key={title}
							className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6"
						>
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 mb-4">
								<Icon className="h-5 w-5 text-white/80" aria-hidden />
							</div>
							<h3 className="text-lg font-bold mb-2">{title}</h3>
							<p className="text-sm text-white/75 leading-relaxed">{text}</p>
						</article>
					))}
				</div>
			</section>

			{/* CTA + disclaimer */}
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
				<div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 md:px-10 md:py-12 text-center max-w-3xl mx-auto">
					<p className="text-lg text-white/85 leading-relaxed mb-6">
						Chcesz pełniejszy kontekst, moduły edukacyjne i narzędzia pracy? Zobacz sekcję dla inwestora.
					</p>
					<Link
						href="/ebooki#plany"
						className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
					>
						Zobacz ofertę pakietów
					</Link>
					<p className="mt-8 text-xs text-white/45 leading-relaxed max-w-xl mx-auto">
						Materiał edukacyjny. Nie stanowi rekomendacji inwestycyjnych ani sygnałów transakcyjnych.
					</p>
				</div>
			</section>
		</main>
	);
}
