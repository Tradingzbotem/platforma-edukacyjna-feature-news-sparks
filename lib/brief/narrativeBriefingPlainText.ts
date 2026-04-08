import type { MorningInstitutionalDepth, MorningInstitutionalLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import type { NarrativeBriefResponse } from '@/lib/brief/narrativeBriefingTypes';
import { languageValueLineForTxt } from '@/lib/brief/morningBriefingLocale';

function depthLabel(lang: MorningInstitutionalLanguage, depth: MorningInstitutionalDepth): string {
	if (lang === 'en') return depth === 'long' ? 'Long' : 'Short';
	if (lang === 'cs') return depth === 'long' ? 'Dlouhý (long)' : 'Krátký (short)';
	return depth === 'long' ? 'Długi (long)' : 'Krótki (short)';
}

export function narrativeBriefingTxtFilename(
	lang: MorningInstitutionalLanguage,
	depth: MorningInstitutionalDepth,
	at: Date,
): string {
	const y = at.getFullYear();
	const m = String(at.getMonth() + 1).padStart(2, '0');
	const d = String(at.getDate()).padStart(2, '0');
	const hh = String(at.getHours()).padStart(2, '0');
	const mm = String(at.getMinutes()).padStart(2, '0');
	return `briefing-narrative-${lang}-${depth}-${y}${m}${d}-${hh}${mm}.txt`;
}

export function formatNarrativeBriefingToPlainText(
	b: NarrativeBriefResponse,
	opts: { generatedAt: Date; language: MorningInstitutionalLanguage; depth: MorningInstitutionalDepth },
): string {
	const { generatedAt, language, depth } = opts;
	const lines: string[] = [];
	lines.push('FXEDULAB — NARRATIVE BRIEFING');
	lines.push('');
	lines.push(b.dateLabel);
	if (b.title?.trim()) {
		lines.push('');
		lines.push(b.title.trim());
	}
	lines.push('');
	lines.push('— — —');
	lines.push('');
	const headlineLbl =
		language === 'pl'
			? 'Najważniejsze wydarzenie:'
			: language === 'cs'
				? 'Nejdůležitější událost:'
				: 'Most important event:';
	const driverLbl = language === 'pl' ? 'Główny driver' : language === 'cs' ? 'Hlavní driver' : 'Primary driver';
	const topLbl = language === 'pl' ? 'TOP 3' : language === 'cs' ? 'TOP 3' : 'TOP 3';
	lines.push(language === 'pl' ? 'FILTR PRIORYTETÓW' : language === 'cs' ? 'FILTR PRIORIT' : 'EVENT PRIORITY FILTER');
	lines.push('');
	if (b.eventPriorityFilter.hasConcreteHeadlineEvent && b.eventPriorityFilter.headlineEventOneLiner.trim()) {
		lines.push(`${headlineLbl} ${b.eventPriorityFilter.headlineEventOneLiner.trim()}`);
		lines.push('');
	}
	lines.push(`${driverLbl}: ${b.eventPriorityFilter.primaryDriver}`);
	lines.push('');
	lines.push(`${topLbl}:`);
	b.eventPriorityFilter.topThreeEvents.forEach((ev, i) => {
		lines.push(`${i + 1}. [${ev.priorityTier.toUpperCase()}] ${ev.summary}`);
		lines.push(`   Channels: ${ev.channelsImpactOilIndicesFxVix}`);
		lines.push(`   ${ev.rationale}`);
		lines.push('');
	});
	lines.push('— — —');
	lines.push('');
	lines.push(b.eventShift.changeLast12to24h);
	lines.push('');
	lines.push(`Driver: ${b.eventShift.dominantEvent}`);
	lines.push(`${b.eventShift.priorScenario} → ${b.eventShift.currentScenario}`);
	lines.push('');
	for (const s of b.eventShift.openingThreeSentences) {
		lines.push(s);
		lines.push('');
	}
	lines.push('— — —');
	lines.push('');
	for (const p of b.leadParagraphs) {
		lines.push(p);
		lines.push('');
	}
	lines.push('— — —');
	lines.push('');
	lines.push(b.marketMechanics.title.toUpperCase());
	lines.push('');
	for (const p of b.marketMechanics.paragraphs) {
		lines.push(p);
		lines.push('');
	}
	for (const block of b.marketMechanics.bulletBlocks ?? []) {
		lines.push(block.title);
		for (const bullet of block.bullets) {
			lines.push(`• ${bullet}`);
		}
		lines.push('');
	}
	if (b.updates?.length) {
		for (const u of b.updates) {
			lines.push('— — —');
			lines.push('');
			if (u.dateLabel?.trim()) lines.push(u.dateLabel.trim());
			if (u.title?.trim()) lines.push(u.title.trim());
			if (u.dateLabel?.trim() || u.title?.trim()) lines.push('');
			for (const p of u.paragraphs) {
				lines.push(p);
				lines.push('');
			}
		}
	}
	lines.push('— — —');
	lines.push('');
	lines.push(b.marketContext.title.toUpperCase());
	lines.push('');
	for (const p of b.marketContext.paragraphs) {
		lines.push(p);
		lines.push('');
	}
	for (const block of b.marketContext.bulletBlocks ?? []) {
		lines.push(block.title);
		for (const bullet of block.bullets) {
			lines.push(`• ${bullet}`);
		}
		lines.push('');
	}
	lines.push('— — —');
	lines.push('');
	lines.push(b.forwardRealities.title.toUpperCase());
	lines.push('');
	const ifWord = language === 'pl' ? 'JEŚLI' : language === 'cs' ? 'Pokud' : 'IF';
	for (const row of b.forwardRealities.conditionals) {
		lines.push(`${ifWord} ${row.if} → ${row.then}`);
		lines.push('');
	}
	if (b.scenarios?.length) {
		lines.push('— — —');
		lines.push('');
		for (const s of b.scenarios) {
			lines.push(s.title);
			lines.push('');
			for (const p of s.paragraphs ?? []) {
				lines.push(p);
				lines.push('');
			}
			for (const bullet of s.bullets ?? []) {
				lines.push(`• ${bullet}`);
			}
			if ((s.bullets?.length ?? 0) > 0) lines.push('');
		}
	}
	lines.push('— — —');
	lines.push('');
	lines.push('GLOSSARY');
	lines.push('');
	for (const g of b.glossary) {
		lines.push(`${g.term} — ${g.definition}`);
		lines.push('');
	}
	lines.push('— — —');
	lines.push('');
	lines.push(`Generated: ${generatedAt.toISOString()}`);
	lines.push(languageValueLineForTxt(language));
	lines.push(`Depth: ${depthLabel(language, depth)}`);
	lines.push('Format: narrative');
	return lines.join('\n').trimEnd() + '\n';
}
