'use client';

import React, { useEffect, useRef, useState } from 'react';

type Source = 'OANDA' | 'CAPITALCOM' | 'FX';

const SOURCE_TO_SYMBOL: Record<Source, string> = {
  OANDA: 'OANDA:NAS100USD|1D',
  CAPITALCOM: 'CAPITALCOM:US100|1D',
  FX: 'FX:NAS100|1D',
};

const SOURCE_TO_TV_LINK: Record<Source, string> = {
  OANDA: 'https://www.tradingview.com/symbols/OANDA-NAS100USD/',
  CAPITALCOM: 'https://www.tradingview.com/symbols/CAPITALCOM-US100/',
  FX: 'https://www.tradingview.com/symbols/FX-NAS100/',
};

export default function Us100EmotionsTile() {
  const [source, setSource] = useState<Source>('OANDA');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Clear previous render
    el.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const attr = document.createElement('div');
    attr.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = SOURCE_TO_TV_LINK[source];
    link.rel = 'noopener nofollow';
    link.target = '_blank';
    link.textContent = SOURCE_TO_SYMBOL[source].split('|')[0];
    attr.appendChild(link);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    const config = {
      symbols: [[SOURCE_TO_SYMBOL[source]]],
      chartOnly: false,
      autosize: true,
      showVolume: true,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: true,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      chartType: 'area',
      colorTheme: 'dark',
      isTransparent: true,
      backgroundColor: 'rgba(0,0,0,0)',
      widgetFontColor: '#DBDBDB',
      gridLineColor: 'rgba(255,255,255,0.06)',
      locale: 'pl',
      changeMode: 'price-and-percent',
    } as const;
    script.innerHTML = JSON.stringify(config);

    el.appendChild(widgetContainer);
    el.appendChild(attr);
    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
  }, [source]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
      <div className="mb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Emocje rynku — US100 (CFD)</h2>
            <p className="mt-1 text-sm text-white/70">
              Wzrost = euforia / risk-on. Spadek = panika / risk-off. (Edukacyjnie: syntetyczny odczyt nastroju na bazie indeksu US100/NAS100.)
            </p>
          </div>
          <div className="shrink-0">
            <label className="block text-[11px] text-white/60 mb-1">Źródło:</label>
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setSource('OANDA')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${source === 'OANDA' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={source === 'OANDA'}
              >
                OANDA
              </button>
              <button
                type="button"
                onClick={() => setSource('CAPITALCOM')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${source === 'CAPITALCOM' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={source === 'CAPITALCOM'}
              >
                Capital.com
              </button>
              <button
                type="button"
                onClick={() => setSource('FX')}
                className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-md ${source === 'FX' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
                aria-pressed={source === 'FX'}
              >
                FX
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-2 overflow-hidden">
        <div ref={containerRef} className="w-full min-h-[360px] h-full tradingview-widget-container" />
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70 shrink-0">Panika</span>
          <div className="relative h-1 w-full rounded bg-white/10">
            <div className="absolute inset-0 rounded bg-gradient-to-r from-white/40 via-white/25 to-white/40 opacity-70" />
          </div>
          <span className="text-xs text-white/70 shrink-0">Euforia</span>
        </div>
      </div>
    </section>
  );
}


