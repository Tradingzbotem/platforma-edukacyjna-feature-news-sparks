import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { EducationPreview } from '@/components/education/EducationPreview';
import { getEducationPreviewCopy } from '@/lib/educationPreviewCopy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Education — FXEDULAB' : 'Edukacja — FXEDULAB',
    description: isEn
      ? 'Free education layer: modules, quizzes, and a learning path with no signals or recommendations. Courses, materials, and clear next steps.'
      : 'Darmowa warstwa edukacyjna: moduły, quizy i ścieżka nauki bez sygnałów i rekomendacji. Kursy, materiały i logiczne kolejne kroki.',
  };
}

export default async function EdukacjaLocalePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const lang = locale === 'en' ? 'en' : 'pl';
  const copy = getEducationPreviewCopy(lang);

  return <EducationPreview copy={copy} />;
}
