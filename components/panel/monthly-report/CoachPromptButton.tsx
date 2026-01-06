'use client';

type Props = {
	month: string; // YYYY-MM
	narrative: string;
	keyEvents: { date: string; name: string }[];
	onCopied?: () => void;
};

function buildPrompt(month: string, narrative: string, keyEvents: { date: string; name: string }[]) {
	const top3 = keyEvents.slice(0, 3).map((e, i) => `${i + 1}. ${e.name} (${new Date(e.date).toLocaleDateString('pl-PL')})`).join('\n');
	return [
		`Kontekst raportu miesięcznego EDU dla ${month}:`,
		'Główna narracja:',
		narrative.slice(0, 1000),
		'Najważniejsze 3 eventy:',
		top3,
		'Proszę przygotuj:',
		'- Scenariusze A/B/C na kolejny miesiąc (EDU, bez „sygnałów”)',
		'- Checklistę tygodniową (przed danymi / w dniu / po publikacji)',
		'- Krótkie ostrzeżenia (ryzyko dźwigni, pułapki interpretacyjne)',
	].join('\n\n');
}

export default function CoachPromptButton({ month, narrative, keyEvents, onCopied }: Props) {
	return (
		<button
			type="button"
			onClick={async () => {
				const prompt = buildPrompt(month, narrative, keyEvents);
				try {
					await navigator.clipboard.writeText(prompt);
					onCopied?.();
				} catch {
					// ignore
				}
			}}
			className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 font-semibold px-3 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
		>
			Uruchom Coach AI na podstawie raportu (kopiuj prompt)
		</button>
	);
}


