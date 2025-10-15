export type LessonMeta = {
  slug: string;
  title: string;
  minutes: number;
  pro?: boolean;
};

export const LESSONS: LessonMeta[] = [
  { slug: 'mapa-egzaminu',       title: 'Mapa egzaminu i wymagania KNF',      minutes: 6  },
  { slug: 'adekwatnosc',         title: 'Test adekwatności i odpowiedniości', minutes: 12 },
  { slug: 'best-execution',      title: 'Najlepsza realizacja i konflikty',   minutes: 11 },
  { slug: 'ochrona-klienta',     title: 'Ochrona klienta, informacje, koszty',minutes: 10 },
  { slug: 'aml',                 title: 'AML/CTF — obowiązki firmy',          minutes: 9  },
  { slug: 'case-studies',        title: 'Case studies i pytania sytuacyjne',  minutes: 10 },
];
