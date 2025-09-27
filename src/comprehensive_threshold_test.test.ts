import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, addUser, setMode } from './features/game/slice';
import { handleNextPressed } from './features/game/actions';
import { selectAreAllSessionWordsMastered } from './features/game/selectors';
import { getInitialWords } from './app/bootstrapState';

// Helper to create a test store
function makeTestStore(initialState: any) {
  let state = { game: initialState };
  const actions: any[] = [];
  const dispatch = (action: any) => {
    actions.push(action);
    if (typeof action === 'function') {
      return action(dispatch, () => state);
    }
    state.game = reducer(state.game, action);
    return action;
  };
  const getState = () => state;
  return { dispatch, getState, actions };
}

describe('80% Threshold Comprehensive Test', () => {
  it('demonstrates the exact bug - 80% threshold not triggering new session', () => {
    const allWords = getInitialWords();
    const userId = 'test_user';
    const initialState = { users: {}, currentUserId: null } as any;
    const store = makeTestStore(initialState);

    // 1. Create user and session
    store.dispatch(addUser({ userId } as any));
    
    const sessionId = 'test_session';
    const wordIds = Object.keys(allWords).filter(id => allWords[id].language === 'english').slice(0, 12);
    const session = { 
      wordIds, 
      currentIndex: 0, 
      revealed: false, 
      mode: 'practice', 
      createdAt: Date.now(),
      settings: store.getState().game.users[userId].settings 
    } as any;
    
    store.dispatch(addSession({ sessionId, session } as any));
    store.dispatch(setMode({ mode: 'english', sessionId } as any));

    console.log('\\n=== INITIAL STATE ===');
    console.log(`Session words: ${wordIds.length}`);
    console.log(`Session ID: ${sessionId}`);

    // 2. Master exactly 10 words (83% > 80% threshold)
    const wordsToMaster = wordIds.slice(0, 10);
    wordsToMaster.forEach(wordId => {
      // Make 5 correct attempts to reach step 5 (mastered)
      for (let i = 0; i < 5; i++) {
        store.dispatch(attempt({ sessionId, wordId, result: 'correct' } as any));
      }
    });

    // 3. Verify current state
    const currentState = store.getState().game;
    const user = currentState.users[userId];
    const currentSession = user.sessions[sessionId];
    
    const masteredCount = currentSession.wordIds.filter((wordId: any) => {
      const word = user.words[wordId];
      return word && word.step === 5;
    }).length;

    console.log('\\n=== AFTER MASTERING 10 WORDS ===');
    console.log(`Mastered: ${masteredCount}/${currentSession.wordIds.length} (${Math.round(masteredCount/currentSession.wordIds.length*100)}%)`);
    console.log(`Threshold: 80%`);
    
    // 4. Test the selector directly
    const selectorResult = selectAreAllSessionWordsMastered(currentState, sessionId);
    console.log(`Selector result: ${selectorResult}`);
    console.log(`Expected: true (since 83% > 80%)`);
    
    expect(masteredCount).toBe(10);
    expect(selectorResult).toBe(true);

    // 5. Check sessions before handleNextPressed
    const sessionsBefore = Object.keys(user.sessions);
    console.log(`\\nSessions before: ${sessionsBefore.length} (${sessionsBefore.join(', ')})`);

    // 6. CRITICAL TEST: Call handleNextPressed
    store.dispatch(handleNextPressed({ mode: 'english' }) as any);

    // 7. Check sessions after
    const finalState = store.getState().game;
    const finalUser = finalState.users[userId];
    const sessionsAfter = Object.keys(finalUser.sessions);
    const activeSessionId = finalUser.activeSessions['english'];
    
    console.log('\\n=== AFTER handleNextPressed ===');
    console.log(`Sessions after: ${sessionsAfter.length} (${sessionsAfter.join(', ')})`);
    console.log(`Active session: ${activeSessionId}`);
    console.log(`Session changed: ${activeSessionId !== sessionId}`);
    console.log(`New session created: ${sessionsAfter.length > sessionsBefore.length}`);

    // 8. Expected behavior with 80% threshold
    expect(sessionsAfter.length).toBeGreaterThan(sessionsBefore.length);
    expect(activeSessionId).not.toBe(sessionId);
    
    console.log('\\n✅ SUCCESS: 80% threshold correctly triggers new session creation!');
  });

  it('does NOT create new session when below 80% threshold', () => {
    const allWords = getInitialWords();
    const userId = 'test_user_2';
    const initialState = { users: {}, currentUserId: null } as any;
    const store = makeTestStore(initialState);

    // Create user and session
    store.dispatch(addUser({ userId } as any));
    
    const sessionId = 'test_session_2';
    const wordIds = Object.keys(allWords).filter(id => allWords[id].language === 'english').slice(0, 12);
    const session = { 
      wordIds, 
      currentIndex: 0, 
      revealed: false, 
      mode: 'practice', 
      createdAt: Date.now(),
      settings: store.getState().game.users[userId].settings 
    } as any;
    
    store.dispatch(addSession({ sessionId, session } as any));
    store.dispatch(setMode({ mode: 'english', sessionId } as any));

    // Master only 9 words (75% < 80% threshold)
    const wordsToMaster = wordIds.slice(0, 9);
    wordsToMaster.forEach(wordId => {
      for (let i = 0; i < 5; i++) {
        store.dispatch(attempt({ sessionId, wordId, result: 'correct' } as any));
      }
    });

    // Test selector
    const currentState = store.getState().game;
    const selectorResult = selectAreAllSessionWordsMastered(currentState, sessionId);
    
    console.log('\\n=== 75% MASTERY TEST ===');
    console.log(`Mastered: 9/12 (75%)`);
    console.log(`Selector result: ${selectorResult}`);
    console.log(`Expected: false (since 75% < 80%)`);
    
    expect(selectorResult).toBe(false);

    // Call handleNextPressed
    const sessionsBefore = Object.keys(currentState.users[userId].sessions);
    store.dispatch(handleNextPressed({ mode: 'english' }) as any);

    // Should NOT create new session
    const finalState = store.getState().game;
    const finalUser = finalState.users[userId];
    const sessionsAfter = Object.keys(finalUser.sessions);
    const activeSessionId = finalUser.activeSessions['english'];

    console.log(`Sessions before: ${sessionsBefore.length}`);
    console.log(`Sessions after: ${sessionsAfter.length}`);
    console.log(`Same session: ${activeSessionId === sessionId}`);

    expect(sessionsAfter.length).toBe(sessionsBefore.length);
    expect(activeSessionId).toBe(sessionId);
    
    console.log('\\n✅ SUCCESS: 75% threshold correctly does NOT trigger new session!');
  });
});