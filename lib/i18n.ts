export type Lang = 'pl' | 'en';

type Dict = Record<Lang, Record<string, string>>;

const DICT: Dict = {
  pl: {
    // Core/nav
    brand: 'FX EduLab',
    skip_to_content: 'Przejdź do treści',
    change_language: 'Zmień język',
    login: 'Zaloguj',
    join_free: 'Dołącz za darmo',
    logout: 'Wyloguj',
    account: 'Konto',
    home: 'Strona główna',
    courses: 'Kursy',
    calculator: 'Kalkulator',
    quizzes: 'Quizy',
    ebooks: 'Ebooki',
    broker_rankings: 'Rankingi brokerów',
    news: 'News',
    challenge: 'Challenge',

    // Nav
    market_nav: 'Rynek',
    market_panel_nav: 'Panel rynkowy',
    charts_nav: 'Wykresy',
    investor_nav: 'Dla inwestora',
    learn_nav: 'Edukacja',
    edu_preview_nav: 'Przegląd edukacji',
    edu_preview_nav_hint: 'Publiczny podgląd modułów — bez logowania',
    about_nav: 'O nas',

    // Hero
    badge_edu: 'EDU',
    market_panel_title: 'Panel rynkowy (EDU)',
    market_panel_lead:
      'Makro, technika, scenariusze i checklisty — edukacyjnie. Bez sygnałów i rekomendacji.',
    choose_plan: 'Founders NFT — pełny dostęp',

    // Included
    whats_included_title: 'Co dostajesz',
    included_1: 'Materiały edukacyjne: makro‑przeglądy i mapy techniczne (EDU)',
    included_2: 'Scenariusze warunkowe A/B/C oraz checklisty decyzyjne',
    included_3: 'Interpretacja danych i wydarzeń bez rekomendacji inwestycyjnych',
    included_4: 'Kalendarz i playbooki eventowe (EDU)',
    included_5: 'Ramy zarządzania ryzykiem i praktyczne checklisty',

    // Pricing
    plans_title: 'Pełny dostęp',
    plan_starter_name: 'Founders NFT',
    plan_pro_name: 'Founders NFT',
    plan_elite_name: 'Founders NFT',
    plan_starter_1: 'Kalendarz 7 dni',
    plan_starter_2: 'Scenariusze A/B/C',
    plan_starter_3: 'Checklisty',
    plan_pro_1: 'Wszystkie moduły panelu w jednym zakupie',
    plan_pro_2: 'Mapy techniczne (EDU)',
    plan_pro_3: 'Playbooki eventowe',
    plan_elite_1: 'Bez subskrypcji — jednorazowo',
    plan_elite_2: 'Coach AI (edukacyjny)',
    plan_elite_3: 'Raport miesięczny',
    plan_most_popular: 'Najczęściej wybierany',
    per_month: '/mies',
    per_year: '/rok',
    currency_pln: 'PLN',
    billing_monthly: 'Miesięcznie',
    billing_yearly_2mo: 'Rocznie (2 mies. gratis)',
    elite_plus_badge: 'Jeden zakup = cały panel EDU',
    trial_starter: 'Founders NFT',

    // FAQ
    faq_title: 'FAQ',
    faq_q1: 'Czy to są „sygnały”?',
    faq_a1:
      'Nie. To materiały edukacyjne: scenariusze warunkowe, interpretacja danych i checklisty. Nie zawierają porad ani rekomendacji inwestycyjnych.',
    faq_q2: 'Co konkretnie znajdę w panelu?',
    faq_a2:
      'Kalendarz (EDU), mapy techniczne (EDU), scenariusze A/B/C, playbooki eventowe i ramy zarządzania ryzykiem.',
    faq_q3: 'Czy mogę liczyć na „kup/sprzedaj” lub „wejście/wyjście”?',
    faq_a3:
      'Nie. Unikamy takich sformułowań. Udostępniamy materiały edukacyjne i checklisty, które pomagają rozumieć kontekst i ryzyka — bez sygnałów i rekomendacji.',

    // Disclaimer
    faq_title_short: 'FAQ',
    disclaimer_short:
      'Dostęp do funkcji cyfrowych, materiałów EDU i modułów analitycznych — bez brokera, bez doradztwa inwestycyjnego i bez sygnałów.',
    compliance_disclaimer:
      'Serwis udostępnia funkcjonalności cyfrowe oraz treści edukacyjne i analityczne. Nie jest biurem maklerskim ani firmą inwestycyjną i nie świadczy doradztwa inwestycyjnego ani sygnałów transakcyjnych.',
    footer_notice_line1:
      'Materiały i funkcjonalności mają charakter edukacyjny oraz informacyjny.',
    footer_notice_line2:
      'Treści, analizy, briefy i odpowiedzi AI nie stanowią rekomendacji inwestycyjnych ani sygnałów transakcyjnych.',
    footer_notice_line3:
      'Handel instrumentami finansowymi wiąże się z ryzykiem utraty kapitału, a decyzje użytkownik podejmuje samodzielnie.',
    legal_disclaimer: 'Disclaimer (ryzyko)',

    // Footer / legal nav
    navigation: 'Nawigacja',
    footer_service: 'Serwis',
    footer_help: 'Pomoc',
    redakcja_nav: 'Redakcja',
    resources: 'Zasoby',
    legal: 'Prawne',
    faq: 'FAQ',
    terms_of_use: 'Warunki korzystania',
    privacy_policy: 'Polityka prywatności',
    cookies: 'Cookies',
    contact: 'Kontakt',
    pricing: 'Cennik',
    terms: 'Regulamin',
    returns: 'Zwroty',
    risk_warning_long:
      'Ostrzeżenie o ryzyku: Handel instrumentami z dźwignią (w tym CFD i Forex) wiąże się z wysokim ryzykiem szybkiej utraty środków z powodu dźwigni finansowej. Materiały dostępne na tej stronie mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnych.',
  },
  en: {
    // Core/nav
    brand: 'FX EduLab',
    skip_to_content: 'Skip to content',
    change_language: 'Change language',
    login: 'Log in',
    join_free: 'Join for free',
    logout: 'Log out',
    account: 'Account',
    home: 'Home',
    courses: 'Courses',
    calculator: 'Calculator',
    quizzes: 'Quizzes',
    ebooks: 'Ebooks',
    broker_rankings: 'Broker rankings',
    news: 'News',
    challenge: 'Challenge',

    // Nav
    market_nav: 'Markets',
    market_panel_nav: 'Market Panel',
    charts_nav: 'Charts',
    investor_nav: 'For investors',
    learn_nav: 'Education',
    edu_preview_nav: 'Education overview',
    edu_preview_nav_hint: 'Public preview of modules — no sign-in required',
    about_nav: 'About us',

    // Hero
    badge_edu: 'EDU',
    market_panel_title: 'Market Panel (EDU)',
    market_panel_lead:
      'Macro, technicals, scenarios and checklists — educational. No signals or recommendations.',
    choose_plan: 'Founders NFT — full access',

    // Included
    whats_included_title: 'What you get',
    included_1: 'Educational materials: macro overviews and technical maps (EDU)',
    included_2: 'Conditional scenarios A/B/C and decision checklists',
    included_3: 'Data and events interpretation without investment recommendations',
    included_4: 'Calendar and event playbooks (EDU)',
    included_5: 'Risk management framework and practical checklists',

    // Pricing
    plans_title: 'Full access',
    plan_starter_name: 'Founders NFT',
    plan_pro_name: 'Founders NFT',
    plan_elite_name: 'Founders NFT',
    plan_starter_1: '7‑day calendar',
    plan_starter_2: 'A/B/C scenarios',
    plan_starter_3: 'Checklists',
    plan_pro_1: 'All market panel modules in one purchase',
    plan_pro_2: 'Technical maps (EDU)',
    plan_pro_3: 'Event playbooks',
    plan_elite_1: 'One-time purchase — no subscription',
    plan_elite_2: 'AI coach (educational)',
    plan_elite_3: 'Monthly report',
    plan_most_popular: 'Most popular',
    per_month: '/month',
    per_year: '/year',
    currency_pln: 'PLN',
    billing_monthly: 'Monthly',
    billing_yearly_2mo: 'Yearly (2 months free)',
    elite_plus_badge: 'One purchase = full EDU panel',
    trial_starter: 'Founders NFT',

    // FAQ
    faq_title: 'FAQ',
    faq_q1: 'Is this a “signals” service?',
    faq_a1:
      'No. These are educational materials: conditional scenarios, data interpretation and checklists. No advice or recommendations.',
    faq_q2: 'What exactly is inside?',
    faq_a2:
      'Calendar (EDU), technical maps (EDU), A/B/C scenarios, event playbooks and a risk management framework.',
    faq_q3: 'Will I get “buy/sell” or “entry/exit” calls?',
    faq_a3:
      'No. We avoid such wording. We provide educational materials and checklists to understand context and risks — without signals or recommendations.',

    // Disclaimer
    faq_title_short: 'FAQ',
    disclaimer_short:
      'Digital features, EDU materials and analytical modules — not a broker, not investment advice, no trading signals.',
    compliance_disclaimer:
      'The service provides digital features and educational and analytical content. It is not a brokerage or investment firm and does not provide investment advice or trading signals.',
    footer_notice_line1:
      'Materials and features are for education and information.',
    footer_notice_line2:
      'Content, analyses, briefs and AI replies are not investment recommendations or trading signals.',
    footer_notice_line3:
      'Trading financial instruments involves risk of losing capital; you make your own decisions.',
    legal_disclaimer: 'Risk disclaimer',

    // Footer / legal nav
    navigation: 'Navigation',
    footer_service: 'Service',
    footer_help: 'Help',
    redakcja_nav: 'Editorial',
    resources: 'Resources',
    legal: 'Legal',
    faq: 'FAQ',
    terms_of_use: 'Terms of use',
    privacy_policy: 'Privacy policy',
    cookies: 'Cookies',
    contact: 'Contact',
    pricing: 'Pricing',
    terms: 'Terms',
    returns: 'Returns',
    risk_warning_long:
      'Risk warning: Trading leveraged instruments (including CFDs and Forex) involves a high risk of rapid loss due to leverage. Materials on this website are for educational purposes only and do not constitute investment recommendations.',
  },
};

export function t(lang: Lang, key: string): string {
  const l = lang === 'en' ? 'en' : 'pl';
  return DICT[l][key] ?? key;
}


