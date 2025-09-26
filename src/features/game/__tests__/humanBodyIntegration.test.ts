import { describe, it, expect } from 'vitest';
import { createHumanBodyWords } from '../humanBody';
import { getInitialWords } from '../../../app/bootstrapState';
import { selectWordsByLanguage, selectCurrentPracticeData } from '../selectors';
import type { RootState, UserState } from '../state';

// Test Human Body mode integration with the existing system
describe('Human Body Integration', () => {
  it('should include Human Body questions in initial words', () => {
    const allWords = getInitialWords();
    
    // Should have human body questions
    const humanBodyWords = Object.values(allWords).filter(word => word.language === 'humanbody');
    expect(humanBodyWords.length).toBeGreaterThan(0);
    
    // Check specific question exists
    const skinQuestion = Object.values(allWords).find(word => 
      word.text.includes('What are three main jobs of your skin?')
    );
    expect(skinQuestion).toBeDefined();
    expect(skinQuestion?.answer).toBe('Protect, regulate temperature, sense touch');
    expect(skinQuestion?.notes).toContain('largest organ');
  });

  it('should filter human body words by language', () => {
    const mockUser: UserState = {
      words: getInitialWords(),
      sessions: {},
      activeSessions: {},
      settings: {
        selectionWeights: { struggle: 1, new: 1, mastered: 1 },
        sessionSizes: { humanbody: 6 },
        languages: ['humanbody'],
        complexityLevels: { english: 1, kannada: 1, hindi: 1, humanbody: 3 }
      }
    };

    const state: RootState = {
      users: { user1: mockUser },
      currentUserId: 'user1'
    };

    const humanBodyWords = selectWordsByLanguage(state, ['humanbody']);
    const humanBodyWordsArray = Object.values(humanBodyWords);
    
    expect(humanBodyWordsArray.length).toBeGreaterThan(0);
    expect(humanBodyWordsArray.every(word => word.language === 'humanbody')).toBe(true);
    
    // Should have questions with different complexity levels
    const complexityLevels = [...new Set(humanBodyWordsArray.map(word => word.complexityLevel))];
    expect(complexityLevels.length).toBeGreaterThan(1);
  });

  it('should show answer and notes for human body mode when revealed', () => {
    const humanBodyWords = createHumanBodyWords();
    const firstQuestion = Object.values(humanBodyWords)[0];
    
    const mockSession = {
      wordIds: [firstQuestion.id],
      currentIndex: 0,
      revealed: true,
      mode: 'humanbody',
      createdAt: Date.now(),
      settings: {
        selectionWeights: { struggle: 1, new: 1, mastered: 1 },
        sessionSizes: { humanbody: 6 },
        languages: ['humanbody'],
        complexityLevels: { english: 1, kannada: 1, hindi: 1, humanbody: 3 }
      }
    };

    const mockUser: UserState = {
      words: { [firstQuestion.id]: firstQuestion },
      sessions: { session1: mockSession },
      activeSessions: { humanbody: 'session1' },
      settings: mockSession.settings
    };

    const state: RootState = {
      users: { user1: mockUser },
      currentUserId: 'user1'
    };

    const practiceData = selectCurrentPracticeData(state, 'humanbody');
    
    expect(practiceData.answer).toBeDefined();
    expect(practiceData.notes).toBeDefined();
    expect(practiceData.answer).toBe(firstQuestion.answer);
    expect(practiceData.notes).toBe(firstQuestion.notes);
  });

  it('should not show answer and notes for human body mode when not revealed', () => {
    const humanBodyWords = createHumanBodyWords();
    const firstQuestion = Object.values(humanBodyWords)[0];
    
    const mockSession = {
      wordIds: [firstQuestion.id],
      currentIndex: 0,
      revealed: false, // Not revealed
      mode: 'humanbody',
      createdAt: Date.now(),
      settings: {
        selectionWeights: { struggle: 1, new: 1, mastered: 1 },
        sessionSizes: { humanbody: 6 },
        languages: ['humanbody'],
        complexityLevels: { english: 1, kannada: 1, hindi: 1, humanbody: 3 }
      }
    };

    const mockUser: UserState = {
      words: { [firstQuestion.id]: firstQuestion },
      sessions: { session1: mockSession },
      activeSessions: { humanbody: 'session1' },
      settings: mockSession.settings
    };

    const state: RootState = {
      users: { user1: mockUser },
      currentUserId: 'user1'
    };

    const practiceData = selectCurrentPracticeData(state, 'humanbody');
    
    // Should not show answer and notes when not revealed
    expect(practiceData.answer).toBeUndefined();
    expect(practiceData.notes).toBeUndefined();
  });

  it('should categorize questions by topic', () => {
    const humanBodyWords = createHumanBodyWords();
    const wordsArray = Object.values(humanBodyWords);
    
    // Should have different categories
    const categories = [...new Set(wordsArray.map(word => word.category))];
    expect(categories).toContain('skeleton_bones');
    expect(categories).toContain('general_body');
    
    // Each question should have a category
    wordsArray.forEach(word => {
      expect(word.category).toBeDefined();
      expect(typeof word.category).toBe('string');
      expect(word.category!.length).toBeGreaterThan(0);
    });
  });
});