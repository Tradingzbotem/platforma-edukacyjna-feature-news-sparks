import type { ExamPlaceholderInternal } from '@/lib/certification-exam/types';

export const RM_EXTRA: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_rm_16',
    prompt: 'Kelly criterion w tradingu detalicznym jest często uznawany za:',
    options: [
      { id: 'a', label: 'Narzędzie teoretyczne wymagające ostrożności z powodu błędów estymacji prawdopodobieństw' },
      { id: 'b', label: 'Metodę bez ryzyka przeszacowania rozmiaru' },
      { id: 'c', label: 'Substytut stop loss' },
      { id: 'd', label: 'Regułę regulacyjną KNF' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_17',
    prompt: '„Revenge trading” oznacza zwykle:',
    options: [
      { id: 'a', label: 'Zwiększanie agresji po stracie w celu szybkiego odrobienia' },
      { id: 'b', label: 'Planowe zmniejszanie pozycji po serii strat' },
      { id: 'c', label: 'Przerwę techniczną zgodną z planem' },
      { id: 'd', label: 'Dokumentowanie transakcji w dzienniku' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_18',
    prompt: 'Maksymalna ekspozycja na jednym instrumencie przy wielu korelowanych pozycjach powinna być:',
    options: [
      { id: 'a', label: 'Liczone jako suma ryzyk skorelowanych, nie tylko pojedynczych ticketów' },
      { id: 'b', label: 'Zawsze ignorowana' },
      { id: 'c', label: 'Równa liczbie transakcji' },
      { id: 'd', label: 'Stała niezależnie od korelacji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_19',
    prompt: 'Zasada „cut losses short, let winners run” w praktyce wymaga:',
    options: [
      { id: 'a', label: 'Zdefiniowania zasad wyjścia z góry, nie tylko emocji w trakcie' },
      { id: 'b', label: 'Zawsze pełnej realizacji zysku przy pierwszym ruchu na plus' },
      { id: 'c', label: 'Braku stop loss' },
      { id: 'd', label: 'Identycznego R:R 1:1 na każdej transakcji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_20',
    prompt: '„Heat” konta (agregowane ryzyko otwartych pozycji) to:',
    options: [
      { id: 'a', label: 'Łączny potencjalny wpływ strat na equity przy realizacji stopów' },
      { id: 'b', label: 'Temperatura serwera brokera' },
      { id: 'c', label: 'Wyłącznie dzienna zmiana salda' },
      { id: 'd', label: 'Liczba zapisanych screenshotów' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_21',
    prompt: 'Zasada ograniczenia liczby jednoczesnych setupów służy:',
    options: [
      { id: 'a', label: 'Utrzymaniu jakości decyzji i kontroli nad łącznym ryzykiem' },
      { id: 'b', label: 'Maksymalizacji overtradingu' },
      { id: 'c', label: 'Wyłączeniu dziennika' },
      { id: 'd', label: 'Zwiększeniu dźwigni bez limitu' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_22',
    prompt: 'Wariant „risk parity” w uproszczeniu dąży do:',
    options: [
      { id: 'a', label: 'Wyrównania wkładu ryzyka poszczególnych pozycji w portfelu' },
      { id: 'b', label: 'Zawsze równych nominalnych wielkości bez względu na zmienność' },
      { id: 'c', label: 'Eliminacji drawdownu' },
      { id: 'd', label: 'Wyłącznie alokacji na rynek obligacji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_23',
    prompt: '„Gambler’s fallacy” w kontekście serii strat sugeruje błąd:',
    options: [
      { id: 'a', label: 'Przekonania, że seria niepowodzeń zwiększa „szansę” na wygraną następną transakcję' },
      { id: 'b', label: 'Stosowania stałego ryzyka procentowego' },
      { id: 'c', label: 'Prowadzenia dziennika' },
      { id: 'd', label: 'Używania stop loss' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_24',
    prompt: 'Polityka „no trade zones” (np. okno wokół newsów) ma na celu:',
    options: [
      { id: 'a', label: 'Unikanie okresów nieprzewidywalnej zmienności i kosztów realizacji' },
      { id: 'b', label: 'Zwiększenie liczby transakcji w szczycie zmienności' },
      { id: 'c', label: 'Wyłączenie zasad ryzyka' },
      { id: 'd', label: 'Gwarantowany zysk' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_25',
    prompt: 'Wielkość pozycji przy tym samym ryzyku procentowym na akcję a większej zmienności (ATR) powinna być zwykle:',
    options: [
      { id: 'a', label: 'Mniejsza w jednostkach bazowych, by utrzymać podobną stratę w walucie konta' },
      { id: 'b', label: 'Zawsze większa przy wyższej zmienności' },
      { id: 'c', label: 'Stała w lotach bez korekty' },
      { id: 'd', label: 'Zależna wyłącznie od intuicji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_26',
    prompt: '„Fat tail” w rozkładzie zwrotów oznacza dla risk managementu, że:',
    options: [
      { id: 'a', label: 'Ekstremalne ruchy są częstsze niż sugeruje rozkład normalny — trzeba uwzględnić w scenariuszach stresu' },
      { id: 'b', label: 'Można ignorować black swany' },
      { id: 'c', label: 'Drawdown nigdy nie przekroczy 5%' },
      { id: 'd', label: 'Dźwignia eliminuje ogony' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_27',
    prompt: 'Zasada „pre-mortem” przed tygodniem tradingu polega na:',
    options: [
      { id: 'a', label: 'Wyobrażeniu scenariusza porażki i zabezpieczeniu procesu przed typowymi błędami' },
      { id: 'b', label: 'Ignorowaniu ryzyka po zyskownym tygodniu' },
      { id: 'c', label: 'Zwiększaniu pozycji bez limitu' },
      { id: 'd', label: 'Wyłącznie celebrowaniu wygranych' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'open_text',
    id: 'ph_rm_o1',
    prompt:
      'Scenariusz: po trzech stratnych transakcjach z rzadu w tym samym dniu czujesz presję, by „odrobić” na czwartej, silniejszej pozycji. Jaką decyzję procesową podejmujesz i dlaczego?',
    hint: 'Dyscyplina, przerwa, rozmiar.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_rm_o2',
    prompt:
      'Scenariusz: masz long na EUR/USD i jednocześnie long na GBP/USD — oba w kierunku osłabienia USD. Jak oceniasz skuteczną koncentrację ryzyka?',
    hint: 'Korelacja, łączne ryzyko, ewentualna redukcja.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_rm_o3',
    prompt:
      'Scenariusz: Twój plan zakłada R:R 1:3, ale realnie często zamykasz pozycję przy R:R 1:1 z obawy. Jakie warunki lub zasady wprowadziłbyś, żeby rozdzielić „plan” od „emocji”?',
    hint: 'Reguły cząstkowej realizacji, trailing, dziennik.',
    maxLength: 2000,
  },
];
