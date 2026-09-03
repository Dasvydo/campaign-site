/**
 * Copies the exact woff2 faces this page uses out of the @fontsource packages
 * into public/fonts, so they are served from stable, preloadable paths on our
 * own origin. No Google Fonts request is ever made.
 *
 * latin covers English and Danish (ae, oe, aa all sit in Latin-1).
 * latin-ext is required for Lithuanian (a-ogonek, c-caron, e-dot, s-caron,
 * u-macron, z-caron and friends) and is loaded only when those codepoints
 * actually appear, via the unicode-range in src/styles/fonts.css.
 *
 * Run with: npm run fonts
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/fonts');
mkdirSync(out, { recursive: true });

const faces = [
  ['playfair-display', [400, 600]],
  ['dm-sans', [400, 500, 700]],
];

let copied = 0;
let missing = [];

for (const [family, weights] of faces) {
  for (const weight of weights) {
    for (const subset of ['latin', 'latin-ext']) {
      const name = `${family}-${subset}-${weight}-normal.woff2`;
      const from = resolve(root, 'node_modules/@fontsource', family, 'files', name);
      if (!existsSync(from)) {
        missing.push(name);
        continue;
      }
      copyFileSync(from, resolve(out, name));
      copied += 1;
    }
  }
}

console.log(`copied ${copied} woff2 files into public/fonts`);
if (missing.length) {
  console.error(`MISSING (run npm install first): ${missing.join(', ')}`);
  process.exit(1);
}
