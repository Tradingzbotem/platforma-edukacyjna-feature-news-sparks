'use client';

import Link from 'next/link';

export default function MobileStickyBar() {
  function openAI() {
    try {
      localStorage.setItem('ai:chat:open', '1');
      window.dispatchEvent(new CustomEvent('fxedu:ai:open'));
    } catch {}
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-2 flex items-center justify-around">
          <Link
            href="/challenge"
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Przejdź do Challenge"
          >
            Challenge
          </Link>
          <button
            onClick={openAI}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Otwórz AI"
          >
            AI
          </button>
        </div>
      </div>
    </div>
  );
}


