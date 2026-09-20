/**
 * Where the two browser gates find a Chromium.
 *
 * This exists because a verifier pointed out that both gates only ran at all by
 * accident. They hard-coded `/opt/pw-browsers/chromium`, which is this
 * container's path and nowhere else's, and they imported `playwright-core`
 * without it being declared as a dependency. A clean clone could not run either
 * one, which is a poor foundation for calling them gates.
 *
 * The order is deliberate:
 *
 *   1. CHROMIUM_PATH, if set. Somebody who names a binary means that binary, so
 *      a missing one is an error rather than a quiet fall through to a
 *      different browser than the one they asked to test against.
 *   2. The well-known path in this container, when it is really there.
 *   3. Playwright's own resolution, which is what CI gets after
 *      `npx playwright-core install chromium`.
 */
import { existsSync, statSync } from 'node:fs';

/* Two of them, because the two gates had drifted onto different paths in the
   same container: one on the stable name, one on a versioned build that a
   Playwright upgrade renames. Trying both is not thoroughness, it is the reason
   this file exists. */
const CONTAINER_CHROMIUM = [
  '/opt/pw-browsers/chromium',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
];

/* `existsSync` alone is not enough. A verifier read `/opt/pw-browsers/chromium`
   as a directory and concluded this resolver hands Playwright an unlaunchable
   path; it is in fact a symlink to the chrome binary here and both gates launch
   off it. But the objection is sound for any container where that name IS a
   directory, and the cost of being right about it is one stat. */
const launchable = (p) => {
  try { return existsSync(p) && statSync(p).isFile(); } catch { return false; }
};

export function launchOptions(extra = {}) {
  const named = process.env.CHROMIUM_PATH;
  /* Set but empty is a mistake, not an absence. It is what an unset `env:`
     interpolation or an empty secret produces in Actions, and falling through
     to a container path would hand somebody who meant to pin a binary a
     different browser without a word. */
  if ('CHROMIUM_PATH' in process.env && !named) {
    console.error('CHROMIUM_PATH is set to an empty string. Unset it, or point it at a binary.');
    process.exit(2);
  }
  if (named) {
    if (!launchable(named)) {
      console.error(`CHROMIUM_PATH is set to ${named}, and there is no binary there.`);
      process.exit(2);
    }
    return { ...extra, executablePath: named };
  }
  const here = CONTAINER_CHROMIUM.find(launchable);
  if (here) return { ...extra, executablePath: here };
  return { ...extra };
}
