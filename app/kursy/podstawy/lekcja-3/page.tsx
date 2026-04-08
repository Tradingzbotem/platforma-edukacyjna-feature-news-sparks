'use client';

import { useEffect, useMemo, useState } from "react";
import LessonVisitTracker from "@/components/LessonVisitTracker";
import {
  PodstawyCallout,
  PodstawyChecklist,
  PodstawySection,
} from "@/components/podstawy/content";
import PodstawyLessonShell, {
  PodstawyLessonHeaderActions,
} from "@/components/podstawy/PodstawyLessonShell";
import { useLessonProgressSession } from "@/app/contexts/LessonProgressSessionContext";
import { readPodstawyDoneSlugSet, writePodstawyDoneSlugArray } from "@/lib/lessonProgressStorage";
import { pushPodstawyLessonProgress } from "@/lib/podstawyLessonProgressSync";

const SLUG = "lekcja-3";

/** Typy pomocnicze dla asystenta */
type Side = "long" | "short";
type Scenario = "breakout" | "pullback";
type Priority = "fill" | "price";

/** Prosta rekomendacja typu zlecenia */
function recommendOrder(side: Side, scenario: Scenario, priority: Priority, current: number, entry: number) {
  const dir = entry > current ? "above" : entry < current ? "below" : "equal";

  // podstawa: breakout = zlecenie STOP, pullback = LIMIT
  if (scenario === "breakout") {
    if (priority === "fill") {
      return side === "long"
        ? { type: "Buy Stop", why: "Chcesz dołączyć do wybicia powyżej bieżącej ceny i priorytetem jest pewne wykonanie." }
        : { type: "Sell Stop", why: "Chcesz dołączyć do wybicia w dół poniżej bieżącej ceny i priorytetem jest pewne wykonanie." };
    } else {
      return side === "long"
        ? { type: "Buy Stop-Limit", why: "Wybicie + kontrola maks. ceny (Stop wyzwala, Limit ustawia maks. akceptowalną cenę)." }
        : { type: "Sell Stop-Limit", why: "Wybicie w dół + kontrola minimalnej akceptowalnej ceny po aktywacji." };
    }
  }

  // pullback / mean reversion → LIMIT
  if (scenario === "pullback") {
    return side === "long"
      ? { type: "Buy Limit", why: "Kupno na cofnięciu (poniżej bieżącej ceny) – chcesz lepszą cenę od rynku." }
      : { type: "Sell Limit", why: "Sprzedaż na podbiciu (powyżej bieżącej ceny) – chcesz lepszą cenę od rynku." };
  }

  // fallback (lub gdy entry == current)
  if (priority === "fill") {
    return { type: "Market", why: "Potrzebujesz natychmiastowego wejścia po cenie rynkowej (akceptujesz poślizg)." };
  }
  // jeśli jakiś dziwny układ – podpowiedz STOP/LIMIT względem położenia ceny
  if (dir === "above") {
    return side === "long"
      ? { type: "Buy Stop", why: "Cena wejścia jest powyżej bieżącej – to scenariusz wybicia." }
      : { type: "Sell Limit", why: "Dla shorta powyżej bieżącej – sprzedajesz z Limit." };
  }
  if (dir === "below") {
    return side === "long"
      ? { type: "Buy Limit", why: "Dla longa poniżej bieżącej – kupno z Limit na cofnięciu." }
      : { type: "Sell Stop", why: "Dla shorta poniżej bieżącej – wejście na wybicie w dół." };
  }
  return { type: "Market", why: "Brak przewagi kierunkowej – jeśli musisz wejść teraz, użyj Market." };
}

/** Kalkulator kosztu wejścia i R:R */
function useEntryCostAndRR({
  spreadPips,
  slipPips,
  lots,
  pipValuePerLot,
  slPips,
  tpPips,
}: {
  spreadPips: number;
  slipPips: number;
  lots: number;
  pipValuePerLot: number;
  slPips: number;
  tpPips: number;
}) {
  const pipValue = (pipValuePerLot || 0) * (lots || 0);
  const entryCostCash = useMemo(() => (Math.max(0, spreadPips) + Math.max(0, slipPips)) * pipValue, [spreadPips, slipPips, pipValue]);
  const riskCash = useMemo(() => Math.max(0, slPips) * pipValue, [slPips, pipValue]);
  const rewardCash = useMemo(() => Math.max(0, tpPips) * pipValue, [tpPips, pipValue]);
  const rr = useMemo(() => (riskCash ? rewardCash / riskCash : 0), [rewardCash, riskCash]);
  const entryCostInR = useMemo(() => (riskCash ? entryCostCash / riskCash : 0), [entryCostCash, riskCash]);

  return { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR };
}

export default function Page() {
  const { userId, sessionReady } = useLessonProgressSession();
  const [done, setDone] = useState(false);

  /** Asystent – stany */
  const [side, setSide] = useState<Side>("long");
  const [scenario, setScenario] = useState<Scenario>("breakout");
  const [priority, setPriority] = useState<Priority>("fill");
  const [current, setCurrent] = useState<number>(1.085);
  const [entry, setEntry] = useState<number>(1.090);

  const rec = useMemo(
    () => recommendOrder(side, scenario, priority, current, entry),
    [side, scenario, priority, current, entry]
  );

  /** Kalkulator – stany */
  const [spreadPips, setSpreadPips] = useState<number>(0.8);
  const [slipPips, setSlipPips] = useState<number>(0.2);
  const [lots, setLots] = useState<number>(0.30);
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // np. EURUSD dla konta w USD
  const [slPips, setSlPips] = useState<number>(12);
  const [tpPips, setTpPips] = useState<number>(18);

  const { pipValue, entryCostCash, riskCash, rewardCash, rr, entryCostInR } = useEntryCostAndRR({
    spreadPips,
    slipPips,
    lots,
    pipValuePerLot,
    slPips,
    tpPips,
  });

  useEffect(() => {
    if (!sessionReady) return;
    try {
      setDone(readPodstawyDoneSlugSet(localStorage, userId).has(SLUG));
    } catch {}
  }, [userId, sessionReady]);

  const toggle = () => {
    if (!sessionReady) return;
    try {
      const arr = Array.from(readPodstawyDoneSlugSet(localStorage, userId));
      const next = done ? arr.filter(s => s !== SLUG) : Array.from(new Set([...arr, SLUG]));
      writePodstawyDoneSlugArray(localStorage, userId, next);
      setDone(!done);
      pushPodstawyLessonProgress(SLUG, !done, userId);
    } catch {}
  };

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400/40";

  return (
    <PodstawyLessonShell
      lessonNumber={3}
      title="Rodzaje zleceń"
      lead="Market, Limit, Stop, Stop-Limit, OCO, TIF (GTC/Day/IOC/FOK) — czym się różnią, kiedy ich używać i jak minimalizować poślizg."
      prevHref="/kursy/podstawy/lekcja-2"
      nextHref="/kursy/podstawy/lekcja-4"
      tracker={<LessonVisitTracker course="podstawy" lessonId={SLUG} />}
      actions={<PodstawyLessonHeaderActions done={done} onToggle={toggle} />}
    >
      <PodstawySection title="Przegląd typów zleceń">
        <ul>
          <li>
            <strong>Market</strong> — natychmiastowa realizacja po dostępnej cenie rynkowej. Plus: pewne wykonanie. Minus: możliwy{" "}
            <em>poślizg</em> (różnica między ceną na klik a faktycznym fill).
          </li>
          <li>
            <strong>Limit</strong> — wykonanie po wskazanej lub lepszej cenie. Dla longa:{" "}
            <em>Buy Limit</em> (poniżej rynku), dla shorta: <em>Sell Limit</em> (powyżej rynku). Kontrola ceny, ale brak gwarancji fill.
          </li>
          <li>
            <strong>Stop</strong> — aktywuje się po dotknięciu ceny wyzwalającej (wejście na wybicie/momentum). Long:{" "}
            <em>Buy Stop</em> (powyżej rynku), Short: <em>Sell Stop</em> (poniżej rynku). Pewniejsze wejście w ruch, ryzyko poślizgu.
          </li>
          <li>
            <strong>Stop-Limit</strong> — hybryda: Stop wyzwala, ale do realizacji używany jest Limit (kontrola max/min ceny). Możliwy brak
            wykonania przy szybkim ruchu.
          </li>
          <li>
            <strong>OCO</strong> (One-Cancels-the-Other) — dwa zlecenia, wzajemnie się anulują. Typowo TP i SL podpięte do pozycji.
          </li>
        </ul>
      </PodstawySection>

      <PodstawySection title="Time in Force (TIF)">
        <ul>
          <li><strong>GTC</strong> — Good-Till-Cancelled (do odwołania).</li>
          <li><strong>Day</strong> — ważne do końca dnia handlowego.</li>
          <li><strong>IOC</strong> — Immediate-Or-Cancel (zrealizuj natychmiast, resztę anuluj).</li>
          <li><strong>FOK</strong> — Fill-Or-Kill (zrealizuj w całości natychmiast albo anuluj całość).</li>
        </ul>
      </PodstawySection>

      <PodstawySection title="Kiedy co wybrać?" prose={false}>
        <PodstawyCallout variant="accent" eyebrow="Decyzja" title="Dopasowanie zlecenia do sytuacji">
          <ul className="list-disc space-y-2 pl-5">
            <li><em>Breakout/momentum</em> → Stop (lub Stop-Limit, gdy chcesz ograniczyć cenę).</li>
            <li><em>Pullback/mean reversion</em> → Limit (lepsza cena, ale brak gwarancji wykonania).</li>
            <li><em>Nagła potrzeba wejścia</em> (np. news, hedge) → Market (świadomie akceptujesz poślizg).</li>
          </ul>
        </PodstawyCallout>
      </PodstawySection>

      <PodstawySection title="Ryzyka praktyczne" prose={false}>
        <PodstawyCallout variant="amber" eyebrow="Uwaga" title="Co może pójść nie tak">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Spread i poślizg</strong> zwiększają koszt wejścia — gorszy start w relacji do SL.</li>
            <li><strong>Luki</strong> (otwarcia) potrafią przeskoczyć poziom Stop/Limit → brak fill albo dużo gorsza cena.</li>
            <li><strong>Partial fill</strong> — przy niskiej płynności wypełnienie tylko części zlecenia.</li>
          </ul>
        </PodstawyCallout>
      </PodstawySection>

      <PodstawySection
        title="Asystent wyboru zlecenia"
        subtitle="Ustal kierunek, scenariusz i priorytet — zobacz propozycję typu zlecenia. To narzędzie pomocnicze, nie zastępuje planu transakcyjnego."
        prose={false}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Kierunek</div>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as Side)}
              className={inputCls}
            >
              <option value="long">Long (kupno)</option>
              <option value="short">Short (sprzedaż)</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Scenariusz</div>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
              className={inputCls}
            >
              <option value="breakout">Breakout / momentum (wybicie)</option>
              <option value="pullback">Pullback / mean reversion (cofnięcie)</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Priorytet</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={inputCls}
            >
              <option value="fill">Pewne wykonanie</option>
              <option value="price">Kontrola ceny</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Bieżąca cena</div>
              <input
                inputMode="decimal"
                value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value || "0"))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Cena wejścia</div>
              <input
                inputMode="decimal"
                value={entry}
                onChange={(e) => setEntry(parseFloat(e.target.value || "0"))}
                className={inputCls}
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <PodstawyCallout variant="accent" eyebrow="Wynik" title={`Rekomendacja: ${rec.type}`}>
            <p>{rec.why}</p>
            <p className="mt-2 text-xs text-slate-500">
              Uwaga: rekomendacja nie zastępuje planu transakcyjnego. Zawsze określ z góry poziomy <strong>SL</strong> i{" "}
              <strong>TP</strong> oraz liczbę lotów pod stałe <strong>1R</strong>.
            </p>
          </PodstawyCallout>
        </div>
      </PodstawySection>

      <PodstawySection
        title="Kalkulator kosztu wejścia i R:R"
        subtitle="Wpisz spread, poślizg, loty i odległości SL/TP — zobaczysz koszt wejścia, ryzyko i przybliżony R:R."
        prose={false}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Spread (pips)</div>
            <input
              inputMode="decimal"
              value={spreadPips}
              onChange={(e) => setSpreadPips(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Poślizg (pips)</div>
            <input
              inputMode="decimal"
              value={slipPips}
              onChange={(e) => setSlipPips(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Loty</div>
            <input
              inputMode="decimal"
              value={lots}
              onChange={(e) => setLots(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Wartość 1 pips / 1 lot (np. 10 USD)</div>
            <input
              inputMode="decimal"
              value={pipValuePerLot}
              onChange={(e) => setPipValuePerLot(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Stop-Loss (pips)</div>
            <input
              inputMode="decimal"
              value={slPips}
              onChange={(e) => setSlPips(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Take-Profit (pips)</div>
            <input
              inputMode="decimal"
              value={tpPips}
              onChange={(e) => setTpPips(parseFloat(e.target.value || "0"))}
              className={inputCls}
            />
          </label>
        </div>

        <PodstawyCallout variant="neutral" className="mt-4" eyebrow="Podsumowanie" title="Koszt i R:R">
          <div className="space-y-1 text-sm text-white/85">
            <div>
              Wartość 1 pips dla {lots.toFixed(2)} lot:{" "}
              <strong>{pipValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div>
              Koszt wejścia (spread + poślizg):{" "}
              <strong>{entryCostCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div>
              Ryzyko kwotowo (SL): <strong>{riskCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div>
              Potencjalny zysk (TP): <strong>{rewardCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="text-base text-white">
              R:R = <strong>{isFinite(rr) ? rr.toFixed(2) : "0.00"}</strong>{" "}
              • koszt wejścia = <strong>{isFinite(entryCostInR) ? entryCostInR.toFixed(2) : "0.00"} R</strong>
            </div>
            <p className="text-xs text-slate-500">
              Wysoki spread/poślizg potrafi „zabrać” znaczną część 1R — uwzględniaj to w planie.
            </p>
          </div>
        </PodstawyCallout>
      </PodstawySection>

      <PodstawySection title="Scenariusze">
        <ol>
          <li>
            <strong>Breakout powyżej oporu</strong>: zlecenie <em>Buy Stop</em> (lub Stop-Limit) kilkanaście punktów
            powyżej poziomu, SL pod świecą wybicia, TP przy kolejnym oporze.
          </li>
          <li>
            <strong>Cofnięcie do wsparcia</strong>: zlecenie <em>Buy Limit</em> na strefie popytu, SL pod strefą, TP do
            ostatniego szczytu.
          </li>
          <li>
            <strong>Wejście „tu i teraz”</strong>: <em>Market</em>, ale z mniejszą wielkością (by ograniczyć ryzyko
            poślizgu), a reszta po potwierdzeniu (np. Stop).
          </li>
        </ol>
      </PodstawySection>

      <PodstawyChecklist>
        <ul>
          <li>Dobieram typ zlecenia do scenariusza (breakout/pullback) i priorytetu (fill vs cena).</li>
          <li>Znam konsekwencje spreadu i poślizgu; umiem policzyć ich koszt.</li>
          <li>Używam OCO (TP+SL) i właściwego TIF (GTC/Day/IOC/FOK) zgodnie z planem.</li>
        </ul>
      </PodstawyChecklist>
    </PodstawyLessonShell>
  );
}
