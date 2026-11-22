import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cardIds = ['fool', 'lovers', 'hermit', 'wheel', 'death', 'tower', 'sun'];
const dimensions = { width: 1200, height: 630 };

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function field(block, name, indent = 4) {
  const match = block.match(new RegExp(`^ {${indent}}${name}: '([^']*)',$`, 'm'));
  if (!match) throw new Error(`無法從 tarot.ts 讀取欄位：${name}`);
  return match[1];
}

function parseCards(source) {
  const starts = [...source.matchAll(/^    id: '([a-z]+)',$/gm)];
  const cards = starts.map((match, index) => {
    const block = source.slice(match.index, starts[index + 1]?.index ?? source.length);
    return {
      id: match[1],
      numeral: field(block, 'numeral'),
      name: field(block, 'name'),
      persona: field(block, 'persona'),
      concept: field(block, 'zh', 6),
      line: field(block, 'line', 6),
    };
  });
  if (cards.length !== cardIds.length || cards.some((card, index) => card.id !== cardIds[index])) {
    throw new Error(`tarot.ts 必須包含七張牌，順序為：${cardIds.join(', ')}`);
  }
  return cards;
}

function wrapText(value, maxCharacters = 22) {
  const result = [];
  let line = '';
  for (const character of value) {
    line += character;
    if (line.length >= maxCharacters && /[，。；：、！？]/u.test(character)) {
      result.push(line);
      line = '';
    } else if (line.length >= maxCharacters + 4) {
      result.push(line);
      line = '';
    }
  }
  if (line) result.push(line);
  return result;
}

function linesSvg(lines, { x, y, size, lineHeight, fill = '#d4d5d2', weight = 450 }) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`,
    )
    .join('');
}

function cardArtwork({ artwork, isBack, card }) {
  const cardX = 832;
  const cardY = 37;
  const cardWidth = 318;
  const cardHeight = 556;
  const image = `<image href="${artwork}" x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" preserveAspectRatio="xMidYMid meet" clip-path="url(#card-clip)"/>`;
  const overlay = isBack
    ? ''
    : `<text x="991" y="91" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-size="34" font-weight="700" fill="#111">${escapeXml(card.numeral)}</text><text x="1127" y="315" transform="rotate(90 1127 315)" text-anchor="middle" font-family="'Noto Sans CJK TC', sans-serif" font-size="24" font-weight="800" fill="#111">${escapeXml(card.name)}</text>`;
  return `<rect x="824" y="29" width="334" height="572" rx="16" fill="#f8f8f6" stroke="#c8c9c6" stroke-width="2"/><defs><clipPath id="card-clip"><rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="10"/></clipPath></defs>${image}${overlay}<rect x="838" y="43" width="306" height="544" rx="7" fill="none" stroke="${isBack ? '#ededeb' : '#151617'}" stroke-opacity="${isBack ? '.7' : '.8'}" stroke-width="1.5"/>`;
}

function makeSvg({ kind, card, logo, artwork }) {
  const logoBlock = `<image href="${logo}" x="67" y="47" width="254" height="69" preserveAspectRatio="xMinYMid meet"/>`;
  let content;

  if (kind === 'home') {
    content = `<text x="68" y="236" font-size="66" font-weight="850" fill="#fff">量子塔羅</text><text x="71" y="300" font-size="30" font-weight="650" fill="#f0f0ed">七張牌，七種量子態。</text><text x="71" y="361" font-size="23" fill="#bfc1bd">抽一張牌，看你此刻的量子樣貌。</text><text x="71" y="570" font-size="17" fill="#858783">QRACON 2026　·　量子塔羅</text>`;
  } else if (kind === 'deck') {
    content = `<text x="68" y="236" font-size="58" font-weight="850" fill="#fff">疊加牌組</text><text x="71" y="296" font-size="26" font-weight="600" fill="#f0f0ed">七張牌，各自對應一種量子態。</text>${linesSvg(['疊加、糾纏、測量、躍遷、退相干、淬火、相干光'], { x: 71, y: 347, size: 21, lineHeight: 34 })}<text x="71" y="570" font-size="17" fill="#858783">QRACON 2026　·　量子塔羅</text>`;
  } else {
    const conceptLines = wrapText(card.line, 21);
    const concept = linesSvg(conceptLines, { x: 72, y: 498, size: 22, lineHeight: 34, fill: '#d2d3d0' });
    content = `<text x="72" y="188" font-size="17" font-weight="600" letter-spacing="2" fill="#a8aaa6">QRACON 2026　／　量子狀態觀測報告</text><text x="68" y="278" font-family="'Barlow Condensed', sans-serif" font-size="62" font-weight="800" fill="#fff">${escapeXml(card.numeral)}</text><text x="71" y="348" font-size="48" font-weight="850" fill="#fff">${escapeXml(card.persona)}</text><text x="72" y="403" font-size="26" font-weight="600" fill="#dfe0dd">${escapeXml(card.name)}　${escapeXml(card.concept)}</text><path d="M72 438H744" stroke="#444643" stroke-width="1"/><text x="72" y="475" font-size="16" font-weight="700" letter-spacing="2" fill="#a8aaa6">觀測摘要</text>${concept}<text x="72" y="570" font-size="17" fill="#858783">QRACON 2026　·　量子塔羅</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" style="font-family:'Noto Sans CJK TC','Noto Sans TC',sans-serif"><rect width="1200" height="630" fill="#08090a"/><path d="M66 143H748" stroke="#414341" stroke-width="1"/><path d="M779 45V585" stroke="#292b2a" stroke-width="1"/>${logoBlock}${content}${cardArtwork({ artwork, isBack: kind !== 'card', card })}</svg>`;
}

async function tintLogo(sharp) {
  const source = await readFile(resolve(root, 'src/assets/brand/qracon-wordmark.png'));
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += info.channels) {
    data[index] = 255;
    data[index + 1] = 255;
    data[index + 2] = 255;
  }
  const white = await sharp(data, { raw: info }).png().toBuffer();
  return `data:image/png;base64,${white.toString('base64')}`;
}

async function pngData(file) {
  const bytes = await readFile(resolve(root, file));
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

async function writeOg(sharp, filename, props) {
  const svg = Buffer.from(makeSvg(props));
  const output = resolve(root, 'public/og', filename);
  await sharp(svg)
    .png({ compressionLevel: 9, palette: true, colors: 256, dither: 0 })
    .toFile(output);
  return output;
}

export async function buildOg(sharp) {
  const source = await readFile(resolve(root, 'src/data/tarot.ts'), 'utf8');
  const cards = parseCards(source);
  const logo = await tintLogo(sharp);
  const back = await pngData('src/assets/tarot/tarot-back.png');
  await mkdir(resolve(root, 'public/og'), { recursive: true });

  await writeOg(sharp, 'tarot.png', {
    kind: 'home',
    logo,
    artwork: back,
  });
  await writeOg(sharp, 'tarot-deck.png', {
    kind: 'deck',
    logo,
    artwork: back,
  });

  for (const card of cards) {
    await writeOg(sharp, `${card.id}.png`, {
      kind: 'card',
      card,
      logo,
      artwork: await pngData(`src/assets/tarot/tarot-${card.id}.png`),
    });
  }

  return resolve(root, 'public/og');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { default: sharp } = await import('sharp');
  const output = await buildOg(sharp);
  console.log(`已產生 9 張 OG 分享圖：${output}`);
}
