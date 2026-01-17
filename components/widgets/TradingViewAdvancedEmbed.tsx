'use client';

import { useEffect, useMemo, useRef } from 'react';

type Props = {
  symbol: string; // e.g., 'OANDA:NAS100USD'
  className?: string; // wrapper class
  containerClassName?: string; // class for the tradingview container
};

export default function TradingViewAdvancedEmbed({ symbol, className, containerClassName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heightPx = useMemo(() => {
    if (typeof window === 'undefined') return 640;
    return window.innerWidth < 768 ? 420 : 640;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // cleanup previous
    container.innerHTML = '';
    // ensure container fills parent height if parent provides it
    container.style.height = '100%';
    container.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: heightPx,
      symbol,
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'pl',
      hide_side_toolbar: true,
      withdateranges: true,
      allow_symbol_change: false,
      details: false,
      hotlist: false,
      calendar: false,
      studies: [],
      support_host: 'https://www.tradingview.com',
    });
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container__widget';
    wrap.style.height = '100%';
    wrap.style.width = '100%';
    // TradingView expects script appended directly inside the container element
    container.appendChild(wrap);
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, heightPx]);

  return (
    <div className={className} style={{ height: heightPx, width: '100%' }}>
      <div
        ref={containerRef}
        className={`tradingview-widget-container ${containerClassName ?? 'h-full w-full'}`}
      />
    </div>
  );
}


