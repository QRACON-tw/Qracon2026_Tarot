const DRAW_KEY = 'tarot-draw';
const TIER_KEY = 'fx-tier';
const DRAW_FRESH_MS = 15000;

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

function drop(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

export const tierStore = {
  get(): number | null {
    const raw = read(TIER_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 && value <= 3 ? value : null;
  },
  set(tier: number): void {
    write(TIER_KEY, String(tier));
  },
};

export const drawStore = {
  put(id: string): void {
    write(DRAW_KEY, JSON.stringify({ id, at: Date.now() }));
  },
  clear(): void {
    drop(DRAW_KEY);
  },
  take(id: string): boolean {
    const raw = read(DRAW_KEY);
    drop(DRAW_KEY);
    if (!raw) return false;
    try {
      const data: unknown = JSON.parse(raw);
      if (typeof data !== 'object' || data === null) return false;
      const { id: drawn, at } = data as { id?: unknown; at?: unknown };
      return drawn === id && typeof at === 'number' && Date.now() - at < DRAW_FRESH_MS;
    } catch {
      return false;
    }
  },
};
