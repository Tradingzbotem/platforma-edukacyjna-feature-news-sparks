"use client";

import { useEffect, useRef } from "react";

type Props = {
  symbol: string;
};

const CHART_HEIGHT = 500;

/**
 * Advanced Chart embed — ta sama struktura DOM i parametry co `TradingViewAdvancedEmbed`
 * (wrap + support_host), żeby iframe TV inicjalizował się przewidywalnie w Next.js.
 */
export default function TradingViewChart({ symbol }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    el.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container__widget";
    wrap.style.height = "100%";
    wrap.style.width = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      width: "100%",
      height: CHART_HEIGHT,
      symbol,
      interval: "240",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "pl",
      hide_top_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });

    el.appendChild(wrap);
    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/10">
      <div ref={container} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}
