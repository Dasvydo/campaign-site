/**
 * Is every locale actually complete?
 *
 * types.ts says TypeScript guarantees it, and for named keys that is true: a
 * missing `hero.claim` is a build failure. But the interface also holds arrays
 * whose length it does not constrain - objections.items, price.lines,
 * results.qualified.covers, and the three option lists the form is built from.
 * A Danish file with one fewer objection, or one fewer role option, compiles
 * perfectly and quietly ships a shorter page or a form that cannot express a
 * value the payload contract accepts. tsc cannot see it. This can.
 *
 * It reports, it does not edit. da.ts and lt.ts are marked NEEDS NATIVE CHECK
 * and a native speaker has to review them; a phrasing someone would prefer is
 * not a bug, and is not this script's business. A missing key is.
 *
 *   node scripts/audit-locales.mjs
 */
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = ['da', 'lt'];

let problems = 0;
const report = (ok, label, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) problems += 1;
};

/** Every leaf as [dotted.path, value], arrays indexed, so shape is comparable. */
function leaves(node, prefix = '', out = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => leaves(v, `${prefix}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) leaves(v, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out.push([prefix, node]);
  }
  return out;
}

/** Paths of every array, with its length, so a short list is visible. */
function arrayLengths(node, prefix = '', out = new Map()) {
  if (Array.isArray(node)) {
    out.set(prefix, node.length);
    node.forEach((v, i) => arrayLengths(v, `${prefix}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) arrayLengths(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/* Strings that are the same in every language on purpose. Brand names, the
   product's own words, prices, and the machine-readable option values that the
   payload contract pins. Flagging these as "English left in" would be noise. */
const SHARED = /^(|-|DoviLoop|DoviLoop Teams|Outlook|Microsoft 365|Gmail|Google Workspace|Teams|CVR|EUR|USD|LinkedIn)$/;
const isShared = (v) =>
  typeof v !== 'string' ||
  SHARED.test(v.trim()) ||
  /^[\d\s.,%+\-/()]*$/.test(v) ||        // pure numbers, 2-3 h, ranges
  /^\d{1,2}:\d{2}$/.test(v.trim()) ||    // a clock reading: 08:40
  /^[\d\s.,]+ ?(USD|EUR|DKK|kr\.?|€|\$)$/.test(v.trim()) ||   // 89 USD
  /^[a-z0-9_]+$/.test(v) ||              // option values: owner_partner, 10-24
  /^(https?:|mailto:|\/|#)/.test(v);     // urls, anchors, mail links

/* A language switcher names each language in its own language, so these three
   are identical in all three files on purpose. Not a translation gap. */
const isEndonym = (path) => path.startsWith('nav.localeNames.');

async function loadContent() {
  const work = mkdtempSync(join(tmpdir(), 'locale-audit-'));
  try {
    const outfile = join(work, 'content.mjs');
    await build({
      entryPoints: [join(root, 'src/content/index.ts')],
      bundle: true, format: 'esm', outfile, logLevel: 'silent',
    });
    return (await import(pathToFileURL(outfile).href)).content;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const content = await loadContent();
const en = content.en;
const enLeaves = leaves(en);
const enPaths = new Set(enLeaves.map(([p]) => p));
const enArrays = arrayLengths(en);

console.log(`\nEnglish master: ${enPaths.size} leaf keys, ${enArrays.size} arrays\n`);

for (const loc of TARGETS) {
  console.log(`src/content/${loc}.ts`);
  const c = content[loc];
  const locLeaves = leaves(c);
  const locPaths = new Set(locLeaves.map(([p]) => p));

  /* 1. every key in en exists here, and nothing extra is hiding either. */
  const missing = [...enPaths].filter((p) => !locPaths.has(p));
  const extra = [...locPaths].filter((p) => !enPaths.has(p));
  report(missing.length === 0, `every key present in en exists in ${loc}`,
    missing.length ? missing.join(', ') : `${locPaths.size} keys`);
  report(extra.length === 0, `no key exists in ${loc} that en does not have`,
    extra.length ? extra.join(', ') : 'none');

  /* 2. arrays are the same length. This is the one tsc cannot check. */
  const locArrays = arrayLengths(c);
  const wrongLen = [...enArrays].filter(([p, n]) => locArrays.get(p) !== n)
    .map(([p, n]) => `${p}: en has ${n}, ${loc} has ${locArrays.get(p) ?? 0}`);
  report(wrongLen.length === 0, `every list is the same length as en`,
    wrongLen.length ? wrongLen.join('; ') : `${enArrays.size} lists match`);

  /* 3. the option values the payload contract pins must be identical, since
        they are sent to the webhook, not shown to anyone. */
  for (const field of ['teamSizeOptions', 'emailClientOptions', 'roleOptions']) {
    const a = (en.form[field] ?? []).map((o) => o.value).join(',');
    const b = (c.form[field] ?? []).map((o) => o.value).join(',');
    report(a === b, `form.${field} sends the same values as en`, b || 'empty');
  }

  /* 4. blank strings: present as a key, empty as copy, which is a gap that
        reads as completeness. footer.company is deliberately unfilled. */
  const blank = locLeaves
    .filter(([p, v]) => typeof v === 'string' && v.trim() === '' &&
      !p.startsWith('footer.company') && p !== 'nativeCheck')
    .map(([p]) => p);
  report(blank.length === 0, `no key in ${loc} is blank`, blank.join(', ') || 'none');

  /* 5. untranslated English. Reported as a count with the paths, because a
        shared proper noun is fine and only a person can judge the rest. */
  const enByPath = new Map(enLeaves);
  const same = locLeaves
    .filter(([p, v]) => enByPath.get(p) === v && !isShared(v) && !isEndonym(p))
    .map(([p, v]) => `${p}=${JSON.stringify(String(v).slice(0, 40))}`);
  report(same.length === 0, `no en string is left untranslated in ${loc}`,
    same.length ? `${same.length}: ${same.join(', ')}` : 'none');

  /* 6. the em dash rule the QA harness enforces, checked on the raw source so
        it catches one in a comment too. */
  const src = readFileSync(join(root, `src/content/${loc}.ts`), 'utf8');
  report(!src.includes('—'), `src/content/${loc}.ts contains no em dash`);
  report(src.includes('NEEDS NATIVE CHECK'), `${loc}.ts still marked NEEDS NATIVE CHECK`);
  console.log('');
}

const enSrc = readFileSync(join(root, 'src/content/en.ts'), 'utf8');
console.log('src/content/en.ts');
report(!enSrc.includes('—'), 'src/content/en.ts contains no em dash');
const enBlank = enLeaves
  .filter(([p, v]) => typeof v === 'string' && v.trim() === '' &&
    !p.startsWith('footer.company') && p !== 'nativeCheck')
  .map(([p]) => p);
report(enBlank.length === 0, 'no key in en is blank', enBlank.join(', ') || 'none');

console.log(`\n${problems === 0 ? 'LOCALES COMPLETE' : `${problems} PROBLEM(S) FOUND`}\n`);
process.exit(problems === 0 ? 0 : 1);
