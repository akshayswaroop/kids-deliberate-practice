import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, addUser, setMode } from '../slice';
import { handleNextPressed } from '../actions';
import { getInitialWords } from '../../../app/bootstrapState';

// Helper to create a small test store (very small shim)
function makeTestStore(initialState: any) {
  let state = { game: initialState };
  const actions: any[] = [];
  const dispatch = (action: any) => {
    actions.push(action);
    // If it's a thunk
    if (typeof action === 'function') {
      return action(dispatch, () => state);
    }
    // Simple reducer path for addSession/nextCard handled via reducer
    state.game = reducer(state.game, action);
    return action;
  };
  const getState = () => state;
  return { dispatch, getState, actions };
}

describe('handleNextPressed thunk', () => {
  it('creates a new session when all session words are mastered', () => {
    const allWords = getInitialWords();
    const userId = 'test_user';
    const initialState = { users: {}, currentUserId: null } as any;
    const store = makeTestStore(initialState);

    // Create the user via dispatched action (like the UI would)
    store.dispatch(addUser({ userId } as any));

    // Create a session with a few english words
    const sessionId = 's1';
    const wordIds = Object.keys(allWords).filter(id => allWords[id].language === 'english').slice(0, 3);
    const session = { wordIds, currentIndex: 0, revealed: false, mode: 'practice', createdAt: Date.now(), settings: store.getState().game.users[userId].settings } as any;
    store.dispatch(addSession({ sessionId, session } as any));
    // Set as active session by dispatching setMode (mirrors how App does it)
    store.dispatch(setMode({ mode: 'english', sessionId } as any));

    // Mark each word as mastered by dispatching 'attempt' actions (simulate UI interactions)
    // Each correct attempt increments step by 1; do enough attempts to reach step 5 deterministically.
    wordIds.forEach(wordId => {
      for (let i = 0; i < 6; i++) { // loop slightly more than needed safe-guard
        store.dispatch(attempt({ sessionId, wordId, result: 'correct' } as any));
      }
    });

    // Dispatch thunk (like user hitting Next)
    store.dispatch(handleNextPressed({ mode: 'english' }) as any);

    // After thunk, we expect an addSession action to have been processed (i.e., more sessions exist)
    const finalSessions = Object.keys(store.getState().game.users[userId].sessions);
    expect(finalSessions.length).toBeGreaterThan(1);
  });

  it('dispatches nextCard when not all session words are mastered', () => {
    const allWords = getInitialWords();
    const userId = 'test_user2';
    const initialState = { users: {}, currentUserId: null } as any;
    const store = makeTestStore(initialState);

    // Create user and session via dispatched actions
    store.dispatch(addUser({ userId } as any));
    const sessionId = 's2';
    const wordIds = Object.keys(allWords).filter(id => allWords[id].language === 'english').slice(0, 3);
    const sessionObj = { wordIds, currentIndex: 0, revealed: false, mode: 'practice', createdAt: Date.now(), settings: store.getState().game.users[userId].settings } as any;
    store.dispatch(addSession({ sessionId, session: sessionObj } as any));
    store.dispatch(setMode({ mode: 'english', sessionId } as any));

    // Ensure words are unmastered by performing a single wrong attempt (keeps them low)
    wordIds.forEach(wordId => {
      store.dispatch(attempt({ sessionId, wordId, result: 'wrong' } as any));
    });

    // Dispatch thunk
    store.dispatch(handleNextPressed({ mode: 'english' }) as any);

    // After thunk, session.needsNewSession should be false (since not all mastered) and currentIndex should be a number
    const sessionState = store.getState().game.users[userId].sessions[sessionId];
    expect(sessionState.needsNewSession === undefined || sessionState.needsNewSession === false).toBeTruthy();
    expect(typeof sessionState.currentIndex).toBe('number');
  });
});
