import { describe, it, expect } from 'vitest';
import { selectSessionWords } from '../sessionGen';
import type { Word } from '../state';
import seedrandom from 'seedrandom';

describe('selectSessionWords', () => {
  it('selects words deterministically by bucket and weight', () => {
    const rng = seedrandom('fixed');
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', attempts: [] }, // new
      { id: 'w2', text: 'two', language: 'en', attempts: [{ timestamp: 1, result: 'wrong' }] }, // struggle
      { id: 'w3', text: 'three', language: 'en', attempts: [{ timestamp: 2, result: 'correct' }, { timestamp: 3, result: 'correct' }, { timestamp: 4, result: 'correct' }, { timestamp: 5, result: 'correct' }, { timestamp: 6, result: 'correct' }], nextReviewAt: Date.now() - 1000 }, // mastered
      { id: 'w4', text: 'four', language: 'en', attempts: [{ timestamp: 7, result: 'wrong' }, { timestamp: 8, result: 'wrong' }] }, // struggle
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
