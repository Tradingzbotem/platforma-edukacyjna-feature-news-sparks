import { LESSON_PROGRESS_DONE, readPodstawyDoneSlugSet } from "@/lib/lessonProgressStorage";

/**
 * Ukończenia z listy Podstawy — ta sama zbiór slugów co `readPodstawyDoneSlugSet` na spisie lekcji
 * (klucz per użytkownik ∪ legacy). Bez tego `/kursy` liczy z DB i może pokazywać mniej niż faktyczny postęp.
 */
export async function syncPodstawyDoneSlugsToServer(userId: string): Promise<void> {
  if (typeof window === "undefined" || !userId) return;
  let slugs: string[];
  try {
    slugs = Array.from(readPodstawyDoneSlugSet(localStorage, userId));
  } catch {
    return;
  }
  if (!slugs.length) return;
  await Promise.all(
    slugs.map((lessonId) =>
      fetch("/api/progress/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: "podstawy", lessonId, done: true }),
      }).catch(() => undefined)
    )
  );
}

/**
 * Wysyła do serwera wszystkie ukończenia (`1`) z localStorage dla danego użytkownika
 * (`progress:u:{userId}:…`). Idempotentne upserty — używane przy starcie aplikacji i przy nawigacji /kursy.
 */
export async function syncScopedLessonProgressDoneToServer(userId: string): Promise<void> {
  if (typeof window === "undefined" || !userId) return;

  const progressPrefix = `progress:u:${userId}:`;
  const entries: Array<{ course: string; lessonId: string; done: boolean }> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(progressPrefix)) continue;
      const rest = k.slice(progressPrefix.length);
      const colon = rest.indexOf(":");
      if (colon <= 0) continue;
      const course = rest.slice(0, colon);
      const lessonId = rest.slice(colon + 1);
      const v = localStorage.getItem(k);
      if (v !== LESSON_PROGRESS_DONE) continue;
      if (course && lessonId) entries.push({ course, lessonId, done: true });
    }
  } catch {
    return;
  }

  if (!entries.length) return;

  await Promise.all(
    entries.map((e) =>
      fetch("/api/progress/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      }).catch(() => undefined)
    )
  );
}
