/**
 * 🎯 Negative Tests: Domain Mappers
 * 
 * Tests edge cases, invalid inputs, and malformed data handling
 * in infrastructure layer mappers.
 * 
 * Architecture principle: "Sharp Boundaries - clean translation between layers"
 */

import { describe, test, expect } from 'vitest';
import { ProgressTrackerMapper, WordDrillMapper, LearnerProfileMapper } from '../mappers/DomainMappers';
import type { Word } from '../state/gameState';

describe('Domain Mappers Negative Tests', () => {
  describe('ProgressTrackerMapper Edge Cases', () => {
    test('should handle word with no attempts', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 0,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      expect(tracker.getProgress()).toBe(0);
      expect(tracker.getAttempts().length).toBe(0);
    });

    test('should handle word with undefined lastPracticedAt', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 1,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        lastPracticedAt: undefined,
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      expect(tracker.getProgress()).toBe(1);
    });

    test('should handle word at maximum step', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 5,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      expect(tracker.getProgress()).toBe(5);
    });

    test('should handle word with high reveal count', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 0,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        revealCount: 10,
        cooldownSessionsLeft: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      expect(tracker.getRevealCount()).toBe(0); // Mapper doesn't restore revealCount
    });

    test('toRedux should handle empty attempts', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 0,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      const mapped = ProgressTrackerMapper.toRedux(tracker);

      expect(mapped.attempts).toEqual([]);
      expect(mapped.lastPracticedAt).toBeUndefined();
    });

    test('toRedux should handle tracker with no mastery', () => {
      const reduxWord: Word = {
        id: 'word1',
        text: 'test',
        step: 1,
        attempts: [],
        language: 'english',
        complexityLevel: 1,
        category: 'test',
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', reduxWord);
      const mapped = ProgressTrackerMapper.toRedux(tracker);

      expect(mapped.lastRevisedAt).toBeUndefined();
    });
  });

  describe('WordDrillMapper Edge Cases', () => {
    // Helper to create a minimal Word
    const createWord = (overrides: Partial<Word> = {}): Word => ({
      id: 'word1',
      text: 'test',
      step: 0,
      attempts: [],
      language: 'english',
      complexityLevel: 1,
      category: 'vocabulary',
      cooldownSessionsLeft: 0,
      revealCount: 0,
      ...overrides
    });

    test('should handle minimal word with no optional fields', () => {
      const reduxWord = createWord();
      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      expect(wordDrill.id).toBe('word1');
      expect(wordDrill.text).toBe('test');
      expect(wordDrill.subject).toBe('english');
      expect(wordDrill.complexityLevel).toBe(1);
      expect(wordDrill.metadata).toEqual({});
    });

    test('should handle word with all optional metadata fields', () => {
      const reduxWord = createWord({
        language: 'kannada',
        wordKannada: 'ಕನ್ನಡ',
        transliteration: 'kannada',
        transliterationHi: 'कन्नड',
        answer: 'Kannada',
        notes: 'Language of Karnataka'
      });

      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      expect(wordDrill.metadata?.wordKannada).toBe('ಕನ್ನಡ');
      expect(wordDrill.metadata?.transliteration).toBe('kannada');
      expect(wordDrill.metadata?.transliterationHi).toBe('कन्नड');
      expect(wordDrill.metadata?.answer).toBe('Kannada');
      expect(wordDrill.metadata?.notes).toBe('Language of Karnataka');
    });

    test('should handle word with empty strings in optional fields', () => {
      const reduxWord = createWord({
        transliteration: '',
        answer: '',
        notes: ''
      });

      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      // Empty strings are falsy so mapper doesn't include them (uses spread with truthy check)
      expect(wordDrill.metadata?.transliteration).toBeUndefined();
      expect(wordDrill.metadata?.answer).toBeUndefined();
      expect(wordDrill.metadata?.notes).toBeUndefined();
    });

    test('should handle word with undefined category', () => {
      const reduxWord = createWord({
        category: undefined as any
      });

      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      expect(wordDrill.category).toBeUndefined();
    });

    test('should map language to subject correctly', () => {
      const languages = ['english', 'kannada', 'mathtables', 'humanbody'];
      
      languages.forEach(lang => {
        const reduxWord = createWord({ language: lang });
        const wordDrill = WordDrillMapper.toDomain(reduxWord);
        expect(wordDrill.subject).toBe(lang);
      });
    });
  });

  describe('LearnerProfileMapper Edge Cases', () => {
    test('should handle user with minimal data', () => {
      const reduxUser = {
        displayName: 'Test User',
        settings: {
          complexityLevels: {}
        }
      };

      const profile = LearnerProfileMapper.toDomain('user1', reduxUser);

      expect(profile.id).toBe('user1');
      expect(profile.name).toBe('Test User');
    });

    test('should handle user with empty complexity levels', () => {
      const reduxUser = {
        displayName: 'Test User',
        settings: {
          complexityLevels: {}
        }
      };

      const profile = LearnerProfileMapper.toDomain('user1', reduxUser);

      expect(profile.id).toBe('user1');
    });

    test('should handle user with multiple complexity levels', () => {
      const reduxUser = {
        displayName: 'Test User',
        settings: {
          complexityLevels: {
            english: 2,
            kannada: 1,
            mathtables: 3
          }
        }
      };

      const profile = LearnerProfileMapper.toDomain('user1', reduxUser);

      expect(profile.id).toBe('user1');
      expect(profile.name).toBe('Test User');
    });

    test('should handle user with undefined settings', () => {
      const reduxUser = {
        displayName: 'Test User',
        settings: undefined as any
      };

      // Should not throw, but behavior depends on implementation
      expect(() => {
        LearnerProfileMapper.toDomain('user1', reduxUser);
      }).not.toThrow();
    });

    test('should handle empty user ID', () => {
      const reduxUser = {
        displayName: 'Test User',
        settings: {
          complexityLevels: {}
        }
      };

      const profile = LearnerProfileMapper.toDomain('', reduxUser);

      expect(profile.id).toBe('');
    });

    test('should fall back to user ID when displayName is missing', () => {
      const reduxUser = {
        settings: {
          complexityLevels: {}
        }
      };

      const profile = LearnerProfileMapper.toDomain('user1', reduxUser);

      // Should use userId as fallback
      expect(profile.name).toBe('user1');
    });

    test('should handle empty displayName by falling back to user ID', () => {
      const reduxUser = {
        displayName: '',
        settings: {
          complexityLevels: {}
        }
      };

      const profile = LearnerProfileMapper.toDomain('user1', reduxUser);

      // Empty displayName should fall back to userId
      expect(profile.name).toBe('user1');
    });
  });

  describe('Round-trip Mapping', () => {
    const createWord = (overrides: Partial<Word> = {}): Word => ({
      id: 'word1',
      text: 'test',
      step: 0,
      attempts: [],
      language: 'english',
      complexityLevel: 1,
      category: 'test',
      cooldownSessionsLeft: 0,
      revealCount: 0,
      ...overrides
    });

    test('ProgressTracker should maintain consistency through round-trip', () => {
      const original = createWord({
        step: 2,
        cooldownSessionsLeft: 3,
        lastPracticedAt: 1234567890
      });

      const tracker = ProgressTrackerMapper.toDomain('word1', 'learner1', original);
      const mapped = ProgressTrackerMapper.toRedux(tracker);

      expect(mapped.step).toBe(2);
      expect(mapped.cooldownSessionsLeft).toBe(3);
    });

    test('WordDrill should maintain data through mapping', () => {
      const original = createWord({
        text: 'test word',
        language: 'kannada',
        complexityLevel: 2,
        category: 'vocabulary',
        transliteration: 'test',
        answer: 'answer'
      });

      const wordDrill = WordDrillMapper.toDomain(original);

      expect(wordDrill.id).toBe(original.id);
      expect(wordDrill.text).toBe(original.text);
      expect(wordDrill.subject).toBe(original.language);
      expect(wordDrill.complexityLevel).toBe(original.complexityLevel);
      expect(wordDrill.metadata?.transliteration).toBe(original.transliteration);
      expect(wordDrill.metadata?.answer).toBe(original.answer);
    });
  });

  describe('Special Characters and Unicode', () => {
    const createWord = (overrides: Partial<Word> = {}): Word => ({
      id: 'word1',
      text: 'test',
      step: 0,
      attempts: [],
      language: 'english',
      complexityLevel: 1,
      category: 'test',
      cooldownSessionsLeft: 0,
      revealCount: 0,
      ...overrides
    });

    test('should handle Kannada script in text', () => {
      const reduxWord = createWord({
        text: 'ಕನ್ನಡ ಪದ',
        language: 'kannada',
        wordKannada: 'ಕನ್ನಡ',
        transliterationHi: 'कन्नड'
      });

      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      expect(wordDrill.text).toBe('ಕನ್ನಡ ಪದ');
      expect(wordDrill.metadata?.wordKannada).toBe('ಕನ್ನಡ');
      expect(wordDrill.metadata?.transliterationHi).toBe('कन्नड');
    });

    test('should handle special mathematical characters', () => {
      const reduxWord = createWord({
        id: 'math1',
        text: '2 × 3 = ?',
        language: 'mathtables',
        category: 'multiplication',
        transliteration: '6',
        answer: '6'
      });

      const wordDrill = WordDrillMapper.toDomain(reduxWord);

      expect(wordDrill.text).toBe('2 × 3 = ?');
      expect(wordDrill.metadata?.answer).toBe('6');
    });
  });
});
