import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { test } from 'vitest';

const ROOT = join(__dirname, '../../../..', 'src');
const forbidden = ['Mishika', 'Eva', 'user1'];

function walk(dir: string, acc: string[] = []) {
  const names = readdirSync(dir);
  for (const n of names) {
    const p = join(dir, n);
    const stat = statSync(p);
    if (stat.isDirectory()) {
      // Exclude test folders and assets
      if (p.includes('__tests__') || p.includes('assets')) continue;
      walk(p, acc);
    } else {
      if (/\.(ts|tsx|js|jsx)$/.test(p)) acc.push(p);
    }
  }
  return acc;
}

test('no hard-coded user names in src/ (except __tests__)', () => {
  const files = walk(ROOT);
  const offenders: Array<{ file: string; word: string; line: number }> = [];
  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const w of forbidden) {
        const re = new RegExp(`\\b${w}\\b`);
        if (re.test(line)) offenders.push({ file: f.replace(ROOT, ''), word: w, line: i + 1 });
      }
    }
  }
  if (offenders.length) {
    const msg = offenders.map(o => `${o.file}:${o.line} -> ${o.word}`).join('\n');
    throw new Error('Forbidden hard-coded user names found in src/ (move to fixtures or tests):\n' + msg);
  }
});
