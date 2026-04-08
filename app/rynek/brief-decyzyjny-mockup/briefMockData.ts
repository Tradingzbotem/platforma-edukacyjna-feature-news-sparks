import type { BriefSensitivity } from '@/lib/decision-brief/sensitivity';

/** Dane statyczne — wyłącznie mockup UI (premium brief). */

export type Sensitivity = BriefSensitivity;

export const BRIEF_MAIN_TOPIC = {
	title: 'Napięcie w Zatoce Perskiej i kanałach transportu ropy',
	summaryLines: [
		'Eskalacja retoryki i incydentów podnosi ryzyko zakłóceń przepływu surowca.',
		'Rynek w pierwszej fazie wycenia premię na ropie i często wzmacnia USD.',
		'Indeksy akcji bywają w tle — ważniejsza jest zmienność na FX i energii.',
	],
	contextBullets: [
		'Nagłówki polityczne napędzają krótki horyzont; twarde dane o zapasach nadchodzą później.',
		'Korekcyjne ruchy na indeksach nie muszą oznaczać końca narracji — liczy się szerokość rynku.',
	],
	watchBullets: [
		'Oficjalne komunikaty USA / Iran / sojuszników.',
		'WTI, Brent, spready między gatunkami.',
		'DXY oraz EURUSD w pierwszej godzinie po nagłówkach.',
	],
};

export type BriefAssetRow = {
	symbol: string;
	direction: string;
	supports: string;
	weakens: string;
	sensitivity: Sensitivity;
};

export const BRIEF_ASSETS: BriefAssetRow[] = [
	{ symbol: 'WTI', direction: '↑ presja wzrostowa', supports: 'Ryzyko dostaw, eskalacja nagłówków', weakens: 'Wzrost zapasów USA, łagodzenie tonu', sensitivity: 'wysoka' },
	{ symbol: 'Brent', direction: '↑ presja wzrostowa', supports: 'Szlaki morskie, Bliski Wschód', weakens: 'Spowolnienie popytu, zapowiedzi OPEC+', sensitivity: 'wysoka' },
	{ symbol: 'XAUUSD', direction: '↔ mieszany', supports: 'Napięcie, ucieczka od ryzyka', weakens: 'Mocny USD, wyższe realne stopy', sensitivity: 'średnia' },
	{ symbol: 'US100', direction: '↓ / konsolidacja', supports: 'Spadek yieldów, łagodniejszy Fed', weakens: 'Risk-off, droższy kapitał', sensitivity: 'średnia' },
	{ symbol: 'DE40', direction: '↔ konsolidacja', supports: 'Odbicie w USA, spokój na długu', weakens: 'Słaby DAX przy globalnym risk-off', sensitivity: 'średnia' },
	{ symbol: 'EURUSD', direction: '↓ pod presją', supports: 'Łagodniejszy Fed vs ECB', weakens: 'Słabszy dolar, risk-on w Europie', sensitivity: 'wysoka' },
	{ symbol: 'USDJPY', direction: '↑ (często z USD)', supports: 'Wzmocnienie dolara, carry', weakens: 'Interwencja / ton BOJ, risk-on', sensitivity: 'średnia' },
	{ symbol: 'BTCUSD', direction: '↔ zmienny', supports: 'Płynność, narracja „alternatywa”', weakens: 'Risk-off, regulacje, mocny USD', sensitivity: 'niska' },
	{ symbol: 'US500', direction: '↓ / konsolidacja', supports: 'Łagodniejszy Fed, spadki yieldów', weakens: 'Risk-off szeroki, geopolityka', sensitivity: 'średnia' },
	{ symbol: 'GBPUSD', direction: '↔ pod USD', supports: 'Słabszy dolar globalnie', weakens: 'Flight to USD, słabsze dane UK', sensitivity: 'średnia' },
];

export const BRIEF_SCENARIOS = {
	base: [
		'Ropa zostaje z podwyższoną premią ryzyka przez kilka sesji.',
		'USD utrzymuje się mocniejszy wobec koszyka G10.',
		'Indeksy USA korygują się umiarkowanie, bez paniki w szerokości.',
	],
	alternative: [
		'Szybkie wyciszenie retoryki — odpływ premii z ropy w 24–48 h.',
		'Odbicie risk-on: osłabienie USD, wzmocnienie EUR i akcji.',
	],
	invalidate: [
		'Twarde dane o zapasach i produkcji zaprzeczające narracji o przerwach.',
		'Jawny krok dyplomatyczny obniżający prawdopodobieństwo konfliktu.',
		'Jednostronna interwencja na FX lub surowcu zmieniająca logikę przepływów.',
	],
};

export const BRIEF_DAY_PRIORITY =
	'Dziś rynek może silniej reagować na ropę i USD niż na same indeksy.';
