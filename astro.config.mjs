import { defineConfig, fontProviders } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';
import { fileURLToPath } from 'node:url';

// Every string the site renders is static and lives in src/, so Noto Sans TC is
// cut down to those glyphs: one shared file instead of ~20 unicode-range slices per page.
function siteGlyphs() {
  const srcDir = fileURLToPath(new URL('./src/', import.meta.url));
  const glyphs = new Set();
  for (let code = 0x20; code < 0x7f; code += 1) glyphs.add(String.fromCharCode(code));
  for (const file of readdirSync(srcDir, { recursive: true })) {
    if (!/\.(astro|ts|css)$/.test(file)) continue;
    for (const char of readFileSync(join(srcDir, file), 'utf8')) {
      if (char > '~') glyphs.add(char);
    }
  }
  return [...glyphs].sort();
}

export default defineConfig({
  site: env.ASTRO_SITE || 'https://qracon.entangletech.tw',
  base: (env.ASTRO_BASE_PATH ?? '/Qracon2026_Tarot') || '/',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans TC',
      cssVariable: '--font-noto-sans-tc',
      weights: ['400 900'],
      styles: ['normal'],
      fallbacks: ['PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
      // The generated fallback is Arial scaled to CJK widths (~197%), which renders Latin text
      // at twice its size until the font arrives. The CJK system fonts are the better stand-in.
      optimizedFallbacks: false,
      options: { experimental: { glyphs: siteGlyphs() } },
    },
    {
      provider: fontProviders.google(),
      name: 'Barlow Condensed',
      cssVariable: '--font-barlow-condensed',
      weights: [600, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
  ],
});
