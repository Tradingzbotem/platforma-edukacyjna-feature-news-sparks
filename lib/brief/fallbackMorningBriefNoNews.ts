// Statyczny briefing gdy brak nagłówków RSS / klastra (bez OpenAI).
import type { MorningBriefPriceRowMeta } from '@/lib/brief/morningBriefMarketSnapshot';
import type { MorningBriefCanonicalKey } from '@/lib/brief/morningBriefMarketSymbols';
import type { BriefingLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import type { NarrativeBriefResponse } from '@/lib/brief/narrativeBriefingTypes';

const FALLBACK_KEYS = ['US500', 'VIX', 'EURUSD', 'XAUUSD'] as const satisfies readonly MorningBriefCanonicalKey[];

export const FALLBACK_MORNING_BRIEF_ASSET_KEYS: readonly MorningBriefCanonicalKey[] = FALLBACK_KEYS;

function dateLabelFor(language: BriefingLanguage): string {
	const locale = language === 'en' ? 'en-GB' : language === 'cs' ? 'cs-CZ' : 'pl-PL';
	return new Intl.DateTimeFormat(locale, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'Europe/Warsaw',
	}).format(new Date());
}

function priceHint(
	lang: BriefingLanguage,
	label: MorningBriefCanonicalKey,
	meta: MorningBriefPriceRowMeta | undefined,
): string {
	if (!meta) {
		return lang === 'en' ? 'No quote in snapshot.' : lang === 'cs' ? 'Kót v snapshotu není.' : 'Brak notowania w snapshotcie.';
	}
	if (meta.livePriceSource === 'live' && meta.displayPrice) {
		return lang === 'en'
			? `Last (live): ${meta.displayPrice}`
			: lang === 'cs'
				? `Poslední (live): ${meta.displayPrice}`
				: `Ostatnia (live): ${meta.displayPrice}`;
	}
	if (meta.livePriceSource === 'override_recent' && meta.displayPrice) {
		const h = meta.livePriceAgeHours != null ? ` ~${meta.livePriceAgeHours}h` : '';
		return lang === 'en'
			? `Reference snapshot: ${meta.displayPrice}${h} (not live).`
			: lang === 'cs'
				? `Referenční snapshot: ${meta.displayPrice}${h} (není live).`
				: `Snapshot referencyjny: ${meta.displayPrice}${h} (nie live).`;
	}
	return lang === 'en' ? 'No numeric anchor (NONE).' : lang === 'cs' ? 'Bez číselné kotvy (NONE).' : 'Brak kotwy liczbowej (NONE).';
}

export function noDataBriefMessage(language: BriefingLanguage): string {
	if (language === 'en') return 'Insufficient market headline data to generate a cluster-grounded briefing.';
	if (language === 'cs') return 'Nedostatek tržních titulků pro cluster-grounded briefing.';
	return 'Brak wystarczających danych rynkowych do wygenerowania briefingu.';
}

export function buildFallbackNarrativeBriefing(
	language: BriefingLanguage,
	perLabel: Partial<Record<MorningBriefCanonicalKey, MorningBriefPriceRowMeta>>,
): NarrativeBriefResponse {
	const dateLabel = dateLabelFor(language);

	if (language === 'en') {
		return {
			format: 'narrative',
			dateLabel,
			title: 'No single dominant market theme',
			eventPriorityFilter: {
				primaryDriver:
					'No reliable macro headline cluster from the live feed — this note uses a neutral desk template and the snapshot only.',
				hasConcreteHeadlineEvent: false,
				headlineEventOneLiner: '',
				topThreeEvents: [
					{
						summary: 'Liquidity and positioning dominate absent a clear headline catalyst.',
						priorityTier: 'high',
						channelsImpactOilIndicesFxVix:
							'Without a fresh impulse, oil and indices often drift with flows; FX can compress in ranges; VIX mean-reverts unless a shock lands.',
						rationale: 'Template fallback when RSS/cluster input is empty — avoids inventing a false narrative.',
					},
					{
						summary: 'Cross-asset consolidation until a macro or geopolitical headline breaks the range.',
						priorityTier: 'medium',
						channelsImpactOilIndicesFxVix:
							'Indices and crude can trade tight ranges; major FX pairs often chop; VIX stays subdued until event risk is priced.',
						rationale: 'Neutral baseline when the feed provides no thematic anchor.',
					},
					{
						summary: 'Watch scheduled risk and liquidity pockets rather than assumed stories.',
						priorityTier: 'medium',
						channelsImpactOilIndicesFxVix:
							'Calendars still matter for indices and rates-sensitive FX; energy can react to inventory noise; VIX can gap on surprises.',
						rationale: 'Desk hygiene when headline input is missing.',
					},
				],
			},
			eventShift: {
				changeLast12to24h: 'No verified headline cluster — treat narrative shift as unconfirmed.',
				dominantEvent: 'No dominant event identified from the current headline set.',
				priorScenario: 'Assumed range/consolidation while waiting for a credible catalyst.',
				currentScenario: 'Neutral drift / two-way risk until headlines populate the feed.',
				openingThreeSentences: [
					'With an empty RSS cluster, we do not force a single market story.',
					'Price action in major indices, FX, gold and volatility should be read as positioning and liquidity, not a confirmed macro chain.',
					'Refresh the briefing once live headlines return; until then keep risk modest and avoid fabricated catalysts.',
				],
			},
			leadParagraphs: [
				'There is no dominant market theme derived from the current headline input. This is an automated fallback briefing without model-generated narrative.',
				'Expect consolidation or two-way chop in core risk assets until a credible macro or geopolitical impulse appears in the feed.',
				'Use the asset snapshot below as the factual anchor; do not infer specific catalysts that are not in the data.',
			],
			marketMechanics: {
				title: 'Market mechanics (neutral template)',
				paragraphs: [
					'Without headline clustering, transmission channels are ambiguous — reduce conviction size and widen invalidation.',
					'Prefer reaction over prediction: let the tape confirm whether a range or a trend is in force.',
				],
				bulletBlocks: [
					{
						title: 'Desk checklist',
						bullets: [
							'Confirm RSS/context pipeline is returning items on the server.',
							'Watch US500 and VIX for broad risk; EURUSD and XAUUSD for USD and haven flows.',
						],
					},
				],
			},
			marketContext: {
				title: 'Key instruments (snapshot)',
				paragraphs: [
					'Below are the main references requested for orientation. Lines reflect server snapshot tags (LIVE / OVERRIDE_RECENT / NONE).',
				],
				bulletBlocks: [
					{
						title: 'US500, VIX, EURUSD, XAUUSD',
						bullets: FALLBACK_KEYS.map((k) => `${k}: ${priceHint(language, k, perLabel[k])}`),
					},
				],
			},
			forwardRealities: {
				title: 'Conditional next steps',
				conditionals: [
					{
						if: 'Headlines return and a macro cluster forms (rates, inflation, geopolitics, energy).',
						then: 'Re-run the narrative briefing on the clustered input; rebuild triggers around the new dominant driver.',
					},
					{
						if: 'Liquidity thins and ranges hold without new data.',
						then: 'Expect mean reversion and false breaks — size down and wait for confirmation.',
					},
					{
						if: 'Volatility expands sharply with still-missing headline clarity.',
						then: 'Treat it as positioning/flow shock first; verify facts before narrating causality.',
					},
				],
			},
			glossary: [
				{ term: 'US500', definition: 'Broad US equity benchmark proxy used here for risk tone.' },
				{ term: 'VIX', definition: 'Implied volatility index — gauge of expected near-term equity turbulence.' },
				{ term: 'EURUSD', definition: 'Major USD pair — sensitive to rates differentials and risk sentiment.' },
			],
		};
	}

	if (language === 'cs') {
		return {
			format: 'narrative',
			dateLabel,
			title: 'Chybí jednoznačné dominantní tržní téma',
			eventPriorityFilter: {
				primaryDriver:
					'Žádný spolehlivý cluster makro titulků z živého feedu — poznámka používá neutrální šablonu a pouze snapshot.',
				hasConcreteHeadlineEvent: false,
				headlineEventOneLiner: '',
				topThreeEvents: [
					{
						summary: 'Bez čerstvého impulsu často dominuje likvidita a pozicování.',
						priorityTier: 'high',
						channelsImpactOilIndicesFxVix:
							'Ropa a indexy mohou driftovat s toky; FX se maže v pásmu; VIX se vrací k průměru, dokud nenastane šok.',
						rationale: 'Fallback šablona při prázdném RSS — bez vymýšlení příběhu.',
					},
					{
						summary: 'Křížová konsolidace, dokud makro nebo geopolitika nerozbije pásmo.',
						priorityTier: 'medium',
						channelsImpactOilIndicesFxVix:
							'Indexy a ropa v úzkém pásmu; hlavní FX často chop; VIX klidný, dokud se neocení event risk.',
						rationale: 'Neutrální baseline bez tématického ukotvení z feedu.',
					},
					{
						summary: 'Sledujte kalendář a likviditu místo domnělých příběhů.',
						priorityTier: 'medium',
						channelsImpactOilIndicesFxVix:
							'Kalendář stále hýbe indexy a FX citlivé na sazby; energie na inventáře; VIX skok na překvapení.',
						rationale: 'Provozní disciplína při chybějících titulcích.',
					},
				],
			},
			eventShift: {
				changeLast12to24h: 'Bez ověřeného clusteru titulků — posun narrativu považujte za nepotvrzený.',
				dominantEvent: 'Z aktuální sady titulků nevyplývá dominantní událost.',
				priorScenario: 'Předpokládané pásmo / konsolidace čeká na věrohodný katalyzátor.',
				currentScenario: 'Neutrální drift / obousměrné riziko, dokud feed nenabídne témata.',
				openingThreeSentences: [
					'S prázdným RSS clusterem nevynucujeme jeden tržní příběh.',
					'Ceny hlavních indexů, FX, zlata a volatility čtěte jako pozice a likviditu, ne jako potvrzený makro řetězec.',
					'Obnovte briefing až se vrátí živé titulky; do té doby držte riziko střídmě.',
				],
			},
			leadParagraphs: [
				'Z aktuálního vstupu titulků nevyplývá dominantní tržní téma. Jde o automatický fallback bez generování AI.',
				'Počítejte s konsolidací nebo obousměrným chopáním, dokud se neobjeví věrohodný makro nebo geopolitický impuls.',
				'Kotvou jsou údaje snapshotu níže; nevymýšlejte katalyzátory, které v datech nejsou.',
			],
			marketMechanics: {
				title: 'Mechanika trhu (neutrální šablona)',
				paragraphs: [
					'Bez clusteru titulků jsou přenosové kanály nejasné — snižte konvikci a rozšiřte invalidaci.',
					'Preferujte reakci před predikcí: nechte trh potvrdit pásmo vs. trend.',
				],
				bulletBlocks: [
					{
						title: 'Checklist desku',
						bullets: [
							'Ověřte, že pipeline RSS/context na serveru vrací položky.',
							'Sledujte US500 a VIX pro risk; EURUSD a XAUUSD pro USD a útočiště.',
						],
					},
				],
			},
			marketContext: {
				title: 'Klíčové instrumenty (snapshot)',
				paragraphs: [
					'Níže hlavní reference. Řádky odpovídají tagům serveru (LIVE / OVERRIDE_RECENT / NONE).',
				],
				bulletBlocks: [
					{
						title: 'US500, VIX, EURUSD, XAUUSD',
						bullets: FALLBACK_KEYS.map((k) => `${k}: ${priceHint(language, k, perLabel[k])}`),
					},
				],
			},
			forwardRealities: {
				title: 'Podmíněné další kroky',
				conditionals: [
					{
						if: 'Titulky se vrátí a vytvoří se makro cluster (sazby, inflace, geopolitika, energie).',
						then: 'Znovu spusťte narrative briefing na clusterovaném vstupu; přestavte triggery kolem nového driveru.',
					},
					{
						if: 'Likvidita řídne a pásmo drží bez nových dat.',
						then: 'Čekejte mean reversion a falešné průlomy — menší size a čekejte na potvrzení.',
					},
					{
						if: 'Volatilita prudce roste a titulky stále chybí.',
						then: 'Nejdřív uvažujte šok z pozic/toků; příčiny ověřte fakticky.',
					},
				],
			},
			glossary: [
				{ term: 'US500', definition: 'Širší benchmark US akcií — tón rizika.' },
				{ term: 'VIX', definition: 'Index implikované volatility — očekávaná turbulence akcií.' },
				{ term: 'EURUSD', definition: 'Hlavní USD pár — diferenciál sazeb a sentiment.' },
			],
		};
	}

	// Polish (default)
	return {
		format: 'narrative',
		dateLabel,
		title: 'Brak dominującego tematu rynkowego',
		eventPriorityFilter: {
			primaryDriver:
				'Brak wiarygodnego klastra makro z aktualnych nagłówków RSS — brief opiera się na neutralnej szablonie i samym snapshocie.',
			hasConcreteHeadlineEvent: false,
			headlineEventOneLiner: '',
			topThreeEvents: [
				{
					summary: 'Przy braku świeżego impulsu dominują płynność i pozycjonowanie.',
					priorityTier: 'high',
					channelsImpactOilIndicesFxVix:
						'Bez nowego tematu ropa i indeksy często dryfują z przepływami; FX może się ściskać w zakresie; VIX wraca do średniej, dopóki nie pojawi się szok.',
					rationale: 'Tryb zastępczy przy pustym RSS — bez wymyślania narracji.',
				},
				{
					summary: 'Konsolidacja cross-asset do czasu nagłówka makro lub geopolitycznego.',
					priorityTier: 'medium',
					channelsImpactOilIndicesFxVix:
						'Indeksy i ropa w wąskim zakresie; główne pary FX często w chopie; VIX spokojny, dopóki ryzyko wydarzenia nie zostanie wycenione.',
					rationale: 'Neutralna baza, gdy feed nie daje kotwicy tematycznej.',
				},
				{
					summary: 'Obserwuj kalendarz i okna płynności zamiast domniemanych historii.',
					priorityTier: 'medium',
					channelsImpactOilIndicesFxVix:
						'Kalendarz nadal rusza indeksy i FX wrażliwe na stopy; energia na szumie zapasów; VIX skok przy zaskoczeniu.',
					rationale: 'Dbałość operacyjna przy braku nagłówków.',
				},
			],
		},
		eventShift: {
			changeLast12to24h: 'Brak potwierdzonego klastra nagłówków — traktuj zmianę narracji jako niepotwierdzoną.',
			dominantEvent: 'Z bieżącego zestawu nagłówków nie wynika jedno dominujące wydarzenie.',
			priorScenario: 'Założenie konsolidacji / zakresu oczekiwania na wiarygodny katalizator.',
			currentScenario: 'Neutralny dryf / ryzyko dwukierunkowe do czasu zapełnienia feedu.',
			openingThreeSentences: [
				'Przy pustym klastrze RSS nie wymuszamy jednej historii rynkowej.',
				'Ruch głównych indeksów, FX, złota i zmienności czytaj jako płynność i pozycje, a nie potwierdzony łańcuch makro.',
				'Odśwież briefing po powrocie żywych nagłówków; do tego czasu ogranicz ryzyko i unikaj zmyślonych katalizatorów.',
			],
		},
		leadParagraphs: [
			'Z bieżącego wejścia nagłówków nie wynika dominujący temat rynkowy. To automatyczny briefing zastępczy bez generacji AI.',
			'Spodziewaj się konsolidacji lub dwukierunkowego chopu w kluczowych aktywach ryzyka, dopóki nie pojawi się wiarygodny impuls makro lub geopolityczny.',
			'Kotwicą są dane snapshotu poniżej; nie dopowiadaj katalizatorów, których nie ma w danych.',
		],
		marketMechanics: {
			title: 'Mechanika rynku (szablon neutralny)',
			paragraphs: [
				'Bez klastra nagłówków kanały transmisji są niejednoznaczne — zmniejsz konwencję i poszerz inwalidację.',
				'Preferuj reakcję zamiast prognozy: pozwól rynkowi potwierdzić zakres lub trend.',
			],
			bulletBlocks: [
				{
					title: 'Checklist desku',
					bullets: [
						'Sprawdź, czy pipeline RSS/context na serwerze zwraca pozycje.',
						'Obserwuj US500 i VIX dla szerokiego ryzyka; EURUSD i XAUUSD dla USD i schronień.',
					],
				},
			],
		},
		marketContext: {
			title: 'Kluczowe instrumenty (snapshot)',
			paragraphs: [
				'Poniżej główne odniesienia. Wiersze odpowiadają tagom serwera (LIVE / OVERRIDE_RECENT / NONE).',
			],
			bulletBlocks: [
				{
					title: 'US500, VIX, EURUSD, XAUUSD',
					bullets: FALLBACK_KEYS.map((k) => `${k}: ${priceHint(language, k, perLabel[k])}`),
				},
			],
		},
		forwardRealities: {
			title: 'Warunkowe kolejne kroki',
			conditionals: [
				{
					if: 'Nagłówki wracają i formuje się klaster makro (stopy, inflacja, geopolityka, energia).',
					then: 'Ponownie uruchom narrative briefing na sklastrowanym wejściu; przebuduj triggery wokół nowego drivera.',
				},
				{
					if: 'Płynność cienieje i zakres się utrzymuje bez nowych danych.',
					then: 'Raczej mean reversion i fałszywe wybicia — mniejszy rozmiar i czekaj na potwierdzenie.',
				},
				{
					if: 'Zmienność gwałtownie rośnie przy nadal brakujących nagłówkach.',
					then: 'Najpierw rozważ szok pozycji/przepływów; przyczyny weryfikuj faktami.',
				},
			],
		},
		glossary: [
			{ term: 'US500', definition: 'Szeroki benchmark akcji USA — ton ryzyka.' },
			{ term: 'VIX', definition: 'Indeks implikowanej zmienności — oczekiwana turbulencja na akcjach.' },
			{ term: 'EURUSD', definition: 'Główna para USD — różnica stóp i sentiment.' },
		],
	};
}

export function buildFallbackStructuredMorningBrief(language: BriefingLanguage): Record<string, unknown> {
	const hist = (setup: string, reaction: string, lesson: string) => [{ setup, reaction, lesson }];

	if (language === 'en') {
		return {
			whatsDifferentVsRecentDays: [
				'Live RSS cluster for the morning brief is empty — we switch to a neutral template.',
				'No headline chain is available to anchor a single driver.',
			],
			tldr: [
				'No dominant theme from headlines → consolidation / two-way risk is the working assumption.',
				'Use US500, VIX, EURUSD, XAUUSD as orientation anchors from the snapshot.',
				'Re-run when /api/news/context returns items again.',
			],
			executiveSummary:
				'Insufficient headline input to build a cluster-grounded brief. This static sketch highlights core risk references and a neutral consolidation context without inventing catalysts.',
			macro: { usa: [], europe: [], asia: [], geopolitics: [] },
			events: [],
			assets: [
				{
					asset: 'US500',
					currentContext: 'Broad risk proxy — range likely without a fresh macro impulse.',
					drivers: 'Liquidity, positioning, waiting for headlines.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Break and hold above local resistance with supportive breadth.',
					triggerBear: 'Loss of support with rising volatility and defensive rotation.',
					triggerLogic: 'Reactions first — confirm trend vs range before scaling.',
					historicalBehavior: hist('Range into data', 'Impulse then mean reversion', 'Size for false breaks.'),
				},
				{
					asset: 'VIX',
					currentContext: 'Volatility gauge — often subdued when catalysts are absent.',
					drivers: 'Event calendar, tail headlines, equity flows.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Spike on shock or deleveraging.',
					triggerBear: 'Grind lower in calm, headline-light sessions.',
					triggerLogic: 'Use as risk throttle, not a standalone story.',
					historicalBehavior: hist('Complacency', 'Fast repricing', 'Respect gap risk.'),
				},
				{
					asset: 'EURUSD',
					currentContext: 'Major USD pair — chop typical without a clear rates narrative.',
					drivers: 'Rate differentials, risk tone, positioning.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'USD softness on risk-on or dovish USD repricing.',
					triggerBear: 'USD bid on safety or hawkish repricing.',
					triggerLogic: 'Two-way until a headline cluster forms.',
					historicalBehavior: hist('Range', 'Break on central-bank surprise', 'Confirm with follow-through.'),
				},
				{
					asset: 'XAUUSD',
					currentContext: 'Haven / real-rate sensitive — watch USD and volatility.',
					drivers: 'Real yields, geopolitical risk, USD liquidity.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Risk-off or falling real yields supportive.',
					triggerBear: 'Strong USD and calm risk tone as headwinds.',
					triggerLogic: 'Cross-check with VIX and USD before narrating.',
					historicalBehavior: hist('Stress bid', 'Fade on calm', 'Correlations shift intraday.'),
				},
			],
			crossAssetLinks: [],
			scenarios: [
				{
					title: 'Headlines return',
					if: 'RSS/context pipeline delivers a macro cluster.',
					then: 'Re-run AI briefing on clustered input.',
					confirmation: 'Non-empty /api/news/context items and stable themeKey.',
					crossAssetReaction: 'Rebuild cross-asset triggers around the new driver.',
				},
				{
					title: 'Continued empty feed',
					if: 'Still zero items from context fetch.',
					then: 'Stay on static template; verify Vercel base URL, cron, and outbound RSS fetches.',
					confirmation: 'Logs show [narrative-debug] ingest counts at zero or context fetch failing.',
					crossAssetReaction: 'No forced narrative — keep risk modest.',
				},
			],
			quickSummary: '',
		};
	}

	if (language === 'cs') {
		return {
			whatsDifferentVsRecentDays: [
				'Živý RSS cluster pro ranní brief je prázdný — přecházíme na neutrální šablonu.',
				'Chybí řetěz titulků pro jeden driver.',
			],
			tldr: [
				'Bez dominantního tématu z titulků → pracovní předpoklad je konsolidace / obousměrné riziko.',
				'Orientace: US500, VIX, EURUSD, XAUUSD ze snapshotu.',
				'Opakujte po návratu položek z /api/news/context.',
			],
			executiveSummary:
				'Nedostatek titulků pro cluster-grounded brief. Statický náčrt ukazuje klíčové reference a neutrální konsolidaci bez vymýšlení katalyzátorů.',
			macro: { usa: [], europe: [], asia: [], geopolitics: [] },
			events: [],
			assets: [
				{
					asset: 'US500',
					currentContext: 'Široké riziko — pásmo bez čerstvého makro impulsu.',
					drivers: 'Likvidita, pozice, čekání na titulky.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Průraz a držení rezistence s podporou breadth.',
					triggerBear: 'Ztráta supportu se rostoucí volatilitou.',
					triggerLogic: 'Nejdřív reakce — potvrďte trend vs. pásmo.',
					historicalBehavior: hist('Pásmo před daty', 'Impuls pak mean reversion', 'Menší size na falešné průlomy.'),
				},
				{
					asset: 'VIX',
					currentContext: 'Měřítko volatility — bez katalyzátorů často klid.',
					drivers: 'Kalendář, tail titulky, toky do akcií.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Šok nebo deleveraging.',
					triggerBear: 'Pomalé poklesy v klidných seancích.',
					triggerLogic: 'Škrtlo rizika, ne samostatný příběh.',
					historicalBehavior: hist('Sebeuspokojení', 'Rychlé přecenění', 'Gap risk.'),
				},
				{
					asset: 'EURUSD',
					currentContext: 'Hlavní USD pár — chop bez jasné sazbové narrace.',
					drivers: 'Diferenciál sazeb, sentiment, pozice.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Slabost USD při risk-on nebo dovish přecenění.',
					triggerBear: 'USD bid při bezpečí nebo hawkish přecenění.',
					triggerLogic: 'Obousměrně, dokud nevznikne cluster.',
					historicalBehavior: hist('Rozsah', 'Průraz na překvapení CB', 'Potvrzení pokračováním.'),
				},
				{
					asset: 'XAUUSD',
					currentContext: 'Útočiště / citlivé na reálné sazby — sledujte USD a volatilitu.',
					drivers: 'Reálné výnosy, geopolitika, USD likvidita.',
					livePrice: '',
					livePriceSource: 'none',
					livePriceAgeHours: 0,
					triggerBull: 'Risk-off nebo klesající reálné výnosy.',
					triggerBear: 'Silný USD a klidný risk tone.',
					triggerLogic: 'Křížově s VIX a USD.',
					historicalBehavior: hist('Stresový bid', 'Útlum při klidu', 'Korelace se mění intraday.'),
				},
			],
			crossAssetLinks: [],
			scenarios: [
				{
					title: 'Návrat titulků',
					if: 'Pipeline RSS/context dodá makro cluster.',
					then: 'Znovu spusťte AI briefing na sklastrovaném vstupu.',
					confirmation: 'Neprázdné položky /api/news/context a stabilní themeKey.',
					crossAssetReaction: 'Přestavte cross-asset triggery kolem nového driveru.',
				},
				{
					title: 'Stále prázdný feed',
					if: 'Stále nula položek z context fetch.',
					then: 'Zůstaňte u statické šablony; ověřte Vercel base URL, cron a RSS.',
					confirmation: 'Logy [narrative-debug] ukazují nulu nebo selhání fetch.',
					crossAssetReaction: 'Bez vynucené narrace — střídmé riziko.',
				},
			],
			quickSummary: '',
		};
	}

	return {
		whatsDifferentVsRecentDays: [
			'Żywy klaster RSS pod poranny brief jest pusty — przechodzimy na neutralny szablon.',
			'Brak łańcucha nagłówków do ustalenia jednego drivera.',
		],
		tldr: [
			'Brak dominującego tematu z nagłówków → założenie robocze to konsolidacja / ryzyko dwukierunkowe.',
			'Orientacja: US500, VIX, EURUSD, XAUUSD ze snapshotu.',
			'Powtórz generację, gdy /api/news/context znów zwróci pozycje.',
		],
		executiveSummary:
			'Niewystarczająca liczba nagłówków pod brief oparty na klastrze. Ten statyczny szkic pokazuje kluczowe odniesienia ryzyka i neutralny kontekst konsolidacji bez wymyślania katalizatorów.',
		macro: { usa: [], europe: [], asia: [], geopolitics: [] },
		events: [],
		assets: [
			{
				asset: 'US500',
				currentContext: 'Szerokie ryzyko — prawdopodobny zakres bez świeżego impulsu makro.',
				drivers: 'Płynność, pozycjonowanie, oczekiwanie na nagłówki.',
				livePrice: '',
				livePriceSource: 'none',
				livePriceAgeHours: 0,
				triggerBull: 'Wybicie i utrzymanie oporu przy wspierającym breadth.',
				triggerBear: 'Utrata wsparcia ze wzrostem zmienności i rotacją defensywną.',
				triggerLogic: 'Najpierw reakcja — potwierdź trend vs zakres przed skalowaniem.',
				historicalBehavior: hist('Zakres przed danymi', 'Impuls potem mean reversion', 'Mniejszy rozmiar na fałszywe wybicia.'),
			},
			{
				asset: 'VIX',
				currentContext: 'Miara zmienności — często stonowana przy braku katalizatorów.',
				drivers: 'Kalendarz, nagłówki ogonowe, przepływy na akcje.',
				livePrice: '',
				livePriceSource: 'none',
				livePriceAgeHours: 0,
				triggerBull: 'Skok przy szoku lub delewarowaniu.',
				triggerBear: 'Stopniowy spadek w spokojnych sesjach.',
				triggerLogic: 'Jako regulator ryzyka, nie osobna opowieść.',
				historicalBehavior: hist('Poczucie komfortu', 'Szybkie wyceny', 'Szacunek do luki ryzyka.'),
			},
			{
				asset: 'EURUSD',
				currentContext: 'Główna para USD — typowy chop bez jasnej narracji stóp.',
				drivers: 'Różnica stóp, sentiment, pozycjonowanie.',
				livePrice: '',
				livePriceSource: 'none',
				livePriceAgeHours: 0,
				triggerBull: 'Osiłabienie USD przy risk-on lub gołębim wycenie USD.',
				triggerBear: 'Popyt na USD przy ucieczce do bezpieczeństwa lub jastrzębim wycenie.',
				triggerLogic: 'Dwukierunkowo do czasu formowania się klastra nagłówków.',
				historicalBehavior: hist('Zakres', 'Wybicie na zaskoczeniu banku centralnego', 'Potwierdź kontynuacją.'),
			},
			{
				asset: 'XAUUSD',
				currentContext: 'Schronienie / wrażliwość na stopy realne — obserwuj USD i zmienność.',
				drivers: 'Stopy realne, ryzyko geopolityczne, płynność USD.',
				livePrice: '',
				livePriceSource: 'none',
				livePriceAgeHours: 0,
				triggerBull: 'Risk-off lub spadające stopy realne jako wsparcie.',
				triggerBear: 'Silny USD i spokojny ton ryzyka jako głowa w dół.',
				triggerLogic: 'Skorelować z VIX i USD przed narracją.',
				historicalBehavior: hist('Popyt w stresie', 'Ochłonięcie przy spokoju', 'Korelacje zmienne w ciągu dnia.'),
			},
		],
		crossAssetLinks: [],
		scenarios: [
			{
				title: 'Powrót nagłówków',
				if: 'Pipeline RSS/context zwraca klaster makro.',
				then: 'Ponownie uruchom briefing AI na wejściu sklastrowanym.',
				confirmation: 'Niepuste pozycje /api/news/context i stabilny themeKey.',
				crossAssetReaction: 'Przebuduj triggery cross-asset wokół nowego drivera.',
			},
			{
				title: 'Nadal pusty feed',
				if: 'Nadal zero pozycji z pobrania context.',
				then: 'Zostań przy szablonie statycznym; sprawdź URL bazowy Vercel, cron i fetch RSS.',
				confirmation: 'Logi [narrative-debug] pokazują zero lub błąd fetch.',
				crossAssetReaction: 'Bez wymuszonej narracji — umiarkuj ryzyko.',
			},
		],
		quickSummary: '',
	};
}
