// lib/panel/eventPlaybooks.ts — statyczne playbooki eventowe (EDU)

export type EventPlaybook = {
  id: string;
  eventName: string;
  region: 'US' | 'EU' | 'UK';
  importance: 'low' | 'medium' | 'high';
  whatToWatch: string[];
  typicalPatterns: string[];
  invalidationClues: string[];
  riskNotes: string[];
  updatedAt: string;
};

export const EVENT_PLAYBOOKS: EventPlaybook[] = [
  {
    id: 'us-cpi',
    eventName: 'US CPI',
    region: 'US',
    importance: 'high',
    whatToWatch: [
      'Roczna i miesięczna dynamika CPI oraz core CPI',
      'Odchylenie od konsensusu i rewizje poprzednich odczytów',
      'Reakcja rentowności UST i DXY (dolar)',
    ],
    typicalPatterns: [
      'Wyższy od prognoz CPI → często „hawkish”: USD i rentowności w górę, presja na wzrostowe sektory',
      'Niższy od prognoz CPI → często „dovish”: osłabienie USD i spadek rentowności',
    ],
    invalidationClues: [
      'Szybkie odwrócenie po pierwszym impulsie, gdy detale raportu łagodzą nagłówek',
      'Rozjazd z core CPI lub silne rewizje zmieniające obraz inflacji',
    ],
    riskNotes: [
      'Publikacja generuje skoki zmienności i poślizgi — ostrożność w zarządzaniu ryzykiem',
      'Narracja rynku bywa ważniejsza niż pojedynczy odczyt',
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'us-nfp',
    eventName: 'US Non-Farm Payrolls (NFP)',
    region: 'US',
    importance: 'high',
    whatToWatch: [
      'Liczba miejsc pracy vs konsensus oraz rewizje',
      'Stopa bezrobocia i partycypacja',
      'Wynagrodzenia godzinowe (presja płacowa)',
    ],
    typicalPatterns: [
      'Duża pozytywna niespodzianka → często risk-on i mocniejszy USD, chyba że płace rosną zbyt szybko',
      'Słabsze NFP + rosnące bezrobocie → często „dovish”, spadek rentowności',
    ],
    invalidationClues: [
      'Silne rewizje poprzednich odczytów potrafią odwrócić pierwszą reakcję',
      'Rozjazd między nagłówkiem a szczegółami (np. słabe płace przy mocnym nagłówku)',
    ],
    riskNotes: [
      'Wysoka zmienność na otwarciu sesji, fałszywe wybicia nie są rzadkością',
      'Znaczenie zależy od cyklu i nastawienia Fed',
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fomc-minutes',
    eventName: 'FOMC Minutes',
    region: 'US',
    importance: 'medium',
    whatToWatch: [
      'Ton: jastrzębi vs gołębi w stosunku do poprzedniego posiedzenia',
      'Bilans ryzyk, wrażliwość na dane, perspektywa ścieżki stóp',
      'Wzmianki o inflacji płac i stanie popytu',
    ],
    typicalPatterns: [
      'Jastrzębi ton → często mocniejszy USD i wzrost rentowności',
      'Gołębi ton → często spadek USD i rentowności, risk-on na indeksach',
    ],
    invalidationClues: [
      'Rynek „czyta” minutes przez pryzmat świeższych danych — starszy dokument może mieć mniejszy wpływ',
      'Brak nowych informacji vs oczekiwania → reakcja bywa krótkotrwała',
    ],
    riskNotes: [
      'Znaczenie minutes rośnie, gdy rynek szuka wskazówek między posiedzeniami',
      'Pierwsza reakcja bywa myląca, jeśli nagłówki nie oddają całości dokumentu',
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ism-manufacturing',
    eventName: 'ISM Manufacturing',
    region: 'US',
    importance: 'medium',
    whatToWatch: [
      'Nagłówek PMI oraz komponenty: nowe zamówienia, ceny, zatrudnienie',
      'Próg 50 (ekspansja) oraz trend w komponentach',
      'Powiązanie z ruchem w rentownościach i USD',
    ],
    typicalPatterns: [
      'Mocne zaskoczenie w górę → bywa wsparciem dla USD i rentowności, risk-on jeśli inflacyjny komponent nie straszy',
      'Słaby odczyt → presja na USD i rentownościach, wrażliwość sektorów cyklicznych',
    ],
    invalidationClues: [
      'Rynek ignoruje odczyt, gdy stoi w sprzeczności z ważniejszymi publikacjami (np. CPI/NFP)',
      'Jednorazowe odchylenie bez potwierdzenia w trendzie',
    ],
    riskNotes: [
      'Wpływ bywa umiarkowany; większy, gdy dane wpisują się w zmianę narracji makro',
      'Uwaga na publikację w pobliżu innych istotnych wydarzeń',
    ],
    updatedAt: new Date().toISOString(),
  },
];

