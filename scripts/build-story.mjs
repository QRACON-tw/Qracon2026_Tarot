import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { env } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { brotliDecompressSync } from 'node:zlib';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cardIds = ['fool', 'lovers', 'hermit', 'wheel', 'death', 'tower', 'sun'];
const canvas = { width: 1080, height: 1920 };
// Instagram draws its own UI over a Story; Meta advises keeping content out of the top 14% (250 px) and the bottom 250 px.
const safe = { top: 250, bottom: 1670, side: 96 };
// Card.astro was tuned for a 204 px wide card on the result page; every px value in its CSS scales by this factor.
const card = { width: 340, referenceWidth: 204 };

const labels = {
  title: '量子狀態觀測報告',
  stats: [
    ['superposition', '疊加'],
    ['entanglement', '糾纏'],
    ['coherence', '相干'],
    ['energy', '能階'],
  ],
  partner: '最佳量子夥伴',
  rival: '最強相剋量子',
  invite: '也抽一張你的量子態',
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseCards(source) {
  const starts = [...source.matchAll(/^    id: '([a-z]+)',$/gm)];
  const cards = starts.map((match, index) => {
    const id = match[1];
    const block = source.slice(match.index, starts[index + 1]?.index ?? source.length);
    const missing = (label) => new Error(`Card "${id}": field "${label}" not found in src/data/tarot.ts`);
    const text = (name, indent = 4, label = name) => {
      const found = block.match(new RegExp(`^ {${indent}}${name}: '([^']*)',$`, 'm'));
      if (!found) throw missing(label);
      return found[1];
    };
    const link = (name) => {
      const found = block.match(new RegExp(`^ {4}${name}: \\{ id: '([a-z]+)',`, 'm'));
      if (!found) throw missing(`${name}.id`);
      return found[1];
    };
    const statsLine = block.match(/^ {4}stats: \{ ([^}]*) \},$/m);
    const statValue = (name) => {
      const found = statsLine?.[1].match(new RegExp(`\\b${name}: (\\d+)\\b`));
      if (!found) throw missing(`stats.${name}`);
      const value = Number(found[1]);
      if (value > 100) throw new Error(`Card "${id}": stats.${name} is ${value}, expected 0-100`);
      return value;
    };
    return {
      id,
      numeral: text('numeral'),
      name: text('name'),
      nameEn: text('nameEn'),
      persona: text('persona'),
      concept: text('zh', 6, 'concept.zh'),
      quote: text('quote', 6, 'reading.quote'),
      stats: Object.fromEntries(labels.stats.map(([name]) => [name, statValue(name)])),
      partnerId: link('partner'),
      rivalId: link('rival'),
    };
  });
  if (cards.length !== cardIds.length || cards.some((entry, index) => entry.id !== cardIds[index])) {
    throw new Error(`src/data/tarot.ts must contain exactly these cards in this order: ${cardIds.join(', ')}`);
  }
  for (const entry of cards) {
    for (const [field, target] of [['partner.id', entry.partnerId], ['rival.id', entry.rivalId]]) {
      if (!cards.some((other) => other.id === target)) {
        throw new Error(`Card "${entry.id}": ${field} "${target}" is not one of the cards`);
      }
    }
  }
  return cards;
}

async function findFonts() {
  const dir = resolve(root, '.astro/fonts');
  const names = await readdir(dir).catch(() => []);
  const newest = async (pattern) => {
    const files = await Promise.all(
      names
        .filter((name) => pattern.test(name))
        .map(async (name) => ({ file: join(dir, name), mtime: (await stat(join(dir, name))).mtimeMs })),
    );
    return files.sort((a, b) => b.mtime - a.mtime)[0]?.file;
  };
  const fonts = {
    noto: await newest(/^font-noto-sans-tc-.+\.woff2$/),
    barlow800: await newest(/^font-barlow-condensed-800-.+\.woff2$/),
    barlow600: await newest(/^font-barlow-condensed-600-.+\.woff2$/),
  };
  if (Object.values(fonts).some((file) => !file)) {
    throw new Error('Site fonts not found in .astro/fonts; run pnpm build first.');
  }
  return fonts;
}

// Same rule as siteGlyphs() in astro.config.mjs, which decides what the Noto Sans TC file contains.
function siteGlyphs() {
  const srcDir = resolve(root, 'src');
  const glyphs = new Set();
  for (let code = 0x20; code < 0x7f; code += 1) glyphs.add(String.fromCharCode(code));
  for (const file of readdirSync(srcDir, { recursive: true })) {
    if (!/\.(astro|ts|css)$/.test(file)) continue;
    for (const char of readFileSync(join(srcDir, file), 'utf8')) {
      if (char > '~') glyphs.add(char);
    }
  }
  return glyphs;
}

// Code points the WOFF2 file really maps. The cache in .astro/fonts is only refreshed by pnpm build, so it can lag behind src/.
// The cmap is the one table WOFF2 stores untransformed; the Google subsets used here carry a BMP-only format 4 subtable.
function fontCodePoints(file) {
  const buffer = readFileSync(file);
  if (buffer.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file} is not a WOFF2 file`);
  const tableCount = buffer.readUInt16BE(12);
  const compressedSize = buffer.readUInt32BE(20);
  let position = 48;
  const readBase128 = () => {
    let value = 0;
    for (let count = 0; count < 5; count += 1) {
      const byte = buffer[position++];
      value = value * 128 + (byte & 0x7f);
      if (byte < 0x80) return value;
    }
    throw new Error(`${file} has a malformed table directory`);
  };
  let cmapStart = 0;
  let cmapSize = 0;
  let offset = 0;
  for (let index = 0; index < tableCount; index += 1) {
    const flags = buffer[position++];
    const known = flags & 0x3f;
    if (known === 0x3f) position += 4;
    const original = readBase128();
    const transformed = known === 10 || known === 11 ? flags >> 6 === 0 : flags >> 6 !== 0;
    const stored = transformed ? readBase128() : original;
    if (known === 0) [cmapStart, cmapSize] = [offset, stored];
    offset += stored;
  }
  const data = brotliDecompressSync(buffer.subarray(position, position + compressedSize));
  const view = new DataView(data.buffer, data.byteOffset + cmapStart, cmapSize);
  const points = new Set();
  for (let record = 0; record < view.getUint16(2); record += 1) {
    const table = view.getUint32(8 + record * 8);
    if (view.getUint16(table) !== 4) continue;
    const segments = view.getUint16(table + 6) / 2;
    const ends = table + 14;
    const starts = ends + segments * 2 + 2;
    const deltas = starts + segments * 2;
    const ranges = deltas + segments * 2;
    for (let segment = 0; segment < segments; segment += 1) {
      const start = view.getUint16(starts + segment * 2);
      const end = view.getUint16(ends + segment * 2);
      const delta = view.getInt16(deltas + segment * 2);
      const rangeOffset = view.getUint16(ranges + segment * 2);
      for (let code = start; code <= end && code < 0xffff; code += 1) {
        let glyph = (code + delta) & 0xffff;
        if (rangeOffset !== 0) {
          glyph = view.getUint16(ranges + segment * 2 + rangeOffset + (code - start) * 2);
          if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph !== 0) points.add(code);
      }
    }
  }
  return points;
}

function assertGlyphs(strings, notoFile) {
  const inSrc = siteGlyphs();
  const inFont = fontCodePoints(notoFile);
  const notInSrc = new Set();
  const notInFont = new Set();
  for (const value of strings) {
    for (const char of value) {
      if (!inSrc.has(char)) notInSrc.add(char);
      else if (!inFont.has(char.codePointAt(0))) notInFont.add(char);
    }
  }
  const list = (chars) =>
    [...chars].map((char) => `${char} (U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`).join(', ');
  if (notInSrc.size > 0) {
    throw new Error(`Characters missing from the site font subset (used nowhere in src/): ${list(notInSrc)}`);
  }
  if (notInFont.size > 0) {
    throw new Error(`The Noto Sans TC file in .astro/fonts is older than src/ and lacks: ${list(notInFont)}; run pnpm build first.`);
  }
}

// ASTRO_SITE and ASTRO_BASE_PATH resolve the same way as in astro.config.mjs; the URL is shown without the protocol.
function displayUrl() {
  const site = env.ASTRO_SITE || 'https://qracon.entangletech.tw';
  const base = (env.ASTRO_BASE_PATH ?? '/2026/tarot') || '/';
  const host = site.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/+$/, '');
  const path = base.replace(/^\/+|\/+$/g, '');
  return path ? `${host}/${path}` : host;
}

// Breaking only after punctuation keeps a long quote from splitting in the middle of a phrase.
function quotePhrases(quote) {
  const phrases = quote.match(/.+?(?:[，。？！；：、]+[」』）]*|$)/gu) ?? [];
  return phrases.join('') === quote ? phrases : [quote];
}

function renderPage({ entry, cards, fonts, url, logo, art }) {
  const used = [];
  const text = (value) => {
    used.push(value);
    return escapeHtml(value);
  };
  const byId = (id) => cards.find((candidate) => candidate.id === id);
  const k = card.width / card.referenceWidth;
  const file = (path) => pathToFileURL(path).href;

  const statCells = labels.stats
    .map(
      ([name, label]) =>
        `<div class="stat"><p class="stat__label">${text(label)}</p><p class="stat__value">${text(String(entry.stats[name]))}</p><span class="stat__track"><span class="stat__fill" style="width:${entry.stats[name]}%"></span></span></div>`,
    )
    .join('');

  const matchCells = [
    [labels.partner, byId(entry.partnerId)],
    [labels.rival, byId(entry.rivalId)],
  ]
    .map(
      ([label, target]) =>
        `<div class="match__cell"><p class="match__label">${text(label)}</p><p class="match__target"><span class="num">${text(target.numeral)}</span> ${text(target.name)}</p></div>`,
    )
    .join('');

  const quote = quotePhrases(entry.quote)
    .map((phrase) => `<span class="phrase">${escapeHtml(phrase)}</span>`)
    .join('');
  used.push(entry.quote);

  const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<title>${text(entry.persona)}</title>
<style>
@font-face { font-family: 'Noto Sans TC'; src: url("${file(fonts.noto)}") format('woff2'); font-weight: 400 900; font-style: normal; font-display: block; }
@font-face { font-family: 'Barlow Condensed'; src: url("${file(fonts.barlow800)}") format('woff2'); font-weight: 800; font-style: normal; font-display: block; }
@font-face { font-family: 'Barlow Condensed'; src: url("${file(fonts.barlow600)}") format('woff2'); font-weight: 600; font-style: normal; font-display: block; }

:root {
  --color-ink: #000;
  --color-white: #fff;
  --color-on-ink-soft: #b3b3b3;
  --color-on-ink-rule: #4d4d4d;
  --font-sans: 'Noto Sans TC', sans-serif;
  --font-sign: 'Barlow Condensed', sans-serif;
  --space-2: 8px;
  --rule-thin: 1.5px;
  --rule-hair: 1px;
  --radius-chip: 4px;
  --radius-tile: 3px;
  --leading-tight: 1.15;
  --k: ${k};
}

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html, body {
  width: ${canvas.width}px;
  height: ${canvas.height}px;
  overflow: hidden;
  background: var(--color-ink);
  color: var(--color-white);
  font-family: var(--font-sans);
  line-height: 1.4;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

img { display: block; }

.safe {
  position: absolute;
  top: ${safe.top}px;
  left: ${safe.side}px;
  width: ${canvas.width - safe.side * 2}px;
  height: ${safe.bottom - safe.top}px;
  padding-block: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--color-white);
}

.top__mark { height: 72px; width: auto; filter: brightness(0) invert(1); }

.top__title { font-size: 32px; font-weight: 700; letter-spacing: 0.04em; line-height: 1.2; }

.hero { display: grid; justify-items: center; }

/* Card.astro, with every px value scaled by --k. */
.card {
  position: relative;
  display: grid;
  width: ${card.width}px;
  aspect-ratio: 4 / 7;
  container-type: inline-size;
  border: calc(var(--rule-thin) * var(--k)) solid var(--color-ink);
  border-radius: calc(var(--radius-chip) * var(--k));
  background: var(--color-white);
  color: var(--color-ink);
}

.card::before {
  content: '';
  position: absolute;
  inset: calc(var(--space-2) * var(--k));
  z-index: 1;
  border: calc(var(--rule-hair) * var(--k)) solid var(--color-ink);
  border-radius: calc(var(--radius-tile) * var(--k));
  pointer-events: none;
}

.card__inner { display: contents; }

.card__face {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: var(--color-white);
}

.card__art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 0.88;
}

.card__numeral {
  position: absolute;
  inset-block-start: calc(var(--space-2) * var(--k) + 2cqw);
  inset-inline: 0;
  text-align: center;
  font-family: var(--font-sign);
  font-weight: 800;
  font-size: 16cqw;
  line-height: 1;
  letter-spacing: 0.08em;
  padding-inline-start: 0.08em;
}

.card__caption {
  position: absolute;
  inset-inline: calc(var(--space-2) * var(--k));
  inset-block-end: calc(var(--space-2) * var(--k));
  display: grid;
  justify-items: center;
  gap: 1.5cqw;
  padding: 2.5cqw 3cqw 3.5cqw;
  border-radius: 0 0 calc(var(--radius-tile) * var(--k)) calc(var(--radius-tile) * var(--k));
  background: var(--color-white);
  text-align: center;
}

.card__name-en {
  font-family: var(--font-sign);
  font-weight: 800;
  font-size: 7.5cqw;
  line-height: 1.1;
  letter-spacing: 0.1em;
  padding-inline-start: 0.1em;
  text-transform: uppercase;
  text-wrap: balance;
}

.card__persona {
  font-family: var(--font-sans);
  font-weight: 900;
  font-size: 10cqw;
  line-height: var(--leading-tight);
  letter-spacing: 0.02em;
  padding-inline-start: 0.02em;
  text-wrap: balance;
}

.hero__persona {
  margin-top: 28px;
  font-size: 84px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.hero__name { margin-top: 8px; color: var(--color-on-ink-soft); font-size: 34px; font-weight: 500; line-height: 1.3; }

.hero__sep { margin-inline: 0.5em; }

.hero__quote { margin-top: 16px; font-size: 34px; font-weight: 700; line-height: 1.45; text-wrap: balance; }

.phrase { white-space: nowrap; }

.data { display: grid; gap: 28px; width: 100%; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 28px; }

.stat__label { color: var(--color-on-ink-soft); font-size: 28px; font-weight: 700; letter-spacing: 0.04em; line-height: 1.3; }

.stat__value {
  font-family: var(--font-sign);
  font-weight: 800;
  font-size: 76px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat__track { display: block; height: 6px; margin-top: 10px; background: var(--color-on-ink-rule); }

.stat__fill { display: block; height: 100%; background: var(--color-white); }

.match { display: grid; grid-template-columns: 1fr 1fr; }

.match__cell + .match__cell { border-inline-start: 2px solid var(--color-on-ink-rule); }

.match__label { color: var(--color-on-ink-soft); font-size: 28px; font-weight: 700; letter-spacing: 0.04em; line-height: 1.3; }

.match__target { font-size: 42px; font-weight: 900; line-height: 1.3; }

.num { font-family: var(--font-sign); font-weight: 800; letter-spacing: 0.04em; }

.foot { display: grid; justify-items: center; gap: 4px; }

.foot__invite { color: var(--color-on-ink-soft); font-size: 30px; font-weight: 500; line-height: 1.3; }

.foot__url { font-family: var(--font-sign); font-weight: 600; font-size: 46px; letter-spacing: 0.04em; line-height: 1.15; }
</style>
</head>
<body>
<main class="safe">
  <header class="top">
    <img class="top__mark" src="${file(logo)}" alt="">
    <p class="top__title">${text(labels.title)}</p>
  </header>

  <section class="hero">
    <span class="card">
      <span class="card__inner">
        <span class="card__face">
          <img class="card__art" src="${file(art)}" alt="">
          <span class="card__numeral">${text(entry.numeral)}</span>
          <span class="card__caption">
            <span class="card__name-en">${text(entry.nameEn)}</span>
            <span class="card__persona">${text(entry.persona)}</span>
          </span>
        </span>
      </span>
    </span>
    <h1 class="hero__persona">${text(entry.persona)}</h1>
    <p class="hero__name">${text(entry.name)} ${text(entry.nameEn)}<span class="hero__sep">/</span>${text(entry.concept)}</p>
    <p class="hero__quote">${quote}</p>
  </section>

  <div class="data">
    <div class="stats">${statCells}</div>
    <div class="match">${matchCells}</div>
  </div>

  <footer class="foot">
    <p class="foot__invite">${text(labels.invite)}</p>
    <p class="foot__url">${text(url)}</p>
  </footer>
</main>
</body>
</html>
`;
  return { html, used };
}

async function findChrome() {
  const defaults = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    win32: [env.PROGRAMFILES, env.LOCALAPPDATA].filter(Boolean).map((dir) => join(dir, 'Google/Chrome/Application/chrome.exe')),
  };
  const candidates = env.CHROME_PATH ? [env.CHROME_PATH] : (defaults[process.platform] ?? ['google-chrome', 'chromium']);
  for (const candidate of candidates) {
    if (isAbsolute(candidate)) {
      if (existsSync(candidate)) return candidate;
    } else {
      try {
        await execFileAsync(candidate, ['--version']);
        return candidate;
      } catch {
        // Not on PATH; try the next candidate.
      }
    }
  }
  const origin = env.CHROME_PATH ? 'CHROME_PATH does not point to a usable browser' : 'Google Chrome not found';
  throw new Error(`${origin}. Tried: ${candidates.join(', ')}. Install Chrome or set CHROME_PATH to its executable.`);
}

async function screenshot(chrome, { page, output, profile }) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    // Keeps text anti-aliasing neutral gray on every platform (the stories are pure grayscale).
    '--disable-lcd-text',
    '--force-device-scale-factor=1',
    `--window-size=${canvas.width},${canvas.height}`,
    '--virtual-time-budget=8000',
    '--allow-file-access-from-files',
    // A throwaway profile keeps the run away from the user's own Chrome profile.
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--screenshot=${output}`,
    pathToFileURL(page).href,
  ];
  try {
    await execFileAsync(chrome, args, { timeout: 120_000, maxBuffer: 16 * 1024 * 1024 });
  } catch (error) {
    throw new Error(`Chrome failed to render ${page}: ${error.message}`);
  }
  if (!existsSync(output)) throw new Error(`Chrome exited without writing ${output}`);
}

// Everything outside the safe band and the side margins must stay pure black, and no pixel may carry a hue (this also keeps the 256-color palette lossless).
async function assertPixelRules(id, file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y += 1) {
    const outsideBand = y < safe.top || y >= safe.bottom;
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      if (r !== g || g !== b) throw new Error(`Story "${id}": pixel (${x}, ${y}) is not neutral gray (rgb ${r}, ${g}, ${b})`);
      if (r !== 0 && (outsideBand || x < safe.side || x >= info.width - safe.side)) {
        throw new Error(`Story "${id}": content at (${x}, ${y}) is outside the safe area (y ${safe.top}-${safe.bottom - 1}, side margins ${safe.side} px)`);
      }
    }
  }
}

async function main() {
  const keep = process.argv.includes('--keep');
  const unknown = process.argv.slice(2).filter((arg) => arg !== '--keep');
  if (unknown.length > 0) throw new Error(`Unknown argument: ${unknown.join(' ')} (supported: --keep)`);

  const cards = parseCards(readFileSync(resolve(root, 'src/data/tarot.ts'), 'utf8'));
  const fonts = await findFonts();
  const url = displayUrl();
  const logo = resolve(root, 'src/assets/brand/qracon-wordmark.png');

  const pages = cards.map((entry) => ({
    entry,
    ...renderPage({ entry, cards, fonts, url, logo, art: resolve(root, `src/assets/tarot/tarot-${entry.id}.png`) }),
  }));
  assertGlyphs(pages.flatMap((page) => page.used), fonts.noto);

  const chrome = await findChrome();
  const work = await mkdtemp(join(tmpdir(), 'qracon-story-'));
  try {
    await mkdir(join(work, 'out'));
    for (const { entry, html } of pages) {
      const page = join(work, `${entry.id}.html`);
      const shot = join(work, `${entry.id}.shot.png`);
      const output = join(work, 'out', `${entry.id}.png`);
      await writeFile(page, html);
      await screenshot(chrome, { page, output: shot, profile: join(work, 'profile') });

      const { width, height } = await sharp(shot).metadata();
      if (width !== canvas.width || height !== canvas.height) {
        throw new Error(`Screenshot for "${entry.id}" is ${width}x${height}, expected ${canvas.width}x${canvas.height}`);
      }
      await sharp(shot).removeAlpha().png({ compressionLevel: 9, palette: true, colors: 256, dither: 0 }).toFile(output);
      await assertPixelRules(entry.id, output);
    }

    // Copy only after every card passed, so a failed run never leaves public/story half updated.
    const target = resolve(root, 'public/story');
    await mkdir(target, { recursive: true });
    for (const { entry } of pages) {
      const destination = join(target, `${entry.id}.png`);
      await copyFile(join(work, 'out', `${entry.id}.png`), destination);
      const { size } = await stat(destination);
      console.log(`${relative(root, destination)}  ${(size / 1024).toFixed(1)} KB${size > 400 * 1024 ? '  (over the 400 KB target)' : ''}`);
    }
    console.log(`Generated ${pages.length} story images in ${relative(root, target)}`);
  } finally {
    if (keep) console.log(`Kept working files: ${work}`);
    else await rm(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
}

await main();
