import type { ExamPlaceholderInternal } from '@/lib/certification-exam/types';

/** Dodatkowe pytania zamknięte (ph_fx_16–27) + scenariuszowe otwarte — ścieżka Forex. */
export const FOREX_EXTRA: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_fx_16',
    prompt:
      'W kontekście kwotowania dwójkowego (np. USD/JPY z jednym „pip” = 0,01), typowy błąd początkującego to:',
    options: [
      { id: 'a', label: 'Mylenie jednostki pip z całym punktem notowania bez sprawdzenia specyfikacji instrumentu' },
      { id: 'b', label: 'Zawsze identyczne traktowanie pipsa na każdej parze bez wyjątków' },
      { id: 'c', label: 'Ignorowanie spreadu, bo dotyczy tylko rynku akcji' },
      { id: 'd', label: 'Założenie, że waluta bazowa jest zawsze po prawej stronie notowania' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_17',
    prompt: '„Tick” na wykresie cenowym FX w platformie detalicznej to zazwyczaj:',
    options: [
      { id: 'a', label: 'Minimalna zmiana ceny zgodna z rozdzielczością kwotowania brokera' },
      { id: 'b', label: 'Wyłącznie zamknięcie świecy dziennej' },
      { id: 'c', label: 'Stała wartość 1 pip niezależnie od instrumentu' },
      { id: 'd', label: 'Synonim wolumenu transakcji w USD' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_18',
    prompt: 'Różnica między ceną bid a ask dla klienta detalicznego oznacza przede wszystkim:',
    options: [
      { id: 'a', label: 'Koszt wejścia natychmiastowego (kupno po ask, sprzedaż po bid)' },
      { id: 'b', label: 'Gwarantowany zysk market makera' },
      { id: 'c', label: 'Wyłącznie opłatę kustodialną' },
      { id: 'd', label: 'Brak wpływu na break-even pozycji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_19',
    prompt: 'Sesja azjatycka na FX (uproszczenie) jest często kojarzona z:',
    options: [
      { id: 'a', label: 'Relatywnie niższą zmiennością na wielu parach głównych niż w europejsko-amerykańskim nakładzie' },
      { id: 'b', label: 'Całkowitym brakiem transakcji w JPY' },
      { id: 'c', label: 'Wyłącznym zamknięciem rynku spot na 8 godzin' },
      { id: 'd', label: 'Brakiem wpływu danych z Chin na AUD' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_20',
    prompt: 'Forward points w wycenie forwardowej FX odnoszą się do:',
    options: [
      { id: 'a', label: 'Różnicy stóp i czasu do rozliczenia względem spotu' },
      { id: 'b', label: 'Wyłącznie marży brokera detalicznego' },
      { id: 'c', label: 'Podatku od zysków kapitałowych' },
      { id: 'd', label: 'Wielkości dźwigni na CFD' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_21',
    prompt: 'Wybicie poziomu technicznego tuż przed ważnym odczytem CPI może być ryzykowne, bo:',
    options: [
      { id: 'a', label: 'Spread i zmienność mogą skokowo wzrosnąć, zwiększając ryzyko stopów i poślizgu' },
      { id: 'b', label: 'Dane CPI nigdy nie wpływają na FX' },
      { id: 'c', label: 'Broker zawsze blokuje handel na 24 h' },
      { id: 'd', label: 'Wykres przestaje się aktualizować' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_22',
    prompt: 'Korelacja dwóch par (np. EUR/USD i GBP/USD) przy równoległych longach oznacza dla ryzyka portfelowego, że:',
    options: [
      { id: 'a', label: 'Efektywna ekspozycja na czynnik wspólny może być większa niż sugerują dwa osobne tickety' },
      { id: 'b', label: 'Ryzyko zawsze się zeruje przez dywersyfikację nazw par' },
      { id: 'c', label: 'Margin requirement zawsze spada do zera' },
      { id: 'd', label: 'Spread nie ma znaczenia' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_23',
    prompt: 'W praktyce detalicznej „slippage” oznacza:',
    options: [
      { id: 'a', label: 'Realizację po cenie innej niż oczekiwana zlecenia w momencie wysłania' },
      { id: 'b', label: 'Wyłącznie błąd oprogramowania bez związku z płynnością' },
      { id: 'c', label: 'Gwarantowany brak realizacji zlecenia' },
      { id: 'd', label: 'Stały zysk market makera ustalony przez KNF' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_24',
    prompt: 'Polityka „risk-off” na rynkach globalnych bywa historycznie powiązana z:',
    options: [
      { id: 'a', label: 'Popytem na aktywa uchodźcze (np. USD, CHF, JPY) kosztem walut emerging' },
      { id: 'b', label: 'Zawsze równoczesnym wzmocnieniem wszystkich walut G10' },
      { id: 'c', label: 'Brakiem ruchu na parach z USD' },
      { id: 'd', label: 'Wyłącznie wzrostem kryptowalut' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_25',
    prompt: 'Oświadczenie banku centralnego sugerujące „data-dependent” podejście do stóp oznacza zwykle, że:',
    options: [
      { id: 'a', label: 'Kolejne decyzje będą silnie uzależnione od napływających danych makro' },
      { id: 'b', label: 'Stopy są zamrożone na stałe bez przeglądu' },
      { id: 'c', label: 'Rynek FX przestaje reagować na dane' },
      { id: 'd', label: 'Waluta nie może się deprecjonować' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_26',
    prompt: 'Hedging ekspozycji komercyjnej na FX (uproszczenie) ma sens przede wszystkim, gdy:',
    options: [
      { id: 'a', label: 'Firma chce ograniczyć wpływ zmian kursu na przepływy lub bilans' },
      { id: 'b', label: 'Celem jest spekulacja na zmienności bez ekspozycji bazowej' },
      { id: 'c', label: 'Spread zawsze wynosi zero' },
      { id: 'd', label: 'Wyłącznie przy braku rachunku w walucie obcej' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_27',
    prompt: '„Real interest rate differential” w dyskusji FX odnosi się często do:',
    options: [
      { id: 'a', label: 'Różnicy stóp realnych między jurysdykcjami wpływającej na przepływy kapitału' },
      { id: 'b', label: 'Różnicy spreadów brokera A i B' },
      { id: 'c', label: 'Wyłącznie nominalnego PKB' },
      { id: 'd', label: 'Stałej wartości pipsa' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'open_text',
    id: 'ph_fx_o1',
    prompt:
      'Scenariusz: publikacja NFP lekko poniżej konsensusu, ale rewizja dwóch poprzednich miesięcy mocno w górę, a bezrobocie spada. Krótko: jakie ryzyko niesie handel „na pierwszy headline” tuż po komunikacie i co byś zrobił przed wejściem w transakcję na EUR/USD?',
    hint: '2–6 zdań: zmienność, spread, czekanie na strukturę rynku.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_fx_o2',
    prompt:
      'Scenariusz: masz long na AUD/USD przed nocnym posiedzeniem RBA; spread na parze się poszerza. Opisz, jakie czynniki sprawdzisz przed decyzją o pozostawieniu lub zamknięciu pozycji.',
    hint: 'Ryzyko eventowe, koszt finansowania, poziom invalidation.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_fx_o3',
    prompt:
      'Scenariusz: para emerging (np. USD/TRY) ma szerokie spready i ograniczoną płynność w Twojej sesji. Jak oceniasz ryzyko realizacji stop loss w porównaniu z majors?',
    hint: 'Krótko: poślizg, gapy, wielkość pozycji.',
    maxLength: 2000,
  },
];
