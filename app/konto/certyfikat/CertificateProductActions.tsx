'use client';

import { useState } from 'react';

type Props = {
  verifyAbsoluteUrl: string;
  verifyPath: string;
};

export default function CertificateProductActions({ verifyAbsoluteUrl, verifyPath }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyAbsoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const btnBase =
    'inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href="/api/konto/certyfikat/pdf"
        className={`${btnBase} border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-100 hover:border-amber-400/70 hover:from-amber-500/30`}
      >
        Pobierz PDF
      </a>
      <a
        href={verifyPath}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} border-white/15 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.07]`}
      >
        Weryfikuj certyfikat
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={`${btnBase} border-white/15 bg-transparent text-white/90 hover:border-amber-500/35 hover:text-amber-100`}
      >
        {copied ? 'Skopiowano' : 'Kopiuj link weryfikacji'}
      </button>
    </div>
  );
}
