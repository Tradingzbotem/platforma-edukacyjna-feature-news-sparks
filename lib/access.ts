// lib/access.ts
import "server-only";
import { getSession } from "@/lib/session";

export type Role = "guest" | "user" | "pro";
export type RequiredAccess = "public" | "auth" | "pro";

// Rzeczywiste odczytanie roli użytkownika z sesji (iron-session)
export async function getRoleFromCookies(): Promise<Role> {
  try {
    const s = await getSession();
    if (s?.plan === "pro" || s?.plan === "elite") return "pro";
    if (s?.userId) return "user";
    return "guest";
  } catch {
    return "guest";
  }
}

export function canAccess(required: RequiredAccess, role: Role): boolean {
  switch (required) {
    case "public":
      return true;
    case "auth":
      return role === "user" || role === "pro";
    case "pro":
      return role === "pro";
    default:
      return false;
  }
}

