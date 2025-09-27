import type { Word } from './state';

/**
 * Simplified session word selection:
 * - Only picks unmastered words (step < 5)
 * - Prioritises current complexity level words (caller supplies appropriate pool)
 * - If caller passes a mixed pool (multiple levels) we sort by:
 *     1. complexityLevel ascending
 *     2. step ascending
 *     3. lastPracticedAt (older first; undefined treated as 0)
 *     4. id (stable deterministic tie-break)
 * - Returns up to `size` ids (may be fewer if insufficient unmastered words)
 */
export function selectSessionWords(allWords: Word[], size: number): string[] {
  const unmastered = allWords.filter(w => w.step === undefined || w.step < 5);
  // Sort deterministically according to priority rules
  unmastered.sort((a, b) => {
    if (a.complexityLevel !== b.complexityLevel) return a.complexityLevel - b.complexityLevel;
    const stepA = a.step ?? 0; const stepB = b.step ?? 0;
    if (stepA !== stepB) return stepA - stepB;
    const lpA = a.lastPracticedAt || 0; const lpB = b.lastPracticedAt || 0;
    if (lpA !== lpB) return lpA - lpB;
    return a.id.localeCompare(b.id);
  });

  const selected = unmastered.slice(0, size).map(w => w.id);
  console.log(`🧪 [SESSION_GEN] Selected ${selected.length}/${size} unmastered words (requested size ${size})`);
  return selected;
}

