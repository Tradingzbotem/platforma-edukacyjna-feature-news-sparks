import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams?: { plan?: string } }) {
  const raw = (searchParams?.plan || '').toLowerCase();
  const chosen = raw === 'starter' || raw === 'pro' || raw === 'elite' ? raw : undefined;
  const target = `/kontakt?topic=zakup-pakietu${chosen ? `&plan=${encodeURIComponent(chosen)}` : ''}`;
  redirect(target);
}
