import type {
  MorningInstitutionalBriefing,
  MorningInstitutionalDepth,
  MorningInstitutionalLanguage,
} from '@/lib/brief/morningInstitutionalBriefingTypes';
import {
  formatBriefingDateTime,
  getMorningBriefingLocale,
  languageValueLineForTxt,
} from '@/lib/brief/morningBriefingLocale';

export type MorningBriefingExportMeta = {
  generatedAt: Date;
  language: MorningInstitutionalLanguage;
  depth: MorningInstitutionalDepth;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Nazwa pliku: morning-briefing-{lang}-{depth}-{YYYY-MM-DD-HH-mm}.txt */
export function morningBriefingTxtFilename(
  language: MorningInstitutionalLanguage,
  depth: MorningInstitutionalDepth,
  at: Date,
): string {
  const y = at.getFullYear();
  const mo = pad2(at.getMonth() + 1);
  const d = pad2(at.getDate());
  const h = pad2(at.getHours());
  const mi = pad2(at.getMinutes());
  return `morning-briefing-${language}-${depth}-${y}-${mo}-${d}-${h}-${mi}.txt`;
}

/**
 * Czytelny plain text wg języka UI/meta (bez mieszania PL/EN/CS).
 */
export function formatMorningBriefingToPlainText(
  b: MorningInstitutionalBriefing,
  meta: MorningBriefingExportMeta,
): string {
  const L = getMorningBriefingLocale(meta.language);
  const lines: string[] = [];

  const nl = () => lines.push('');
  const push = (s: string) => lines.push(s);

  push(L.txtMorningBriefingTitle);
  nl();
  push(`${L.txtGeneratedAt}: ${formatBriefingDateTime(meta.generatedAt, meta.language)}`);
  push(`${L.txtLanguage}: ${languageValueLineForTxt(meta.language)}`);
  push(`${L.txtDepth}: ${L.txtDepthValue(meta.depth)}`);
  nl();

  push(L.txtWhatsDifferentToday);
  if (!b.whatsDifferentVsRecentDays?.length) {
    push(L.txtNone);
  } else {
    for (const item of b.whatsDifferentVsRecentDays) {
      push(`- ${item}`);
    }
  }
  nl();

  push(L.txtWhatMovesToday);
  if (b.tldr.length === 0) {
    push(L.txtNone);
  } else {
    for (const item of b.tldr) {
      push(`- ${item}`);
    }
  }
  nl();

  push(L.txtExecSummary);
  push(b.executiveSummary.trim() || L.txtNone);
  nl();

  push(L.txtMacro);

  const macroBlock = (label: string, themes: MorningInstitutionalBriefing['macro']['usa']) => {
    push(`[${label}]`);
    if (!themes.length) {
      push(L.txtNone);
      nl();
      return;
    }
    for (const m of themes) {
      push(m.title || L.emptyDash);
      push(`${L.fldWhatHappened}: ${m.whatHappened || L.emptyDash}`);
      push(`${L.fldWhyMatters}: ${m.whyItMatters || L.emptyDash}`);
      push(`${L.fldMarketImpact}: ${m.marketImpact || L.emptyDash}`);
      nl();
    }
  };

  macroBlock(L.regionUsa, b.macro.usa);
  macroBlock(L.regionEurope, b.macro.europe);
  macroBlock(L.regionAsia, b.macro.asia);
  macroBlock(L.regionGeopolitics, b.macro.geopolitics);

  push(L.txtEvents);
  if (!b.events.length) {
    push(L.txtNone);
  } else {
    b.events.forEach((ev, i) => {
      push(`${i + 1}. ${ev.name || L.emptyDash}`);
      push(`${L.fldExpectations}: ${ev.expectation || L.emptyDash}`);
      push(`${L.fldBullCase}: ${ev.bullCase || L.emptyDash}`);
      push(`${L.fldBearCase}: ${ev.bearCase || L.emptyDash}`);
      push(`${L.fldMarketImpact}: ${ev.marketImpact || L.emptyDash}`);
      nl();
    });
  }
  nl();

  push(L.txtAssets);
  if (!b.assets.length) {
    push(L.txtNone);
  } else {
    b.assets.forEach((a, i) => {
      push(`${i + 1}. ${a.asset || L.emptyDash}`);
      push(`${L.fldContext}: ${a.currentContext || L.emptyDash}`);
      push(`${L.fldDrivers}: ${a.drivers || L.emptyDash}`);
      const p = a.livePrice?.trim();
      if (p && a.livePriceSource === 'override_recent') {
        if (a.livePriceAgeHours != null) {
          push(L.txtExportAssetPriceOverride(p, a.livePriceAgeHours));
        } else {
          push(`${L.fldLivePrice}: ${p} (override)`);
        }
      } else if (p && a.livePriceSource === 'live') {
        push(L.txtExportAssetPriceLive(p));
      } else if (p && a.livePriceSource !== 'none') {
        push(`${L.fldLivePrice}: ${p}`);
      }
      push(`${L.fldTriggerBull}: ${a.triggerBull || L.emptyDash}`);
      push(`${L.fldTriggerBear}: ${a.triggerBear || L.emptyDash}`);
      push(`${L.fldTriggerLogic}: ${a.triggerLogic || L.emptyDash}`);
      push(`${L.secHistoricalAnalogies}:`);
      if (!a.historicalBehavior.length) {
        push(`  ${L.txtNone}`);
      } else {
        for (const h of a.historicalBehavior) {
          push(`- ${L.fldSetup}: ${h.setup || L.emptyDash}`);
          push(`  ${L.fldReaction}: ${h.reaction || L.emptyDash}`);
          push(`  ${L.fldLesson}: ${h.lesson || L.emptyDash}`);
        }
      }
      nl();
    });
  }
  nl();

  push(L.txtCrossAsset);
  if (!b.crossAssetLinks.length) {
    push(L.txtNone);
  } else {
    for (const x of b.crossAssetLinks) {
      push(`- ${x}`);
    }
  }
  nl();

  push(L.txtScenarios);
  if (!b.scenarios.length) {
    push(L.txtNone);
  } else {
    b.scenarios.forEach((s, i) => {
      push(`${i + 1}. ${s.title || L.emptyDash}`);
      push(`${L.fldIf}: ${s.scenarioIf || L.emptyDash}`);
      push(`${L.fldThen}: ${s.scenarioThen || L.emptyDash}`);
      push(`${L.fldConfirmation}: ${s.confirmation || L.emptyDash}`);
      push(`${L.fldCrossAssetReaction}: ${s.crossAssetReaction || L.emptyDash}`);
      nl();
    });
  }
  nl();

  push(L.txtQuickSummary);
  push(b.quickSummary?.trim() || L.txtNone);

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export function downloadTextFileUtf8(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type { MorningBriefingLocale } from '@/lib/brief/morningBriefingLocale';
