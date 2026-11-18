// Keep this file import-free: Astro then inlines it. An external script still
// loading at first paint makes Chrome drop the cross-document view transition.
const DRAW_KEY = 'tarot-draw';
const DRAW_FRESH_MS = 15000;
const ANNOUNCE_DELAY_MS = 500;

const root = document.documentElement;
const report = document.querySelector<HTMLElement>('[data-card]');
const status = document.querySelector<HTMLElement>('[data-draw-status]');

function takeDraw(id: string): boolean {
  try {
    const raw = sessionStorage.getItem(DRAW_KEY);
    sessionStorage.removeItem(DRAW_KEY);
    if (!raw) return false;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return false;
    const { id: drawn, at } = data as { id?: unknown; at?: unknown };
    return drawn === id && typeof at === 'number' && Date.now() - at < DRAW_FRESH_MS;
  } catch {
    return false;
  }
}

if (report && takeDraw(report.dataset.card ?? '')) {
  root.classList.add('is-drawn');
  if (status) {
    setTimeout(() => {
      status.textContent = `你抽到${status.dataset.persona ?? ''}。`;
    }, ANNOUNCE_DELAY_MS);
  }
} else {
  root.classList.remove('is-drawn');
}

export {};
