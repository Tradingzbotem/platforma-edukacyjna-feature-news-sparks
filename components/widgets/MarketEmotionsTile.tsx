'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  symbol?: string;
  title?: string;
};

const EMO_SYMBOL = "NASDAQ:QQQ"; // Alternatives: "AMEX:SPY", "SP:SPX", "NASDAQ:NDX"

export default function MarketEmotionsTile({ symbol = EMO_SYMBOL, title }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Clear any prior render to avoid duplicate widgets
    el.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const attr = document.createElement('div');
    attr.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = symbolToTvLink(symbol);
    link.rel = 'noopener nofollow';
    link.target = '_blank';
    link.textContent = symbol;
    attr.appendChild(link);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    const config = {
      symbols: [[`${symbol}|1D`]],
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
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      colorTheme: 'dark',
      backgroundColor: 'rgba(0,0,0,0)',
      gridLineColor: 'rgba(255,255,255,0.08)',
      lineColor: 'rgba(59,130,246,0.9)', // subtle blue
      topColor: 'rgba(59,130,246,0.25)',
      bottomColor: 'rgba(59,130,246,0.01)',
      locale: 'pl',
      changeMode: 'price-and-percent',
    } as const;
    script.innerHTML = JSON.stringify(config);

    el.appendChild(widgetContainer);
    el.appendChild(attr);
    el.appendChild(script);

    return () => {
      // Cleanup on unmount or symbol change
      el.innerHTML = '';
    };
  }, [symbol]);

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-5 transition-colors hover:bg-white/10">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">
          {title ?? 'Emocje rynku — US100 (proxy)'}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          To edukacyjny proxy na zachowanie rynku USA. Wzrost = euforia / risk-on. Spadek = panika / risk-off.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-2 overflow-hidden">
        <div ref={containerRef} className="w-full min-h-[300px] md:min-h-[320px] h-full tradingview-widget-container" />
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70 shrink-0">Panika</span>
          <div className="relative h-1 w-full rounded bg-white/10">
            <div className="absolute inset-0 rounded bg-gradient-to-r from-white/40 via-white/25 to-white/40 opacity-70" />
          </div>
          <span className="text-xs text-white/70 shrink-0">Euforia</span>
        </div>
        <div className="mt-2 text-[11px] text-white/50">
          Proxy: wykres ETF/indeksu użyty zamiast US100/VIX w embedach TradingView.
        </div>
      </div>
    </section>
  );
}

function symbolToTvLink(sym: string): string {
  // Convert "EXCHANGE:SYMBOL" -> "EXCHANGE-SYMBOL" for TradingView symbol page
  const safe = String(sym || '').toUpperCase();
  if (safe.includes(':')) {
    const [ex, s] = safe.split(':', 2);
    return `https://www.tradingview.com/symbols/${ex}-${s}/`;
  }
  // Default fallback (QQQ)
  return 'https://www.tradingview.com/symbols/NASDAQ-QQQ/';
}


