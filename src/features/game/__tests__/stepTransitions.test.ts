import { describe, it, expect } from 'vitest';
import reducer, { attempt } from '../slice';
import type { RootState } from '../state';

function makeInitialForStepTests(): RootState {
  return {
    users: {
      user1: {
        words: {
          w1: { id: 'w1', text: 'test', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 },
        },
        sessions: {
          s1: {
            wordIds: ['w1'],
            currentIndex: 0,
            revealed: false,
            mode: 'practice',
            createdAt: 0,
            settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 1 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
          },
        },
        activeSessions: {},
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 1 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
      },
    },
    currentUserId: 'user1',
  };
}

describe('Step Transitions', () => {
  it('should implement correct practice transitions', () => {
    let state = makeInitialForStepTests();
    const now = 1000;
    
    // Test correct progression: 0→1→2→3→4→5
    for (let expectedStep = 1; expectedStep <= 5; expectedStep++) {
      state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'correct', now }));
      expect(state.users.user1.words.w1.step).toBe(expectedStep);
      expect(state.users.user1.words.w1.lastPracticedAt).toBe(now);
      
      if (expectedStep === 5) {
        // When reaching step 5, should set revision timestamp and cooldown
        expect(state.users.user1.words.w1.lastRevisedAt).toBe(now);
        expect(state.users.user1.words.w1.cooldownSessionsLeft).toBe(1);
      }
    }
  });

  it('should implement correct wrong answer transitions', () => {
    let state = makeInitialForStepTests();
    const now = 1000;
    
    // Start at step 3
    state.users.user1.words.w1.step = 3;
    
    // Wrong answer should decrease step by 1
    state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'wrong', now }));
    expect(state.users.user1.words.w1.step).toBe(2);
    expect(state.users.user1.words.w1.lastPracticedAt).toBe(now);
    
    // Another wrong answer
    state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'wrong', now }));
    expect(state.users.user1.words.w1.step).toBe(1);
    
    // Another wrong answer
    state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'wrong', now }));
    expect(state.users.user1.words.w1.step).toBe(0);
    
    // Should not go below 0
    state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'wrong', now }));
    expect(state.users.user1.words.w1.step).toBe(0);
  });

  it('should implement correct revision mode transitions', () => {
    let state = makeInitialForStepTests();
    const now = 1000;
    
    // Set up word at step 5 with no cooldown (ready for revision)
    state.users.user1.words.w1.step = 5;
    state.users.user1.words.w1.cooldownSessionsLeft = 0;
    
    // Correct answer in revision mode
    state = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'correct', now }));
    expect(state.users.user1.words.w1.step).toBe(5); // Stay at step 5
    expect(state.users.user1.words.w1.lastRevisedAt).toBe(now);
    expect(state.users.user1.words.w1.cooldownSessionsLeft).toBe(1);
  });

  it('should handle wrong answer in revision mode', () => {
    const state = makeInitialForStepTests();
    const now = 2000;
    
    // Set up word at step 5 with no cooldown (ready for revision)
    state.users.user1.words.w1.step = 5;
    state.users.user1.words.w1.cooldownSessionsLeft = 0;
    
    // Wrong answer in revision mode
    const nextState = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'wrong', now }));
    expect(nextState.users.user1.words.w1.step).toBe(3); // Drop to step 3
    expect(nextState.users.user1.words.w1.lastPracticedAt).toBe(now);
    expect(nextState.users.user1.words.w1.cooldownSessionsLeft).toBe(0);
  });
});