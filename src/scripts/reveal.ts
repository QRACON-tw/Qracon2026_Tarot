// Keep this file import-free and its built output under 4096 bytes (Vite's assetsInlineLimit):
// only then does Astro inline it. An external script still loading at first paint makes
// Chrome drop the cross-document view transition.
const DRAW_KEY = 'tarot-draw';
// Read by the inline script in pages/index.astro; keep the key and the { id, day } shape in sync.
const TODAY_KEY = 'qracon.tarot.today';
const DRAW_FRESH_MS = 15000;
const ANNOUNCE_DELAY_MS = 500;
const IMAGE_FAILED = '圖片沒有載入，檢查網路後再試一次。';
const SHARE_FAILED = '沒有叫出分享選單。長按圖片也能存進相簿。';

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

const storyLink = document.querySelector<HTMLAnchorElement>('[data-story]');
const storyDialog = document.querySelector<HTMLDialogElement>('[data-story-dialog]');

if (storyLink && storyDialog) setupStory(storyLink, storyDialog);

function setupStory(link: HTMLAnchorElement, dialog: HTMLDialogElement): void {
  // Without showModal the link stays a plain link to the PNG.
  if (typeof dialog.showModal !== 'function') return;

  const storyShare = dialog.querySelector<HTMLButtonElement>('[data-story-share]');
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-story-close]');
  const notice = dialog.querySelector<HTMLElement>('[data-story-status]');
  if (!storyShare || !closeButton || !notice) return;

  // Focus lands on the dialog itself: left to the browser it picks the first control, and on a short
  // screen scrolling to it (WebKit does so after a frame) hides the picture above.
  dialog.tabIndex = -1;

  const fileName = link.dataset.storyFile ?? 'qracon-tarot.png';
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inLine = / Line\//i.test(ua);
  let canShareFiles = false;
  try {
    canShareFiles = Boolean(navigator.canShare?.({ files: [new File([''], fileName, { type: 'image/png' })] }));
  } catch {}

  storyShare.hidden = !canShareFiles;
  storyShare.disabled = true;

  const shareHint = dialog.querySelector<HTMLElement>('[data-story-hint-share]');
  if (shareHint) shareHint.hidden = !canShareFiles;

  // iOS saves downloads to Files, which Instagram's picker cannot reach.
  const download = dialog.querySelector<HTMLAnchorElement>('[data-story-download]');
  if (download) download.hidden = isIOS;

  const lineLink = dialog.querySelector<HTMLAnchorElement>('[data-story-line]');
  if (lineLink && inLine) {
    const external = new URL(location.href);
    external.searchParams.set('openExternalBrowser', '1');
    lineLink.href = external.href;
    lineLink.hidden = false;
  }

  let file: File | null = null;
  let loading: Promise<void> | null = null;

  // The File is fetched on open, not on tap: share() must run synchronously inside
  // the click, and awaiting anything first makes iOS drop the user activation.
  const load = (): void => {
    loading ??= fetch(link.href)
      .then((response) => {
        if (!response.ok) throw new Error(`story image ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        file = new File([blob], fileName, { type: 'image/png' });
        storyShare.disabled = false;
      })
      .catch(() => {
        loading = null;
        notice.textContent = IMAGE_FAILED;
      });
  };

  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!dialog.open) dialog.showModal();
    dialog.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    if (canShareFiles) load();
  });

  storyShare.addEventListener('click', () => {
    if (!file) return;
    notice.textContent = '';
    // Share the file only: with a title or text Instagram may take the text instead of the image.
    const data: ShareData = { files: [file] };
    if (navigator.canShare && !navigator.canShare(data)) {
      notice.textContent = SHARE_FAILED;
      return;
    }
    void navigator.share(data).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notice.textContent = SHARE_FAILED;
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    // The dialog's own padding also targets the dialog; only a click outside its box is the backdrop.
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    notice.textContent = '';
    link.focus();
  });
}

export {};
