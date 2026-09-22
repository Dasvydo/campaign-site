/**
 * The raw text of a locale's copy, wherever it currently lives.
 *
 * Several gates check the copy as SOURCE TEXT rather than as a parsed object:
 * the em dash rule, the placeholder-text sweep, the Lithuanian formal register,
 * the NEEDS NATIVE CHECK marker, the EU hosting claim. They do that on purpose.
 * A parsed check sees the strings the interface admits; a source check sees
 * every character a translator actually typed, including in keys the interface
 * does not reach and in comments.
 *
 * That made them coupled to `src/content/<loc>.ts` holding all of it, which it
 * no longer does: the copy moved into `src/content/<loc>/*.ts` and the old file
 * is now a list of imports. Every one of those greps still passed against it,
 * because a file with no copy in it contains no em dash either. Four gates went
 * green by having nothing left to look at.
 *
 * So the source is assembled here instead, in one place, and the gates read it
 * through this function. Adding a section module cannot silently narrow what
 * they see.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Concatenates the composing file and every section module for one locale.
 *
 * The composing file is included because `nativeCheck` and the file header, the
 * two things the marker checks look for, deliberately stayed in it.
 */
export function localeSource(root, loc) {
  const parts = [];

  const composer = join(root, `src/content/${loc}.ts`);
  if (existsSync(composer)) parts.push(readFileSync(composer, 'utf8'));

  const dir = join(root, `src/content/${loc}`);
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()) {
      parts.push(readFileSync(join(dir, f), 'utf8'));
    }
  }

  if (!parts.length) throw new Error(`no content source found for locale ${loc}`);
  return parts.join('\n');
}

/**
 * Every file the above would read, for a gate that wants to name what it
 * checked rather than just how much of it there was.
 */
export function localeFiles(root, loc) {
  const out = [];
  const composer = join(root, `src/content/${loc}.ts`);
  if (existsSync(composer)) out.push(`src/content/${loc}.ts`);
  const dir = join(root, `src/content/${loc}`);
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()) {
      out.push(`src/content/${loc}/${f}`);
    }
  }
  return out;
}
