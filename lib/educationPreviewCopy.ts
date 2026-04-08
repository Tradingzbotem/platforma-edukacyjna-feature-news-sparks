import pl from '@/messages/pl.json';
import en from '@/messages/en.json';

export type EducationPreviewCopy = (typeof pl)['education_preview'];

export function getEducationPreviewCopy(lang: 'pl' | 'en'): EducationPreviewCopy {
  return lang === 'en' ? en.education_preview : pl.education_preview;
}
