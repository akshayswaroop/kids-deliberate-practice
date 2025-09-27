import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, nextCard } from '../slice';
import { getInitialWords } from '../../../app/bootstrapState';
import type { RootState, Session } from '../state';

function pickRandomWords(words: Record<string, any>, count: number, seed = 42) {
  const ids = Object.keys(words);
  // Simple deterministic shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = (seed * i) % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, count);
}

describe('Session flow: master 12 words, then next 12', () => {
  it('should master 12 words and move to next set', () => {
    let state: RootState = {
      users: {
        user1: {
          words: getInitialWords(),
          sessions: {},
          activeSessions: {},
          settings: {
            sessionSizes: { english: 6 },
            languages: ['english'],
            complexityLevels: { english: 1, kannada: 1, hindi: 1 }
          },
        },
      },
      currentUserId: 'user1',
    };
    // Pick first 12 random words
  const first12 = pickRandomWords(state.users.user1.words, 12);
    const sessionId1 = 'session1';
    const session1: Session = {
      wordIds: first12,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
  settings: state.users.user1.settings,
    };
  state = reducer(state, addSession({ sessionId: sessionId1, session: session1 }));
  state = reducer(state, { type: 'game/setMode', payload: { mode: 'practice', sessionId: sessionId1 } });
    // Answer all 12 words correctly until mastered
    for (let i = 0; i < 12; i++) {
      for (let c = 0; c < 5; c++) { // 5 correct attempts to reach 100%
        state = reducer(state, attempt({ sessionId: sessionId1, wordId: first12[i], result: 'correct' }));
      }
      if (i < 11) {
        state = reducer(state, nextCard({ sessionId: sessionId1 }));
      }
    }
    // All 12 should be mastered
    for (const id of first12) {
      expect(state.users.user1.words[id].attempts.filter(a => a.result === 'correct').length).toBeGreaterThanOrEqual(5);
    }
    // Pick next 12 random words (excluding mastered)
  const masteredSet = new Set(first12);
  const next12 = Object.keys(state.users.user1.words).filter(id => !masteredSet.has(id)).slice(0, 12);
    const sessionId2 = 'session2';
    const session2: Session = {
      wordIds: next12,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
  settings: state.users.user1.settings,
    };
    state = reducer(state, addSession({ sessionId: sessionId2, session: session2 }));
    state = reducer(state, { type: 'game/setMode', payload: { mode: 'practice', sessionId: sessionId2 } });
    // Answer all next 12 words correctly until mastered
    for (let i = 0; i < 12; i++) {
      for (let c = 0; c < 5; c++) {
        state = reducer(state, attempt({ sessionId: sessionId2, wordId: next12[i], result: 'correct' }));
      }
      if (i < 11) {
        state = reducer(state, nextCard({ sessionId: sessionId2 }));
      }
    }
    // All next 12 should be mastered
    for (const id of next12) {
      expect(state.users.user1.words[id].attempts.filter(a => a.result === 'correct').length).toBeGreaterThanOrEqual(5);
    }
  });
});
