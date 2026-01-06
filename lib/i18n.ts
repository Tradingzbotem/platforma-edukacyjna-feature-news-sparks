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
    market_panel_nav: 'Panel rynkowy',
    learn_nav: 'Nauka',
    about_nav: 'O nas',

    // Hero
    badge_edu: 'EDU',
    market_panel_title: 'Panel rynkowy (EDU)',
    market_panel_lead:
      'Makro, technika, scenariusze i checklisty — edukacyjnie. Bez sygnałów i rekomendacji.',
    choose_plan: 'Wybierz plan',

    // Included
    whats_included_title: 'Co dostajesz',
    included_1: 'Materiały edukacyjne: makro‑przeglądy i mapy techniczne (EDU)',
    included_2: 'Scenariusze warunkowe A/B/C oraz checklisty decyzyjne',
    included_3: 'Interpretacja danych i wydarzeń bez rekomendacji inwestycyjnych',
    included_4: 'Kalendarz i playbooki eventowe (EDU)',
    included_5: 'Ramy zarządzania ryzykiem i praktyczne checklisty',

    // Pricing
    plans_title: 'Plany',
    plan_starter_name: 'STARTER EDU',
    plan_pro_name: 'PRO EDU',
    plan_elite_name: 'ELITE EDU',
    plan_starter_1: 'Kalendarz 7 dni',
    plan_starter_2: 'Scenariusze A/B/C',
    plan_starter_3: 'Checklisty',
    plan_pro_1: 'Wszystko ze Starter',
    plan_pro_2: 'Mapy techniczne (EDU)',
    plan_pro_3: 'Playbooki eventowe',
    plan_elite_1: 'Wszystko z Pro',
    plan_elite_2: 'Coach AI (edukacyjny)',
    plan_elite_3: 'Raport miesięczny',
    plan_most_popular: 'Najczęściej wybierany',
    per_month: '/mies',
    per_year: '/rok',
    currency_pln: 'PLN',
    billing_monthly: 'Miesięcznie',
    billing_yearly_2mo: 'Rocznie (2 mies. gratis)',
    elite_plus_badge: 'ELITE = PRO + Coach AI + Raport',
    trial_starter: 'Wypróbuj 7 dni (trial)',

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
      'Materiały mają charakter edukacyjny. Brak rekomendacji inwestycyjnych ani sygnałów rynkowych.',

    // Footer / legal nav
    navigation: 'Nawigacja',
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
    market_panel_nav: 'Market Panel',
    learn_nav: 'Learn',
    about_nav: 'About us',

    // Hero
    badge_edu: 'EDU',
    market_panel_title: 'Market Panel (EDU)',
    market_panel_lead:
      'Macro, technicals, scenarios and checklists — educational. No signals or recommendations.',
    choose_plan: 'Choose plan',

    // Included
    whats_included_title: 'What you get',
    included_1: 'Educational materials: macro overviews and technical maps (EDU)',
    included_2: 'Conditional scenarios A/B/C and decision checklists',
    included_3: 'Data and events interpretation without investment recommendations',
    included_4: 'Calendar and event playbooks (EDU)',
    included_5: 'Risk management framework and practical checklists',

    // Pricing
    plans_title: 'Plans',
    plan_starter_name: 'STARTER EDU',
    plan_pro_name: 'PRO EDU',
    plan_elite_name: 'ELITE EDU',
    plan_starter_1: '7‑day calendar',
    plan_starter_2: 'A/B/C scenarios',
    plan_starter_3: 'Checklists',
    plan_pro_1: 'Everything in Starter',
    plan_pro_2: 'Technical maps (EDU)',
    plan_pro_3: 'Event playbooks',
    plan_elite_1: 'Everything in Pro',
    plan_elite_2: 'AI coach (educational)',
    plan_elite_3: 'Monthly report',
    plan_most_popular: 'Most popular',
    per_month: '/month',
    per_year: '/year',
    currency_pln: 'PLN',
    billing_monthly: 'Monthly',
    billing_yearly_2mo: 'Yearly (2 months free)',
    elite_plus_badge: 'ELITE = PRO + AI coach + Monthly report',
    trial_starter: 'Try 7 days (trial)',

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
      'Materials are for educational purposes only. No investment recommendations or trading signals.',

    // Footer / legal nav
    navigation: 'Navigation',
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


