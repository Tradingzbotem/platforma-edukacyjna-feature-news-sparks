/**
 * Metadane wyłącznie warstwy UI dla bloków ścieżek egzaminowych (KNF / CySEC / przewodnik).
 * Nie modyfikuje treści merytorycznych w plikach data — uzupełnia briefing / obszary / wskazówkę egzaminacyjną.
 */

export type ExamTrackId = "knf" | "cysec" | "przewodnik";

export type ExamBlockDisplayMeta = {
  briefing: string;
  focusAreas: string[];
  examFocusNote: string;
};

const FALLBACK: ExamBlockDisplayMeta = {
  briefing:
    "Ten blok porządkuje wiedzę w obszarze typowym dla przygotowania egzaminacyjnego i pracy compliance.",
  focusAreas: [
    "Definicje i zakres regulatorowy",
    "Obowiązki wobec klienta i dokumentacja",
    "Powiązania z praktyką nadzorczą",
  ],
  examFocusNote:
    "Na egzaminie często pojawia się zastosowanie pojęć w prostych sytuacjach — ćwicz przejście od definicji do decyzji operacyjnej.",
};

const KNF: Record<string, ExamBlockDisplayMeta> = {
  "wstep-zakres": {
    briefing:
      "Orientacja w zakresie tematów powtarzanych na egzaminach i w audytach zgodności: od klasyfikacji klienta po MAR i AML.",
    focusAreas: [
      "Klient detaliczny vs profesjonalny — konsekwencje ochrony",
      "KID/KIID, koszty i przejrzystość",
      "Suitability vs appropriateness",
      "Best execution i konflikty — gdzie zaczyna się compliance",
    ],
    examFocusNote:
      "Sprawdzaj, czy potrafisz wskazać konkretny dokument lub proces przy danym obowiązku (nie tylko nazwę regulacji).",
  },
  "mifid-klient": {
    briefing:
      "Blok o klasyfikacji klienta i poziomie ochrony w ramach MiFID II — fundament pod większość pytań „klientowych”.",
    focusAreas: [
      "Opt-in / opt-out i warunki zmiany kategorii",
      "Testy adekwatności i odpowiedniości",
      "Pakiet informacji: ryzyko, koszty, częstotliwość raportów",
      "Dokumentacja polityk (best execution, konflikty)",
    ],
    examFocusNote:
      "Częste pułapki: mylenie adekwatności z odpowiedniością oraz brak powiązania kategorii klienta z poziomem disclosure.",
  },
  "best-execution": {
    briefing:
      "Najlepsza realizacja to zestaw czynników, nie tylko cena — ważne dla pytań o polityki, koszty i raportowanie.",
    focusAreas: [
      "Czynniki realizacji: cena, koszt, szybkość, prawdopodobieństwo realizacji",
      "Polityka best execution — komunikacja i aktualizacja",
      "RTS 28 — idea miejsc realizacji (poziom egzaminacyjny)",
      "Struktura opłat: prowizje, spread, overnight",
    ],
    examFocusNote:
      "Potrafisz uzasadnić, dlaczego dany czynnik ma wagę przy danym instrumencie lub profilu klienta?",
  },
  "konflikty-interesow": {
    briefing:
      "Identyfikacja i zarządzanie konfliktami oraz uczciwy przekaz marketingowy — typowe dla case’ów compliance.",
    focusAreas: [
      "Identyfikacja, zapobieganie, ujawnianie",
      "Fair, clear, not misleading",
      "Chiny informacyjne i ograniczenia wynagrodzeń",
      "Ryzyka i wyniki w materiałach — granice przekazu",
    ],
    examFocusNote:
      "Szukaj w pytaniach sformułowań typu „co musisz ujawnić” zanim zarekomendujesz działanie marketingowe.",
  },
  "mar-market-abuse": {
    briefing:
      "Zarys MAR: insider dealing, manipulacje i obowiązki raportowe — często w formie definicji i rozpoznania sytuacji.",
    focusAreas: [
      "Insider dealing vs legalny obrót informacją",
      "Manipulacje i przykłady zachowań zabronionych",
      "Obowiązki firm i kanały zgłoszeń do nadzoru",
    ],
    examFocusNote:
      "Ćwicz rozróżnienie między „podejrzaną transakcją” a „nadużyciem” w sensie proceduralnym.",
  },
  "aml-kyc": {
    briefing:
      "Podstawy AML/KYC: identyfikacja, ryzyko, monitoring — powtarzalny blok na egzaminach i w checklistach audytowych.",
    focusAreas: [
      "KYC, PEP, źródło środków",
      "Model ryzyka i monitoring transakcji",
      "Dokumentacja i retencja",
    ],
    examFocusNote:
      "Pamiętaj o łańcuchu decyzji: ocena ryzyka → środki → dokumentacja, nie tylko lista pojęć.",
  },
};

const CYSEC: Record<string, ExamBlockDisplayMeta> = {
  m1: {
    briefing:
      "Fundamenty nadzoru CySEC i modelu CIF w kontekście UE — baza pod pytania o strukturę compliance i paszportowanie.",
    focusAreas: [
      "Rola CySEC i zakres licencji CIF",
      "MiFID / ESMA jako warstwa nadrzędna",
      "Funkcje Compliance, Risk, Internal Audit",
      "Polityki: konflikty, outsourcing, marketing, AML",
    ],
    examFocusNote:
      "Często pytają o niezależność funkcji i kanały raportowania do zarządu — przygotuj krótką ścieżkę eskalacji.",
  },
  m2: {
    briefing:
      "CFD, marketing i ochrona klienta — obszar case’owy: ostrzeżenia, kanały dystrybucji i odpowiedzialność za przekaz.",
    focusAreas: [
      "Zrównoważony przekaz i zakaz wprowadzających w błąd obietnic",
      "Proces zatwierdzania materiałów i rejestr",
      "Negative balance protection, margin close-out, dźwignia",
      "Monitoring stron, social, partnerów (IB)",
    ],
    examFocusNote:
      "Łącz treść materiału z procedurą zatwierdzenia — egzamin lubi „co zrobi compliance, gdy…”.",
  },
  m3: {
    briefing:
      "Outsourcing, cross-border i obsługa skarg — typowe dla pytań o governance i relacje z nadzorem.",
    focusAreas: [
      "Due diligence dostawcy, SLA, plan wyjścia",
      "Zgodność przekazu partnerów z wytycznymi",
      "Powiadomienia i nadzór rynku docelowego",
      "Rejestr skarg, terminy, root cause, raporty do CySEC",
    ],
    examFocusNote:
      "Zwróć uwagę na terminowość odpowiedzi i dowód działań korygujących — nie tylko „mamy procedurę”.",
  },
  m4: {
    briefing:
      "Podsumowanie materiałów i przejście do symulacji — integracja wiedzy z poprzednich bloków.",
    focusAreas: [
      "Circulars i wytyczne jako źródła operacyjne",
      "Lista kontroli compliance w praktyce",
      "Powtórka przed testem próbnym",
    ],
    examFocusNote:
      "Przed startem testu: ok. 15 minut na szybki przegląd własnych notatek z marketingu i skarg — największy zwrot w punktach.",
  },
};

const PRZEWODNIK: Record<string, ExamBlockDisplayMeta> = {
  wstep: {
    briefing:
      "Mapa regulatorów i filarów MiFID — szybka orientacja przed wejściem w szczegóły ESMA i narzędzi nadzorczych.",
    focusAreas: [
      "Rola KNF, ESMA i spójność z prawem UE",
      "Po co przedsiębiorcy znać limity i wytyczne",
      "Powiązanie z ochroną detalicznego inwestora",
    ],
    examFocusNote:
      "Utrwal, kto wydaje przepisy wiążące vs wytyczne — to bywa pułapką w pytaniach „kto decyduje o limicie”.",
  },
  mifid: {
    briefing:
      "Filary MiFID II w ujęciu praktycznym: przejrzystość, miejsca obrotu, ochrona i nadzór.",
    focusAreas: [
      "Transparency, reporting, investor protection",
      "Obowiązki podmiotów i konsekwencje dla modelu biznesowego",
      "Powiązanie z produktami i dystrybucją",
    ],
    examFocusNote:
      "Ćwicz krótkie definicje — egzamin często zaczyna się od „czym jest X w sensie MiFID”.",
  },
  esma: {
    briefing:
      "ESMA: wytyczne, product intervention i limity — typowe dla pytań o dźwignię i instrumenty.",
    focusAreas: [
      "Wytyczne vs rozporządzenia — jak czytać w praktyce",
      "Limity i interwencje tymczasowe",
      "Współpraca z KNF w jednolitym rynku",
    ],
    examFocusNote:
      "Zapamiętaj logikę interwencji: cel (ochrona), instrument, okres obowiązywania.",
  },
  "emir-mar": {
    briefing:
      "EMIR i MAR w skrócie: raportowanie, nadużycia i obowiązki compliance — często jako blok rozpoznawczy.",
    focusAreas: [
      "Idea raportowania (poziom ogólny dla egzaminu)",
      "MAR: insider dealing i manipulacje — rozpoznanie",
      "Powiązanie z monitoringiem w firmie",
    ],
    examFocusNote:
      "Nie mieszaj MAR (nadużycia) z codziennym AML — wskaż różnicę celu i triggerów.",
  },
  lewar: {
    briefing:
      "Dźwignia i ograniczenia dla detalicznych — bezpośrednio pod limity ESMA i komunikację ryzyka.",
    focusAreas: [
      "Limity dźwigni i ich uzasadnienie",
      "Ochrona przed ujemnym saldem (kontekst produktowy)",
      "Komunikacja ryzyka w materiałach",
    ],
    examFocusNote:
      "Sprawdź, czy potrafisz przeliczyć lub opisać skutek dźwigni dla klienta — nie tylko podać liczbę.",
  },
  testy: {
    briefing:
      "Testy adekwatności, odpowiedniości oraz dokumenty KID/KIID — centralny blok pod pytania „procesowe”.",
    focusAreas: [
      "Kiedy który test i jakie są konsekwencje",
      "Treść i timing dokumentów informacyjnych",
      "Błędy proceduralne najczęściej wskazywane w audytach",
    ],
    examFocusNote:
      "Ćwicz scenariusz: klient prosi o produkt wyższej złożoności — jaką ścieżkę informacyjną uruchamiasz?",
  },
};

const BY_TRACK: Record<ExamTrackId, Record<string, ExamBlockDisplayMeta>> = {
  knf: KNF,
  cysec: CYSEC,
  przewodnik: PRZEWODNIK,
};

export function getExamBlockMeta(track: ExamTrackId, blockKey: string): ExamBlockDisplayMeta {
  return BY_TRACK[track][blockKey] ?? FALLBACK;
}
