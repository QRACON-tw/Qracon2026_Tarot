import { CARD_IDS, cards, type CardId, type TarotCard } from '../data/tarot';
import { sitePath } from './paths';

export const TAROT_INDEXABLE: boolean = false;

const LINE_MAX = 24;
const NOTE_MAX = 70;
const STAT_KEYS = ['superposition', 'entanglement', 'coherence', 'energy'] as const;
const FORBIDDEN_TERMS = ['坍縮', 'SSS', 'NFC', 'QXP', '冒險者'] as const;
const ROMAN: readonly (readonly [number, string])[] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export const cardPath = (id: CardId) => sitePath(`/deck/${id}/`);

export function getIndexablePaths(): string[] {
  if (!TAROT_INDEXABLE) return [];
  return ['/', '/deck/', ...CARD_IDS.map((id) => `/deck/${id}/`)];
}

const byId = new Map(cards.map((card) => [card.id, card]));

export function cardById(id: CardId): TarotCard {
  const card = byId.get(id);
  if (!card) throw new Error(`Unknown tarot card: ${id}`);
  return card;
}

function toRoman(value: number): string {
  if (value === 0) return '0';
  let rest = value;
  let out = '';
  for (const [size, glyph] of ROMAN) {
    while (rest >= size) {
      out += glyph;
      rest -= size;
    }
  }
  return out;
}

function collectStrings(value: unknown, path: string, out: [string, string][]): void {
  if (typeof value === 'string') out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'art') continue;
      collectStrings(item, `${path}.${key}`, out);
    }
  }
}

export function validateCards(list: readonly TarotCard[]): void {
  const problems: string[] = [];
  const ids = list.map((card) => card.id);
  const idSet = new Set<string>(ids);

  if (list.length !== CARD_IDS.length) {
    problems.push(`expected ${CARD_IDS.length} cards, found ${list.length}`);
  }
  for (const id of CARD_IDS) {
    if (!idSet.has(id)) problems.push(`missing card id "${id}"`);
  }
  for (const id of idSet) {
    const count = ids.filter((other) => other === id).length;
    if (count > 1) problems.push(`duplicate card id "${id}" (${count}x)`);
    if (!(CARD_IDS as readonly string[]).includes(id)) problems.push(`unknown card id "${id}"`);
  }

  for (const card of list) {
    const tag = `[${card.id}]`;

    for (const side of ['partner', 'rival'] as const) {
      const target = card[side].id;
      if (!idSet.has(target)) problems.push(`${tag} ${side} "${target}" does not exist`);
      if (target === card.id) problems.push(`${tag} ${side} must not point to itself`);
    }

    for (const key of STAT_KEYS) {
      const value = card.stats[key];
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        problems.push(`${tag} stats.${key} must be an integer 0-100, got ${value}`);
      }
    }

    if (card.personaParts && card.personaParts.join('') !== card.persona) {
      problems.push(`${tag} personaParts must join into persona "${card.persona}"`);
    }

    const expected = toRoman(card.arcana);
    if (card.numeral !== expected) {
      problems.push(`${tag} numeral "${card.numeral}" does not match arcana ${card.arcana} ("${expected}")`);
    }

    const lineLength = [...card.concept.line].length;
    if (lineLength > LINE_MAX) problems.push(`${tag} concept.line is ${lineLength} chars (max ${LINE_MAX})`);
    const noteLength = [...card.concept.note].length;
    if (noteLength > NOTE_MAX) problems.push(`${tag} concept.note is ${noteLength} chars (max ${NOTE_MAX})`);

    const strings: [string, string][] = [];
    collectStrings(card, tag, strings);
    for (const [path, text] of strings) {
      if (/\p{Extended_Pictographic}/u.test(text)) problems.push(`${path} contains an emoji`);
      for (const term of FORBIDDEN_TERMS) {
        if (text.includes(term)) problems.push(`${path} contains forbidden term "${term}"`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`validateCards found ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  }
}
