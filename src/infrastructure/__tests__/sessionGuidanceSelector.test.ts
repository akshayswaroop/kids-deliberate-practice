/**
 * 🎯 Infrastructure Tests: Session Guidance Selector
 * 
 * Tests for selectSessionGuidance following the same pattern as selectParentGuidance.
 * Following TDD approach and trace-based architecture.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { selectSessionGuidance } from '../state/gameSelectors';
import type { RootState } from '../state/gameState';

describe('selectSessionGuidance', () => {
  let mockState: RootState;

  beforeEach(() => {
    mockState = {
      currentUserId: 'user1',
      users: {
        user1: {
          id: 'user1',
          displayName: 'Test User',
          words: {
            'word1': {
              id: 'word1',
              text: 'ಅ',
              wordKannada: 'ಅ',
              step: 0,
              attempts: [],
              language: 'kannada',
              complexityLevel: 1,
              cooldownSessionsLeft: 0,
              revealCount: 0
            },
            'word2': {
              id: 'word2',
              text: 'ಆ',
              wordKannada: 'ಆ',
              step: 2,
              attempts: [],
              language: 'kannada',
              complexityLevel: 1,
              cooldownSessionsLeft: 0,
              revealCount: 0
            }, // Mastered
            'word3': {
              id: 'word3',
              text: 'ಇ',
              wordKannada: 'ಇ',
              step: 1,
              attempts: [],
              language: 'kannada',
              complexityLevel: 1,
              cooldownSessionsLeft: 0,
              revealCount: 0
            }
          },
          sessions: {
            'session1': {
              id: 'session1',
              wordIds: ['word1', 'word2', 'word3'],
              currentIndex: 0, // First question
              mode: 'kannada',
              revealed: false,
              createdAt: Date.now(),
              settings: {
                sessionSizes: { kannada: 12 },
                languages: ['kannada'],
                complexityLevels: { kannada: 1 }
              }
            }
          },
          activeSessions: {
            kannada: 'session1'
          },
          settings: {
            sessionSizes: { kannada: 12 },
            languages: ['kannada'],
            complexityLevels: { kannada: 1 }
          },
          experience: {
            hasSeenIntro: true,
            coachmarks: { streak: false, profiles: false },
            hasSeenParentGuide: true,
            hasSeenWhyRepeat: true
          }
        }
      }
    } as RootState;
  });

  describe('Set Introduction Scenario', () => {
    test('should return set introduction guidance on first question of session', () => {
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).not.toBeNull();
      expect(guidance?.context).toBe('set-introduction');
      expect(guidance?.message).toContain('cycle through 3 questions');
      expect(guidance?.urgency).toBe('info');
    });

    test('should handle single question session', () => {
      mockState.users.user1.sessions.session1.wordIds = ['word1'];
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance?.context).toBe('set-introduction');
      expect(guidance?.message).toContain('Master this question');
    });

    test('should not show set introduction on second question', () => {
      mockState.users.user1.sessions.session1.currentIndex = 1; // Second question
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull(); // Should fall back to word guidance
    });
  });

  describe('Level Transition Scenario', () => {
    test('should return level transition guidance when words mastered and higher levels available', () => {
      // Current level mastered but higher levels available
      mockState.users.user1.words.word1.step = 2;
      mockState.users.user1.words.word2.step = 2;
      mockState.users.user1.words.word3.step = 2;
      mockState.users.user1.sessions.session1.currentIndex = 1; // Not first question
      
      // Add a word at higher complexity level
      mockState.users.user1.words.word4 = {
        id: 'word4',
        text: 'advanced',
        step: 0,
        complexityLevel: 2,
        language: 'kannada',
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 0
      };

      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance?.context).toBe('level-transition');
      expect(guidance?.message).toContain('New round begins');
      expect(guidance?.urgency).toBe('info');
      
      // Clean up for subsequent tests
      delete mockState.users.user1.words.word4;
    });

    test('should not show level transition if questions still need mastery', () => {
      // Only some questions mastered
      mockState.users.user1.words.word1.step = 1; // Not mastered
      mockState.users.user1.words.word2.step = 2; // Mastered
      mockState.users.user1.words.word3.step = 2; // Mastered
      mockState.users.user1.sessions.session1.currentIndex = 2;
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull();
    });
  });

  describe('Completion Scenario', () => {
    test('should return completion guidance when all levels are finished', () => {
      // All questions mastered and no more complexity levels
      mockState.users.user1.words.word1.step = 2;
      mockState.users.user1.words.word2.step = 2;
      mockState.users.user1.words.word3.step = 2;
      mockState.users.user1.sessions.session1.currentIndex = 2; // Not first question
      // Remove any higher level words to ensure completion scenario
      delete mockState.users.user1.words.word4;
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance?.context).toBe('completion');
      expect(guidance?.message).toContain('All done for Kannada Words');
      expect(guidance?.urgency).toBe('success');
    });

    test('should format subject names correctly in completion message', () => {
      // Create a separate session for completion test to avoid cache interference
      mockState.users.user1.sessions.completionSession = {
        wordIds: ['alpha1', 'alpha2', 'alpha3'],
        currentIndex: 1, // Not first question
        mode: 'kannadaalphabets',
        revealed: false,
        createdAt: Date.now(),
        settings: {
          sessionSizes: { kannadaalphabets: 12 },
          languages: ['kannadaalphabets'],
          complexityLevels: { kannadaalphabets: 1 }
        }
      };
      
      // Set user complexity level for alphabets
      mockState.users.user1.settings.complexityLevels.kannadaalphabets = 1;
      
      // Create words for alphabet mode at level 1 only
      mockState.users.user1.words = {
        alpha1: {
          id: 'alpha1',
          text: 'ಅ',
          wordKannada: 'ಅ',
          step: 2, // Mastered
          attempts: [],
          language: 'kannadaalphabets',
          complexityLevel: 1,
          cooldownSessionsLeft: 0,
          revealCount: 0
        },
        alpha2: {
          id: 'alpha2',
          text: 'ಆ',
          wordKannada: 'ಆ',
          step: 2, // Mastered
          attempts: [],
          language: 'kannadaalphabets',
          complexityLevel: 1,
          cooldownSessionsLeft: 0,
          revealCount: 0
        },
        alpha3: {
          id: 'alpha3',
          text: 'ಇ',
          wordKannada: 'ಇ',
          step: 2, // Mastered
          attempts: [],
          language: 'kannadaalphabets',
          complexityLevel: 1,
          cooldownSessionsLeft: 0,
          revealCount: 0
        }
        // No words at level 2 or higher - ensures completion scenario
      };
      
      const guidance = selectSessionGuidance(mockState, 'completionSession');

      expect(guidance?.context).toBe('completion');
      expect(guidance?.message).toContain('All done for Kannada Alphabets');
    });
  });

  describe('Normal Operation', () => {
    test('should return null for mid-session questions with mixed mastery', () => {
      mockState.users.user1.sessions.session1.currentIndex = 1; // Mid-session
      mockState.users.user1.words.word1.step = 1; // Some progress
      mockState.users.user1.words.word2.step = 2; // Mastered
      mockState.users.user1.words.word3.step = 0; // Not started
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull(); // Should use word-level guidance
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing user gracefully', () => {
      mockState.currentUserId = 'nonexistent';
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull();
    });

    test('should handle missing session gracefully', () => {
      const guidance = selectSessionGuidance(mockState, 'nonexistent-session');

      expect(guidance).toBeNull();
    });

    test('should handle empty session wordIds', () => {
      mockState.users.user1.sessions.session1.wordIds = [];
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull();
    });

    test('should handle out-of-bounds currentIndex', () => {
      mockState.users.user1.sessions.session1.currentIndex = 10; // Beyond wordIds length
      
      const guidance = selectSessionGuidance(mockState, 'session1');

      expect(guidance).toBeNull();
    });
  });

  describe('Bug Reproduction: Set Introduction on Repeated Questions', () => {
    test('should NOT show set introduction when returning to first question after cycling', () => {
      // Simulate a session where we've already seen questions and now cycling back
      // This reproduces the bug where currentIndex=0 triggers set introduction incorrectly
      
      // Start with some progress - user has seen questions 1 and 2, now back to question 0
      mockState.users.user1.sessions.session1.currentIndex = 0; // Back to first question
      
      // Simulate that some questions have been attempted (key to reproducing bug)
      // Add some attempts to indicate this isn't the very first question ever
      mockState.users.user1.words.word1.attempts = [
        { timestamp: Date.now() - 1000, result: "wrong" }
      ];
      mockState.users.user1.words.word2.attempts = [
        { timestamp: Date.now() - 500, result: "correct" }
      ];
      
      const guidance = selectSessionGuidance(mockState, 'session1');
      
      // After fix: This should return null because we've already attempted questions
      expect(guidance).toBeNull();
    });
    
    test('should show set introduction ONLY on the very first question of a new session', () => {
      // This should still work - true beginning of session with no attempts
      // Ensure all words have zero attempts
      mockState.users.user1.words.word1.attempts = [];
      mockState.users.user1.words.word2.attempts = [];
      mockState.users.user1.words.word3.attempts = [];
      
      const guidance = selectSessionGuidance(mockState, 'session1');
      
      expect(guidance).toEqual({
        message: "Practice Set: We'll cycle through 3 questions until each is mastered",
        urgency: 'info',
        context: 'set-introduction'
      });
    });

    test('should handle realistic cycling scenario: first question → second question → back to first', () => {
      // Scenario: User sees question 0, then 1, then cycles back to 0
      // Only the very first viewing of question 0 should show set introduction
      
      // Step 1: Very first question (should show set introduction)
      mockState.users.user1.sessions.session1.currentIndex = 0;
      mockState.users.user1.words.word1.attempts = [];
      mockState.users.user1.words.word2.attempts = [];
      mockState.users.user1.words.word3.attempts = [];
      
      const firstGuidance = selectSessionGuidance(mockState, 'session1');
      expect(firstGuidance?.context).toBe('set-introduction');
      expect(firstGuidance?.message).toContain('cycle through 3 questions');
      
      // Step 2: User attempts question 0 (wrong answer)
      mockState.users.user1.words.word1.attempts = [
        { timestamp: Date.now() - 1000, result: "wrong" }
      ];
      
      // Step 3: Move to question 1
      mockState.users.user1.sessions.session1.currentIndex = 1;
      
      const secondGuidance = selectSessionGuidance(mockState, 'session1');
      expect(secondGuidance).toBeNull(); // Normal mid-session, no special guidance
      
      // Step 4: User attempts question 1
      mockState.users.user1.words.word2.attempts = [
        { timestamp: Date.now() - 500, result: "wrong" }
      ];
      
      // Step 5: Cycle back to question 0 (should NOT show set introduction again)
      mockState.users.user1.sessions.session1.currentIndex = 0;
      
      const cyclicGuidance = selectSessionGuidance(mockState, 'session1');
      expect(cyclicGuidance).toBeNull(); // No session guidance because questions have been attempted
    });
  });

  describe('Caching Behavior', () => {
    test('should cache results for same session state', () => {
      const guidance1 = selectSessionGuidance(mockState, 'session1');
      const guidance2 = selectSessionGuidance(mockState, 'session1');

      expect(guidance1).toBe(guidance2); // Same object reference due to caching
    });

    test('should invalidate cache when session state changes', () => {
      const guidance1 = selectSessionGuidance(mockState, 'session1');
      
      // Change session state
      mockState.users.user1.sessions.session1.currentIndex = 1;
      
      const guidance2 = selectSessionGuidance(mockState, 'session1');

      expect(guidance1).not.toBe(guidance2); // Different object references
    });
  });
});
