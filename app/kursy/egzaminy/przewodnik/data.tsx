'use client';
import type { ReactNode } from "react";

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  free?: boolean;
  content: ReactNode;
};

const M1 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Mapa pojęć: KNF, ESMA, MiFID II/MiFIR</h3>
    <ul>
      <li><strong>KNF</strong> – nadzór w PL (licencje, kontrole, sankcje); publikacje, komunikaty ryzyka.</li>
      <li><strong>ESMA</strong> – nadzór unijny „nad-nadzorcami”: wytyczne, Q&amp;A, interwencje produktowe (np. CFD).</li>
      <li><strong>MiFID II/MiFIR</strong> – ramy usług inwestycyjnych: ochrona klienta, governance produktu, raportowanie.</li>
    </ul>
    <h3>Kluczowe dokumenty klienta</h3>
    <ul>
      <li><strong>KID/KIID</strong> (PRIIPs/UCITS) – ryzyka, koszty, scenariusze.</li>
      <li><strong>Polityka egzekucji</strong>, <strong>konflikty interesów</strong>, <strong>koszty ex-ante/ex-post</strong>.</li>
      <li><strong>Ostrzeżenia o ryzyku</strong> (zwłaszcza CFD) – format wg ESMA.</li>
    </ul>
  </div>
);

const M2 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Kategoryzacja klientów</h3>
    <ul>
      <li>Detaliczny (najwyższa ochrona), Profesjonalny (opt-up: min. 2/3 kryteria), Uprawniony kontrahent.</li>
      <li>Konsekwencje: limity dźwigni, ostrzeżenia, raportowanie.</li>
    </ul>
    <h3>Testy: adekwatność i odpowiedniość</h3>
    <ul>
      <li><strong>Adekwatność</strong> – czy klient rozumie produkt (CFD = produkt złożony).</li>
      <li><strong>Odpowiedniość</strong> – tylko przy doradztwie/zarządzaniu portfelem (cele, ryzyko, horyzont).</li>
    </ul>
    <h3>Koszty i opłaty</h3>
    <ul>
      <li>Ex-ante: szacowane łączne koszty (produkt + usługa).</li>
      <li>Ex-post: rzeczywiste koszty roczne; transparentność.</li>
    </ul>
  </div>
);

const M3 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Product governance & Target Market</h3>
    <ul>
      <li>Definiowanie rynku docelowego: wiedza/Doświadczenie, cele, ryzyko, horyzont, zdolność ponoszenia strat.</li>
      <li>Dystrybucja zgodnie z TM, monitoring, przeglądy, zapobieganie miss-sellingowi.</li>
    </ul>
    <h3>Marketing i compliance</h3>
    <ul>
      <li>Przekaz zrównoważony – ryzyka ≈ korzyści, brak gwarancji, disclaimery przy wynikach historycznych.</li>
      <li>Reklamy dopasowane do TM, oznaczenia materiałów marketingowych, archiwizacja.</li>
    </ul>
  </div>
);

const M4 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Best Execution & konflikty interesów</h3>
    <ul>
      <li>BE: cena, koszty, szybkość, prawdopodobieństwo, rozmiar – polityka + raport coroczny dla klientów.</li>
      <li>Konflikty: identyfikacja, ograniczanie, ujawnienia (m.in. market-making, prowizje, powiązania).</li>
    </ul>
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <strong>Checklist:</strong> BE policy, konflikty, rejestry rozmów, Q&amp;A ESMA, KID/KIID, ex-ante/ex-post, ostrzeżenia CFD.
    </div>
  </div>
);

const M5 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Materiały & egzamin</h3>
    <ul>
      <li><a href="/materialy/przewodnik/mifid-kompendium.pdf" target="_blank">MiFID – kompendium (PDF)</a></li>
      <li><a href="/materialy/przewodnik/checklista-dokumenty-klienta.pdf" target="_blank">Checklista: dokumenty klienta (PDF)</a></li>
      <li><a href="/materialy/przewodnik/sciaga-terminy.docx" target="_blank">Ściąga: terminy i definicje (DOCX)</a></li>
    </ul>
    <p>Kliknij w boks „Egzamin próbny” na stronie kursu, aby uruchomić test jednokrotnego wyboru.</p>
  </div>
);

export const LESSONS: Lesson[] = [
  { id: 'm1', title: 'Moduł 1: KNF, ESMA, MiFID — kompas (preview)', minutes: 16, free: true, content: M1 },
  { id: 'm2', title: 'Moduł 2: Klienci, testy, koszty', minutes: 22, content: M2 },
  { id: 'm3', title: 'Moduł 3: Governance produktu + marketing', minutes: 24, content: M3 },
  { id: 'm4', title: 'Moduł 4: Best Execution i konflikty', minutes: 20, content: M4 },
  { id: 'm5', title: 'Moduł 5: Materiały + egzamin', minutes: 18, content: M5 },
];
