import type { MorningBriefingQuestionsPack } from '@/lib/brief/morningBriefingQuestionsTypes';
import type { MorningInstitutionalDepth, MorningInstitutionalLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';
import {
  difficultyLabel,
  formatBriefingDateTime,
  getMorningBriefingLocale,
  languageValueLineForTxt,
} from '@/lib/brief/morningBriefingLocale';

export type MorningQuestionsExportMeta = {
  generatedAt: Date;
  language: MorningInstitutionalLanguage;
  depth: MorningInstitutionalDepth;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function morningBriefingQuestionsTxtFilename(
  language: MorningInstitutionalLanguage,
  depth: MorningInstitutionalDepth,
  at: Date,
): string {
  const y = at.getFullYear();
  const mo = pad2(at.getMonth() + 1);
  const d = pad2(at.getDate());
  const h = pad2(at.getHours());
  const mi = pad2(at.getMinutes());
  return `morning-briefing-questions-${language}-${depth}-${y}-${mo}-${d}-${h}-${mi}.txt`;
}

export function formatMorningBriefingQuestionsToPlainText(
  pack: MorningBriefingQuestionsPack,
  meta: MorningQuestionsExportMeta,
): string {
  const L = getMorningBriefingLocale(meta.language);
  const lines: string[] = [];
  const nl = () => lines.push('');
  const push = (s: string) => lines.push(s);

  push(L.txtQuestionsDocTitle);
  nl();
  push(`${L.txtGeneratedAt}: ${formatBriefingDateTime(meta.generatedAt, meta.language)}`);
  push(`${L.txtLanguage}: ${languageValueLineForTxt(meta.language)}`);
  push(`${L.txtDepth}: ${L.txtDepthValue(meta.depth)}`);
  nl();

  push(`${L.txtTitle}: ${pack.title.trim() || L.txtNone}`);
  push(`${L.txtIntro}: ${pack.intro.trim() || L.txtNone}`);
  nl();

  pack.questions.forEach((q, idx) => {
    const n = idx + 1;
    const typeLabel = q.type === 'open_text' ? L.typeOpenText : L.typeSingleChoice;
    push(L.txtQuestionPrefix(n, typeLabel));
    push(q.question.trim() || L.txtNone);

    if (q.type === 'single_choice') {
      if (q.options.length === 0) {
        push(`${L.fldOptions}: ${L.txtNone}`);
      } else {
        q.options.forEach((opt, i) => {
          push(`${L.optionLetter(i)} ${opt}`);
        });
      }
    }

    const answerLabel = q.type === 'open_text' ? L.modelAnswerOpenText : L.txtCorrectAnswer;
    push(`${answerLabel}: ${q.correctAnswer.trim() || L.txtNone}`);
    push(`${L.fldExplanation}: ${q.explanation.trim() || L.txtNone}`);
    push(`${L.txtLevel}: ${difficultyLabel(L, q.difficulty)}`);
    push(`${L.fldSourceSection}: ${q.sourceSection.trim() || L.txtNone}`);
    nl();
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
