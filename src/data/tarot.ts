import type { ImageMetadata } from 'astro';

export const CARD_IDS = ['fool', 'lovers', 'hermit', 'wheel', 'death', 'tower', 'sun'] as const;

export type CardId = (typeof CARD_IDS)[number];

export interface TarotCard {
  id: CardId;
  arcana: number;
  numeral: string;
  name: string;
  nameEn: string;
  persona: string;
  personaEn: string;
  concept: {
    zh: string;
    en: string;
    line: string;
    note: string;
  };
  art: ImageMetadata | null;
  reading: {
    fortune: string;
    quote: string;
    traits: [string, string];
  };
  partner: { id: CardId; why: string };
  rival: { id: CardId; why: string };
  stats: { superposition: number; entanglement: number; coherence: number; energy: number };
}

export const cards: readonly TarotCard[] = [
  {
    id: 'fool',
    arcana: 0,
    numeral: '0',
    name: '愚者',
    nameEn: 'The Fool',
    persona: '疊加態混亂人',
    personaEn: 'Superposition Chaos',
    concept: {
      zh: '疊加態',
      en: 'Superposition',
      line: '觀測之前，兩種結果同時存在，還能互相干涉。',
      note: '疊加態跟「蓋著牌還不知道答案」不一樣。觀測前，幾種可能同時存在，而且會互相干涉；到你觀測的那一刻，才塌縮成一個結果。',
    },
    art: null,
    reading: {
      fortune: '接下來是新的開始。還沒決定的事，現在都還留著每一種可能。',
      quote: '「選擇困難？不，我全都同時存在。」',
      traits: ['午餐同時想吃 A 又想吃 B，直到店員開口問才決定。', '事情不砸到頭上，不會開始塌縮。'],
    },
    partner: { id: 'wheel', why: '兩個都不照計畫走，湊在一起反而很好玩。' },
    rival: { id: 'hermit', why: '一被觀測就塌縮，隱士偏偏最會盯著人看。' },
    stats: { superposition: 95, entanglement: 40, coherence: 70, energy: 30 },
  },
  {
    id: 'lovers',
    arcana: 6,
    numeral: 'VI',
    name: '戀人',
    nameEn: 'The Lovers',
    persona: '糾纏態純愛戰士',
    personaEn: 'Entangled Devotion',
    concept: {
      zh: '量子糾纏',
      en: 'Entanglement',
      line: '兩個系統共用同一個量子態，沒辦法拆開單獨描述。',
      note: '糾纏的兩顆粒子，測量前沒有各自的確定狀態；量了其中一顆，另一顆立刻對應。但單看一邊只是隨機，不能用來超光速傳訊息。',
    },
    art: null,
    reading: {
      fortune: '你離自己真正的想法越來越近。接下來會比較清楚自己想要什麼。',
      quote: '「就算隔著很遠，我也知道你現在在想什麼。」',
      traits: ['朋友一開口，你就知道他要講哪一句。', '很黏，但還是要保有一點自己的神祕感。'],
    },
    partner: { id: 'sun', why: '一個綁得緊，一個排得齊，兩個都很同步。' },
    rival: { id: 'death', why: '讓糾纏斷掉的是環境，不是距離。' },
    stats: { superposition: 45, entanglement: 95, coherence: 70, energy: 55 },
  },
  {
    id: 'hermit',
    arcana: 9,
    numeral: 'IX',
    name: '隱士',
    nameEn: 'The Hermit',
    persona: '觀測者冷酷貓',
    personaEn: 'The Observer',
    concept: {
      zh: '測量與塌縮',
      en: 'Measurement & Collapse',
      line: '被測量的那一刻，你就只剩一種樣子。',
      note: '測量會讓疊加態投影到單一結果。至於為什麼會塌縮，量子力學到現在還沒有共識。',
    },
    art: null,
    reading: {
      fortune: '你已經想得夠久了。想不會讓事情前進。',
      quote: '「勿擾模式。別隨便觀測我，但我一眼就能看穿你。」',
      traits: ['理性優先，討厭被熱情招呼。', '看局勢很快，第一眼通常就對。'],
    },
    partner: { id: 'death', why: '一個在除錯，一個在盯數據，同一個空間各做各的，不用講話。' },
    rival: { id: 'sun', why: '太陽不需要你同意，就能把整個房間照亮。' },
    stats: { superposition: 30, entanglement: 10, coherence: 15, energy: 20 },
  },
  {
    id: 'wheel',
    arcana: 10,
    numeral: 'X',
    name: '命運之輪',
    nameEn: 'Wheel of Fortune',
    persona: '躍遷幸運星',
    personaEn: 'Lucky Transition',
    concept: {
      zh: '能階躍遷',
      en: 'Energy Level Transition',
      line: '吸收一顆能量剛好的光子，跳上更高的能階。',
      note: '原子這類束縛系統的能量不連續，只能停在特定能階，吸收能量剛好的光子才跳得上去；什麼時候掉回來、放出光子，是真正的量子隨機。',
    },
    art: null,
    reading: {
      fortune: '停滯會結束，接下來會出現一個明顯的轉折。',
      quote: '「等到剛好的那顆光子，我就跳。」',
      traits: ['平常看起來在摸魚，關鍵時刻一次做完。', '抽獎運意外地好。'],
    },
    partner: { id: 'fool', why: '一個靠運氣，一個靠順其自然，兩個人都不看行事曆。' },
    rival: { id: 'death', why: '工程師要系統穩定，幸運星隨時在換能階。' },
    stats: { superposition: 65, entanglement: 35, coherence: 40, energy: 90 },
  },
  {
    id: 'death',
    arcana: 13,
    numeral: 'XIII',
    name: '死神',
    nameEn: 'Death',
    persona: '退相干爆肝工程師',
    personaEn: 'Decoherence Engineer',
    concept: {
      zh: '退相干',
      en: 'Decoherence',
      line: '跟環境糾纏得越多，干涉條紋就越淡。',
      note: '退相干抹掉的是條紋的對比，波本身沒有變成直線。系統跟環境接觸越久，看起來就越像普通的機率。',
    },
    art: null,
    reading: {
      fortune: '接下來會有一次大的變動。舊的版本不用硬留。',
      quote: '「舊的檔案刪掉，新的程式才跑得動。」',
      traits: ['經常瀕臨當機，重開機後又是一條好漢。', '看過太多錯誤視窗，已經不太會慌。'],
    },
    partner: { id: 'hermit', why: '安靜的人跟安靜的人，最不需要解釋。' },
    rival: { id: 'wheel', why: '一個照步驟除錯，一個隨時亂跳。工程師會先壞掉。' },
    stats: { superposition: 15, entanglement: 25, coherence: 10, energy: 15 },
  },
  {
    id: 'tower',
    arcana: 16,
    numeral: 'XVI',
    name: '塔',
    nameEn: 'The Tower',
    persona: '淬火災難大師',
    personaEn: 'Quench Master',
    concept: {
      zh: '量子淬火',
      en: 'Quantum Quench',
      line: '能量規則突然換了一套，狀態來不及跟上。',
      note: '淬火是系統的能量規則瞬間改變。狀態來不及反應，在新規則下變成好幾個能態的疊加，帶著多出來的能量隨時間震盪。',
    },
    art: null,
    reading: {
      fortune: '原本的狀態會瓦解。拆掉之後，才看得清楚剩下什麼。',
      quote: '「閃電打下來的時候，我剛好站在那裡。」',
      traits: ['專門處理突發狀況，越亂越冷靜。', '心臟很大顆，但檔案常常沒存。'],
    },
    partner: { id: 'fool', why: '世界一直在壞，兩個人都很習慣。' },
    rival: { id: 'sun', why: '正在救檔案，旁邊有人在熱情帶動氣氛。' },
    stats: { superposition: 80, entanglement: 75, coherence: 40, energy: 95 },
  },
  {
    id: 'sun',
    arcana: 19,
    numeral: 'XIX',
    name: '太陽',
    nameEn: 'The Sun',
    persona: '相干光太陽貓',
    personaEn: 'Coherent Sun',
    concept: {
      zh: '相干光（同調光）',
      en: 'Coherent Light',
      line: '相位對齊的光，疊起來會更亮。',
      note: '雷射是相干光：整束光波的相位整齊、步調一致，能集中成很細很亮的一束；燈泡的光相位雜亂，不相干。',
    },
    art: null,
    reading: {
      fortune: '事情會明朗。接下來會有一種鬆開來的感覺。',
      quote: '「我走到哪裡，哪裡就是光源。」',
      traits: ['走進哪個房間，就在哪裡開場。', '電量很少低於 80%。'],
    },
    partner: { id: 'lovers', why: '一個排得齊，一個綁得緊，兩個都很同步。' },
    rival: { id: 'hermit', why: '太陽一照，隱士就沒有不被看見的選項。' },
    stats: { superposition: 35, entanglement: 20, coherence: 95, energy: 85 },
  },
];
