import { describe, it, expect } from 'vitest';
import { selectParentGuidance } from '../state/gameSelectors';
import type { RootState } from '../state/gameState';

const createDefaultExperience = () => ({
  hasSeenIntro: false,
  coachmarks: { streak: false, profiles: false },
  hasSeenParentGuide: false,
  hasSeenWhyRepeat: false,
  seenIntroVersion: undefined,
});

describe('🎯 selectParentGuidance Integration Test', () => {
  it('should return "First try" with no attempts in Redux', () => {
    const state: RootState = {
      currentUserId: 'user1',
      users: {
        user1: {
          displayName: 'Test User',
          experience: createDefaultExperience(),
          words: {
            word1: {
              id: 'word1',
              text: 'Hello',
              language: 'english',
              complexityLevel: 1,
              step: 0,
              attempts: [],
              revealCount: 0,
              cooldownSessionsLeft: 0
            }
          },
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: {},
            languages: ['english'],
            complexityLevels: { english: 1 }
          }
        }
      }
    };

    const guidance = selectParentGuidance(state, 'word1');
    
    console.log('Selector guidance with 0 attempts:', guidance);
    
    expect(guidance.message).toBe('First try');
    expect(guidance.context).toBe('initial');
  });

  it('should return success message with 1 correct attempt in Redux', () => {
    const state: RootState = {
      currentUserId: 'user1',
      users: {
        user1: {
          displayName: 'Test User',
          experience: createDefaultExperience(),
          words: {
            word1: {
              id: 'word1',
              text: 'Hello',
              language: 'english',
              complexityLevel: 1,
              step: 1, // Step increased after correct
              attempts: [
                { timestamp: Date.now(), result: 'correct' }
              ],
              revealCount: 0,
              cooldownSessionsLeft: 0
            }
          },
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: {},
            languages: ['english'],
            complexityLevels: { english: 1 }
          }
        }
      }
    };

    const guidance = selectParentGuidance(state, 'word1');
    
    console.log('Selector guidance with 1 correct attempt:', guidance);
    
    expect(guidance.message).toContain('Great');
    expect(guidance.context).toBe('first-success');
    expect(guidance.urgency).toBe('success');
  });

  it('should update guidance when Redux state changes', () => {
    // Start with no attempts
    let state: RootState = {
      currentUserId: 'user1',
      users: {
        user1: {
          displayName: 'Test User',
          experience: createDefaultExperience(),
          words: {
            word1: {
              id: 'word1',
              text: 'Hello',
              language: 'english',
              complexityLevel: 1,
              step: 0,
              attempts: [],
              revealCount: 0,
              cooldownSessionsLeft: 0
            }
          },
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: {},
            languages: ['english'],
            complexityLevels: { english: 1 }
          }
        }
      }
    };

    const guidance1 = selectParentGuidance(state, 'word1');
    console.log('Before answer:', guidance1);
    expect(guidance1.message).toBe('First try');

    // Simulate Redux update after correct answer
    state = {
      ...state,
      users: {
        ...state.users,
        user1: {
          ...state.users.user1,
          words: {
            ...state.users.user1.words,
            word1: {
              ...state.users.user1.words.word1,
              step: 1,
              attempts: [
                { timestamp: Date.now(), result: 'correct' }
              ]
            }
          }
        }
      }
    };

    const guidance2 = selectParentGuidance(state, 'word1');
    console.log('After correct answer:', guidance2);
    
    // Should show different message now
    expect(guidance2.message).not.toBe('First try');
    expect(guidance2.message).toContain('Great');
    expect(guidance2.context).toBe('first-success');
  });
});
