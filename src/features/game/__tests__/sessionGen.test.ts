import { describe, it, expect } from 'vitest';
import { selectSessionWords } from '../sessionGen';
import type { Word } from '../state';

describe('selectSessionWords', () => {
  it('selects unmastered words deterministically', () => {
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // unmastered
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 1, result: 'wrong' }], step: 1, cooldownSessionsLeft: 0, lastPracticedAt: 1 }, // unmastered
      { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 2, result: 'correct' }, { timestamp: 3, result: 'correct' }, { timestamp: 4, result: 'correct' }, { timestamp: 5, result: 'correct' }, { timestamp: 6, result: 'correct' }], step: 5, cooldownSessionsLeft: 0, lastRevisedAt: 6 }, // mastered - should be excluded
      { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [{ timestamp: 7, result: 'wrong' }, { timestamp: 8, result: 'wrong' }], step: 2, cooldownSessionsLeft: 0, lastPracticedAt: 8 }, // unmastered
      { id: 'w5', text: 'five', language: 'en', complexityLevel: 2, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // unmastered, higher complexity
    ];
    
    const size = 3;
    const selected = selectSessionWords(words, size);
    
    // Should select unmastered words only (step < 5)
    expect(selected).toHaveLength(3);
    expect(new Set(selected).size).toBe(3); // no duplicates
    
    // Should not include the mastered word (w3)
    expect(selected).not.toContain('w3');
    
    // Deterministic sort: by complexityLevel, then step, then lastPracticedAt, then id
    // Expected order: w1 (level1, step0, no lastPracticedAt), w2 (level1, step1, lastPracticedAt=1), w4 (level1, step2, lastPracticedAt=8), w5 (level2, step0)
    expect(selected).toEqual(['w1', 'w2', 'w4']);
  });

  it('handles cases with fewer unmastered words than requested size', () => {
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // unmastered
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }, // mastered
      { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }, // mastered
    ];
    
    const size = 5; // Request more than available
    const selected = selectSessionWords(words, size);
    
    // Should only return the available unmastered words
    expect(selected).toHaveLength(1);
    expect(selected).toEqual(['w1']);
  });

  it('returns empty array when all words are mastered', () => {
    const words: Word[] = [
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }, // mastered
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }, // mastered
    ];
    
    const size = 3;
    const selected = selectSessionWords(words, size);
    
    expect(selected).toHaveLength(0);
    expect(selected).toEqual([]);
  });

  it('sorts deterministically by priority rules', () => {
    const words: Word[] = [
      { id: 'w3', text: 'three', language: 'en', complexityLevel: 2, attempts: [], step: 1, cooldownSessionsLeft: 0, lastPracticedAt: 100 },
      { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // Should be first (lower complexity)
      { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [], step: 2, cooldownSessionsLeft: 0, lastPracticedAt: 50 },
      { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 1, cooldownSessionsLeft: 0, lastPracticedAt: 200 },
    ];
    
    const selected = selectSessionWords(words, 4);
    
    // Expected order: 
    // 1. w1 (complexity=1, step=0, lastPracticedAt=undefined treated as 0)
    // 2. w2 (complexity=1, step=1, lastPracticedAt=200) 
    // 3. w4 (complexity=1, step=2, lastPracticedAt=50)
    // 4. w3 (complexity=2, step=1, lastPracticedAt=100)
    expect(selected).toEqual(['w1', 'w2', 'w4', 'w3']);
  });
});