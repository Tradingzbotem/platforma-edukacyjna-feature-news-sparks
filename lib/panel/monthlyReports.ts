export type AssetType = 'STOCK' | 'INDEX_CFD' | 'FX_CFD';
export type DirectionHint = 'UP' | 'DOWN';

export type KeyEvent = {
	date: string; // ISO
	name: string;
	importance: 'low' | 'medium' | 'high';
	playbookSlug?: string;
	whatToWatch: string;
};

export type Scenario = {
	name: string;
	conditions: string[];
	whatToCheck: string[];
	commonTraps: string[];
};

export type MoveExample = {
	label: string;
	assetType: AssetType;
	instrument: string;
	movePct: number; // e.g. 2.5 for +2.5%
	directionHint?: DirectionHint;
	leverageDefault?: number;
	notes?: string;
};

export type QuizQuestion = {
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
};

export type MonthlyChecklist = {
	preData: string[]; // „Przed ważnymi danymi”
	onRelease: string[]; // „W dniu publikacji”
	postDebrief: string[]; // „Po publikacji (debrief)”
};

export type MonthlyReport = {
	ym: string; // YYYY-MM
	title: string;
	tldr: string;
	narrative: string;
	whatHappened: string[];
	whyItMoved: string[];
	keyEvents: KeyEvent[];
	scenarios: Scenario[];
	pitfalls: string[];
	checklist: MonthlyChecklist;
	quiz: QuizQuestion[];
	movesForCalculator: MoveExample[];
	tags?: string[];
};

// Placeholder "premium" content in Polish. Ruchy rynkowe oznaczone jako przykładowe — EDU ONLY.
const SAMPLE_REPORTS: MonthlyReport[] = [
	{
		ym: '2026-01',
		title: 'Styczeń 2026 — Płynne przejście po końcu roku i test apetytu na ryzyko',
		tldr:
			'Rynek wchodzi w nowy rok z mieszanym sentymentem: technologia trzyma impet, ale obliga i USD dyktują warunki złotu i FX. ' +
			'Kluczowe będą pierwsze odczyty inflacyjne i ton banków centralnych.',
		narrative:
			'Główna narracja: „co dalej ze ścieżką stóp?” oraz „czy breadth poprawi się poza liderami technologii?”. ' +
			'Rynek jest wrażliwy na niespodzianki w CPI/PCE oraz na kierunek rentowności. Zmienność umiarkowana, ale podatna na skoki przy publikacjach.',
		whatHappened: [
			'Technologia utrzymała przewagę, choć rotacje sektorowe były widoczne.',
			'Złoto reagowało na USD i real yields, a ruchy były „szarpane” przy danych.',
			'Na FX DXY wyznaczał kierunek dla par EURUSD/GBPUSD (EDU).',
		],
		whyItMoved: [
			'Zaskoczenia w danych inflacyjnych i rynku pracy zmieniały oczekiwania wobec ścieżki stóp.',
			'Komentarze bankierów centralnych zwiększały wrażliwość na każdy odczyt (repricing).',
			'Sezon wyników technologii wpływał na nastroje indeksów growth.',
		],
		keyEvents: [
			{
				date: '2026-01-10',
				name: 'US CPI',
				importance: 'high',
				playbookSlug: 'cpi-usa',
				whatToWatch: 'Odchylenie od konsensusu i reakcja rentowności 10Y; wpływ na USD.',
			},
			{
				date: '2026-01-20',
				name: 'US NFP',
				importance: 'high',
				playbookSlug: 'nfp',
				whatToWatch: 'Jakość raportu: płace, revisions, U-3. Ryzyko gwałtownych pierwszych 15 min.',
			},
			{
				date: '2026-01-28',
				name: 'PCE Core',
				importance: 'medium',
				whatToWatch: 'Czy trend potwierdza CPI? Rynek porówna z ostatnim komunikatem Fed.',
			},
		],
		scenarios: [
			{
				name: 'Scenariusz A — Inflacja mięknie',
				conditions: [
					'Seria odczytów poniżej oczekiwań',
					'Spadek rentowności 10Y oraz VIX bez wybicia',
				],
				whatToCheck: [
					'Czy breadth rynku akcji się poprawia',
					'Potwierdzenie na USD (słabszy DXY) i złocie',
				],
				commonTraps: [
					'Fałszywe wybicia tuż po publikacji',
					'Ignorowanie rewizji w danych',
				],
			},
			{
				name: 'Scenariusz B — Inflacja „lepka”',
				conditions: [
					'Core utrzymuje się powyżej oczekiwań',
					'Rentowności w górę, USD silniejszy',
				],
				whatToCheck: [
					'Jak reagują megacaps vs reszta',
					'Zachowanie złota przy mocnym USD',
				],
				commonTraps: ['Overtrade w pierwszych 5–10 min', 'Brak stopu przy skoku zmienności'],
			},
			{
				name: 'Scenariusz C — Mieszane sygnały',
				conditions: ['CPI i PCE rozchodzą się', 'Rynek pracy pozostaje mocny'],
				whatToCheck: ['Ton banku centralnego', 'Kierunek real yields'],
				commonTraps: ['Zbyt szybkie wnioski z jednego wydruku', 'Pomijanie płynności w sesji azjatyckiej'],
			},
		],
		pitfalls: [
			'„Narracja dnia” potrafi się odwrócić po konferencji banku centralnego.',
			'Wysoka dźwignia przy danych — ryzyko margin i stop-out (EDU).',
		],
		checklist: {
			preData: [
				'Sprawdź konsensus i widełki oczekiwań',
				'Zaznacz kluczowe poziomy techniczne',
				'Znaj kierunek i siłę USD oraz 10Y',
			],
			onRelease: [
				'Nie goń pierwszej świecy',
				'Sprawdź rewizje i składniki raportu',
				'Zachowaj dyscyplinę ryzyka (max strata na plan)',
			],
			postDebrief: [
				'Zapisz wnioski: co rynek uznał za ważne',
				'Czy scenariusze miały sens? Co poprawić',
				'Zaktualizuj watchlistę i poziomy',
			],
		},
		quiz: [
			{
				question: 'Co zwykle najbardziej porusza złoto w krótkim terminie?',
				options: ['S&P500 breadth', 'Real yields i USD', 'Cena ropy', 'Wyniki spółek energetycznych'],
				correctIndex: 1,
				explanation:
					'W krótkim terminie złoto jest wrażliwe na real yields i USD. To uogólnienie EDU — nie rekomendacja.',
			},
			{
				question: 'Jakie ryzyko jest typowe w pierwszych minutach po CPI/NFP?',
				options: ['Niska zmienność', 'Fałszywe wybicia i poślizg', 'Brak reakcji rynku', 'Zawsze kierunek zgodny z danymi'],
				correctIndex: 1,
				explanation: 'Pierwsze minuty bywają chaotyczne: slippage, szerokie spready i odwrót po pierwszej reakcji.',
			},
			{
				question: 'Co to oznacza „breadth rynku akcji”?',
				options: [
					'Ilość spółek biorących udział w ruchu indeksu',
					'Wolumen na kontraktach terminowych',
					'Zmiany w polityce fiskalnej',
					'Liczba nowych spółek na giełdzie',
				],
				correctIndex: 0,
				explanation: 'Breadth to szerokość ruchu — ilu uczestników/spółek ciągnie indeks w danym kierunku.',
			},
			{
				question: 'Dlaczego rewizje danych są ważne?',
				options: [
					'Bo są publikowane wcześniej niż raport',
					'Bo mogą zmienić interpretację poprzednich reakcji rynku',
					'Bo wpływają tylko na rynki towarowe',
					'Bo banki centralne je ignorują',
				],
				correctIndex: 1,
				explanation: 'Rewizje potrafią przeformatować wnioski z poprzednich miesięcy — EDU.',
			},
			{
				question: 'Które stwierdzenie o dźwigni jest prawdziwe (EDU)?',
				options: [
					'Działa tylko na zyski',
					'Działa w obie strony i zwiększa ryzyko margin/stop-out',
					'Zawsze poprawia wynik netto',
					'Nie ma znaczenia przy publikacji danych',
				],
				correctIndex: 1,
				explanation:
					'Dźwignia zwiększa wynik dodatni i ujemny. Uproszczona symulacja nie uwzględnia wszystkich kosztów i wymogów depozytu.',
			},
		],
		movesForCalculator: [
			{ label: 'NVDA', assetType: 'STOCK', instrument: 'NVDA', movePct: 7.5, directionHint: 'UP', notes: 'Sezon wyników — EDU przykładowy ruch.' },
			{ label: 'AAPL', assetType: 'STOCK', instrument: 'AAPL', movePct: 3.2, directionHint: 'UP' },
			{ label: 'US100', assetType: 'INDEX_CFD', instrument: 'US100', movePct: 2.1, directionHint: 'UP', leverageDefault: 20, notes: 'Wzrost impetu w tech — EDU.' },
			{ label: 'SPX500', assetType: 'INDEX_CFD', instrument: 'SPX500', movePct: 1.4, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'XAUUSD', assetType: 'FX_CFD', instrument: 'XAUUSD', movePct: -1.8, directionHint: 'DOWN', leverageDefault: 20, notes: 'Silniejszy USD i real yields — EDU.' },
			{ label: 'DXY', assetType: 'FX_CFD', instrument: 'DXY', movePct: 1.2, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'CL-Oil', assetType: 'FX_CFD', instrument: 'OIL', movePct: 2.9, directionHint: 'UP', leverageDefault: 10, notes: 'Nagłówki geopolityczne — EDU.' },
			{ label: 'EURUSD', assetType: 'FX_CFD', instrument: 'EURUSD', movePct: -0.9, directionHint: 'DOWN', leverageDefault: 30 },
		],
		tags: ['CPI', 'PCE', 'USD', 'Tech'],
	},
	{
		ym: '2025-12',
		title: 'Grudzień 2025 — Końcówka roku i przepływy księgowe',
		tldr:
			'Sezon zamykania roku przynosi niestandardowe przepływy. Wrażliwość na komunikację banków centralnych oraz rotacje pod bilanse.',
		narrative:
			'Główna narracja: zamknięcie ksiąg i pozycjonowanie na styczeń. Zmienność umiarkowana, ale „szarpana” w oknach niskiej płynności.',
		whatHappened: [
			'Na indeksach widoczne były rajdy „window dressing” i realizacje zysków.',
			'Rynki FX reagowały głównie na USD i różnice stóp.',
			'Złoto przeplatało rajdy defensywne z korektami po rentownościach.',
		],
		whyItMoved: [
			'Przepływy funduszy i domykanie pozycji',
			'Oczekiwania wobec styczniowych danych inflacyjnych',
			'Komentarze banków centralnych',
		],
		keyEvents: [
			{
				date: '2025-12-13',
				name: 'Posiedzenie Fed',
				importance: 'high',
				playbookSlug: 'fomc',
				whatToWatch: 'Projekcje i dot-plot. Ton konferencji.',
			},
			{
				date: '2025-12-18',
				name: 'US CPI',
				importance: 'high',
				playbookSlug: 'cpi-usa',
				whatToWatch: 'Czy potwierdza trend spowolnienia?',
			},
		],
		scenarios: [
			{
				name: 'Scenariusz A — Uspokojenie inflacji',
				conditions: ['CPI i PCE spadają', 'Gołębi ton w komunikacji'],
				whatToCheck: ['Breadth rynku', 'Przepływy do growth'],
				commonTraps: ['Overconfidence w niskiej płynności', 'Ignorowanie spreadów'],
			},
			{
				name: 'Scenariusz B — Zaskoczenie w górę',
				conditions: ['CPI core > konsensus', 'USD w górę, złoto w dół'],
				whatToCheck: ['Reakcja 10Y', 'Czy ruch nie był zdyskontowany'],
				commonTraps: ['Gonienie pierwszej świecy', 'Brak planu B'],
			},
			{
				name: 'Scenariusz C — Brak jednoznaczności',
				conditions: ['Rozbieżności w komponentach', 'Brak jasnego tonu banków'],
				whatToCheck: ['Zachowanie defensywnych sektorów', 'Wolumen i breadth'],
				commonTraps: ['Przeintelektualizowanie jednego raportu', 'Zbyt duży rozmiar pozycji'],
			},
		],
		pitfalls: ['Niska płynność = poślizgi, szerokie spready', 'Zbyt silne znaczenie nagłówków prasowych'],
		checklist: {
			preData: ['Kalendarz i konsensus', 'Poziomy techniczne', 'Ryzyko par FX zależnych od USD'],
			onRelease: ['Nie handluj w szumie', 'Sprawdź rewizje', 'Zabezpiecz ryzyko'],
			postDebrief: ['Notatka: co działało', 'Aktualizacja scenariuszy', 'Porządek w watchliście'],
		},
		quiz: [
			{
				question: 'Który czynnik często zmienia zachowanie rynku w grudniu?',
				options: ['Sezon wyników', 'Zamykanie roku i przepływy', 'Zwiększona płynność', 'Brak publikacji danych'],
				correctIndex: 1,
				explanation: 'Końcówka roku to nietypowe przepływy i bilanse — EDU.',
			},
			{
				question: 'Co sprawdzić w pierwszej kolejności po CPI?',
				options: ['Wyłącznie headline', 'Rewizje i core', 'Tylko reakcję złota', 'Wiadomości na Twitterze'],
				correctIndex: 1,
				explanation: 'Rewizje i core często zmieniają interpretację headline — EDU.',
			},
		],
		movesForCalculator: [
			{ label: 'AAPL', assetType: 'STOCK', instrument: 'AAPL', movePct: 2.4, directionHint: 'UP' },
			{ label: 'NVDA', assetType: 'STOCK', instrument: 'NVDA', movePct: -3.1, directionHint: 'DOWN' },
			{ label: 'US100', assetType: 'INDEX_CFD', instrument: 'US100', movePct: 1.6, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'SPX500', assetType: 'INDEX_CFD', instrument: 'SPX500', movePct: 0.9, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'XAUUSD', assetType: 'FX_CFD', instrument: 'XAUUSD', movePct: 1.1, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'DXY', assetType: 'FX_CFD', instrument: 'DXY', movePct: -0.8, directionHint: 'DOWN', leverageDefault: 20 },
			{ label: 'OIL', assetType: 'FX_CFD', instrument: 'OIL', movePct: 2.2, directionHint: 'UP', leverageDefault: 10 },
			{ label: 'EURUSD', assetType: 'FX_CFD', instrument: 'EURUSD', movePct: 0.7, directionHint: 'UP', leverageDefault: 30 },
		],
		tags: ['FOMC', 'CPI', 'USD'],
	},
	{
		ym: '2025-11',
		title: 'Listopad 2025 — Rynek szuka równowagi po seriach danych',
		tldr:
			'Wielomiesięczne narracje testowane przez kolejne wydruki: rynek reaguje bardziej na odchylenia niż na trend nagłówków.',
		narrative:
			'Główna narracja: czy presja cen bazowych słabnie wystarczająco, by poluzować warunki finansowe. Uwaga na różnice USA vs Europa.',
		whatHappened: [
			'Indeksy amerykańskie kontynuowały ruch z rotacjami sektorowymi.',
			'FX kierowany przez USD i różnice stóp, metale reagowały odwrotnie do real yields.',
			'Ropa pozostawała podatna na nagłówki geopolityczne.',
		],
		whyItMoved: [
			'Oczekiwania wobec ścieżki stóp',
			'Zaskoczenia w danych i konferencje banków',
			'Breadth i wolumen przy wybiciach',
		],
		keyEvents: [
			{
				date: '2025-11-07',
				name: 'US NFP',
				importance: 'high',
				playbookSlug: 'nfp',
				whatToWatch: 'Płace i rewizje. Pierwsze 15 min może być mylące.',
			},
			{
				date: '2025-11-14',
				name: 'US CPI',
				importance: 'high',
				playbookSlug: 'cpi-usa',
				whatToWatch: 'Core vs headline. Reakcja 10Y i USD.',
			},
		],
		scenarios: [
			{
				name: 'Scenariusz A — „Miękko” w danych',
				conditions: ['Core < konsensus', 'Spadek 10Y'],
				whatToCheck: ['Breadth SPX/NDX', 'Zachowanie złota i USD'],
				commonTraps: ['Nadinterpretacja jednego wydruku', 'Ignorowanie rewizji'],
			},
			{
				name: 'Scenariusz B — „Twardo” w danych',
				conditions: ['Core > konsensus', 'USD silniejszy'],
				whatToCheck: ['Czy tech trzyma impet', 'Metale przemysłowe vs USD'],
				commonTraps: ['Gonienie pierwszej świecy', 'Za duży rozmiar pozycji'],
			},
			{
				name: 'Scenariusz C — Mieszane',
				conditions: ['Rozbieżności m/m vs y/y', 'Komunikacja banku niejednoznaczna'],
				whatToCheck: ['Rynek długu', 'Szerokość ruchu akcji'],
				commonTraps: ['Brak planu B/C', 'Brak stopu w publikacji'],
			},
		],
		pitfalls: ['Przerysowane reakcje na nagłówki', 'Brak kontroli ekspozycji przy dźwigni (EDU)'],
		checklist: {
			preData: ['Konsensus i zakresy', 'Poziomy techniczne i alerty', 'Plan A/B/C spisany'],
			onRelease: ['Sprawdź pełny raport i rewizje', 'Poczekaj na potwierdzenie', 'Ryzyko dostosowane do zmienności'],
			postDebrief: ['Co uznał rynek za ważne', 'Czy scenariusze były trafne (EDU)', 'Aktualizuj wnioski'],
		},
		quiz: [
			{
				question: 'Co to jest „breadth” w praktyce?',
				options: ['Szerokość świec', 'Liczba spółek ciągnących indeks', 'Różnica bid-ask', 'Wolumen na futures'],
				correctIndex: 1,
				explanation: 'Breadth = ilu „uczestników” ciągnie indeks — EDU.',
			},
		],
		movesForCalculator: [
			{ label: 'NVDA', assetType: 'STOCK', instrument: 'NVDA', movePct: 5.4, directionHint: 'UP' },
			{ label: 'AAPL', assetType: 'STOCK', instrument: 'AAPL', movePct: -1.7, directionHint: 'DOWN' },
			{ label: 'US100', assetType: 'INDEX_CFD', instrument: 'US100', movePct: 1.9, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'SPX500', assetType: 'INDEX_CFD', instrument: 'SPX500', movePct: 1.1, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'XAUUSD', assetType: 'FX_CFD', instrument: 'XAUUSD', movePct: 0.8, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'DXY', assetType: 'FX_CFD', instrument: 'DXY', movePct: 0.6, directionHint: 'UP', leverageDefault: 20 },
			{ label: 'OIL', assetType: 'FX_CFD', instrument: 'OIL', movePct: -2.3, directionHint: 'DOWN', leverageDefault: 10 },
			{ label: 'EURUSD', assetType: 'FX_CFD', instrument: 'EURUSD', movePct: 0.5, directionHint: 'UP', leverageDefault: 30 },
		],
		tags: ['NFP', 'CPI', 'USD'],
	},
];

export function getMonthlyReports(): MonthlyReport[] {
	// Most recent first
	return [...SAMPLE_REPORTS].sort((a, b) => (a.ym < b.ym ? 1 : -1));
}

export function getMonthlyReport(ym: string): MonthlyReport | undefined {
	return SAMPLE_REPORTS.find((r) => r.ym === ym);
}

export function searchMonthlyReports(query: string): MonthlyReport[] {
	const q = query.trim().toLowerCase();
	if (!q) return getMonthlyReports();
	return getMonthlyReports().filter((r) => {
		const hay = `${r.title} ${r.tldr} ${(r.tags || []).join(' ')} ${r.narrative}`.toLowerCase();
		return hay.includes(q);
	});
}

export type {
	MonthlyReport as EduMonthlyReport,
	QuizQuestion as EduQuizQuestion,
	MoveExample as EduMoveExample,
	Scenario as EduScenario,
	KeyEvent as EduKeyEvent,
	MonthlyChecklist as EduMonthlyChecklist,
};


