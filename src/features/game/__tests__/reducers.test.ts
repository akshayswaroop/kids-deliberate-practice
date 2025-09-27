import { describe, it, expect } from 'vitest';
import reducer, { setMode, attempt, nextCard } from '../slice';
import type { RootState } from '../state';

function makeInitial(): RootState {
  return {
    users: {
      user1: {
        words: {
          w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 },
          w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 },
        },
        sessions: {
            s1: {
            wordIds: ['w1', 'w2'],
            currentIndex: 0,
            revealed: false,
            mode: 'practice',
            createdAt: 0,
            settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
          },
        },
        activeSessions: {},
  settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
      },
    },
    currentUserId: 'user1',
  };
}

describe('setMode', () => {
  it('sets activeSessions for mode', () => {
    const state = makeInitial();
    const next = reducer(state, setMode({ mode: 'practice', sessionId: 's1' }));
    expect(next.users.user1.activeSessions.practice).toBe('s1');
  });
});

describe('attempt', () => {
  it('pushes attempt and updates session', () => {
    const state = makeInitial();
    const next = reducer(state, attempt({ sessionId: 's1', wordId: 'w1', result: 'correct' }));
    expect(next.users.user1.words.w1.attempts).toHaveLength(1);
    expect(next.users.user1.words.w1.attempts[0].result).toBe('correct');
    expect(next.users.user1.sessions.s1.revealed).toBe(true);
    expect(next.users.user1.sessions.s1.lastAttempt).toBe('correct');
  });
});

describe('nextCard', () => {
  it('selects valid index and resets reveal/lastAttempt', () => {
    const state = makeInitial();
    state.users.user1.sessions.s1.currentIndex = 0;
    state.users.user1.sessions.s1.revealed = true;
    state.users.user1.sessions.s1.lastAttempt = 'wrong';
    const next = reducer(state, nextCard({ sessionId: 's1' }));
    // Should select one of the available words (0 or 1, since both are unmastered)
    expect([0, 1]).toContain(next.users.user1.sessions.s1.currentIndex);
    expect(next.users.user1.sessions.s1.revealed).toBe(false);
    expect(next.users.user1.sessions.s1.lastAttempt).toBeUndefined();
    expect(next.users.user1.sessions.s1.needsNewSession).toBe(false);
  });
  it('randomly selects from unmastered words', () => {
    const state = makeInitial();
    // Set up session with 2 words, both unmastered
    state.users.user1.sessions.s1.wordIds = ['word1', 'word2'];
  state.users.user1.words.word1 = { id: 'word1', text: 'word1', language: 'english', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 };
  state.users.user1.words.word2 = { id: 'word2', text: 'word2', language: 'english', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 };
    state.users.user1.sessions.s1.currentIndex = 0;
    
    const next = reducer(state, nextCard({ sessionId: 's1' }));
    // Should select one of the unmastered words (0 or 1)
    expect([0, 1]).toContain(next.users.user1.sessions.s1.currentIndex);
  });

  it('should indicate when new session is needed (all words mastered)', () => {
    const state = makeInitial();
    // Make all words in session fully mastered (step 5)
    state.users.user1.words.w1.step = 5;
    state.users.user1.words.w1.attempts = [
      { timestamp: 1, result: 'correct' },
      { timestamp: 2, result: 'correct' },
      { timestamp: 3, result: 'correct' },
      { timestamp: 4, result: 'correct' },
      { timestamp: 5, result: 'correct' },
    ];
    state.users.user1.words.w2.step = 5;
    state.users.user1.words.w2.attempts = [
      { timestamp: 1, result: 'correct' },
      { timestamp: 2, result: 'correct' },
      { timestamp: 3, result: 'correct' },
      { timestamp: 4, result: 'correct' },
      { timestamp: 5, result: 'correct' },
    ];
    
    const next = reducer(state, nextCard({ sessionId: 's1' }));
    
    // When all words are mastered, the action should set a flag indicating 
    // that a new session is needed rather than cycling through existing words
    expect(next.users.user1.sessions.s1.needsNewSession).toBe(true);
  });
});
