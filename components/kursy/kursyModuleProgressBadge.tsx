import type { KursyModuleProgress } from "@/lib/kursyModuleProgressTypes";

export function moduleProgressBadgeClass(state: KursyModuleProgress["state"]) {
  switch (state) {
    case "completed":
      return "border-emerald-400/35 bg-emerald-500/12 text-emerald-200/90";
    case "in_progress":
      return "border-amber-400/35 bg-amber-500/12 text-amber-100/90";
    default:
      return "border-white/12 bg-white/[0.04] text-white/55";
  }
}

export function moduleProgressLabel(state: KursyModuleProgress["state"]) {
  switch (state) {
    case "completed":
      return "Ukończono";
    case "in_progress":
      return "W trakcie";
    default:
      return "Nie rozpoczęto";
  }
}
