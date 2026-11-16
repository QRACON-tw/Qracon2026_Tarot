import { drawStore } from './store';

const ANNOUNCE_DELAY_MS = 500;

const root = document.documentElement;
const report = document.querySelector<HTMLElement>('[data-card]');
const status = document.querySelector<HTMLElement>('[data-draw-status]');

if (report && drawStore.take(report.dataset.card ?? '')) {
  root.classList.add('is-drawn');
  if (status) {
    setTimeout(() => {
      status.textContent = `你抽到${status.dataset.persona ?? ''}。`;
    }, ANNOUNCE_DELAY_MS);
  }
} else {
  root.classList.remove('is-drawn');
}
