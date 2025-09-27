import { describe, it, expect } from 'vitest';
import { createMathTablesWords } from '../mathTables';

describe('Math Tables', () => {
  it('should create multiplication words correctly', () => {
    const mathWords = createMathTablesWords();
    
  // Should have 171 math problems (factors 2-20 × 2-10 => 19×9)
  expect(Object.keys(mathWords)).toHaveLength(171);

  // Check that removed 1× problems are not present
  expect(mathWords['1x1']).toBeUndefined();

  // Check some basic problems that remain
  expect(mathWords['2x3']).toBeDefined();
  expect(mathWords['2x3'].text).toBe('2 × 3');
  expect(mathWords['2x3'].transliteration).toBe('6');
  expect(mathWords['2x3'].language).toBe('mathtables');
  expect(mathWords['2x3'].complexityLevel).toBe(1);

  expect(mathWords['20x10']).toBeDefined();
  expect(mathWords['20x10'].text).toBe('20 × 10');
  expect(mathWords['20x10'].transliteration).toBe('200');
  expect(mathWords['20x10'].language).toBe('mathtables');
  expect(mathWords['20x10'].complexityLevel).toBe(8);
  });
  
  it('should have correct complexity levels', () => {
    const mathWords = createMathTablesWords();
    
    // Check complexity level distribution
    const level1Words = Object.values(mathWords).filter(w => w.complexityLevel === 1);
    const level2Words = Object.values(mathWords).filter(w => w.complexityLevel === 2);
    const level8Words = Object.values(mathWords).filter(w => w.complexityLevel === 8);
    
  // Level 1: 2x table only (9 problems)
  expect(level1Words).toHaveLength(9);

  // Level 2: 3x, 4x, 5x tables (3 × 9 = 27 problems) 
  expect(level2Words).toHaveLength(27);

  // Level 8: 19x, 20x tables (2 × 9 = 18 problems)
  expect(level8Words).toHaveLength(18);
  });
  
  it('should generate all expected word IDs', () => {
    const mathWords = createMathTablesWords();
    const wordIds = Object.keys(mathWords);
    
  // Check that IDs with factor 1 are not present
  expect(wordIds).not.toContain('1x1');
  expect(wordIds).not.toContain('1x10');
  expect(wordIds).not.toContain('10x1');
  expect(wordIds).toContain('10x10');
  expect(wordIds).not.toContain('20x1');
  expect(wordIds).toContain('20x10');
    
    // Check that all IDs follow the expected pattern
    wordIds.forEach(id => {
      expect(id).toMatch(/^\d+x\d+$/);
    });
  });
});