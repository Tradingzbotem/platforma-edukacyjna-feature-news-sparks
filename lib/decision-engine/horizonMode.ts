// lib/decision-engine/horizonMode.ts — tryby myślenia po horyzoncie (wpływ na silnik, nie tylko UI)

import type {
	DecisionAssetClass,
	DecisionHorizonMode,
	DecisionMacroContext,
	DecisionWorldContext,
} from './types';

/** Pierwszy punkt „co obserwować” — spójny z trybem horyzontu i klasą aktywa. */
export function observeNowHorizonBullet(mode: DecisionHorizonMode, assetClass: DecisionAssetClass): string {
	switch (mode) {
		case 'session_end':
			if (assetClass === 'oil') {
				return 'Ropa, dziś: jeśli po nagłówku podażowym/geopolitycznym zostaje akceptacja w kolejnych godzinach, impuls ma sens; pełne cofnięcie — często jedna fala.';
			}
			if (assetClass === 'gold') {
				return 'Złoto, dziś: jeśli po impulsie zostaje kierunek przy USD i awersji do ryzyka, ruch ma sens; szybki powrót apetytu na ryzyko — słabiej.';
			}
			if (assetClass === 'eu_index') {
				return 'DE40, dziś: jeśli po USA temat zostaje, Europa ma kontynuację; ginie w relacji do S&P — bez przewagi.';
			}
			return 'Do końca sesji: jeśli kierunek zostaje po cofce, ma sens; gonienie jednej świecy bez potwierdzenia — nie.';
		case 'one_two_days':
			return '1–2 dni: jeśli następna sesja potwierdza pierwszą, temat zostaje; brak follow-through — jednodniowy szum.';
		case 'full_week':
			if (assetClass === 'us_index') {
				return 'Tydzień USA: jeśli narracja (stopy, USD, breadth) wraca w kilku sesjach, ma znaczenie; jeden headline bez powtórzenia — epizod.';
			}
			if (assetClass === 'eu_index') {
				return 'Tydzień DE40: jeśli PMI/energia/euro ustawiają ton na kilka dni, motyw trzyma się; jeden dzień szumu — nie.';
			}
			return 'Tydzień: jeśli temat nawraca w sesjach, ustawia ton; jednodniowy hałas bez kontynuacji — pomiń.';
		case 'macro_event':
			return 'Pod makro: dwa warianty przed liczbą; jeśli po impulsie zostaje druga fala zgodna z interpretacją — przyjmij, pełny revert — odrzuć.';
		default:
			return 'Jeśli po pierwszej reakcji jest potwierdzenie, buduj tezę; jeśli nie — zostań przy obserwacji.';
	}
}

const DEFAULT_MODE: DecisionHorizonMode = 'one_two_days';

export function parseDecisionHorizonMode(
	raw: string | null | undefined | DecisionHorizonMode
): DecisionHorizonMode {
	if (raw === 'session_end' || raw === 'one_two_days' || raw === 'full_week' || raw === 'macro_event') {
		return raw;
	}
	const v = String(raw || '').trim().toLowerCase().replace(/-/g, '_');
	if (
		v === 'session_end' ||
		v === 'one_two_days' ||
		v === 'full_week' ||
		v === 'macro_event'
	) {
		return v;
	}
	return DEFAULT_MODE;
}

/** Okno newsów (godziny): krótsze dla intraday, szersze dla tygodnia / makro. */
export function worldNewsHoursForHorizon(
	mode: DecisionHorizonMode,
	calendarDays: number
): number {
	const cap = Math.min(168, Math.max(24, calendarDays * 24));
	switch (mode) {
		case 'session_end':
			return Math.min(48, Math.max(24, cap));
		case 'one_two_days':
			return Math.min(72, cap);
		case 'full_week':
			return cap;
		case 'macro_event':
			return Math.min(168, Math.max(96, cap));
		default:
			return cap;
	}
}

/** Linie wplecione na początek `context[]` — kształtują narrację bez zmiany reguł A/B/C. */
export function horizonFramingContextLines(
	mode: DecisionHorizonMode,
	assetClass: DecisionAssetClass,
	eventRisk: 'low' | 'medium' | 'high',
	world: DecisionWorldContext
): string[] {
	const lines: string[] = [];
	switch (mode) {
		case 'session_end':
			lines.push(
				'Horyzont: do końca sesji — czytaj pierwszą reakcję, momentum i szybkie cofnięcia; unikaj budowania całej narracji tygodnia na jednym ruchu.'
			);
			if (eventRisk === 'high') {
				lines.push(
					'Dziś liczy się zachowanie tuż po publikacji: czy rynek potwierdza kierunek w kolejnych ustawieniach, czy tylko „szarpie” i wraca w zakres.'
				);
			}
			break;
		case 'one_two_days':
			lines.push(
				'Horyzont: 1–2 dni — ważniejsze jest follow-through po pierwszej reakcji: czy temat zostaje z rynkiem na kolejną sesję, czy ginie jako jednodniowy szum.'
			);
			break;
		case 'full_week':
			lines.push(
				'Horyzont: cały tydzień — szukaj tematów, które mogą dominować kilka sesji i ustawić ton; odróżnij szum jednodniowy od narracji, która zostaje.'
			);
			break;
		case 'macro_event':
			lines.push(
				'Horyzont: pod wydarzenie makro — pracuj na scenariuszu przed i po publikacji: co zmienia interpretację wyniku i kiedy pierwszy ruch bywa mylący (fake move).'
			);
			if (eventRisk !== 'low') {
				lines.push(
					'Tryb event-driven: pierwszy impuls bywa emocjonalny — ostrożnie z „gonieniem” ruchu; kluczowa jest akceptacja albo odrzucenie poziomu po impulsie.'
				);
			}
			break;
	}

	if (!world.isEmpty && assetClass === 'oil' && mode === 'session_end') {
		lines.push(
			'Dla ropy w intraday szczególnie ważne są nagłówki o podaży, geopolityce i energii — często silniej ruszają cenę niż indeksy w tej samej godzinie.'
		);
	}

	return lines;
}

/** Dodatkowe linie reakcji makro zależne od horyzontu (deterministyczne, PL). */
export function horizonMacroReactionLines(
	mode: DecisionHorizonMode,
	eventRisk: 'low' | 'medium' | 'high'
): string[] {
	const out: string[] = [];
	switch (mode) {
		case 'session_end':
			out.push(
				'Intraday: oceń, czy po komunikacie warto „gonić” ruch, czy czekać na drugą falę — pełne cofnięcie pierwszego impulsu często znaczy brak akceptacji.'
			);
			break;
		case 'one_two_days':
			out.push(
				'Swing 1–2 dni: patrz, czy pierwsza reakcja ma kontynuację następnego dnia; brak follow-through zwykle osłabia narrację.'
			);
			break;
		case 'full_week':
			out.push(
				'Tydzień: zwróć uwagę, które odczyty lub tematy mogą wracać w nagłówkach przez kilka sesji — to często ważniejsze niż pojedynczy tick w dniu publikacji.'
			);
			break;
		case 'macro_event':
			out.push(
				'Pod wydarzenie: rozłóż wynik na „surprise vs oczekiwania” i reakcję stóp/dolara — rynek często najpierw gra emocję, potem koryguje interpretację.'
			);
			if (eventRisk === 'high') {
				out.push(
					'Wysokie ryzyko makro: rozważ scenariusz fałszywego wybicia; decyzja edukacyjna dopiero po zobaczeniu, czy struktura utrzymuje się po pierwszej serii zleceń.'
				);
			}
			break;
	}
	return out;
}

/** Ogranicza / rozszerza listę linii reakcji z kalendarza pod kątem horyzontu. */
export function sliceMacroReactionLinesForHorizon(
	macro: DecisionMacroContext,
	mode: DecisionHorizonMode
): string[] {
	const base = macro.reactionLines || [];
	const extra = horizonMacroReactionLines(mode, macro.eventRisk);
	const merged = [...extra, ...base];
	const limit =
		mode === 'session_end' ? 5 : mode === 'one_two_days' ? 7 : mode === 'full_week' ? 10 : 12;
	return merged.slice(0, limit);
}
