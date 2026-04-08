/** Wspólny typ kart postępu na /kursy — importowalny z komponentów klienckich (bez `server-only`). */
export type KursyModuleProgress = {
  courseSlug: string;
  totalLessons: number;
  doneLessons: number;
  state: "not_started" | "in_progress" | "completed";
  actionHref: string;
  cta: string;
  lastActivityAt: string | null;
};
