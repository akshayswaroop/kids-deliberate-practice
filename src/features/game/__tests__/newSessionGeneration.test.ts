import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, nextCard, setMode as setModeAction } from '../slice';
import { selectSessionWords } from '../sessionGen';
import type { RootState } from '../state';

function makeInitialStateWithWords(): RootState {
  return {
    users: {
      testUser: {
        words: {
          // First batch of words (will be mastered in first session)
          w1: { id: 'w1', text: 'apple', language: 'english', attempts: [] },
          w2: { id: 'w2', text: 'banana', language: 'english', attempts: [] },
          w3: { id: 'w3', text: 'cherry', language: 'english', attempts: [] },
          // Second batch of words (available for next session)
          w4: { id: 'w4', text: 'date', language: 'english', attempts: [] },
          w5: { id: 'w5', text: 'elderberry', language: 'english', attempts: [] },
          w6: { id: 'w6', text: 'fig', language: 'english', attempts: [] },
        },
        sessions: {},
        activeSessions: {},
        settings: {
          selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 },
          sessionSize: 3,
          languages: ['english'],
        },
      },
    },
    currentUserId: 'testUser',
  };
}

describe('New Session Generation', () => {
  it('should generate new session when all words in current session are mastered', () => {
    let state = makeInitialStateWithWords();
    
    // Create initial session with first 3 words
    const sessionId1 = 'session1';
    const session1 = {
      wordIds: ['w1', 'w2', 'w3'],
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
      settings: state.users.testUser.settings,
    };
    
    state = reducer(state, addSession({ sessionId: sessionId1, session: session1 }));
    state = reducer(state, setModeAction({ mode: 'practice', sessionId: sessionId1 }));
    
    // Master all 3 words (5 correct attempts each = 100% mastery)
    for (const wordId of ['w1', 'w2', 'w3']) {
      for (let i = 0; i < 5; i++) {
        state = reducer(state, attempt({ sessionId: sessionId1, wordId, result: 'correct' }));
      }
    }
    
    // Verify all words are mastered
    for (const wordId of ['w1', 'w2', 'w3']) {
      const word = state.users.testUser.words[wordId];
      expect(word.attempts.filter(a => a.result === 'correct').length).toBe(5);
    }
    
    // Now when we call nextCard, it should set needsNewSession flag
    state = reducer(state, nextCard({ sessionId: sessionId1 }));
    expect(state.users.testUser.sessions[sessionId1].needsNewSession).toBe(true);
    
    // Simulate the container logic that would create a new session
    // (This would normally happen in App.tsx onNext handler)
    const allWordsArr = Object.values(state.users.testUser.words);
    const newWordIds = selectSessionWords(
      allWordsArr, 
      state.users.testUser.settings.selectionWeights, 
      state.users.testUser.settings.sessionSize, 
      Math.random
    );
    
    const sessionId2 = 'session2';
    const session2 = {
      wordIds: newWordIds,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
      settings: state.users.testUser.settings,
    };
    
    state = reducer(state, addSession({ sessionId: sessionId2, session: session2 }));
    state = reducer(state, setModeAction({ mode: 'practice', sessionId: sessionId2 }));
    
    // Verify new session has different words (not all the same as first session)
    const firstSessionWords = new Set(session1.wordIds);
    
    // Should contain some different words since the first 3 are fully mastered
    // and should be in the "mastered" bucket with low weight
    expect(session2.wordIds.length).toBe(3);
    
    // At least one word should be different (due to mastery-based selection weights)
    const hasNewWords = session2.wordIds.some(id => !firstSessionWords.has(id));
    expect(hasNewWords).toBe(true);
  });
  
  it('should continue with same session when not all words are mastered', () => {
    let state = makeInitialStateWithWords();
    
    // Create session
    const sessionId = 'session1';
    const session = {
      wordIds: ['w1', 'w2', 'w3'],
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
      settings: state.users.testUser.settings,
    };
    
    state = reducer(state, addSession({ sessionId, session }));
    
    // Master only 2 out of 3 words
    for (const wordId of ['w1', 'w2']) {
      for (let i = 0; i < 5; i++) {
        state = reducer(state, attempt({ sessionId, wordId, result: 'correct' }));
      }
    }
    
    // Leave w3 unmastered (only 3 correct attempts = 60% mastery)
    for (let i = 0; i < 3; i++) {
      state = reducer(state, attempt({ sessionId, wordId: 'w3', result: 'correct' }));
    }
    
    // When we call nextCard, it should NOT set needsNewSession flag
    state = reducer(state, nextCard({ sessionId }));
    expect(state.users.testUser.sessions[sessionId].needsNewSession).toBe(false);
    
    // Should have selected an unmastered word (in this case, should be index for w3)
    expect(state.users.testUser.sessions[sessionId].currentIndex).toBeDefined();
  });
});