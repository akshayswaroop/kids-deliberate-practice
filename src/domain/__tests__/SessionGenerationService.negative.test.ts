/**
 * 🎯 Negative Tests: SessionGenerationService
 * 
 * Tests edge cases, invalid inputs, and boundary conditions
 * to catch potential bugs in session generation logic.
 * 
 * Architecture principle: "Pure Core - deterministic, testable rules"
 */

import { describe, test, expect } from 'vitest';
import { SessionGenerationService } from '../services/SessionGenerationService';

describe('SessionGenerationService Negative Tests', () => {
  describe('Empty and Invalid Inputs', () => {
    test('should return empty array for empty word list', () => {
      const result = SessionGenerationService.selectSessionWords([], 12);
      expect(result).toEqual([]);
    });

    test('should return empty array for zero session size', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 0);
      expect(result).toEqual([]);
    });

    test('should handle negative session size', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, -5);
      expect(result).toEqual([]);
    });

    test('should return empty array when all words are mastered', () => {
      const words = [
        { id: 'w1', step: 2, complexityLevel: 1 }, // Mastered
        { id: 'w2', step: 3, complexityLevel: 1 }, // Mastered
        { id: 'w3', step: 5, complexityLevel: 1 }  // Mastered
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toEqual([]);
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle single word correctly', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toEqual(['w1']);
    });

    test('should not exceed available unmastered words', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 1, complexityLevel: 1 },
        { id: 'w3', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toHaveLength(3); // Only 3 available
    });

    test('should handle session size of 1', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 },
        { id: 'w3', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 1);
      expect(result).toHaveLength(1);
      expect(['w1', 'w2', 'w3']).toContain(result[0]);
    });

    test('should handle exactly session size words', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 },
        { id: 'w3', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result).toHaveLength(3);
      expect(result).toContain('w1');
      expect(result).toContain('w2');
      expect(result).toContain('w3');
    });
  });

  describe('Mastery Threshold Handling', () => {
    test('should filter out words at step 2 (mastered)', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 2, complexityLevel: 1 }, // Mastered
        { id: 'w3', step: 1, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toHaveLength(2);
      expect(result).toContain('w1');
      expect(result).toContain('w3');
      expect(result).not.toContain('w2');
    });

    test('should filter out words above step 2', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 3, complexityLevel: 1 }, // Mastered
        { id: 'w3', step: 5, complexityLevel: 1 }, // Mastered
        { id: 'w4', step: 1, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toHaveLength(2);
      expect(result).toContain('w1');
      expect(result).toContain('w4');
    });

    test('should include words at step 1 (not yet mastered)', () => {
      const words = [
        { id: 'w1', step: 1, complexityLevel: 1 },
        { id: 'w2', step: 1, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 12);
      expect(result).toHaveLength(2);
    });

    test('should handle undefined step as unmastered', () => {
      const words = [
        { id: 'w1', step: undefined as any, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words as any, 12);
      expect(result).toHaveLength(2);
      expect(result).toContain('w1');
    });
  });

  describe('Complexity Level Sorting', () => {
    test('should prioritize lower complexity levels', () => {
      const words = [
        { id: 'w3', step: 0, complexityLevel: 3 },
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 2 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result[0]).toBe('w1'); // Level 1 first
      expect(result[1]).toBe('w2'); // Level 2 second
      expect(result[2]).toBe('w3'); // Level 3 last
    });

    test('should handle mixed complexity levels with session size limit', () => {
      const words = [
        { id: 'w5', step: 0, complexityLevel: 3 },
        { id: 'w4', step: 0, complexityLevel: 3 },
        { id: 'w3', step: 0, complexityLevel: 2 },
        { id: 'w2', step: 0, complexityLevel: 2 },
        { id: 'w1', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result).toHaveLength(3);
      // Should pick lower levels first
      expect(result[0]).toBe('w1'); // Level 1
      expect(result[1]).toBe('w2'); // Level 2
      expect(result[2]).toBe('w3'); // Level 2
    });
  });

  describe('Step-based Sorting', () => {
    test('should prioritize lower steps within same complexity', () => {
      const words = [
        { id: 'w3', step: 1, complexityLevel: 1 },
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result[0]).toBe('w1'); // Step 0
      expect(result[1]).toBe('w2'); // Step 0
      expect(result[2]).toBe('w3'); // Step 1
    });

    test('should handle undefined steps as 0', () => {
      const words = [
        { id: 'w1', step: undefined as any, complexityLevel: 1 },
        { id: 'w2', step: 1, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.selectSessionWords(words as any, 2);
      expect(result[0]).toBe('w1'); // undefined treated as 0
      expect(result[1]).toBe('w2');
    });
  });

  describe('Last Practiced Sorting', () => {
    test('should prioritize older lastPracticedAt within same complexity and step', () => {
      const words = [
        { id: 'w3', step: 0, complexityLevel: 1, lastPracticedAt: 3000 },
        { id: 'w1', step: 0, complexityLevel: 1, lastPracticedAt: 1000 },
        { id: 'w2', step: 0, complexityLevel: 1, lastPracticedAt: 2000 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result[0]).toBe('w1'); // Oldest (1000)
      expect(result[1]).toBe('w2'); // Middle (2000)
      expect(result[2]).toBe('w3'); // Newest (3000)
    });

    test('should treat undefined lastPracticedAt as 0', () => {
      const words = [
        { id: 'w1', step: 0, complexityLevel: 1, lastPracticedAt: undefined },
        { id: 'w2', step: 0, complexityLevel: 1, lastPracticedAt: 1000 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 2);
      expect(result[0]).toBe('w1'); // undefined treated as 0 (oldest)
      expect(result[1]).toBe('w2');
    });
  });

  describe('Deterministic ID Sorting', () => {
    test('should use ID as stable tie-breaker', () => {
      const words = [
        { id: 'w3', step: 0, complexityLevel: 1, lastPracticedAt: 1000 },
        { id: 'w1', step: 0, complexityLevel: 1, lastPracticedAt: 1000 },
        { id: 'w2', step: 0, complexityLevel: 1, lastPracticedAt: 1000 }
      ];
      const result = SessionGenerationService.selectSessionWords(words, 3);
      expect(result[0]).toBe('w1'); // Alphabetically first
      expect(result[1]).toBe('w2');
      expect(result[2]).toBe('w3');
    });

    test('should be deterministic across multiple calls', () => {
      const words = [
        { id: 'w5', step: 0, complexityLevel: 1 },
        { id: 'w3', step: 0, complexityLevel: 1 },
        { id: 'w1', step: 0, complexityLevel: 1 },
        { id: 'w4', step: 0, complexityLevel: 1 },
        { id: 'w2', step: 0, complexityLevel: 1 }
      ];
      
      const result1 = SessionGenerationService.selectSessionWords(words, 3);
      const result2 = SessionGenerationService.selectSessionWords(words, 3);
      
      expect(result1).toEqual(result2); // Should be identical
    });
  });

  describe('Level Progression Logic', () => {
    test('shouldProgressLevel returns false for empty word list', () => {
      const result = SessionGenerationService.shouldProgressLevel([]);
      expect(result).toBe(false);
    });

    test('shouldProgressLevel returns false when any word not mastered', () => {
      const words = [
        { id: 'w1', step: 2, complexityLevel: 1 }, // Mastered
        { id: 'w2', step: 1, complexityLevel: 1 }, // Not mastered
        { id: 'w3', step: 2, complexityLevel: 1 }  // Mastered
      ];
      const result = SessionGenerationService.shouldProgressLevel(words);
      expect(result).toBe(false);
    });

    test('shouldProgressLevel returns true when all words mastered', () => {
      const words = [
        { id: 'w1', step: 2, complexityLevel: 1 },
        { id: 'w2', step: 3, complexityLevel: 1 },
        { id: 'w3', step: 5, complexityLevel: 1 }
      ];
      const result = SessionGenerationService.shouldProgressLevel(words);
      expect(result).toBe(true);
    });

    test('shouldProgressLevel handles single word correctly', () => {
      const mastered = [{ id: 'w1', step: 2, complexityLevel: 1 }];
      expect(SessionGenerationService.shouldProgressLevel(mastered)).toBe(true);

      const notMastered = [{ id: 'w1', step: 1, complexityLevel: 1 }];
      expect(SessionGenerationService.shouldProgressLevel(notMastered)).toBe(false);
    });
  });

  describe('Default Session Size', () => {
    test('should return 12 as default session size', () => {
      const size = SessionGenerationService.getDefaultSessionSize();
      expect(size).toBe(12);
    });
  });

  describe('Complex Multi-Level Scenarios', () => {
    test('should handle complex mixed scenario correctly', () => {
      const words = [
        // Level 1 - some mastered, some not
        { id: 'l1_w1', step: 0, complexityLevel: 1, lastPracticedAt: 1000 },
        { id: 'l1_w2', step: 2, complexityLevel: 1, lastPracticedAt: 2000 }, // Mastered
        { id: 'l1_w3', step: 1, complexityLevel: 1, lastPracticedAt: 500 },
        
        // Level 2 - all unmastered
        { id: 'l2_w1', step: 0, complexityLevel: 2 },
        { id: 'l2_w2', step: 1, complexityLevel: 2 },
        
        // Level 3 - all mastered
        { id: 'l3_w1', step: 3, complexityLevel: 3 }, // Mastered
        { id: 'l3_w2', step: 2, complexityLevel: 3 }  // Mastered
      ];

      const result = SessionGenerationService.selectSessionWords(words, 5);
      
      // Should prioritize level 1 unmastered words first
      expect(result).toContain('l1_w3'); // Level 1, step 1, older practice
      expect(result).toContain('l1_w1'); // Level 1, step 0
      
      // Then level 2
      expect(result).toContain('l2_w1');
      expect(result).toContain('l2_w2');
      
      // Should not include mastered words
      expect(result).not.toContain('l1_w2');
      expect(result).not.toContain('l3_w1');
      expect(result).not.toContain('l3_w2');
    });
  });
});
