// Local, static dictionaries for client-side translations (no API calls).
// Keys must match the exact normalized text content as it appears in the DOM.
// Normalization used by the translator collapses whitespace and trims ends.
// Add more entries as needed.

export const LOCAL_DICTIONARIES: Record<string, Record<string, string>> = {
  en: {
    // Navbar
    "Kursy": "Courses",
    "Kalkulator": "Calculator",
    "Quizy": "Quizzes",
    "Ebooki": "eBooks",
    "Rankingi brokerów": "Broker rankings",
    "Zaloguj": "Log in",
    "Dołącz za darmo": "Join for free",
    "Challenge": "Challenge",
    "News": "News",
    "Przejdź do treści": "Skip to content",

    // Hero
    "Edukacja od podstaw do pro (CFD & Forex)": "Education from basics to pro (CFD & Forex)",
    "Zbuduj solidne podstawy i praktyczne umiejętności na rynku Forex i CFD":
      "Build solid foundations and practical skills for the Forex and CFD markets",
    "Lekcje, quizy, wyzwania i kalkulatory. Zero „sygnałów”, 100% edukacji. Ucz się w tempie, które daje wyniki.":
      "Lessons, quizzes, challenges and calculators. Zero “signals”, 100% education. Learn at a pace that delivers results.",
    "Rozpocznij naukę": "Start learning",
    "Próbny test": "Practice test",
    "Zagraj próbny test": "Take a practice test",
    "4.0/5 na podstawie 1 245 opinii": "4.0/5 based on 1,245 reviews",

    // Categories
    "Podstawy inwestowania": "Investing fundamentals",
    "Ryzyko vs. zwrot, dźwignia, typy zleceń, czytanie świec.":
      "Risk vs. return, leverage, order types, candlestick reading.",
    "Forex": "Forex",
    "Pary walutowe, pipsy i loty, sesje, wpływ makro i stóp procentowych.":
      "Currency pairs, pips and lots, sessions, macro and interest rate impact.",
    "CFD": "CFDs",
    "Mechanika CFD, finansowanie overnight, indeksy, surowce, krypto.":
      "CFD mechanics, overnight financing, indices, commodities, crypto.",
    "Zaawansowane": "Advanced",
    "Edge i statystyka, testy out-of-sample, psychologia i błędy poznawcze.":
      "Edge and statistics, out-of-sample testing, psychology and cognitive biases.",
    "Wejdź do modułu": "Enter module",

    // Stats
    "Lekcje": "Lessons",
    "Uczestnicy": "Learners",
    "Śr. czas / tydz.": "Avg. time / week",

    // Featured courses section
    "Polecane kursy": "Featured courses",
    "Zacznij od podstaw i przechodź do bardziej zaawansowanych tematów.":
      "Start with the basics and move on to more advanced topics.",
    "Zobacz wszystkie": "See all",
    "PODSTAWY": "BASICS",
    "ZAAWANSOWANE": "ADVANCED",
    "Wprowadzenie do rynku Forex": "Introduction to the Forex market",
    "Zarządzanie ryzykiem i wielkość pozycji": "Risk management and position sizing",
    "CFD na indeksy i surowce – praktyka": "Index and commodity CFDs – practice",
    "Testowanie strategii: od hipotezy do wyników":
      "Strategy testing: from hypothesis to results",
    "Poznaj strukturę rynku, uczestników, płynność i interwały.":
      "Learn market structure, participants, liquidity and timeframes.",
    "Obliczaj wielkość pozycji w pips/lot i trzymaj się R-multiple.":
      "Calculate position size in pips/lot and stick to R-multiple.",
    "Finansowanie overnight, poślizg, sesje – praktyczne przykłady.":
      "Overnight financing, slippage, sessions – practical examples.",
    "Stabilność statystyczna, out-of-sample, walk-forward (koncepcje).":
      "Statistical stability, out-of-sample, walk-forward (concepts).",
    "Początkujący": "Beginner",
    "Średniozaawansowany": "Intermediate",
    "Zaawansowany": "Advanced",
    "Rozpocznij": "Start",

    // AI section
    "Bądź na bieżąco z AI": "Stay up to date with AI",
    "Szybkie info od AI": "Quick updates from AI",
    "Na bieżąco skanujemy wiarygodne źródła i podajemy najważniejsze informacje, zwięźle i bez rekomendacji inwestycyjnych.":
      "We continuously scan credible sources and provide key information, concise and without investment recommendations.",
    "Odśwież teraz": "Refresh now",
    "Edukacyjnie — bez rekomendacji inwestycyjnych.":
      "Educational — no investment recommendations.",

    // CTA
    "Dołącz i odblokuj pełny program": "Join and unlock the full program",
    "Darmowy dostęp do modułu „Podstawy” + quizy wprowadzające.":
      "Free access to the 'Basics' module + introductory quizzes.",
    "Załóż konto": "Create account",
    "Rozwiąż quiz": "Take a quiz",

    // Footer
    "Platforma edukacyjna Forex/CFD. Bez porad inwestycyjnych – tylko wiedza i praktyka.":
      "Forex/CFD education platform. No investment advice — just knowledge and practice.",
    "Nawigacja": "Navigation",
    "Zasoby": "Resources",
    "Prawne": "Legal",
    "FAQ": "FAQ",
    "Warunki korzystania": "Terms of use",
    "Polityka prywatności": "Privacy policy",
    "Cookies": "Cookies",
    "Kontakt": "Contact",
    "Ostrzeżenie o ryzyku: Handel instrumentami z dźwignią (w tym CFD i Forex) wiąże się z wysokim ryzykiem szybkiej utraty środków z powodu dźwigni finansowej. Materiały dostępne na tej stronie mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnych.":
      "Risk warning: Trading leveraged instruments (including CFDs and Forex) involves a high risk of rapid loss due to leverage. Materials on this website are for educational purposes only and do not constitute investment recommendations.",

    // Modal quiz
    "Quiz": "Quiz",
    "pytań": "questions",
    "Zamknij": "Close",
    "Wynik:": "Score:",
    "Zaznacz odpowiedzi i sprawdź wynik.": "Select answers and check your score.",
    "Sprawdź odpowiedzi": "Check answers",

    // Courses page
    "← Strona główna": "← Home",
    "Moduły": "Modules",
    "Materiały": "Materials",
    "Egzaminy": "Exams",
    "Wybierz ścieżkę lub materiał dodatkowy. Zacznij od „Podstaw”, a potem przechodź do kolejnych modułów – wszystko w tempie dopasowanym do Ciebie.":
      "Choose a path or additional material. Start with 'Basics', then move through modules — at your own pace.",
    "Czego się nauczysz": "What you'll learn",
    "Fundamentów rynku: pipsy/loty, zlecenia (market/limit/stop), dźwignia i mechanika wykonania zleceń w praktyce.":
      "Market fundamentals: pips/lots, orders (market/limit/stop), leverage and execution mechanics in practice.",
    "Analizy i procesu: S/R, momentum, zarządzanie ryzykiem, R-multiple, dziennik transakcyjny i checklisty decyzyjne.":
      "Analysis and process: S/R, momentum, risk management, R-multiple, trading journal and decision checklists.",
    "Ram operacyjnych: rollover/swap, godziny sesji, wpływ danych makro, margin & equity, dobre praktyki wykonawcze.":
      "Operational framework: rollover/swap, session hours, macro data impact, margin & equity, and execution best practices.",
    "Materiały mają charakter wyłącznie edukacyjny i nie stanowią porad ani rekomendacji inwestycyjnych.":
      "Materials are for educational purposes only and do not constitute advice or investment recommendations.",
    "Jak wykorzystasz w praktyce": "How you'll apply it in practice",
    "Ćwiczenie na danych: rozwiąż": "Practice on data: solve",
    "quizy kontrolne": "review quizzes",
    "i sprawdź kalkulacje w": "and verify calculations in the",
    "kalkulatorze/symulatorze": "calculator/simulator",
    "Operacyjnie: znajomość kosztów (spread/poślizg/swap), zarządzanie wielkością pozycji i przygotowanie pod wydarzenia makro.":
      "Operationally: know costs (spread/slippage/swap), manage position size and prepare for macro events.",
    "Przejdź do quizów": "Go to quizzes",
    "Przejdź do kalkulatora": "Go to calculator",
    "Główne moduły": "Main modules",
    "Materiały dodatkowe": "Additional materials",
    "Egzaminy / regulacje": "Exams / regulations",

    "Otwórz": "Open",
    "Podstawy": "Basics",
    "Pro": "Pro",
    "Regulacje": "Regulations",
    "CFD — indeksy i surowce": "CFDs — indices and commodities",

    "Praktyczne ABC inwestowania: jak czytać notowania i świece, rodzaje zleceń (market/limit/stop), działanie dźwigni i marginu oraz jak policzyć wielkość pozycji w pips/lot. To baza pod dalsze moduły oraz quizy kontrolne.":
      "Practical investing ABCs: how to read quotes and candles, order types (market/limit/stop), leverage and margin mechanics, and how to calculate position size in pips/lot. The foundation for further modules and review quizzes.",
    "Struktura i specyfika par walutowych, różnice kwotowań, sesje i godziny największej płynności, wpływ danych makro (NFP, CPI) na spready i zmienność. Zestaw dobrych praktyk wykonawczych i checklist decyzyjnych.":
      "Structure and specifics of currency pairs, quote conventions, sessions and peak liquidity hours, impact of macro data (NFP, CPI) on spreads and volatility. A set of execution best practices and decision checklists.",
    "Mechanika CFD na US100/US500, DAX oraz surowce (złoto, ropa). Koszty (spread, swap, poślizg), rollover oraz zarządzanie wielkością pozycji przy różnych godzinach handlu. Zrozumienie ekspozycji i ryzyka w praktyce.":
      "CFD mechanics on US100/US500, DAX and commodities (gold, oil). Costs (spread, swap, slippage), rollover and position sizing across trading hours. Understanding exposure and risk in practice.",
    "Budowa przewagi (edge) i EV, backtest z kontrolą OOS, Monte Carlo, sizing (np. Kelly/vol-target), runbook operacyjny i elementy psychologii procesu. Moduł układa wiedzę w spójny system pracy.":
      "Building edge and EV, backtesting with OOS control, Monte Carlo, sizing (e.g., Kelly/vol-target), operational runbook and process psychology. This module organizes knowledge into a coherent work system.",

    "Analiza techniczna": "Technical analysis",
    "Sposoby identyfikacji trendu i konsolidacji, strefy S/R, średnie i momentum oraz praca na wielu interwałach (multi-TF). Zestaw ćwiczeń i przykładowych scenariuszy do wykorzystania w planie gry.":
      "Identifying trend vs. consolidation, S/R zones, moving averages and momentum, and working across multiple timeframes. Exercises and scenarios to use in your playbook.",
    "Formacje świecowe": "Candlestick patterns",
    "Pin bar, engulfing, inside bar w realnym kontekście: gdzie mają sens, a gdzie zawodzą. Najczęstsze błędy interpretacyjne i checklisty potwierdzeń, by unikać sygnałów o niskiej jakości.":
      "Pin bar, engulfing, inside bar in real context: where they make sense and where they fail. Common interpretation errors and confirmation checklists to avoid low-quality signals.",
    "Psychologia inwestowania": "Trading psychology",
    "Błędy poznawcze i pułapki emocjonalne, dyscyplina wykonawcza, nawyki i retrospektywa po sesji. Jak budować rutynę sprzyjającą konsekwencji bez wchodzenia w rekomendacje.":
      "Cognitive biases and emotional traps, execution discipline, habits and post-session retrospectives. How to build routines that support consistency without giving recommendations.",
    "Kalendarz ekonomiczny": "Economic calendar",
    "Przegląd tygodnia makro, rozpoznawanie publikacji o podwyższonym ryzyku, praktyki przygotowania (zawężanie ryzyka, przerwy w handlu) i omówienie wpływu danych na spready i poślizg.":
      "Macro week overview, identifying higher-risk releases, preparation practices (risk throttling, trading pauses) and how data impact spreads and slippage.",

    "Egzaminy / regulacje": "Exams / regulations",
    "Przewodnik: KNF, ESMA, MiFID": "Guide: KNF, ESMA, MiFID",
    "Kluczowe pojęcia: test adekwatności, ochrona klienta, ryzyka, KID/KIID i dokumentacja. Zrozumiesz ramy regulacyjne, w których porusza się broker i klient detaliczny.":
      "Key concepts: appropriateness test, client protection, risks, KID/KIID and documentation. Understand the regulatory framework for brokers and retail clients.",
    "KNF — ścieżka nauki": "KNF — learning path",
    "Zakres tematyczny, przykładowe pytania kontrolne oraz materiał uzupełniający. Kładziemy nacisk na odpowiedzialną edukację i rozumienie ryzyk instrumentów z dźwignią.":
      "Scope, sample review questions and supplementary material. We emphasize responsible education and understanding the risks of leveraged instruments.",
    "CySEC — ścieżka nauki": "CySEC — learning path",
    "Reguły wspólne UE, wymogi informacyjne i podstawy zgodności (compliance). Materiał porządkuje terminy i przygotowuje do dalszego samodzielnego zgłębiania przepisów.":
      "EU-wide rules, disclosure requirements and compliance basics. This material organizes terminology and prepares you for further self-study of regulations."

    // Simulator page
    , "Kalkulator pozycji, marginu i P/L": "Position, margin and P/L calculator"
    , "Prosty, profesjonalny kalkulator w stylu rozwiązań spotykanych w platformach": "A simple, professional calculator similar to those found in platforms"
    , "i": "and"
    , "Oblicza": "Calculates"
    , "wymagany margin": "required margin"
    , "wielkość pozycji": "position size"
    , "wg zadanego wzoru. Materiał czysto edukacyjny – bez porad inwestycyjnych.":
      "according to a chosen formula. Educational material only — no investment advice."

    , "Parametry pozycji (margin + P/L)": "Position parameters (margin + P/L)"
    , "Waluta konta": "Account currency"
    , "Typ instrumentu": "Instrument type"
    , "Indeksy CFD": "CFD indices"
    , "Surowce CFD": "CFD commodities"
    , "Instrument": "Instrument"
    , "Dźwignia (1:x)": "Leverage (1:x)"
    , "Wielkość pozycji (loty)": "Position size (lots)"
    , "Min 0,01 i max 100. Możesz wpisać 0.1 lub 0,1.":
      "Min 0.01 and max 100. You can enter 0.1 or 0,1."
    , "Wpisz kurs przeliczenia waluty ceny na walutę konta.":
      "Enter the conversion rate from price currency to account currency."
    , "Cena otwarcia (opcjonalnie)": "Entry price (optional)"
    , "Cena zamknięcia (opcjonalnie)": "Exit price (optional)"
    , "Kierunek": "Direction"
    , "Kup": "Buy"
    , "Sprzedaj": "Sell"
    , "Oblicz": "Calculate"
    , "Uzupełnij dane i kliknij „Oblicz”.": "Fill in the fields and click “Calculate”."

    , "Wielkość pozycji i margin": "Position size and margin"
    , "Wartość nominalna pozycji:": "Position notional value:"
    , "(w walucie ceny:": "(in price currency:"
    , "Wymagany margin:": "Required margin:"
    , "Wartość 1 pipsa/punktu (dla całej pozycji):": "Value of 1 pip/point (for the whole position):"
    , "Wzór marginu:": "Margin formula:"
    , "Gdy cena wejścia nie jest podana,": "If the entry price is not provided,"
    , "przyjmujemy 1 dla celów poglądowych.": "we assume 1 for illustration."

    , "P/L dla zadanego ruchu": "P/L for a given move"
    , "Zmiana ceny:": "Price change:"
    , "(~": "(~"
    , "pipsów/pkt)": "pips/pts)"
    , "Nie uwzględniamy prowizji, swapu ani poślizgu.": "Commissions, swap and slippage are not included."
    , "Podaj cenę otwarcia i zamknięcia, aby policzyć P/L.": "Provide entry and exit to calculate P/L."

    , "Wielkość pozycji (prosty wzór)": "Position size (simple formula)"
    , "Wzór:": "Formula:"
    , "Cena instrumentu × Wielkość kontraktu": "Instrument price × Contract size"
    , "Dźwignia": "Leverage"
    , "Przykład dla": "Example for"
    , "1 lot zwykle odpowiada kontraktowi": "1 lot usually corresponds to a contract of"
    , "× cena.": "× price."

    , "Cena instrumentu": "Instrument price"
    , "Wielkość kontraktu (na 1 lot)": "Contract size (per 1 lot)"
    , "Waluta wyniku": "Result currency"

    , "Wynik": "Result"
    , "Równanie (kroki obliczeń)": "Equation (calculation steps)"
    , "Szacunkowa kwota potrzebna do otwarcia pozycji (dla 1.00 lota).":
      "Estimated amount required to open a position (for 1.00 lot)."

    , "Uwaga: dla innych instrumentów wstaw właściwy mnożnik kontraktu (np. US500: 50, DE40: 25, XAUUSD: 100).":
      "Note: for other instruments, use the correct contract multiplier (e.g., US500: 50, DE40: 25, XAUUSD: 100)."
    , "Wzór jest poglądowy, nie uwzględnia prowizji, swapu ani poślizgów.":
      "The formula is illustrative; it does not include commissions, swap or slippage."

    , "Wyniki służą wyłącznie celom edukacyjnym i nie stanowią rekomendacji inwestycyjnych.":
      "Results are for educational purposes only and do not constitute investment recommendations."

    // Simulator: symbol names and notes
    , "Złoto (XAU/USD)": "Gold (XAU/USD)"
    , "Ropa WTI": "WTI crude"
    , "1 lot = 50 × cena (1 pkt = 50 USD)": "1 lot = 50 × price (1 pt = 50 USD)"
    , "1 lot = 20 × cena": "1 lot = 20 × price"
    , "1 lot = 25 × cena": "1 lot = 25 × price"
    , "1 lot = 100 oz; 0.1 = 10 USD": "1 lot = 100 oz; 0.1 = 10 USD"
    , "1 lot = 1000 baryłek": "1 lot = 1000 barrels"
    , "1 pip = 0.01": "1 pip = 0.01"

    // Quizzes list
    , "Wszystkie": "All"
    , "Start": "Start"
    , "Regulacje": "Regulations"
    , "Tryb:": "Mode:"
    , "Szybki (10)": "Quick (10)"
    , "Pełny": "Full"
    , "Egzamin": "Exam"
    , "Szukaj: np. pips, CFD, MiFID…": "Search: e.g., pips, CFD, MiFID…"
    , "Szukaj w tytułach i opisach": "Search titles and descriptions"
    , "Brak wyników dla wybranych filtrów. Zmień frazę lub kategorię.": "No results for selected filters. Change the query or category."

    , "Tryb otwarty": "Open mode"
    , "— wszystkie dostępne quizy są odblokowane. Kliknij „Rozpocznij”, aby wejść.":
      "— all available quizzes are unlocked. Click “Start” to enter."
    , "dostępnych quizów": "quizzes available"
    , "pytań łącznie": "questions total"

    // Quiz card
    , "pytanie": "question"
    , "pytań": "questions"
    , "Kontynuuj": "Continue"
    , "Wkrótce": "Soon"
    , "ostatni wynik": "last score"
    , "Postęp:": "Progress:"
    , "Wkrótce dostępne": "Available soon"

    // eBooks page
    , "E-booki: profesjonalne materiały PDF (platforma pozostaje darmowa)":
      "E-books: professional PDF materials (the platform remains free)"
    , "Moje konto": "My account"
    , "Ebooki": "eBooks"
    , "Kursy i dostęp do platformy są darmowe. Płatne są tylko e-booki (PDF): podstawy, Forex, CFD i moduł zaawansowany. Możesz też kupić cały pakiet taniej.":
      "Courses and access to the platform are free. Only e-books (PDF) are paid: basics, Forex, CFDs and the advanced module. You can also buy the whole bundle at a discount."
    , "Do kupienia": "To buy"
    , "Posiadane": "Owned"
    , "Szukaj (np. MiFID, risk, KNF)…": "Search (e.g., MiFID, risk, KNF)…"

    , "PAKIET": "BUNDLE"
    , "Pakiet: wszystkie e-booki": "Bundle: all e-books"
    , "Kup wszystkie e-booki jednocześnie w obniżonej cenie.": "Buy all e-books at a discounted price."
    , "Cena łączna:": "Total price:"
    , "Oszczędzasz": "You save"
    , "Masz już wszystkie e-booki": "You already own all e-books"
    , "Masz cały pakiet ✔": "You own the bundle ✔"
    , "Kup pakiet": "Buy bundle"

    , "stron": "pages"
    , "Podgląd PDF": "Preview PDF"
    , "Pobierz": "Download"
    , "Kup": "Buy"

    , "Brak wyników dla zastosowanych filtrów.": "No results for applied filters."

    , "Uwaga: to wersja demonstracyjna – koszyk i zakup zapisywane są lokalnie w przeglądarce (localStorage). Pliki PDF powinny znajdować się w": "Note: this is a demo — cart and purchase are stored locally in the browser (localStorage). PDF files should be located in"
    , "public/ebooks/": "public/ebooks/"

    // News page
    , "Przegląd rynkowy": "Market overview"
    , "Zwięzłe podsumowania wraz z możliwymi reakcjami rynku (AI). Informacje mają charakter edukacyjny i nie stanowią doradztwa inwestycyjnego.":
      "Concise summaries with potential market reactions (AI). For educational purposes; not investment advice."
    , "Nastroje inwestorów (ostatnie 72h)": "Investor sentiment (last 72h)"
    , "Pozytywny": "Positive"
    , "Negatywny": "Negative"
    , "Neutralny": "Neutral"
    , "Zaktualizowano": "Updated"
    , "Szukaj: np. EURUSD, CPI…": "Search: e.g. EURUSD, CPI…"
    , "Mini wykresy": "Mini charts"
    , "Brak wpisów.": "No entries."
    , "Szybkie info (AI)": "Quick brief (AI)"
    , "Generowanie…": "Generating…"
    , "Wygeneruj teraz": "Generate now"
    , "Odśwież": "Refresh"
    , "Brak świeżej notki. Kliknij „Wygeneruj teraz”, aby stworzyć automatyczne podsumowanie najważniejszych faktów z ostatnich 24h.":
      "No fresh note. Click “Generate now” to produce an automatic summary of key facts from the last 24h."
    , "Opinia AI": "AI opinion"
    , "Materiał edukacyjny — nie jest to doradztwo inwestycyjne.": "Educational material — this is not investment advice."
    , "Pokaż więcej": "Show more"

    , "Ostatnie 24h": "Last 24h"
    , "24–48h": "24–48h"
    , "48–72h": "48–72h"
    , "Brak pozycji w tym przedziale czasu.": "No items in this time range."
    , "Pokaż resztę": "Show the rest"
    , "Zwiń": "Collapse"

    // Challenge page
    , "Wróć do konta": "Back to account"
    , "Challenge: Przewidywalność": "Challenge: Predictability"
    , "Każdego dnia możesz sprawdzić swoją intuicję rynkową.": "Every day you can test your market intuition."
    , "Wybierz instrument, przejrzyj skrót z modułu": "Choose an instrument, review the summary from the"
    , "News": "News"
    , "oceń kierunek (": "assess the direction ("
    , "i horyzont, a po rozliczeniu zobacz, jak poradziła sobie Twoja analiza.":
      "and horizon, and after settlement see how your analysis performed."
    , "Krok": "Step"
    , "Wybierz instrument": "Choose instrument"
    , "Zobacz skrót z News": "See News summary"
    , "AI pokazuje kluczowe nagłówki i czynniki": "AI shows key headlines and drivers"
    , "Wskaż kierunek + pewność": "Pick direction + confidence"
    , "Poczekaj na rozliczenie": "Wait for settlement"
    , "wynik liczony według realnej punktacji": "result calculated using real scoring"
    , "Po rozstrzygnięciu rundy slot wyzwania otrzyma nową edycję w ciągu": "After the round settles, the challenge slot will receive a new edition within"
    , "30 sekund": "30 seconds"
    , "(ta sama klasa aktywa lub rotacja z puli).": "(same asset class or rotation from the pool)."
    , "Na jakiej podstawie prognozujesz wzrost lub spadek?": "On what basis do you forecast up or down?"
    , "• Skrót z modułu News:": "• News module summary:"
    , "ostatnie nagłówki i tematy (makro, geopolityka, guidance spółek)": "latest headlines and topics (macro, geopolitics, company guidance)"
    , "• Kontekst makro:": "• Macro context:"
    , "CPI/PPI, NFP, decyzje banków centralnych, rentowności": "CPI/PPI, NFP, central bank decisions, yields"
    , "• Sygnały rynkowe:": "• Market signals:"
    , "zmiana 24h / 5D, mini-sparkline, wolumen (jeśli dostępny)": "24h/5D change, mini sparkline, volume (if available)"
    , "• Czynniki specyficzne:": "• Specific factors:"
    , "sezonowość (NG), interwencje (USDJPY), newsy spółek (TSLA, NVDA)":
      "seasonality (NG), interventions (USDJPY), company news (TSLA, NVDA)"
    , "🔹 To moduł edukacyjny –": "🔹 This is an educational module —"
    , "nie stanowi porady inwestycyjnej": "not investment advice"

    , "Jak liczymy punktację i wyniki": "How we calculate scoring and results"
    , "Zasady punktacji i rozliczeń": "Scoring and settlement rules"
    , "Zamknij": "Close"
    , "Horyzont": "Horizon"
    , "określa, kiedy wyzwanie jest rozliczane (np. EOD, 48h, 5 sesji). Po upływie czasu karta przechodzi w status": "defines when the challenge is settled (e.g., EOD, 48h, 5 sessions). After the time passes the card moves to"
    , "„rozliczanie”": "“settling”"
    , "a maks. po": "and at most after"
    , "w": "into"
    , "„zakończone”": "“closed”"
    , "Punktacja bazowa": "Base scoring"
    , "trafny ↑/↓:": "correct ↑/↓:"
    , "remis (↔ lub ruch ≤ ±0,30%):": "draw (↔ or move ≤ ±0.30%):"
    , "pudło:": "miss:"
    , "Bonus za pewność": "Confidence bonus"
    , "Źródła decyzji": "Decision sources"
    , "Odświeżanie slotów": "Slot refreshing"
    , "każda karta dostaje nową edycję w ciągu": "each card gets a new edition within"
    , "Ranking globalny": "Global ranking"
    , "zrealizowane XP": "realized XP"
    , "to nie jest porada inwestycyjna": "this is not investment advice"

    , "Instrument:": "Instrument:"
    , "Horyzont:": "Horizon:"
    , "otwarte": "open"
    , "rozliczanie": "settling"
    , "zakończone": "closed"
    , "Do zamknięcia:": "Time to close:"
    , "Rozliczanie…": "Settling…"
    , "Zakończone – nowa runda wkrótce": "Closed — new round soon"
    , "Twój typ:": "Your pick:"
    , "Ładuję skrót z News…": "Loading News summary…"
    , "Brak skrótu z News — pojawi się automatycznie, gdy system zbierze nagłówki.":
      "No News summary — it will appear automatically once headlines are collected."
    , "↑ Wzrost": "↑ Up"
    , "↔ Bez zmian": "↔ Flat"
    , "↓ Spadek": "↓ Down"
    , "Wybierz: wzrost": "Pick: up"
    , "Wybierz: bez zmian (↔)": "Pick: flat (↔)"
    , "Wybierz: spadek": "Pick: down"
    , "Pewność prognozy:": "Forecast confidence:"
    , "(Sugestia AI:": "(AI suggestion:"
    , "50–90% (Sugestia AI to start – możesz zmienić)": "50–90% (AI suggestion to start — you can change)"

    , "Zarządzanie danymi Challenge": "Challenge data management"
    , "Wyczyść typy": "Clear picks"
    , "Potwierdź czyszczenie typów": "Confirm clearing picks"
    , "Resetuj XP": "Reset XP"
    , "Potwierdź reset XP": "Confirm XP reset"
    , "Typy i flagi wyników wyczyszczone ✅": "Picks and result flags cleared ✅"
    , "Błąd podczas czyszczenia": "Error while clearing"
    , "XP zresetowany ✅": "XP reset ✅"

    , "Brak zapisanych typów na dzisiaj.": "No saved picks for today."
    , "Twoje typy (ostatnie 20)": "Your picks (last 20)"

    // Rankings
    , "Rankingi": "Rankings"
    , "Wybierz zestawienie poniżej.": "Choose a list below."
    , "Brokerzy": "Brokers"
    , "Użytkownicy": "Users"

    , "Rankingi brokerów (CFD / Forex)": "Broker rankings (CFD / Forex)"
    , "Poniżej zebraliśmy znane marki działające na rynku CFD/Forex. To": "Below we list well-known brands operating in the CFD/Forex market. This is"
    , "nie jest rekomendacja": "not a recommendation"
    , "ani porada inwestycyjna — warunki (spready, prowizje, finansowanie, opłaty) i dostępne rynki różnią się w zależności od kraju i typu rachunku.": "or investment advice — conditions (spreads, commissions, financing, fees) and available markets differ by country and account type."
    , "Zawsze weryfikuj ofertę na oficjalnej stronie brokera oraz wymagania regulacyjne": "Always verify the offer on the broker's official website and regulatory requirements"
    , ".": "."
    , "Wyszukaj po nazwie / platformie / rynku": "Search by name / platform / market"
    , "np. xStation, MT5, indeksy…": "e.g., xStation, MT5, indices…"

    , "Atuty": "Pros"
    , "Zwróć uwagę": "Considerations"

    , "Handel instrumentami z dźwignią wiąże się z wysokim ryzykiem szybkiej utraty środków. Zanim założysz rachunek, sprawdź wymogi regulacyjne, koszty i ryzyka właściwe dla Twojej sytuacji i jurysdykcji.":
      "Trading leveraged instruments involves a high risk of rapid loss. Before opening an account, check regulatory requirements, costs and risks appropriate for your situation and jurisdiction."

    , "Tydzień": "Week"
    , "Miesiąc": "Month"
    , "Całość": "All time"
    , "Szukaj użytkownika…": "Search user…"
    , "Miejsce": "Place"
    , "Użytkownik": "User"
    , "Punkty": "Points"
    , "Passa": "Streak"
    , "Quizy / Lekcje": "Quizzes / Lessons"
    , "dni": "days"
    , "Rozwiąż quizy": "Take quizzes"
    , "Ucz się dalej": "Keep learning"

    // Account (Konto)
    , "Moje konto": "My account"
    , "Twoje kursy, quizy i ustawienia.": "Your courses, quizzes and settings."
    , "Panel": "Dashboard"
    , "Ustawienia": "Settings"

    , "Cześć,": "Hi,"
    , "Ukończone kursy": "Courses completed"
    , "Rozwiązane quizy": "Quizzes solved"
    , "Passa (dni)": "Streak (days)"
    , "Ostatnie logowanie": "Last login"

    , "Szybkie akcje": "Quick actions"
    , "Przejdź do kursów": "Go to courses"
    , "Rozwiąż quiz": "Take a quiz"
    , "Kalkulator pozycji": "Position calculator"
    , "Szybkie info od AI": "Quick info from AI"
    , "Przejdź do challengu": "Go to challenge"
    , "Tip: zacznij od modułu": "Tip: start with the"
    , "Podstawy": "Basics"
    , ", a potem sprawdź się w 10-pytaniowym quizie.": ", then try a 10-question quiz."

    , "Dostęp": "Access"
    , "Masz pełny, bezpłatny dostęp do wszystkich treści i narzędzi.": "You have full, free access to all content and tools."
    , "Wszystkie kursy i lekcje.": "All courses and lessons."
    , "Quizy i egzaminy próbne.": "Quizzes and practice exams."
    , "Materiały do pobrania i kalkulatory.": "Downloadable materials and calculators."
    , "Brak paywalla, brak ograniczeń.": "No paywall, no limits."

    , "Sesja": "Session"
    , "Zarządzanie zalogowaniem i kontem.": "Manage login and account."
    , "Wyloguj": "Log out"
    , "Ustawienia konta": "Account settings"
    , "Podgląd sesji (debug)": "Session preview (debug)"

    , "Postęp w programie": "Program progress"
    , "Szacowany progres na podstawie ukończonych sekcji.": "Estimated progress based on completed sections."
    , "Forex": "Forex"
    , "Zaawansowane": "Advanced"

    , "Ostatnia aktywność": "Recent activity"
    , "Ostatnie zadania, które wykonałeś.": "Recent tasks you completed."
    , "Brak aktywności. Rozwiąż quiz lub ukończ lekcję.": "No activity. Take a quiz or complete a lesson."

    , "Polecane moduły na start": "Recommended modules to start"
    , "Podstawy inwestowania": "Investing fundamentals"
    , "— ryzyko, dźwignia, typy zleceń, świece.": "— risk, leverage, order types, candles."
    , "— pary walutowe, pipsy/loty, sesje, makro.": "— currency pairs, pips/lots, sessions, macro."
    , "— mechanika CFD, finansowanie overnight, indeksy i surowce.": "— CFD mechanics, overnight financing, indices and commodities."

    , "Następne kroki": "Next steps"
    , "Wybierz moduł i przerób 2–3 krótkie lekcje.": "Pick a module and go through 2–3 short lessons."
    , "Sprawdź się w 10-pytaniowym quizie.": "Test yourself with a 10-question quiz."
    , "forum dyskusyjnego": "discussion forum"
    , "i podziel się postępami.": "and share your progress."

    // Konto: Egzaminy
    , "Wyniki egzaminów": "Exam results"
    , "Brak zapisanych wyników — zrób test demo lub PRO.": "No saved results — take a demo or PRO test."
    , "Egzamin": "Exam"
    , "Data": "Date"
    , "Wynik": "Score"
    , "Powtórz": "Retry"
    , "Certyfikat": "Certificate"
    , "← Panel konta": "← Account panel"

    // Konto: Ustawienia
    , "Ustawienia profilu": "Profile settings"
    , "Wyświetlana nazwa": "Display name"
    , "Twoje imię/nick": "Your name/nickname"
    , "Zapisz": "Save"
    , "Wyczyść cały postęp": "Clear all progress"
    , "Dane przechowywane są lokalnie w przeglądarce (localStorage). Po wdrożeniu logowania można łatwo przenieść te mechanizmy na backend (użytkownik = konto, postęp = baza).":
      "Data is stored locally in the browser (localStorage). After enabling authentication, these can be moved to the backend (user = account, progress = DB)."
    , "Użytkownik": "User"
    , "Zapisano.": "Saved."
    , "Wyczyszczono.": "Cleared."
    , "Na pewno wyczyścić postęp kursów i wyniki quizów?": "Are you sure you want to clear course progress and quiz results?"

    // Konto: Upgrade mock
    , "Upgrade do PRO (mock)": "Upgrade to PRO (mock)"
    , "Na produkcji podłączysz tu realną płatność. Na razie kliknij „Zaloguj jako PRO”.":
      "In production, connect real payments here. For now, click “Log in as PRO”."

    // Auth: Login
    , "Zaloguj się": "Log in"
    , "Wpisz dane, aby wejść do panelu i kontynuować naukę.": "Enter your details to access the dashboard and continue learning."
    , "Login lub e-mail": "Login or email"
    , "Hasło": "Password"
    , "Ukryj": "Hide"
    , "Pokaż": "Show"
    , "Podaj login/e-mail i hasło.": "Enter login/email and password."
    , "Nieprawidłowy login lub hasło.": "Invalid login or password."
    , "Metoda niedozwolona (405) — użyj POST.": "Method not allowed (405) — use POST."
    , "Błąd serwera": "Server error"
    , "Błąd połączenia. Spróbuj ponownie.": "Connection error. Try again."
    , "Zalogowano! Przekierowuję…": "Logged in! Redirecting…"
    , "Logowanie…": "Logging in…"
    , "Nie masz konta? Zarejestruj się": "No account? Register"
    , "Zapomniałeś hasła? (wkrótce)": "Forgot password? (soon)"

    // Auth: Register
    , "Załóż konto": "Create account"
    , "Dołącz za darmo i odblokuj śledzenie postępów, quizy, checklisty oraz egzamin próbny.":
      "Join for free and unlock progress tracking, quizzes, checklists and a practice exam."
    , "Co zyskasz?": "What do you get?"
    , "Zapisywanie postępów w kursach i quizach.": "Save progress in courses and quizzes."
    , "Pełne wersje ścieżek (np. KNF, CySEC) i materiały do pobrania.": "Full paths (e.g., KNF, CySEC) and downloadable materials."
    , "Wkrótce: tablica wyników i certyfikaty ukończenia.": "Coming soon: leaderboard and completion certificates."
    , "Bezpieczeństwo": "Security"
    , "Nigdy nie udostępniamy Twoich danych osobom trzecim. Hasła są przechowywane w postaci zaszyfrowanej.":
      "We never share your data with third parties. Passwords are stored encrypted."
    , "Tryb demo": "Demo mode"
    , "Rejestracja działa w trybie": "Registration works in"
    , "mock": "mock"
    , ": po wysłaniu formularza zapisujemy sesję w cookies i przekierowujemy do": ": after submitting we save the session in cookies and redirect to"
    , "Później łatwo podmienimy to na prawdziwą autoryzację (Auth.js / Supabase).":
      "Later we can switch to real auth (Auth.js / Supabase)."
    , "Imię / Nick": "Name / Nickname"
    , "np. Ania": "e.g., Anna"
    , "E-mail": "Email"
    , "twoj@mail.com": "your@mail.com"
    , "Hasło powinno mieć min. 8 znaków.": "Password should be at least 8 characters."
    , "Dodaj przynajmniej 1 wielką literę i 1 cyfrę.": "Add at least 1 uppercase letter and 1 digit."
    , "Podaj poprawny adres e-mail.": "Enter a valid email address."
    , "Hasła się różnią.": "Passwords do not match."
    , "Ukryj hasło": "Hide password"
    , "Pokaż hasło": "Show password"
    , "Powtórz hasło": "Repeat password"
    , "Min. 8 znaków, zalecamy wielkie litery, cyfry i znak specjalny.":
      "Min. 8 characters; we recommend uppercase letters, digits and a special character."
    , "Akceptuję": "I accept"
    , "regulamin": "terms"
    , "politykę prywatności": "privacy policy"
    , "Uzupełnij wszystkie pola.": "Fill in all fields."
    , "Zaznacz zgodę na regulamin.": "Accept the terms to proceed."
    , "Konto utworzone! Przekierowuję…": "Account created! Redirecting…"
    , "Tworzenie konta…": "Creating account…"
    , "Masz już konto?": "Already have an account?"
    , "Zaloguj się": "Log in"
    , "Potrzebujesz tylko przejrzeć kursy?": "Just want to browse courses?"
    , "Przejdź do listy": "Go to list"

    // Legal (Prawne)
    , "Prawne": "Legal"
    , "Poniżej znajdziesz komplet dokumentów regulujących korzystanie z serwisu. Dokumenty mają charakter informacyjny i obowiązują wszystkich odwiedzających.":
      "Below are the documents governing the use of the service. They are informational and apply to all visitors."
    , "Zobacz dokument": "View document"

    , "Polityka cookies": "Cookies policy"
    , "Wyjaśniamy, czym są pliki cookies, jakie stosujemy i jak możesz nimi zarządzać.":
      "We explain what cookies are, which ones we use, and how you can manage them."
    , "Spis treści": "Table of contents"
    , "1. Czym są pliki cookies": "1. What are cookies"
    , "2. Rodzaje i cele stosowanych cookies": "2. Types and purposes of cookies"
    , "3. Czas życia plików": "3. Cookie lifetime"
    , "4. Jak zarządzać zgodą i cookies": "4. How to manage consent and cookies"
    , "5. Cookies podmiotów trzecich": "5. Third‑party cookies"
    , "6. Zmiany polityki": "6. Policy changes"
    , "7. Kontakt": "7. Contact"
    , "Ostatnia aktualizacja:": "Last updated:"
    , "Wróć do „Prawne”": "Back to “Legal”"

    , "Polityka prywatności": "Privacy policy"
    , "Ten dokument wyjaśnia, jakie dane przetwarzamy w Serwisie edukacyjnym, w jakich celach, na jakiej podstawie oraz jakie masz prawa.":
      "This document explains what data we process in the educational Service, for what purposes, on what basis and what rights you have."
    , "1. Administrator danych": "1. Data controller"
    , "2. Zakres przetwarzanych danych": "2. Scope of processed data"
    , "3. Cele i podstawa prawna (RODO)": "3. Purposes and legal basis (GDPR)"
    , "4. Cookies i podobne technologie": "4. Cookies and similar technologies"
    , "5. Odbiorcy danych": "5. Data recipients"
    , "6. Transfer poza EOG": "6. Transfer outside the EEA"
    , "7. Okres przechowywania": "7. Retention period"
    , "8. Twoje prawa": "8. Your rights"
    , "9. Cofnięcie zgody": "9. Withdrawal of consent"
    , "10. Skarga do organu": "10. Complaint to the authority"
    , "11. Bezpieczeństwo": "11. Security"
    , "12. Zautomatyzowane decyzje": "12. Automated decisions"
    , "13. Zmiany polityki": "13. Policy changes"
    , "14. Kontakt": "14. Contact"
    , "Polityce cookies": "Cookies policy"

    , "Warunki korzystania": "Terms of use"
    , "Niniejszy dokument określa zasady korzystania z serwisu edukacyjnego (dalej: „Serwis”). Korzystając z Serwisu, akceptujesz poniższe postanowienia.":
      "This document defines the rules for using the educational service (the “Service”). By using the Service, you accept the following provisions."
    , "1. Zakres i akceptacja": "1. Scope and acceptance"
    , "2. Definicje": "2. Definitions"
    , "3. Zasady korzystania": "3. Rules of use"
    , "4. Ograniczenie odpowiedzialności": "4. Limitation of liability"
    , "5. Własność intelektualna": "5. Intellectual property"
    , "6. Dane, konto i bezpieczeństwo": "6. Data, account and security"
    , "7. Zmiany warunków": "7. Changes to terms"

    // FAQ pages
    , "Najczęstsze pytania i odpowiedzi.": "Frequently asked questions and answers."
    , "Najczęściej zadawane pytania o platformę i materiały edukacyjne.": "Frequently asked questions about the platform and educational materials."
    , "Czy materiały to porady inwestycyjne?": "Are the materials investment advice?"
    , "Nie. Cała zawartość ma charakter edukacyjny i nie stanowi rekomendacji inwestycyjnych.":
      "No. All content is educational and does not constitute investment recommendations."
    , "Czy mogę uczyć się od zera?": "Can I learn from scratch?"
    , "Tak. Moduł „Podstawy” prowadzi od absolutnych podstaw do praktyki.":
      "Yes. The 'Basics' module takes you from absolute basics to practice."
    , "Czy są testy/quizy?": "Are there tests/quizzes?"
    , "Tak. Krótkie quizy po rozdziałach i testy podsumowujące pomagają utrwalić wiedzę.":
      "Yes. Short quizzes after chapters and summary tests help consolidate knowledge."
    , "Czy jest kalkulator ryzyka?": "Is there a risk calculator?"
    , "Tak. Znajdziesz go w zakładce Kalkulator (wielkość pozycji, margin).":
      "Yes. You'll find it in the Calculator tab (position size, margin)."

    , "Czy to są porady inwestycyjne?": "Is this investment advice?"
    , "Nie. Serwis ma charakter wyłącznie edukacyjny. Nie udzielamy rekomendacji ani sygnałów rynkowych.":
      "No. The service is purely educational. We do not provide recommendations or trading signals."
    , "Czy muszę zakładać konto?": "Do I need to create an account?"
    , "Nie, treści otwarte (kursy/quizy demo/glosariusz) są dostępne bez logowania. Konto może być wymagane dla zapisu postępów.":
      "No, open content (courses/demo quizzes/glossary) is available without login. An account may be required to save progress."
    , "Jak liczone są wyniki w quizach?": "How are quiz scores calculated?"
    , "Za każdą poprawną odpowiedź otrzymujesz 1 punkt. W wynikach pokazujemy liczbę punktów oraz procent poprawnych odpowiedzi.":
      "You get 1 point for each correct answer. Results show the number of points and the percentage of correct answers."
    , "Czy kalkulator obsługuje różne instrumenty?": "Does the calculator support different instruments?"
    , "Tak. W kalkulatorze znajdziesz m.in. margin dla FX/indeksów/surowców oraz kalkulator wielkości pozycji z parametrami SL/ryzyko.":
      "Yes. The calculator includes margin for FX/indices/commodities and a position size calculator with SL/risk parameters."
    , "Jak dodać wątek na forum?": "How to add a thread on the forum?"
    , "Wejdź na /forum, kliknij „+ Nowy wątek”, wybierz kategorię, dodaj tytuł i treść. Pamiętaj o kulturze wypowiedzi.":
      "Go to /forum, click “+ New thread”, choose a category, add a title and content. Keep the discussion civil."
    , "Czy przechowujecie moje dane?": "Do you store my data?"
    , "Przechowujemy tylko dane niezbędne do działania serwisu (np. postęp nauki). Szczegóły w Polityce prywatności.":
      "We store only data necessary for the service (e.g., learning progress). See the Privacy policy for details."
    , "Z jakich źródeł warto korzystać?": "Which sources are worth using?"
    , "Czytaj dokumentacje brokerów/regulacji, raporty banków centralnych, a także testuj własne hipotezy na danych historycznych.":
      "Read broker/regulatory documentation, central bank reports and test your own hypotheses on historical data."

    // Forum
    , "Ładowanie forum…": "Loading forum…"
    , "Forum dyskusyjne": "Discussion forum"
    , "Wątki:": "Threads:"
    , "Posty:": "Posts:"
    , "Dziś:": "Today:"
    , "Pytania, wyniki testów, strategie, mindset – dla początkujących i zaawansowanych.":
      "Questions, test results, strategies, mindset — for beginners and advanced."
    , "Kategorie": "Categories"
    , "Szukaj: np. DAX, psychologia, ATR…": "Search: e.g., DAX, psychology, ATR…"
    , "Ostatnia aktywność": "Latest activity"
    , "Najnowsze": "Newest"
    , "Najbardziej lubiane": "Most liked"
    , "+ Nowy wątek": "+ New thread"
    , "Brak wyników dla wybranych filtrów.": "No results for selected filters."
    , "Ostatnie odpowiedzi": "Latest replies"
    , "Brak odpowiedzi.": "No replies."
    , "Przypięty": "Pinned"
    , "Nowy": "New"
    , "tylko odczyt": "read-only"
    , "założony": "started"
    , "Wątki": "Threads"
    , "Wróć do listy": "Back to list"
    , "Nowy wątek": "New thread"
    , "Kopiuj link": "Copy link"
    , "Polubienia wyłączone (prace serwisowe)": "Likes disabled (maintenance)"
    , "Polub post": "Like post"
    , "Forum jest obecnie w trybie tylko-do-odczytu. Dodawanie odpowiedzi będzie dostępne po zakończeniu prac.":
      "The forum is currently read-only. Adding replies will be available after maintenance."
    , "Tytuł wątku": "Thread title"
    , "Krótko i na temat…": "Short and to the point…"
    , "Treść pierwszego posta": "First post content"
    , "Opisz temat, podaj kontekst / dane / wykres (tekstowo)…": "Describe the topic, give context/data/chart (text)…"
    , "Opublikuj wątek": "Publish thread"
    , "Min. 6 znaków w tytule i 10 w treści.": "Min. 6 chars in title and 10 in content."
    , "Twoja odpowiedź": "Your reply"
    , "Dodaj rzeczową odpowiedź…": "Add a substantive reply…"
    , "Wyślij": "Send"
    , "Bądź uprzejmy i konkretny 🙂": "Be polite and specific 🙂"

    // Glosariusz
    , "Glosariusz": "Glossary"
    , "Krótki słownik pojęć Forex/CFD. Materiał edukacyjny – nie stanowi porady inwestycyjnej.":
      "Short Forex/CFD glossary. Educational material — not investment advice."

    // Kontakt
    , "Kontakt": "Contact"
    , "Masz pytanie lub sugestię? Napisz do nas poniżej.": "Have a question or suggestion? Write to us below."
    , "Imię": "Name"
    , "Email": "Email"
    , "Temat": "Subject"
    , "Wiadomość": "Message"
    , "Wysyłanie...": "Sending..."
    , "Wyślij wiadomość": "Send message"
    , "Wiadomość wysłana. Dziękujemy!": "Message sent. Thank you!"
    , "Błąd wysyłki. Spróbuj ponownie.": "Send error. Please try again."
    , "Coś poszło nie tak.": "Something went wrong."
    , "Wysyłając formularz, zgadzasz się na przetwarzanie danych w celu udzielenia odpowiedzi.": "By sending the form, you agree to the processing of data to provide a response."
    , "Polityka prywatności": "Privacy policy"

    // Courses modules (indexes)
    , "— spis lekcji": "— lesson list"
    , "Startowy moduł dla początkujących. Zacznij od lekcji 1 i idź po kolei.":
      "Starter module for beginners. Start from lesson 1 and go in order."
    , "Startowy moduł. Zacznij od lekcji 1 i idź po kolei.":
      "Starter module. Start from lesson 1 and go in order."
    , "Postęp:": "Progress:"
    , "lekcji": "lessons"
    , "Lekcja": "Lesson"
    , "✓ Ukończono": "✓ Completed"
    , "• Nieukończona": "• Not completed"
    , "W toku": "In progress"
    , "Otwórz": "Open"
    , "← Wróć do kursów": "← Back to courses"
    , "← Wróć do listy kursów": "← Back to course list"

    , "Wprowadzenie: czym jest rynek Forex?": "Introduction: what is the Forex market?"
    , "Najważniejsze pojęcia, uczestnicy i mechanika działania.": "Key concepts, participants and market mechanics."
    , "Pipsy, punkty i loty": "Pips, points and lots"
    , "Jak liczyć ruch ceny i wielkość pozycji.": "How to measure price moves and position size."
    , "Rodzaje zleceń": "Order types"
    , "Market, limit, stop, stop-limit – kiedy których używać.": "Market, limit, stop, stop‑limit — when to use which."
    , "Dźwignia i ryzyko": "Leverage and risk"
    , "Ekspozycja, depozyt zabezpieczający i zarządzanie ryzykiem.": "Exposure, margin and risk management."
    , "Czytanie świec": "Reading candles"
    , "Ceny OHLC, interwały i podstawowe formacje.": "OHLC prices, timeframes and basic patterns."

    , "Wprowadzenie do rynku walutowego": "Introduction to the currency market"
    , "Pojęcia bazowe, uczestnicy, mechanika FX.": "Basic terms, participants, FX mechanics."
    , "Plan transakcyjny i dziennik": "Trading plan and journal"
    , "Reguły wejść/wyjść, checklisty, metryki skuteczności.": "Entry/exit rules, checklists, performance metrics."

    , "Wprowadzenie do CFD": "Introduction to CFDs"
    , "Czym są CFD i jak działają; różnice vs instrument bazowy.": "What CFDs are and how they work; differences vs underlying."
    , "Koszty i finansowanie overnight": "Costs and overnight financing"
    , "Spread, prowizja, swap/rollover, punkty potrójne.": "Spread, commission, swap/rollover, triple points."
    , "Indeksy i surowce — specyfika": "Indices and commodities — specifics"
    , "Godziny, przerwy, tick value, ważne raporty.": "Trading hours, breaks, tick value, key reports."
    , "Realizacja zleceń i poślizg": "Order execution and slippage"
    , "Market/Limit/Stop, poślizg, otwarcia i dane.": "Market/Limit/Stop, slippage, opens and data."
    , "Zarządzanie ryzykiem w CFD": "Risk management in CFDs"
    , "Sizing pod 1R, limity, specyficzne ryzyka.": "Sizing for 1R, limits, specific risks."

    , "Zaawansowane — spis lekcji": "Advanced — lesson list"
    , "Edge i wartość oczekiwana (EV)": "Edge and expected value (EV)"
    , "Jak policzyć EV systemu, co daje przewaga i jak ją utrzymać.": "How to calculate system EV, what edge gives and how to keep it."
    , "Backtest: OOS, walk-forward, unikanie przecieku": "Backtest: OOS, walk-forward, avoiding leakage"
    , "Dobre praktyki testowania, segmentacja danych, walidacja.": "Testing best practices, data segmentation, validation."
    , "Statystyka wyników: rozkłady, DD, risk of ruin, Monte Carlo": "Results statistics: distributions, DD, risk of ruin, Monte Carlo"
    , "Jak czytać metryki i przewidywać skrajne scenariusze.": "How to read metrics and anticipate extreme scenarios."
    , "Sizing pro: Kelly (częściowy), fixed-fractional, portfel i korelacje": "Pro sizing: Kelly (partial), fixed‑fractional, portfolio and correlations"
    , "Zarządzanie ryzykiem na poziomie strategii i portfela.": "Risk management at strategy and portfolio level."
    , "Psychologia i operacyjka: rutyny, checklisty, dziennik": "Psychology and operations: routines, checklists, journal"
    , "Jak utrzymać edge w praktyce i nie psuć statystyki błędami.": "How to keep edge in practice and not ruin the stats with errors."

    // Lesson pages (shared)
    , "← Wróć do spisu": "← Back to index"
    , "Poprzednia lekcja": "Previous lesson"
    , "Następna lekcja →": "Next lesson →"
    , "Cele lekcji": "Lesson objectives"
    , "Forex — jak to działa?": "Forex — how does it work?"
    , "Bid / Ask / Spread": "Bid / Ask / Spread"
    , "Sesje i zmienność": "Sessions and volatility"
    , "Mini-kalkulator: wartość pipsa i koszt spreadu": "Mini-calculator: pip value and spread cost"
    , "Mini-kalkulator: rollover / carry": "Mini-calculator: rollover / carry"
    , "Przykład liczbowy": "Numerical example"
    , "Uważaj na": "Watch out for"
    , "Checklist & ćwiczenia": "Checklist & exercises"
    , "Ćwiczenia (5–10 min)": "Exercises (5–10 min)"
    , "Przykładowe odpowiedzi": "Sample answers"
    , "Słowniczek pojęć": "Glossary of terms"
    , "Checklist po lekcji": "After-lesson checklist"
    , "Zadanie praktyczne": "Practical task"

    // CFD lesson 1
    , "Czym są CFD?": "What are CFDs?"
    , "Dźwignia i margin — jak to liczyć?": "Leverage and margin — how to calculate it?"
    , "Plusy i pułapki": "Pros and pitfalls"
    , "Mini-quiz: sprawdź się": "Mini-quiz: test yourself"

    // Exam runner
    , "Wynik:": "Score:"
    , "To był wynik z wersji DEMO. Włącz PRO, aby przejść pełny egzamin i wygenerować certyfikat.":
      "That was a DEMO result. Enable PRO to take the full exam and generate a certificate."
    , "Pytanie": "Question"
    , "Tryb DEMO": "DEMO mode"
    , "Odpowiadasz na pierwsze": "You answer the first"
    , "pytań. Włącz plan PRO (w „Konto”) albo użyj przycisku „Pełny test (PRO)”.":
      "questions. Enable the PRO plan (in 'Account') or use the 'Full test (PRO)' button."
    , "Podpowiedź:": "Hint:"
    , "Sprawdź": "Check"
    , "Dalej →": "Next →"
    , "Zakończ i zapisz wynik": "Finish and save result"

    // QuizRunner tokens
    , "Wróć do listy": "Back to list"
    , "Brak pytań do wyświetlenia.": "No questions to display."
    , "Twój wynik:": "Your score:"
    , "Tryb egzaminu:": "Exam mode:"
    , "czas wykorzystany:": "time used:"
    , "pytań jednokrotnego wyboru. Skróty: ← → oraz A/B/C/D.": "single-choice questions. Shortcuts: ← → and A/B/C/D."
    , "Pozostało:": "Remaining:"
    , "Wyjaśnienie": "Explanation"
    , "Wyjaśnienie:": "Explanation:"
    , "← Poprzednie": "← Previous"
    , "Następne →": "Next →"
    , "Zakończ / Sprawdź": "Finish / Check"
    , "Znaleziono niedokończony quiz.": "An unfinished quiz was found."
    , "Pozostały czas:": "Time left:"
    , "Wrócić do pytania": "Return to question"
    , "Kontynuuj": "Continue"
    , "Zacznij od nowa": "Start over"
    , "Szybka powtórka (10)": "Quick review (10)"
    , "Wyczyść zapis": "Clear saved"
    , "Usuń zapis z urządzenia": "Delete saved data"

    // Exams index and tracks
    , "Egzaminy • Regulacje": "Exams • Regulations"
    , "Przewodnik: KNF / ESMA / MiFID": "Guide: KNF / ESMA / MiFID"
    , "Przewodnik: KNF • ESMA • MiFID": "Guide: KNF • ESMA • MiFID"
    , "Ta sekcja kompiluje zagadnienia regulacyjne istotne dla inwestora detalicznego w UE: adekwatność i odpowiedniość, ryzyko, ochrona klienta, komunikacja marketingowa, konflikty interesów, oraz praktyka odpowiedzialnego inwestowania.":
      "This section compiles regulatory topics relevant to retail investors in the EU: suitability and appropriateness, risk, client protection, marketing communications, conflicts of interest, and responsible investing practices."
    , "MiFID II / ESMA: ramy prawne, ochrona klienta detalicznego.":
      "MiFID II / ESMA: legal framework, retail client protection."
    , "KNF: ostrzeżenia, test adekwatności, dokumenty KID/KIIDs, ryzyka.":
      "KNF: warnings, appropriateness test, KID/KIIDs documents, risks."
    , "Najlepsze praktyki: zarządzanie ryzykiem, przejrzystość kosztów, edukacja.":
      "Best practices: risk management, cost transparency, education."
    , "Ścieżka: KNF": "Track: KNF"
    , "Ścieżka: CySEC": "Track: CySEC"
    , "Uwaga: to materiały edukacyjne. Nie są poradą prawną i nie zastępują oficjalnych wytycznych.":
      "Note: these are educational materials. They are not legal advice and do not replace official guidelines."

    , "KNF — ścieżka nauki": "KNF — learning path"
    , "Preview + pełny dostęp po rejestracji.": "Preview + full access after registration."
    , "Postęp": "Progress"
    , "Program kursu": "Course program"
    , "Tryb podglądu": "Preview mode"
    , "Zarejestruj się i odblokuj pełną ścieżkę": "Register and unlock the full track"
    , "Zarejestruj i odblokuj": "Register and unlock"
    , "Szacowany czas:": "Estimated time:"
    , "Materiały do pobrania": "Downloadable materials"
    , "Materiały": "Materials"
    , "Egzamin próbny": "Practice exam"
    , "20 pytań jednokrotnego wyboru + wyjaśnienia.": "20 single‑choice questions + explanations."
    , "Uruchom test": "Start test"
    , "Przewodnik: KNF/ESMA/MiFID": "Guide: KNF/ESMA/MiFID"
    , "CySEC — ścieżka nauki": "CySEC — learning path"
    , "CIF, marketing, ochrona klienta, cross-border.": "CIF, marketing, client protection, cross‑border."
    , "Dostęp po zalogowaniu.": "Access after login."
    , "Zaloguj / Zarejestruj": "Log in / Register"
    , "Checklista Best Execution (PDF)": "Best Execution checklist (PDF)"
    , "Notatki MiFID II (PDF)": "MiFID II notes (PDF)"
    , "„Ściąga” do powtórek (DOCX)": "Crib sheet for revision (DOCX)"
    , "Circulars — podsumowanie (PDF)": "Circulars — summary (PDF)"
    , "Wytyczne marketing. CFD (PDF)": "Marketing guidelines for CFDs (PDF)"
    , "Lista kontroli (DOCX)": "Checklist (DOCX)"
    , "MiFID – kompendium (PDF)": "MiFID — compendium (PDF)"
    , "Checklista dokumentów (PDF)": "Documents checklist (PDF)"
    , "Ściąga terminów (DOCX)": "Term cheat sheet (DOCX)"
    , "15–20 pytań, wyjaśnienia, wynik.": "15–20 questions, explanations, score."

    // Brokers page — cards and labels
    , "Zaufany": "Trusted"
    , "Strona": "Website"
    , "Pobierz e-book (W)": "Download e-book (W)"
    , "Pobierz e-book (B)": "Download e-book (B)"

    // Brokers page — markets short labels
    , "Towary": "Commodities"
    , "Indeksy": "Indices"
    , "Akcje/ETF (CFD i/lub spot – w zależności od oferty)": "Stocks/ETFs (CFDs and/or spot — depending on offer)"
    , "Akcje/ETF (CFD i/lub spot)": "Stocks/ETFs (CFDs and/or spot)"
    , "Akcje (CFD)": "Stocks (CFDs)"
    , "Krypto (CFD)": "Crypto (CFDs)"
    , "Obligacje (CFD)": "Bonds (CFDs)"

    // Brokers page — pros/cons common phrases
    , "Własna, szybka platforma xStation z dobrym wykresem": "Proprietary, fast xStation platform with a good chart"
    , "Obszerne materiały edukacyjne i webinary": "Extensive educational materials and webinars"
    , "Szeroka oferta instrumentów": "Wide range of instruments"
    , "Warunki handlowe różnią się między klasami aktywów": "Trading conditions vary across asset classes"
    , "Niektóre opłaty zależne od aktywności – sprawdź tabelę opłat": "Some fees depend on activity — check the fee schedule"
    , "Krótki komentarz: sprawdź, czy dostępne jest oprocentowanie środków/lokata, konto profesjonalne oraz handel na akcjach syntetycznych; dostępność i warunki zależą od regionu.":
      "Short note: check if interest on funds/deposit, professional account, and trading in synthetic shares are available; availability and terms depend on region."

    , "Popularne platformy MT4/MT5 i prosty onboarding": "Popular MT4/MT5 platforms and simple onboarding"
    , "Konkurencyjne koszty transakcyjne na wybranych rachunkach": "Competitive trading costs on selected account types"
    , "Szybka egzekucja na głównych parach FX": "Fast execution on major FX pairs"
    , "Dostępność instrumentów i opłat zależna od regionu i typu konta": "Instrument and fee availability depends on region and account type"
    , "Ograniczona oferta akcji spot — głównie CFD": "Limited spot stock offering — mainly CFDs"
    , "Zweryfikuj szczegóły oferty, jurysdykcję i wymagania regulacyjne na stronie brokera przed otwarciem rachunku.":
      "Verify offer details, jurisdiction and regulatory requirements on the broker's website before opening an account."

    , "Dobra realizacja i narzędzia analityczne": "Good execution and analytical tools"
    , "Szerokie spektrum indeksów": "Wide spectrum of indices"
    , "Krzywe opłat mogą się różnić w zależności od regionu": "Fee curves may vary by region"

    , "Bogata oferta instrumentów poza CFD": "Rich offering of instruments beyond CFDs"
    , "Zaawansowana platforma": "Advanced platform"
    , "Zwykle wyższy próg depozytu i/lub opłaty nieaktywności": "Usually higher deposit threshold and/or inactivity fees"

    , "Popularne platformy (MT4/5, cTrader)": "Popular platforms (MT4/5, cTrader)"
    , "Konkurencyjne spready na FX": "Competitive FX spreads"
    , "Oferta akcji spot bywa ograniczona – głównie CFD": "Spot stock offering can be limited — mainly CFDs"

    , "Bardzo szeroka oferta par FX": "Very broad selection of FX pairs"
    , "Niskie koszty transakcyjne na wybranych typach rachunków": "Low trading costs on selected account types"
    , "W godzinach publikacji danych możliwe większe rozszerzenia spreadu": "Spreads may widen more during macro releases"

    , "Przejrzysta platforma własna": "Clear proprietary platform"
    , "Dobre API / integracje (na wybranych rynkach)": "Good API/integrations (on selected markets)"
    , "Zakres instrumentów zależny od regionu": "Instrument range depends on region"

    , "Proste w obsłudze aplikacje mobilne": "Easy-to-use mobile apps"
    , "Szeroka oferta CFD": "Wide CFD offering"
    , "Model kosztów zależny od typu rachunku – weryfikuj przed startem": "Cost model depends on account type — verify before starting"

    , "Duża baza materiałów edukacyjnych": "Large base of educational materials"
    , "Rachunki z małymi wolumenami (np. mikro)": "Accounts with small volumes (e.g., micro)"
    , "Prowizje/spready zależne od konta i regionu": "Commissions/spreads vary by account and region"

    , "Dobre materiały edukacyjne i analizy rynkowe": "Good educational materials and market analysis"
    , "Szeroka gama indeksów i towarów": "Wide range of indices and commodities"
    , "Warunki różnią się między regionami i klasami aktywów – sprawdź lokalną ofertę": "Conditions differ between regions and asset classes — check the local offer"
  },
};



