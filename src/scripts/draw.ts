import { capTier, detectTier, type Tier } from './fx/tier';
import { drawStore } from './store';
import { sitePath } from '../utils/paths';
import type { Stage } from './fx/gl';
import type { Collapse, Point } from './fx/collapse';
import type { Particles } from './fx/particles';

interface Fx {
  stage: Stage;
  collapse: Collapse;
  particles: Particles | null;
}

type State = 'idle' | 'resolving' | 'navigating';

const GAP_MS = 120;
const FALLBACK_MS = 1600;
const SCATTER_SPIN = 28;
const SCATTER_REACH = 0.7;

const root = document.documentElement;
const list = document.querySelector<HTMLOListElement>('.draw__cards');
const canvas = document.querySelector<HTMLCanvasElement>('[data-fx-canvas]');
const veil = document.querySelector<HTMLElement>('[data-fx-veil]');

if (list && canvas && veil) boot(list, canvas, veil);

function tokenMs(name: string, fallback: number): number {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  if (raw.endsWith('ms')) return value;
  return raw.endsWith('s') ? value * 1000 : fallback;
}

function randomBelow(limit: number): number {
  const ceiling = 2 ** 32 - (2 ** 32 % limit);
  const buffer = new Uint32Array(1);
  do crypto.getRandomValues(buffer);
  while (buffer[0] >= ceiling);
  return buffer[0] % limit;
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function centerOf(rect: DOMRect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function boot(list: HTMLOListElement, canvas: HTMLCanvasElement, veil: HTMLElement): void {
  const scaleMs = tokenMs('--dur-base', 240);
  const flipMs = tokenMs('--dur-flip', 600);
  const slowMs = tokenMs('--dur-slow', 520);
  const quickMs = tokenMs('--dur-fast', 160);

  const timers = new Set<number>();
  let state: State = 'idle';
  let tier: Tier = detectTier();
  let target: HTMLAnchorElement | null = null;
  let loading: Promise<Fx | null> | null = null;
  let fx: Fx | null = null;
  const targets = new Map<HTMLAnchorElement, string>();

  const items = (): HTMLLIElement[] => [...list.children] as HTMLLIElement[];

  function later(fn: () => void, ms: number): void {
    timers.add(window.setTimeout(fn, ms));
  }

  function clearTimers(): void {
    timers.forEach(clearTimeout);
    timers.clear();
  }

  function setTier(next: Tier): void {
    tier = next;
    root.dataset.fx = String(next);
  }

  function lowerTier(): void {
    const next = Math.max(1, tier - 1) as Tier;
    setTier(next);
    capTier(next === 2 ? 2 : 1);
  }

  function load(): Promise<Fx | null> {
    loading ??= (async () => {
      try {
        const [gl, collapse, particles] = await Promise.all([
          import('./fx/gl'),
          import('./fx/collapse'),
          tier >= 3 ? import('./fx/particles') : null,
        ]);
        const stage = gl.createStage(canvas, lowerTier);
        if (!stage) {
          capTier(1);
          return null;
        }
        fx = {
          stage,
          collapse: collapse.createCollapse(stage),
          particles: particles ? particles.createParticles(stage) : null,
        };
        return fx;
      } catch {
        return null;
      }
    })();
    return loading;
  }

  function prewarm(): void {
    if (tier < 2) return;
    const start = (): void => void load();
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
    else setTimeout(start, 1200);
    list.addEventListener('pointerdown', start, { once: true, passive: true });
    list.addEventListener('focusin', start, { once: true });
  }

  function shuffleCards(): void {
    const slots = items();
    const links = shuffle(slots.map((slot) => slot.querySelector('a') as HTMLAnchorElement));
    slots.forEach((slot, index) => {
      const link = links[index];
      // Park the link on the deck page until the flip: hover previews, link
      // lists and new tabs would otherwise reveal the draw before it happens.
      if (!targets.has(link)) {
        targets.set(link, link.href);
        link.href = sitePath('/deck/');
      }
      slot.append(link);
      link.setAttribute('aria-label', `第 ${index + 1} 張牌`);
      link.querySelector('.card')?.setAttribute('aria-hidden', 'true');
    });
  }

  function replayDeal(): void {
    list.classList.remove('is-dealing');
    void list.offsetWidth;
    list.classList.add('is-dealing');
  }

  function prefetch(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.append(link);
  }

  function preloadCardArt(card: Element | null): void {
    const image = card?.querySelector<HTMLImageElement>('.card__art');
    const src = image?.currentSrc || image?.src;
    const existing = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]'))
      .some((link) => link.href === src);
    if (!src || existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.type = 'image/avif';
    link.fetchPriority = 'high';
    document.head.append(link);
  }

  function go(): void {
    if (state === 'navigating' || !target) return;
    state = 'navigating';
    clearTimers();
    location.assign(targets.get(target) ?? target.href);
  }

  function scatter(rects: Map<HTMLLIElement, DOMRect>, from: Point): void {
    const reach = Math.max(innerWidth, innerHeight) * SCATTER_REACH;
    rects.forEach((rect, item) => {
      const center = centerOf(rect);
      const dx = center.x - from.x;
      const dy = center.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      const distance = reach * (0.6 + Math.random() * 0.4);
      item.style.setProperty('--fx-dx', `${(dx / length) * distance}px`);
      item.style.setProperty('--fx-dy', `${(dy / length) * distance}px`);
      item.style.setProperty('--fx-rot', `${(Math.random() - 0.5) * 2 * SCATTER_SPIN}deg`);
      item.classList.add('is-gone');
    });
  }

  function collapse(origin: Point): void {
    if (state !== 'resolving') return;
    if (tier >= 2 && fx && !fx.stage.lost) {
      void fx.collapse.play(origin, slowMs).then((finished) => {
        if (finished) requestAnimationFrame(go);
        else go();
      });
      return;
    }
    veil.style.setProperty('--fx-x', `${origin.x}px`);
    veil.style.setProperty('--fx-y', `${origin.y}px`);
    root.classList.add('is-collapsing');
    later(go, slowMs);
  }

  function resolve(link: HTMLAnchorElement, event: MouseEvent): void {
    const picked = link.parentElement as HTMLLIElement;
    const card = link.querySelector('.card');
    const rects = new Map(
      items()
        .filter((item) => item !== picked)
        .map((item): [HTMLLIElement, DOMRect] => [item, item.getBoundingClientRect()]),
    );
    const focus = centerOf(picked.getBoundingClientRect());
    const origin = event.detail > 0 && (event.clientX || event.clientY) ? { x: event.clientX, y: event.clientY } : focus;

    state = 'resolving';
    target = link;
    setTier(detectTier());
    drawStore.put(link.dataset.card ?? '');
    prefetch(targets.get(link) ?? link.href);
    preloadCardArt(card ?? null);

    list.setAttribute('aria-busy', 'true');
    list.inert = true;
    list.classList.remove('is-dealing');
    root.classList.add('is-resolving');
    picked.classList.add('is-picked');

    if (tier === 0) {
      rects.forEach((_, item) => item.classList.add('is-gone'));
      card?.classList.add('is-flipped');
      later(go, quickMs + 40);
      return;
    }

    root.classList.toggle('has-vt', 'onpageswap' in window);
    scatter(rects, focus);
    if (tier >= 3 && fx?.particles && !fx.stage.lost) {
      void fx.particles.play([...rects.values()], focus, slowMs);
    }
    later(() => card?.classList.add('is-flipped'), scaleMs);
    later(() => collapse(origin), scaleMs + flipMs + GAP_MS);
    later(go, FALLBACK_MS);
  }

  function reset(): void {
    clearTimers();
    state = 'idle';
    target = null;
    root.classList.remove('is-resolving', 'is-collapsing', 'has-vt');
    list.inert = false;
    list.removeAttribute('aria-busy');
    for (const item of items()) {
      item.classList.remove('is-picked', 'is-gone');
      item.removeAttribute('style');
      item.querySelector('.card')?.classList.remove('is-flipped');
    }
    veil.removeAttribute('style');
    if (fx && !fx.stage.lost) fx.stage.clear();
    drawStore.clear();
    setTier(detectTier());
    shuffleCards();
    replayDeal();
  }

  list.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a.pick') : null;
    if (!link || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (state === 'idle') resolve(link, event);
  });

  addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });

  drawStore.clear();
  setTier(tier);
  shuffleCards();
  prewarm();
}
