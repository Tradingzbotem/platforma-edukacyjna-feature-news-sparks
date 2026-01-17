// app/components/TickerFinnhub.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  symbols?: string[];         // opcjonalnie możesz nadpisać listę
  className?: string;
  speedSec?: number;          // szybkość przesuwu (UI), domyślnie 40s
  showPrice?: boolean;        // czy pokazywać cenę – domyślnie NIE (tylko zmiany %)
};

type Quote = {
  price?: number;
  prevClose?: number;
  changePct?: number;
  lastTs?: number;
};
type State = Record<string, Quote>;

const FINNHUB_WS = 'wss://ws.finnhub.io';
const FINNHUB_REST = 'https://finnhub.io/api/v1';

// Skrócona lista - tylko najważniejsze (4 symbole)
const DEFAULT_SYMBOLS = [
  'OANDA:NAS100_USD', // US100
  'OANDA:XAU_USD',    // Złoto
  'OANDA:EUR_USD',    // EUR/USD
  'OANDA:WTICO_USD',  // Ropa WTI
];

// Ładne etykiety
function niceLabel(symbol: string) {
  if (symbol.startsWith('OANDA:')) {
    const core = symbol.replace('OANDA:', '');
    if (core === 'NAS100_USD') return 'us100';
    if (core === 'US500_USD') return 'us500';
    if (core === 'XAU_USD')   return 'złoto';
    if (core === 'WTICO_USD') return 'wti';
    if (core === 'BCO_USD')   return 'brent';
    if (core.includes('_'))   return core.toLowerCase().replace('_', '/'); // np. eur/usd
  }
  return symbol.toLowerCase();
}

function fmtPrice(price?: number) {
  if (price == null || Number.isNaN(price)) return '—';
  return price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerFinnhub({ symbols, className, speedSec = 40, showPrice = false }: Props) {
  // ✅ Obsługa obu nazw zmiennych środowiskowych
  const token =
    process.env.NEXT_PUBLIC_FINNHUB_KEY ??
    process.env.NEXT_PUBLIC_FINNHUB_TOKEN ??
    '';

  // Podpowiedź w konsoli, jeśli brak klucza
  useEffect(() => {
    if (!token) {
      console.warn(
        '[TickerFinnhub] Brak klucza Finnhub. Ustaw NEXT_PUBLIC_FINNHUB_KEY (lub NEXT_PUBLIC_FINNHUB_TOKEN) w .env.local'
      );
    }
  }, [token]);

  const list = symbols && symbols.length ? symbols : DEFAULT_SYMBOLS;

  // Klucz do localStorage (po liście symboli)
  const storageKey = `ticker:finnhub:v1:${list.join(',')}`;

  // Mapowanie symboli OANDA na nazwy assetów używane w override
  const mapSymbolToAsset = (symbol: string): string | null => {
    const s = symbol.toUpperCase();
    if (s === 'OANDA:NAS100_USD') return 'US100';
    if (s === 'OANDA:XAU_USD') return 'XAUUSD';
    if (s === 'OANDA:WTICO_USD') return 'WTI';
    if (s === 'OANDA:BCO_USD') return 'BRENT';
    if (s === 'OANDA:EUR_USD') return 'EURUSD';
    if (s === 'OANDA:USD_JPY') return 'USDJPY';
    if (s === 'OANDA:US500_USD') return 'US500';
    return null;
  };

  // Hardcoded fallback values (używane tylko jeśli override'y nie są dostępne)
  // Z realistycznymi wartościami zmienności, aby nie pokazywać 0% dla nowych użytkowników
  const getHardcodedFallback = (): State => {
    // Realistyczne wartości zmienności dla różnych aktywów (w %)
    const VOLATILITY: Record<string, { min: number; max: number }> = {
      'OANDA:NAS100_USD': { min: -1.5, max: 1.5 },
      'OANDA:XAU_USD': { min: -2.0, max: 2.0 },
      'OANDA:WTICO_USD': { min: -2.5, max: 2.5 },
      'OANDA:BCO_USD': { min: -2.5, max: 2.5 },
      'OANDA:EUR_USD': { min: -0.8, max: 0.8 },
      'OANDA:USD_JPY': { min: -1.2, max: 1.2 },
      'OANDA:US500_USD': { min: -1.2, max: 1.2 },
    };
    
    const BASE: Record<string, { price: number; prevClose: number }> = {
      'OANDA:NAS100_USD': { price: 25445, prevClose: 25445 },
      'OANDA:XAU_USD': { price: 2350, prevClose: 2350 },
      'OANDA:WTICO_USD': { price: 77.2, prevClose: 77.2 },
      'OANDA:BCO_USD': { price: 82.0, prevClose: 82.0 },
      'OANDA:EUR_USD': { price: 1.087, prevClose: 1.087 },
      'OANDA:USD_JPY': { price: 151.72, prevClose: 151.72 },
      'OANDA:US500_USD': { price: 5632, prevClose: 5632 },
    };
    
    const now = Date.now();
    const fallback: State = {};
    
    for (const symbol of list) {
      const base = BASE[symbol];
      const vol = VOLATILITY[symbol];
      if (base && vol) {
        // Generuj losową zmienność w realistycznym zakresie
        const changePct = (Math.random() * (vol.max - vol.min) + vol.min);
        // Oblicz cenę na podstawie zmienności
        const price = base.prevClose * (1 + changePct / 100);
        
        fallback[symbol] = {
          price: Number(price.toFixed(base.price.toString().split('.')[1]?.length || 2)),
          prevClose: base.prevClose,
          changePct: Number(changePct.toFixed(2)),
          lastTs: now - 3600000, // Oznacz jako "stare", aby zostało zaktualizowane
        };
      }
    }
    return fallback;
  };

  // Pobierz fallbackowe wartości z override'ów admina
  const loadOverridesAsFallback = async (): Promise<State> => {
    try {
      const r = await fetch(`/api/quotes/ticker-overrides?symbols=${encodeURIComponent(list.join(','))}`, {
        cache: 'no-store',
      });
      if (!r.ok) return getHardcodedFallback();
      const data = await r.json();
      if (data?.results && typeof data.results === 'object' && Object.keys(data.results).length > 0) {
        return data.results as State;
      }
    } catch {
      // Ignoruj błędy
    }
    // Fallback do hardcoded wartości jeśli override'y nie są dostępne
    return getHardcodedFallback();
  };

  // Hydratacja: pokaż ostatnie znane wartości natychmiast po starcie (perceived performance)
  const [data, setData] = useState<State>(() => {
    if (typeof window === 'undefined') return getHardcodedFallback(); // SSR fallback
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
      // Jeśli nie ma danych w localStorage, użyj hardcoded fallback natychmiast
      return getHardcodedFallback();
    } catch {
      return getHardcodedFallback();
    }
  });

  // Pobierz override'y jako fallback jeśli nie ma danych w localStorage
  // Dla nowych użytkowników pobierz natychmiast, aby pokazać wartości zamiast 0%
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Sprawdź czy mamy już jakieś dane w localStorage
    const raw = window.localStorage.getItem(storageKey);
    const hasCachedData = raw && raw !== '{}';
    
    // Dla nowych użytkowników (brak localStorage) pobierz override'y natychmiast
    // Dla istniejących użytkowników też sprawdź, ale tylko jeśli dane są stare (> 1h)
    if (hasCachedData) {
      try {
        const parsed = JSON.parse(raw) as State;
        const oldestTs = Math.min(...Object.values(parsed).map(q => q.lastTs ?? 0));
        const age = Date.now() - oldestTs;
        // Jeśli dane są świeże (< 1h), nie pobieraj override'ów
        if (age < 3600000) return;
      } catch {
        // Jeśli nie można sparsować, pobierz override'y
      }
    }

    let cancelled = false;
    (async () => {
      const fallbackData = await loadOverridesAsFallback();
      if (!cancelled && Object.keys(fallbackData).length > 0) {
        setData((prev) => {
          // Merge: użyj override'ów tylko jeśli nie mamy danych lub są lepsze
          const merged: State = { ...prev };
          for (const [symbol, quote] of Object.entries(fallbackData)) {
            const existing = prev[symbol];
            // Użyj override jeśli nie mamy danych lub jeśli override ma changePct != 0 (lepsze niż 0)
            if (!existing || (existing.changePct === 0 && quote.changePct !== 0)) {
              merged[symbol] = quote;
            }
          }
          return merged;
        });
        // Zapisz też do localStorage dla przyszłych odwiedzin
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(fallbackData));
        } catch {
          // Ignoruj błędy localStorage
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // Tylko raz przy mount
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ tries: number; timer?: any }>({ tries: 0 });
  const inFlightRef = useRef<Set<string>>(new Set());
  const dataRef = useRef<State>(data);

  // Aktualizuj ref przy zmianie data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Debounce zapisu do localStorage, by uniknąć nadmiernych zapisów przy tickach
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        /* noop */
      }
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, storageKey]);

  // Pobierz realne dane z cache'owanego endpointu (aktualizuje się rzadko - co 15 min)
  useEffect(() => {
    if (list.length === 0) return;
    
    let cancelled = false;
    
    const fetchRealData = async () => {
      try {
        const r = await fetch(`/api/quotes/ticker-cached?symbols=${encodeURIComponent(list.join(','))}`, {
          cache: 'no-store',
        });
        if (!r.ok || cancelled) return;
        
        const data = await r.json();
        if (data?.results && typeof data.results === 'object') {
          const realData: State = {};
          for (const [symbol, quote] of Object.entries(data.results)) {
            if (quote && typeof quote === 'object' && 'price' in quote) {
              realData[symbol] = quote as Quote;
            }
          }
          
          if (!cancelled && Object.keys(realData).length > 0) {
            setData((prev) => {
              // Zachowaj istniejące dane jeśli są świeższe, lub użyj nowych
              const merged: State = { ...prev };
              for (const [symbol, quote] of Object.entries(realData)) {
                const existing = prev[symbol];
                // Użyj nowych danych jeśli są świeższe lub jeśli nie mamy danych
                // Ale nie nadpisuj realistycznych wartości zmienności (changePct != 0) danymi z changePct: 0
                if (!existing || !existing.lastTs || (quote.lastTs && quote.lastTs > existing.lastTs)) {
                  // Jeśli nowe dane mają changePct: 0, a stare mają realistyczne wartości, zachowaj stare (chyba że nowe są znacznie nowsze > 5 min)
                  if (quote.changePct === 0 && existing && existing.changePct !== 0) {
                    const ageDiff = quote.lastTs && existing.lastTs ? quote.lastTs - existing.lastTs : 0;
                    // Jeśli różnica wieku jest mniejsza niż 5 minut, zachowaj stare dane z realistyczną zmiennością
                    if (ageDiff < 300000) {
                      merged[symbol] = existing;
                      continue;
                    }
                  }
                  merged[symbol] = quote;
                } else {
                  // Zachowaj istniejące, ale zaktualizuj prevClose jeśli jest dostępne
                  merged[symbol] = {
                    ...existing,
                    prevClose: quote.prevClose ?? existing.prevClose,
                  };
                }
              }
              return merged;
            });
          }
        }
      } catch {
        // Ignoruj błędy - użyj symulacji
      }
    };
    
    // Pobierz od razu
    fetchRealData();
    
    // Aktualizuj co 60 sekund (rzadko, aby nie przekraczać limitów)
    const interval = setInterval(fetchRealData, 60000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [list]);

  // Symulacja zmienności - tylko lekkie wahania wokół realnych danych
  useEffect(() => {
    if (list.length === 0) return;
    
    // Symuluj bardzo małe wahania wokół realnych danych
    const simulateVolatility = () => {
      setData((prev) => {
        const next: State = { ...prev };
        const now = Date.now();
        
        for (const symbol of list) {
          const existing = prev[symbol];
          if (!existing || !existing.price || !existing.prevClose) continue;
          
          // Bardzo małe wahania: ±0.1% (tylko dla efektu wizualnego)
          const drift = (Math.random() - 0.5) * 0.2; // ±0.1%
          
          // Nowa cena = poprzednia cena + bardzo mała zmiana
          const newPrice = existing.price * (1 + drift / 100);
          
          // Zmiana % zawsze względem stałej bazy (prevClose)
          let changePct = existing.prevClose > 0
            ? ((newPrice - existing.prevClose) / existing.prevClose) * 100
            : existing.changePct ?? 0;
          
          // Walidacja: ogranicz nierealistyczne zmiany (max ±15% dla ropy, ±5% dla forex, ±10% dla innych)
          const isOil = symbol.includes('WTICO') || symbol.includes('BCO');
          const isForex = symbol.includes('EUR') || symbol.includes('USD') || symbol.includes('JPY') || symbol.includes('GBP');
          const maxChange = isOil ? 15 : isForex ? 5 : 10;
          
          if (Math.abs(changePct) > maxChange) {
            // Jeśli symulowana zmiana jest nierealistyczna, zachowaj poprzednią wartość
            changePct = existing.changePct ?? 0;
          }
          
          next[symbol] = {
            price: newPrice,
            prevClose: existing.prevClose, // Zawsze ta sama baza
            changePct: Number(changePct.toFixed(2)),
            lastTs: now,
          };
        }
        
        return next;
      });
    };
    
    // Aktualizuj co 10 sekund (rzadziej niż wcześniej)
    const interval = setInterval(simulateVolatility, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [list]);

  // WebSocket live - opcjonalnie, jeśli token jest dostępny (ale nie wymagane)
  useEffect(() => {
    if (!token || list.length === 0) return;

    const connect = () => {
      try {
        const ws = new WebSocket(`${FINNHUB_WS}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectRef.current.tries = 0;
          list.forEach((s) => ws.send(JSON.stringify({ type: 'subscribe', symbol: s })));
        };

        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'trade' && Array.isArray(msg.data)) {
              const last = msg.data[msg.data.length - 1];
              const s: string | undefined = last?.s;
              const p: number | undefined = last?.p;
              const t: number | undefined = last?.t;
              if (s && typeof p === 'number') {
                setData((prev) => {
                  const existing = prev[s];
                  // Użyj istniejącego prevClose lub ustaw aktualną cenę jako bazę (tylko raz)
                  const prevClose = existing?.prevClose ?? p;
                  let changePct =
                    prevClose != null && prevClose !== 0 ? ((p - prevClose) / prevClose) * 100 : (existing?.changePct ?? 0);
                  
                  // Walidacja: ogranicz nierealistyczne zmiany (max ±15% dla ropy, ±5% dla forex, ±10% dla innych)
                  const isOil = s.includes('WTICO') || s.includes('BCO');
                  const isForex = s.includes('EUR') || s.includes('USD') || s.includes('JPY') || s.includes('GBP');
                  const maxChange = isOil ? 15 : isForex ? 5 : 10;
                  
                  if (Math.abs(changePct) > maxChange) {
                    // Jeśli zmiana jest nierealistyczna, zachowaj poprzednią wartość lub ogranicz
                    if (existing?.changePct != null && Math.abs(existing.changePct) <= maxChange) {
                      changePct = existing.changePct;
                    } else {
                      changePct = Math.max(-maxChange, Math.min(maxChange, changePct));
                    }
                  }
                  
                  return { ...prev, [s]: { price: p, prevClose, changePct, lastTs: t ?? Date.now() } };
                });
              }
            }
          } catch { /* noop */ }
        };

        ws.onerror = () => {
          try { ws.close(); } catch {}
        };
        ws.onclose = () => {
          // Nie próbuj reconnectować - używamy symulacji
        };
      } catch {
        // Ignoruj błędy WebSocket
      }
    };

    connect();
    return () => {
      try {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          list.forEach((s) => ws.send(JSON.stringify({ type: 'unsubscribe', symbol: s })));
        }
        ws?.close();
      } catch {}
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
    };
  }, [list, token]);

  // UI — ciągły marquee bez scrollbara - tylko zmiany % (wszystko w jednej linii)
  const items = useMemo(() => {
    return list.map((s) => {
      const q = data[s] ?? {};
      const label = niceLabel(s);
      const changePct = q.changePct ?? 0;
      const up = changePct >= 0;

      return (
        <div key={s} className="flex items-center gap-1.5 px-2.5 py-2 border-r border-white/10">
          <span className="text-xs text-white/70 uppercase font-semibold">{label}</span>
          <span className={`text-xs font-medium ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {up ? '▲' : '▼'}
          </span>
          <span className={`text-xs font-medium ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.abs(changePct).toFixed(2)}%
          </span>
        </div>
      );
    });
  }, [list, data, showPrice]);

  // Utwórz wystarczającą liczbę kopii dla płynnego zapętlenia (zawsze 3 kopie)
  const copies = 3;
  const allItems = useMemo(() => {
    return Array.from({ length: copies }, (_, i) => (
      <div key={`copy-${i}`} className="inline-flex items-center">
        {items}
      </div>
    ));
  }, [items]);

  return (
    <div className={`w-full bg-black/20 ${className || ''}`}>
      <div className="mx-auto max-w-7xl overflow-hidden relative">
        <div
          className="inline-flex will-change-transform whitespace-nowrap"
          style={{ animation: `tickerScroll ${Math.max(20, speedSec)}s linear infinite` }}
        >
          {allItems}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-900 to-transparent" />
      </div>

      <style jsx>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-${100 / copies}%); }
        }
      `}</style>
    </div>
  );
}
