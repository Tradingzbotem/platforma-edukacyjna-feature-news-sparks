export type Lang = 'pl' | 'en';

export const dictionaries: Record<Lang, Record<string, string>> = {
	pl: {
		brand: 'FX EduLab',
		skip_to_content: 'Przejdź do treści',
		login: 'Zaloguj',
		join_free: 'Dołącz za darmo',
		courses: 'Kursy',
		calculator: 'Kalkulator',
		quizzes: 'Quizy',
		ebooks: 'Ebooki',
		broker_rankings: 'Rankingi brokerów',
		news: 'News',
		challenge: 'Challenge'
	},
	en: {
		brand: 'FX EduLab',
		skip_to_content: 'Skip to content',
		login: 'Log in',
		join_free: 'Join for free',
		courses: 'Courses',
		calculator: 'Calculator',
		quizzes: 'Quizzes',
		ebooks: 'Ebooks',
		broker_rankings: 'Broker rankings',
		news: 'News',
		challenge: 'Challenge'
	}
};

export function t(lang: Lang, key: string): string {
	const dict = dictionaries[lang];
	return (dict && key in dict) ? dict[key] : key;
}


