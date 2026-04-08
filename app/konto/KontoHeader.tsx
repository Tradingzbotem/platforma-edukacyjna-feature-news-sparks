'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PUBLIC_CERT_FXEDULAB_PATH } from '@/lib/certifications/publicCertInfoPath';

const pillActive =
  'px-4 py-2 text-sm rounded-full bg-white text-slate-900 font-semibold shadow-sm border border-white/20';
const pillIdle = 'px-4 py-2 text-sm rounded-full text-white/70 hover:text-white';

type Props = {
  /** Flaga admina `certification_access` — bez niej zakładka Certyfikat nie jest renderowana. */
  certificationAccess?: boolean;
};

export default function KontoHeader({ certificationAccess = false }: Props) {
  const pathname = usePathname() ?? '';
  const isChecklistyPage = pathname.includes('/konto/panel-rynkowy/checklisty');

  if (isChecklistyPage) {
    return null;
  }

  const isPanel = pathname === '/client' || pathname.startsWith('/client/');
  const isCertyfikat = pathname.startsWith('/konto/certyfikat');
  const isUstawienia = pathname.startsWith('/konto/ustawienia');
  const isChallenge = pathname === '/challenge' || pathname.startsWith('/challenge/');

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm underline text-white/70 hover:text-white">
            ← Strona główna
          </Link>
        </div>
        <nav
          className="inline-flex max-w-[min(100%,calc(100vw-2rem))] flex-wrap justify-end gap-1 rounded-full border border-white/10 bg-white/10 p-1 transition-opacity duration-200 sm:flex-nowrap"
          aria-label="Panel użytkownika"
        >
          <Link href="/client" className={isPanel ? pillActive : pillIdle}>
            Panel
          </Link>
          <Link
            href={certificationAccess ? '/konto/certyfikat' : PUBLIC_CERT_FXEDULAB_PATH}
            className={isCertyfikat ? pillActive : pillIdle}
          >
            Certyfikat
          </Link>
          <Link href="/konto/ustawienia" className={isUstawienia ? pillActive : pillIdle}>
            Ustawienia
          </Link>
          <Link href="/challenge" className={isChallenge ? pillActive : pillIdle}>
            Challenge
          </Link>
        </nav>
      </div>
    </header>
  );
}
