'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';

/* ───────────────────────── POMOCNICZE ───────────────────────── */
function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-slate-300">{label}</div>
      {children}
      {help ? <div className="mt-1 text-xs text-slate-400">{help}</div> : null}
    </label>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">{children}</div>;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30"
    />
  );
}

/** Input akceptujący kropkę i przecinek; poprawne typy dla TS. */
type DecimalInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> & {
  value: string;
  onChange: (v: string) => void;
};
function DecimalInput({ value, onChange, className, ...rest }: DecimalInputProps) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-1 focus:ring-white/30 ${className ?? ''}`}
    />
  );
}

/** Parser „1 234,56”/„1234.56” → number */
const parseDec = (s: string): number => {
  if (s == null) return NaN;
  const n = s.replace(/\s/g, '').replace(',', '.');
  return Number(n);
};
const clampLots = (v: number) => Math.min(100, Math.max(0.01, Number.isFinite(v) ? v : 0));
const fmtPL = (n: number, frac = 4) => n.toLocaleString('pl-PL', { maximumFractionDigits: frac });

/* ─────────────────── SPECYFIKACJA INSTRUMENTÓW ───────────────────
   contractSize – wartość 1.0 zmiany ceny dla 1.00 lota (w walucie ceny)
   pipSize      – krok/punkt (0.0001 dla EURUSD, 0.01 dla USDJPY, 0.1 dla XAUUSD, 1 dla indeksów)
   priceCcy     – waluta ceny (jeśli ≠ waluta konta, pokażemy pole przelicznika).
-------------------------------------------------------------------*/
type SymbolDef = {
  symbol: string;
  name: string;
  contractSize: number;
  pipSize: number;
  priceCcy: 'USD' | 'EUR' | 'PLN' | 'JPY';
  note?: string;
};

const FX: SymbolDef[] = [
  { symbol: 'EURUSD', name: 'EUR/USD', contractSize: 100_000, pipSize: 0.0001, priceCcy: 'USD', note: '1 lot = 100 000 EUR; 1 pip = 0.0001' },
  { symbol: 'GBPUSD', name: 'GBP/USD', contractSize: 100_000, pipSize: 0.0001, priceCcy: 'USD' },
  { symbol: 'USDJPY', name: 'USD/JPY', contractSize: 100_000, pipSize: 0.01,   priceCcy: 'JPY', note: '1 pip = 0.01' },
  { symbol: 'USDPLN', name: 'USD/PLN', contractSize: 100_000, pipSize: 0.0001, priceCcy: 'PLN' },
];

const INDICES: SymbolDef[] = [
  { symbol: 'US500', name: 'S&P 500',      contractSize: 50, pipSize: 1.0, priceCcy: 'USD', note: '1 lot = 50 × cena (1 pkt = 50 USD)' },
  { symbol: 'US100', name: 'Nasdaq 100',   contractSize: 20, pipSize: 1.0, priceCcy: 'USD', note: '1 lot = 20 × cena' },
  { symbol: 'US30',  name: 'Dow Jones 30', contractSize: 10, pipSize: 1.0, priceCcy: 'USD' },
  { symbol: 'DE40',  name: 'DAX (DE40)',   contractSize: 25, pipSize: 1.0, priceCcy: 'EUR', note: '1 lot = 25 × cena' },
];

const COMMODITIES: SymbolDef[] = [
  { symbol: 'XAUUSD', name: 'Złoto (XAU/USD)', contractSize: 100,  pipSize: 0.1,  priceCcy: 'USD', note: '1 lot = 100 oz; 0.1 = 10 USD' },
  { symbol: 'XTIUSD', name: 'Ropa WTI',        contractSize: 1000, pipSize: 0.01, priceCcy: 'USD', note: '1 lot = 1000 baryłek' },
];

const SYMBOL_GROUPS = { forex: FX, indices: INDICES, commodities: COMMODITIES } as const;
type GroupKey = keyof typeof SYMBOL_GROUPS;

/* ───────────────────────── STRONA /symulator ───────────────────────── */
export default function SimulatorPage() {
  const [accountCurrency, setAccountCurrency] = useState<'USD' | 'EUR' | 'PLN'>('USD');
  const [group, setGroup] = useState<GroupKey>('forex');
  const [symbol, setSymbol] = useState<SymbolDef>(SYMBOL_GROUPS['forex'][0]);

  // pola kalkulatora margin/P&L – akceptują kropkę/przecinek
  const [lotsStr, setLotsStr] = useState<string>('1');
  const [levStr, setLevStr] = useState<string>('30');
  const [entryStr, setEntryStr] = useState<string>(''); // opcjonalnie
  const [exitStr, setExitStr] = useState<string>('');   // opcjonalnie
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [convStr, setConvStr] = useState<string>('1');  // 1 priceCcy = X accountCurrency

  const onChangeGroup = (g: GroupKey) => {
    setGroup(g);
    const s = SYMBOL_GROUPS[g][0];
    setSymbol(s);
    setEntryStr('');
    setExitStr('');
    setConvStr('1');
  };
  const onChangeSymbol = (sym: string) => {
    const s = SYMBOL_GROUPS[group].find((x) => x.symbol === sym)!;
    setSymbol(s);
    setEntryStr('');
    setExitStr('');
    setConvStr('1');
  };

  // snapshot po „Oblicz” (główny kalkulator margin+P/L)
  const [snap, setSnap] = useState<null | {
    sym: SymbolDef; lots: number; lev: number; entry?: number; exit?: number; conv: number; side: 'buy'|'sell'; accountCcy: 'USD'|'EUR'|'PLN';
  }>(null);

  const onCalculate = () => {
    const lots = clampLots(parseDec(lotsStr));
    const levRaw = parseDec(levStr);
    const lev = Number.isFinite(levRaw) && levRaw > 0 ? levRaw : 1;

    const entryNum = parseDec(entryStr);
    const exitNum = parseDec(exitStr);
    const entry = Number.isFinite(entryNum) && entryNum > 0 ? entryNum : undefined;
    const exit = Number.isFinite(exitNum) && exitNum > 0 ? exitNum : undefined;

    const convParsed = parseDec(convStr);
    const conv = symbol.priceCcy === accountCurrency ? 1 : (Number.isFinite(convParsed) && convParsed > 0 ? convParsed : 1);

    setSnap({ sym: symbol, lots, lev, entry, exit, conv, side, accountCcy: accountCurrency });
  };

  const results = useMemo(() => {
    if (!snap) return null;
    const { sym, lots, lev, entry, exit, conv, side } = snap;

    const contractSizeTotal = sym.contractSize * lots;
    const px = entry ?? 1;

    const notionalPrice = contractSizeTotal * px;
    const notionalAcct  = notionalPrice * conv;
    const marginPrice   = notionalPrice / (lev || 1);
    const marginAcct    = marginPrice * conv;

    const pipValuePrice = contractSizeTotal * sym.pipSize;
    const pipValueAcct  = pipValuePrice * conv;

    let pnlPrice: number | undefined;
    let pnlAcct: number | undefined;
    let movePts: number | undefined;
    let movePips: number | undefined;
    if (typeof entry === 'number' && typeof exit === 'number') {
      const diff = side === 'buy' ? exit - entry : entry - exit;
      movePts  = diff;
      movePips = sym.pipSize ? diff / sym.pipSize : undefined;
      pnlPrice = diff * contractSizeTotal;
      pnlAcct  = pnlPrice * conv;
    }

    return { pipValuePrice, pipValueAcct, notionalPrice, notionalAcct, marginPrice, marginAcct, movePts, movePips, pnlPrice, pnlAcct };
  }, [snap]);

  /* ───────── PROSTY KALKULATOR WIELKOŚCI POZYCJI (kontrakt × cena ÷ dźwignia) ───────── */
  const [psPriceStr, setPsPriceStr] = useState<string>('');        // CENA INSTRUMENTU, np. 23472
  const [psContractStr, setPsContractStr] = useState<string>('20'); // WIELKOŚĆ KONTRAKTU, np. 20 (US100)
  const [psLevStr, setPsLevStr] = useState<string>('100');         // DŹWIGNIA, np. 100
  const [psCcy, setPsCcy] = useState<'USD'|'EUR'|'PLN'>('USD');

  const [psSnap, setPsSnap] = useState<null | { price: number; contract: number; leverage: number; product: number; margin: number; ccy: 'USD'|'EUR'|'PLN' }>(null);

  const onCalcSimpleSize = () => {
    const price    = Math.max(0, parseDec(psPriceStr));
    const contract = Math.max(0, parseDec(psContractStr));
    const lev      = Math.max(1, parseDec(psLevStr) || 1);

    const product = price * contract;       // etap 1: cena × kontrakt
    const margin  = product / lev;          // etap 2: / dźwignia

    setPsSnap({ price, contract, leverage: lev, product, margin, ccy: psCcy });
  };

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">
          <span aria-hidden="true">←</span> Strona główna
        </Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Kalkulator pozycji, marginu i P/L</h1>
      <p className="mt-2 text-slate-300">
        Prosty, profesjonalny kalkulator w stylu rozwiązań spotykanych w platformach
        <span className="inline-flex items-center gap-1 px-2 py-0.5 ml-1 rounded-md bg-white/10 border border-white/10 text-xs">MT4</span>
        i
        <span className="inline-flex items-center gap-1 px-2 py-0.5 ml-1 rounded-md bg-white/10 border border-white/10 text-xs">xStation</span>.
        Oblicza <span className="font-semibold">wymagany margin</span>, <span className="font-semibold">P/L</span> dla podanego ruchu ceny oraz
        <span className="font-semibold"> wielkość pozycji</span> wg zadanego wzoru. Materiał czysto edukacyjny – bez porad inwestycyjnych.
      </p>

      {/* GŁÓWNY KALKULATOR: margin + P/L */}
      <div className="mt-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Parametry pozycji (margin + P/L)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Waluta konta">
              <Select value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value as any)} aria-label="Waluta konta">
                <option>USD</option><option>EUR</option><option>PLN</option>
              </Select>
            </Field>

            <Field label="Typ instrumentu">
              <Select value={group} onChange={(e) => onChangeGroup(e.target.value as GroupKey)} aria-label="Typ instrumentu">
                <option value="forex">Forex</option>
                <option value="indices">Indeksy CFD</option>
                <option value="commodities">Surowce CFD</option>
              </Select>
            </Field>

            <Field label="Instrument">
              <Select value={symbol.symbol} onChange={(e) => onChangeSymbol(e.target.value)} aria-label="Instrument">
                {SYMBOL_GROUPS[group].map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} — {s.symbol}
                  </option>
                ))}
              </Select>
              {symbol.note ? <div className="mt-1 text-xs text-slate-400">{symbol.note}</div> : null}
            </Field>

            <Field label="Dźwignia (1:x)">
              <DecimalInput value={levStr} onChange={setLevStr} placeholder="np. 30" />
            </Field>

            <Field label="Wielkość pozycji (loty)" help="Min 0,01 i max 100. Możesz wpisać 0.1 lub 0,1.">
              <DecimalInput value={lotsStr} onChange={setLotsStr} placeholder="np. 0.10" />
            </Field>

            {symbol.priceCcy !== accountCurrency && (
              <Field
                label={`Przelicznik: 1 ${symbol.priceCcy} = X ${accountCurrency}`}
                help="Wpisz kurs przeliczenia waluty ceny na walutę konta."
              >
                <DecimalInput value={convStr} onChange={setConvStr} placeholder="np. 1.08" />
              </Field>
            )}

            <Field label="Cena otwarcia (opcjonalnie)">
              <DecimalInput value={entryStr} onChange={setEntryStr} placeholder="np. 3400" />
            </Field>

            <Field label="Cena zamknięcia (opcjonalnie)">
              <DecimalInput value={exitStr} onChange={setExitStr} placeholder="np. 3600" />
            </Field>

            <Field label="Kierunek">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={side === 'buy'}
                  onClick={() => setSide('buy')}
                  className={`px-3 py-2 rounded-lg border border-white/10 ${side === 'buy' ? 'bg-emerald-400 text-slate-900 font-semibold' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  Kup
                </button>
                <button
                  type="button"
                  aria-pressed={side === 'sell'}
                  onClick={() => setSide('sell')}
                  className={`px-3 py-2 rounded-lg border border-white/10 ${side === 'sell' ? 'bg-rose-400 text-slate-900 font-semibold' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  Sprzedaj
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-4">
            <button
              onClick={onCalculate}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90"
              aria-label="Oblicz margin i P/L"
            >
              Oblicz
            </button>
          </div>

          <hr className="my-5 border-white/10" />

          {!snap ? (
            <p className="text-sm text-white/60">Uzupełnij dane i kliknij „Oblicz”.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="font-semibold mb-2">Wielkość pozycji i margin</h3>
                <ul className="text-sm space-y-1 text-slate-200">
                  <li>
                    Wartość nominalna pozycji:{' '}
                    <span className="font-semibold">
                      {fmtPL(results!.notionalAcct!, 2)} {snap.accountCcy}
                    </span>{' '}
                    <span className="text-white/50">(w walucie ceny: {fmtPL(results!.notionalPrice!, 2)} {snap.sym.priceCcy})</span>
                  </li>
                  <li>
                    Wymagany margin:{' '}
                    <span className="font-semibold">
                      {fmtPL(results!.marginAcct!, 2)} {snap.accountCcy}
                    </span>{' '}
                    <span className="text-white/50">(w walucie ceny: {fmtPL(results!.marginPrice!, 2)} {snap.sym.priceCcy})</span>
                  </li>
                  <li>
                    Wartość 1 pipsa/punktu (dla całej pozycji):{' '}
                    <span className="font-semibold">
                      {fmtPL(results!.pipValueAcct!, 4)} {snap.accountCcy}
                    </span>{' '}
                    <span className="text-white/50">(w walucie ceny: {fmtPL(results!.pipValuePrice!, 4)} {snap.sym.priceCcy})</span>
                  </li>
                </ul>
                <p className="mt-2 text-xs text-white/60">
                  Wzór marginu: <code>(contractSize × loty × cena wejścia) / dźwignia</code>. Gdy cena wejścia nie jest podana,
                  przyjmujemy 1 dla celów poglądowych.
                </p>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="font-semibold mb-2">P/L dla zadanego ruchu</h3>
                {typeof results?.pnlAcct === 'number' ? (
                  <ul className="text-sm space-y-1 text-slate-200">
                    <li>
                      Zmiana ceny:{' '}
                      <span className="font-semibold">{fmtPL(results!.movePts!, 5)}</span>{' '}
                      <span className="text-white/50">(~ {fmtPL(results!.movePips!, 1)} pipsów/pkt)</span>
                    </li>
                    <li>
                      P/L:{' '}
                      <span className={`font-semibold ${results!.pnlAcct! >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {fmtPL(results!.pnlAcct!, 2)} {snap.accountCcy}
                      </span>{' '}
                      <span className="text-white/50">(w walucie ceny: {fmtPL(results!.pnlPrice!, 2)} {snap.sym.priceCcy})</span>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-white/60">Podaj cenę otwarcia i zamknięcia, aby policzyć P/L.</p>
                )}
                <p className="mt-2 text-xs text-white/60">Nie uwzględniamy prowizji, swapu ani poślizgu.</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* PROSTA WIELKOŚĆ POZYCJI (wg Twojego wzoru) */}
      <div className="mt-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Wielkość pozycji (prosty wzór)</h2>
          <p className="text-sm text-white/70 mb-4">
            Wzór: <code>(Cena instrumentu × Wielkość kontraktu) ÷ Dźwignia</code>. Przykład dla <span className="font-semibold">US100</span>:
            1 lot zwykle odpowiada kontraktowi <span className="font-semibold">20</span> × cena.
          </p>

          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Cena instrumentu">
              <DecimalInput value={psPriceStr} onChange={setPsPriceStr} placeholder="np. 23472" />
            </Field>
            <Field label="Wielkość kontraktu (na 1 lot)">
              <DecimalInput value={psContractStr} onChange={setPsContractStr} placeholder="np. 20" />
            </Field>
            <Field label="Dźwignia (1:x)">
              <DecimalInput value={psLevStr} onChange={setPsLevStr} placeholder="np. 100" />
            </Field>
            <Field label="Waluta wyniku">
              <Select value={psCcy} onChange={(e) => setPsCcy(e.target.value as any)} aria-label="Waluta wyniku">
                <option>USD</option><option>EUR</option><option>PLN</option>
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <button
              onClick={onCalcSimpleSize}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:opacity-90"
              aria-label="Oblicz wielkość pozycji"
            >
              Oblicz
            </button>
          </div>

          {psSnap ? (
            <>
              <hr className="my-5 border-white/10" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h3 className="font-semibold mb-2">Wynik</h3>
                  <div className="text-2xl font-bold">
                    {fmtPL(psSnap.margin, 2)} {psSnap.ccy}
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Szacunkowa kwota potrzebna do otwarcia pozycji (dla 1.00 lota).
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h3 className="font-semibold mb-2">Równanie (kroki obliczeń)</h3>
                  <p className="text-sm">
                    {fmtPL(psSnap.price, 4)} × {fmtPL(psSnap.contract, 4)} ={' '}
                    <span className="font-semibold">{fmtPL(psSnap.product, 2)}</span>
                  </p>
                  <p className="text-sm">
                    {fmtPL(psSnap.product, 2)} ÷ {fmtPL(psSnap.leverage, 2)} ={' '}
                    <span className="font-semibold">{fmtPL(psSnap.margin, 2)} {psSnap.ccy}</span>
                  </p>
                </div>
              </div>
            </>
          ) : null}

          <p className="mt-4 text-xs text-white/60">
            Uwaga: dla innych instrumentów wstaw właściwy mnożnik kontraktu (np. US500: 50, DE40: 25, XAUUSD: 100).
            Wzór jest poglądowy, nie uwzględnia prowizji, swapu ani poślizgów.
          </p>
        </Card>
      </div>

      <div className="mt-6 text-xs text-white/60">
        Wyniki służą wyłącznie celom edukacyjnym i nie stanowią rekomendacji inwestycyjnych.
      </div>
    </main>
  );
}
