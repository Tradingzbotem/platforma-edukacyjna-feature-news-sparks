// app/api/challenge/auto-resolve/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ───────────────── helpers ─────────────────
type Choice = "up" | "flat" | "down";

type ResolveItem = {
  id: string;                // np. "us100_open_2025-10-13"
  symbol?: string;           // np. "OANDA:NAS100_USD" (jak nie podasz, zmapujemy po id/instrument)
  target?: Choice;           // oczekiwany kierunek usera; nie jest konieczny do wyliczenia, ale zwrócimy z powrotem
  thresholdPct?: number;     // próg %; domyślnie 1.0
};

type FinnhubQuote = { c?: number; pc?: number }; // current / previous close

const FINNHUB_REST = "https://finnhub.io/api/v1";
// preferuj serwerowy klucz, ale pozwól spaść do publicznego jeśli brak
const FINN_TOKEN =
  process.env.FINNHUB_API_KEY ||
  process.env.FINNHUB_SERVER_TOKEN ||
  process.env.NEXT_PUBLIC_FINNHUB_KEY ||
  process.env.NEXT_PUBLIC_FINNHUB_TOKEN ||
  "";

function pctChange(curr?: number, prev?: number): number | undefined {
  if (typeof curr !== "number" || typeof prev !== "number" || prev === 0) return undefined;
  return ((curr - prev) / prev) * 100;
}

// Prosta mapka "przyjaznych" nazw na symbole Finnhub OANDA:
function mapSymbolLoose(x?: string): string | undefined {
  if (!x) return undefined;
  const v = x.toLowerCase();

  // ID/tytuły używane w Twojej aplikacji:
  if (v.includes("us100") || v.includes("nas100")) return "OANDA:NAS100_USD";
  if (v.includes("us500") || v.includes("spx") || v.includes("s&p")) return "OANDA:US500_USD";
  if (v.includes("xau") || v.includes("gold") || v.includes("złoto")) return "OANDA:XAU_USD";
  if (v.includes("wti") || v.includes("xtiusd") || v.includes("ropa")) return "OANDA:WTICO_USD";
  if (v.includes("brent") || v.includes("bco")) return "OANDA:BCO_USD";
  if (v.includes("eurusd") || v.includes("eur/usd")) return "OANDA:EUR_USD";
  if (v.includes("usdjpy") || v.includes("usd/jpy")) return "OANDA:USD_JPY";
  return undefined;
}

// REST /quote  (no-store; bez cache)
async function fetchQuote(symbol: string): Promise<{ changePct?: number; price?: number; prevClose?: number }> {
  if (!FINN_TOKEN) throw new Error("Brak tokena Finnhub (dodaj FINNHUB_API_KEY lub NEXT_PUBLIC_FINNHUB_TOKEN).");
  const url = `${FINNHUB_REST}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINN_TOKEN}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Finnhub /quote HTTP ${r.status} for ${symbol}`);
  const j = (await r.json()) as FinnhubQuote;
  const price = typeof j.c === "number" ? j.c : undefined;
  const prevClose = typeof j.pc === "number" ? j.pc : undefined;
  const changePct = pctChange(price, prevClose);
  return { changePct, price, prevClose };
}

function decide(changePct: number | undefined, thresholdPct: number): Choice | "unknown" {
  if (typeof changePct !== "number") return "unknown";
  if (changePct >= thresholdPct) return "up";
  if (changePct <= -thresholdPct) return "down";
  return "flat";
}

// ───────────────── route ─────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      items?: ResolveItem[];
      // opcjonalnie globalny próg jeśli nie podany per-item
      thresholdPct?: number;
      // opcjonalny "hint" do mapowania symbolu gdy item.symbol brak (np. "US100")
      instrumentHint?: string;
    };

    const items = Array.isArray(body?.items) ? body!.items! : [];
    if (!items.length) {
      return new Response(JSON.stringify({ error: "Brak 'items' w payloadzie." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const globalThreshold = typeof body.thresholdPct === "number" ? Math.max(0, body.thresholdPct) : 1.0;

    // zbuduj zapytania do Finnhub
    const tasks = items.map(async (it) => {
      const threshold = typeof it.thresholdPct === "number" ? Math.max(0, it.thresholdPct) : globalThreshold;

      // symbol: 1) podany, 2) spróbuj z id, 3) spróbuj z instrumentHint
      const symbol =
        it.symbol ||
        mapSymbolLoose(it.id) ||
        mapSymbolLoose(body.instrumentHint) ||
        undefined;

      if (!symbol) {
        return {
          id: it.id,
          target: it.target ?? null,
          thresholdPct: threshold,
          symbol: null,
          changePct: null,
          decision: "unknown" as const,
          reason: "Nie udało się zmapować symbolu.",
        };
      }

      try {
        const q = await fetchQuote(symbol);
        const decision = decide(q.changePct, threshold);
        return {
          id: it.id,
          target: it.target ?? null,
          thresholdPct: threshold,
          symbol,
          changePct: typeof q.changePct === "number" ? Number(q.changePct.toFixed(4)) : null,
          price: q.price ?? null,
          prevClose: q.prevClose ?? null,
          decision, // "up" | "down" | "flat" | "unknown"
        };
      } catch (e: any) {
        return {
          id: it.id,
          target: it.target ?? null,
          thresholdPct: threshold,
          symbol,
          changePct: null,
          decision: "unknown" as const,
          reason: e?.message || "Błąd zapytania Finnhub.",
        };
      }
    });

    const results = await Promise.all(tasks);

    return new Response(
      JSON.stringify({
        resolvedAt: new Date().toISOString(),
        results,
        hint: "decision: 'up' gdy zmiana >= próg; 'down' gdy <= -próg; 'flat' w przeciwnym razie; 'unknown' gdy brak danych.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Błąd serwera." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

// (opcjonalny) GET do szybkich testów w przeglądarce: ?id=us100_open&symbol=OANDA:NAS100_USD&threshold=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "test";
  const symbol = searchParams.get("symbol") || "OANDA:NAS100_USD";
  const threshold = Number(searchParams.get("threshold") || "1");
  try {
    const q = await fetchQuote(symbol);
    const decision = decide(q.changePct, isFinite(threshold) ? Math.max(0, threshold) : 1);
    return new Response(
      JSON.stringify({
        resolvedAt: new Date().toISOString(),
        results: [
          {
            id,
            symbol,
            thresholdPct: threshold,
            changePct: typeof q.changePct === "number" ? Number(q.changePct.toFixed(4)) : null,
            price: q.price ?? null,
            prevClose: q.prevClose ?? null,
            decision,
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Błąd Finnhub." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
