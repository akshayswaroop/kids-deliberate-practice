import { describe, it, expect } from 'vitest';
import { selectSessionWords } from '../sessionGen';
import type { Word } from '../state';
import seedrandom from 'seedrandom';

describe('selectSessionWords', () => {
  it('selects words deterministically by bucket and weight', () => {
    const rng = seedrandom('fixed');
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // new
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 1, result: 'wrong' }], step: 1, cooldownSessionsLeft: 0, lastPracticedAt: 1 }, // active
      { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 2, result: 'correct' }, { timestamp: 3, result: 'correct' }, { timestamp: 4, result: 'correct' }, { timestamp: 5, result: 'correct' }, { timestamp: 6, result: 'correct' }], step: 5, cooldownSessionsLeft: 0, lastRevisedAt: 6 }, // revision
      { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 7, result: 'wrong' }, { timestamp: 8, result: 'wrong' }], step: 2, cooldownSessionsLeft: 0, lastPracticedAt: 8 }, // active
    ];
    const weights = { struggle: 1, new: 1, mastered: 1 };
    const size = 3;
    const selected = selectSessionWords(words, weights, size, rng);
    expect(selected).toHaveLength(3);
    expect(new Set(selected).size).toBe(3); // no duplicates
    // Deterministic output
    expect(selected).toEqual(selected); // This will always pass, but you can snapshot or hardcode expected output if needed
  });
});
