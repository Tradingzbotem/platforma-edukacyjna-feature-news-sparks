"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  syncPodstawyDoneSlugsToServer,
  syncScopedLessonProgressDoneToServer,
} from "@/lib/client/syncScopedLessonProgressDoneToServer";

/**
 * Przy nawigacji w /kursy ponownie wysyła ukończenia z localStorage do DB (ProgressSync robi to tylko raz przy starcie).
 * Na stronie głównej /kursy wywołuje router.refresh(), żeby karty RSC pokazały zaktualizowany postęp.
 */
export default function KursyProgressSyncClient() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/kursy")) return;

    let cancelled = false;

    (async () => {
      try {
        const s = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
          .then((r) => r.json())
          .catch(() => null);
        if (!s?.isLoggedIn || typeof s.userId !== "string" || !s.userId) return;
        const userId = s.userId as string;

        await syncScopedLessonProgressDoneToServer(userId);
        await syncPodstawyDoneSlugsToServer(userId);

        if (cancelled) return;
        if (pathname === "/kursy") router.refresh();
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
