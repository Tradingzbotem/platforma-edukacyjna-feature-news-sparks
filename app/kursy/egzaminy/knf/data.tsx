// app/kursy/egzaminy/knf/data.tsx
import type { ReactNode } from "react";

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  free?: boolean;        // true = podgląd dostępny bez logowania
  content: ReactNode;    // JSX treść lekcji
};

export const LESSONS: Lesson[] = [
  {
    id: "wstep-zakres",
    title: "Wprowadzenie i zakres programu",
    minutes: 8,
    free: true,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          Przegląd obszarów sprawdzanych na egzaminach i przy audytach zgodności:
          MiFID II, ochrona klienta, best execution, konflikty interesów,
          przeciwdziałanie nadużyciom rynkowym (MAR), obowiązki AML.
        </p>
        <ul>
          <li>Definicje klienta: detaliczny, profesjonalny, uprawniony kontrahent.</li>
          <li>Informacje przedtransakcyjne: KID/KIID, koszty i opłaty.</li>
          <li>Odpowiedniość (suitability) vs. adekwatność (appropriateness).</li>
        </ul>
      </div>
    ),
  },
  {
    id: "mifid-klient",
    title: "MiFID II — klasyfikacja i ochrona klienta",
    minutes: 12,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          Zasady klasyfikacji klienta oraz wynikające z tego obowiązki informacyjne
          i poziom ochrony. Kiedy i jak można „opt-up/opt-down”.
        </p>
        <ul>
          <li>Zakres informacji: ryzyko produktu, koszty, częstotliwość raportowania.</li>
          <li>Testy: adekwatność (appropriateness) i odpowiedniość (suitability).</li>
          <li>Dokumenty: KID/KIID, polityka best execution, polityka konfliktów interesów.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "best-execution",
    title: "Best execution i koszty",
    minutes: 10,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          „Najlepsza realizacja” to nie tylko cena: liczą się m.in. koszt, szybkość,
          prawdopodobieństwo realizacji i rozliczenia, wielkość, charakter zlecenia.
        </p>
        <ul>
          <li>Polityka best execution — jak ją komunikować i aktualizować.</li>
          <li>RTS 28 — sprawozdawczość nt. miejsc realizacji (ramy, idea).</li>
          <li>Struktura opłat: prowizje, spread, finansowanie overnight.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "konflikty-interesow",
    title: "Konflikty interesów i materiały marketingowe",
    minutes: 9,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          Identyfikacja, zapobieganie, ujawnianie. Zasada „fair, clear, not misleading”
          w materiałach marketingowych.
        </p>
        <ul>
          <li>Chiny mury, ograniczenia prowizyjne, wynagradzanie pracowników.</li>
          <li>Wymogi dot. ryzyk i wyników historycznych w materiałach.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "mar-market-abuse",
    title: "Nadużycia rynkowe (MAR) — zarys",
    minutes: 8,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          Insider dealing, manipulacje, obowiązki raportowe. Rola nadzoru i monitoringu.
        </p>
        <ul>
          <li>Definicje i przykłady zachowań zabronionych.</li>
          <li>Obowiązki firm inwestycyjnych, zgłoszenia do nadzoru.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "aml-kyc",
    title: "AML/KYC — podstawy",
    minutes: 8,
    content: (
      <div className="prose prose-invert max-w-none">
        <p>
          Podstawowe obowiązki AML: identyfikacja i weryfikacja klienta, analiza ryzyka,
          monitoring i raportowanie.
        </p>
        <ul>
          <li>KYC, PEP, źródło środków, podejrzane transakcje.</li>
          <li>Wymogi dokumentacyjne i retencja danych.</li>
        </ul>
      </div>
    ),
  },
];
