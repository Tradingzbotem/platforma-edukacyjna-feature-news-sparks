import type { MorningInstitutionalDepth, MorningInstitutionalLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import type { BriefingQuestionDifficulty } from '@/lib/brief/morningBriefingQuestionsTypes';

const DATE_LOCALE: Record<MorningInstitutionalLanguage, string> = {
  pl: 'pl-PL',
  en: 'en-GB',
  cs: 'cs-CZ',
};

export function formatBriefingDateTime(at: Date, lang: MorningInstitutionalLanguage): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(at);
}

export type MorningBriefingLocale = {
  pageTitle: string;
  pageSubtitle: string;
  controlPanel: string;
  labelLanguage: string;
  labelDepth: string;
  depthShort: string;
  depthLong: string;
  labelBriefingFormat: string;
  optFormatStructured: string;
  optFormatNarrative: string;
  manualSectionTitle: string;
  labelUseManualTheme: string;
  labelManualThemeTitle: string;
  labelManualNarrative: string;
  labelManualAssets: string;
  labelNarrativeHorizon: string;
  labelManualMode: string;
  optHorizonToday: string;
  optHorizon23Days: string;
  optHorizonWeekly: string;
  optModeAuto: string;
  optModeManualOnly: string;
  optModeManualPlus: string;
  manualSectionHint: string;
  errorManualThemeRequired: string;
  exportBriefingTxt: string;
  exportGlossaryTxt: string;
  /** Nagłówek dokumentu TXT słowniczka */
  glossaryDocTitle: string;
  /** Eksport TXT — etykieta „powiązany briefing” (wartość: język + zakres briefingu) */
  glossaryLinkedBriefingLine: string;
  /** Nagłówek TXT: język treści słowniczka */
  txtGlossaryLanguage: string;
  /** UI: etykieta selectu języka słowniczka */
  labelGlossaryLanguage: string;
  /** UI: tytuł podsekcji słowniczka */
  glossarySectionTitle: string;
  glossaryDefLabel: string;
  glossaryWhyHereLabel: string;
  generateBriefing: string;
  generating: string;
  briefingIdleHint: string;
  briefingLoading: string;
  briefingSuccess: string;
  /** Sukces, gdy briefing jest w trybie compact (jakość wejścia). */
  briefingSuccessCompact: string;
  briefingSuccessNarrative: string;
  /** Compact fallback — główny tytuł karty. */
  compactCardTitle: string;
  compactCardSubtitle: string;
  compactSecDetected: string;
  compactSecMissing: string;
  compactSecWatch: string;
  compactDetectedDefault: string;
  compactMissingLine1: string;
  compactMissingLine2: string;
  compactMissingLine3: string;
  errorGeneric: string;
  errorUnknown: string;
  errorRequestFailed: (status: number) => string;
  errorNoBriefingField: string;
  secWhatsDifferentToday: string;
  secTldr: string;
  secExecutiveSummary: string;
  secMacro: string;
  secEvents: string;
  secAssets: string;
  secCrossAsset: string;
  secScenarios: string;
  secQuickSummary: string;
  narrativeSecEventPriorityFilter: string;
  narrativeLabelHeadlineEvent: string;
  narrativeLabelPrimaryDriver: string;
  narrativeLabelTopThreeRank: string;
  narrativeLabelChannelsImpact: string;
  narrativeTierHigh: string;
  narrativeTierMedium: string;
  narrativeSecEventShift: string;
  narrativeMetaDominantEvent: string;
  narrativeMetaScenarioPivot: string;
  /** Prefiks wiersza warunkowego (IF → THEN) */
  narrativeForwardIfPrefix: string;
  /** Akapity po triple wejściu — kontynuacja rozmowy na desku */
  narrativeSecDeskContinuation: string;
  narrativeSecMainComment: string;
  narrativeSecUpdates: string;
  narrativeSecScenarios: string;
  narrativeSecGlossary: string;
  questionsDisabledNarrative: string;
  glossaryNarrativeHint: string;
  regionUsa: string;
  regionEurope: string;
  regionAsia: string;
  regionGeopolitics: string;
  fldWhatHappened: string;
  fldWhyMatters: string;
  fldMarketImpact: string;
  emptyDash: string;
  emptyNoEntries: string;
  emptyNoWhatsDifferent: string;
  emptyNoTldr: string;
  emptyNoExecutive: string;
  emptyNoEvents: string;
  emptyNoAssets: string;
  emptyNoCrossAsset: string;
  emptyNoScenarios: string;
  emptyNoQuickSummary: string;
  emptyNoAnalogies: string;
  fldExpectations: string;
  fldBullCase: string;
  fldBearCase: string;
  fldContext: string;
  fldDrivers: string;
  fldLivePrice: string;
  /** Admin / TXT — cena z API */
  assetPriceBadgeLive: string;
  /** Admin — subtelna etykieta dla świeżego override */
  assetPriceBadgeOverride: string;
  txtExportAssetPriceLive: (price: string) => string;
  txtExportAssetPriceOverride: (price: string, hours: number) => string;
  fldTriggerBull: string;
  fldTriggerBear: string;
  fldTriggerLogic: string;
  secHistoricalAnalogies: string;
  fldSetup: string;
  fldReaction: string;
  fldLesson: string;
  fldIf: string;
  fldThen: string;
  fldConfirmation: string;
  fldCrossAssetReaction: string;
  questionsPanelTitle: string;
  generateQuestions: string;
  exportQuestionsTxt: string;
  questionsLoading: string;
  questionsSuccess: string;
  questionsIdleHint: string;
  questionsErrorGeneric: string;
  questionsErrorRequestFailed: (status: number) => string;
  questionsErrorNoPack: string;
  secQuestionsBlock: string;
  fldOptions: string;
  fldCorrectAnswer: string;
  fldExplanation: string;
  fldDifficulty: string;
  fldSourceSection: string;
  modelAnswerOpenText: string;
  typeSingleChoice: string;
  typeOpenText: string;
  diffEasy: string;
  diffMedium: string;
  diffHard: string;
  emptyNoQuestions: string;
  optionLetter: (i: number) => string;
  /** TXT — briefing */
  txtMorningBriefingTitle: string;
  txtGeneratedAt: string;
  txtLanguage: string;
  txtDepth: string;
  txtLanguageValue: string;
  txtDepthValue: (d: MorningInstitutionalDepth) => string;
  txtNone: string;
  txtWhatsDifferentToday: string;
  txtWhatMovesToday: string;
  txtExecSummary: string;
  txtMacro: string;
  txtEvents: string;
  txtAssets: string;
  txtCrossAsset: string;
  txtScenarios: string;
  txtQuickSummary: string;
  /** TXT — questions */
  txtQuestionsDocTitle: string;
  txtTitle: string;
  txtIntro: string;
  txtQuestionPrefix: (n: number, type: string) => string;
  txtCorrectAnswer: string;
  txtLevel: string;
};

const PL: MorningBriefingLocale = {
  pageTitle: 'Poranny briefing',
  pageSubtitle: 'Ręczne generowanie długiego briefingu makro, geopolityki i wpływu na aktywa.',
  controlPanel: 'Panel sterowania',
  labelLanguage: 'Język',
  labelDepth: 'Zakres',
  depthShort: 'Krótki (short)',
  depthLong: 'Długi (long)',
  labelBriefingFormat: 'Format briefingu',
  optFormatStructured: 'structured (modułowy — legacy)',
  optFormatNarrative: 'narrative (komentarz redakcyjny)',
  manualSectionTitle: 'Ręczny driver narracji',
  labelUseManualTheme: 'Użyj ręcznie zadanego tematu',
  labelManualThemeTitle: 'Temat główny',
  labelManualNarrative: 'Opis narracji / kontekst',
  labelManualAssets: 'Powiązane aktywa (CSV, np. BRENT, XAUUSD, US500)',
  labelNarrativeHorizon: 'Horyzont narracji',
  labelManualMode: 'Tryb',
  optHorizonToday: 'Dziś (sesja / dzień)',
  optHorizon23Days: '2–3 dni',
  optHorizonWeekly: 'Tydzień',
  optModeAuto: 'auto — tylko RSS / selekcja z newsów',
  optModeManualOnly: 'manual_only — głównie operator, bez RSS jako tematu',
  optModeManualPlus: 'manual_plus_live_context — operator + RSS tylko pomocniczo',
  manualSectionHint:
    'Gdy tryb ≠ auto i zaznaczysz przełącznik, API traktuje temat operatora jako jedyny główny driver. Aktywa: etykiety kanoniczne (US500, US100, DE40, EURUSD, XAUUSD, BRENT, USDJPY, VIX).',
  errorManualThemeRequired: 'Podaj temat główny albo wyłącz ręczny driver / ustaw tryb „auto”.',
  exportBriefingTxt: 'Eksportuj briefing do TXT',
  exportGlossaryTxt: 'Eksportuj słowniczek do TXT',
  glossaryDocTitle: 'Słowniczek pojęć',
  glossaryLinkedBriefingLine: 'Powiązany briefing',
  txtGlossaryLanguage: 'Język słowniczka',
  labelGlossaryLanguage: 'Język słowniczka',
  glossarySectionTitle: 'Słowniczek pojęć',
  glossaryDefLabel: 'Definicja',
  glossaryWhyHereLabel: 'Dlaczego ma znaczenie tutaj',
  generateBriefing: 'Generuj briefing',
  generating: 'Generowanie…',
  briefingIdleHint: 'Wybierz język i zakres, następnie uruchom generowanie. Podgląd pojawi się poniżej.',
  briefingLoading: 'Generowanie briefingu… Długi tryb może trwać kilka minut.',
  briefingSuccess: 'Briefing wygenerowany. Poniżej pełna treść (nie jest zapisywana w bazie).',
  briefingSuccessCompact:
    'Briefing wygenerowany w trybie skróconym: kanał RSS dał zbyt mało spójnych, potwierdzonych sygnałów na pełny raport.',
  briefingSuccessNarrative:
    'Briefing narracyjny wygenerowany. Poniżej komentarz w formie ciągłej narracji (nie jest zapisywany w bazie).',
  compactCardTitle: 'Skrócony widok briefingu',
  compactCardSubtitle:
    'Zachowujemy wiarygodność: zamiast sztucznie wypełniać makro, wydarzenia i aktywa, pokazujemy tylko to, co da się uzasadnić danymi.',
  compactSecDetected: 'Co wykryliśmy',
  compactSecMissing: 'Czego brakuje do pełnego briefingu',
  compactSecWatch: 'Najbliższy sensowny kierunek obserwacji',
  compactDetectedDefault:
    'W strumieniu nagłówków nie ma w tej chwili wystarczająco spójnego, jednoznacznego wątku, który dałoby się rozwinąć bez domysłów.',
  compactMissingLine1: 'Świeżych, powtarzalnych nagłówków na jeden dominujący temat (klaster) albo ich jednoznaczny opis w wejściu.',
  compactMissingLine2: 'Potwierdzonych poziomów / kotwic cenowych tam, gdzie snapshot nie dostarcza LIVE ani świeżego override.',
  compactMissingLine3: 'Wystarczającej głębi przy aktywach (kontekst + czynniki + triggery), by uniknąć generycznych kart „dla zasady”.',
  errorGeneric: 'Wystąpił błąd.',
  errorUnknown: 'Nieznany błąd.',
  errorRequestFailed: (status) => `Żądanie nie powiodło się (HTTP ${status}).`,
  errorNoBriefingField: 'Odpowiedź API nie zawiera obiektu briefing.',
  secWhatsDifferentToday: 'Co dziś jest inne (vs ostatnie dni)',
  secTldr: 'Co naprawdę porusza rynek dziś',
  secExecutiveSummary: 'Executive summary',
  secMacro: 'Makro',
  secEvents: 'Wydarzenia',
  secAssets: 'Aktywa',
  secCrossAsset: 'Cross-asset',
  secScenarios: 'Scenariusze',
  secQuickSummary: 'Szybkie podsumowanie',
  narrativeSecEventPriorityFilter: 'Filtr priorytetów wydarzeń (12–24h)',
  narrativeLabelHeadlineEvent: 'Najważniejsze wydarzenie:',
  narrativeLabelPrimaryDriver: 'Główny driver',
  narrativeLabelTopThreeRank: 'TOP 3 wydarzenia',
  narrativeLabelChannelsImpact: 'Wpływ: ropa · indeksy · FX · VIX',
  narrativeTierHigh: 'Wysoki',
  narrativeTierMedium: 'Średni',
  narrativeSecEventShift: 'Zmiana narracji (12–24h)',
  narrativeMetaDominantEvent: 'Driver / wydarzenie',
  narrativeMetaScenarioPivot: 'Scenariusz → scenariusz',
  narrativeForwardIfPrefix: 'JEŚLI',
  narrativeSecDeskContinuation: 'Na desku (cd.)',
  narrativeSecMainComment: 'Główny komentarz',
  narrativeSecUpdates: 'Aktualizacje',
  narrativeSecScenarios: 'Co dalej?',
  narrativeSecGlossary: 'Słownik pojęć',
  questionsDisabledNarrative: 'Pytania kontrolne są dostępne tylko dla formatu structured.',
  glossaryNarrativeHint:
    'W trybie narrative słownik jest wbudowany w treść — możesz go wyeksportować z sekcji poniżej lub razem z pełnym briefingiem (TXT).',
  regionUsa: 'USA',
  regionEurope: 'Europa',
  regionAsia: 'Azja',
  regionGeopolitics: 'Geopolityka',
  fldWhatHappened: 'Co się dzieje',
  fldWhyMatters: 'Dlaczego to ważne',
  fldMarketImpact: 'Wpływ na rynek',
  emptyDash: '—',
  emptyNoEntries: 'Brak wpisów.',
  emptyNoWhatsDifferent: 'Brak punktów dla tej sekcji.',
  emptyNoTldr: 'Brak punktów dla tej sekcji.',
  emptyNoExecutive: 'Brak executive summary.',
  emptyNoEvents: 'Brak wydarzeń w odpowiedzi.',
  emptyNoAssets: 'Brak aktywów w odpowiedzi.',
  emptyNoCrossAsset: 'Brak powiązań cross-asset.',
  emptyNoScenarios: 'Brak scenariuszy.',
  emptyNoQuickSummary: 'Brak szybkiego podsumowania.',
  emptyNoAnalogies: 'Brak analogii w odpowiedzi.',
  fldExpectations: 'Oczekiwania',
  fldBullCase: 'Bull case',
  fldBearCase: 'Bear case',
  fldContext: 'Kontekst',
  fldDrivers: 'Czynniki',
  fldLivePrice: 'Cena live',
  assetPriceBadgeLive: 'Cena bieżąca',
  assetPriceBadgeOverride: 'Cena referencyjna: override <12h',
  txtExportAssetPriceLive: (price) => `Cena bieżąca: ${price}`,
  txtExportAssetPriceOverride: (price, hours) =>
    `Cena referencyjna: ${price} (override, ${hours.toFixed(1)}h temu)`,
  fldTriggerBull: 'Trigger (bull)',
  fldTriggerBear: 'Trigger (bear)',
  fldTriggerLogic: 'Logika triggerów',
  secHistoricalAnalogies: 'Historyczne zachowanie / analogie',
  fldSetup: 'Setup',
  fldReaction: 'Reakcja',
  fldLesson: 'Lekcja',
  fldIf: 'Jeśli',
  fldThen: 'Wtedy',
  fldConfirmation: 'Potwierdzenie',
  fldCrossAssetReaction: 'Reakcja cross-asset',
  questionsPanelTitle: 'Pytania do briefingu',
  generateQuestions: 'Generuj pytania',
  exportQuestionsTxt: 'Eksportuj pytania do TXT',
  questionsLoading: 'Generowanie pytań…',
  questionsSuccess: 'Pytania wygenerowane na podstawie bieżącego briefingu.',
  questionsIdleHint: 'Wygeneruj briefing, potem utwórz pytania sprawdzające zrozumienie treści.',
  questionsErrorGeneric: 'Nie udało się wygenerować pytań.',
  questionsErrorRequestFailed: (status) => `Żądanie pytań nie powiodło się (HTTP ${status}).`,
  questionsErrorNoPack: 'Odpowiedź API nie zawiera poprawnego pakietu pytań.',
  secQuestionsBlock: 'Pytania',
  fldOptions: 'Opcje',
  fldCorrectAnswer: 'Poprawna odpowiedź',
  fldExplanation: 'Wyjaśnienie',
  fldDifficulty: 'Poziom',
  fldSourceSection: 'Sekcja źródłowa',
  modelAnswerOpenText: 'Modelowa odpowiedź',
  typeSingleChoice: 'jednokrotny wybór',
  typeOpenText: 'otwarte',
  diffEasy: 'łatwy',
  diffMedium: 'średni',
  diffHard: 'trudny',
  emptyNoQuestions: 'Brak pytań.',
  optionLetter: (i) => `${String.fromCharCode(65 + i)})`,
  txtMorningBriefingTitle: 'PORANNY BRIEFING',
  txtGeneratedAt: 'Data wygenerowania',
  txtLanguage: 'Język',
  txtDepth: 'Zakres',
  txtLanguageValue: 'Polski (pl)',
  txtDepthValue: (d) => (d === 'long' ? 'Długi (long)' : 'Krótki (short)'),
  txtNone: '(brak)',
  txtWhatsDifferentToday: 'CO DZIŚ JEST INNE (VS OSTATNIE DNI)',
  txtWhatMovesToday: 'CO NAPRAWDĘ PORUSZA RYNEK DZIŚ',
  txtExecSummary: 'STRESZCZENIE WYKONAWCZE',
  txtMacro: 'MAKRO',
  txtEvents: 'WYDARZENIA',
  txtAssets: 'AKTYWA',
  txtCrossAsset: 'CROSS-ASSET',
  txtScenarios: 'SCENARIUSZE',
  txtQuickSummary: 'SZYBKIE PODSUMOWANIE',
  txtQuestionsDocTitle: 'PYTANIA DO BRIEFINGU',
  txtTitle: 'Tytuł',
  txtIntro: 'Wstęp',
  txtQuestionPrefix: (n, type) => `${n}. [${type}]`,
  txtCorrectAnswer: 'Poprawna odpowiedź',
  txtLevel: 'Poziom',
};

const EN: MorningBriefingLocale = {
  pageTitle: 'Morning briefing',
  pageSubtitle: 'Manual generation of an in-depth macro, geopolitics and asset-impact briefing.',
  controlPanel: 'Control panel',
  labelLanguage: 'Language',
  labelDepth: 'Depth',
  depthShort: 'Short',
  depthLong: 'Long',
  labelBriefingFormat: 'Briefing format',
  optFormatStructured: 'structured (modular — legacy)',
  optFormatNarrative: 'narrative (editorial commentary)',
  manualSectionTitle: 'Manual narrative driver',
  labelUseManualTheme: 'Use manually set topic',
  labelManualThemeTitle: 'Primary topic',
  labelManualNarrative: 'Narrative / context',
  labelManualAssets: 'Related assets (comma-separated, e.g. BRENT, XAUUSD, US500)',
  labelNarrativeHorizon: 'Narrative horizon',
  labelManualMode: 'Mode',
  optHorizonToday: 'Today (session / day)',
  optHorizon23Days: '2–3 days',
  optHorizonWeekly: 'Weekly',
  optModeAuto: 'auto — RSS / news selection only',
  optModeManualOnly: 'manual_only — operator-led; RSS not a thematic source',
  optModeManualPlus: 'manual_plus_live_context — operator first; RSS for nuance only',
  manualSectionHint:
    'When mode ≠ auto and the toggle is on, the API locks the operator topic as the only main driver. Assets: canonical labels (US500, US100, DE40, EURUSD, XAUUSD, BRENT, USDJPY, VIX).',
  errorManualThemeRequired: 'Enter a primary topic, or turn off manual driver / set mode to auto.',
  exportBriefingTxt: 'Export briefing to TXT',
  exportGlossaryTxt: 'Export glossary to TXT',
  glossaryDocTitle: 'Glossary of terms',
  glossaryLinkedBriefingLine: 'Related briefing',
  txtGlossaryLanguage: 'Glossary language',
  labelGlossaryLanguage: 'Glossary language',
  glossarySectionTitle: 'Glossary',
  glossaryDefLabel: 'Definition',
  glossaryWhyHereLabel: 'Why it matters here',
  generateBriefing: 'Generate briefing',
  generating: 'Generating…',
  briefingIdleHint: 'Choose language and depth, then run generation. Preview will appear below.',
  briefingLoading: 'Generating briefing… Long mode may take several minutes.',
  briefingSuccess: 'Briefing generated. Full content below (not saved to the database).',
  briefingSuccessCompact:
    'Briefing generated in compact view: the RSS feed did not provide enough coherent, verifiable signals for a full desk-style report.',
  briefingSuccessNarrative:
    'Narrative briefing generated. Below is a continuous editorial-style commentary (not saved to the database).',
  compactCardTitle: 'Compact briefing view',
  compactCardSubtitle:
    'We prioritise credibility: instead of padding macro, events and assets, we only show what the inputs can support.',
  compactSecDetected: 'What we detected',
  compactSecMissing: 'What is missing for a full briefing',
  compactSecWatch: 'Closest sensible line of observation',
  compactDetectedDefault:
    'Headlines do not currently form a sufficiently coherent, single-thread narrative that could be expanded without guesswork.',
  compactMissingLine1: 'Fresh, repeatable headlines anchoring one dominant theme (cluster) or an explicit description of it in the input.',
  compactMissingLine2: 'Confirmed price anchors where the snapshot provides neither LIVE nor a recent override.',
  compactMissingLine3: 'Enough depth on assets (context + drivers + triggers) to avoid generic “placeholder” cards.',
  errorGeneric: 'An error occurred.',
  errorUnknown: 'Unknown error.',
  errorRequestFailed: (status) => `Request failed (HTTP ${status}).`,
  errorNoBriefingField: 'API response does not contain a briefing object.',
  secWhatsDifferentToday: "What's different today (vs recent days)",
  secTldr: 'What actually moves the market today',
  secExecutiveSummary: 'Executive summary',
  secMacro: 'Macro',
  secEvents: 'Events',
  secAssets: 'Assets',
  secCrossAsset: 'Cross-asset',
  secScenarios: 'Scenarios',
  secQuickSummary: 'Quick summary',
  narrativeSecEventPriorityFilter: 'Event priority filter (12–24h)',
  narrativeLabelHeadlineEvent: 'Most important event:',
  narrativeLabelPrimaryDriver: 'Primary driver',
  narrativeLabelTopThreeRank: 'Top 3 events',
  narrativeLabelChannelsImpact: 'Impact: oil · indices · FX · VIX',
  narrativeTierHigh: 'High',
  narrativeTierMedium: 'Medium',
  narrativeSecEventShift: 'Narrative shift (12–24h)',
  narrativeMetaDominantEvent: 'Driver / event',
  narrativeMetaScenarioPivot: 'Scenario → scenario',
  narrativeForwardIfPrefix: 'IF',
  narrativeSecDeskContinuation: 'On the desk (cont’d.)',
  narrativeSecMainComment: 'Main commentary',
  narrativeSecUpdates: 'Updates',
  narrativeSecScenarios: 'What next?',
  narrativeSecGlossary: 'Glossary',
  questionsDisabledNarrative: 'Quiz questions are only available for the structured format.',
  glossaryNarrativeHint:
    'In narrative mode the glossary is part of the generated text — export it from the section below or with the full briefing (TXT).',
  regionUsa: 'USA',
  regionEurope: 'Europe',
  regionAsia: 'Asia',
  regionGeopolitics: 'Geopolitics',
  fldWhatHappened: 'What is happening',
  fldWhyMatters: 'Why it matters',
  fldMarketImpact: 'Market impact',
  emptyDash: '—',
  emptyNoEntries: 'No entries.',
  emptyNoWhatsDifferent: 'No items for this section.',
  emptyNoTldr: 'No items for this section.',
  emptyNoExecutive: 'No executive summary.',
  emptyNoEvents: 'No events in the response.',
  emptyNoAssets: 'No assets in the response.',
  emptyNoCrossAsset: 'No cross-asset links.',
  emptyNoScenarios: 'No scenarios.',
  emptyNoQuickSummary: 'No quick summary.',
  emptyNoAnalogies: 'No historical analogies in the response.',
  fldExpectations: 'Expectations',
  fldBullCase: 'Bull case',
  fldBearCase: 'Bear case',
  fldContext: 'Context',
  fldDrivers: 'Drivers',
  fldLivePrice: 'Live price',
  assetPriceBadgeLive: 'Live price',
  assetPriceBadgeOverride: 'Reference price: override <12h',
  txtExportAssetPriceLive: (price) => `Live price: ${price}`,
  txtExportAssetPriceOverride: (price, hours) =>
    `Reference price: ${price} (override, ${hours.toFixed(1)}h ago)`,
  fldTriggerBull: 'Trigger (bull)',
  fldTriggerBear: 'Trigger (bear)',
  fldTriggerLogic: 'Trigger logic',
  secHistoricalAnalogies: 'Historical behaviour / analogies',
  fldSetup: 'Setup',
  fldReaction: 'Reaction',
  fldLesson: 'Lesson',
  fldIf: 'If',
  fldThen: 'Then',
  fldConfirmation: 'Confirmation',
  fldCrossAssetReaction: 'Cross-asset reaction',
  questionsPanelTitle: 'Briefing quiz',
  generateQuestions: 'Generate questions',
  exportQuestionsTxt: 'Export questions to TXT',
  questionsLoading: 'Generating questions…',
  questionsSuccess: 'Questions generated from the current briefing.',
  questionsIdleHint: 'Generate a briefing first, then create comprehension questions.',
  questionsErrorGeneric: 'Could not generate questions.',
  questionsErrorRequestFailed: (status) => `Questions request failed (HTTP ${status}).`,
  questionsErrorNoPack: 'API response does not contain a valid question pack.',
  secQuestionsBlock: 'Questions',
  fldOptions: 'Options',
  fldCorrectAnswer: 'Correct answer',
  fldExplanation: 'Explanation',
  fldDifficulty: 'Difficulty',
  fldSourceSection: 'Source section',
  modelAnswerOpenText: 'Model answer',
  typeSingleChoice: 'single_choice',
  typeOpenText: 'open_text',
  diffEasy: 'easy',
  diffMedium: 'medium',
  diffHard: 'hard',
  emptyNoQuestions: 'No questions.',
  optionLetter: (i) => `${String.fromCharCode(65 + i)})`,
  txtMorningBriefingTitle: 'MORNING BRIEFING',
  txtGeneratedAt: 'Generated at',
  txtLanguage: 'Language',
  txtDepth: 'Depth',
  txtLanguageValue: 'English (en)',
  txtDepthValue: (d) => (d === 'long' ? 'Long' : 'Short'),
  txtNone: '(none)',
  txtWhatsDifferentToday: "WHAT'S DIFFERENT TODAY (VS RECENT DAYS)",
  txtWhatMovesToday: 'WHAT ACTUALLY MOVES THE MARKET TODAY',
  txtExecSummary: 'EXECUTIVE SUMMARY',
  txtMacro: 'MACRO',
  txtEvents: 'EVENTS',
  txtAssets: 'ASSETS',
  txtCrossAsset: 'CROSS-ASSET',
  txtScenarios: 'SCENARIOS',
  txtQuickSummary: 'QUICK SUMMARY',
  txtQuestionsDocTitle: 'BRIEFING QUESTIONS',
  txtTitle: 'Title',
  txtIntro: 'Introduction',
  txtQuestionPrefix: (n, type) => `${n}. [${type}]`,
  txtCorrectAnswer: 'Correct answer',
  txtLevel: 'Level',
};

const CS: MorningBriefingLocale = {
  pageTitle: 'Ranní briefing',
  pageSubtitle: 'Ruční generování hlubokého briefingu makra, geopolitiky a dopadu na aktiva.',
  controlPanel: 'Ovládací panel',
  labelLanguage: 'Jazyk',
  labelDepth: 'Rozsah',
  depthShort: 'Krátký (short)',
  depthLong: 'Dlouhý (long)',
  labelBriefingFormat: 'Formát briefingu',
  optFormatStructured: 'structured (modulární — legacy)',
  optFormatNarrative: 'narrative (redakční komentář)',
  manualSectionTitle: 'Ruční řízení narrativu',
  labelUseManualTheme: 'Použít ručně zadané téma',
  labelManualThemeTitle: 'Hlavní téma',
  labelManualNarrative: 'Popis narrativu / kontext',
  labelManualAssets: 'Související aktiva (CSV, např. BRENT, XAUUSD, US500)',
  labelNarrativeHorizon: 'Horizont narrativu',
  labelManualMode: 'Režim',
  optHorizonToday: 'Dnes (sezení / den)',
  optHorizon23Days: '2–3 dny',
  optHorizonWeekly: 'Týden',
  optModeAuto: 'auto — jen RSS / výběr z novinek',
  optModeManualOnly: 'manual_only — primárně operátor, RSS není téma',
  optModeManualPlus: 'manual_plus_live_context — operátor + RSS jen jako podpora',
  manualSectionHint:
    'Když režim ≠ auto a je zapnutý přepínač, API uzamkne téma operátora jako jediný hlavní driver. Aktiva: kanonické značky (US500, US100, DE40, EURUSD, XAUUSD, BRENT, USDJPY, VIX).',
  errorManualThemeRequired: 'Zadej hlavní téma, nebo vypni ruční driver / nastav režim „auto“.',
  exportBriefingTxt: 'Exportovat briefing do TXT',
  exportGlossaryTxt: 'Exportovat slovníček do TXT',
  glossaryDocTitle: 'Slovníček pojmů',
  glossaryLinkedBriefingLine: 'Související briefing',
  txtGlossaryLanguage: 'Jazyk slovníčku',
  labelGlossaryLanguage: 'Jazyk slovníčku',
  glossarySectionTitle: 'Slovníček pojmů',
  glossaryDefLabel: 'Definice',
  glossaryWhyHereLabel: 'Proč je to tady důležité',
  generateBriefing: 'Generovat briefing',
  generating: 'Generování…',
  briefingIdleHint: 'Zvolte jazyk a rozsah, poté spusťte generování. Náhled se zobrazí níže.',
  briefingLoading: 'Generování briefingu… Dlouhý režim může trvat několik minut.',
  briefingSuccess: 'Briefing vygenerován. Plný obsah níže (neukládá se do databáze).',
  briefingSuccessCompact:
    'Briefing vygenerován v kompaktním režimu: RSS kanál neposkytl dostatečně koherentní a ověřitelné signály pro plnou zprávu.',
  briefingSuccessNarrative:
    'Narativní briefing vygenerován. Níže souvislý redakční komentář (neukládá se do databáze).',
  compactCardTitle: 'Kompaktní zobrazení briefingu',
  compactCardSubtitle:
    'Upřednostňujeme důvěryhodnost: místo vyplňování makra, událostí a aktiv ukazujeme jen to, co vstupy opravdu podporují.',
  compactSecDetected: 'Co jsme zachytili',
  compactSecMissing: 'Co chybí k plnému briefingu',
  compactSecWatch: 'Nejbližší smysluplný směr pozorování',
  compactDetectedDefault:
    'Titulky v tuto chvíli netvoří dostatečně jednotnou linii, kterou by šlo rozvinout bez spekulací.',
  compactMissingLine1: 'Čerstvých, opakovatelných titulků kotvících jedno dominantní téma (cluster) nebo jeho explicitní popis ve vstupu.',
  compactMissingLine2: 'Potvrzených cenových kotvic tam, kde snapshot neposkytuje LIVE ani čerstvý override.',
  compactMissingLine3: 'Dostatečné hloubky u aktiv (kontext + faktory + spouštěče), aby se předešlo generickým kartám „pro formu“.',
  errorGeneric: 'Došlo k chybě.',
  errorUnknown: 'Neznámá chyba.',
  errorRequestFailed: (status) => `Požadavek selhal (HTTP ${status}).`,
  errorNoBriefingField: 'Odpověď API neobsahuje objekt briefing.',
  secWhatsDifferentToday: 'Co je dnes jinak (vs poslední dny)',
  secTldr: 'Co dnes skutečně hýbe trhy',
  secExecutiveSummary: 'Executive summary',
  secMacro: 'Makro',
  secEvents: 'Události',
  secAssets: 'Aktiva',
  secCrossAsset: 'Cross-asset',
  secScenarios: 'Scénáře',
  secQuickSummary: 'Rychlé shrnutí',
  narrativeSecEventPriorityFilter: 'Filtr priority událostí (12–24h)',
  narrativeLabelHeadlineEvent: 'Nejdůležitější událost:',
  narrativeLabelPrimaryDriver: 'Hlavní driver',
  narrativeLabelTopThreeRank: 'TOP 3 události',
  narrativeLabelChannelsImpact: 'Dopad: ropa · indexy · FX · VIX',
  narrativeTierHigh: 'Vysoká',
  narrativeTierMedium: 'Střední',
  narrativeSecEventShift: 'Posun narativu (12–24h)',
  narrativeMetaDominantEvent: 'Driver / událost',
  narrativeMetaScenarioPivot: 'Scénář → scénář',
  narrativeForwardIfPrefix: 'Pokud',
  narrativeSecDeskContinuation: 'Na stole (pokračování)',
  narrativeSecMainComment: 'Hlavní komentář',
  narrativeSecUpdates: 'Aktualizace',
  narrativeSecScenarios: 'Co dál?',
  narrativeSecGlossary: 'Slovníček pojmů',
  questionsDisabledNarrative: 'Kontrolní otázky jsou dostupné jen pro formát structured.',
  glossaryNarrativeHint:
    'V režimu narrative je slovníček součástí textu — exportujte ho z níže uvedené sekce nebo s celým briefingem (TXT).',
  regionUsa: 'USA',
  regionEurope: 'Evropa',
  regionAsia: 'Asie',
  regionGeopolitics: 'Geopolitika',
  fldWhatHappened: 'Co se děje',
  fldWhyMatters: 'Proč na tom záleží',
  fldMarketImpact: 'Dopad na trh',
  emptyDash: '—',
  emptyNoEntries: 'Žádné záznamy.',
  emptyNoWhatsDifferent: 'Žádné body v této sekci.',
  emptyNoTldr: 'Žádné body v této sekci.',
  emptyNoExecutive: 'Chybí executive summary.',
  emptyNoEvents: 'V odpovědi nejsou události.',
  emptyNoAssets: 'V odpovědi nejsou aktiva.',
  emptyNoCrossAsset: 'Žádné cross-asset vazby.',
  emptyNoScenarios: 'Žádné scénáře.',
  emptyNoQuickSummary: 'Žádné rychlé shrnutí.',
  emptyNoAnalogies: 'V odpovědi nejsou historické analogie.',
  fldExpectations: 'Očekávání',
  fldBullCase: 'Bull case',
  fldBearCase: 'Bear case',
  fldContext: 'Kontext',
  fldDrivers: 'Faktory',
  fldLivePrice: 'Live cena',
  assetPriceBadgeLive: 'Aktuální cena',
  assetPriceBadgeOverride: 'Referenční cena: override <12h',
  txtExportAssetPriceLive: (price) => `Aktuální cena: ${price}`,
  txtExportAssetPriceOverride: (price, hours) =>
    `Referenční cena: ${price} (override, před ${hours.toFixed(1)} h)`,
  fldTriggerBull: 'Spouštěč (bull)',
  fldTriggerBear: 'Spouštěč (bear)',
  fldTriggerLogic: 'Logika spouštěčů',
  secHistoricalAnalogies: 'Historické chování / analogie',
  fldSetup: 'Setup',
  fldReaction: 'Reakce',
  fldLesson: 'Poučení',
  fldIf: 'Pokud',
  fldThen: 'Pak',
  fldConfirmation: 'Potvrzení',
  fldCrossAssetReaction: 'Cross-asset reakce',
  questionsPanelTitle: 'Otázky k briefingu',
  generateQuestions: 'Generovat otázky',
  exportQuestionsTxt: 'Exportovat otázky do TXT',
  questionsLoading: 'Generování otázek…',
  questionsSuccess: 'Otázky vygenerovány z aktuálního briefingu.',
  questionsIdleHint: 'Nejprve vygenerujte briefing, poté vytvořte otázky k ověření porozumění.',
  questionsErrorGeneric: 'Otázky se nepodařilo vygenerovat.',
  questionsErrorRequestFailed: (status) => `Požadavek na otázky selhal (HTTP ${status}).`,
  questionsErrorNoPack: 'Odpověď API neobsahuje platný balíček otázek.',
  secQuestionsBlock: 'Otázky',
  fldOptions: 'Možnosti',
  fldCorrectAnswer: 'Správná odpověď',
  fldExplanation: 'Vysvětlení',
  fldDifficulty: 'Úroveň',
  fldSourceSection: 'Zdrojová sekce',
  modelAnswerOpenText: 'Modelová odpověď',
  typeSingleChoice: 'jedna správná',
  typeOpenText: 'otevřená',
  diffEasy: 'snadná',
  diffMedium: 'střední',
  diffHard: 'těžká',
  emptyNoQuestions: 'Žádné otázky.',
  optionLetter: (i) => `${String.fromCharCode(65 + i)})`,
  txtMorningBriefingTitle: 'RANNÍ BRIEFING',
  txtGeneratedAt: 'Datum vygenerování',
  txtLanguage: 'Jazyk',
  txtDepth: 'Rozsah',
  txtLanguageValue: 'Čeština (cs)',
  txtDepthValue: (d) => (d === 'long' ? 'Dlouhý (long)' : 'Krátký (short)'),
  txtNone: '(nic)',
  txtWhatsDifferentToday: 'CO JE DNES JINAK (VS POSLEDNÍ DNY)',
  txtWhatMovesToday: 'CO DNES SKUTEČNĚ HÝBE TRHY',
  txtExecSummary: 'SHRNUTÍ (EXECUTIVE SUMMARY)',
  txtMacro: 'MAKRO',
  txtEvents: 'UDÁLOSTI',
  txtAssets: 'AKTIVA',
  txtCrossAsset: 'CROSS-ASSET',
  txtScenarios: 'SCÉNÁŘE',
  txtQuickSummary: 'RYCHLÉ SHRNUTÍ',
  txtQuestionsDocTitle: 'OTÁZKY K BRIEFINGU',
  txtTitle: 'Název',
  txtIntro: 'Úvod',
  txtQuestionPrefix: (n, type) => `${n}. [${type}]`,
  txtCorrectAnswer: 'Správná odpověď',
  txtLevel: 'Úroveň',
};

const LOCALES: Record<MorningInstitutionalLanguage, MorningBriefingLocale> = {
  pl: PL,
  en: EN,
  cs: CS,
};

export function getMorningBriefingLocale(lang: MorningInstitutionalLanguage): MorningBriefingLocale {
  return LOCALES[lang] ?? PL;
}

/** Řádek metadat „Język: …“ podle wybranego kodu (spójny z selectem). */
export function languageValueLineForTxt(lang: MorningInstitutionalLanguage): string {
  if (lang === 'en') return EN.txtLanguageValue;
  if (lang === 'cs') return CS.txtLanguageValue;
  return PL.txtLanguageValue;
}

export function difficultyLabel(L: MorningBriefingLocale, d: BriefingQuestionDifficulty): string {
  if (d === 'easy') return L.diffEasy;
  if (d === 'hard') return L.diffHard;
  return L.diffMedium;
}
