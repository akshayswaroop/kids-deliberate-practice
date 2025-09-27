import { describe, it, expect } from 'vitest';
import { getInitialWords } from '../../../app/bootstrapState';
import { selectWordsByLanguage, selectWordsByComplexityLevel, selectCurrentPracticeData } from '../selectors';
import { createIndiaGeographyWords, getComplexityLevelStats } from '../indiaGeography';
import type { RootState } from '../state';

// Test India Geography integration with the existing system
describe('India Geography Integration', () => {
  it('should include India Geography words in initial words', () => {
    const allWords = getInitialWords();
    
    // Filter for India Geography words
    const geoWords = Object.values(allWords).filter(word => word.language === 'indiageography');
    
    expect(geoWords.length).toBeGreaterThan(0);
    expect(geoWords[0].text).toMatch(/What is the capital of India\?/);
    expect(geoWords[0].answer).toBeDefined();
    expect(geoWords[0].notes).toBeDefined();
    expect(geoWords[0].complexityLevel).toBeGreaterThan(0);
  });
  
  it('should create proper word structure from JSON data', () => {
    const geoWords = createIndiaGeographyWords();
    const wordArray = Object.values(geoWords);
    
    expect(wordArray.length).toBe(200); // 20 questions per level × 10 levels
    
    // Test first word structure
    const firstWord = wordArray[0];
    expect(firstWord.id).toMatch(/^geo_level\d+_\d+$/);
    expect(firstWord.language).toBe('indiageography');
    expect(firstWord.text).toBeDefined();
    expect(firstWord.answer).toBeDefined();
    expect(firstWord.notes).toBeDefined();
    expect(firstWord.complexityLevel).toBeGreaterThanOrEqual(1);
    expect(firstWord.complexityLevel).toBeLessThanOrEqual(10);
    expect(firstWord.attempts).toEqual([]);
  });
  
  it('should filter India Geography words correctly by language', () => {
    // Create a mock state with India Geography words
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 12, kannada: 12, mathtables: 12, humanbody: 12, indiageography: 12, mixed: 12 },
            languages: ['indiageography'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, humanbody: 1, indiageography: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const geoWords = selectWordsByLanguage(mockState, ['indiageography']);
    const geoWordsArray = Object.values(geoWords);
    
    expect(geoWordsArray.length).toBe(200);
    expect(geoWordsArray.every(word => word.language === 'indiageography')).toBe(true);
  });
  
  it('should filter India Geography words by complexity level', () => {
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 12, kannada: 12, mathtables: 12, humanbody: 12, indiageography: 12, mixed: 12 },
            languages: ['indiageography'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, humanbody: 1, indiageography: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const level1GeoWords = selectWordsByComplexityLevel(mockState, ['indiageography']);
    const level1Array = Object.values(level1GeoWords);
    
    // Should get only level 1 geography words (current level only)
    // Level 1: 20 questions
    expect(level1Array).toHaveLength(20);
    expect(level1Array.every(word => word.complexityLevel === 1)).toBe(true); // Only level 1
    expect(level1Array.every(word => word.language === 'indiageography')).toBe(true);
  });
  
  it('should progress through complexity levels correctly', () => {
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 12, kannada: 12, mathtables: 12, humanbody: 12, indiageography: 12, mixed: 12 },
            languages: ['indiageography'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, humanbody: 1, indiageography: 3, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const level3GeoWords = selectWordsByComplexityLevel(mockState, ['indiageography']);
    const level3Array = Object.values(level3GeoWords);
    
    // Should get level 1, 2, and 3 geography words (up to current level 3)
    // Levels 1-3: 20 questions each = 60 total
    expect(level3Array).toHaveLength(60);
    expect(level3Array.filter(word => word.complexityLevel === 1)).toHaveLength(20);
    expect(level3Array.filter(word => word.complexityLevel === 2)).toHaveLength(20);
    expect(level3Array.filter(word => word.complexityLevel === 3)).toHaveLength(20);
    expect(level3Array.every(word => word.complexityLevel <= 3)).toBe(true);
    expect(level3Array.every(word => word.language === 'indiageography')).toBe(true);
  });
  
  it('should have proper complexity level distribution', () => {
    const stats = getComplexityLevelStats();
    
    // Should have 10 levels (1-10)
    expect(Object.keys(stats)).toHaveLength(10);
    
    // Each level should have exactly 20 questions
    for (let level = 1; level <= 10; level++) {
      expect(stats[level]).toBe(20);
    }
  });
  
  it('should generate unique IDs for all questions', () => {
    const geoWords = createIndiaGeographyWords();
    const ids = Object.keys(geoWords);
    const uniqueIds = new Set(ids);
    
    // All IDs should be unique
    expect(ids.length).toBe(uniqueIds.size);
    
    // IDs should follow the expected pattern
    ids.forEach(id => {
      expect(id).toMatch(/^geo_level\d+_\d+$/);
    });
  });
  
  it('should work with mixed mode selection', () => {
    const mockState: RootState = {
      users: {
        'testuser': {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
            settings: {
            sessionSizes: { english: 12, kannada: 12, mathtables: 12, humanbody: 12, indiageography: 12, mixed: 12 },
            languages: ['mixed'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, humanbody: 1, indiageography: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const mixedWords = selectWordsByComplexityLevel(mockState, ['mixed']);
    const mixedWordsArray = Object.values(mixedWords);
    
    // Should include words from all languages including India Geography
    const geoWords = mixedWordsArray.filter(word => word.language === 'indiageography');
    expect(geoWords.length).toBe(20); // Level 1 geography words
    expect(geoWords.every(word => word.complexityLevel === 1)).toBe(true);
  });

  it('should show both answer and notes when India Geography session is revealed', () => {
    const geoWords = createIndiaGeographyWords();
    const firstGeoWord = Object.values(geoWords)[0];
    
    const mockState: RootState = {
      users: {
        'testuser': {
          words: { [firstGeoWord.id]: firstGeoWord },
          sessions: {
            'geo_session_1': {
              wordIds: [firstGeoWord.id],
              currentIndex: 0,
              revealed: true, // Session is revealed
              mode: 'practice',
              createdAt: Date.now(),
              settings: {
                sessionSizes: { indiageography: 12 },
                languages: ['indiageography'],
                complexityLevels: { indiageography: 1 }
              }
            }
          },
          activeSessions: { indiageography: 'geo_session_1' },
          settings: {
            sessionSizes: { english: 12, kannada: 12, mathtables: 12, humanbody: 12, indiageography: 12, mixed: 12 },
            languages: ['indiageography'],
            complexityLevels: { english: 1, kannada: 1, mathtables: 1, humanbody: 1, indiageography: 1, hindi: 1 }
          }
        }
      },
      currentUserId: 'testuser'
    };
    
    const practiceData = selectCurrentPracticeData(mockState, 'indiageography');
    
    // Should show both answer and notes when revealed
    expect(practiceData.answer).toBeDefined();
    expect(practiceData.notes).toBeDefined();
    expect(practiceData.answer).toBe(firstGeoWord.answer);
    expect(practiceData.notes).toBe(firstGeoWord.notes);
    
    // Should not show transliteration (that's for Kannada/Math modes)
    expect(practiceData.transliteration).toBeUndefined();
    expect(practiceData.transliterationHi).toBeUndefined();
  });
});