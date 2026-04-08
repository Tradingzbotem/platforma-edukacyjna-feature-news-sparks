import type {
  BriefingQuestionDifficulty,
  MorningBriefingQuestionItem,
  MorningBriefingQuestionsPack,
} from '@/lib/brief/morningBriefingQuestionsTypes';

function parseDifficulty(x: unknown): BriefingQuestionDifficulty {
  if (x === 'easy' || x === 'hard' || x === 'medium') return x;
  return 'medium';
}

export function normalizeMorningBriefingQuestionsPack(raw: unknown): MorningBriefingQuestionsPack | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const intro = typeof o.intro === 'string' ? o.intro.trim() : '';
  const qraw = o.questions;
  if (!Array.isArray(qraw) || qraw.length === 0) return null;

  const questions: MorningBriefingQuestionItem[] = [];
  for (const row of qraw) {
    if (row == null || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const type = r.type === 'open_text' ? 'open_text' : 'single_choice';
    const optsRaw = r.options;
    const options = Array.isArray(optsRaw)
      ? optsRaw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : [];

    questions.push({
      type,
      question: typeof r.question === 'string' ? r.question : '',
      options: type === 'single_choice' ? options : [],
      correctAnswer: typeof r.correctAnswer === 'string' ? r.correctAnswer : '',
      explanation: typeof r.explanation === 'string' ? r.explanation : '',
      difficulty: parseDifficulty(r.difficulty),
      sourceSection: typeof r.sourceSection === 'string' ? r.sourceSection : '',
    });
  }

  if (questions.length === 0) return null;
  return { title, intro, questions };
}
