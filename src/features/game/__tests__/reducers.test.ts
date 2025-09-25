import { describe, it, expect } from 'vitest';
import reducer, { setMode, attempt, nextCard } from '../slice';
import type { RootState } from '../state';

function makeInitial(): RootState {
  return {
    users: {
      user1: {
        words: {
          w1: { id: 'w1', text: 'one', language: 'en', attempts: [] },
          w2: { id: 'w2', text: 'two', language: 'en', attempts: [] },
        },
        sessions: {
          s1: {
            wordIds: ['w1', 'w2'],
            currentIndex: 0,
            revealed: false,
            mode: 'practice',
            createdAt: 0,
            settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 2, languages: ['english'] },
          },
        },
        activeSessions: {},
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 2, languages: ['english'] },
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
  it('increments currentIndex and resets reveal/lastAttempt', () => {
    const state = makeInitial();
    state.users.user1.sessions.s1.currentIndex = 0;
    state.users.user1.sessions.s1.revealed = true;
    state.users.user1.sessions.s1.lastAttempt = 'wrong';
    const next = reducer(state, nextCard({ sessionId: 's1' }));
    expect(next.users.user1.sessions.s1.currentIndex).toBe(1);
    expect(next.users.user1.sessions.s1.revealed).toBe(false);
    expect(next.users.user1.sessions.s1.lastAttempt).toBeUndefined();
  });
  it('randomly selects from unmastered words', () => {
    const state = makeInitial();
    // Set up session with 2 words, both unmastered
    state.users.user1.sessions.s1.wordIds = ['word1', 'word2'];
    state.users.user1.words.word1 = { id: 'word1', text: 'word1', language: 'english', attempts: [] };
    state.users.user1.words.word2 = { id: 'word2', text: 'word2', language: 'english', attempts: [] };
    state.users.user1.sessions.s1.currentIndex = 0;
    
    const next = reducer(state, nextCard({ sessionId: 's1' }));
    // Should select one of the unmastered words (0 or 1)
    expect([0, 1]).toContain(next.users.user1.sessions.s1.currentIndex);
  });
});
