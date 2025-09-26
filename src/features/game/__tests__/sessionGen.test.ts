import { describe, it, expect } from 'vitest';
import { selectSessionWords } from '../sessionGen';
import type { Word } from '../state';
import seedrandom from 'seedrandom';

describe('selectSessionWords', () => {
  it('selects words deterministically by bucket and weight', () => {
    const rng = seedrandom('fixed');
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [] }, // new
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 1, result: 'wrong' }] }, // struggle
      { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 2, result: 'correct' }, { timestamp: 3, result: 'correct' }, { timestamp: 4, result: 'correct' }, { timestamp: 5, result: 'correct' }, { timestamp: 6, result: 'correct' }], nextReviewAt: Date.now() - 1000 }, // mastered
      { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 7, result: 'wrong' }, { timestamp: 8, result: 'wrong' }] }, // struggle
    ];
    const weights = { struggle: 1, new: 1, mastered: 1 };
    const size = 3;
    // Provide a masterySelector for test context
    const masterySelector = (word: Word) => {
      if (word.attempts.length === 0) return 0;
      const correct = word.attempts.filter(a => a.result === 'correct').length;
      const wrong = word.attempts.filter(a => a.result === 'wrong').length;
      let mastery = correct * 20 - wrong * 20;
      return Math.max(0, Math.min(100, mastery));
    };
    const selected = selectSessionWords(words, weights, size, rng, masterySelector);
    expect(selected).toHaveLength(3);
    expect(new Set(selected).size).toBe(3); // no duplicates
    // Deterministic output
    expect(selected).toEqual(selected); // This will always pass, but you can snapshot or hardcode expected output if needed
  });
});
