import { describe, it, expect } from 'vitest';
import { getInitialWords } from '../../../app/bootstrapState';
import { selectWordsByLanguage, selectWordsByComplexityLevel } from '../selectors';
import type { RootState } from '../state';

// Test Math Tables integration with the existing system
describe('Math Tables Integration', () => {
  it('should include Math Tables words in initial words', () => {
    const allWords = getInitialWords();
    
    // Filter for math tables words
    const mathWords = Object.values(allWords).filter(word => word.language === 'mathtables');
    
  // After removing 1× entries, expect 171 problems (factors 2-20 × 2-10)
  expect(mathWords).toHaveLength(171);
    expect(mathWords[0].text).toMatch(/^\d+ × \d+$/);
    expect(mathWords[0].transliteration).toBeDefined();
  });
  
  it('should filter Math Tables words correctly by language', () => {
    // Create a mock state with math tables words
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 6, kannada: 6, mathtables: 6, mixed: 6 },
            languages: ['mathtables'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const mathTablesWords = selectWordsByLanguage(mockState, ['mathtables']);
    const mathWordsArray = Object.values(mathTablesWords);
    
  expect(mathWordsArray).toHaveLength(171);
    expect(mathWordsArray.every(word => word.language === 'mathtables')).toBe(true);
  });
  
  it('should filter Math Tables words by complexity level', () => {
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 6, kannada: 6, mathtables: 6, mixed: 6 },
            languages: ['mathtables'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const level1MathWords = selectWordsByComplexityLevel(mockState, ['mathtables']);
    const level1Array = Object.values(level1MathWords);
    
  // Should get only level 1 math words (current level only)
  // Level 1: 2x table only = 9 words
  expect(level1Array).toHaveLength(9);
    expect(level1Array.every(word => word.complexityLevel === 1)).toBe(true); // Only level 1
    expect(level1Array.every(word => word.language === 'mathtables')).toBe(true);
  });
});