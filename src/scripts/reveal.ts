// Keep this file import-free: Astro then inlines it. An external script still
// loading at first paint makes Chrome drop the cross-document view transition.
const DRAW_KEY = 'tarot-draw';
// Read by the inline script in pages/index.astro; keep the key and the { id, day } shape in sync.
const TODAY_KEY = 'qracon.tarot.today';
const DRAW_FRESH_MS = 15000;
const ANNOUNCE_DELAY_MS = 500;

const root = document.documentElement;
const report = document.querySelector<HTMLElement>('[data-card]');
const status = document.querySelector<HTMLElement>('[data-draw-status]');
const cardId = report?.dataset.card ?? '';

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

function rememberToday(id: string): void {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  try {
    localStorage.setItem(TODAY_KEY, JSON.stringify({ id, day }));
  } catch {}
}

if (report && takeDraw(cardId)) {
  root.classList.add('is-drawn');
  rememberToday(cardId);
  if (status) {
    setTimeout(() => {
      status.textContent = `你抽到${status.dataset.persona ?? ''}。`;
    }, ANNOUNCE_DELAY_MS);
  }
} else {
  root.classList.remove('is-drawn');
}

const shareButton = document.querySelector<HTMLButtonElement>('[data-share]');

if (shareButton) setupShare(shareButton);

function setupShare(button: HTMLButtonElement): void {
  const url = location.href;
  const text = button.dataset.shareText ?? '';

  if (!navigator.share) {
    button.textContent = '複製連結';
    button.addEventListener('click', () => void copyLink(url));
    return;
  }

  button.addEventListener('click', () => {
    void navigator.share({ title: document.title, text, url }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      void copyLink(url);
    });
  });
}

async function copyLink(url: string): Promise<void> {
  const shareStatus = document.querySelector<HTMLElement>('[data-share-status]');
  const fallback = document.querySelector<HTMLAnchorElement>('[data-share-fallback]');

  try {
    if (!navigator.clipboard) throw new Error('no clipboard');
    await navigator.clipboard.writeText(url);
    if (shareStatus) shareStatus.textContent = '連結已複製。';
  } catch {
    // Some in-app browsers block the clipboard; surface the link for a long-press copy.
    if (fallback) {
      fallback.href = url;
      fallback.textContent = url;
      fallback.hidden = false;
    }
  }
}

export {};
