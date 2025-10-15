'use client';

// components/LessonProgress.tsx
// Badget "Ukończono" oparty o localStorage. Eksportuje *zarówno* default jak i named.

import { useEffect, useState } from 'react';

function storageKey(course: string, id: string) {
  return `progress:${course}:${id}`;
}

export function LessonProgress({ course, id }: { course: string; id: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const v = typeof window !== 'undefined'
        ? localStorage.getItem(storageKey(course, id))
        : null;
      setDone(v === '1');
    } catch {
      // ignore
    }
  }, [course, id]);

  return done ? (
    <span className="text-xs rounded-full border px-2 py-0.5">Ukończono ✅</span>
  ) : null;
}

// zapewniamy też eksport domyślny (gdyby gdzieś był import default)
export default LessonProgress;
