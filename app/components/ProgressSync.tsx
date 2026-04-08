'use client';

import { useEffect, useRef } from 'react';
import {
  syncPodstawyDoneSlugsToServer,
  syncScopedLessonProgressDoneToServer,
} from '@/lib/client/syncScopedLessonProgressDoneToServer';

/**
 * ProgressSync
 * Minimal client-side synchronizer: reads localStorage progress and exam results,
 * and pushes them to server APIs for the logged-in user. Silent best-effort.
 *
 * Ważne: synchronizujemy klucze `progress:u:{userId}:…` oraz zbiór slugów Podstawy jak na spisie
 * (`readPodstawyDoneSlugSet`: klucz per użytkownik ∪ legacy), żeby nie mieszać kont na tym samym urządzeniu.
 */
export default function ProgressSync() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function sync() {
      if (typeof window === 'undefined') return;
      // 1) Probe session
      let userId: string | null = null;
      try {
        const s = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'same-origin' })
          .then((r) => r.json())
          .catch(() => null);
        if (!s || !s.isLoggedIn || typeof s.userId !== 'string' || !s.userId) return;
        userId = s.userId;
      } catch {
        return;
      }

      const uid = userId;
      if (!uid) return;

      // 2) Sync lesson progress: tylko ukończenia (`1`). Wizyty (`0`) wysyła LessonVisitTracker — unikamy nadpisania true→false przy starym LS.
      await syncScopedLessonProgressDoneToServer(uid);

      // 2b) Podstawy: ta sama merged lista co na /kursy/podstawy → lesson_progress
      await syncPodstawyDoneSlugsToServer(uid);

      // 3) Sync exam results: keys like exam:<slug>:latest => {at, score, total}
      try {
        const results: Array<{ slug: string; score: number; total: number; at?: string }> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)!;
          if (!k.startsWith('exam:') || !k.endsWith(':latest')) continue;
          const slug = k.split(':')[1];
          const raw = localStorage.getItem(k);
          if (!slug || !raw) continue;
          try {
            const data = JSON.parse(raw) as { at?: string; score: number; total: number };
            if (typeof data.score === 'number' && typeof data.total === 'number') {
              results.push({ slug, score: data.score, total: data.total, at: data.at });
            }
          } catch {}
        }
        if (results.length) {
          await Promise.all(
            results.map(r =>
              fetch('/api/progress/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r),
              }).catch(() => undefined)
            )
          );
        }
      } catch {}
    }

    // kick off
    sync();
  }, []);

  return null;
}


