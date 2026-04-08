/**
 * Wspólna typografia / miniatury dla kart listy /redakcja (TopCard, MiniRow).
 * Karty „featured” (TopStory, DaySection*) zostają na własnej skali.
 */

/** Stała wysokość miniatury — siatka (TopCard). */
export const REDAKCJA_GRID_CARD_THUMB_H = 'h-[7.75rem]';

/** Miniatura w wierszu listy (MiniRow): stały prostokąt. */
export const REDAKCJA_MINI_ROW_THUMB_BOX = 'h-12 w-20 min-w-20';

export const redakcjaGridCardTitleClass =
	'text-sm font-semibold leading-snug tracking-tight text-zinc-100 line-clamp-2 group-hover:underline decoration-zinc-600 underline-offset-2';

export const redakcjaGridCardMetaClass =
	'text-[11px] tabular-nums text-zinc-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5';

/** Tagi: max 2 ustawiane w komponentach (`slice(0, 2)`). */
export const redakcjaArticleTagPillClass =
	'rounded-md border border-zinc-700/45 bg-zinc-900/45 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-zinc-500';
