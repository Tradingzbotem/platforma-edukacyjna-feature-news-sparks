// data/quizzes/index.ts
// Jeden samowystarczalny plik z danymi quizów (KNF, CYSEC, MiFID, Podstawy, Forex, CFD, Materiały, Zaawansowane).
// Brak importów do komponentów – tylko typy i plain-objects.

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type QuizPack = { title: string; questions: QuizQuestion[] };

// ============================================================================
// KNF
// ============================================================================
const KNF_QUESTIONS: QuizQuestion[] = [
  { id: 'knf-01', question: 'Czym jest test adekwatności (appropriateness) w MiFID II?', options: ['Sprawdza, czy produkt pasuje do celów i sytuacji klienta','Ocena wiedzy/ doświadczenia klienta dla produktów nieobjętych doradztwem','Badanie zdolności kredytowej klienta','Test ryzyka operacyjnego w firmie inwestycyjnej'], correctIndex: 1, explanation: 'Appropriateness ocenia wiedzę/doświadczenie klienta dla usług bez doradztwa, by ostrzec przy produktach złożonych.' },
  { id: 'knf-02', question: 'Dokument KID/KIID służy głównie do:', options: ['Raportowania transakcji do KNF','Przedstawienia kluczowych informacji o produkcie klientowi','Wyliczania depozytu zabezpieczającego','Weryfikacji tożsamości klienta'], correctIndex: 1 },
  { id: 'knf-03', question: 'Zasada best execution oznacza, że firma inwestycyjna powinna:', options: ['Realizować zlecenia zawsze na GPW','Utrzymywać najniższe koszty stałe','Dążyć do najlepszego możliwego wyniku (cena, koszty, szybkość, prawdopodobieństwo realizacji)','Zawsze wykonywać zlecenia natychmiast'], correctIndex: 2 },
  { id: 'knf-04', question: 'Który z poniższych produktów jest zwykle uznawany za złożony w rozumieniu MiFID II?', options: ['Akcje blue-chip','ETF UCITS plain-vanilla','CFD na indeks','Obligacje skarbowe'], correctIndex: 2 },
  { id: 'knf-05', question: 'Kategoryzacja klientów obejmuje:', options: ['Detaliczny, profesjonalny, uprawniony kontrahent','Nowy, stały, VIP','Standard, premium, private','Klient ryzyka A, B, C'], correctIndex: 0 },
  { id: 'knf-06', question: 'Cel polityki konfliktów interesów to:', options: ['Minimalizacja kosztów działalności','Zapobieganie sytuacjom konfliktu interesów i ich ujawnianie','Zapewnienie najlepszych cen','Uproszczenie dokumentacji KYC'], correctIndex: 1 },
  { id: 'knf-07', question: 'Informacje o kosztach i opłatach przekazujemy:', options: ['Wyłącznie po zawarciu umowy','Przed świadczeniem usługi i okresowo ex-post','Tylko przy pierwszej transakcji','Nie ma takiego obowiązku'], correctIndex: 1 },
  { id: 'knf-08', question: 'Typowe ostrzeżenie dla CFD to:', options: ['Brak ryzyka utraty kapitału','Dźwignia może spotęgować zyski i straty','Gwarantowany zysk roczny','CFD są wyłącznie dla profesjonalnych'], correctIndex: 1 },
  { id: 'knf-09', question: 'Zgodnie z AML/KYC firma inwestycyjna powinna przede wszystkim:', options: ['Weryfikować tożsamość i beneficjenta rzeczywistego','Zapewnić dostępność platformy 24/7','Oferować demo','Składać raporty kwartalne do GPW'], correctIndex: 0 },
  { id: 'knf-10', question: 'Czym jest transaction reporting (MiFIR)?', options: ['Przekazywanie organowi nadzoru szczegółów transakcji','Wysyłka potwierdzeń do klienta','Raport P/L klienta','Sprawozdanie finansowe emitenta'], correctIndex: 0 },
  { id: 'knf-11', question: 'Klient detaliczny ma zazwyczaj:', options: ['Najniższą ochronę','Taką samą ochronę jak profesjonalny','Najwyższy poziom ochrony regulacyjnej','Brak prawa do informacji o ryzykach'], correctIndex: 2 },
  { id: 'knf-12', question: 'Materiały marketingowe powinny być:', options: ['Zawsze krótsze niż 1 strona','Rzetelne, jasne i niewprowadzające w błąd','Wyłącznie po polsku','Zatwierdzane przez KNF przed publikacją'], correctIndex: 1 },
  { id: 'knf-13', question: 'Zachęty (inducements) są dopuszczalne, gdy:', options: ['Zawsze i bez ograniczeń','Nigdy','Poprawiają jakość usługi i nie naruszają działania w najlepiej pojętym interesie klienta','Wyłącznie przy klientach profesjonalnych'], correctIndex: 2 },
  { id: 'knf-14', question: 'Który dokument klient otrzymuje regularnie po rozpoczęciu współpracy?', options: ['Wyłącznie potwierdzenia transakcji','Raporty okresowe ex-post dot. kosztów i usług','Sprawozdania finansowe emitentów','Prospekt emisyjny'], correctIndex: 1 },
  { id: 'knf-15', question: 'MAR dotyczy m.in.:', options: ['Wyłącznie rynku towarowego','Insider dealing i manipulacji na rynku','Podwyższania limitów dźwigni','Spółek > 1 mld PLN'], correctIndex: 1 },
  { id: 'knf-16', question: '„Appropriateness warning” to:', options: ['Ostrzeżenie o braku zgodności produktu z celami','Ostrzeżenie o braku wiedzy/doświadczenia klienta','Wezwanie do uzupełnienia depozytu','Komunikat o przerwie technicznej'], correctIndex: 1 },
  { id: 'knf-17', question: 'Który kanał komunikacji wymaga utrwalania przy przyjmowaniu zleceń?', options: ['Telefon/komunikatory','Tylko e-mail','Tylko papier','Żaden'], correctIndex: 0 },
  { id: 'knf-18', question: 'Suitability (odpowiedniość) stosujemy:', options: ['Przy doradztwie i zarządzaniu','Zawsze przy demo','Wyłącznie dla profesjonalnych','Nigdy'], correctIndex: 0 },
  { id: 'knf-19', question: 'Cel polityki best execution to:', options: ['Zwiększyć przychody','Zapewnić najniższy spread','Uzyskać najlepszy możliwy rezultat (cena, koszty, szybkość, prawdopodobieństwo)','Zapewnić zawsze GPW'], correctIndex: 2 },
  { id: 'knf-20', question: 'Element KYC to m.in.:', options: ['Adres, PESEL/ID, źródło środków','Wskaźnik beta portfela','Wynik roczny spółki','Średni spread brokera'], correctIndex: 0 },
  { id: 'knf-21', question: 'Opt-up do statusu profesjonalnego:', options: ['Możliwy po spełnieniu kryteriów i ocenie','Niemożliwy','Tylko na 30 dni','Tylko dla CFD'], correctIndex: 0 },
  { id: 'knf-22', question: 'Product governance dotyczy:', options: ['Określenia rynku docelowego i dystrybucji','Wyłącznie prowizji','Koloru aplikacji','Backupów systemowych'], correctIndex: 0 },
  { id: 'knf-23', question: 'Ostrzeżenie na stronie dla CFD zwykle zawiera informację o:', options: ['Procent rachunków tracących','Gwarancji zysku','Braku poślizgu','Porównaniu z lokatą'], correctIndex: 0 },
  { id: 'knf-24', question: 'Potwierdzenie transakcji wysyłamy:', options: ['Zwykle najpóźniej następnego dnia roboczego po wykonaniu','Raz w roku','Na żądanie','Tylko przy akcjach'], correctIndex: 0 },
  { id: 'knf-25', question: 'Który element NIE należy do raportu kosztów i opłat?', options: ['Koszty transakcyjne','Koszty usług doradczych','Prognoza ceny instrumentu','Koszt finansowania (swap)'], correctIndex: 2 },
  { id: 'knf-26', question: 'Przy zleceniach OTC firma powinna ujawniać m.in.:', options: ['Adresy pracowników','Miejsca wykonania, politykę best execution i ryzyka','Wejście do systemu back-office','Dane wszystkich klientów'], correctIndex: 1 },
];

const KNF_PACK: QuizPack = { title: 'KNF (PL) — wiedza regulacyjna', questions: KNF_QUESTIONS };

// ============================================================================
// CYSEC
// ============================================================================
const CYSEC_QUESTIONS: QuizQuestion[] = [
  { id: 'cy-01', question: 'CySEC jest organem nadzoru dla:', options: ['Banków centralnych w UE','Firm inwestycyjnych/rynku kapitałowego Cypru','Wyłącznie giełd towarowych','Wszystkich brokerów na świecie'], correctIndex: 1 },
  { id: 'cy-02', question: 'CIF (Cyprus Investment Firm) musi posiadać m.in.:', options: ['Licencję CySEC i kapitał regulacyjny','Wyłącznie biuro w Nikozji','Linię kredytową','Data center w UE'], correctIndex: 0 },
  { id: 'cy-03', question: 'Kategoryzacja klientów w CIF odpowiada:', options: ['Detaliczny / Profesjonalny / Uprawniony kontrahent','Nowy / VIP / HNWI','Inwestor / Trader / Akcjonariusz','Retail / Corporate wyłącznie'], correctIndex: 0 },
  { id: 'cy-04', question: 'CFD w ESMA podlegają ograniczeniom dot. m.in.:', options: ['Leverage, margin close-out, negative balance protection','Wyłącznie koloru UI','Opłat depozytowych','Programów partnerskich B2B'], correctIndex: 0 },
  { id: 'cy-05', question: 'Do obowiązków CIF należy m.in.:', options: ['Segregacja środków klientów','Gwarantowany zysk 5% rocznie','Brak ujawnień ryzyka dla CFD','Wykonywanie zleceń wyłącznie na giełdzie'], correctIndex: 0 },
  { id: 'cy-06', question: 'Appropriateness test w CIF:', options: ['Bada zdolność kredytową','Ocena wiedzy/doświadczenia + ewentualne ostrzeżenie','Wyłącznie potwierdza adres','Weryfikuje FATCA/CRS'], correctIndex: 1 },
  { id: 'cy-07', question: 'Suitability report dotyczy głównie:', options: ['Doradztwa/zarządzania (rekomendacje)','Rachunków demo','Kampanii marketingowych','Wypłat afiliacyjnych'], correctIndex: 0 },
  { id: 'cy-08', question: 'AML/CTF w CIF wymaga m.in.:', options: ['Identyfikacji, weryfikacji i monitoringu transakcji','Tylko zbierania e-maila','Wyłącznie e-podpisu','Nagrywania webinarów'], correctIndex: 0 },
  { id: 'cy-09', question: 'Best execution bierze pod uwagę m.in.:', options: ['Cena, koszty, szybkość, prawdopodobieństwo','Wyłącznie cenę','Wyłącznie koszty','Wyłącznie szybkość'], correctIndex: 0 },
  { id: 'cy-10', question: 'Negative balance protection oznacza:', options: ['Detaliczny nie ma salda ujemnego','Zawsze ujemne swapy','Saldo w banku centralnym','Brak margin calli'], correctIndex: 0 },
  { id: 'cy-11', question: 'KYC obejmuje m.in.:', options: ['Imię, nazwisko, data ur., adres, obywatelstwo, źródło środków','Wyłącznie email','Profil w social media','Preferencje językowe'], correctIndex: 0 },
  { id: 'cy-12', question: 'Skargi klienta w CIF:', options: ['Wymagają procedury, rejestru i terminów odpowiedzi','Nie są wymagane','Wystarczy skrzynka e-mail','Tylko dla profesjonalnych'], correctIndex: 0 },
  { id: 'cy-13', question: 'Materiały marketingowe CIF:', options: ['Mogą obiecywać zysk','Muszą być rzetelne, jasne, niewprowadzające w błąd; spójne z KID','Nie podlegają nadzorowi','Dotyczą wyłącznie social mediów'], correctIndex: 1 },
  { id: 'cy-14', question: 'Raporty okresowe dla detalicznych:', options: ['Podsumowanie transakcji i kosztów','Prognoza zysku','Wyceny spółek GPW','Lista klientów'], correctIndex: 0 },
  { id: 'cy-15', question: 'MAR obejmuje m.in.:', options: ['Insider dealing i manipulacje rynkowe','Wyłącznie promo marketingu','Wyłącznie kryptoaktywa','Wyłącznie towary fizyczne'], correctIndex: 0 },
  { id: 'cy-16', question: 'Product governance w CIF:', options: ['Rynek docelowy, dystrybucja, testy okresowe produktu','Wybór nazwy','Kalkulacja prowizji','Szkolenia IT'], correctIndex: 0 },
  { id: 'cy-17', question: 'Opt-up do „professional client” możliwy gdy:', options: ['Spełnione kryteria (doświadczenie, portfel, transakcje) oraz ocena','Zawsze na życzenie','Nigdy','Tylko przy akcjach'], correctIndex: 0 },
  { id: 'cy-18', question: 'Margin close-out (ESMA) to:', options: ['Auto-zamknięcie pozycji przy określonym progu kapitału','Zamknięcie rynku w weekend','Zamknięcie rachunku po roku','Wyłącznie margin call'], correctIndex: 0 },
  { id: 'cy-19', question: 'Przed zawarciem umowy klient powinien dostać:', options: ['Warunki świadczenia usług i info o kosztach/ryzykach','Wyłącznie login i hasło','Podsumowanie roczne','Faktury VAT z 12 mies.'], correctIndex: 0 },
  { id: 'cy-20', question: 'Record keeping dotyczy m.in.:', options: ['Utrwalania rozmów/komunikacji przy przyjmowaniu zleceń','Wyłącznie nagrywania webinarów','Kopii paszportów','Archiwizacji banerów'], correctIndex: 0 },
  { id: 'cy-21', question: 'RTS 27/28 (historycznie) to raporty:', options: ['Jakości wykonania i miejsc wykonania','Podatkowe VAT','Sprawozdania dla GPW','Prospekty'], correctIndex: 0 },
  { id: 'cy-22', question: 'Ostrzeżenie o braku adekwatności należy dać, gdy:', options: ['Test wykazał brak wiedzy/doświadczenia dla produktu złożonego','Zawsze przed transakcją','Wyłącznie przy demo','Nigdy'], correctIndex: 0 },
  { id: 'cy-23', question: 'Który element NIE jest typowy dla KID?', options: ['Cele i ryzyka','Scenariusze wyników','Szczegółowy kod źródłowy algorytmu','Koszty produktu'], correctIndex: 2 },
  { id: 'cy-24', question: 'Conflicts of interest policy obejmuje m.in.:', options: ['Identyfikację, zapobieganie, ujawnianie konfliktów','Listę pracowników','Info o spreadach','Politykę backupów'], correctIndex: 0 },
  { id: 'cy-25', question: '„Client money” w CIF oznacza:', options: ['Środki klientów na rachunkach segregowanych','Bonusy promocyjne','Kapitał własny firmy','Depozyty pracowników'], correctIndex: 0 },
  { id: 'cy-26', question: 'Różnica między appropriateness a suitability to:', options: ['Appropriateness = wiedza/doświadczenie; suitability = dopasowanie do celów/sytuacji','To samo','Appropriateness dotyczy AML','Suitability dotyczy demo'], correctIndex: 0 },
];

const CYSEC_PACK: QuizPack = { title: 'CySEC (CY) — wiedza regulacyjna', questions: CYSEC_QUESTIONS };

// ============================================================================
// MiFID II
// ============================================================================
const MIFID_QUESTIONS: QuizQuestion[] = [
  { id: 'mf-01', question: 'MiFID II reguluje głównie:', options: ['Rynki towarowe','Rynki instrumentów finansowych, usługi inwestycyjne i ochronę inwestora','Wyłącznie bankowość','Podatki kapitałowe'], correctIndex: 1 },
  { id: 'mf-02', question: 'Przed świadczeniem usługi przekazujemy:', options: ['Informacje ex-ante o kosztach i opłatach','Tylko umowę ramową','Tylko KID','Wyłącznie raport roczny'], correctIndex: 0 },
  { id: 'mf-03', question: 'Suitability dotyczy przede wszystkim:', options: ['Doradztwa inwestycyjnego i zarządzania portfelem','Rachunków demo','MTF/OTF','Krypto'], correctIndex: 0 },
  { id: 'mf-04', question: 'Product governance – producent powinien:', options: ['Określić rynek docelowy i dystrybucję, przeglądać produkt w cyklu życia','Wybrać nazwę','Wybrać kolor UI','Ustalić KPI marketingu'], correctIndex: 0 },
  { id: 'mf-05', question: 'Best execution oznacza:', options: ['Stały spread','Najlepszy możliwy wynik (cena, koszty, szybkość, prawdopodobieństwo)','Zawsze natychmiastową realizację','Najniższą prowizję'], correctIndex: 1 },
  { id: 'mf-06', question: 'Inducements są dopuszczalne, jeśli:', options: ['Zawsze','Nigdy','Poprawiają jakość usługi i nie naruszają działania w interesie klienta','Tylko dla profesjonalnych'], correctIndex: 2 },
  { id: 'mf-07', question: 'Które NIE jest elementem ex-post do klientów?', options: ['Koszty poniesione w okresie','Gwarantowany zysk','Podsumowanie usług','Informacje o opłatach'], correctIndex: 1 },
  { id: 'mf-08', question: 'Kategoryzacja klientów obejmuje:', options: ['Detaliczny, profesjonalny, uprawniony kontrahent','Nowy, stały, VIP','Private, retail','FN/Non-FN'], correctIndex: 0 },
  { id: 'mf-09', question: 'Appropriateness sprawdza przede wszystkim:', options: ['Wiedzę/doświadczenie','Cele inwestycyjne','Dochody i majątek','Preferencje językowe'], correctIndex: 0 },
  { id: 'mf-10', question: 'Record keeping dotyczy m.in.:', options: ['Nagrywania rozmów/komunikacji przy przyjmowaniu/przekazywaniu zleceń','Backupów baz danych','Transkrypcji webinarów','Spotkań HR'], correctIndex: 0 },
  { id: 'mf-11', question: 'Cel ostrzeżeń o ryzyku:', options: ['Spełnić wymogi marketingowe','Przejrzyście poinformować klienta o istotnych ryzykach','Zwiększyć sprzedaż','Zachęta do spekulacji'], correctIndex: 1 },
  { id: 'mf-12', question: 'Klienci profesjonalni mają zwykle:', options: ['Niższą ochronę regulacyjną niż detaliczni','Wyższą ochronę','Identyczną ochronę','Nie podlegają MiFID II'], correctIndex: 0 },
  { id: 'mf-13', question: '„Best interests of the client” oznacza:', options: ['Minimalizować koszty własne','Działać uczciwie, rzetelnie i profesjonalnie w najlepiej pojętym interesie klienta','Maksymalizować zysk firmy','Zawsze wybierać najniższy spread'], correctIndex: 1 },
  { id: 'mf-14', question: 'Podział produktów na złożone/niezłożone ma znaczenie dla:', options: ['Wymogów appropriateness i ostrzeżeń','Koloru UI','AML','Wielkości prowizji'], correctIndex: 0 },
  { id: 'mf-15', question: 'Info ex-ante o kosztach przekazujemy:', options: ['Przed świadczeniem usługi','Raz na rok','Po 12 mies.','Nigdy'], correctIndex: 0 },
  { id: 'mf-16', question: 'Dokument zawierający scenariusze wyników i wskaźnik ryzyka (PRIIPs) to:', options: ['KID','Prospekt','Raport maklerski','FATCA/CRS'], correctIndex: 0 },
  { id: 'mf-17', question: 'Conflicts of interest policy ma na celu:', options: ['Identyfikowanie, zarządzanie i ujawnianie konfliktów','Minimalizację spreadu','Wybór kolorów UI','Raportowanie do banku centralnego'], correctIndex: 0 },
  { id: 'mf-18', question: 'Execution venues to:', options: ['Miejsca wykonania: rynki regulowane, MTF, OTF, podmioty OTC','Wyłącznie giełdy papierów wartościowych','Wyłącznie platformy krypto','Wyłącznie biura maklerskie'], correctIndex: 0 },
  { id: 'mf-19', question: 'Transaction reporting (MiFIR) to:', options: ['Przekazywanie organowi danych o transakcjach','Newsletter','Raport marketingowy','Raport AML do banku'], correctIndex: 0 },
  { id: 'mf-20', question: 'Appropriateness warning stosujemy, gdy:', options: ['Klient nie przeszedł testu adekwatności dla produktu złożonego','Zawsze przy zakupie akcji','Wyłącznie przy profesjonalnych','Nigdy'], correctIndex: 0 },
  { id: 'mf-21', question: 'Który element NIE jest typowy dla polityki best execution?', options: ['Cena i koszty','Szybkość i prawdopodobieństwo','Strategia marketingowa','Wielkość zlecenia'], correctIndex: 2 },
  { id: 'mf-22', question: 'RTS to:', options: ['Regulatory Technical Standards','Raporty podatkowe','Zasady księgowe','Nazwy serwerów'], correctIndex: 0 },
  { id: 'mf-23', question: 'Market making w firmie inwestycyjnej:', options: ['Utrzymywanie kwotowań kupna/sprzedaży i płynności OTC','Wyłącznie HFT','Wyłącznie algotrading','Tylko giełda'], correctIndex: 0 },
  { id: 'mf-24', question: 'Client money rules — który element NIE pasuje?', options: ['Segregacja środków','Rachunki powiernicze','Gwarantowany zwrot 10% rocznie','Rekonsyliacja środków'], correctIndex: 2 },
  { id: 'mf-25', question: 'Costs & charges ex-post to:', options: ['Okresowy raport kosztów po świadczeniu usługi','Z góry określona prowizja','Wyciąg bankowy','PIT-38'], correctIndex: 0 },
  { id: 'mf-26', question: 'Główny cel MiFID II:', options: ['Zwiększyć ochronę inwestorów i przejrzystość rynków','Wzrost liczby spółek na giełdzie','Zmniejszyć spready do zera','Zastąpić AML'], correctIndex: 0 },
];

const MIFID_PACK: QuizPack = { title: 'MiFID II (UE) — podstawy i praktyka', questions: MIFID_QUESTIONS };

// ============================================================================
// PODSTAWY (28 pytań)
// ============================================================================
const BASIC_QUESTIONS: QuizQuestion[] = [
  { id: 'base-01', question: 'Co to jest „pip” na rynku walutowym?', options: ['Minimalna jednostka zmiany ceny instrumentu','Rodzaj zlecenia oczekującego','Wielkość pozycji równa 1 lot','Wskaźnik zmienności'], correctIndex: 0 },
  { id: 'base-02', question: 'Które stwierdzenie najlepiej opisuje zlecenie „market”?', options: ['Wchodzi od razu po najlepszej dostępnej cenie','Realizuje się tylko po lepszej cenie niż rynkowa','Jest aktywne wyłącznie poza godzinami sesji','Jest ważne do końca miesiąca'], correctIndex: 0 },
  { id: 'base-03', question: 'Dźwignia finansowa (leverage) powoduje, że:', options: ['Zwiększa się ekspozycja przy tym samym kapitale własnym','Zawsze zmniejsza ryzyko','Zmienia jedynie prowizję brokera','Nie ma wpływu na P/L'], correctIndex: 0 },
  { id: 'base-04', question: 'Spread to:', options: ['Różnica między ceną kupna a sprzedaży','Koszt utrzymania rachunku','Limit dziennych strat','Rodzaj wykresu'], correctIndex: 0 },
  { id: 'base-05', question: 'Stop Loss i Take Profit służą do:', options: ['Automatycznego zamknięcia pozycji przy z góry określonej stracie/zysku','Zawieszenia notowań','Obniżenia prowizji','Zwiększenia depozytu zabezpieczającego'], correctIndex: 0 },
  { id: 'base-06', question: 'Czym jest „lot” na rynku FX?', options: ['Standardowa jednostka wielkości zlecenia (np. 100 000 jednostek waluty bazowej)','Rodzaj strategii hedgingowej','Jednostka zmienności','Wydajność serwera'], correctIndex: 0 },
  { id: 'base-07', question: '„Micro lot” to najczęściej:', options: ['0.01 lota','0.1 lota','1 lot','10 lotów'], correctIndex: 0 },
  { id: 'base-08', question: 'Zlecenie LIMIT kupna (buy limit) ustawia się:', options: ['Poniżej aktualnej ceny','Powyżej aktualnej ceny','Równo z aktualną ceną','Tylko na indeksach'], correctIndex: 0 },
  { id: 'base-09', question: 'Zlecenie STOP kupna (buy stop) aktywuje się:', options: ['Po wybiciu powyżej określonej ceny','Po spadku poniżej określonej ceny','Natychmiast','Nigdy'], correctIndex: 0 },
  { id: 'base-10', question: 'Kapitał własny (equity) to:', options: ['Saldo + niezrealizowany wynik','Zawsze tyle co saldo','Wyłącznie depozyt','Tylko zrealizowane P/L'], correctIndex: 0 },
  { id: 'base-11', question: 'Wolne środki (free margin) obliczamy jako:', options: ['Equity – margin','Saldo – prowizja','Equity + margin','Depozyt – equity'], correctIndex: 0 },
  { id: 'base-12', question: 'Poziom margin (margin level) to najczęściej:', options: ['Equity / Margin × 100%','Margin / Equity × 100%','Saldo / Margin','Saldo / Equity'], correctIndex: 0 },
  { id: 'base-13', question: 'Poślizg (slippage) to:', options: ['Realizacja zlecenia po innej cenie niż oczekiwana','Ręczne przesunięcie SL','Błąd w platformie','Różnica między spreadem a prowizją'], correctIndex: 0 },
  { id: 'base-14', question: 'Sesje o największej płynności na FX to:', options: ['Nakładanie Londyn–Nowy Jork','Tylko Azja','Niedzielny wieczór','Święta bankowe'], correctIndex: 0 },
  { id: 'base-15', question: 'Wykres świecowy pokazuje:', options: ['Open, High, Low, Close w danym interwale','Wyłącznie cenę zamknięcia','Wyłącznie średnią cenę','Wolumen wyłącznie'], correctIndex: 0 },
  { id: 'base-16', question: 'Średnia krocząca (MA) służy głównie do:', options: ['Wygładzania ceny i identyfikacji trendu','Wyznaczania poziomów podatkowych','Liczenia prowizji','Symulacji Monte Carlo'], correctIndex: 0 },
  { id: 'base-17', question: 'RR (risk-reward) 1:3 oznacza, że:', options: ['Potencjalny zysk jest trzykrotnie większy od ryzyka','Ryzyko jest trzykrotnie większe od zysku','Ryzyko = zysk','Nie dotyczy SL/TP'], correctIndex: 0 },
  { id: 'base-18', question: 'Maksymalne obsunięcie kapitału (max drawdown) mierzy:', options: ['Największy spadek od szczytu do dna kapitału','Średni spread roczny','Liczbę transakcji','Wskaźnik Sharpe'], correctIndex: 0 },
  { id: 'base-19', question: 'Trailing stop to:', options: ['Ruchomy SL podążający za ceną','Stały SL','Zlecenie limit','Zlecenie OCO'], correctIndex: 0 },
  { id: 'base-20', question: 'Backtest służy do:', options: ['Sprawdzania strategii na danych historycznych','Handlu ręcznego na żywo','Weryfikacji tożsamości','Księgowości'], correctIndex: 0 },
  { id: 'base-21', question: 'Forward test/OOS to:', options: ['Test strategii poza próbką (out-of-sample)','To samo co backtest','Zawsze na tych samych danych','Wyłącznie na demo bez danych'], correctIndex: 0 },
  { id: 'base-22', question: 'GAP cenowy to:', options: ['Luka między kolejnymi notowaniami','Brak internetu','Zbyt niski margin','Wysoki wolumen'], correctIndex: 0 },
  { id: 'base-23', question: 'Komisja (commission) to:', options: ['Stała/zmienna opłata transakcyjna niezależna od spreadu','Różnica bid-ask','Swap dodatni','Premia za depozyt'], correctIndex: 0 },
  { id: 'base-24', question: 'Swap/finansowanie to:', options: ['Odsetki naliczane za utrzymanie pozycji przez noc','Jednorazowa opłata aktywacyjna','Koszt danych rynkowych','Spread futures'], correctIndex: 0 },
  { id: 'base-25', question: 'Hedging w prostym ujęciu to:', options: ['Zabezpieczenie pozycji inną pozycją','Zwiększenie wielkości pozycji','Zmiana brokera','Zamykanie platformy'], correctIndex: 0 },
  { id: 'base-26', question: 'Zmienność (volatility) mierzy:', options: ['Skalę wahań ceny w czasie','Zysk na transakcję','Liczbę świec','Wolumen tickowy'], correctIndex: 0 },
  { id: 'base-27', question: 'Dywersyfikacja portfela oznacza:', options: ['Rozłożenie ryzyka między różne aktywa/strategie','Zwiększenie pozycji w jednym instrumencie','Brak SL','Zawsze mniejszy zysk'], correctIndex: 0 },
  { id: 'base-28', question: 'Journaling/trading journal pomaga:', options: ['Poprawiać proces przez analizę wyników i błędów','Zwiększać dźwignię automatycznie','Unikać podatków','Zastąpić plan handlowy'], correctIndex: 0 },
];

const BASIC_PACK: QuizPack = { title: 'Podstawy — ABC rynku', questions: BASIC_QUESTIONS };

// ============================================================================
// FOREX (27 pytań)
// ============================================================================
const FOREX_QUESTIONS: QuizQuestion[] = [
  { id: 'fxq-01', question: 'W parze EUR/USD walutą kwotowaną (quote) jest:', options: ['EUR','USD','PLN','GBP'], correctIndex: 1 },
  { id: 'fxq-02', question: 'Przy pozycji 1 lot na EUR/USD, wartość 1 pipsa to około:', options: ['$1','$10','$100','$1000'], correctIndex: 1 },
  { id: 'fxq-03', question: 'Swap/overnight (finansowanie) to:', options: ['Naliczana opłata/odsetki za utrzymanie pozycji przez noc','Rodzaj zlecenia stop','Opłata od depozytu gotówkowego','Podatek od zysków'], correctIndex: 0, explanation: 'Swap (finansowanie) = koszt/odsetki za utrzymanie pozycji przez noc; nie mylić z „rolloverem” (zmianą daty waluty/rozliczeń o 17:00 NY).' },
  { id: 'fxq-04', question: 'Największa płynność na FX zwykle występuje podczas:', options: ['Nakładania się sesji Londyn–Nowy Jork','Godzin azjatyckich wyłącznie','Weekendu','Po publikacji KID'], correctIndex: 0 },
  { id: 'fxq-05', question: 'Co najczęściej powoduje rozszerzanie spreadu na FX?', options: ['Niska płynność / wysoka zmienność','Wysoka płynność i spokojny rynek','Duże zlecenie limit','Brak danych makro'], correctIndex: 0 },
  { id: 'fxq-06', question: 'Pipette to:', options: ['1/10 pipsa (piąte miejsce po przecinku na większości par)','Mniejsza odmiana lota','Wskaźnik zmienności','Rodzaj opłaty'], correctIndex: 0 },
  { id: 'fxq-07', question: 'Kurs krzyżowy (cross) to para:', options: ['Bez udziału USD (np. EUR/GBP)','Zawsze z USD','Wyłącznie z walutami EM','Z towarami'], correctIndex: 0 },
  { id: 'fxq-08', question: 'Rollover na FX następuje standardowo:', options: ['O 17:00 czasu Nowy Jork','O północy czasu lokalnego brokera','O 8:00 londyńskiego','W weekend'], correctIndex: 0, explanation: 'Rollover = odcięcie dnia/zmiana daty waluty (value date), zwykle 17:00 NY; nie jest to opłata ani swap.' },
  { id: 'fxq-09', question: 'Potrójny swap naliczany jest typowo:', options: ['W środę','W piątek','W poniedziałek','W sobotę'], correctIndex: 0, explanation: 'Potrójny swap (3x) zwykle w środę – kompensuje weekend; dotyczy finansowania, nie rolloveru. Wyjątki zależne od instrumentu/brokera.' },
  { id: 'fxq-10', question: 'Carry trade polega na:', options: ['Kupnie waluty o wyższej stopie i sprzedaży o niższej','Arbitrażu między giełdami','Transakcjach w fixingu 4pm','Zawsze krótkiej sprzedaży'], correctIndex: 0 },
  { id: 'fxq-11', question: 'ESMA ogranicza dźwignię dla major FX do:', options: ['30:1','50:1','100:1','10:1'], correctIndex: 0 },
  { id: 'fxq-12', question: 'Zlecenie stop bywa wypełnione z poślizgiem głównie przez:', options: ['Luki/gapy i szybki ruch','Stały spread','Brak wolumenu minimalnego','Błędny SL'], correctIndex: 0 },
  { id: 'fxq-13', question: 'Fixing WM/Reuters 16:00 (Londyn) to:', options: ['Okno referencyjne do wycen i benchmarków','Start sesji azjatyckiej','Godzina publikacji NFP','Limit dzienny'], correctIndex: 0 },
  { id: 'fxq-14', question: 'Najczęściej korelują dodatnio:', options: ['EUR/USD i GBP/USD','USD/JPY i złoto','USD/CAD i ropa (+)','CHF/JPY i indeksy'], correctIndex: 0 },
  { id: 'fxq-15', question: 'W parach z JPY 1 pip to zwykle:', options: ['0.01','0.0001','1','0.1'], correctIndex: 0 },
  { id: 'fxq-16', question: 'EBS/Reuters to:', options: ['Platformy międzybankowe FX (OTC)','Rodzaje wskaźników makro','Indeksy zmienności','Fundusze MM'], correctIndex: 0 },
  { id: 'fxq-17', question: 'Broker STP/ECN:', options: ['Przekazuje zlecenia na zewnętrzną płynność','Zawsze market maker','Nie ma prowizji','Gwarantuje brak poślizgu'], correctIndex: 0 },
  { id: 'fxq-18', question: 'Największe ruchy intraday często pojawiają się:', options: ['Wokół publikacji kluczowych danych (CPI, NFP, decyzje banków)','W nocy w weekend','W święta bankowe','Po zamknięciu rynku'], correctIndex: 0 },
  { id: 'fxq-19', question: 'Ryzyko kursowe walut krajów z reżimem stałym (peg):', options: ['Może materializować się przy dewaluacjach/porzuceniu pegu (np. CHF 2015)','Nie istnieje','Dotyczy tylko krypto','Zawsze dodatni swap'], correctIndex: 0 },
  { id: 'fxq-20', question: 'FIFO w USA oznacza:', options: ['Zamykanie pozycji w kolejności ich otwarcia','Dowolna kolejność zamykania','Zakaz SL','Brak prowizji'], correctIndex: 0 },
  { id: 'fxq-21', question: 'Cross EUR/PLN to przykład:', options: ['Pary egzotycznej EM','Majora','Surowcowej','Indeksowej'], correctIndex: 0 },
  { id: 'fxq-22', question: 'Tick size to:', options: ['Minimalny przyrost notowania instrumentu','Rozmiar lota','Wartość pipsa','Wielkość wolumenu'], correctIndex: 0 },
  { id: 'fxq-23', question: 'Wartość pipsa zależy m.in. od:', options: ['Wielkości pozycji i pary walutowej','Rodzaju wykresu','Koloru interfejsu','Wyłącznie dźwigni'], correctIndex: 0 },
  { id: 'fxq-24', question: 'Główna różnica między zleceniem a pozycją:', options: ['Zlecenie to instrukcja, pozycja to już otwarta ekspozycja','Brak różnicy','Zlecenie to zawsze SL','Pozycja to zawsze long'], correctIndex: 0 },
  { id: 'fxq-25', question: 'Wydarzenie „central bank rate decision” zwykle:', options: ['Zwiększa zmienność i ryzyko poślizgu','Zmniejsza spread do zera','Zamyka rynek','Nie ma wpływu'], correctIndex: 0 },
  { id: 'fxq-26', question: 'Rynek FX jest:', options: ['OTC (poza giełdą), zdecentralizowany','Wyłącznie na giełdzie','Na jednym centralnym serwerze','Dostępny tylko 3 dni w tygodniu'], correctIndex: 0 },
  { id: 'fxq-27', question: 'Najwyższa aktywność zwykle jest:', options: ['Tuż po otwarciu Londynu i w oknie Londyn–NY','W nocy niedzielnej','W święta federalne','Po 23:00 CET'], correctIndex: 0 },
];

const FOREX_PACK: QuizPack = { title: 'Forex — pary, pipy, sesje', questions: FOREX_QUESTIONS };

// ============================================================================
// CFD (26 pytań)
// ============================================================================
const CFD_QUESTIONS: QuizQuestion[] = [
  { id: 'cfd-01', question: 'CFD (Contract for Difference) to instrument, który:', options: ['Rozlicza różnicę cen bez fizycznej dostawy aktywa','Zawsze ma datę wygaśnięcia jak futures','Jest notowany wyłącznie na giełdzie','Nie wymaga depozytu zabezpieczającego'], correctIndex: 0 },
  { id: 'cfd-02', question: 'Wymagany depozyt (margin) dla pozycji to w uproszczeniu:', options: ['Wartość nominalna / dźwignia','Zawsze stałe 100 USD','Różnica między bid i ask','Suma swapów'], correctIndex: 0 },
  { id: 'cfd-03', question: 'Utrzymywanie długiej pozycji CFD przez noc zwykle:', options: ['Generuje koszt finansowania (chyba że stopy ujemne/odwrotne)','Zawsze daje dodatni swap','Nie ma wpływu na P/L','Zamyka pozycję automatycznie'], correctIndex: 0 },
  { id: 'cfd-04', question: 'Ochrona przed saldem ujemnym (NBP) oznacza, że:', options: ['Klient detaliczny nie może zejść poniżej 0 na rachunku','Broker gwarantuje stały zysk','Nie ma margin call','Zawsze obowiązuje klientów profesjonalnych'], correctIndex: 0 },
  { id: 'cfd-05', question: 'Który czynnik NIE dotyczy polityki best execution dla CFD?', options: ['Cena','Koszty','Szybkość i prawdopodobieństwo','Kolor interfejsu'], correctIndex: 3 },
  { id: 'cfd-06', question: 'CFD na akcje zwykle:', options: ['Uwzględniają korekty o dywidendy/akcje (adjustments)','Nie podlegają żadnym korektom','Mają zawsze gwarantowany SL','Są bez finansowania'], correctIndex: 0 },
  { id: 'cfd-07', question: 'Cash index CFD vs. futures-based CFD:', options: ['Cash zawiera fair value/finansowanie, futures śledzi kontrakt terminowy','Nie ma różnicy','Cash ma zawsze większy spread','Futures nie ma wygasania'], correctIndex: 0 },
  { id: 'cfd-08', question: 'Godziny handlu CFD:', options: ['Zwykle odzwierciedlają godziny rynku bazowego z przerwami dostawcy','Zawsze 24/7','Wyłącznie w weekend','Tylko w Azji'], correctIndex: 0 },
  { id: 'cfd-09', question: 'Gwarantowany stop-loss (GSLO):', options: ['Może mieć dodatkową premię i eliminuje poślizg negatywny','Jest darmowy','Nie działa na indeksach','Zawsze niedostępny w UE'], correctIndex: 0 },
  { id: 'cfd-10', question: 'Close-out/margin close-out wg ESMA następuje zazwyczaj, gdy:', options: ['Equity/Margin spada do 50%','Saldo = 0','Spread > 10 pips','Swap = 0'], correctIndex: 0 },
  { id: 'cfd-11', question: 'Short na CFD na akcje przy dniu dywidendy:', options: ['Obciążany ujemną korektą dywidendy','Otrzymuje dywidendę','Bez zmian','Zamyka się automatycznie'], correctIndex: 0 },
  { id: 'cfd-12', question: 'Komisja na CFD na akcje:', options: ['Często występuje oprócz spreadu (np. x bps wartości transakcji)','Nie istnieje','Zastępuje spread','Płacona tylko przy zamknięciu'], correctIndex: 0 },
  { id: 'cfd-13', question: 'Dźwignia ESMA dla akcji to zwykle:', options: ['1:5 (margin 20%)','1:2','1:30','1:50'], correctIndex: 0 },
  { id: 'cfd-14', question: 'Weekend gap na indeksach może:', options: ['Powodować otwarcie z luką i poślizg zleceń stop','Zmniejszać ryzyko','Gwarantować wykonanie po cenie','Być niemożliwy'], correctIndex: 0 },
  { id: 'cfd-15', question: 'CFD a futures – główna różnica:', options: ['CFD nie ma daty wygaśnięcia (cash), futures ma','Brak różnic','Futures nie ma depozytu','CFD zawsze na giełdzie'], correctIndex: 0 },
  { id: 'cfd-16', question: 'Hedging portfela CFD może polegać na:', options: ['Zajęciu przeciwstawnej pozycji na korelującym instrumencie','Zwiększeniu dźwigni','Usunięciu SL','Zmianie rachunku'], correctIndex: 0 },
  { id: 'cfd-17', question: 'Corporate actions (split/merge) w CFD:', options: ['Powodują odpowiednie korekty wielkości i ceny pozycji','Nie wpływają','Zawsze zamykają pozycję','Dotyczą tylko futures'], correctIndex: 0 },
  { id: 'cfd-18', question: 'Ryzyko „symbol suspension” (zawieszenia obrotu) oznacza:', options: ['Możliwą niedostępność handlu/wyceny i rozszerzone spready','Brak wpływu','Zawsze zysk','Stały spread'], correctIndex: 0 },
  { id: 'cfd-19', question: 'Indeksy CFD najczęściej są kwotowane:', options: ['W punktach indeksowych','W USD za baryłkę','W uncjach','W buszlach'], correctIndex: 0 },
  { id: 'cfd-20', question: 'Różnica bid/ask w nocnych godzinach:', options: ['Może się rozszerzać ze względu na płynność','Zawsze maleje','Nie występuje','Zawsze stała'], correctIndex: 0 },
  { id: 'cfd-21', question: 'Model MM vs. STP w CFD:', options: ['MM może internalizować zlecenia; STP przekazuje do dostawców płynności','To to samo','STP = brak prowizji','MM = brak poślizgu'], correctIndex: 0 },
  { id: 'cfd-22', question: 'CFD na towary (np. ropa) – główne czynniki ceny:', options: ['Podaż/popyt, zapasy, OPEC, makro','Tylko kurs USD','Tylko pogoda','Wyłącznie polityka monetarna'], correctIndex: 0 },
  { id: 'cfd-23', question: 'CFD cash na indeks często zawiera w cenie:', options: ['Element finansowania (fair value) względem futures','Dywidendy w pełnej wysokości','Zero spreadu','Gwarancję ceny'], correctIndex: 0 },
  { id: 'cfd-24', question: 'Slippage dodatni (positive) to:', options: ['Wykonanie po lepszej cenie niż oczekiwana','Zawsze błąd platformy','Niemożliwe','Zawsze gorsza cena'], correctIndex: 0 },
  { id: 'cfd-25', question: '„Execution quality” w polityce best execution obejmuje m.in.:', options: ['Cenę, koszty, szybkość i prawdopodobieństwo wykonania','Wygląd aplikacji','Budżet marketingu','Kolor świec'], correctIndex: 0 },
  { id: 'cfd-26', question: 'Najczęstsze ryzyka CFD to:', options: ['Dźwignia, zmienność, luki, finansowanie, poślizg','Wyłącznie spread','Brak płynności zawsze','Brak ryzyka'], correctIndex: 0 },
];

const CFD_PACK: QuizPack = { title: 'CFD — mechanika i koszty', questions: CFD_QUESTIONS };

// ============================================================================
// MATERIAŁY (25 pytań) — AT, psychologia, kalendarz
// ============================================================================
const MATERIALS_QUESTIONS: QuizQuestion[] = [
  { id: 'mat-01', question: 'Formacja „młot” (hammer) to najczęściej:', options: ['Sygnał kontynuacji spadków','Byczy sygnał odwrócenia','Formacja neutralna','Sygnał odwrotu trendu wzrostowego w dół (bearish)'], correctIndex: 1 },
  { id: 'mat-02', question: 'RSI powyżej 70 zwykle interpretuje się jako:', options: ['Wyprzedanie','Wykupienie','Brak trendu','Sygnał kupna zawsze'], correctIndex: 1 },
  { id: 'mat-03', question: 'Raport NFP (USA) zwykle publikowany jest:', options: ['W każdy poniedziałek','W pierwszy piątek miesiąca','W ostatnią środę miesiąca','Raz na kwartał'], correctIndex: 1 },
  { id: 'mat-04', question: 'Poziomy wsparcia/oporu w AT to:', options: ['Obszary, gdzie popyt/podaż historycznie zatrzymywały ruch ceny','Linie wyłącznie rysowane co 10 pipsów','Poziomy z kalendarza makro','Miejsca, gdzie spread zawsze rośnie'], correctIndex: 0 },
  { id: 'mat-05', question: '„1% ryzyka na transakcję” oznacza, że:', options: ['Potencjalna strata do SL to max 1% kapitału','Pozycja ma wielkość 1% wolumenu rynku','Zysk zawsze wyniesie 1%','Prowizja to 1%'], correctIndex: 0 },
  { id: 'mat-06', question: 'SMA i EMA różnią się tym, że:', options: ['EMA silniej waży świeższe dane','SMA zawsze szybsza','EMA jest średnią arytmetyczną','Nie ma różnicy'], correctIndex: 0 },
  { id: 'mat-07', question: 'MACD składa się z:', options: ['Dwie EMA, linia sygnału i histogram','RSI i linia sygnału','DMI i ADX','ATR i sygnał'], correctIndex: 0 },
  { id: 'mat-08', question: 'Bollinger Bands pokazują:', options: ['Odchylenia standardowe wokół średniej','Wolumen tickowy','Trend liniowy','Korelację'], correctIndex: 0 },
  { id: 'mat-09', question: 'Ważność linii trendu rośnie wraz z:', options: ['Liczbą potwierdzonych dotknięć i czasem trwania','Kolorem linii','Godziną rysowania','Parą walutową'], correctIndex: 0 },
  { id: 'mat-10', question: 'Heikin-Ashi względem klasycznych świec:', options: ['Wygładza ruch i redukuje szum','Zawsze zwiększa zmienność','Nie pokazuje trendu','Nie ma świec'], correctIndex: 0 },
  { id: 'mat-11', question: 'Fibonacci 61.8% to:', options: ['Często obserwowany poziom korekty','Poziom wolumenu','Wartość RSI','Wartość ATR'], correctIndex: 0 },
  { id: 'mat-12', question: 'ATR używamy m.in. do:', options: ['Dostosowania SL do zmienności','Liczenia prowizji','Wyceny dywidendy','Obrotu na fixingu'], correctIndex: 0 },
  { id: 'mat-13', question: 'Dziennik transakcji (journal) pomaga:', options: ['W eliminacji błędów poznawczych i optymalizacji procesu','W zawieszaniu reguł','W unikaniu planu','W zwiększaniu lewara bez ryzyka'], correctIndex: 0 },
  { id: 'mat-14', question: 'Bias „loss aversion” oznacza, że:', options: ['Straty bolą bardziej niż zyski o tej samej wielkości','Zawsze zwiększamy ryzyko','Nie zamykamy stratnych','Zawsze skracamy zyski'], correctIndex: 0 },
  { id: 'mat-15', question: 'FOMO prowadzi często do:', options: ['Pogoni za rynkiem i gorszych wejść','Lepszego timingu','Niższych kosztów','Braku poślizgu'], correctIndex: 0 },
  { id: 'mat-16', question: 'Elementy planu tradingowego to m.in.:', options: ['Setup, warunki wejścia/wyjścia, ryzyko, zarządzanie pozycją, dziennik','Kolor świec i layout','Preferencje muzyczne','Zawsze scalping'], correctIndex: 0 },
  { id: 'mat-17', question: 'Overfitting to:', options: ['Przedobrzenie dopasowania do danych historycznych kosztem uogólnienia','Zbyt mały spread','Brak SL','Niskie koszty'], correctIndex: 0 },
  { id: 'mat-18', question: 'Test OOS (out-of-sample) służy do:', options: ['Weryfikacji modelu na nowych danych','Zwiększania dźwigni','Zmiany brokera','Zawsze wyższych wyników'], correctIndex: 0 },
  { id: 'mat-19', question: 'Expectancy/EV można przybliżyć jako:', options: ['Win% × średni zysk – Loss% × średnia strata','Średni zysk ÷ średnia strata','Wygrane – przegrane','Sharpe × RR'], correctIndex: 0 },
  { id: 'mat-20', question: 'Dane makro wysokiej wagi w kalendarzu zwykle:', options: ['Podnoszą zmienność i ryzyko poślizgu','Zmniejszają spread do zera','Blokują egzekucję','Nie dotyczą FX'], correctIndex: 0 },
  { id: 'mat-21', question: 'Korelacja ≠ przyczynowość, więc:', options: ['Potrzebne są dodatkowe testy, by ocenić zależność','To to samo','Wystarczy zobaczyć wykres','Zawsze działa'], correctIndex: 0 },
  { id: 'mat-22', question: 'Sharpe ratio mierzy:', options: ['Zwrot skorygowany o ryzyko (odchylenie) ponad stopę wolną od ryzyka','Wyłącznie maksymalny zysk','Wolumen','Spread'], correctIndex: 0 },
  { id: 'mat-23', question: '„Risk of ruin” rośnie gdy:', options: ['Zwiększasz ryzyko na trade przy tej samej przewadze','Zwiększasz RR','Masz wyższy Win%','Obniżasz zmienność'], correctIndex: 0 },
  { id: 'mat-24', question: 'Zasada 2R/3R oznacza, że:', options: ['Celujesz w zysk ≥ 2–3 × ryzyko','Ryzykujesz 2–3% equity bez SL','Brak walidacji','Zawsze 2 transakcje'], correctIndex: 0 },
  { id: 'mat-25', question: 'Dobre praktyki wokół newsów:', options: ['Zredukować pozycję/ryzyko, jeśli strategia nie jest newsowa','Zwiększać lewar na siłę','Ustawiać bardzo wąskie SL','Ignorować kalendarz'], correctIndex: 0 },
];

const MATERIALS_PACK: QuizPack = { title: 'Materiały — AT, psychologia, kalendarz', questions: MATERIALS_QUESTIONS };

// ============================================================================
// ZAAWANSOWANE (25 pytań) — edge, statystyka, testy, automatyzacja
// ============================================================================
const ADVANCED_QUESTIONS: QuizQuestion[] = [
  { id: 'adv-01', question: 'Edge (przewaga) w ujęciu statystycznym to:', options: ['Dodatnia oczekiwana wartość (EV>0) po kosztach','Zawsze najwyższy Win%','Brak strat','Stały spread'], correctIndex: 0 },
  { id: 'adv-02', question: 'Look-ahead bias to:', options: ['Użycie informacji z przyszłości w backteście','Zbyt mały sample','Brak transakcji','Błąd prowizji'], correctIndex: 0 },
  { id: 'adv-03', question: 'Survivorship bias oznacza:', options: ['Ignorowanie padłych/delistowanych instrumentów w danych','Zawsze losowanie danych','Brak poboru danych','Wyłącznie w krypto'], correctIndex: 0 },
  { id: 'adv-04', question: 'Walk-forward analysis służy do:', options: ['Selekcji/aktualizacji parametrów przez okna IS/OOS w czasie','Optymalizacji prowizji','Zwiększania dźwigni','Zmiany brokera'], correctIndex: 0 },
  { id: 'adv-05', question: 'P-hacking/multiple testing problem to:', options: ['Zwiększone ryzyko fałszywych trafień przy wielu testach','Brak normalności rozkładu','Błąd liczenia pipsów','Zawsze wyższy Sharpe'], correctIndex: 0 },
  { id: 'adv-06', question: 'Monte Carlo w tradingu służy do:', options: ['Symulacji losowej kolejności wyników/parametrów i oceny stabilności','Ustalenia spreadu','Obliczeń KID','Zawsze do predykcji'], correctIndex: 0 },
  { id: 'adv-07', question: 'Sharpe ratio to:', options: ['(Zwrot – stopa wolna)/odchylenie stóp','Wolumen ÷ koszt','Zysk ÷ strata','Win% × RR'], correctIndex: 0 },
  { id: 'adv-08', question: 'Max Drawdown (MDD) mierzy:', options: ['Największe obsunięcie kapitału od szczytu','Średnią stratę','Najgorszy SL','Spread efektywny'], correctIndex: 0 },
  { id: 'adv-09', question: 'Kelly fraction (teoria) sugeruje:', options: ['Optymalny ułamek kapitału przy znanym EV i wariancji','Brak ryzyka','Stałe 1% na trade','RR = 1'], correctIndex: 0 },
  { id: 'adv-10', question: 'Volatility targeting polega na:', options: ['Skalowaniu pozycji tak, by utrzymać docelową zmienność portfela','Zwiększaniu dźwigni w trendzie','Zawsze równym lewarze','Braku SL'], correctIndex: 0 },
  { id: 'adv-11', question: 'Ryzyko „data leakage” to:', options: ['Przeciek informacji między zbiorami trening/test','Brak logowania','Zerowy wolumen','Zła waluta'], correctIndex: 0 },
  { id: 'adv-12', question: 'Regime switching w praktyce:', options: ['Zmiany warunków rynkowych (risk-on/off) wpływające na skuteczność strategii','Brak wpływu','Stały spread','Tylko w krypto'], correctIndex: 0 },
  { id: 'adv-13', question: 'Risk parity dąży do:', options: ['Wyrównania wkładu ryzyka składników portfela','Maks. zysku jednego składnika','Minimalnej liczby pozycji','Braku dywersyfikacji'], correctIndex: 0 },
  { id: 'adv-14', question: 'Transakcyjne koszty niejawne to m.in.:', options: ['Poślizg i wpływ na cenę (market impact)','Wyłącznie prowizja','Opłata stała platformy','Podatek dochodowy'], correctIndex: 0 },
  { id: 'adv-15', question: '„Outlier handling” może obejmować:', options: ['Winsoryzację/cięcie ogonów w analizie','Zawsze usuwanie wszystkich skrajnych','Ignorowanie outlierów','Zastąpienie 0'], correctIndex: 0 },
  { id: 'adv-16', question: 'Korelacje w portfelu są zdradliwe, bo:', options: ['Są niestacjonarne i zmieniają się w czasie','Zawsze stałe','Nie mają znaczenia','Są liniowe'], correctIndex: 0 },
  { id: 'adv-17', question: 'Execution algos (TWAP/VWAP) służą do:', options: ['Rozłożenia zleceń w czasie, by ograniczyć wpływ na rynek','Zwiększania poślizgu','Zamykania wszystkich pozycji','Arbitrażu podatkowego'], correctIndex: 0 },
  { id: 'adv-18', question: 'Iceberg/hidden order to:', options: ['Zlecenie z ukrytą częścią wolumenu','Zawsze stop','Limit z warunkiem','Brak egzekucji'], correctIndex: 0 },
  { id: 'adv-19', question: 'Automatyzacja sygnałów obejmuje m.in.:', options: ['Alerty, webhooki/API, kolejki, retrie, logi','Tylko e-mail','Wyłącznie SMS','Ręczne wpisy'], correctIndex: 0 },
  { id: 'adv-20', question: '„Lookback window” w strategii odnosi się do:', options: ['Zakresu danych używanych do obliczeń (np. EMA(50))','Godzin handlu','Limitu prowizji','Maks. poślizgu'], correctIndex: 0 },
  { id: 'adv-21', question: '„Alpha decay” oznacza:', options: ['Spadek przewagi strategii w czasie','Wzrost EV','Stały zysk','Brak zmian'], correctIndex: 0 },
  { id: 'adv-22', question: 'Testowanie robustności obejmuje:', options: ['Perturbacje parametrów/danych, permutacje, MC','Tylko jeden parametr','Zawsze optymalizację do max','Brak weryfikacji'], correctIndex: 0 },
  { id: 'adv-23', question: 'Równanie EV w tradingu:', options: ['EV = Win% × AvgWin – Loss% × AvgLoss (po kosztach)','EV = suma zysków','EV = Sharpe × beta','EV = prowizja – swap'], correctIndex: 0 },
  { id: 'adv-24', question: 'Metryka „Ulcer Index” mierzy:', options: ['Głębokość i czas trwania spadków kapitału','Szum rynkowy','Spread','Wolumen'], correctIndex: 0 },
  { id: 'adv-25', question: 'Alert risk-on/off można oprzeć na:', options: ['Kombinacji VIX, spreadów kredytowych, krzywej UST','Wyłącznie RSI 14','Kolorze świec','Godzinie serwera'], correctIndex: 0 },
];

const ADVANCED_PACK: QuizPack = { title: 'Zaawansowane — systemy i algotrading', questions: ADVANCED_QUESTIONS };

// ============================================================================
// REJESTR
// ============================================================================
export const QUIZZES: Record<string, QuizPack> = {
  // nowe/rozszerzone
  podstawy: BASIC_PACK,
  forex: FOREX_PACK,
  cfd: CFD_PACK,
  materialy: MATERIALS_PACK,
  zaawansowane: ADVANCED_PACK,

  // istniejące
  knf: KNF_PACK,
  cysec: CYSEC_PACK,
  mifid: MIFID_PACK,
} as const;
