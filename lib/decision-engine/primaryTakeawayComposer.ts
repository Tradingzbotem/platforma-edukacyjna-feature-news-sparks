// lib/decision-engine/primaryTakeawayComposer.ts — „Najważniejszy wniosek”: mechanizm → w górę → w dół → potwierdzenie scenariusza (max 4 zdania)

import { humanizeMarketLanguage } from './eduScenarioCopy';
import type { DecisionAssetClass, DecisionBlockV1 } from './types';
import type { WorldTakeawayEmphasis } from './worldContext/types';

/** Ścieżki myślenia — wykrywanie bez zmian (silnik / dane wejściowe). */
type NarrativeLane =
	| 'geopolitics'
	| 'rates_usd'
	| 'energy_oil'
	| 'risk_equities'
	| 'macro_event_trading'
	| 'neutral';

/** Obcina do max N zdań (granica po kropce + spacja). */
function limitTakeawaySentences(text: string, max = 4): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (!t) return t;
	const chunks = t.split(/(?<=\.)\s+/).filter((s) => s.length > 0);
	if (chunks.length <= max) return t;
	return chunks.slice(0, max).join(' ').trim();
}

function blobFromWorld(block: DecisionBlockV1): string {
	const wc = block.worldContext;
	const parts = [
		wc.dominantTheme,
		...(wc.keyWorldBullets || []),
		wc.takeawayModifier?.leadSentence || '',
		...(wc.relatedEvents || []).slice(0, 2).map((e) => e.title),
	];
	return parts.join(' ').toLowerCase();
}

function detectNarrativeLane(block: DecisionBlockV1): NarrativeLane {
	const wc = block.worldContext;
	const em: WorldTakeawayEmphasis = wc.takeawayModifier?.emphasis ?? 'none';
	const b = blobFromWorld(block);

	if (em === 'caution_geopolitics' || /\b(geopol|wojn|wojny|bliski\s*wsch|gaza|iran|izrael|ukrain|nato|konflikt|terrory|ormuz|hormuz|saudi|syri|liban|jemen)\b/.test(b)) {
		return 'geopolitics';
	}
	if (em === 'caution_energy' || /\b(ropa|opec|zapas|podaż|podaży|brent|wti|lng|rafiner|embargo|surowiec\s+energet)\b/.test(b)) {
		return 'energy_oil';
	}
	if (em === 'caution_policy' || /\b(fed|ecb|fomc|stopy\s+procent|hawkish|dovish|bank\s+central|rentown|obligac|inflacj)\b/.test(b)) {
		return 'rates_usd';
	}
	if (em === 'broad_risk_off' || /\b(panik|wyprzedaż|sell[-\s]?off|korekta\s+rynk|strach\s+o\s+zyski)\b/.test(b)) {
		return 'risk_equities';
	}

	if (block.decisionHorizonMode === 'macro_event') {
		return 'macro_event_trading';
	}

	if (wc.isEmpty) {
		if (block.assetClass === 'oil') return 'energy_oil';
		if (block.assetClass === 'gold') return 'rates_usd';
		if (block.assetClass === 'us_index' || block.assetClass === 'eu_index' || block.assetClass === 'single_stock') return 'risk_equities';
		if (block.assetClass === 'fx_major') return 'rates_usd';
	}

	return 'neutral';
}

/** Krótka nazwa instrumentu w zdaniu (bez zmiany mapowania klas). */
function instrumentLabel(asset: string, ac: DecisionAssetClass): string {
	const a = String(asset || '').toUpperCase();
	if (a === 'XAUUSD') return 'Złoto';
	if (a === 'XAGUSD') return 'Srebro';
	if (a === 'WTI') return 'WTI';
	if (a === 'BRENT') return 'Brent';
	if (ac === 'fx_major' && a.length >= 6) {
		const base = a.slice(0, 3);
		const quote = a.slice(3);
		return `${base}/${quote}`;
	}
	return asset;
}

function isUsGrowthHeavy(asset: string): boolean {
	return /^US100$/i.test(String(asset || '').trim());
}

/** Jedno zdanie mechanizmu + opcjonalna domyka makro/horyzont (bez drugiej kropki — limit 4 zdań całego takeaway). */
function mechanismOneSentence(coreParts: string[], macroClause: string | null): string {
	const body = coreParts
		.map((p) => p.replace(/\.\s*$/, '').trim())
		.filter(Boolean)
		.join('; ');
	const m = macroClause?.replace(/\.\s*$/, '').trim();
	if (m) return `${body}, a ${m}.`.replace(/\s+/g, ' ').trim();
	return `${body}.`.replace(/\s+/g, ' ').trim();
}

/** Zdanie 1: czym żyje instrument (driver ekonomiczny). */
function sentenceMechanism(block: DecisionBlockV1, lane: NarrativeLane): string {
	const x = instrumentLabel(block.asset, block.assetClass);
	const ac = block.assetClass;
	const mode = block.decisionHorizonMode;
	let macroClause: string | null = null;
	if (mode === 'macro_event') {
		macroClause = 'w tym oknie ważny jest też moment publikacji z kalendarza — pierwsza reakcja bywa emocjonalna';
	} else if (mode === 'full_week' && block.macro.eventRisk === 'high') {
		macroClause = 'w tym tygodniu kilka istotnych publikacji może utrzymywać nastroje przez więcej niż jedną sesję';
	}

	if (ac === 'us_index') {
		if (isUsGrowthHeavy(block.asset)) {
			const base = `${x} wiąże się głównie z dużymi spółkami wzrostowymi i wycenami przyszłych zysków — silnie reaguje na koszt pieniądza w USA (stopy Fed, rentowności) i na to, czy inwestorzy chcą brać ryzyko`;
			if (lane === 'geopolitics') return mechanismOneSentence([base, 'niepokój geopolityczny potrafi szybko zmienić te wyceny'], macroClause);
			if (lane === 'rates_usd')
				return mechanismOneSentence(
					[`${x} w praktyce często „żyje” decyzjami Fed i poziomem rentowności — to ustawia warunki dla akcji wzrostowych`],
					macroClause
				);
			if (lane === 'energy_oil')
				return mechanismOneSentence(
					[
						`${x}, jako koszyk wzrostowy, jest też wrażliwy na ceny energii: droższa ropa podnosi koszty i może studzić apetyt na ryzyko`,
					],
					macroClause
				);
			return mechanismOneSentence([base], macroClause);
		}
		const base = `${x} odzwierciedla szeroką kondycję gospodarki USA, koszt kapitału (stopy Fed, rentowności obligacji) oraz apetyt na ryzyko`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'geopolityka i nagłe zmiany nastrojów potrafią przełożyć się na wyceny spółek w koszyku'], macroClause);
		if (lane === 'rates_usd')
			return mechanismOneSentence([base, 'gdy Fed pozostaje twardy albo rentowności rosną, presja na wyceny indeksu zwykle rośnie'], macroClause);
		if (lane === 'energy_oil')
			return mechanismOneSentence([base, 'droższa energia podnosi koszty firm i może osłabiać sentyment do części sektorów'], macroClause);
		return mechanismOneSentence([base], macroClause);
	}

	if (ac === 'eu_index') {
		const base = `${x} jest czuły na przemysł i eksport strefy euro, koszt energii dla gospodarki Niemiec, kurs euro oraz nastroje z rynków USA`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'konflikty i niepewność w Europie mogą szybciej uderzać w cykliczne walory'], macroClause);
		if (lane === 'rates_usd' || lane === 'macro_event_trading')
			return mechanismOneSentence([base, 'decyzje EBC i tło stóp w strefie euro też ustawiają warunki finansowania firm'], macroClause);
		if (lane === 'energy_oil')
			return mechanismOneSentence([base, 'ceny gazu i ropy mają w Niemczech bezpośredni wpływ na koszty przemysłu'], macroClause);
		return mechanismOneSentence([base], macroClause);
	}

	if (ac === 'gold') {
		const base = `${x} reaguje na siłę dolara, poziom rentowności (szczególnie realnych) oraz na popyt na bezpieczną przystań, gdy rośnie niepewność`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'napięcia polityczne mogą wspierać popyt obronny nawet przy częściowo silnym USD'], macroClause);
		if (lane === 'energy_oil')
			return mechanismOneSentence(
				[base, 'drożejąca energia potrafi podsycać obawy o inflację i pośrednio wspierać złoto obok kanału dolara'],
				macroClause
			);
		return mechanismOneSentence([base], macroClause);
	}

	if (ac === 'oil') {
		const base = `${x} zależy od podaży (w tym OPEC+), zapasów, ryzyka geopolitycznego oraz od perspektywy globalnego popytu`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'zakłócenia dostaw lub strach o region produkcji zwykle szybciej wycenia się w cenie'], macroClause);
		return mechanismOneSentence([base], macroClause);
	}

	if (ac === 'fx_major') {
		const base = `${x} żyje różnicą stóp i komunikatów banków centralnych po obu stronach pary, siłą dolara na świecie oraz danymi makro z obu gospodarek`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'w kryzysach często widać ucieczkę w dolara lub „bezpieczniejszą” stronę pary'], macroClause);
		if (lane === 'energy_oil')
			return mechanismOneSentence([base, 'ceny surowców i handel potrafią dziś przestawiać przepływy i krótkoterminowy popyt na waluty'], macroClause);
		return mechanismOneSentence([base], macroClause);
	}

	if (ac === 'single_stock') {
		const base = `${x} łączy wycenę jednej firmy z jej wynikami i perspektywami, ale także z szerokim rynkiem: stopy, dolar i nastroje w sektorze`;
		if (lane === 'geopolitics')
			return mechanismOneSentence([base, 'geopolityka działa głównie przez koszt kapitału i nastroje do ryzyka'], macroClause);
		return mechanismOneSentence([base], macroClause);
	}

	const base = `${x} w tym ćwiczeniu traktuj jak instrument powiązany z szerokim rynkiem: ważą dane, polityka pieniężna i nastroje`;
	return mechanismOneSentence([base], macroClause);
}

/** Zdanie 2: co wspiera wzrost (cena / waluta bazowa tam, gdzie ma sens). */
function sentenceSupportsUp(block: DecisionBlockV1, lane: NarrativeLane): string {
	const ac = block.assetClass;

	if (ac === 'us_index') {
		if (lane === 'energy_oil')
			return `W górę indeks może iść, gdy drożejąca energia przestaje dominować nastroje albo gdy spółki udźwigają koszty przez lepsze perspektywy zysków.`;
		if (lane === 'rates_usd')
			return `Wzrost wspierają łagodniejszy Fed lub spadające rentowności, a także dane sugerujące miękkie lądowanie bez głębokiej recesji.`;
		if (lane === 'geopolitics')
			return `Odbicie bywa możliwe, gdy geopolityczny strach szybko opada albo gdy rynek wycenia już najgorszy scenariusz i wraca apetyt na ryzyko.`;
		return `W górę indeks pchają lepsze perspektywy zysków, większy apetyt na ryzyko oraz obniżanie się kosztu pieniądza, gdy rynek wierzy w miękkie lądowanie.`;
	}

	if (ac === 'eu_index') {
		if (lane === 'energy_oil') return `Wzrost wspiera taniejąca energia dla przemysłu oraz ożywienie eksportu, gdy globalny popyt się poprawia.`;
		if (lane === 'rates_usd') return `W górę pomaga gołębi ton EBC lub słabsze euro, jeśli wspiera konkurencyjność eksportu bez paniki na rynkach.`;
		return `Wzrost wspierają lepsze dane z przemysłu i usług, stabilizacja w strefie euro oraz korzystne tło z USA bez nagłego strachu.`;
	}

	if (ac === 'gold') {
		if (lane === 'geopolitics') return `W górę złoto pchają eskalacja napięć oraz popyt na aktywa obronne, często równolegle ze słabszym dolarem lub niższymi rentownościami.`;
		if (lane === 'energy_oil') return `Wzrost ceny złota mogą wspierać obawy inflacyjne po droższej energii, jeśli jednocześnie nie dominuje bardzo silny dolar.`;
		return `W górę złoto idzie, gdy dolar słabnie, rentowności spadają albo gdy inwestorzy szukają schronienia przed niepewnością.`;
	}

	if (ac === 'oil') {
		return `W górę cenę ropy pchają cięcia podaży, groźba zakłóceń dostaw, geopolityka oraz ożywienie popytu, gdy gospodarki przyspieszają.`;
	}

	if (ac === 'fx_major') {
		const pair = String(block.asset || '').toUpperCase();
		if (pair === 'EURUSD')
			return `Wzrost EUR/USD wspiera relatywnie silniejsze euro lub słabszy dolar — np. gdy ECB brzmi twardziej niż Fed albo gdy dane z USA rozczarowują.`;
		if (pair === 'USDJPY')
			return `Wzrost USD/JPY wspiera wyższe rentowności w USA względem Japonii albo silniejszy dolar w globalnym popycie, gdy Bank Japonii pozostaje bardzo łagodny.`;
		if (pair === 'USDPLN')
			return `Wzrost USD/PLN (więcej złotych za dolara) wspiera silniejszy dolar po danych z USA albo sytuację, gdy inwestorzy na świecie wolą dolara przed walutami bardziej ryzykownymi.`;
		if (pair === 'EURPLN')
			return `Wzrost EUR/PLN wspiera słabszy złoty wobec euro albo euro wzmacniane przez dane z strefy euro mocniej niż PLN.`;
		return `W górę parę pchają dane i komunikaty sprzyjające walucie bazowej albo osłabiające kwotowaną — w praktyce chodzi o różnicę stóp i przepływów.`;
	}

	if (ac === 'single_stock') {
		return `Wzrost wspierają lepsze wyniki, pozytywne wieści z branży oraz szeroki rynek, który nie jest w trybie paniki.`;
	}

	return `Warunki sprzyjające wzrostowi ustawiają się, gdy dane i polityka pieniężna nie zaskakują negatywnie oraz gdy rośnie ochota na ryzyko.`;
}

/** Zdanie 3: co wspiera spadek / presję. */
function sentenceSupportsDown(block: DecisionBlockV1, lane: NarrativeLane): string {
	const ac = block.assetClass;

	if (ac === 'us_index') {
		if (lane === 'rates_usd')
			return `W dół indeks ciągnie twardszy Fed, wyższe rentowności i obawy o zyski, gdy rynek wycenia twarde lądowanie.`;
		if (lane === 'geopolitics') return `Presję w dół daje utrzymujący się geopolityczny strach i ucieczka od ryzyka, która obniża mnożniki wycen.`;
		if (lane === 'energy_oil') return `Wyższe koszty energii mogą obcinać marże i pogarszać sentyment, szczególnie gdy jednocześnie rosną stopy.`;
		return `Spadek wspierają gorsze dane makro, spadek apetytu na ryzyko oraz droższy koszt kapitału, który obniża atrakcyjność akcji.`;
	}

	if (ac === 'eu_index') {
		if (lane === 'energy_oil') return `W dół pchają drogie nośniki energii dla przemysłu oraz słaby popyt zagraniczny na eksport.`;
		if (lane === 'rates_usd') return `Presja rośnie, gdy EBC musi trzymać stopy wysoko przy słabych danych albo gdy euro się umacnia i gryzie eksport.`;
		return `Spadek wspierają złe dane z Niemiec i strefy euro, słaby przemysł oraz negatywne tło z USA, które ściąga kapitał poza Europę.`;
	}

	if (ac === 'gold') {
		if (lane === 'geopolitics')
			return `W dół złoto może iść, gdy napięcie geopolityczne gaśnie jednocześnie z silnym dolarem i rosnącymi rentownościami.`;
		return `W dół złoto typowo ciągnie silniejszy USD oraz wyższe rentowności obligacji, bo zwiększają koszt utrzymywania metali bez odsetek.`;
	}

	if (ac === 'oil') {
		return `Spadek wspierają wzrost podaży, rosnące zapasy, złagodzenie geopolityki oraz obawy o popyt przy spowolnieniu gospodarek.`;
	}

	if (ac === 'fx_major') {
		const pair = String(block.asset || '').toUpperCase();
		if (pair === 'EURUSD')
			return `W dół EUR/USD ciągnie silniejszy dolar lub gołębi ECB w zestawieniu z twardszym Fed; złe dane ze strefy euro też mogą osłabiać euro.`;
		if (pair === 'USDJPY')
			return `Spadek USD/JPY wspiera spadek rentowności w USA, interwencja lub zmiana tonu BoJ albo globalny popyt na jena jako schronienie.`;
		if (pair === 'USDPLN')
			return `Spadek USD/PLN wspiera umacniający się złoty albo słabszy dolar po łagodniejszym Fed lub lepszych danych z Polski względem oczekiwań.`;
		if (pair === 'EURPLN')
			return `Spadek EUR/PLN wspiera silniejszy złoty wobec euro albo słabsze euro przy rozczarowujących danych ze strefy euro.`;
		return `Presję w dół daje kombinacja danych i polityki pieniżnej, która relatywnie wzmacnia drugą stronę pary lub osłabia bazową.`;
	}

	if (ac === 'single_stock') {
		return `Spadek wspierają rozczarowujące wyniki, złe wieści z regulacji lub konkurencji oraz szeroki rynek w trybie wyprzedaży.`;
	}

	return `Presja w dół rośnie, gdy dane zawodzą, polityka pieniężna zaskakuje na twardo lub gdy inwestorzy masowo unikają ryzyka.`;
}

/**
 * Zdanie 4 (opcjonalne): po czym poznać potwierdzenie / negację wybranego scenariusza (A/B/C × horyzont).
 * Krótsze, mniej „traderskie” sformułowania — logika ta sama co wcześniej w interpretationPivot.
 */
function sentenceScenarioConfirm(block: DecisionBlockV1): string {
	const k = block.selectedScenarioKey;
	const m = block.decisionHorizonMode;

	if (m === 'session_end') {
		if (k === 'A')
			return `Scenariusz wzrostowy słabnie, jeśli jeszcze dziś cofnie się cały pierwszy impuls i nie pojawi się drugi ruch w tym samym kierunku.`;
		if (k === 'B')
			return `Dopiero utrzymanie poza wcześniejszym zakresem — bez szybkiego powrotu na środek — sugeruje, że rynek wybrał stronę.`;
		return `Scenariusz defensywny traci sens, jeśli po szarpnięciu cena szybko wraca w znany obszar i nie utrzymuje presji.`;
	}
	if (m === 'one_two_days') {
		if (k === 'A')
			return `Teza słabnie, jeśli drugiego dnia nie ma kontynuacji i rynek wraca do zachowania sprzed pierwszej fali.`;
		if (k === 'B')
			return `Wyjście z „widełek” widać po dwóch sesjach, gdy jedna strona zostaje wyraźnie utrzymana, a nie tylko testuje środek.`;
		return `Presja opada, jeśli drugi dzień odkupuje cały ruch słabości — rynek wtedy odrzuca narrację strachu.`;
	}
	if (m === 'full_week') {
		if (k === 'A')
			return `Temat tygodnia słabnie, gdy motyw znika po jednej–dwóch sesjach i nie wraca, zamiast utrwalać kierunek.`;
		if (k === 'B')
			return `Pełniejszy obraz daje dopiero zamknięcie poza pasmem i brak natychmiastowego cofnięcia następnej sesji.`;
		return `Scenariusz jest słabszy, gdy presja nie znajduje kontynuacji i rynek wielokrotnie odrzuca ten sam kierunek.`;
	}
	if (m === 'macro_event') {
		if (k === 'A')
			return `Po publikacji scenariusz słabnie, jeśli pierwszy ruch nie ma dalszego podążenia i brakuje drugiej fali w tym samym kierunku.`;
		if (k === 'B')
			return `Pełna teza po danych wymaga, żeby nowy poziom został utrzymany, a nie żeby cena wróciła w poprzedni zakres zaraz po emocji.`;
		return `Scenariusz traci siłę, gdy presja jest szybko zbierana i układ cen nie zostaje po pierwszej serii reakcji.`;
	}
	if (k === 'A')
		return `Jeśli po publikacji nie ma podtrzymania pierwszego ruchu, wariant kontynuacji jest mniej wiarygodny.`;
	if (k === 'B')
		return `Jeśli po danych cena wraca w stary zakres bez utrwalenia, wariant „widełek” nadal jest aktualny.`;
	return `Jeśli presja znika zaraz po impulsie, defensywny wariant nie jest już tak uzasadniony.`;
}

/**
 * Główny wniosek: max 4 krótkie zdania — mechanizm → w górę → w dół → potwierdzenie / negacja scenariusza.
 */
export function composePrimaryTakeaway(block: DecisionBlockV1): string {
	const lane = detectNarrativeLane(block);
	const s1 = sentenceMechanism(block, lane);
	const s2 = sentenceSupportsUp(block, lane);
	const s3 = sentenceSupportsDown(block, lane);
	const s4 = sentenceScenarioConfirm(block);

	const joined = [s1, s2, s3, s4].join(' ').replace(/\s+/g, ' ').trim();
	return humanizeMarketLanguage(limitTakeawaySentences(joined, 4));
}
