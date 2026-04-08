import type { ExamAnswerStored, ExamAnswersMap, ExamQuestionPublic } from '@/lib/certification-exam/types';

const OPEN_TEXT_MAX_DEFAULT = 2000;

export function parseStoredAnswer(raw: unknown): ExamAnswerStored | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t ? { kind: 'single_choice', optionId: t } : null;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.kind === 'single_choice' && typeof o.optionId === 'string' && o.optionId.trim()) {
    return { kind: 'single_choice', optionId: o.optionId.trim() };
  }
  if (o.kind === 'open_text' && typeof o.text === 'string') {
    return { kind: 'open_text', text: o.text };
  }
  return null;
}

export function normalizeAnswersMap(raw: unknown): ExamAnswersMap | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const out: ExamAnswersMap = {};
  for (const [k, v] of Object.entries(o)) {
    const p = parseStoredAnswer(v);
    if (p) out[k] = p;
  }
  return Object.keys(out).length ? out : null;
}

/** Parsuje pojedynczy wpis z PATCH/POST (JSON body). */
export function parseAnswerPatchValue(v: unknown): ExamAnswerStored | null {
  return parseStoredAnswer(v);
}

export function isAnswerCompleteForQuestion(q: ExamQuestionPublic, raw: ExamAnswerStored | string | undefined): boolean {
  const a = typeof raw === 'string' ? parseStoredAnswer(raw) : raw ? parseStoredAnswer(raw) : null;
  if (!a) return false;
  if (q.type === 'single_choice') {
    return a.kind === 'single_choice' && Boolean(a.optionId.trim());
  }
  const maxLen = q.maxLength ?? OPEN_TEXT_MAX_DEFAULT;
  if (a.kind !== 'open_text') return false;
  const t = a.text.trim();
  if (t.length === 0) return false;
  return a.text.length <= maxLen;
}

export function isAnswersCompleteForQuestions(questions: ExamQuestionPublic[], answers: ExamAnswersMap | null): boolean {
  if (!answers) return false;
  for (const q of questions) {
    if (!isAnswerCompleteForQuestion(q, answers[q.id])) return false;
  }
  return true;
}

export function countQuestionKinds(questions: ExamQuestionPublic[]) {
  let singleChoice = 0;
  let openText = 0;
  for (const q of questions) {
    if (q.type === 'single_choice') singleChoice += 1;
    else openText += 1;
  }
  return { total: questions.length, singleChoice, openText };
}

export function getOpenTextMaxLength(q: ExamQuestionPublic): number {
  return q.type === 'open_text' ? q.maxLength ?? OPEN_TEXT_MAX_DEFAULT : OPEN_TEXT_MAX_DEFAULT;
}
