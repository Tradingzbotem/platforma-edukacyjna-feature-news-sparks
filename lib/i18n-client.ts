'use client';

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export type Lang =
  | 'pl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl'
  | 'sv' | 'no' | 'da' | 'fi' | 'cs' | 'sk' | 'ro' | 'hu'
  | 'uk' | 'ru' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'el' | 'bg';

/* ───────── cookie ───────── */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function useLang(defaultLang: Lang = 'pl'): Lang {
  const normalize = (v: Lang | null | undefined): Lang => (v === 'en' ? 'en' : 'pl');
  const [lang, setLang] = useState<Lang>(normalize(defaultLang));
  useEffect(() => {
    const readAndSet = () => {
      const v = readCookie('lang') as Lang | null;
      setLang(v === 'en' ? 'en' : 'pl');
    };
    // initial read
    readAndSet();
    // react to global language change events
    const onLangChange = () => readAndSet();
    if (typeof window !== 'undefined') {
      window.addEventListener('langchange', onLangChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('langchange', onLangChange);
      }
    };
  }, [defaultLang]);
  return lang;
}

// Kept for import compatibility; now implemented below

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

// Lightweight string hash for cache keys
function hash(str: string): string {
  let h = 2166136261 >>> 0; // FNV-1a basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
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
import { LOCAL_DICTIONARIES } from './i18n-dict';

async function translateBatch(texts: string[], target: Lang): Promise<string[]> {
  // Prefer local static dictionary; fallback to server translator for missing entries
  if (!target || target === 'pl') return texts;

  const dict = LOCAL_DICTIONARIES[target] || {};

  // First pass: try local dict
  const initial = texts.map((t) => (dict[t] ?? ''));
  const missingIdx: number[] = [];
  for (let i = 0; i < initial.length; i++) {
    if (!initial[i]) missingIdx.push(i);
  }

  // For English we render instantly using local dictionary only (no slow server fallback)
  if (target === 'en') {
    return texts.map((t) => dict[t] ?? t);
  }

  // If everything covered locally, return filled values (or originals)
  if (missingIdx.length === 0) {
    return texts.map((t) => dict[t] ?? t);
  }

  // Fallback: call server translator for the missing subset
  try {
    const inputs = missingIdx.map((i) => texts[i]);
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: inputs, target }),
    });

    if (res.ok) {
      const data = await res.json();
      const translations: string[] = Array.isArray(data?.translations) ? data.translations as string[] : inputs;
      missingIdx.forEach((idx, j) => {
        initial[idx] = (translations[j] ?? inputs[j]) || inputs[j];
      });
    } else {
      // Server not available — use originals for missing slots
      missingIdx.forEach((idx) => { initial[idx] = texts[idx]; });
    }
  } catch {
    // Network/other error — use originals for missing slots
    missingIdx.forEach((idx) => { initial[idx] = texts[idx]; });
  }

  // Merge local + server translations; ensure no empty strings remain
  return initial.map((v, i) => v || texts[i]);
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
  _rootRef: RefObject<HTMLElement | null>,
  _lang: Lang,
  _bump?: any
) {
  /* no-op */
}
