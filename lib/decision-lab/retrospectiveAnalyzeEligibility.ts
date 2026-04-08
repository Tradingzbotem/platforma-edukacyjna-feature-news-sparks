/**
 * Minimalny czas od zapisu decyzji zanim można uruchomić ocenę wsteczną AI
 * (żeby dać rynkowi „zagrać” zgodnie z horyzontem — ok. 2–3 dni).
 */
export const RETROSPECTIVE_MIN_HOURS_BY_HORIZON: Record<string, number> = {
  INTRADAY: 48,
  SWING: 48,
  POSITION: 72,
};

export function minHoursBeforeRetrospectiveAnalyze(horizon: string): number {
  return RETROSPECTIVE_MIN_HOURS_BY_HORIZON[horizon] ?? 48;
}

export function getRetrospectiveAnalyzeEligibility(
  createdAt: string | Date,
  horizon: string
): {
  canAnalyze: boolean;
  minHours: number;
  hoursElapsed: number;
  hoursRemaining: number;
  canAnalyzeAfter: Date;
} {
  const decisionDate = new Date(createdAt);
  const minHours = minHoursBeforeRetrospectiveAnalyze(horizon);
  const canAnalyzeAfter = new Date(decisionDate.getTime() + minHours * 60 * 60 * 1000);
  const now = Date.now();
  const hoursElapsed = (now - decisionDate.getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, minHours - hoursElapsed);
  const canAnalyze = now >= canAnalyzeAfter.getTime();
  return { canAnalyze, minHours, hoursElapsed, hoursRemaining, canAnalyzeAfter };
}
