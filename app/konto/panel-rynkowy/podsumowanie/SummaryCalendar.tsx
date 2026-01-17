'use client';

import { useMemo } from 'react';
import type { CalendarEvent } from '@/lib/panel/calendar7d';
import { inferImpact } from '@/lib/panel/calendarImpact';

type Props = {
  events: CalendarEvent[];
};

export default function SummaryCalendar({ events }: Props) {
  // Filtruj najbliższe 7 dni i tylko ważne wydarzenia
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return events
      .filter((e) => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate <= weekFromNow && (e.importance === 'high' || e.importance === 'medium');
      })
      .slice(0, 5)
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
        const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
        return dateA.getTime() - dateB.getTime();
      });
  }, [events]);

  if (upcoming.length === 0) {
    return (
      <div className="text-white/70 text-sm">
        <p>Brak nadchodzących ważnych wydarzeń w najbliższych 7 dniach.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcoming.slice(0, 3).map((event, idx) => {
        const date = new Date(event.date);
        const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

        return (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xs text-white/60">{dayName}, {dateStr}</span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/60">{event.time}</span>
                  <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] ${
                    event.importance === 'high'
                      ? 'text-red-300 border-red-400/30 bg-red-500/10'
                      : 'text-amber-300 border-amber-400/30 bg-amber-500/10'
                  }`}>
                    {event.importance === 'high' ? 'Wysoka' : 'Średnia'}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white truncate">{event.event}</h3>
              </div>
            </div>
          </div>
        );
      })}
      {upcoming.length > 3 && (
        <p className="text-xs text-white/50 pt-1">+{upcoming.length - 3} więcej wydarzeń</p>
      )}
    </div>
  );
}
