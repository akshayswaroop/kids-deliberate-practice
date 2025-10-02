import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Asset data quality', () => {
  test('Given all JSON banks, when scanning questions, then no duplicates exist', async () => {
    const assetsDir = path.resolve(process.cwd(), 'src', 'assets');
    const entries = await fs.readdir(assetsDir, { withFileTypes: true });
    const jsonFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
      .map(entry => path.join(assetsDir, entry.name));

    const questionMap = new Map<string, Array<{ file: string; id?: string; index: number }>>();

    for (const filePath of jsonFiles) {
      const raw = await fs.readFile(filePath, 'utf8');

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        throw new Error(`Failed to parse JSON in ${path.relative(process.cwd(), filePath)}: ${String(error)}`);
      }

      if (!Array.isArray(parsed)) continue;

      parsed.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        const questionText = Reflect.get(item, 'question');
        if (typeof questionText !== 'string') return;

        const normalized = questionText.replace(/\s+/g, ' ').trim().toLowerCase();
        if (!normalized) return;

        const bucket = questionMap.get(normalized) ?? [];
        bucket.push({
          file: path.relative(process.cwd(), filePath),
          id: Reflect.get(item, 'id') as string | undefined,
          index,
        });
        questionMap.set(normalized, bucket);
      });
    }

    const duplicates: Array<{ question: string; occurrences: Array<{ file: string; id?: string; index: number }> }> = [];
    for (const [question, occurrences] of questionMap.entries()) {
      // Treat any repeated occurrence as a duplicate (intra-file or cross-file)
      if (occurrences.length > 1) {
        duplicates.push({ question, occurrences });
      }
    }

    if (duplicates.length > 0) {
      const lines: string[] = [];
      lines.push(`${duplicates.length} duplicate question(s) found across asset banks:`);
      for (const duplicate of duplicates) {
        lines.push('');
        lines.push(`Question: "${duplicate.question}"`);
        for (const occurrence of duplicate.occurrences) {
          lines.push(` - ${occurrence.file} [index=${occurrence.index}${occurrence.id ? `, id=${occurrence.id}` : ''}]`);
        }
      }
      throw new Error(lines.join('\n'));
    }

    expect(duplicates).toHaveLength(0);
  });
});
