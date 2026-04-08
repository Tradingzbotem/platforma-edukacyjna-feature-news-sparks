import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { EducationPreview } from '@/components/education/EducationPreview';
import { getEducationPreviewCopy } from '@/lib/educationPreviewCopy';

export const metadata: Metadata = {
  title: 'Edukacja — FXEDULAB',
  description:
    'Darmowa warstwa edukacyjna: moduły, quizy i ścieżka nauki bez sygnałów i rekomendacji. Kursy, materiały i logiczne kolejne kroki.',
};

export default async function EdukacjaPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'pl';
  const copy = getEducationPreviewCopy(lang);

  return <EducationPreview copy={copy} />;
}
