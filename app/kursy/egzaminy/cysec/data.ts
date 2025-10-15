export type LessonMeta = {
  slug: string;
  title: string;
  minutes: number;
  pro?: boolean; // opcjonalnie: oznaczysz treści PRO
};

export const LESSONS: LessonMeta[] = [
  { slug: 'wstep',                title: 'Wprowadzenie i sylabus CySEC',                 minutes: 6  },
  { slug: 'mifid-ii',             title: 'MiFID II — zasady, wymogi i dokumenty',        minutes: 12 },
  { slug: 'ryzyko-zgodnosc',      title: 'Ryzyko i compliance: polityki, raportowanie',  minutes: 10 },
  { slug: 'aml',                  title: 'AML/CTF — obowiązki i procedury',              minutes: 10 },
  { slug: 'best-execution',       title: 'Best execution, konflikty interesów',          minutes: 10 },
  { slug: 'marketing-ujawnienia', title: 'Marketing, ujawnienia, KID/KIID',              minutes: 9  },
];
