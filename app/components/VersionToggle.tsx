'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VersionToggle() {
  const searchParams = useSearchParams();
  const isNewVersion = searchParams?.get('v') === 'new';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        href={isNewVersion ? '/' : '/?v=new'}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors shadow-lg"
      >
        <span>{isNewVersion ? '← Stara wersja' : 'Nowa wersja →'}</span>
      </Link>
    </div>
  );
}
