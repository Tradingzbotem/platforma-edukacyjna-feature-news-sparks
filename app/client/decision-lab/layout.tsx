import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { hasFeature } from '@/lib/features';

export default async function DecisionLabLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const userId = session.userId || session.email;

  if (!userId) {
    redirect('/logowanie?next=/client/decision-lab');
  }

  const hasDecisionLab = await hasFeature(userId, 'decision_lab');

  if (!hasDecisionLab) {
    return (
      <main className="min-h-screen bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Decision Lab — dostęp beta</h1>
            <p className="text-lg text-white/70 mb-8">
              Ten moduł jest obecnie dostępny tylko dla wybranych użytkowników.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/client"
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
              >
                Wróć do dashboardu
              </a>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@example.com'}?subject=Prośba o dostęp do Decision Lab`}
                className="inline-flex items-center justify-center rounded-xl bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors border border-white/10"
              >
                Poproś o dostęp
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
