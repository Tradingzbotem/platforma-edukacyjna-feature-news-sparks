'use client';

import React from 'react';

const VIX_SYMBOL = "TVC:VIX"; // fallback option: "CBOE:VX1!"

export default function VixMiniTile() {
  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">VIX — emocje inwestorów</h2>
        <p className="mt-1 text-sm text-white/70">
          Im wyżej VIX, tym większa niepewność i strach (risk-off). Im niżej, tym większa stabilność i spokój (risk-on).
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-2 overflow-hidden">
        <div className="w-full min-h-[320px] md:min-h-[360px]">
          <tv-mini-chart
            symbol={VIX_SYMBOL}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70 shrink-0">Strach</span>
          <div className="relative h-1 w-full rounded bg-white/10">
            <div className="absolute inset-0 rounded bg-gradient-to-r from-white/40 via-white/25 to-white/40 opacity-70" />
          </div>
          <span className="text-xs text-white/70 shrink-0">Spokój</span>
        </div>
      </div>
    </section>
  );
}


