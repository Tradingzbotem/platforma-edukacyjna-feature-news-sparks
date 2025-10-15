"use client";

import * as React from "react";

type NewsItem = {
  id?: string;
  title: string;
  timestamp_iso: string; // ISO string
  source?: string;
  link?: string;
};

type Props = {
  items: NewsItem[]; // wszystkie newsy z ostatnich 72h (lub więcej)
  initialTab?: "24h" | "48h" | "72h";
  initiallyShowCount?: number; // ile pozycji pokazać przed rozwinięciem (domyślnie 1)
};

function hoursSince(iso: string) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, (now - t) / 36e5); // ms -> h
}

function groupBuckets(items: NewsItem[]) {
  const b24: NewsItem[] = [];
  const b48: NewsItem[] = [];
  const b72: NewsItem[] = [];
  for (const it of items) {
    const h = hoursSince(it.timestamp_iso);
    if (h <= 24) b24.push(it);
    else if (h <= 48) b48.push(it);
    else if (h <= 72) b72.push(it);
  }
  // najnowsze u góry
  const sortDesc = (a: NewsItem, b: NewsItem) =>
    new Date(b.timestamp_iso).getTime() - new Date(a.timestamp_iso).getTime();
  b24.sort(sortDesc);
  b48.sort(sortDesc);
  b72.sort(sortDesc);
  return { "24h": b24, "48h": b48, "72h": b72 } as const;
}

export default function NewsBuckets({
  items,
  initialTab = "24h",
  initiallyShowCount = 1,
}: Props) {
  const buckets = React.useMemo(() => groupBuckets(items), [items]);
  const [active, setActive] = React.useState<"24h" | "48h" | "72h">(initialTab);
  const [expanded, setExpanded] = React.useState<Record<"24h" | "48h" | "72h", boolean>>({
    "24h": false,
    "48h": false,
    "72h": false,
  });

  const activeList = buckets[active];
  const isOpen = expanded[active];
  const visibleCount = isOpen ? activeList.length : Math.min(initiallyShowCount, activeList.length);
  const restCount = Math.max(0, activeList.length - visibleCount);

  function toggleExpand(tab: "24h" | "48h" | "72h") {
    setExpanded((prev) => ({ ...prev, [tab]: !prev[tab] }));
  }

  return (
    <section className="mt-6">
      {/* Zakładki 24 / 48 / 72 */}
      <div className="flex gap-2 mb-4">
        {( ["24h", "48h", "72h"] as const ).map((tab) => {
          const count = buckets[tab].length;
          const activeStyle =
            active === tab
              ? "bg-white/10 text-white"
              : "bg-white/5 text-white/70 hover:text-white";
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3 py-1.5 rounded-xl text-sm transition ${activeStyle}`}
            >
              {tab} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lista kompaktowa — bez „kwadratów”, tylko wiersze */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          // gładkie zwijanie: ograniczamy max wysokość względem liczby widocznych elementów
          // ~56px na wiersz + marginesy; to prosta, niewyliczona idealnie, ale działa elegancko
          maxHeight: `${visibleCount * 56 + 8}px`,
        }}
      >
        <ul className="divide-y divide-white/5 rounded-xl bg-white/5">
          {activeList.map((it, idx) => (
            <li key={it.id ?? `${it.title}-${idx}`} className="px-3 py-3">
              <Row item={it} />
            </li>
          ))}
          {activeList.length === 0 && (
            <li className="px-3 py-3 text-white/60">Brak pozycji w tym przedziale czasu.</li>
          )}
        </ul>
      </div>

      {/* Przyciski „Pokaż resztę / Zwiń” */}
      {activeList.length > initiallyShowCount && (
        <div className="mt-3">
          {!isOpen ? (
            <button
              onClick={() => toggleExpand(active)}
              className="text-sm text-white/90 hover:text-white underline underline-offset-4"
            >
              Pokaż resztę ({restCount})
            </button>
          ) : (
            <button
              onClick={() => toggleExpand(active)}
              className="text-sm text-white/90 hover:text-white underline underline-offset-4"
            >
              Zwiń
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Row({ item }: { item: NewsItem }) {
  const time = new Date(item.timestamp_iso);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const src = item.source ? item.source.toUpperCase() : "SOURCE";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-16">{hh}:{mm}</span>
      <span className="text-[10px] tracking-wide px-1.5 py-0.5 rounded bg-white/10 text-white/70">
        {src}
      </span>
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white hover:opacity-90"
          title={item.title}
        >
          {item.title}
        </a>
      ) : (
        <span className="text-sm text-white" title={item.title}>
          {item.title}
        </span>
      )}
    </div>
  );
}


