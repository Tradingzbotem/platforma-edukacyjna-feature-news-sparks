'use client';

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export type Lang =
  | 'pl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl'
  | 'sv' | 'no' | 'da' | 'fi' | 'cs' | 'sk' | 'ro' | 'hu'
  | 'uk' | 'ru' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'el' | 'bg';

/* ───────── cookie & cache ───────── */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function useLang(defaultLang: Lang = 'pl'): Lang {
  const [lang, setLang] = useState<Lang>(defaultLang);
  useEffect(() => {
    const v = readCookie('lang') as Lang | null;
    setLang(v || defaultLang);
  }, [defaultLang]);
  return lang;
}

function hash(s: string) {
  let h = 0, i = 0;
  while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h.toString(36);
}

function getCache(lang: string, orig: string): string | null {
  try {
    const key = `tr:${lang}:${hash(orig)}`;
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function setCache(lang: string, orig: string, translated: string) {
  try {
    const key = `tr:${lang}:${hash(orig)}`;
    localStorage.setItem(key, JSON.stringify(translated));
  } catch {}
}

/* ───────── zbieranie tekstów ───────── */

function collectTextNodes(root: HTMLElement): Text[] {
  if (root.closest('[data-i18n-ignore]')) return [];

  const rejects = new Set(['SCRIPT', 'STYLE']);

  const tw = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node): number {
        if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (rejects.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-i18n-ignore]')) return NodeFilter.FILTER_REJECT;

        const raw = node.nodeValue ?? '';
        const txt = raw.replace(/\s+/g, ' ').trim();
        if (!txt) return NodeFilter.FILTER_REJECT;
        if (txt.length < 2 || /^[\d\s.,:;/%+–—\-()|]+$/.test(txt)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    } as unknown as NodeFilter
  );

  const out: Text[] = [];
  let n: Node | null;
  while ((n = tw.nextNode())) out.push(n as Text);
  return out;
}

/* ───────── widoczność / priorytety ───────── */

function isVisibleTextNode(n: Text, pad = 120): boolean {
  const el = n.parentElement;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  return rect.bottom >= -pad && rect.top <= vh + pad;
}

/* ───────── transport ───────── */

async function translateBatch(texts: string[], target: Lang): Promise<string[]> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target }),
  });
  if (!res.ok) {
    console.warn('i18n translate error HTTP', res.status);
    return texts;
  }
  const data = await res.json();
  const arr: string[] = Array.isArray(data?.translations) ? data.translations : [];
  if (arr.length !== texts.length) {
    console.warn('i18n translate mismatch', arr.length, texts.length);
    return texts;
  }
  return arr;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const ric = (cb: () => void) =>
  (typeof (window as any).requestIdleCallback === 'function'
    ? (window as any).requestIdleCallback(cb)
    : setTimeout(cb, 0));

/* ───────── main ───────── */

export async function autoTranslateContainer(container: HTMLElement, lang: Lang) {
  if (!container || !lang || lang === 'pl') return;

  const nodes = collectTextNodes(container);
  if (!nodes.length) return;

  // mapowanie oryginałów
  const originals: string[] = [];
  const nodeTexts: string[] = nodes.map(n => (n.nodeValue || '').replace(/\s+/g, ' ').trim());
  const mapIndex: number[] = [];
  const seen = new Map<string, number>();

  nodeTexts.forEach((t, i) => {
    if (seen.has(t)) mapIndex[i] = seen.get(t)!;
    else {
      const idx = originals.length;
      originals.push(t);
      seen.set(t, idx);
      mapIndex[i] = idx;
    }
  });

  // cache → natychmiast
  const cached: (string | null)[] = originals.map(o => getCache(lang, o));
  let translated: string[] = originals.map((_, i) => cached[i] ?? '');
  if (translated.some(Boolean)) {
    nodes.forEach((n, i) => {
      const t = translated[mapIndex[i]];
      if (t && t !== n.nodeValue) n.nodeValue = t;
    });
  }

  const missingOrigIdx = originals.map((_, i) => i).filter(i => !cached[i]);
  if (!missingOrigIdx.length) return;

  /* KLUCZOWE: ogranicz „pierwszą paczkę” widocznych unikatów */
  const VISIBLE_MAX = 120; // możesz zejść do 80, jeśli wciąż jest wolno
  const visibleOrdered: number[] = [];
  const hiddenSet = new Set<number>(missingOrigIdx);

  // Zbieraj w kolejności DOM tylko unikalne widoczne
  for (let i = 0; i < nodes.length && visibleOrdered.length < VISIBLE_MAX; i++) {
    const idx = mapIndex[i];
    if (!hiddenSet.has(idx)) continue;
    if (!visibleOrdered.includes(idx) && isVisibleTextNode(nodes[i])) {
      visibleOrdered.push(idx);
      hiddenSet.delete(idx);
    }
  }

  // 1) widoczne najpierw
  if (visibleOrdered.length) {
    const inputs = visibleOrdered.map(i => originals[i]);
    const fresh = await translateBatch(inputs, lang);
    fresh.forEach((t, j) => {
      const oi = visibleOrdered[j];
      translated[oi] = t;
      setCache(lang, originals[oi], t);
    });
    nodes.forEach((n, i) => {
      const idx = mapIndex[i];
      if (visibleOrdered.includes(idx)) {
        const text = translated[idx] || n.nodeValue;
        if (text && text !== n.nodeValue) n.nodeValue = text!;
      }
    });
  }

  // 2) reszta w tle (duże chunk’i)
  const leftover = Array.from(hiddenSet);
  if (leftover.length) {
    const BATCH_HIDDEN = 300;
    const chunks = chunk(leftover, BATCH_HIDDEN);

    const processHidden = async () => {
      for (const ch of chunks) {
        const inputs = ch.map(i => originals[i]);
        const fresh = await translateBatch(inputs, lang);
        fresh.forEach((t, j) => {
          const oi = ch[j];
          translated[oi] = t;
          setCache(lang, originals[oi], t);
        });
        nodes.forEach((n, i) => {
          const idx = mapIndex[i];
          if (!ch.includes(idx)) return;
          const text = translated[idx] || n.nodeValue;
          if (text && text !== n.nodeValue) n.nodeValue = text!;
        });
      }
    };

    ric(() => { void processHidden(); });
  }
}

/* ───────── hook ───────── */

export function useAutoTranslate(
  rootRef: RefObject<HTMLElement | null>,
  lang: Lang,
  bump?: any
) {
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let timer: any;
    const run = () => {
      clearTimeout(timer);
      timer = setTimeout(() => autoTranslateContainer(el, lang), 25);
    };

    run();

    const mo = new MutationObserver(() => run());
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(timer);
      mo.disconnect();
    };
  }, [rootRef, lang, bump]);
}
