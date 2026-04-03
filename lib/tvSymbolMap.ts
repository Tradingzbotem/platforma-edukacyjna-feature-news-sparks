import type { DecisionAssetId } from "@/app/client/decisionBlockMock";

/**
 * Symbole TradingView (embed) dla aktywów Centrum decyzji.
 * OANDA / CAPITALCOM — spójne z mapowaniem w Decision Lab (`mapSymbolToTradingView`).
 */
export const tvSymbolMap: Record<DecisionAssetId, string> = {
  US100: "OANDA:NAS100USD",
  US500: "CAPITALCOM:US500",
  DE40: "OANDA:DE30EUR",
  GOLD: "OANDA:XAUUSD",
  EURUSD: "OANDA:EURUSD",
  GBPUSD: "OANDA:GBPUSD",
  USDJPY: "OANDA:USDJPY",
  WTI: "OANDA:WTICOUSD",
};

export function tvSymbolForAsset(id: DecisionAssetId): string {
  return tvSymbolMap[id];
}
