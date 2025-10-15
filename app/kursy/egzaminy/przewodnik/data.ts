export type LessonMeta = {
  slug: string;
  title: string;
  minutes: number;
  pro?: boolean;
};

export const LESSONS: LessonMeta[] = [
  { slug: 'wstep',     title: 'Wstęp: KNF, ESMA, MiFID — po co to jest?',     minutes: 5  },
  { slug: 'mifid',     title: 'MiFID II — filary i praktyczne skutki',        minutes: 12 },
  { slug: 'esma',      title: 'ESMA — wytyczne, limity, interwencje',         minutes: 9  },
  { slug: 'emir-mar',  title: 'EMIR i MAR — raportowanie, nadużycia',         minutes: 10 },
  { slug: 'lewar',     title: 'Dźwignia i ograniczenia dla detalicznych',     minutes: 8  },
  { slug: 'testy',     title: 'Testy: adekwatność, odpowiedniość, KID/KIID',  minutes: 9  },
];
