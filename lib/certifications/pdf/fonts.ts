import 'server-only';

import fs from 'fs';
import path from 'path';

import { Font } from '@react-pdf/renderer';

/**
 * Noto Sans (OFL) — TTF z `assets/noto-sans`.
 * Rejestracja przez data URL (readFileSync + base64), żeby uniknąć `fontkit.open(ścieżka)` —
 * na Windows + Next dev sporadycznie potrafiło to wisieć bez końca.
 */
const ASSET_DIR = path.join(process.cwd(), 'lib', 'certifications', 'pdf', 'assets', 'noto-sans');

function fontPath(name: string): string {
  return path.join(ASSET_DIR, name);
}

function loadFontDataUrl(fileName: string): string {
  const p = fontPath(fileName);
  if (!fs.existsSync(p)) {
    throw new Error(`[certifications/pdf] Brak pliku fontu: ${p}`);
  }
  const buf = fs.readFileSync(p);
  return `data:font/ttf;base64,${buf.toString('base64')}`;
}

let registered = false;

export function registerCertificatePdfFonts(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'NotoSans',
    fonts: [
      { src: loadFontDataUrl('NotoSans-Regular.ttf'), fontWeight: 400, fontStyle: 'normal' },
      { src: loadFontDataUrl('NotoSans-Bold.ttf'), fontWeight: 700, fontStyle: 'normal' },
      { src: loadFontDataUrl('NotoSans-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
      { src: loadFontDataUrl('NotoSans-BoldItalic.ttf'), fontWeight: 700, fontStyle: 'italic' },
    ],
  });
}
