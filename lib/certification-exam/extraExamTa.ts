import type { ExamPlaceholderInternal } from '@/lib/certification-exam/types';

export const TA_EXTRA: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_ta_16',
    prompt: 'Kanał cenowy (channel) w trendzie spadkowym łączy zwykle:',
    options: [
      { id: 'a', label: 'Równoległe linie przez niższe szczyty i niższe dołki' },
      { id: 'b', label: 'Tylko jeden poziom bez drugiej granicy' },
      { id: 'c', label: 'Wyłącznie średnie kroczące bez ceny' },
      { id: 'd', label: 'Poziomy wolumenu z wykresu tickowego' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_17',
    prompt: 'Zbieżność kilku średnich kroczących na jednym poziomie bywa interpretowana jako:',
    options: [
      { id: 'a', label: 'Strefa potencjalnej decyzji rynku (kompresja)' },
      { id: 'b', label: 'Dowód braku trendu na wyższych interwałach' },
      { id: 'c', label: 'Wyłącznie sygnał wyłącznie sprzedażowy' },
      { id: 'd', label: 'Błąd platformy' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_18',
    prompt: 'Retest poziomu po przebiciu (breakout retest) służy często jako:',
    options: [
      { id: 'a', label: 'Potwierdzenie zmiany roli poziomu (support↔resistance)' },
      { id: 'b', label: 'Dowód, że przebicie zawsze było fałszywe' },
      { id: 'c', label: 'Ignorowanie wolumenu' },
      { id: 'd', label: 'Wyłącznie sygnał dla rynku akcji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_19',
    prompt: 'Stochastyczny oscylator w trendzie silnym może utrzymywać się w strefie wykupienia przez dłuższy czas — oznacza to, że:',
    options: [
      { id: 'a', label: '„Overbought” nie jest automatycznym sygnałem short bez kontekstu trendu' },
      { id: 'b', label: 'Trend musi natychmiast się odwrócić' },
      { id: 'c', label: 'Wolumen jest zerowy' },
      { id: 'd', label: 'Należy ignorować strukturę cenową' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_20',
    prompt: 'Analiza wielointerwałowa (top-down) zwykle zaczyna się od:',
    options: [
      { id: 'a', label: 'Wyższego interwału w celu określenia kontekstu trendu i stref' },
      { id: 'b', label: 'Zawsze M1 niezależnie od stylu' },
      { id: 'c', label: 'Wykresu liniowego bez OHLC' },
      { id: 'd', label: 'Losowego interwału' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_21',
    prompt: 'Triangle (trójkąt) jako formacja kontynuacji zakłada typowo:',
    options: [
      { id: 'a', label: 'Konsolidację z wąskiej zmienności przed ewentualnym wznowieniem trendu' },
      { id: 'b', label: 'Natychmiastowe zakończenie rynku' },
      { id: 'c', label: 'Brak znaczenia wolumenu przy przebiciu' },
      { id: 'd', label: 'Identyczny kształt jak podwójne dno' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_22',
    prompt: 'Wolumen na rynku spot FX u brokera detalicznego:',
    options: [
      { id: 'a', label: 'Bywa tick volume / proxy i nie zawsze odpowiada skonsolidowanemu wolumenowi giełdowemu' },
      { id: 'b', label: 'Jest zawsze pełnym obrotem globalnym rynku międzybankowego' },
      { id: 'c', label: 'Nie ma znaczenia przy breakoucie' },
      { id: 'd', label: 'Jest regulowany przez SEC' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_23',
    prompt: 'Flaga (bull flag) jako formacja kontynuacji wzrostów zakłada:',
    options: [
      { id: 'a', label: 'Krótką korektę przeciw trendowi po impulsie wzrostowym' },
      { id: 'b', label: 'Długoterminowy trend spadkowy' },
      { id: 'c', label: 'Brak impulsu poprzedzającego' },
      { id: 'd', label: 'Wyłącznie formację na wykresie punktowo-przecinkowym' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_24',
    prompt: 'Poziom psychologiczny (np. okrągła liczba na indeksie) to:',
    options: [
      { id: 'a', label: 'Obszar, gdzie zbiega się uwaga wielu uczestników i może wzrosnąć aktywność zleceń' },
      { id: 'b', label: 'Poziom bez znaczenia dla płynności' },
      { id: 'c', label: 'Zawsze poziom oporu, nigdy wsparcia' },
      { id: 'd', label: 'Wyłącznie artefakt skali logarytmicznej' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_25',
    prompt: 'Cel (target) mierzony jako odległość strukturalna (np. wysokość formacji) od przebicia to:',
    options: [
      { id: 'a', label: 'Heurystyka projekcji, a nie gwarancja realizacji ceny' },
      { id: 'b', label: 'Prawo wymuszające dokładne trafienie w punkt' },
      { id: 'c', label: 'Metoda wyłącznie podatkowa' },
      { id: 'd', label: 'Zakaz używania przy formacjach' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_26',
    prompt: 'Świeca z bardzo długim knotem górnym przy szczycie trendu wzrostowego może sugerować:',
    options: [
      { id: 'a', label: 'Odrzucenie wyższych cen i potencjalne osłabienie impetu byków' },
      { id: 'b', label: 'Kontynuację bez korekty w każdych warunkach' },
      { id: 'c', label: 'Brak znaczenia bez wolumenu' },
      { id: 'd', label: 'Wyłącznie błąd sesji' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_27',
    prompt: 'Zasada wielointerwałowego potwierdzenia sygnału (np. zgodność M15 z H4) ma na celu:',
    options: [
      { id: 'a', label: 'Redukcję liczby fałszywych wejść sprzecznych z szerszym kontekstem' },
      { id: 'b', label: 'Wyłączenie analizy wyższego interwału' },
      { id: 'c', label: 'Zwiększenie liczby transakcji kosztem jakości' },
      { id: 'd', label: 'Zastąpienie zarządzania ryzykiem' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'open_text',
    id: 'ph_ta_o1',
    prompt:
      'Scenariusz: na H4 widzisz silny trend wzrostowy, na M15 pojawia się sygnał short od górnego oporu lokalnego. Jak oceniasz konflikt interwałów i jakie warunki musiałbyś spełnić, by rozważyć short?',
    hint: 'Kontekst HTF, invalidation, konfirmacja.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_ta_o2',
    prompt:
      'Scenariusz: cena przebiła opór na niskim wolumenie (tick volume), następna świeca wraca do zakresu. Jak interpretujesz wiarygodność breakoutu?',
    hint: 'Fałszywe vs prawdziwe przebicie, retest.',
    maxLength: 2000,
  },
  {
    type: 'open_text',
    id: 'ph_ta_o3',
    prompt:
      'Scenariusz: setup long przy wsparciu z R:R 1:2, ale sesja zbliża się do publikacji decyzji stóp. Jakie ryzyko operacyjne bierzesz pod uwagę przy wejściu lub rezygnacji?',
    hint: 'Zmienność, spread, event risk.',
    maxLength: 2000,
  },
];
