import { describe, it, expect } from 'vitest';
import { createMathTablesWords } from '../mathTables';

describe('Math Tables', () => {
  it('should create multiplication words correctly', () => {
    const mathWords = createMathTablesWords();
    
    // Should have 200 math problems (20 tables × 10 problems each)
    expect(Object.keys(mathWords)).toHaveLength(200);
    
    // Check some basic problems
    expect(mathWords['1x1']).toBeDefined();
    expect(mathWords['1x1'].text).toBe('1 × 1');
    expect(mathWords['1x1'].transliteration).toBe('1');
    expect(mathWords['1x1'].language).toBe('mathtables');
    expect(mathWords['1x1'].complexityLevel).toBe(1);
    
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
    
    // Level 1: 1x and 2x tables (20 problems)
    expect(level1Words).toHaveLength(20);
    
    // Level 2: 3x, 4x, 5x tables (30 problems) 
    expect(level2Words).toHaveLength(30);
    
    // Level 8: 19x, 20x tables (20 problems)
    expect(level8Words).toHaveLength(20);
  });
  
  it('should generate all expected word IDs', () => {
    const mathWords = createMathTablesWords();
    const wordIds = Object.keys(mathWords);
    
    // Check that we have all expected patterns
    expect(wordIds).toContain('1x1');
    expect(wordIds).toContain('1x10');
    expect(wordIds).toContain('10x1');
    expect(wordIds).toContain('10x10');
    expect(wordIds).toContain('20x1');
    expect(wordIds).toContain('20x10');
    
    // Check that all IDs follow the expected pattern
    wordIds.forEach(id => {
      expect(id).toMatch(/^\d+x\d+$/);
    });
  });
});