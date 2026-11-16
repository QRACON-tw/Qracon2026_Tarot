import { tierStore } from '../store';

export type Tier = 0 | 1 | 2 | 3;

interface Hints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function override(): Tier | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(location.search).get('fx');
  return value !== null && /^[0-3]$/.test(value) ? (Number(value) as Tier) : null;
}

export function detectTier(): Tier {
  const forced = override();
  if (forced !== null) return forced;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;

  const nav = navigator as Hints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;

  let tier: Tier = 2;
  if (nav.connection?.saveData || cores <= 2 || memory <= 2) tier = 1;
  else if (cores >= 6 && memory >= 4) tier = 3;

  const cap = tierStore.get();
  return cap !== null && cap < tier ? (Math.max(cap, 1) as Tier) : tier;
}

export function capTier(max: 1 | 2): void {
  tierStore.set(max);
}
