import type { CertificationTrack } from '@/lib/certifications/types';

import { parseStoredAnswer } from '@/lib/certification-exam/answersCodec';
import { FOREX_EXTRA } from '@/lib/certification-exam/extraExamForex';
import { RM_EXTRA } from '@/lib/certification-exam/extraExamRm';
import { TA_EXTRA } from '@/lib/certification-exam/extraExamTa';
import type {
  ExamAnswersMap,
  ExamPlaceholderInternal,
  ExamQuestionAdminPreview,
  ExamQuestionPublic,
} from '@/lib/certification-exam/types';

/** 27 pytań zamkniętych + 3 otwarte / ścieżka — mixed-format placeholder. */
const FOREX_FUNDAMENTALS_PLACEHOLDER: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_fx_1',
    prompt: 'Co najlepiej opisuje parę walutową w kontekście rynku FX?',
    options: [
      { id: 'a', label: 'Dwa niezależne aktywa bez relacji ceny' },
      { id: 'b', label: 'Wycena jednej waluty względem drugiej' },
      { id: 'c', label: 'Wyłącznie kontrakt na surowiec denominowany w USD' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_2',
    prompt: 'Spread na rynku FX to w praktyce:',
    options: [
      { id: 'a', label: 'Różnica między ceną bid a ask' },
      { id: 'b', label: 'Wyłącznie prowizja brokera, bez wpływu płynności' },
      { id: 'c', label: 'Zawsze stały koszt niezależny od warunków rynku' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_3',
    prompt: 'Rynek międzybankowy FX charakteryzuje się przede wszystkim:',
    options: [
      { id: 'a', label: 'Wyłącznie transakcjami detalicznymi w weekendy' },
      { id: 'b', label: 'Brakiem zmienności i jednolitą ceną globalnie' },
      { id: 'c', label: 'Dużą płynnością i uczestnictwem instytucji' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_4',
    prompt:
      'Dla pary notowanej z dokładnością do czwartego miejsca po przecinku, jeden pip przy standardowym microlocie często odpowiada z grubsza której wartości pieniężnej (przy założeniu standardowej konwencji dla głównych par)?',
    options: [
      { id: 'a', label: 'Stałej kwocie niezależnej od wielkości kontraktu i waluty kwotowanej' },
      { id: 'b', label: 'Ruchowi ceny o jedną jednostkę na ostatniej cyfrze notowania, której wartość zależy od wielkości pozycji' },
      { id: 'c', label: 'Zawsze dokładnie 1 USD zysku lub straty na każdą transakcję' },
      { id: 'd', label: 'Wyłącznie różnicy między ceną otwarcia a zamknięcia sesji dziennej' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_5',
    prompt: 'Standardowy lot (1,0) na rynku FX w typowej interpretacji detalicznej odnosi się do:',
    options: [
      { id: 'a', label: '10 000 jednostek waluty kwotowanej' },
      { id: 'b', label: '100 000 jednostek waluty bazowej' },
      { id: 'c', label: '100 jednostek waluty bazowej' },
      { id: 'd', label: 'Wielkości ustalanej wyłącznie przez giełdę papierów wartościowych' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_6',
    prompt: 'Dźwignia finansowa na rachunku FX przede wszystkim:',
    options: [
      { id: 'a', label: 'Eliminuje ryzyko straty powyżej pierwszej transakcji dnia' },
      { id: 'b', label: 'Zwiększa ekspozycję względem depozytu zabezpieczającego, podnosząc jednocześnie ryzyko szybszej utraty kapitału' },
      { id: 'c', label: 'Gwarantuje, że strata nigdy nie przekroczy spreadu' },
      { id: 'd', label: 'Jest narzędziem wyłącznie podatkowym, bez wpływu na margin' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_7',
    prompt: 'Niska płynność na danej parze w danym momencie zwykle implikuje:',
    options: [
      { id: 'a', label: 'Brak jakichkolwiek wahań ceny do następnej sesji' },
      { id: 'b', label: 'Automatyczne obniżenie wymaganego depozytu zabezpieczającego' },
      { id: 'c', label: 'Szerszy spread i większe ryzyko poślizgu przy realizacji zleceń' },
      { id: 'd', label: 'Wyłącznie korzyść dla strony kupującej bez kosztu dla sprzedającego' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_8',
    prompt: 'Nakładanie się sesji europejskiej i amerykańskiej na rynku FX jest często kojarzone z:',
    options: [
      { id: 'a', label: 'Całkowitym zamrożeniem kwotowań przez 4 godziny' },
      { id: 'b', label: 'Wyższą aktywnością obrotu i większą zmiennością na głównych parach' },
      { id: 'c', label: 'Wyłącznym zamknięciem rynku spot' },
      { id: 'd', label: 'Brakiem możliwości handlu parami z USD' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_9',
    prompt: 'Podstawowe ryzyko utrzymywania pozycji przez weekend na rynku detalicznym FX to m.in.:',
    options: [
      { id: 'a', label: 'Gwarantowane wyrównanie ceny do wartości nominalnej banku centralnego' },
      { id: 'b', label: 'Automatyczne zamknięcie zysku bez realizacji' },
      { id: 'c', label: 'Luka cenowa (gap) przy otwarciu w kolejnej sesji względem poziomu zamknięcia' },
      { id: 'd', label: 'Brak wpływu wydarzeń geopolitycznych na notowania' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_10',
    prompt: 'W momencie publikacji istotnego odczytu makroekonomicznego (np. payrolls) typowym zachowaniem rynku bywa:',
    options: [
      { id: 'a', label: 'Stały spread i brak zmienności do końca tygodnia' },
      { id: 'b', label: 'Rozszerzenie spreadów i wzrost zmienności w krótkim horyzoncie' },
      { id: 'c', label: 'Wyłącznie ruch poziomy bez udziału agresji zleceń' },
      { id: 'd', label: 'Zakaz handlu parami z udziałem USD' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_11',
    prompt: 'W notowaniu EUR/USD waluta bazowa to:',
    options: [
      { id: 'a', label: 'USD — zawsze waluta bez ryzyka stopy procentowej' },
      { id: 'b', label: 'Waluta o niższym depozycie, niezależnie od kolejności zapisu' },
      { id: 'c', label: 'EUR — jednostka nabywana lub sprzedawana w wolumenie transakcji' },
      { id: 'd', label: 'Waluta kwotowana po prawej stronie u brokerów wyłącznie w Azji' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_12',
    prompt: 'Para krzyżowa (cross), np. EUR/GBP, to para:',
    options: [
      { id: 'a', label: 'Zawsze powiązana wyłącznie z rynkiem surowców' },
      { id: 'b', label: 'Taka sama jak para syntetyczna z definicji prawnej KNF' },
      { id: 'c', label: 'Notowana tylko na giełdzie z fizyczną dostawą waluty następnego dnia' },
      { id: 'd', label: 'Bez bezpośredniego udziału USD w notowaniu' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_13',
    prompt: 'W uproszczeniu, „carry” na rynku walutowym odnosi się często do:',
    options: [
      { id: 'a', label: 'Wyłącznie arbitrażu bez ryzyka kursowego' },
      { id: 'b', label: 'Strategii ekspozycji na różnicę stóp między walutami z uwzględnieniem kosztu finansowania pozycji' },
      { id: 'c', label: 'Zakazu zajmowania pozycji krótkich na parach emerging' },
      { id: 'd', label: 'Stałego zwrotu gwarantowanego przez brokera' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_14',
    prompt: 'Punkty swap (rollover) na pozycji overnight odzwierciedlają z grubsza:',
    options: [
      { id: 'a', label: 'Jednorazową opłatę rejestracyjną konta' },
      { id: 'b', label: 'Wyłącznie podatek od zysków kapitałowych naliczany przez platformę' },
      { id: 'c', label: 'Koszt lub przychód związany z przeniesieniem ekspozycji na kolejną datę rozliczenia' },
      { id: 'd', label: 'Brak jakiegokolwiek związku ze stawkami rynkowymi' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_fx_15',
    prompt: 'Silne dane inflacyjne w dużej gospodarce, przy reakcji rynku zgodnej z klasyczną narracją „hawkish expectations”, często początkowo wspiera:',
    options: [
      { id: 'a', label: 'Zawsze osłabienie waluty niezależnie od kontekstu stóp procentowych' },
      { id: 'b', label: 'Wzmocnienie waluty kraju, jeśli inwestorzy dyskontują bardziej restrykcyjną politykę banku centralnego' },
      { id: 'c', label: 'Stały kurs narzucony przez MFW dla wszystkich par' },
      { id: 'd', label: 'Wyłącznie wzrost pary z udziałem waluty towarowej bez USD' },
    ],
    correctOptionId: 'b',
  },
  ...FOREX_EXTRA,
];

const TECHNICAL_ANALYSIS_PLACEHOLDER: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_ta_1',
    prompt: 'Trend wzrostowy na wykresie cenowym oznacza zwykle:',
    options: [
      { id: 'a', label: 'Sekwencję wyższych szczytów i wyższych dołków' },
      { id: 'b', label: 'Brak zmienności i poziomy kursu' },
      { id: 'c', label: 'Wyłącznie spadek wolumenu przy każdej świecy' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_2',
    prompt: 'Poziom wsparcia (support) to obszar, w którym:',
    options: [
      { id: 'a', label: 'Popyt historycznie często ograniczał spadki ceny' },
      { id: 'b', label: 'Cena zawsze musi się odbić w górę w tym samym dniu' },
      { id: 'c', label: 'Wyłącznie broker ustala cenę otwarcia' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_3',
    prompt: 'Formacja „podwójny szczyt” bywa interpretowana jako sygnał:',
    options: [
      { id: 'a', label: 'Kontynuacji nieograniczonego wzrostu bez korekty' },
      { id: 'b', label: 'Potencjalnego wykończenia ruchu wzrostowego' },
      { id: 'c', label: 'Wyłącznie błędu danych na wykresie' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_4',
    prompt: 'Wybicie (breakout) z konsolidacji jest uznawane za bardziej wiarygodne, gdy:',
    options: [
      { id: 'a', label: 'Towarzyszy mu wzrost wolumenu (lub aktywności) w kierunku wytrwania poza poziomem' },
      { id: 'b', label: 'Cena natychmiast wraca do środka zakresu bez jakichkolwiek zleceń' },
      { id: 'c', label: 'Występuje wyłącznie w godzinach zamknięcia rynku akcji w USA' },
      { id: 'd', label: 'Zawsze bez względu na kontekst — sama świeca wystarcza' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_5',
    prompt: 'Pullback w istniejącym trendzie wzrostowym to zwykle:',
    options: [
      { id: 'a', label: 'Synonim odwrócenia trendu bez możliwości kontynuacji' },
      { id: 'b', label: 'Płytsza korekta spadkowa przed ewentualną kontynuacją ruchu zgodnego z trendem' },
      { id: 'c', label: 'Sytuacja, w której wolumen musi być zerowy' },
      { id: 'd', label: 'Wyłącznie formacja świecowa typu „doji” na tygodniu' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_6',
    prompt: 'Momentum w analizie technicznej odnosi się najczęściej do:',
    options: [
      { id: 'a', label: 'Wyłącznie wysokości spreadu u brokera' },
      { id: 'b', label: 'Stałej wartości dywidendy spółki giełdowej' },
      { id: 'c', label: 'Tempa zmiany ceny i siły aktualnego ruchu względem historii' },
      { id: 'd', label: 'Prawnego terminu rozliczenia kontraktu terminowego' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_7',
    prompt: 'Interwał tygodniowy (W1) w porównaniu z M5 dostarcza przede wszystkim:',
    options: [
      { id: 'a', label: 'Identycznej informacji co M5, tylko w innej szacie graficznej' },
      { id: 'b', label: 'Szerszej perspektywy struktury trendu i poziomów kluczowych' },
      { id: 'c', label: 'Wyłącznie danych o wolumenie tickowym z dokładnością do milisekundy' },
      { id: 'd', label: 'Zakazu używania poziomów wsparcia/oporu' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_8',
    prompt: 'Sygnał z oscylatora (np. RSI) w strefie wykupienia w trendzie wzrostowym bywa interpretowany jako:',
    options: [
      { id: 'a', label: 'Bezwzględny nakaz zajęcia pozycji krótkiej w każdych warunkach' },
      { id: 'b', label: 'Ostrzeżenie przed wyczerpaniem, ale nie automatyczny dowód odwrócenia bez kontekstu struktury' },
      { id: 'c', label: 'Dowód, że wolumen jest nieistotny' },
      { id: 'd', label: 'Gwarancję kontynuacji wzrostów bez korekty' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_9',
    prompt: 'Linia trendu spadkowego łączy zwykle:',
    options: [
      { id: 'a', label: 'Wyłącznie dołki zamknięcia sesji świątecznej' },
      { id: 'b', label: 'Punkty o tej samej cenie otwarcia każdej świecy' },
      { id: 'c', label: 'Szczyty rosnące w czasie' },
      { id: 'd', label: 'Kolejne niższe szczyty (lower highs)' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_10',
    prompt: 'Formacja „głowa i ramiona” jako wzorzec odwrócenia zakłada m.in.:',
    options: [
      { id: 'a', label: 'Dokładnie dwie równe świece bez wolumenu' },
      { id: 'b', label: 'Trzy wypukłości cenowe przy środkowej najwyższej („głowa”) i linię szyi jako poziom referencyjny' },
      { id: 'c', label: 'Wyłącznie występowanie na wykresie renko bez cen OHLC' },
      { id: 'd', label: 'Brak znaczenia przełamania linii szyi' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_11',
    prompt: 'Średnia krocząca długookresowa często służy jako:',
    options: [
      { id: 'a', label: 'Gwarancja ceny realizacji zlecenia po każdym dotknięciu' },
      { id: 'b', label: 'Substytut analizy fundamentalnej bez żadnych ograniczeń' },
      { id: 'c', label: 'Filtr kierunku lub orientacyjny poziom dynamiczny dla trendu' },
      { id: 'd', label: 'Wskaźnik podatkowy ustalany przez regulatora' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_12',
    prompt: 'Divergencja bearish między ceną a oscylatorem sugeruje przy założeniu potwierdzenia:',
    options: [
      { id: 'a', label: 'Automatyczne kontynuacje bez końca' },
      { id: 'b', label: 'Brak możliwości zajęcia pozycji krótkiej na danym instrumencie' },
      { id: 'c', label: 'Wyłącznie błąd obliczeniowy platformy' },
      { id: 'd', label: 'Osłabienie impetu wzrostowego i ryzyko korekty lub odwrócenia' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_13',
    prompt: 'Potwierdzenie techniczne wejścia w transakcję to zazwyczaj:',
    options: [
      { id: 'a', label: 'Losowy tick niższy od poprzedniego' },
      { id: 'b', label: 'Dodatkowy sygnał (np. struktura świec, retest poziomu) po spełnieniu warunku planu' },
      { id: 'c', label: 'Wyłącznie komunikat marketingowy brokera' },
      { id: 'd', label: 'Tożsame z pierwszym dotknięciem dowolnej średniej kroczącej' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_14',
    prompt: 'Wykres Heikin-Ashi w porównaniu ze standardowym świecowym:',
    options: [
      { id: 'a', label: 'Jest tożsamy matematycznie z OHLC przy każdej świecy' },
      { id: 'b', label: 'Nie zmienia sposobu liczenia otwarcia i zamknięcia świecy' },
      { id: 'c', label: 'Służy wyłącznie do rozliczeń podatkowych' },
      { id: 'd', label: 'Wygładza serię cenową i może utrudniać odczyt pojedynczych ekstremów sesyjnych' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_ta_15',
    prompt: 'Poziom oporu (resistance) po skutecznym przebiciu z popytem może zostać reinterpretowany jako:',
    options: [
      { id: 'a', label: 'Poziom bez znaczenia do końca kwartału' },
      { id: 'b', label: 'Nowe wsparcie w ramach zmiany struktury (flip)' },
      { id: 'c', label: 'Wyłącznie poziom psychologiczny bez transakcji' },
      { id: 'd', label: 'Bariera uniemożliwiająca ustawienie stop loss' },
    ],
    correctOptionId: 'b',
  },
  ...TA_EXTRA,
];

const RISK_MANAGEMENT_PLACEHOLDER: ExamPlaceholderInternal[] = [
  {
    type: 'single_choice',
    id: 'ph_rm_1',
    prompt: 'Podstawowym celem stop loss w planie transakcji jest:',
    options: [
      { id: 'a', label: 'Zdefiniowanie maksymalnej akceptowanej straty na pozycję' },
      { id: 'b', label: 'Gwarantowanie zysku niezależnie od rynku' },
      { id: 'c', label: 'Wyłącznie zwiększenie dźwigni bez limitu' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_2',
    prompt: 'Wielkość pozycji (position sizing) powinna być spójna przede wszystkim z:',
    options: [
      { id: 'a', label: 'Kapitałem konta i akceptowanym ryzykiem na transakcję' },
      { id: 'b', label: 'Wyłącznie intuicją bez żadnych reguł' },
      { id: 'c', label: 'Stałą liczbą lotów bez względu na ryzyko' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_3',
    prompt: 'Dyscyplina operacyjna w zarządzaniu ryzykiem oznacza m.in.:',
    options: [
      { id: 'a', label: 'Stosowanie ustalonych zasad nawet po serii strat' },
      { id: 'b', label: 'Zwiększanie pozycji po każdej stracie, by „odrobić”' },
      { id: 'c', label: 'Ignorowanie limitów, gdy rynek „wygląda pewnie”' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_4',
    prompt: 'Stosunek ryzyka do zysku (R:R) 1:2 przy założeniu stałej wielkości pozycji oznacza, że:',
    options: [
      { id: 'a', label: 'Potencjalny zysk docelowy jest dwukrotnością akceptowanej straty w jednostkach ceny' },
      { id: 'b', label: 'Strata jest zawsze dwa razy większa niż zysk' },
      { id: 'c', label: 'Prawdopodobieństwo wygranej wynosi 100%' },
      { id: 'd', label: 'Nie ma związku z miejscem stop loss' },
    ],
    correctOptionId: 'a',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_5',
    prompt: 'Drawdown to w praktyce tradingowej:',
    options: [
      { id: 'a', label: 'Wyłącznie dzienna zmiana stopy referencyjnej NBP' },
      { id: 'b', label: 'Spadek wartości kapitału od wcześniejszego szczytu equity do dołka' },
      { id: 'c', label: 'Zysk z ostatniej transakcji' },
      { id: 'd', label: 'Stała premia brokera za wolumen' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_6',
    prompt: 'Ryzyko na transakcję wyrażone jako procent kapitału (np. 1%) służy do:',
    options: [
      { id: 'a', label: 'Gwarancji braku strat w miesiącu' },
      { id: 'b', label: 'Wyłącznie marketingu bez wpływu na wielkość pozycji' },
      { id: 'c', label: 'Ujednolicenia wpływu serii strat na konto i unikania losowej eskalacji ekspozycji' },
      { id: 'd', label: 'Zastąpienia konieczności ustawiania stop loss' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_7',
    prompt: 'Overtrading to przede wszystkim:',
    options: [
      { id: 'a', label: 'Handel dokładnie jedną transakcją dziennie' },
      { id: 'b', label: 'Nadmierna częstotliwość lub rozmiar transakcji w stosunku do przewagi i planu' },
      { id: 'c', label: 'Strategia polegająca wyłącznie na braku analizy' },
      { id: 'd', label: 'Synonim długoterminowego inwestowania pasywnego' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_8',
    prompt: 'Po serii strat psychologicznie najbardziej zgodne z profesjonalnym risk management jest:',
    options: [
      { id: 'a', label: 'Natychmiastowe podwojenie wolumenu przy następnym sygnale' },
      { id: 'b', label: 'Całkowite usunięcie stop loss „by odzyskać kontrolę”' },
      { id: 'c', label: 'Zignorowanie dziennika transakcji' },
      { id: 'd', label: 'Przerwa lub redukcja rozmiaru do czasu odtworzenia procesu decyzyjnego' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_9',
    prompt: 'Plan egzekucji (execution plan) obejmuje typowo:',
    options: [
      { id: 'a', label: 'Wyłącznie wybór koloru wykresu' },
      { id: 'b', label: 'Zasady wejścia, wyjścia, warunki unieważnienia tezy i zarządzanie pozycją' },
      { id: 'c', label: 'Jednorazową decyzję emocjonalną bez dokumentacji' },
      { id: 'd', label: 'Zakaz używania zleceń limitowanych' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_10',
    prompt: 'Punkt unieważnienia (invalidation) tezy technicznej to:',
    options: [
      { id: 'a', label: 'Zawsze ten sam poziom co take profit' },
      { id: 'b', label: 'Wyłącznie koniec sesji azjatyckiej' },
      { id: 'c', label: 'Warunek, przy którym założenia wejścia przestają być ważne i pozycja powinna być zamknięta lub przeglądnięta' },
      { id: 'd', label: 'Moment, w którym broker zmienia dźwignię' },
    ],
    correctOptionId: 'c',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_11',
    prompt: 'Korelacja portfela wielu pozycji na spokrewnionych parach może prowadzić do:',
    options: [
      { id: 'a', label: 'Automatycznej dywersyfikacji bez względu na instrumenty' },
      { id: 'b', label: 'Braku wpływu na equity curve' },
      { id: 'c', label: 'Wyłącznie zmniejszenia margin requirement' },
      { id: 'd', label: 'Niejawnej koncentracji ryzyka większej niż wynikałoby z pojedynczych transakcji' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_12',
    prompt: 'Maksymalny dzienny limit strat (daily loss cap) w regulaminie prop firm służy przede wszystkim do:',
    options: [
      { id: 'a', label: 'Gwarantowania zysku powyżej kapitału początkowego' },
      { id: 'b', label: 'Ograniczenia ekspozycji firmy i tradera na skrajne zachowania w jednej sesji' },
      { id: 'c', label: 'Zwiększenia dźwigni po przekroczeniu progu' },
      { id: 'd', label: 'Usunięcia konieczności raportowania wyników' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_13',
    prompt: 'Oczekiwana wartość strategii przy dodatnim R:R ale niskim win rate może być:',
    options: [
      { id: 'a', label: 'Zawsze ujemna niezależnie od parametrów' },
      { id: 'b', label: 'Zdefiniowana wyłącznie przez kolor świec' },
      { id: 'c', label: 'Równa zero przy każdym R:R poniżej 5:1' },
      { id: 'd', label: 'Dodatnia, jeśli średni zysk wygrywających transakcji przewyższa średnią stratę w skali wielu prób' },
    ],
    correctOptionId: 'd',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_14',
    prompt: 'Trailing stop w otwartej pozycji zyskownej służy często do:',
    options: [
      { id: 'a', label: 'Zwiększania ryzyka po każdym ticku niekorzystnym' },
      { id: 'b', label: 'Blokowania części zysku przy kontynuacji ruchu korzystnego dla pozycji' },
      { id: 'c', label: 'Wyłączania zabezpieczenia przed newsami' },
      { id: 'd', label: 'Wymuszania natychmiastowej pełnej realizacji zysku przy pierwszym oddechu rynku' },
    ],
    correctOptionId: 'b',
  },
  {
    type: 'single_choice',
    id: 'ph_rm_15',
    prompt: '„Risk of ruin” w uproszczeniu opisuje:',
    options: [
      { id: 'a', label: 'Wyłącznie jednorazową stratę równą jednemu pipowi' },
      { id: 'b', label: 'Prawdopodobieństwo lub scenariusz trwałej utraty kapitału operacyjnego przy danych parametrach' },
      { id: 'c', label: 'Zysk gwarantowany przez regulatora' },
      { id: 'd', label: 'Brak związku z wielkością pozycji i serią wyników' },
    ],
    correctOptionId: 'b',
  },
  ...RM_EXTRA,
];

const PLACEHOLDERS: Record<CertificationTrack, ExamPlaceholderInternal[]> = {
  FOREX_FUNDAMENTALS: FOREX_FUNDAMENTALS_PLACEHOLDER,
  TECHNICAL_ANALYSIS: TECHNICAL_ANALYSIS_PLACEHOLDER,
  RISK_MANAGEMENT: RISK_MANAGEMENT_PLACEHOLDER,
};

function toPublicQuestion(q: ExamPlaceholderInternal): ExamQuestionPublic {
  if (q.type === 'open_text') {
    return { type: 'open_text', id: q.id, prompt: q.prompt, maxLength: q.maxLength };
  }
  const { correctOptionId: _, ...rest } = q;
  return rest;
}

function toAdminPreviewQuestion(q: ExamPlaceholderInternal): ExamQuestionAdminPreview {
  if (q.type === 'open_text') {
    return { type: 'open_text', id: q.id, prompt: q.prompt, hint: q.hint, maxLength: q.maxLength };
  }
  return {
    type: 'single_choice',
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    correctOptionId: q.correctOptionId,
  };
}

export function getPlaceholderQuestionsForTrack(track: CertificationTrack): ExamQuestionPublic[] {
  const list = PLACEHOLDERS[track] ?? [];
  return list.map(toPublicQuestion);
}

/** Wyłącznie dla podglądu administratora — zawiera `correctOptionId` przy pytaniach MC. */
export function getAdminPreviewQuestionsForTrack(track: CertificationTrack): ExamQuestionAdminPreview[] {
  const list = PLACEHOLDERS[track] ?? [];
  return list.map(toAdminPreviewQuestion);
}

/**
 * Scoring: wyłącznie pytania single_choice → scorePercent.
 * Odpowiedzi open_text są zapisywane, ale nie wpływają na procent (do przyszłego review / AI).
 */
export function scorePlaceholderAttempt(
  track: CertificationTrack,
  answers: ExamAnswersMap | null,
): { correct: number; total: number; scorePercent: number; openTextCount: number } {
  const qs = PLACEHOLDERS[track] ?? [];
  const mc = qs.filter((q): q is Extract<ExamPlaceholderInternal, { type: 'single_choice' }> => q.type === 'single_choice');
  const openTextCount = qs.filter((q) => q.type === 'open_text').length;
  if (mc.length === 0) {
    return { correct: 0, total: 0, scorePercent: 0, openTextCount };
  }
  const map = answers ?? {};
  let correct = 0;
  for (const q of mc) {
    const p = parseStoredAnswer(map[q.id]);
    if (p?.kind === 'single_choice' && p.optionId === q.correctOptionId) correct += 1;
  }
  const total = mc.length;
  const scorePercent = Math.round((correct / total) * 100);
  return { correct, total, scorePercent, openTextCount };
}
