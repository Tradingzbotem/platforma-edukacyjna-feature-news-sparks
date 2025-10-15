'use client';

import { useEffect, useRef } from 'react';

/**
 * ProgressSync
 * Minimal client-side synchronizer: reads localStorage progress and exam results,
 * and pushes them to server APIs for the logged-in user. Silent best-effort.
 */
export default function ProgressSync() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function sync() {
      if (typeof window === 'undefined') return;
      // 1) Probe session
      try {
        const s = await fetch('/api/auth/session', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
        if (!s || !s.isLoggedIn) return; // only sync for logged-in users
      } catch {
        return;
      }

      // 2) Sync lesson progress: keys like progress:course:id => '1'
      try {
        const entries: Array<{ course: string; lessonId: string; done: boolean }> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)!;
          if (!k.startsWith('progress:')) continue;
          const parts = k.split(':');
          if (parts.length < 3) continue;
          const course = parts[1];
          const lessonId = parts.slice(2).join(':');
          const v = localStorage.getItem(k);
          const done = v === '1';
          if (course && lessonId) entries.push({ course, lessonId, done });
        }
        if (entries.length) {
          // fire-and-forget POSTs (no batching for simplicity)
          await Promise.all(
            entries.map(e =>
              fetch('/api/progress/lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(e),
              }).catch(() => undefined)
            )
          );
        }
      } catch {}

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


