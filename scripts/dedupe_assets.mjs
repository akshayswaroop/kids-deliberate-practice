#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function normalizeQuestion(q) {
  return String(q).replace(/\s+/g, ' ').trim().toLowerCase();
}

async function processFile(filePath, backupDir) {
  const raw = await fs.readFile(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Skipping ${filePath} - JSON parse error: ${err}`);
    return { file: filePath, changed: false };
  }

  if (!Array.isArray(parsed)) {
    return { file: filePath, changed: false };
  }

  const seen = new Set();
  const out = [];
  let removed = 0;

  for (const item of parsed) {
    if (!item || typeof item !== 'object') {
      out.push(item);
      continue;
    }
    const q = item.question;
    if (typeof q !== 'string' || !q.trim()) {
      out.push(item);
      continue;
    }
    const key = normalizeQuestion(q);
    if (seen.has(key)) {
      removed++;
      continue;
    }
    seen.add(key);
    out.push(item);
  }

  if (removed > 0) {
    await ensureDir(backupDir);
    const base = path.basename(filePath);
    const backupPath = path.join(backupDir, base + '.bak');
    await fs.writeFile(backupPath, raw, 'utf8');
    await fs.writeFile(filePath, JSON.stringify(out, null, 2) + '\n', 'utf8');
    return { file: filePath, changed: true, removed };
  }
  return { file: filePath, changed: false };
}

async function main() {
  const repoRoot = process.cwd();
  const assetsDir = path.join(repoRoot, 'src', 'assets');
  const backupDir = path.join(assetsDir, '_backup');

  let entries;
  try {
    entries = await fs.readdir(assetsDir, { withFileTypes: true });
  } catch (err) {
    console.error(`Failed to read assets dir ${assetsDir}: ${err}`);
    process.exit(2);
  }

  const jsonFiles = entries.filter(e => e.isFile() && e.name.endsWith('.json')).map(e => path.join(assetsDir, e.name));

  const results = [];
  for (const filePath of jsonFiles) {
    try {
      // Skip files under _backup if any
      if (filePath.includes(path.join('src', 'assets', '_backup'))) continue;
      const r = await processFile(filePath, backupDir);
      results.push(r);
      if (r.changed) {
        console.log(`Updated ${path.relative(repoRoot, r.file)} — removed ${r.removed} duplicate(s)`);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}: ${err}`);
    }
  }

  const changed = results.filter(r => r.changed);
  console.log('Done. Files changed:', changed.length);
  for (const c of changed) console.log(' -', path.relative(repoRoot, c.file), `(removed ${c.removed})`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('dedupe_assets.mjs')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
