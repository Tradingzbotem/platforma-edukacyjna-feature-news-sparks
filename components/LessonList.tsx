export default function LessonList({ lessons }: { lessons: { id: string; title: string; duration?: string; summary?: string }[] }) {
  return (
    <div className="grid gap-3">
      {lessons.map((l, i) => (
        <div key={l.id} className="rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{i + 1}. {l.title}</h3>
            {l.duration && <span className="text-xs opacity-70">{l.duration}</span>}
          </div>
          {l.summary && <p className="mt-1 text-sm opacity-80">{l.summary}</p>}
        </div>
      ))}
    </div>
  );
}
