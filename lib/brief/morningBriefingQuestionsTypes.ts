import type { MorningInstitutionalLanguage } from '@/lib/brief/morningInstitutionalBriefingTypes';

export type BriefingQuestionType = 'single_choice' | 'open_text';
export type BriefingQuestionDifficulty = 'easy' | 'medium' | 'hard';

export type MorningBriefingQuestionItem = {
  type: BriefingQuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: BriefingQuestionDifficulty;
  sourceSection: string;
};

export type MorningBriefingQuestionsPack = {
  title: string;
  intro: string;
  questions: MorningBriefingQuestionItem[];
};

export type MorningQuestionsRequestBody = {
  language: MorningInstitutionalLanguage;
  depth: 'short' | 'long';
  briefing: unknown;
};
