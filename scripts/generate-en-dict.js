/* scripts/generate-en-dict.js
 * Scans the codebase for Polish text and generates EN translations,
 * merging them into lib/i18n-dict.ts under LOCAL_DICTIONARIES.en.
 *
 * Usage (PowerShell):
 *   $env:OPENAI_API_KEY="sk-...."
 *   node scripts/generate-en-dict.js
 *
 * Notes:
 * - Requires OPENAI_API_KEY in environment.
 * - Safe to run multiple times; only adds missing keys.
 */

const fs = require('fs');
const path = require('path');

const RE_DIAC = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
const RE_PUNCT_ONLY = /^[\d\s.,:;/%+–—\-()|]+$/;

const ROOT = process.cwd();
const TARGET_DICT = path.join(ROOT, 'lib', 'i18n-dict.ts');
const SCAN_DIRS = ['app', 'components', 'data'];
const VALID_EXT = new Set(['.ts', '.tsx']);

function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function walk(dir, out) {
  const abs = path.join(ROOT, dir);
  let entries = [];
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch { return; }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else {
      const ext = path.extname(ent.name);
      if (VALID_EXT.has(ext)) out.push(full);
    }
  }
}

function normalizeText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function extractCandidates(src) {
  const set = new Set();
  // 1) JSX text between > ... <
  const reBetween = />[^<]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^<]*</g;
  let m;
  while ((m = reBetween.exec(src))) {
    const raw = m[0].slice(1, -1); // drop > and <
    const norm = normalizeText(raw);
    if (norm.length >= 2 && !RE_PUNCT_ONLY.test(norm)) set.add(norm);
  }
  // 2) String literals: "..." or '...' or `...`
  const reStr = /(["'`])((?:(?!\1)[\s\S])*)\1/g;
  while ((m = reStr.exec(src))) {
    const raw = m[2];
    if (!RE_DIAC.test(raw)) continue;
    const norm = normalizeText(raw);
    if (norm.length >= 2 && !RE_PUNCT_ONLY.test(norm)) set.add(norm);
  }
  return set;
}

function parseExistingDictKeys(dictContent) {
  // Extract keys inside the en: { ... } object as string literals on the left side
  const keys = new Set();
  const start = dictContent.indexOf('\n  en: {');
  if (start === -1) return keys;
  const tail = dictContent.slice(start + 1);
  // naive scan until the matching "}," that closes the en object (followed by newline)
  const endMarker = '\n  },';
  const end = tail.indexOf(endMarker);
  const body = end !== -1 ? tail.slice(0, end) : tail;
  const reKey = /["]([^"\n]+)["]\s*:\s*["]/g; // matches "Polish": "
  let m;
  while ((m = reKey.exec(body))) keys.add(m[1]);
  return keys;
}

async function translateBatch(inputs) {
  if (!inputs.length) return inputs;
  if (!process.env.OPENAI_API_KEY && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY');
  }
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const system = `You are a professional translator for a trading education website (Forex/CFD).
Translate EACH input string to English.
Keep trading tickers/symbols (EUR/USD, NAS100, WTI), numbers, units and proper names intact.
Do NOT add explanations. Return ONLY valid JSON object:
{"translations":["...","..."]} with the SAME length and order as inputs.`;

  const user = JSON.stringify({ inputs, target: 'en' });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const content = completion.choices?.[0]?.message?.content ?? '';
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed?.translations) && parsed.translations.length === inputs.length) {
      return parsed.translations;
    }
  } catch {}
  // Fallback: echo inputs (should not happen often)
  return inputs;
}

async function main() {
  const files = [];
  for (const d of SCAN_DIRS) walk(d, files);

  const candidates = new Set();
  for (const file of files) {
    const src = readFileSafe(path.join(ROOT, file));
    if (!src) continue;
    const found = extractCandidates(src);
    for (const s of found) candidates.add(s);
  }

  const dictContent = readFileSafe(TARGET_DICT);
  if (!dictContent) {
    console.error('Dictionary file not found:', TARGET_DICT);
    process.exit(1);
  }
  const existing = parseExistingDictKeys(dictContent);

  const missing = Array.from(candidates).filter(k => !existing.has(k));
  missing.sort((a, b) => a.localeCompare(b));

  if (missing.length === 0) {
    console.log('No missing EN keys detected — dictionary is up to date.');
    return;
  }

  console.log(`Found ${missing.length} missing strings. Translating...`);

  const translated = {};
  const CHUNK = 120;
  for (let i = 0; i < missing.length; i += CHUNK) {
    const piece = missing.slice(i, i + CHUNK);
    const outs = await translateBatch(piece);
    outs.forEach((t, j) => {
      translated[piece[j]] = t || piece[j];
    });
    console.log(`  ${Math.min(i + CHUNK, missing.length)} / ${missing.length}`);
  }

  // Prepare insertion: before the closing of "en" object ("\n  },")
  const insertAt = dictContent.lastIndexOf('\n  },');
  if (insertAt === -1) {
    console.error('Could not locate closing brace for "en" dictionary.');
    process.exit(1);
  }

  const lines = Object.entries(translated).map(([pl, en]) => {
    const key = JSON.stringify(pl);
    const val = JSON.stringify(en);
    return `    , ${key}: ${val}`;
  }).join('\n');

  const updated =
    dictContent.slice(0, insertAt) +
    '\n' +
    lines +
    dictContent.slice(insertAt);

  fs.writeFileSync(TARGET_DICT, updated, 'utf8');
  console.log(`Dictionary updated: added ${missing.length} EN entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


