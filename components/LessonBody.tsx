// Render treści lekcji (server component)

import type { ContentBlock } from '@/data/lessons';
import LessonSectionPanel from '@/components/LessonSectionPanel';

type H2Block = Extract<ContentBlock, { type: 'h2' }>;

type ContentSection = {
  h2: H2Block | null;
  body: ContentBlock[];
};

function splitIntoSections(content: ContentBlock[]): ContentSection[] {
  const sections: ContentSection[] = [];
  const preamble: ContentBlock[] = [];
  let seenH2 = false;
  let currentH2: H2Block | null = null;
  const body: ContentBlock[] = [];

  const flushOpenSection = () => {
    if (seenH2 && currentH2) {
      sections.push({ h2: currentH2, body: body.splice(0, body.length) });
      currentH2 = null;
    }
  };

  for (const b of content) {
    if (b.type === 'h2') {
      if (!seenH2) {
        if (preamble.length > 0) {
          sections.push({ h2: null, body: [...preamble] });
          preamble.length = 0;
        }
        seenH2 = true;
        flushOpenSection();
        currentH2 = b;
      } else {
        flushOpenSection();
        currentH2 = b;
      }
    } else if (!seenH2) {
      preamble.push(b);
    } else {
      body.push(b);
    }
  }

  if (seenH2 && currentH2) {
    sections.push({ h2: currentH2, body: [...body] });
  } else if (!seenH2 && preamble.length > 0) {
    sections.push({ h2: null, body: [...preamble] });
  }

  return sections;
}

function renderBlock(b: ContentBlock, key: string) {
  switch (b.type) {
    case 'h2':
      return (
        <h2
          key={key}
          className="scroll-mt-24 border-b border-white/10 pb-3 text-xl font-semibold tracking-tight text-white sm:text-2xl"
        >
          {b.text}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={key}
          className="scroll-mt-24 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl [&:not(:first-child)]:mt-9"
        >
          {b.text}
        </h3>
      );
    case 'p':
      return (
        <p key={key} className="leading-[1.7] [&:not(:first-child)]:mt-6">
          {b.text}
        </p>
      );
    case 'list':
      return (
        <ul
          key={key}
          className="list-none space-y-3.5 border-l-2 border-indigo-400/55 pl-5 leading-relaxed [&:not(:first-child)]:mt-7"
        >
          {b.items.map((li, j) => (
            <li
              key={j}
              className="relative pl-1 before:absolute before:-left-[1.125rem] before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-indigo-300/90 before:content-['']"
            >
              {li}
            </li>
          ))}
        </ul>
      );
    case 'quote':
      return (
        <blockquote
          key={key}
          className="rounded-xl border border-indigo-300/35 bg-indigo-950/50 px-5 py-4 text-[0.95rem] leading-relaxed text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] [&:not(:first-child)]:mt-8"
        >
          <p className="border-l-4 border-indigo-400 pl-4 italic text-slate-100">{b.text}</p>
        </blockquote>
      );
    case 'code':
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-xl border border-slate-600/50 bg-slate-950/80 p-4 text-left text-sm leading-relaxed text-slate-200 shadow-inner [&:not(:first-child)]:mt-7"
        >
          <code className="font-mono text-[0.8125rem] text-slate-200">{b.code}</code>
        </pre>
      );
    default:
      return null;
  }
}

export default function LessonBody({
  content,
}: {
  content: ContentBlock[];
}) {
  const sections = splitIntoSections(content);

  return (
    <article className="mx-auto max-w-[65ch] text-slate-400">
      <div className="flex flex-col gap-12 pt-6">
        {sections.map((sec, sIdx) => (
          <LessonSectionPanel key={sIdx} title={sec.h2?.text}>
            {sec.body.map((b, bIdx) => renderBlock(b, `${sIdx}-${bIdx}`))}
          </LessonSectionPanel>
        ))}
      </div>
    </article>
  );
}
