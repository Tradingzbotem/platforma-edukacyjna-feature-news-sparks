// Render treści lekcji (server component)

export default function LessonBody({
  content,
}: {
  content: import('@/data/lessons').ContentBlock[];
}) {
  return (
    <article className="prose prose-invert prose-headings:font-semibold max-w-none">
      {content.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return <h2 key={i} className="mt-8">{b.text}</h2>;
          case 'h3':
            return <h3 key={i} className="mt-6">{b.text}</h3>;
          case 'p':
            return <p key={i}>{b.text}</p>;
          case 'list':
            return (
              <ul key={i} className="list-disc pl-6">
                {b.items.map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            );
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 pl-4 italic opacity-90">
                {b.text}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={i} className="rounded-xl border bg-black/50 p-4 overflow-x-auto">
                <code>{b.code}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
