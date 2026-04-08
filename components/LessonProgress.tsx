'use client';

// components/LessonProgress.tsx
// Badget "Ukończono" oparty o localStorage. Eksportuje *zarówno* default jak i named.

import { useEffect, useState } from 'react';
import { useLessonProgressSession } from '@/app/contexts/LessonProgressSessionContext';
import { LESSON_PROGRESS_DONE, readLessonProgressValue } from '@/lib/lessonProgressStorage';

export function LessonProgress({ course, id }: { course: string; id: string }) {
  const { userId, sessionReady } = useLessonProgressSession();
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      if (!sessionReady || typeof window === 'undefined') return;
      const v = readLessonProgressValue(localStorage, course, id, userId);
      setDone(v === LESSON_PROGRESS_DONE);
    } catch {
      // ignore
    }
  }, [course, id, userId, sessionReady]);

  return done ? (
    <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
      Ukończono ✓
    </span>
  ) : null;
}

// zapewniamy też eksport domyślny (gdyby gdzieś był import default)
export default LessonProgress;
